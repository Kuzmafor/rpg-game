import React from 'react';
import { Coins, Zap, CheckCircle, Lock, Calendar } from 'lucide-react';
import { canAcceptQuest, completeFactionQuest } from '../../utils/factionUtils';

/**
 * Компонент карточки задания фракции
 */
const FactionQuestCard = ({ quest, player, setPlayer, addNotification, addLog, ITEMS_DB }) => {
  const { canAccept, reason } = canAcceptQuest(quest, player);
  const isCompleted = player.completedFactionQuests?.includes(quest.id);
  
  const handleComplete = () => {
    completeFactionQuest(quest, player, setPlayer, addNotification, addLog, ITEMS_DB);
  };
  
  const getQuestTypeLabel = (type) => {
    const labels = {
      'kill': 'Убить врагов',
      'collect': 'Собрать ресурсы',
      'craft': 'Создать предметы',
      'explore': 'Исследовать',
      'earn_gold': 'Заработать золото',
      'visit_locations': 'Посетить локации',
      'kill_location': 'Убить в локации',
      'collect_category': 'Собрать категорию',
      'craft_category': 'Создать категорию'
    };
    return labels[type] || type;
  };
  
  return (
    <div className={`bg-slate-800 rounded-xl border p-4 ${
      canAccept ? 'border-slate-700' : 'border-slate-800 opacity-60'
    }`}>
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{quest.name}</h3>
            {quest.isDaily && (
              <Calendar size={14} className="text-blue-400" />
            )}
          </div>
          <p className="text-xs text-slate-400">{getQuestTypeLabel(quest.type)}</p>
        </div>
        {isCompleted && (
          <CheckCircle size={20} className="text-green-400" />
        )}
        {!canAccept && !isCompleted && (
          <Lock size={20} className="text-slate-600" />
        )}
      </div>
      
      {/* Описание */}
      <p className="text-sm text-slate-300 mb-4">{quest.description}</p>
      
      {/* Награды */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-900 text-yellow-400">
          <Coins size={12} />
          <span>{quest.rewards.gold}</span>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-900 text-blue-400">
          <Zap size={12} />
          <span>{quest.rewards.exp}</span>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-900 text-purple-400">
          <span>+{quest.rewards.reputation} репутации</span>
        </div>
        {quest.rewards.item && (
          <div className="text-xs px-2 py-1 rounded bg-slate-900 text-green-400">
            {quest.rewards.item.name}
          </div>
        )}
      </div>
      
      {/* Кнопка */}
      {canAccept && !isCompleted && (
        <button
          onClick={handleComplete}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          Выполнить задание
        </button>
      )}
      
      {!canAccept && !isCompleted && (
        <div className="text-xs text-slate-500 text-center py-2">
          {reason}
        </div>
      )}
      
      {isCompleted && (
        <div className="text-xs text-green-400 text-center py-2 font-medium">
          Задание выполнено
        </div>
      )}
    </div>
  );
};

export default FactionQuestCard;
