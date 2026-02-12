import React from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import ReputationBar from './ReputationBar';
import { getConflictingFaction } from '../../utils/factionUtils';

/**
 * Компонент карточки фракции
 */
const FactionCard = ({ faction, player, onClick }) => {
  const reputation = player.factionReputation[faction.id] || { value: 0, level: 'neutral' };
  const conflictingFaction = getConflictingFaction(faction.id);
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${faction.theme.secondary} ${faction.theme.border} hover:shadow-lg`}
    >
      <div className="flex items-start gap-4">
        {/* Иконка фракции */}
        <div className={`w-16 h-16 rounded-lg ${faction.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <faction.icon size={32} className="text-white" />
        </div>
        
        {/* Информация о фракции */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-lg font-bold ${faction.theme.primary}`}>
              {faction.name}
            </h3>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
          
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {faction.description}
          </p>
          
          {/* Прогресс-бар репутации */}
          <ReputationBar value={reputation.value} />
          
          {/* Преимущества */}
          <div className="mt-3 flex flex-wrap gap-1">
            {faction.benefits.slice(0, 2).map((benefit, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
              >
                {benefit}
              </span>
            ))}
          </div>
          
          {/* Индикатор конфликта */}
          {conflictingFaction && (
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
              <AlertTriangle size={12} />
              <span>Конфликт с {conflictingFaction.name}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default FactionCard;
