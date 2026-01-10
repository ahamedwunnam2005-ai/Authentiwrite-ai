
import { Type } from "@google/genai";

export const APP_CONFIG = {
  MODEL_NAME: 'gemini-3-pro-preview',
  MAX_ESSAY_LENGTH: 10000,
  MIN_ESSAY_LENGTH: 200,
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "A score from 0-100 where 100 is highly authentic human voice." },
    aiInfluence: { type: Type.NUMBER, description: "Probability percentage (0-100) that this text was AI-generated or heavily AI-polished." },
    label: { type: Type.STRING, enum: ["Authentic", "Mixed", "Over-Polished"] },
    confidence: { type: Type.NUMBER, description: "Confidence in the analysis from 0-1." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        voice: { type: Type.NUMBER },
        specificity: { type: Type.NUMBER },
        originality: { type: Type.NUMBER },
        toneBalance: { type: Type.NUMBER }
      },
      required: ["voice", "specificity", "originality", "toneBalance"]
    },
    ratings: {
      type: Type.ARRAY,
      description: "Evaluation of the essay's quality and narrative strength.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Narrative Impact, Clarity of Insight, Structural Flow, Reflection Depth" },
          score: { type: Type.NUMBER, description: "Score from 0-100" },
          feedback: { type: Type.STRING, description: "Brief constructive feedback on this specific quality." }
        },
        required: ["category", "score", "feedback"]
      }
    },
    explainability: {
      type: Type.OBJECT,
      properties: {
        voiceReasoning: { type: Type.STRING, description: "Explanation for the voice score." },
        specificityReasoning: { type: Type.STRING, description: "Explanation for the specificity score." },
        originalityReasoning: { type: Type.STRING, description: "Explanation for the originality score." },
        toneReasoning: { type: Type.STRING, description: "Explanation for tone balance." },
        topContributingFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key linguistic features identified." }
      },
      required: ["voiceReasoning", "specificityReasoning", "originalityReasoning", "toneReasoning", "topContributingFactors"]
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
          fixSuggestion: { type: Type.STRING, description: "A specific, actionable tip on how to make this section more human (e.g., 'Add a sensory detail', 'Break up this long, perfectly balanced sentence')." }
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
You are an expert Admissions Consultant and Linguistic Forensics specialist.
Your goal is to detect AI usage patterns and help students reclaim their authentic voice.

Detection Guidelines:
1. AI INFLUENCE: Identify 'burstiness' and 'perplexity' issues. AI often has low burstiness (uniform sentence length) and low perplexity (predictable word choices).
2. OVER-POLISHING: Look for "Admissions Buzzwords" (pinnacle, embark, foster, multifarious) used in generic ways.
3. FIX SUGGESTIONS: For every segment, but especially flagged ones, provide a 'fixSuggestion'. 
   - A FIX IS NOT A REWRITE.
   - A FIX is a tactical instruction: "Use a specific verb related to your hobby instead of 'participate'", "Remove the introductory cliché", "Inject a specific sensory detail here".

Your tone must be "Advisory and Clinical" - objective but helpful. Never accuse, just analyze probabilities.
`;
