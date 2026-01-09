
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
}

export interface AnalysisMetrics {
  voice: number;        // 0-100
  specificity: number;  // 0-100
  originality: number;  // 0-100
  toneBalance: number;  // 0-100
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
  label: AuthenticityLabel;
  confidence: number;
  metrics: AnalysisMetrics;
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
