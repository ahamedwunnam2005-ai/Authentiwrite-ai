
export enum AuthenticityLabel {
  AUTHENTIC = 'Authentic',
  MIXED = 'Mixed',
  OVER_POLISHED = 'Over-Polished'
}

export enum SegmentCategory {
  STRONG_HUMAN = 'strong-human',
  NEUTRAL = 'neutral',
  OVER_POLISHED = 'over-polished'
}

export interface AnalysisSegment {
  text: string;
  category: SegmentCategory;
  feedback: string;
  reflectiveQuestion: string;
  fixSuggestion: string; // New field for actionable "how to fix" advice
}

export interface AnalysisMetrics {
  voice: number;        // 0-100
  specificity: number;  // 0-100
  originality: number;  // 0-100
  toneBalance: number;  // 0-100
}

export interface EssayRating {
  category: string;
  score: number; // 0-100
  feedback: string;
}

export interface ExplainabilityData {
  voiceReasoning: string;
  specificityReasoning: string;
  originalityReasoning: string;
  toneReasoning: string;
  topContributingFactors: string[];
}

export interface AnalysisResult {
  overallScore: number;
  aiInfluence: number; // New: 0-100 explicit AI detection score
  label: AuthenticityLabel;
  confidence: number;
  metrics: AnalysisMetrics;
  ratings: EssayRating[];
  segments: AnalysisSegment[];
  explainability: ExplainabilityData;
  generalFeedback: string;
  strengths: string[];
}

export interface AppState {
  essay: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
