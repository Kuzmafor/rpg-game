import React, { useState } from 'react';
import { ArrowLeft, Info, Scroll, Gift, ShoppingBag } from 'lucide-react';
import ReputationBar from './ReputationBar';
import FactionOverview from './FactionOverview';
import FactionQuests from './FactionQuests';
import FactionRewards from './FactionRewards';
import FactionMerchant from './FactionMerchant';

/**
 * Детальный экран фракции с вкладками
 */
const FactionDetailScreen = ({ faction, player, setPlayer, addNotification, addLog, ITEMS_DB, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const reputation = player.factionReputation[faction.id] || { value: 0, level: 'neutral' };
  
  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Info },
    { id: 'quests', name: 'Задания', icon: Scroll },
    { id: 'rewards', name: 'Награды', icon: Gift },
    { id: 'merchant', name: 'Торговец', icon: ShoppingBag }
  ];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Назад к фракциям</span>
        </button>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-start gap-4">
            {/* Иконка фракции */}
            <div className={`w-20 h-20 rounded-lg ${faction.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <faction.icon size={40} className="text-white" />
            </div>
            
            {/* Информация */}
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${faction.theme.primary} mb-2`}>
                {faction.name}
              </h1>
              <p className="text-slate-400 mb-4">{faction.description}</p>
              
              {/* Прогресс-бар репутации */}
              <div className="max-w-md">
                <ReputationBar value={reputation.value} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? `${faction.color} text-white shadow-lg`
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
      
      {/* Содержимое вкладок */}
      <div>
        {activeTab === 'overview' && (
          <FactionOverview faction={faction} player={player} />
        )}
        {activeTab === 'quests' && (
          <FactionQuests
            faction={faction}
            player={player}
            setPlayer={setPlayer}
            addNotification={addNotification}
            addLog={addLog}
            ITEMS_DB={ITEMS_DB}
          />
        )}
        {activeTab === 'rewards' && (
          <FactionRewards
            faction={faction}
            player={player}
          />
        )}
        {activeTab === 'merchant' && (
          <FactionMerchant
            faction={faction}
            player={player}
            setPlayer={setPlayer}
            addNotification={addNotification}
            addLog={addLog}
          />
        )}
      </div>
    </div>
  );
};

export default FactionDetailScreen;
