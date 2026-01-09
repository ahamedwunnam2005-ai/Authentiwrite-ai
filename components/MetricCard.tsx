
import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, description }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <i className={icon}></i>
          </div>
          <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
        </div>
        <span className="text-lg font-bold text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 leading-tight">{description}</p>
    </div>
  );
};

export default MetricCard;
