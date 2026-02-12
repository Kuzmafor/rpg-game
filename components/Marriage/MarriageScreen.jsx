import React, { useState } from 'react';
import { Heart, Crown, Gift, Sparkles } from 'lucide-react';

// Временно определяем константы здесь, чтобы избежать проблем с импортом
const WEDDING_RINGS = [
  { id: 'simple_ring', name: 'Простое кольцо', description: 'Скромное, но искреннее', cost: 500, rarity: 'common', icon: '💍', bonuses: { expBonus: 5, goldBonus: 5 } },
  { id: 'silver_ring', name: 'Серебряное кольцо', description: 'Элегантное серебряное кольцо', cost: 1500, rarity: 'uncommon', icon: '💍', bonuses: { expBonus: 10, goldBonus: 10 } },
  { id: 'gold_ring', name: 'Золотое кольцо', description: 'Роскошное золотое кольцо', cost: 5000, rarity: 'rare', icon: '💍', bonuses: { expBonus: 15, goldBonus: 15, luckBonus: 5 } },
  { id: 'diamond_ring', name: 'Бриллиантовое кольцо', description: 'Сверкающее бриллиантовое кольцо', cost: 15000, rarity: 'epic', icon: '💎', bonuses: { expBonus: 20, goldBonus: 20, luckBonus: 10 } },
  { id: 'legendary_ring', name: 'Легендарное кольцо', description: 'Кольцо вечной любви', cost: 50000, rarity: 'legendary', icon: '👑', bonuses: { expBonus: 30, goldBonus: 30, luckBonus: 15 } }
];

const WEDDING_VENUES = [
  { id: 'temple', name: 'Храм Света', description: 'Священное место для торжественной церемонии', cost: 1000, icon: '⛪', bonuses: { blessing: 'Благословение Света (+5% к опыту на 7 дней)' } },
  { id: 'garden', name: 'Волшебный сад', description: 'Романтический сад с цветущими деревьями', cost: 2000, icon: '🌸', bonuses: { blessing: 'Благословение Природы (+10% к сбору ресурсов на 7 дней)' } },
  { id: 'beach', name: 'Закатный пляж', description: 'Живописный пляж на закате', cost: 3000, icon: '🏖️', bonuses: { blessing: 'Благословение Моря (+15% к рыбалке на 7 дней)' } },
  { id: 'castle', name: 'Королевский замок', description: 'Роскошный замок для королевской свадьбы', cost: 10000, icon: '🏰', bonuses: { blessing: 'Королевское благословение (+20% ко всем наградам на 7 дней)' } },
  { id: 'sky', name: 'Небесный остров', description: 'Парящий остров среди облаков', cost: 25000, icon: '☁️', bonuses: { blessing: 'Благословение Небес (+25% опыта, +15% золота на 14 дней)' } }
];

const WEDDING_GIFTS = [
  { id: 'flowers', name: 'Букет цветов', description: 'Красивый букет свежих цветов', cost: 100, icon: '💐', effect: '+50 к отношениям' },
  { id: 'chocolate', name: 'Коробка шоколада', description: 'Изысканные шоколадные конфеты', cost: 200, icon: '🍫', effect: '+100 к отношениям' },
  { id: 'jewelry', name: 'Украшение', description: 'Драгоценное украшение', cost: 1000, icon: '📿', effect: '+500 к отношениям' },
  { id: 'pet', name: 'Питомец', description: 'Милый питомец для пары', cost: 5000, icon: '🐾', effect: '+1000 к отношениям' }
];

const RELATIONSHIP_LEVELS = [
  { level: 0, name: 'Незнакомцы', minPoints: 0, icon: '👥' },
  { level: 1, name: 'Знакомые', minPoints: 100, icon: '🤝' },
  { level: 2, name: 'Друзья', minPoints: 500, icon: '😊' },
  { level: 3, name: 'Близкие друзья', minPoints: 1000, icon: '💙' },
  { level: 4, name: 'Влюбленные', minPoints: 2500, icon: '💕' },
  { level: 5, name: 'Помолвлены', minPoints: 5000, icon: '💍' },
  { level: 6, name: 'Молодожены', minPoints: 10000, icon: '💑' },
  { level: 7, name: 'Счастливая пара', minPoints: 25000, icon: '💖' },
  { level: 8, name: 'Идеальная пара', minPoints: 50000, icon: '💝' },
  { level: 9, name: 'Легендарная пара', minPoints: 100000, icon: '👑' }
];

const MarriageScreen = ({ player, onBuyRing, onPropose, onOrganizeWedding, onGiveGift, onDivorce }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRing, setSelectedRing] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);

  // Получить уровень отношений
  const getRelLevel = (points = 0) => {
    const levels = [...RELATIONSHIP_LEVELS].reverse();
    return levels.find(l => points >= l.minPoints) || RELATIONSHIP_LEVELS[0];
  };

  const currentRelLevel = player?.isMarried ? getRelLevel(player?.relationshipPoints?.[player?.partnerId] || 0) : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-900/40 via-rose-900/40 to-slate-900 rounded-2xl p-6 border border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Свадьбы</h2>
              <p className="text-pink-300 text-sm">Найдите свою вторую половинку</p>
            </div>
          </div>
          
          {player?.isMarried && (
            <div className="flex gap-3">
              <div className="bg-slate-900/70 px-4 py-2 rounded-xl border border-pink-500/30">
                <div className="text-xs text-pink-300">Партнер</div>
                <div className="text-lg font-black text-white">{player?.partnerName || 'Неизвестно'}</div>
              </div>
              <div className="bg-slate-900/70 px-4 py-2 rounded-xl border border-rose-500/30">
                <div className="text-xs text-rose-300">Дней вместе</div>
                <div className="text-lg font-black text-white">
                  {player?.weddingDate ? Math.floor((Date.now() - player.weddingDate) / (1000 * 60 * 60 * 24)) : 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700 overflow-x-auto">
        {['overview', 'rings', 'wedding', 'gifts'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' && 'Обзор'}
            {tab === 'rings' && 'Кольца'}
            {tab === 'wedding' && 'Свадьба'}
            {tab === 'gifts' && 'Подарки'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {player?.isMarried ? (
            <>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Crown className="text-yellow-400" /> Статус брака
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Партнер</div>
                    <div className="text-white font-bold">{player?.partnerName || 'Неизвестно'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Уровень отношений</div>
                    <div className="text-white font-bold">{currentRelLevel?.name || 'Нет'} {currentRelLevel?.icon || ''}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Кольцо</div>
                    <div className="text-white font-bold">{player?.weddingRing?.name || 'Нет'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Место свадьбы</div>
                    <div className="text-white font-bold">{player?.weddingVenue?.name || 'Нет'}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="text-cyan-400" /> Бонусы
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-400">+{player?.marriageBonuses?.expBonus || 0}%</div>
                    <div className="text-slate-400 text-sm">Опыт</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-yellow-400">+{player?.marriageBonuses?.goldBonus || 0}%</div>
                    <div className="text-slate-400 text-sm">Золото</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-purple-400">+{player?.marriageBonuses?.luckBonus || 0}%</div>
                    <div className="text-slate-400 text-sm">Удача</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onDivorce}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                Развестись
              </button>
            </>
          ) : (
            <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800 text-center">
              <Heart size={64} className="mx-auto mb-4 text-pink-500 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">Вы не женаты</h3>
              <p className="text-slate-400 mb-6">Купите кольцо и сделайте предложение!</p>
              <button
                onClick={() => setActiveTab('rings')}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Купить кольцо
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rings' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Обручальные кольца</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WEDDING_RINGS.map(ring => (
                <div
                  key={ring.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRing?.id === ring.id
                      ? 'border-pink-500 bg-pink-900/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedRing(ring)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{ring.icon}</div>
                    <div>
                      <div className="font-bold text-white">{ring.name}</div>
                      <div className="text-sm text-slate-400">{ring.description}</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-bold mb-2">{ring.cost} золота</div>
                  <div className="text-xs text-slate-400">
                    Бонусы: +{ring.bonuses.expBonus}% опыт, +{ring.bonuses.goldBonus}% золото
                    {ring.bonuses.luckBonus && `, +${ring.bonuses.luckBonus}% удача`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRing && !player?.hasRing && (
            <button
              onClick={() => onBuyRing(selectedRing)}
              disabled={player?.gold < selectedRing.cost}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Купить за {selectedRing.cost} золота
            </button>
          )}

          {player?.hasRing && !player?.isMarried && (
            <button
              onClick={() => onPropose(player?.purchasedRing)}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Сделать предложение (симуляция)
            </button>
          )}
        </div>
      )}

      {activeTab === 'wedding' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Места проведения свадьбы</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WEDDING_VENUES.map(venue => (
                <div
                  key={venue.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedVenue?.id === venue.id
                      ? 'border-pink-500 bg-pink-900/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedVenue(venue)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{venue.icon}</div>
                    <div>
                      <div className="font-bold text-white">{venue.name}</div>
                      <div className="text-sm text-slate-400">{venue.description}</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-bold mb-2">{venue.cost} золота</div>
                  <div className="text-xs text-green-400">{venue.bonuses.blessing}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedVenue && player?.hasRing && !player?.isMarried && (
            <button
              onClick={() => onOrganizeWedding(selectedVenue)}
              disabled={player?.gold < selectedVenue.cost}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              Организовать свадьбу за {selectedVenue.cost} золота
            </button>
          )}
        </div>
      )}

      {activeTab === 'gifts' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Подарки для партнера</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WEDDING_GIFTS.map(gift => (
                <div
                  key={gift.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedGift?.id === gift.id
                      ? 'border-pink-500 bg-pink-900/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{gift.icon}</div>
                    <div>
                      <div className="font-bold text-white">{gift.name}</div>
                      <div className="text-sm text-slate-400">{gift.description}</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-bold mb-2">{gift.cost} золота</div>
                  <div className="text-xs text-green-400">{gift.effect}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedGift && player?.isMarried && (
            <button
              onClick={() => onGiveGift(selectedGift)}
              disabled={player?.gold < selectedGift.cost}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              Подарить за {selectedGift.cost} золота
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MarriageScreen;
