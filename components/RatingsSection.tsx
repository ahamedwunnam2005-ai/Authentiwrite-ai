
import React from 'react';
import { EssayRating } from '../types';

interface RatingsSectionProps {
  ratings: EssayRating[];
}

const RatingsSection: React.FC<RatingsSectionProps> = ({ ratings }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <i className="fa-solid fa-chart-line text-lg"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Narrative Evaluation</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quality & Impact Ratings</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ratings.map((rating, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{rating.category}</h4>
              <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {Math.round(rating.score)}/100
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${rating.score}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {rating.feedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsSection;
