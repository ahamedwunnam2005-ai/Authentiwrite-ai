
import React from 'react';

interface GaugeProps {
  score: number;
  label: string;
  confidence: number;
}

const Gauge: React.FC<GaugeProps> = ({ score, label, confidence }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Calculate range: (1 - confidence) * 100 / 2. 
  // e.g., 0.9 confidence -> (0.1 * 50) = 5% range
  const range = Math.round((1 - confidence) * 50);

  const getColor = () => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{Math.round(score)}</span>
            <span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold -mt-1">
            ±{range}%
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">AUTHENTICITY</span>
        </div>
      </div>
      <div 
        className="mt-2 px-4 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-sm"
        style={{ backgroundColor: getColor() }}
      >
        {label}
      </div>
    </div>
  );
};

export default Gauge;
