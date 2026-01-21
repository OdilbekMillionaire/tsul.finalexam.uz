import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for structured grading
const assessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "The numerical score awarded based on the rubric and max weight.",
    },
    rationale: {
      type: Type.STRING,
      description: "A detailed explanation of why the score was given, highlighting strengths and weaknesses.",
    },
    roadmap: {
      type: Type.STRING,
      description: "Constructive feedback on what legal logic or facts were missing.",
    },
    citations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of relevant statutes or articles from Lex.uz found via search.",
    },
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
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    You are a strict and highly knowledgeable Law Professor at TSUL (Tashkent State University of Law).
    
    Task: Assess the student's answer to the provided exam question based on the Master Case and Rubric.
    
    Language Requirement: Provide the rationale, roadmap, and citations in ${language}.
    
    Context:
    1. **Master Case Fact Pattern:** "${masterCase}"
    2. **Exam Question:** "${question}" (Max Points: ${maxWeight})
    3. **Rubric/Criteria:** "${rubric}"
    4. **Student Answer:** "${studentAnswer}"
    
    Instructions:
    - Evaluate ONLY this specific answer slot.
    - Be rigorous. Check for legal accuracy.
    - Search specifically for Uzbekistan Law (Lex.uz) to find relevant articles.
    - Provide a score between 0 and ${maxWeight}.
    - Ensure consistency with the facts in the Master Case.
    - 'citations' must be specific Article numbers and Code names from Uzbekistan legislation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable grounding for lex.uz lookups
        responseMimeType: "application/json",
        responseSchema: assessmentSchema,
        temperature: 0.2, // Low temperature for consistent, academic grading
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);
    
    // Extract grounding URLs if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
        .map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri);

    return {
      score: parsedData.score,
      rationale: parsedData.rationale,
      roadmap: parsedData.roadmap,
      citations: parsedData.citations || [],
      groundingUrls: groundingUrls
    };

  } catch (error) {
    console.error("AI Assessment failed:", error);
    // Return a fallback error state
    return {
      score: 0,
      rationale: "System Error: Unable to complete AI assessment. Please try again.",
      roadmap: "N/A",
      citations: [],
      groundingUrls: []
    };
  }
};
