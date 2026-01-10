
import { Type } from "@google/genai";

export const APP_CONFIG = {
  MODEL_NAME: 'gemini-3-pro-preview',
  MAX_ESSAY_LENGTH: 12000,
  MIN_WORD_COUNT: 200,
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "A score from 0-100 where 100 is highly authentic human voice." },
    aiInfluence: { type: Type.NUMBER, description: "Probability percentage (0-100) that this text was AI-generated." },
    label: { type: Type.STRING, enum: ["Authentic", "Mixed", "Over-Polished"] },
    confidence: { type: Type.NUMBER, description: "Confidence in the analysis from 0-1." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        voice: { type: Type.NUMBER },
        specificity: { type: Type.NUMBER },
        originality: { type: Type.NUMBER },
        toneBalance: { type: Type.NUMBER },
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
You are an expert Admissions Consultant and Linguistic Forensic specialist.
Analyze student personal statements for authenticity.

Specific Refinement for AI Detection:
1. LINGUISTIC DEPTH: Calculate score based on Vocabulary Richness (Type-Token Ratio) and Sentence Complexity. AI tends toward middle-ground complexity and repetitive, high-probability word choices. Human writing often features "bursty" complexity—alternating between simple and dense clauses.
2. SYNTACTIC RANDOMNESS: Look for unique phrasing that deviates from common "Admissions Templates".
3. ACTIONABLE FIXES: Provide tips that encourage adding sensory details or breaking up "perfect" parallelism which often signals AI assistance.

Tone: Professional, supportive, and clinical. Focus on probability, not accusation.
`;
