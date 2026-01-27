
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult, StudentAnswer, Question, ChatMessage } from "../types";
import { TRANSLATIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model Constants
const PRIMARY_MODEL = "gemini-3-pro-preview";
const FALLBACK_MODEL = "gemini-3-flash-preview";

// Helper to check for quota errors
const isQuotaError = (error: any): boolean => {
  const msg = error?.message || JSON.stringify(error);
  return msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('Resource has been exhausted');
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
      description: "A detailed explanation of why the score was given, explicitly referencing the criteria met or missed from the rubric.",
    },
    roadmap: {
      type: Type.STRING,
      description: "Constructive feedback on exactly what legal logic or facts were missing based on the strict grading criteria.",
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

  const prompt = `
    You are a STRICT, SKEPTICAL, and highly knowledgeable Law Professor at TSUL (Tashkent State University of Law).
    
    Task: Assess the student's answer to the provided exam question based on the Master Case and Rubric.
    
    Language Requirement: Provide the rationale, roadmap, and citations in ${language}.
    
    Context:
    1. **Master Case Fact Pattern:** "${masterCase}"
    2. **Exam Question:** "${question}" (Max Points: ${maxWeight})
    3. **Rubric/Criteria:** "${rubric}"
    4. **Student Answer:** "${studentAnswer}"
    
    STRICT GRADING PROTOCOLS:
    1. **Skepticism**: Assume the answer is incorrect or incomplete until the student PROVES they understand the law. Do not give "benefit of the doubt".
    2. **No Grade Inflation**: It is rare for a student to get full marks. A generic answer deserves a low score (e.g., 30-40%). A good answer gets 70-80%. Only perfect, legally precise answers get 90%+.
    3. **Rubric Hierarchy**: 
       - If "Custom Instructions" are provided, follow them FIRST.
       - HOWEVER, you must ALSO check for fundamental legal competence (Norm Identification, Fact Application, Logic). If the student writes a "correct" answer according to custom rules but makes a fundamental error in legal logic (e.g., citing a repealed law, missing the main issue), DEDUCT POINTS heavily.
    4. **Normalization**: Return a score out of ${maxWeight}. 
    5. **Lex.uz**: Verify citations. If they cite Article 45 but the text corresponds to Article 49, mark it wrong.
    
    Your Output Rationale must explicitly state: "Points deducted because..."
  `;

  const config = {
    tools: [{ googleSearch: {} }], // Enable grounding for lex.uz lookups
    responseMimeType: "application/json",
    responseSchema: assessmentSchema,
    temperature: 0.1, // Very low temperature for maximum strictness and consistency
  };

  const attemptGeneration = async (model: string) => {
    return await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });
  };

  try {
    // Try Primary Model
    let response;
    try {
      response = await attemptGeneration(PRIMARY_MODEL);
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn(`Primary model ${PRIMARY_MODEL} quota exceeded. Falling back to ${FALLBACK_MODEL}.`);
        response = await attemptGeneration(FALLBACK_MODEL);
      } else {
        throw error;
      }
    }

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
      rationale: "System Error: Unable to complete AI assessment. Please try again later.",
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
    Student Answer: ${answers[q.id]?.text || "No Answer"}
    Score: ${answers[q.id]?.assessment?.score || 0}
  `).join("\n");

  // Get localized headers
  const langKey = (language === 'uz-lat' || language === 'uz-cyr' || language === 'ru' || language === 'en') ? language : 'en';
  const headers = TRANSLATIONS[langKey].aiHeaders;

  const prompt = `
    You are a Senior Law Professor. Provide a comprehensive summary of the student's performance on this final exam.
    
    Language: ${language}
    
    Master Case: ${masterCase}
    
    Student Performance:
    ${formattedQA}
    
    Output structured as plain text (no markdown bolding *). Use exactly these headers in the output:
    1. ${headers.strengths}
    2. ${headers.weaknesses}
    3. ${headers.tips}
    
    Keep it encouraging but academically rigorous.
  `;

  const config = {
    temperature: 0.4,
  };

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config
      });
    } catch (error) {
      if (isQuotaError(error)) {
         console.warn(`Primary model ${PRIMARY_MODEL} quota exceeded. Falling back to ${FALLBACK_MODEL}.`);
         response = await ai.models.generateContent({
            model: FALLBACK_MODEL,
            contents: prompt,
            config
         });
      } else {
        throw error;
      }
    }
    return response.text || "Could not generate feedback.";
  } catch (e) {
    console.error(e);
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
    Master Case: ${contextData.masterCase.substring(0, 1000)}...
    Questions and Scores:
    ${contextData.questions.map(q => `Q: ${q.text}, Score: ${contextData.answers[q.id]?.assessment?.score}`).join('; ')}
  `;

  // Convert history to Gemini format
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const systemInstruction = `You are an AI Tutor discussing exam results with a law student.
  Language: ${language}.
  Context: ${contextStr}.
  Do not use markdown bolding (*).
  Be helpful and explain why they got the score they did if asked.`;

  const attemptChat = async (model: string) => {
    const chat = ai.chats.create({
      model: model,
      history: chatHistory,
      config: { systemInstruction }
    });
    return await chat.sendMessage({ message: newMessage });
  };

  try {
    let result;
    try {
      result = await attemptChat(PRIMARY_MODEL);
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn(`Primary model ${PRIMARY_MODEL} quota exceeded. Falling back to ${FALLBACK_MODEL}.`);
        result = await attemptChat(FALLBACK_MODEL);
      } else {
        throw error;
      }
    }
    return result.text || "I didn't catch that.";
  } catch (e) {
    console.error(e);
    return "Sorry, I cannot chat right now.";
  }
};

// NEW FUNCTION: Smart Import to split Case and Questions
export const parseExamContent = async (rawText: string): Promise<{ masterCase: string; questions: string[] }> => {
  const prompt = `
    Analyze the following raw text which contains a Legal Case Fact Pattern (Scenario) and a list of Questions.
    
    Task:
    1. Extract the main "Master Case" or "Fact Pattern" text.
    2. Extract the individual "Questions" as a list. Remove any numbering (1., 2., a), b)) from the start of questions.
    
    Raw Text:
    "${rawText}"
    
    Return JSON:
    {
      "masterCase": "The full scenario text...",
      "questions": ["Question 1 text", "Question 2 text"]
    }
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      masterCase: { type: Type.STRING },
      questions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["masterCase", "questions"]
  };

  const attemptParse = async (model: string) => {
     return await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
  };

  try {
    let response;
    try {
       response = await attemptParse(PRIMARY_MODEL);
    } catch (error) {
       if (isQuotaError(error)) {
          console.warn(`Primary model ${PRIMARY_MODEL} quota exceeded for parsing. Falling back to ${FALLBACK_MODEL}.`);
          response = await attemptParse(FALLBACK_MODEL);
       } else {
         throw error;
       }
    }

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse exam content", e);
    return { masterCase: "", questions: [] };
  }
};
