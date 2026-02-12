import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { FACTION_QUESTS } from '../../constants/factionConstants';
import FactionQuestCard from './FactionQuestCard';
import { getConflictingFaction } from '../../utils/factionUtils';

/**
 * Компонент списка заданий фракции
 */
const FactionQuests = ({ faction, player, setPlayer, addNotification, addLog, ITEMS_DB }) => {
  const factionQuests = FACTION_QUESTS.filter(q => q.factionId === faction.id);
  const dailyQuests = factionQuests.filter(q => q.isDaily);
  const regularQuests = factionQuests.filter(q => !q.isDaily);
  const conflictingFaction = getConflictingFaction(faction.id);
  
  return (
    <div className="space-y-6">
      {/* Предупреждение о конфликте */}
      {conflictingFaction && (
        <div className="bg-orange-900/20 rounded-xl border border-orange-600 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-orange-400" />
            <p className="text-sm text-slate-300">
              Выполнение заданий понизит репутацию с {conflictingFaction.name}
            </p>
          </div>
        </div>
      )}
      
      {/* Ежедневные задания */}
      {dailyQuests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Ежедневные задания</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-600">
              +50% репутации
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyQuests.map(quest => (
              <FactionQuestCard
                key={quest.id}
                quest={quest}
                player={player}
                setPlayer={setPlayer}
                addNotification={addNotification}
                addLog={addLog}
                ITEMS_DB={ITEMS_DB}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Обычные задания */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Задания</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularQuests.map(quest => (
            <FactionQuestCard
              key={quest.id}
              quest={quest}
              player={player}
              setPlayer={setPlayer}
              addNotification={addNotification}
              addLog={addLog}
              ITEMS_DB={ITEMS_DB}
            />
          ))}
        </div>
      </div>
      
      {/* Пустое состояние */}
      {factionQuests.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>Нет доступных заданий для этой фракции</p>
        </div>
      )}
    </div>
  );
};

export default FactionQuests;
