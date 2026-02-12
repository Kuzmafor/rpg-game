import { REPUTATION_LEVELS, FACTIONS, FACTION_QUESTS, FACTION_REWARDS } from '../constants/factionConstants';

/**
 * Получить текущий уровень репутации по значению
 * @param {number} value - Значение репутации
 * @returns {object} - Объект уровня репутации
 */
export const getReputationLevel = (value) => {
  for (const level of REPUTATION_LEVELS) {
    if (value >= level.minValue && value < level.maxValue) {
      return level;
    }
  }
  // Если значение превышает максимум, возвращаем последний уровень
  return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1];
};

/**
 * Инициализировать репутацию игрока со всеми фракциями
 * @returns {object} - Объект с репутацией для всех фракций
 */
export const initializeFactionReputation = () => {
  const reputation = {};
  FACTIONS.forEach(faction => {
    reputation[faction.id] = {
      value: 0,
      level: 'neutral'
    };
  });
  return reputation;
};

/**
 * Получить прогресс до следующего уровня репутации
 * @param {number} currentValue - Текущее значение репутации
 * @returns {object} - { current, max, percent }
 */
export const getReputationProgress = (currentValue) => {
  const currentLevel = getReputationLevel(currentValue);
  const current = currentValue - currentLevel.minValue;
  const max = currentLevel.maxValue - currentLevel.minValue;
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  
  return { current, max, percent };
};

/**
 * Проверить, достаточно ли репутации для уровня
 * @param {number} currentValue - Текущее значение репутации
 * @param {string} requiredLevelId - ID требуемого уровня
 * @returns {boolean}
 */
export const hasRequiredReputation = (currentValue, requiredLevelId) => {
  const requiredLevel = REPUTATION_LEVELS.find(l => l.id === requiredLevelId);
  if (!requiredLevel) return false;
  
  return currentValue >= requiredLevel.minValue;
};

/**
 * Получить фракцию по ID
 * @param {string} factionId - ID фракции
 * @returns {object|null}
 */
export const getFactionById = (factionId) => {
  return FACTIONS.find(f => f.id === factionId) || null;
};

/**
 * Получить конфликтующую фракцию
 * @param {string} factionId - ID фракции
 * @returns {object|null}
 */
export const getConflictingFaction = (factionId) => {
  const faction = getFactionById(factionId);
  if (!faction || !faction.conflictsWith) return null;
  
  return getFactionById(faction.conflictsWith);
};

/**
 * Обновить репутацию с фракцией
 * @param {object} player - Объект игрока
 * @param {function} setPlayer - Функция обновления состояния игрока
 * @param {function} addNotification - Функция добавления уведомления
 * @param {string} factionId - ID фракции
 * @param {number} amount - Количество репутации для добавления
 */
export const updateFactionReputation = (player, setPlayer, addNotification, factionId, amount) => {
  setPlayer(prev => {
    const currentRep = prev.factionReputation[factionId] || { value: 0, level: 'neutral' };
    const newValue = Math.max(-12000, Math.min(999999, currentRep.value + amount));
    const newLevel = getReputationLevel(newValue);
    
    const updatedRep = {
      ...prev.factionReputation,
      [factionId]: {
        value: newValue,
        level: newLevel.id
      }
    };
    
    // Применить конфликты фракций
    const faction = getFactionById(factionId);
    if (faction?.conflictsWith && amount > 0) {
      const conflictAmount = Math.floor(amount * 0.4); // 40% от полученной репутации
      const conflictRep = updatedRep[faction.conflictsWith] || { value: 0, level: 'neutral' };
      const conflictNewValue = Math.max(-12000, conflictRep.value - conflictAmount);
      const conflictNewLevel = getReputationLevel(conflictNewValue);
      
      updatedRep[faction.conflictsWith] = {
        value: conflictNewValue,
        level: conflictNewLevel.id
      };
      
      if (conflictAmount > 0) {
        const conflictingFaction = getFactionById(faction.conflictsWith);
        addNotification(
          `Репутация с ${conflictingFaction?.name} понижена на ${conflictAmount}`,
          'warning'
        );
      }
    }
    
    // Уведомление о повышении уровня
    if (newLevel.id !== currentRep.level && amount > 0) {
      addNotification(
        `Новый уровень репутации с ${faction.name}: ${newLevel.name}!`,
        'legendary',
        5000
      );
    }
    
    return {
      ...prev,
      factionReputation: updatedRep
    };
  });
};


/**
 * Проверить доступность задания
 * @param {object} quest - Объект задания
 * @param {object} player - Объект игрока
 * @returns {object} - { canAccept: boolean, reason: string }
 */
export const canAcceptQuest = (quest, player) => {
  const currentRep = player.factionReputation[quest.factionId] || { value: 0, level: 'neutral' };
  const requiredLevel = REPUTATION_LEVELS.find(l => l.id === quest.requiredRepLevel);
  
  // Проверка уровня репутации
  if (currentRep.value < requiredLevel.minValue) {
    return { canAccept: false, reason: `Требуется репутация: ${requiredLevel.name}` };
  }
  
  // Проверка на выполнение
  if (player.completedFactionQuests?.includes(quest.id) && !quest.isDaily) {
    return { canAccept: false, reason: 'Задание уже выполнено' };
  }
  
  // Проверка ежедневного задания
  if (quest.isDaily) {
    const dailyQuest = player.dailyFactionQuests?.find(dq => dq.questId === quest.id);
    if (dailyQuest?.completedToday) {
      return { canAccept: false, reason: 'Выполнено сегодня' };
    }
  }
  
  return { canAccept: true };
};


/**
 * Выполнить задание фракции
 * @param {object} quest - Объект задания
 * @param {object} player - Объект игрока
 * @param {function} setPlayer - Функция обновления состояния игрока
 * @param {function} addNotification - Функция добавления уведомления
 * @param {function} addLog - Функция добавления лога
 * @param {array} ITEMS_DB - База данных предметов
 */
export const completeFactionQuest = (quest, player, setPlayer, addNotification, addLog, ITEMS_DB) => {
  const { canAccept, reason } = canAcceptQuest(quest, player);
  
  if (!canAccept) {
    addNotification(reason, 'warning');
    return;
  }
  
  // Выдать награды
  const rewards = quest.rewards;
  
  setPlayer(prev => {
    let updatedPlayer = {
      ...prev,
      gold: prev.gold + rewards.gold,
      exp: prev.exp + rewards.exp
    };
    
    // Добавить предмет, если есть
    if (rewards.item) {
      const item = ITEMS_DB.find(i => i.id === rewards.item.id);
      if (item) {
        updatedPlayer.inventory = [...updatedPlayer.inventory, { ...item, uid: Date.now() }];
        addNotification(`Получен предмет: ${item.name}`, 'success');
      }
    }
    
    // Отметить задание как выполненное
    if (!quest.isDaily) {
      updatedPlayer.completedFactionQuests = [...(updatedPlayer.completedFactionQuests || []), quest.id];
    } else {
      // Обновить ежедневное задание
      const dailyIndex = updatedPlayer.dailyFactionQuests?.findIndex(dq => dq.questId === quest.id);
      if (dailyIndex >= 0) {
        updatedPlayer.dailyFactionQuests = [...updatedPlayer.dailyFactionQuests];
        updatedPlayer.dailyFactionQuests[dailyIndex] = {
          ...updatedPlayer.dailyFactionQuests[dailyIndex],
          completedToday: true
        };
      }
    }
    
    return updatedPlayer;
  });
  
  // Обновить репутацию (с учетом бонусов)
  let reputationGain = rewards.reputation;
  if (quest.isDaily) {
    reputationGain = Math.floor(reputationGain * 1.5); // Бонус за ежедневное задание
  }
  
  updateFactionReputation(player, setPlayer, addNotification, quest.factionId, reputationGain);
  
  addNotification(`Задание выполнено! +${reputationGain} репутации`, 'success');
  addLog(`Выполнено задание: ${quest.name}`, 'good');
};


/**
 * Получить товары торговца фракции
 * @param {string} factionId - ID фракции
 * @param {object} player - Объект игрока
 * @returns {array} - Массив доступных наград
 */
export const getFactionMerchantItems = (factionId, player) => {
  const currentRep = player.factionReputation[factionId] || { value: 0, level: 'neutral' };
  
  return FACTION_REWARDS
    .filter(reward => reward.factionId === factionId)
    .map(reward => {
      const requiredLevel = REPUTATION_LEVELS.find(l => l.id === reward.requiredRepLevel);
      const isUnlocked = currentRep.value >= requiredLevel.minValue;
      
      return {
        ...reward,
        isUnlocked,
        requiredLevel: requiredLevel.name
      };
    });
};

/**
 * Получить скидку на основе уровня репутации
 * @param {string} factionId - ID фракции
 * @param {object} player - Объект игрока
 * @returns {number} - Скидка от 0 до 0.20
 */
export const getReputationDiscount = (factionId, player) => {
  const currentRep = player.factionReputation[factionId] || { value: 0, level: 'neutral' };
  const level = getReputationLevel(currentRep.value);
  
  const discountMap = {
    'hated': 0,
    'hostile': 0,
    'neutral': 0,
    'friendly': 0.05,
    'honored': 0.10,
    'revered': 0.15,
    'exalted': 0.20
  };
  
  return discountMap[level.id] || 0;
};

/**
 * Купить награду у торговца фракции
 * @param {object} reward - Объект награды
 * @param {object} player - Объект игрока
 * @param {function} setPlayer - Функция обновления состояния игрока
 * @param {function} addNotification - Функция добавления уведомления
 * @param {function} addLog - Функция добавления лога
 */
export const purchaseFactionReward = (reward, player, setPlayer, addNotification, addLog) => {
  const currentRep = player.factionReputation[reward.factionId] || { value: 0, level: 'neutral' };
  const requiredLevel = REPUTATION_LEVELS.find(l => l.id === reward.requiredRepLevel);
  
  // Проверка репутации
  if (currentRep.value < requiredLevel.minValue) {
    addNotification(`Требуется репутация: ${requiredLevel.name}`, 'error');
    return;
  }
  
  // Применить скидку
  const discount = getReputationDiscount(reward.factionId, player);
  const finalCost = Math.floor(reward.cost * (1 - discount));
  
  // Проверка золота
  if (player.gold < finalCost) {
    addNotification('Недостаточно золота!', 'error');
    return;
  }
  
  // Списать золото и добавить предмет
  setPlayer(prev => ({
    ...prev,
    gold: prev.gold - finalCost,
    inventory: [...prev.inventory, { ...reward.item, uid: Date.now() }]
  }));
  
  const discountText = discount > 0 ? ` (скидка ${Math.floor(discount * 100)}%)` : '';
  addNotification(`Куплено: ${reward.name} за ${finalCost} золота${discountText}`, 'success');
  addLog(`Куплено: ${reward.name}`, 'good');
};


/**
 * Мигрировать данные фракций для существующих сохранений
 * @param {object} playerData - Данные игрока
 * @returns {object} - Обновленные данные игрока
 */
export const migrateFactionData = (playerData) => {
  // Если данные фракций уже есть, ничего не делаем
  if (playerData.factionReputation) {
    return playerData;
  }
  
  // Инициализируем репутацию со всеми фракциями
  const factionReputation = initializeFactionReputation();
  
  // Инициализируем массивы заданий
  const completedFactionQuests = [];
  const dailyFactionQuests = FACTION_QUESTS
    .filter(q => q.isDaily)
    .map(q => ({
      questId: q.id,
      factionId: q.factionId,
      completedToday: false
    }));
  
  return {
    ...playerData,
    factionReputation,
    completedFactionQuests,
    dailyFactionQuests,
    lastDailyReset: Date.now()
  };
};
