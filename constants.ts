
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
    explainability: {
      type: Type.OBJECT,
      properties: {
        voiceReasoning: { type: Type.STRING, description: "Explanation for the voice score based on linguistic variability and entropy." },
        specificityReasoning: { type: Type.STRING, description: "Explanation for the specificity score based on personal details and temporal markers." },
        originalityReasoning: { type: Type.STRING, description: "Explanation for the originality score based on narrative structure." },
        toneReasoning: { type: Type.STRING, description: "Explanation for tone balance between academic and personal." },
        topContributingFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 key linguistic features that drove this specific analysis result." }
      },
      required: ["voiceReasoning", "specificityReasoning", "originalityReasoning", "toneReasoning", "topContributingFactors"]
    },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The exact text segment from the original essay." },
          category: { type: Type.STRING, enum: ["strong-human", "neutral", "over-polished"] },
          feedback: { type: Type.STRING, description: "Constructive, supportive feedback in plain language." },
          reflectiveQuestion: { type: Type.STRING, description: "A question to help the student dig deeper." }
        },
        required: ["text", "category", "feedback", "reflectiveQuestion"]
      }
    },
    generalFeedback: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["overallScore", "label", "confidence", "metrics", "explainability", "segments", "generalFeedback", "strengths"]
};

export const SYSTEM_INSTRUCTION = `
You are an expert Admissions Consultant and Linguistic Ethicist specializing in student personal statements.
Your goal is to help students identify the authenticity of their writing.

Core Analysis Rules:
1. FOCUS ON AUTHENTICITY: Look for linguistic variability (diverse word choice), sentence entropy (unpredictable patterns), personal detail density (specific names/dates/feelings), narrative coherence, and emotional specificity.
2. DETECT OVER-POLISHING: Flag sections that use generic admissions buzzwords, overly balanced AI-like structures (parallelism), or abstract language without concrete evidence.
3. EXPLAIN YOUR REASONING: In the 'explainability' section, describe exactly which linguistic patterns (like "low sentence entropy" or "high personal detail density") led to the scores.
4. BE CONSTRUCTIVE: Never accuse. Use phrases like "This feels a bit formal" or "This section is clear but abstract" instead of "AI detected".
5. NO REWRITING: Do not ever provide rewritten text. Only provide feedback and reflective questions.
6. SEGMENTATION: Divide the essay into segments that cover the ENTIRE text. Every sentence must belong to a segment.
7. HEATMAP SCORING: 
   - 'strong-human': Personal anecdotes, sensory details, temporal markers, imperfect but genuine phrasing.
   - 'neutral': Standard transitions, factual statements.
   - 'over-polished': Hyper-formal, clichéd, or repetitive structures common in generative AI outputs.

The response MUST be a JSON object following the provided schema.
`;
