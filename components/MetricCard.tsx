
import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, description }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 group border-b-4" style={{ borderBottomColor: `rgba(37, 99, 235, ${value/100})` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <i className={icon + " text-base"}></i>
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight tracking-tight">{label}</h3>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-slate-900">{Math.round(value)}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden p-0.5">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.3)]" 
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
};

export default MetricCard;
