
import { Type } from "@google/genai";

export const APP_CONFIG = {
  MODEL_NAME: 'gemini-3-pro-preview',
  MAX_ESSAY_LENGTH: 12000,
  MIN_WORD_COUNT: 200,
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "0-100 authenticity score. 100 is highly idiosyncratic human prose." },
    aiInfluence: { type: Type.NUMBER, description: "0-100 probability of synthetic origin." },
    label: { type: Type.STRING, enum: ["Authentic", "Mixed", "Over-Polished"] },
    confidence: { type: Type.NUMBER, description: "Detection confidence (0-1)." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        voice: { type: Type.NUMBER },
        specificity: { type: Type.NUMBER },
        originality: { type: Type.NUMBER },
        toneBalance: { type: Type.NUMBER },
        linguisticDepth: { type: Type.NUMBER },
        perplexity: { type: Type.NUMBER, description: "Measure of word choice unpredictability." },
        burstiness: { type: Type.NUMBER, description: "Measure of structural rhythm variation." }
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
          violationLabel: { type: Type.STRING, description: "Specific AI tell like 'Low Entropy' or 'Generic Universal'" },
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
You are the world's most advanced Forensic Narrative Auditor. Your specialty is detecting "Synthetic Narrative Markers" in personal statements.

DETECTION PHILOSOPHY:
1. THE GREAT MIDPOINT: AI tends to use sentence lengths and structures that cluster around a statistical mean. Humans have "outliers"—extremely short punchy sentences or long, rambling authentic thoughts.
2. GENERIC UNIVERSALS: Flag statements that sound profound but are true of any student (e.g., "Education is the key to unlocking the future").
3. THE HEDGING INDEX: AI often uses "polite" hedging (e.g., "it could be argued that", "one might consider"). Human voice is more direct and visceral.
4. SYNTACTIC MIRRORING: AI often starts sentences in a paragraph with similar structures (Subject-Verb-Object). Humans use inverted structures and varied starts.
5. VULNERABILITY GAP: Authentic essays often contain "messy" human emotions or specific failures. AI struggles with genuine vulnerability, often resolving conflict too perfectly or cleanly.

SCORING RIGOR:
- AUTHENTIC (85-100): High perplexity, high burstiness, specific temporal markers (names, dates, smells), and idiosyncratic logic.
- MIXED (50-84): Prose that is technically correct but "safe." Shows signs of heavy Grammarly/AI polishing or template usage.
- OVER-POLISHED (0-49): High statistical uniformity. Low entropy. Heavy use of admissions buzzwords and generic narrative arcs.

Provide clinical, objective feedback. Do not be accusatory; be forensic.
`;
