import React, { useState } from 'react';
import { Users, Gift, Trophy, TrendingUp, Copy, UserPlus } from 'lucide-react';

const TIERS = {
  Bronze: { color: 'from-orange-700 to-orange-900', icon: '🥉', expBonus: 5, goldBonus: 3, req: { referees: 0, level: 0 } },
  Silver: { color: 'from-gray-400 to-gray-600', icon: '🥈', expBonus: 7, goldBonus: 5, req: { referees: 5, level: 25 } },
  Gold: { color: 'from-yellow-400 to-yellow-600', icon: '🥇', expBonus: 10, goldBonus: 7, req: { referees: 10, level: 100 } },
  Platinum: { color: 'from-cyan-400 to-cyan-600', icon: '💎', expBonus: 15, goldBonus: 10, req: { referees: 25, level: 500 } },
  Diamond: { color: 'from-purple-400 to-purple-600', icon: '👑', expBonus: 20, goldBonus: 15, req: { referees: 50, level: 2000 } }
};

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const ACHIEVEMENTS = [
  { id: 'first', name: 'Первый друг', req: 1, reward: 100, icon: '🎉' },
  { id: 'social', name: 'Социальная бабочка', req: 5, reward: 500, icon: '🦋' },
  { id: 'builder', name: 'Строитель сообщества', req: 10, reward: 1500, icon: '🏗️' },
  { id: 'master', name: 'Мастер гильдии', req: 25, reward: 5000, icon: '⚔️' },
  { id: 'legend', name: 'Легенда рекрутинга', req: 50, reward: 15000, icon: '🌟' }
];

const ReferralPanel = ({ player, onAddReferee, onCopyCode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const tier = TIERS[player?.referralTier || 'Bronze'];
  const stats = player?.referralStats || { totalReferees: 0, totalExpEarned: 0, totalGoldEarned: 0, combinedLevel: 0 };
  const referees = player?.referees || [];
  const achievements = player?.referralAchievements || [];

  // Получить следующий уровень
  const currentTierIndex = TIER_ORDER.indexOf(player?.referralTier || 'Bronze');
  const nextTierName = TIER_ORDER[currentTierIndex + 1];
  const nextTier = nextTierName ? TIERS[nextTierName] : null;

  // Прогресс до следующего уровня
  const getProgress = () => {
    if (!nextTier) return 100;
    const refProgress = Math.min(100, (stats.totalReferees / nextTier.req.referees) * 100);
    const levelProgress = Math.min(100, (stats.combinedLevel / nextTier.req.level) * 100);
    return Math.min(refProgress, levelProgress);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-slate-900 rounded-2xl p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Рекрутинг</h2>
              <p className="text-blue-300 text-sm">Приглашай друзей и получай награды</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-slate-900/70 px-4 py-2 rounded-xl border border-blue-500/30">
              <div className="text-xs text-blue-300">Уровень</div>
              <div className="text-lg font-black text-white flex items-center gap-2">
                {tier.icon} {player?.referralTier || 'Bronze'}
              </div>
            </div>
            <div className="bg-slate-900/70 px-4 py-2 rounded-xl border border-purple-500/30">
              <div className="text-xs text-purple-300">Друзей</div>
              <div className="text-lg font-black text-white">{stats.totalReferees}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
        {['overview', 'referees', 'achievements'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' && 'Обзор'}
            {tab === 'referees' && 'Друзья'}
            {tab === 'achievements' && 'Достижения'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Referral Code */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Твой реферальный код</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-800 px-4 py-3 rounded-lg font-mono text-2xl text-center text-white border-2 border-blue-500/50">
                {player?.referralCode || 'XXXX-XXXX'}
              </div>
              <button
                onClick={onCopyCode}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <Copy size={20} /> Копировать
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" /> Статистика
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400">{stats.totalReferees}</div>
                <div className="text-slate-400 text-sm">Приглашено</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400">+{stats.totalExpEarned}</div>
                <div className="text-slate-400 text-sm">Опыт получено</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-400">+{stats.totalGoldEarned}</div>
                <div className="text-slate-400 text-sm">Золото получено</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{stats.combinedLevel}</div>
                <div className="text-slate-400 text-sm">Общий уровень</div>
              </div>
            </div>
          </div>

          {/* Bonuses */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Текущие бонусы</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-black text-green-400">+{tier.expBonus}%</div>
                <div className="text-slate-400 text-sm">Опыт от друзей</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">+{tier.goldBonus}%</div>
                <div className="text-slate-400 text-sm">Золото от друзей</div>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Прогресс до {nextTierName} {nextTier.icon}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Друзей</span>
                    <span className="text-white font-bold">{stats.totalReferees} / {nextTier.req.referees}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalReferees / nextTier.req.referees) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Общий уровень</span>
                    <span className="text-white font-bold">{stats.combinedLevel} / {nextTier.req.level}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-cyan-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.combinedLevel / nextTier.req.level) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'referees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Приглашенные друзья</h3>
            <button
              onClick={onAddReferee}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <UserPlus size={20} /> Добавить (симуляция)
            </button>
          </div>

          {referees.length === 0 ? (
            <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800 text-center">
              <Users size={64} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg">Пока нет приглашенных друзей</p>
              <p className="text-slate-500 text-sm mt-2">Поделись своим кодом!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referees.map((ref, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white">{ref.name}</div>
                    <div className="text-sm text-slate-400">Ур. {ref.currentLevel}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Присоединился: {new Date(ref.joinDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Достижения рекрутинга</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-4 border-2 ${
                    unlocked
                      ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/50'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{ach.icon}</div>
                    <div>
                      <div className={`font-bold ${unlocked ? 'text-yellow-400' : 'text-slate-400'}`}>
                        {ach.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Пригласи {ach.req} {ach.req === 1 ? 'друга' : 'друзей'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-400">Награда: {ach.reward} золота</div>
                  {!unlocked && (
                    <div className="mt-2 text-xs text-slate-500">
                      Прогресс: {stats.totalReferees}/{ach.req}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPanel;
