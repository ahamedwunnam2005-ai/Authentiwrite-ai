
import React from 'react';
import { ExplainabilityData, AnalysisMetrics } from '../types';

interface ExplainabilityPanelProps {
  data: ExplainabilityData;
  metrics: AnalysisMetrics;
}

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ data, metrics }) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden sm:block">
        <i className="fa-solid fa-brain text-9xl"></i>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <i className="fa-solid fa-microchip text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-0.5">Analysis Insights</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Transparency & Explainability Report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Linguistic Voice</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{metrics.voice}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {data.voiceReasoning}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Specificity</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{metrics.specificity}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {data.specificityReasoning}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Originality</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{metrics.originality}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {data.originalityReasoning}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tone Balance</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{metrics.toneBalance}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {data.toneReasoning}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-800 relative group overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6 border-b border-slate-700 pb-2">Core Drivers</h4>
              <div className="space-y-4">
                {data.topContributingFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    <span className="text-sm text-slate-200 font-semibold leading-tight">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
              <i className="fa-solid fa-info-circle text-blue-500 mt-1"></i>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Our model utilizes advanced metrics like Type-Token Ratio and Perplexity to distinguish between organic human variability and uniform AI polish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
