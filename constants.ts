
import { Type } from "@google/genai";

export const APP_CONFIG = {
  MODEL_NAME: 'gemini-3-flash-preview',
  MAX_ESSAY_LENGTH: 12000,
  MIN_WORD_COUNT: 200,
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "A score from 0-100 where 100 is highly authentic human voice." },
    aiInfluence: { type: Type.NUMBER, description: "Probability percentage (0-100) that this text was AI-assisted or over-polished." },
    label: { type: Type.STRING, enum: ["Authentic", "Mixed", "Over-Polished"] },
    confidence: { type: Type.NUMBER, description: "Confidence in the analysis from 0-1." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        voice: { type: Type.NUMBER, description: "Linguistic entropy score." },
        specificity: { type: Type.NUMBER, description: "Personal detail density." },
        originality: { type: Type.NUMBER, description: "Syntactic randomness score." },
        toneBalance: { type: Type.NUMBER, description: "Consistency of tone." },
        linguisticDepth: { type: Type.NUMBER, description: "Score for vocabulary richness and sentence structure complexity." }
      },
      required: ["voice", "specificity", "originality", "toneBalance", "linguisticDepth"]
    },
    ratings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["category", "score", "feedback"]
      }
    },
    explainability: {
      type: Type.OBJECT,
      properties: {
        voiceReasoning: { type: Type.STRING },
        specificityReasoning: { type: Type.STRING },
        originalityReasoning: { type: Type.STRING },
        toneReasoning: { type: Type.STRING },
        richnessReasoning: { type: Type.STRING, description: "Explanation of vocabulary variety and syntactic complexity." },
        topContributingFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["voiceReasoning", "specificityReasoning", "originalityReasoning", "toneReasoning", "richnessReasoning", "topContributingFactors"]
    },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["strong-human", "neutral", "over-polished"] },
          feedback: { type: Type.STRING },
          reflectiveQuestion: { type: Type.STRING },
          fixSuggestion: { type: Type.STRING }
        },
        required: ["text", "category", "feedback", "reflectiveQuestion", "fixSuggestion"]
      }
    },
    generalFeedback: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["overallScore", "aiInfluence", "label", "confidence", "metrics", "ratings", "explainability", "segments", "generalFeedback", "strengths"]
};

export const SYSTEM_INSTRUCTION = `
You are a World-Class Admissions Ethics Consultant and Linguistic Forensic specialist.
Your purpose is to analyze student personal statements for authenticity and "Human Voice".

CORE ANALYSIS PRINCIPLES:
1. LINGUISTIC ENTROPY: Humans have "bursty" writing—alternating between simple, emotional punchy sentences and complex, descriptive clauses. AI is too uniform.
2. PERPLEXITY & SPECIFICITY: AI uses probable word choices. Human voice is idiosyncratic, uses non-cliché metaphors, and includes specific "temporal markers" (dates, places, specific smells/sounds).
3. ETHICAL FRAMING: Never accuse. Use phrases like "This section exhibits high statistical uniformity common in automated tools" or "This narrative feels abstract and could benefit from grounded personal markers."
4. NO REWRITES: Do not rewrite the essay. Only provide reflection prompts and feedback.

OUTPUT: You MUST return a valid JSON object matching the provided schema.
`;
