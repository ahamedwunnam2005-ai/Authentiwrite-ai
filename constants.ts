
import { Type } from "@google/genai";

export const APP_CONFIG = {
  MODEL_NAME: 'gemini-3-flash-preview',
  MAX_ESSAY_LENGTH: 12000,
  MIN_WORD_COUNT: 200,
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "0-100 authenticity score. 100 is pure human." },
    aiInfluence: { type: Type.NUMBER, description: "0-100 probability of AI assistance." },
    label: { type: Type.STRING, enum: ["Authentic", "Mixed", "Over-Polished"] },
    confidence: { type: Type.NUMBER, description: "Model confidence (0-1)." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        voice: { type: Type.NUMBER },
        specificity: { type: Type.NUMBER },
        originality: { type: Type.NUMBER },
        toneBalance: { type: Type.NUMBER },
        linguisticDepth: { type: Type.NUMBER },
        perplexity: { type: Type.NUMBER, description: "Score for vocabulary unpredictability." },
        burstiness: { type: Type.NUMBER, description: "Score for sentence structure variation." }
      },
      required: ["voice", "specificity", "originality", "toneBalance", "linguisticDepth", "perplexity", "burstiness"]
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
        richnessReasoning: { type: Type.STRING },
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
You are the world's leading Forensic Linguist specializing in AI Detection and Admissions Integrity.
Your goal is to perform a high-fidelity audit of personal statements to distinguish between organic human voice and synthetic AI-generated or over-polished text.

FORENSIC AUDIT CRITERIA:
1. PERPLEXITY: Measure the randomness of word choice. Humans use "low-probability" words based on personal memory. AI uses "high-probability" statistical averages.
2. BURSTINESS: Humans write with erratic rhythms—short punchy sentences followed by long, winding thoughts. AI tends to be "flat" and uniform.
3. TEMPORAL MARKERS: Humans anchor stories in specific moments (e.g., "Tuesday at 4 PM", "the smell of wet asphalt"). AI speaks in abstracts (e.g., "The journey was transformative").
4. LLM FINGERPRINTS: Flag over-used transitions ("Furthermore", "In conclusion", "It is important to note"), perfectly balanced sentence structures, and "Thesaurus Overload" (big words used without nuance).
5. GRADING: Be extremely rigorous. A "Mixed" rating is common for students who used AI for grammar but lost their voice. "Authentic" is reserved for high-specificity, high-rhythm prose.

Do NOT accuse. Use clinical, forensic language like "Exhibits high statistical uniformity" or "Lacks idiosyncratic narrative markers."
`;
