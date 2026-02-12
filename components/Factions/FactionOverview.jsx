import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { getConflictingFaction } from '../../utils/factionUtils';

/**
 * Компонент обзора фракции
 */
const FactionOverview = ({ faction, player }) => {
  const conflictingFaction = getConflictingFaction(faction.id);
  
  return (
    <div className="space-y-6">
      {/* Описание */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">О фракции</h2>
        <p className="text-slate-300 leading-relaxed">{faction.description}</p>
      </div>
      
      {/* Преимущества */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Преимущества</h2>
        <div className="space-y-3">
          {faction.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Конфликты */}
      {conflictingFaction && (
        <div className="bg-orange-900/20 rounded-xl border border-orange-600 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-orange-400 mb-2">Конфликт фракций</h2>
              <p className="text-slate-300">
                {faction.name} находится в конфликте с {conflictingFaction.name}. 
                Повышение репутации с {faction.name} будет понижать репутацию с {conflictingFaction.name} на 40% от полученного значения.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Как повысить репутацию */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Как повысить репутацию</h2>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Выполняйте задания фракции</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Ежедневные задания дают повышенную репутацию (x1.5)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Побеждайте врагов, связанных с фракцией</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Создавайте предметы, связанные с фракцией</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FactionOverview;
