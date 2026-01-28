
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult, StudentAnswer, Question, ChatMessage } from "../types";
import { TRANSLATIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model Constants
const PRIMARY_MODEL = "gemini-3-flash-preview"; 
const FALLBACK_MODEL = "gemini-3-pro-preview";

// --- CONCURRENCY CONTROL (The Traffic Cop) ---
// This class prevents "System Error" by ensuring we don't hit the API with 
// 10 requests at the exact same millisecond.
class ConcurrencyLimiter {
  private queue: (() => void)[] = [];
  private activeCount = 0;
  private readonly maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    // If we are busy, wait in line
    if (this.activeCount >= this.maxConcurrency) {
      await new Promise<void>((resolve) => this.queue.push(() => resolve()));
    }

    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      // If someone is waiting, let them go next
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

// Limit to 1 active assessment at a time to be absolutely safe against rate limits
const assessmentLimiter = new ConcurrencyLimiter(1);

// --- UTILITIES ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isTransientError = (error: any): boolean => {
  const msg = (error?.message || JSON.stringify(error)).toLowerCase();
  return (
    msg.includes('429') || 
    msg.includes('quota') || 
    msg.includes('exhausted') ||
    msg.includes('503') || 
    msg.includes('500') || 
    msg.includes('overloaded') ||
    msg.includes('internal') ||
    msg.includes('timeout') ||
    msg.includes('fetch failed')
  );
};

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
};

const generateWithRetry = async (model: string, prompt: string, config: any, retries = 3): Promise<any> => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
    } catch (error: any) {
      lastError = error;
      if (!isTransientError(error)) throw error;
      
      if (i < retries - 1) {
        // Add random jitter to prevent "thundering herd"
        const jitter = Math.random() * 500;
        const delay = (1000 * Math.pow(2, i)) + jitter;
        console.warn(`Attempt ${i + 1} failed. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

// Precise language mapping
const getFallbackLanguageLabel = (langCode: string): string => {
  switch (langCode) {
    case 'uz-lat': return "O'zbek tilida (Lotin alifbosi)"; // Explicit script instruction
    case 'uz-cyr': return "Ўзбек тилида (Кирилл алифбоси)"; // Explicit script instruction
    case 'ru': return "На русском языке";
    case 'en': return "In English";
    default: return "In English";
  }
};

// Define the response schema
const assessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    rationale: { type: Type.STRING },
    roadmap: { type: Type.STRING },
    citations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["score", "rationale", "roadmap", "citations"],
};

export const assessAnswer = async (
  masterCase: string,
  question: string,
  maxWeight: number,
  rubric: string,
  studentAnswer: string,
  language: string
): Promise<AssessmentResult> => {

  // Wrap the entire logic in the limiter queue
  return assessmentLimiter.run(async () => {
    
    const fallbackLang = getFallbackLanguageLabel(language);

    const prompt = `
      You are a STRICT Law Professor at TSUL (Tashkent State University of Law).
      
      Task: Assess the student's answer.
      
      1. **LANGUAGE PROTOCOL (STRICT)**:
         - Target Language: **${fallbackLang}**.
         - IF the student answers in a different language (e.g., Russian), YOU MUST MATCH the student's language for the feedback.
         - IF the student answers in the target language (e.g. Uzbek), strictly maintain the requested script (Cyrillic vs Latin).
      
      2. **ZERO HALLUCINATION POLICY (RAG)**:
         - You MUST use the 'googleSearch' tool to verify every law/article cited.
         - Search Query Example: "lex.uz Jinoyat kodeksi 97-modda".
         - If the student invents a law not on lex.uz -> SCORE 0 for legal basis.
      
      3. **Context**:
         - Case: "${masterCase}"
         - Question: "${question}" (Max: ${maxWeight} pts)
         - Rubric: "${rubric}"
         - Student Answer: "${studentAnswer}"

      4. **Grading**:
         - Be skeptical. Generic answers = low score.
         - Return JSON.
    `;

    const config = {
      tools: [{ googleSearch: {} }], // ENABLE LIVE RAG
      responseMimeType: "application/json",
      responseSchema: assessmentSchema,
      temperature: 0.1,
    };

    try {
      let response;
      try {
        response = await generateWithRetry(PRIMARY_MODEL, prompt, config, 3);
      } catch (error) {
        console.warn(`Primary model failed. Switching to Fallback.`);
        if (isTransientError(error)) {
          response = await generateWithRetry(FALLBACK_MODEL, prompt, config, 2);
        } else {
          throw error;
        }
      }

      const responseText = response.text || "{}";
      const parsedData = safeJsonParse(responseText);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      // Explicitly typing chunk and uri to avoid TS7006 error
      const groundingUrls = (Array.isArray(groundingChunks) ? groundingChunks : [])
          .map((chunk: any) => chunk.web?.uri)
          .filter((uri: any): uri is string => typeof uri === 'string' && !!uri);

      return {
        score: typeof parsedData.score === 'number' ? parsedData.score : 0,
        rationale: parsedData.rationale || "Error parsing rationale.",
        roadmap: parsedData.roadmap || "N/A",
        citations: Array.isArray(parsedData.citations) ? parsedData.citations : [],
        groundingUrls: groundingUrls
      };

    } catch (error) {
      console.error("AI Assessment Critical Failure:", error);
      return {
        score: 0,
        rationale: "System Error: The AI service is currently unavailable. Please try again in 30 seconds.",
        roadmap: "N/A",
        citations: [],
        groundingUrls: []
      };
    }
  });
};

export const getOverallAssessment = async (
  masterCase: string,
  questions: Question[],
  answers: Record<string, StudentAnswer>,
  language: string
): Promise<string> => {
  // Use limiter for overall assessment too
  return assessmentLimiter.run(async () => {
    const formattedQA = questions.map((q, i) => `
      Q${i+1}: ${q.text} (Max: ${q.maxWeight})
      Score: ${answers[q.id]?.assessment?.score || 0}
    `).join("\n");

    const langKey = (language === 'uz-lat' || language === 'uz-cyr' || language === 'ru' || language === 'en') ? language : 'en';
    const headers = TRANSLATIONS[langKey].aiHeaders;
    const outputLang = getFallbackLanguageLabel(language);

    const prompt = `
      Provide a dashboard summary of the student's exam.
      Language: Strictly ${outputLang}.
      
      Case: ${masterCase.substring(0, 500)}...
      Performance:
      ${formattedQA}
      
      INSTRUCTION: Use Markdown formatting.
      - Use '###' for section headers.
      - Use specific headers:
      1. ${headers.strengths}
      2. ${headers.weaknesses}
      3. ${headers.tips}
    `;

    try {
      const response = await generateWithRetry(PRIMARY_MODEL, prompt, { temperature: 0.4 }, 3);
      return response.text || "Could not generate feedback.";
    } catch (e) {
      return "Error generating overall feedback due to high traffic. Please try again.";
    }
  });
};

export const chatWithAI = async (
  history: ChatMessage[],
  newMessage: string,
  contextData: { masterCase: string; questions: Question[]; answers: Record<string, StudentAnswer> },
  language: string
): Promise<string> => {
  // Chat is usually lighter, but let's be safe and allow it parallel to assessment
  // or simple retry without queue to keep it snappy.
  const contextStr = `
    Master Case: ${contextData.masterCase.substring(0, 500)}...
    Q&A Context: ${JSON.stringify(contextData.questions.map(q => ({ q: q.text, s: contextData.answers[q.id]?.assessment?.score })))}
  `;

  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const outputLang = getFallbackLanguageLabel(language);

  const attemptChat = async (model: string) => {
    const chat = ai.chats.create({
      model: model,
      history: chatHistory,
      config: { 
        systemInstruction: `AI Tutor. Language: ${outputLang}. Context: ${contextStr}. Be helpful.` 
      }
    });
    return await chat.sendMessage({ message: newMessage });
  };

  try {
    try {
        const result = await attemptChat(PRIMARY_MODEL);
        return result.text || "Error.";
    } catch(e) {
        if (isTransientError(e)) {
            await sleep(1000);
            const result = await attemptChat(PRIMARY_MODEL);
            return result.text || "Error.";
        }
        throw e;
    }
  } catch (e) {
    return "Sorry, I cannot chat right now due to high server load.";
  }
};

export const parseExamContent = async (rawText: string): Promise<{ masterCase: string; questions: string[] }> => {
  // Use limiter to prevent spamming import button
  return assessmentLimiter.run(async () => {
    const prompt = `
      Split this exam text into 1) 'masterCase' (scenario) and 2) 'questions' (list).
      Remove numbering from questions.
      Input: "${rawText}"
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        masterCase: { type: Type.STRING },
        questions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["masterCase", "questions"]
    };

    try {
       const response = await generateWithRetry(PRIMARY_MODEL, prompt, {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0
        }, 2);

      const text = response.text || "{}";
      return safeJsonParse(text);
    } catch (e) {
      console.error("Parse failed", e);
      return { masterCase: "", questions: [] };
    }
  });
};
