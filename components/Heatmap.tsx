
import React, { useState } from 'react';
import { AnalysisSegment, SegmentCategory } from '../types';

interface HeatmapProps {
  segments: AnalysisSegment[];
}

const Heatmap: React.FC<HeatmapProps> = ({ segments }) => {
  const [selectedSegment, setSelectedSegment] = useState<AnalysisSegment | null>(null);

  const getBgColor = (category: SegmentCategory) => {
    switch (category) {
      case SegmentCategory.STRONG_HUMAN: return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
      case SegmentCategory.OVER_POLISHED: return 'bg-rose-50 hover:bg-rose-100 border-rose-200';
      default: return 'bg-slate-50 hover:bg-slate-100 border-slate-200';
    }
  };

  const getIcon = (category: SegmentCategory) => {
    switch (category) {
      case SegmentCategory.STRONG_HUMAN: return 'fa-circle-check text-emerald-600';
      case SegmentCategory.OVER_POLISHED: return 'fa-wand-magic-sparkles text-rose-600';
      default: return 'fa-minus text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <i className="fa-solid fa-magnifying-glass-chart text-7xl"></i>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-sm">
             <i className="fa-solid fa-highlighter"></i>
          </div>
          Segment Analysis
        </h3>
        
        <div className="leading-[1.8] text-slate-800 whitespace-pre-wrap select-text text-sm sm:text-base font-medium">
          {segments.map((segment, idx) => (
            <span
              key={idx}
              onClick={() => setSelectedSegment(segment)}
              className={`inline cursor-pointer px-1.5 py-0.5 rounded-md transition-all border-b-2 mb-1 mr-1 ${getBgColor(segment.category)} ${selectedSegment === segment ? 'ring-4 ring-blue-500/10 border-blue-400 z-10' : ''} ${segment.category === SegmentCategory.OVER_POLISHED ? 'cursor-help' : ''}`}
            >
              {segment.text}
              {segment.category === SegmentCategory.OVER_POLISHED && (
                <i className="fa-solid fa-sparkles text-[10px] ml-1 text-rose-400 animate-pulse"></i>
              )}
            </span>
          ))}
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
              Strong Voice
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
              Neutral
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></div>
              Likely AI/Over-Polished
           </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          {selectedSegment ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300 ring-1 ring-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${selectedSegment.category === SegmentCategory.OVER_POLISHED ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <i className={`fa-solid ${getIcon(selectedSegment.category)}`}></i>
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xs">Section Details</h4>
                </div>
                <button onClick={() => setSelectedSegment(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observations</label>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{selectedSegment.feedback}</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                    <i className="fa-solid fa-lightbulb text-3xl text-blue-600"></i>
                  </div>
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Reflective Prompt</label>
                  <p className="text-blue-900 text-sm font-bold leading-relaxed">"{selectedSegment.reflectiveQuestion}"</p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-bolt-lightning text-amber-400 text-xs"></i>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Actionable Fix</label>
                  </div>
                  <p className="text-white text-sm font-semibold leading-relaxed">
                    {selectedSegment.fixSuggestion}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 italic text-center leading-tight">
                   "Your voice is your most valuable asset. Reclaim it segment by segment."
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center min-h-[300px] flex flex-col items-center justify-center group">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <i className="fa-solid fa-i-cursor text-slate-300 text-2xl animate-pulse"></i>
              </div>
              <h5 className="font-bold text-slate-800 mb-2">Select a Segment</h5>
              <p className="text-sm text-slate-500 font-medium px-4">Click any highlighted section to reveal linguistic insights and humanizing fixes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
