
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
  fixSuggestion: string;
}

export interface AnalysisMetrics {
  voice: number;        
  specificity: number;  
  originality: number;  
  toneBalance: number;  
  linguisticDepth: number; 
  perplexity: number;   // NEW: Randomness of word choice
  burstiness: number;   // NEW: Variation in sentence structure
}

export interface EssayRating {
  category: string;
  score: number; 
  feedback: string;
}

export interface ExplainabilityData {
  voiceReasoning: string;
  specificityReasoning: string;
  originalityReasoning: string;
  toneReasoning: string;
  richnessReasoning: string; 
  topContributingFactors: string[];
}

export interface AnalysisResult {
  overallScore: number;
  aiInfluence: number;
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
