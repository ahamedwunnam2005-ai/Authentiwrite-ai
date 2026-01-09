
import React, { useState } from 'react';
import { AnalysisSegment, SegmentCategory } from '../types';

interface HeatmapProps {
  segments: AnalysisSegment[];
}

const Heatmap: React.FC<HeatmapProps> = ({ segments }) => {
  const [selectedSegment, setSelectedSegment] = useState<AnalysisSegment | null>(null);

  const getBgColor = (category: SegmentCategory) => {
    switch (category) {
      case SegmentCategory.STRONG_HUMAN: return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300';
      case SegmentCategory.OVER_POLISHED: return 'bg-rose-100 hover:bg-rose-200 border-rose-300';
      default: return 'bg-slate-100 hover:bg-slate-200 border-slate-300';
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
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-blue-500"></i>
          Interactive Voice Heatmap
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Tap highlighted sections to see detailed feedback and reflective prompts.
        </p>
        <div className="leading-relaxed text-slate-800 whitespace-pre-wrap select-text text-sm sm:text-base">
          {segments.map((segment, idx) => (
            <span
              key={idx}
              onClick={() => setSelectedSegment(segment)}
              className={`inline cursor-pointer px-1 rounded transition-colors border-b-2 mb-1 ${getBgColor(segment.category)} ${selectedSegment === segment ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            >
              {segment.text}
            </span>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          {selectedSegment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <i className={`fa-solid ${getIcon(selectedSegment.category)} text-xl`}></i>
                <h4 className="font-bold text-slate-800 uppercase tracking-tight text-xs">Section Insight</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Analysis</label>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedSegment.feedback}</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1 italic">Reflection Prompt</label>
                  <p className="text-blue-800 text-sm font-medium leading-relaxed">"{selectedSegment.reflectiveQuestion}"</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSegment(null)}
                className="w-full mt-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all border border-slate-100"
              >
                CLOSE INSIGHT
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center min-h-[200px] flex flex-col items-center justify-center opacity-70">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <i className="fa-solid fa-hand-pointer text-slate-400 animate-bounce"></i>
              </div>
              <p className="text-sm text-slate-500 font-medium">Select a segment in the essay to view reflective guidance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
