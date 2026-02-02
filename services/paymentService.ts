
import { GoogleGenAI, Schema, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use the 'flash' model as it is fast and excellent at OCR/Document Analysis.
// Fixed: Removed '-latest' suffix to ensure stability and prevent 404 errors.
const PAYMENT_VERIFICATION_MODEL = "gemini-2.5-flash";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Strict Schema for AI Output
const verificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_receipt: { type: Type.BOOLEAN, description: "True ONLY if the image is a banking app screenshot or receipt." },
    is_successful: { type: Type.BOOLEAN, description: "True if the transaction status indicates success (e.g. Muvaffaqiyatli, O'tkazildi, Success, Green Checkmark)." },
    extracted_amount: { type: Type.NUMBER, description: "The numeric amount found in the transfer. Ignore commissions if possible, get the main amount." },
    currency: { type: Type.STRING, description: "The currency code detected (e.g. UZS)." },
    description: { type: Type.STRING, description: "A brief one-sentence description of the image content." }
  },
  required: ["is_receipt", "is_successful", "extracted_amount", "description"]
};

export const verifyPaymentReceipt = async (file: File, expectedAmount: number): Promise<{ verified: boolean; reason: string }> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      You are a strict Payment Verification Auditor. 
      Analyze this image to determine if it is a valid proof of payment from an Uzbek banking app (Click, Payme, Uzum, Apelsin, or Bank Transfer).

      CRITICAL RULES:
      1. If the image is a selfie, a landscape, a random object, or blank, set "is_receipt" to FALSE.
      2. If the image shows a "Failed" or "Pending" transaction, set "is_successful" to FALSE.
      3. Look for success indicators:
         - Keywords: "Muvaffaqiyatli", "O'tkazildi", "Успешно", "Success", "Sent", "Completed".
         - Visuals: Green checkmarks, "Done" icons.
      4. Extract the NUMERIC value of the transfer. Example: for "89 000 UZS", extract 89000.
      
      Your goal is to prevent fraud. Only approve if it clearly looks like a genuine payment screenshot.
    `;

    const response = await ai.models.generateContent({
      model: PAYMENT_VERIFICATION_MODEL,
      contents: {
        parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: verificationSchema,
        temperature: 0.0 // Zero temperature for maximum determinism
      }
    });

    const result = JSON.parse(response.text || "{}");
    console.log("AI Verification Result:", result);

    // 1. Check if it's even a receipt
    if (!result.is_receipt) {
      return { 
        verified: false, 
        reason: "The uploaded file does not appear to be a valid payment receipt. Please upload a screenshot from your banking app." 
      };
    }

    // 2. Check for success status
    if (!result.is_successful) {
        return {
            verified: false,
            reason: "The receipt does not show a clear 'Success' or 'Completed' status."
        };
    }

    // 3. Strict Amount Check (in TypeScript, not AI)
    // We allow a small margin of error (e.g. 100 sums) just in case of weird formatting, 
    // but generally we expect Amount >= Price.
    if (result.extracted_amount < expectedAmount) {
        return {
            verified: false,
            reason: `Insufficient amount. Found: ${result.extracted_amount.toLocaleString()} UZS. Required: ${expectedAmount.toLocaleString()} UZS.`
        };
    }

    // Success
    return {
      verified: true,
      reason: "Payment verified successfully."
    };

  } catch (error: any) {
    console.error("Payment verification failed:", error);
    // Provide a more specific error if available, otherwise generic
    const msg = error?.message || "Unknown error";
    return {
      verified: false,
      reason: `System Error: Unable to process image (${msg}). Please ensure the file is a valid image (JPG/PNG) and try again.`
    };
  }
};
