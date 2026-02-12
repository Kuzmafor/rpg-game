import React from 'react';
import { getReputationLevel, getReputationProgress } from '../../utils/factionUtils';

/**
 * Компонент прогресс-бара репутации
 */
const ReputationBar = ({ value, showLabel = true, size = 'md' }) => {
  const level = getReputationLevel(value);
  const progress = getReputationProgress(value);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1 font-semibold">
          <span className={level.color}>{level.name}</span>
          <span className="text-slate-400">
            {Math.floor(progress.current)} / {Math.floor(progress.max)}
          </span>
        </div>
      )}
      <div className={`${sizeClasses[size]} bg-slate-900 rounded-full overflow-hidden border ${level.borderColor}`}>
        <div 
          className={`h-full ${level.bgColor} transition-all duration-300`}
          style={{ width: `${progress.percent}%` }}
        >
          <div className={`h-full ${level.color.replace('text-', 'bg-')} opacity-50`}></div>
        </div>
      </div>
    </div>
  );
};

export default ReputationBar;
