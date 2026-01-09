
import React from 'react';
import { ExplainabilityData, AnalysisMetrics } from '../types';

interface ExplainabilityPanelProps {
  data: ExplainabilityData;
  metrics: AnalysisMetrics;
}

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ data, metrics }) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <i className="fa-solid fa-brain text-8xl"></i>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <i className="fa-solid fa-microchip"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Explainability Panel</h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">How we reached these results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Linguistic Voice Reasoning</span>
                <span className="text-xs font-mono text-blue-400">{metrics.voice}% Match</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                {data.voiceReasoning}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Specificity Reasoning</span>
                <span className="text-xs font-mono text-blue-400">{metrics.specificity}% Match</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                {data.specificityReasoning}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Originality Reasoning</span>
                <span className="text-xs font-mono text-blue-400">{metrics.originality}% Match</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                {data.originalityReasoning}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Tone Reasoning</span>
                <span className="text-xs font-mono text-blue-400">{metrics.toneBalance}% Match</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                {data.toneReasoning}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Key Contributing Factors</h4>
            <div className="space-y-3">
              {data.topContributingFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-sm text-slate-300 leading-snug">{factor}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-[11px] text-blue-400/80 leading-relaxed italic">
                Our analysis focuses on linguistic patterns like entropy (pattern unpredictability) and variability (lexical diversity) to separate synthetic polish from organic human thought.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
