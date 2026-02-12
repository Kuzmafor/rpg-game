import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { getFactionMerchantItems } from '../../utils/factionUtils';

/**
 * Компонент списка наград фракции
 */
const FactionRewards = ({ faction, player }) => {
  const rewards = getFactionMerchantItems(faction.id, player);
  
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-slate-400 border-slate-600',
      uncommon: 'text-green-400 border-green-600',
      rare: 'text-blue-400 border-blue-600',
      epic: 'text-purple-400 border-purple-600',
      legendary: 'text-orange-400 border-orange-600'
    };
    return colors[rarity] || colors.common;
  };
  
  const getRarityBg = (rarity) => {
    const colors = {
      common: 'bg-slate-900/50',
      uncommon: 'bg-green-900/20',
      rare: 'bg-blue-900/20',
      epic: 'bg-purple-900/20',
      legendary: 'bg-orange-900/20'
    };
    return colors[rarity] || colors.common;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <p className="text-sm text-slate-400">
          Награды разблокируются при достижении определенных уровней репутации. 
          Их можно приобрести у торговца фракции.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(reward => (
          <div
            key={reward.id}
            className={`rounded-xl border-2 p-4 ${getRarityBg(reward.item.rarity)} ${
              reward.isUnlocked ? getRarityColor(reward.item.rarity) : 'border-slate-800 opacity-50'
            }`}
          >
            {/* Заголовок */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className={`font-bold ${reward.isUnlocked ? getRarityColor(reward.item.rarity).split(' ')[0] : 'text-slate-500'}`}>
                  {reward.name}
                </h3>
                <p className="text-xs text-slate-500 uppercase">{reward.item.rarity}</p>
              </div>
              {reward.isUnlocked ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <Lock size={20} className="text-slate-600" />
              )}
            </div>
            
            {/* Характеристики */}
            {reward.item.val > 0 && (
              <div className="text-sm text-slate-300 mb-2">
                <span className="font-bold">{reward.item.type === 'weapon' ? 'Урон' : 'Защита'}: </span>
                <span>{reward.item.val}</span>
              </div>
            )}
            
            {/* Эффект */}
            {reward.item.effect && (
              <div className="text-xs text-slate-400 mb-3 italic">
                {reward.item.effect}
              </div>
            )}
            
            {/* Требования */}
            <div className="pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className={reward.isUnlocked ? 'text-green-400' : 'text-slate-500'}>
                  {reward.requiredLevel}
                </span>
                <span className="text-yellow-400 font-bold">{reward.cost} золота</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {rewards.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>Нет доступных наград для этой фракции</p>
        </div>
      )}
    </div>
  );
};

export default FactionRewards;
