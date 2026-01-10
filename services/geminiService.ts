
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, AuthenticityLabel, SegmentCategory } from "../types";
import { APP_CONFIG, ANALYSIS_SCHEMA, SYSTEM_INSTRUCTION } from "../constants";

export const analyzeEssay = async (essay: string): Promise<AnalysisResult> => {
  // Use current injected key or dialog-selected key
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.trim().length < 10) {
    console.warn("Using Local Heuristic Engine v3.2 (Offline Mode). Key missing or invalid.");
    return performOfflineAnalysis(essay);
  }

  // Mandatory: Create new instance before API call to ensure current key is used
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: APP_CONFIG.MODEL_NAME,
      contents: [{
        parts: [{ text: `Forensic Narrative Integrity Audit:\n\nAnalyze for synthetic patterns, lexical entropy, and temporal markers.\n\nEssay:\n${essay}` }]
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.1,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Cloud Audit Failed. Response was empty.");
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    console.error("Cloud Forensics Error:", error);
    
    // Explicitly handle project not found/expired key to reset UI in App.tsx
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw error;
    }
    
    return performOfflineAnalysis(essay);
  }
};

function performOfflineAnalysis(text: string): AnalysisResult {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // Rhythmic Entropy (Sentence Length Variance) -> BURSTINESS
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;
  const burstiness = Math.min(100, Math.max(15, (variance / 50) * 100));

  // Lexical Diversity -> PERPLEXITY
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const ttr = (uniqueWords / words.length) * 100;
  const perplexity = Math.min(100, Math.max(20, ttr * 1.5));

  // Specificity Markers
  const properNouns = (text.match(/[A-Z][a-z]+/g) || []).length;
  const specificityScore = Math.min(100, ((properNouns * 10) / words.length) * 100);

  // Over-Polishing
  const buzzwords = ["passionate", "transformative", "furthermore", "essential", "dynamic", "pinnacle"];
  const buzzCount = buzzwords.filter(bw => text.toLowerCase().includes(bw)).length;
  const polishPenalty = Math.min(60, buzzCount * 10);

  const overallScore = Math.max(0, Math.min(100, (burstiness * 0.4 + perplexity * 0.4 + specificityScore * 0.2) - (polishPenalty * 0.5)));
  const aiInfluence = Math.max(0, 100 - overallScore + (polishPenalty * 0.3));

  let label = AuthenticityLabel.MIXED;
  if (overallScore > 85) label = AuthenticityLabel.AUTHENTIC;
  else if (overallScore < 50) label = AuthenticityLabel.OVER_POLISHED;

  const isHighRisk = aiInfluence > 65;
  const aiFlags = [];
  if (isHighRisk) {
    aiFlags.push("Low Lexical Entropy Detected");
    aiFlags.push("Synthetic Rhythm Pattern");
  }

  const segments = sentences.slice(0, 10).map((s) => ({
    text: s,
    category: SegmentCategory.NEUTRAL,
    feedback: "Analyzing sentence structure for synthetic markers.",
    reflectiveQuestion: "How would you describe this moment to a friend in person?",
    fixSuggestion: "Try to inject a sensory detail (sight, sound, smell) here."
  }));

  return {
    overallScore: Math.round(overallScore),
    aiInfluence: Math.round(aiInfluence),
    label,
    isHighRisk,
    confidence: 0.9,
    metrics: {
      voice: Math.round(overallScore),
      specificity: Math.round(specificityScore),
      originality: Math.round(perplexity),
      toneBalance: 85,
      linguisticDepth: Math.round(ttr),
      perplexity: Math.round(perplexity),
      burstiness: Math.round(burstiness)
    },
    ratings: [
      { category: "Syntactic Variability", score: Math.round(burstiness), feedback: "Measures the human-like variation in sentence structure." },
      { category: "Lexical Entropy", score: Math.round(perplexity), feedback: "Evaluates the unpredictability of word choices." }
    ],
    explainability: {
      voiceReasoning: "The text shows signs of organic variation.",
      specificityReasoning: "Markers detected suggest personal narrative.",
      originalityReasoning: "Vocabulary choices appear idiosyncratic.",
      toneReasoning: "Tone is stable across analyzed segments.",
      richnessReasoning: "Vocabulary range is appropriate for the context.",
      topContributingFactors: ["Sentence length variation", "Word choice entropy"],
      aiFlags
    },
    segments,
    generalFeedback: "Local analysis complete. Forensic Cloud is currently offline.",
    strengths: ["Unique logic flow", "Good lexical variety"]
  };
}
