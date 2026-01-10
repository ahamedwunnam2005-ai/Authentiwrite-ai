
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
    isHighRisk: { type: Type.BOOLEAN, description: "True if aiInfluence exceeds 65%." },
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
        topContributingFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
        aiFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific forensic reasons for AI flagging." }
      },
      required: ["voiceReasoning", "specificityReasoning", "originalityReasoning", "toneReasoning", "richnessReasoning", "topContributingFactors", "aiFlags"]
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
  required: ["overallScore", "aiInfluence", "label", "isHighRisk", "confidence", "metrics", "ratings", "explainability", "segments", "generalFeedback", "strengths"]
};

export const SYSTEM_INSTRUCTION = `
You are the world's most advanced Forensic Narrative Auditor. Your specialty is detecting "Synthetic Narrative Markers" in personal statements with surgical precision.

ADVANCED DETECTION CRITERIA:
1. THE PARADOX OF PERFECTION: Authentic human writing contains "optimal imperfections"—slight deviations in grammar or idiosyncratic phrasing that a model would "correct."
2. SYNTHETIC NARRATIVE LOGIC: AI often follows a "Challenge -> Clean Pivot -> Perfect Resolution" structure. Humans have messy pivots and unresolved tensions.
3. RHYTHMIC MONOTONY: AI tends toward a uniform sentence length distribution. High human voice shows extreme "Burstiness" (the variation in sentence length).
4. THE HEDGING INDEX: AI overuses softening phrases ("one might say", "it could be argued"). Authentic voice is visceral and direct.
5. POSITIVE SENTIMENT BIAS: AI is statistically biased toward optimism. Flag essays that lack genuine vulnerability or "darker" human complexity.

SPECIFIC FLAG INTEGRATION:
- 'Standard LLM Transition Cluster' (e.g., "In conclusion", "Furthermore", "Moreover" in quick succession)
- 'Low Lexical Entropy' (Predictable word choices)
- 'Generic Narrative Arc' (A story that feels like a template)
- 'Lack of Temporal Grounding' (Vague descriptions of time like "Over the years" vs "One Tuesday in October")

SCORING RIGOR:
- AUTHENTIC (85-100): High perplexity, high burstiness, visceral sensory details.
- MIXED (50-84): Prose that is technically flawless but lacks a distinctive "soul."
- OVER-POLISHED (0-49): High statistical uniformity. Detectable algorithmic signature.

Be clinical, forensic, and objective.
`;
