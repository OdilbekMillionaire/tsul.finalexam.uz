
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult, StudentAnswer, Question, ChatMessage } from "../types";
import { TRANSLATIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model Constants
// Flash is Primary for speed (5-10 seconds for grading, 1-3 seconds for parsing).
const PRIMARY_MODEL = "gemini-3-flash-preview"; 
const FALLBACK_MODEL = "gemini-3-pro-preview";

// Helper to check for quota errors
const isQuotaError = (error: any): boolean => {
  const msg = error?.message || JSON.stringify(error);
  return msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('Resource has been exhausted');
};

// Helper to get a fallback language description
const getFallbackLanguageLabel = (langCode: string): string => {
  switch (langCode) {
    case 'uz-lat': return "O'zbek tilida (Lotin)";
    case 'uz-cyr': return "Ўзбек тилида (Кирилл)";
    case 'ru': return "На русском языке";
    default: return "In English";
  }
};

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
      description: "A detailed explanation of why the score was given.",
    },
    roadmap: {
      type: Type.STRING,
      description: "Constructive feedback on missing logic or facts.",
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

  const fallbackLang = getFallbackLanguageLabel(language);

  const prompt = `
    You are a STRICT Law Professor at TSUL (Tashkent State University of Law).
    
    Task: Assess the student's answer.
    
    1. **LANGUAGE MATCHING (CRITICAL)**:
       - DETECT the language of the "Student Answer" below.
       - WRITE your 'rationale' and 'roadmap' in that **SAME LANGUAGE**.
       - (Example: If student writes in Russian -> You output Russian. If Uzbek -> You output Uzbek).
       - Only if the answer is gibberish/empty, default to: ${fallbackLang}.
    
    2. **ZERO HALLUCINATION POLICY (RAG)**:
       - You MUST use the 'googleSearch' tool to verify every law/article cited.
       - Search Query Example: "lex.uz Jinoyat kodeksi 97-modda".
       - **Compare**: Does the official text match the student's explanation?
       - If the student cites Article X but explains Article Y -> DEDUCT POINTS.
       - If the student invents a law not on lex.uz -> SCORE 0 for legal basis.
       - Do NOT rely on internal memory for article numbers; they change. Verify.
    
    3. **Context**:
       - Case: "${masterCase}"
       - Question: "${question}" (Max: ${maxWeight} pts)
       - Rubric: "${rubric}"
       - Student Answer: "${studentAnswer}"

    4. **Grading**:
       - Be skeptical. Generic answers = low score.
       - Check for: Identification of Norm, Application to Facts, Logic.
       - Return JSON.
  `;

  const config = {
    tools: [{ googleSearch: {} }], // ENABLE LIVE RAG
    responseMimeType: "application/json",
    responseSchema: assessmentSchema,
    temperature: 0.1, // Low temp for facts
  };

  const attemptGeneration = async (model: string) => {
    return await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });
  };

  try {
    let response;
    try {
      response = await attemptGeneration(PRIMARY_MODEL);
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn(`Primary model quota exceeded. Falling back.`);
        response = await attemptGeneration(FALLBACK_MODEL);
      } else {
        throw error;
      }
    }

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);
    
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
    return {
      score: 0,
      rationale: "System Error: Unable to complete AI assessment.",
      roadmap: "N/A",
      citations: [],
      groundingUrls: []
    };
  }
};

export const getOverallAssessment = async (
  masterCase: string,
  questions: Question[],
  answers: Record<string, StudentAnswer>,
  language: string
): Promise<string> => {
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
    - Use '###' for section headers. Ensure there is a blank line before each header.
    - Use '**' for bolding key concepts.
    - Use '-' or '*' for lists.

    Use these specific headers:
    1. ${headers.strengths}
    2. ${headers.weaknesses}
    3. ${headers.tips}
  `;

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { temperature: 0.4 }
    });
    return response.text || "Could not generate feedback.";
  } catch (e) {
    return "Error generating overall feedback.";
  }
};

export const chatWithAI = async (
  history: ChatMessage[],
  newMessage: string,
  contextData: { masterCase: string; questions: Question[]; answers: Record<string, StudentAnswer> },
  language: string
): Promise<string> => {
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
    const result = await attemptChat(PRIMARY_MODEL);
    return result.text || "Error.";
  } catch (e) {
    return "Sorry, I cannot chat right now.";
  }
};

// OPTIMIZED FOR SPEED: Smart Import
export const parseExamContent = async (rawText: string): Promise<{ masterCase: string; questions: string[] }> => {
  // Ultra-concise prompt for minimal token usage = faster speed
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
     // Explicitly use Flash for speed (1-3s)
     const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0 // Deterministic extraction
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Parse failed", e);
    return { masterCase: "", questions: [] };
  }
};
