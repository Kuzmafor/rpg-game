import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { FACTIONS } from '../../constants/factionConstants';
import FactionCard from './FactionCard';
import FactionDetailScreen from './FactionDetailScreen';

/**
 * Главный экран фракций
 */
const FactionScreen = ({ player, setPlayer, addNotification, addLog, ITEMS_DB }) => {
  const [selectedFaction, setSelectedFaction] = useState(null);
  
  if (selectedFaction) {
    return (
      <FactionDetailScreen
        faction={selectedFaction}
        player={player}
        setPlayer={setPlayer}
        addNotification={addNotification}
        addLog={addLog}
        ITEMS_DB={ITEMS_DB}
        onBack={() => setSelectedFaction(null)}
      />
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users size={32} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Фракции</h1>
        </div>
        <p className="text-slate-400">
          Выполняйте задания для фракций, повышайте репутацию и получайте уникальные награды
        </p>
      </div>
      
      {/* Список фракций */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FACTIONS.map(faction => (
          <FactionCard
            key={faction.id}
            faction={faction}
            player={player}
            onClick={() => setSelectedFaction(faction)}
          />
        ))}
      </div>
      
      {/* Информационная панель */}
      <div className="mt-6 bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-2">Уровни репутации</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">Враждебный</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Нейтральный</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Дружелюбный</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Уважаемый</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-400">Почитаемый</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-slate-400">Превознесенный</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactionScreen;
