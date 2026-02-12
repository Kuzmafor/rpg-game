import React from 'react';
import { ShoppingBag, Lock, Coins, Percent } from 'lucide-react';
import { getFactionMerchantItems, getReputationDiscount, purchaseFactionReward } from '../../utils/factionUtils';

/**
 * Компонент торговца фракции
 */
const FactionMerchant = ({ faction, player, setPlayer, addNotification, addLog }) => {
  const items = getFactionMerchantItems(faction.id, player);
  const discount = getReputationDiscount(faction.id, player);
  
  const handlePurchase = (reward) => {
    purchaseFactionReward(reward, player, setPlayer, addNotification, addLog);
  };
  
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
      {/* Информация о скидке */}
      {discount > 0 && (
        <div className="bg-green-900/20 rounded-xl border border-green-600 p-4">
          <div className="flex items-center gap-3">
            <Percent size={20} className="text-green-400" />
            <p className="text-sm text-slate-300">
              Ваша скидка: <span className="font-bold text-green-400">{Math.floor(discount * 100)}%</span>
            </p>
          </div>
        </div>
      )}
      
      {/* Баланс игрока */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ваше золото:</span>
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-yellow-400" />
            <span className="text-xl font-bold text-white">{player.gold}</span>
          </div>
        </div>
      </div>
      
      {/* Товары */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(reward => {
          const finalCost = Math.floor(reward.cost * (1 - discount));
          const canAfford = player.gold >= finalCost;
          
          return (
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
                {!reward.isUnlocked && (
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
              
              {/* Цена и кнопка */}
              <div className="pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Coins size={16} className="text-yellow-400" />
                    <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                      {finalCost}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs text-slate-500 line-through ml-1">
                        {reward.cost}
                      </span>
                    )}
                  </div>
                </div>
                
                {reward.isUnlocked ? (
                  <button
                    onClick={() => handlePurchase(reward)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      canAfford
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Купить' : 'Недостаточно золота'}
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 text-center py-2">
                    Требуется: {reward.requiredLevel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
          <p>Нет доступных товаров</p>
        </div>
      )}
    </div>
  );
};

export default FactionMerchant;
