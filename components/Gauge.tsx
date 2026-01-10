
import React from 'react';

interface GaugeProps {
  score: number;
  aiInfluence: number;
  label: string;
  confidence: number;
}

const Gauge: React.FC<GaugeProps> = ({ score, aiInfluence, label, confidence }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const range = Math.round((1 - confidence) * 50);

  const getColor = () => {
    if (score >= 80) return '#2563eb'; // Deep Blue for Authentic
    if (score >= 50) return '#d97706'; // Amber
    return '#dc2626'; // Red
  };

  const getAiBadgeColor = () => {
    if (aiInfluence < 20) return 'bg-emerald-500';
    if (aiInfluence < 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col items-center select-none scale-90 sm:scale-100">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline leading-none">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(score)}</span>
            <span className="text-sm font-bold text-slate-400 ml-0.5">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">
            AUTHENTICITY
          </span>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">AI Influence:</span>
          <div className={`px-2 py-0.5 rounded-md text-white text-[9px] font-bold ${getAiBadgeColor()}`}>
            {Math.round(aiInfluence)}%
          </div>
        </div>
        <div 
          className="px-5 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-current/10"
          style={{ backgroundColor: getColor() }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default Gauge;
