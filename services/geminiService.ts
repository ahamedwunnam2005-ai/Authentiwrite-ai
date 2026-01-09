
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";
import { APP_CONFIG, ANALYSIS_SCHEMA, SYSTEM_INSTRUCTION } from "../constants";

export const analyzeEssay = async (essay: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: APP_CONFIG.MODEL_NAME,
      contents: [{
        parts: [{ text: `Analyze this personal statement for authenticity and over-polishing:\n\n${essay}` }]
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.2, // Low temperature for consistent analysis
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("The AI provided an empty response. Please try again.");
    }

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the essay. This might be due to a technical issue or an overly large input.");
  }
};
