// Утилиты для системы свадеб

import { WEDDING_RINGS, WEDDING_VENUES, MARRIAGE_BONUSES, RELATIONSHIP_LEVELS, ANNIVERSARIES } from '../constants/marriageConstants';

/**
 * Получить уровень отношений по количеству очков
 */
export const getRelationshipLevel = (points) => {
  const levels = [...RELATIONSHIP_LEVELS].reverse();
  const level = levels.find(l => points >= l.minPoints) || RELATIONSHIP_LEVELS[0];
  return level;
};

/**
 * Проверить, может ли игрок сделать предложение
 */
export const canPropose = (player, targetPlayer) => {
  // Проверки
  if (player.isMarried) {
    return { success: false, message: 'Вы уже женаты!' };
  }
  
  if (targetPlayer.isMarried) {
    return { success: false, message: 'Этот игрок уже женат!' };
  }
  
  if (player.level < 10) {
    return { success: false, message: 'Нужен 10 уровень для предложения!' };
  }
  
  if (!player.hasRing) {
    return { success: false, message: 'Нужно купить обручальное кольцо!' };
  }
  
  const relationshipLevel = getRelationshipLevel(player.relationshipPoints?.[targetPlayer.id] || 0);
  if (relationshipLevel.level < 4) {
    return { success: false, message: 'Недостаточный уровень отношений! Нужен уровень "Влюбленные"' };
  }
  
  return { success: true };
};

/**
 * Сделать предложение
 */
export const proposeMarriage = (player, targetPlayer, ringId) => {
  const canProposeResult = canPropose(player, targetPlayer);
  if (!canProposeResult.success) {
    return canProposeResult;
  }
  
  const ring = WEDDING_RINGS.find(r => r.id === ringId);
  if (!ring) {
    return { success: false, message: 'Кольцо не найдено!' };
  }
  
  // Создаем предложение
  const proposal = {
    from: player.id,
    fromName: player.name,
    to: targetPlayer.id,
    toName: targetPlayer.name,
    ring: ring,
    timestamp: Date.now(),
    status: 'pending'
  };
  
  return { success: true, proposal };
};

/**
 * Принять предложение
 */
export const acceptProposal = (proposal) => {
  return {
    success: true,
    message: 'Предложение принято! Теперь вы можете организовать свадьбу!',
    proposal: {
      ...proposal,
      status: 'accepted'
    }
  };
};

/**
 * Отклонить предложение
 */
export const rejectProposal = (proposal) => {
  return {
    success: true,
    message: 'Предложение отклонено',
    proposal: {
      ...proposal,
      status: 'rejected'
    }
  };
};

/**
 * Организовать свадьбу
 */
export const organizeWedding = (player1, player2, venueId, guestList = []) => {
  const venue = WEDDING_VENUES.find(v => v.id === venueId);
  if (!venue) {
    return { success: false, message: 'Место проведения не найдено!' };
  }
  
  if (player1.gold < venue.cost) {
    return { success: false, message: 'Недостаточно золота для организации свадьбы!' };
  }
  
  if (guestList.length > venue.capacity) {
    return { success: false, message: `Слишком много гостей! Максимум: ${venue.capacity}` };
  }
  
  const wedding = {
    id: Date.now(),
    spouse1: { id: player1.id, name: player1.name },
    spouse2: { id: player2.id, name: player2.name },
    venue: venue,
    guests: guestList,
    date: Date.now(),
    status: 'scheduled'
  };
  
  return { success: true, wedding, cost: venue.cost };
};

/**
 * Провести свадебную церемонию
 */
export const performWeddingCeremony = (wedding) => {
  return {
    success: true,
    message: 'Поздравляем! Вы теперь муж и жена!',
    marriage: {
      spouse1: wedding.spouse1,
      spouse2: wedding.spouse2,
      weddingDate: Date.now(),
      venue: wedding.venue,
      ring: wedding.ring,
      relationshipPoints: 10000,
      sharedBank: {
        gold: 0,
        items: []
      },
      bonuses: {
        ...MARRIAGE_BONUSES.base,
        ...wedding.venue.bonuses
      }
    }
  };
};

/**
 * Получить бонусы брака
 */
export const getMarriageBonuses = (player, isNearPartner = false) => {
  if (!player.isMarried) {
    return null;
  }
  
  const baseBonuses = MARRIAGE_BONUSES.base;
  const ringBonuses = player.marriageRing?.bonuses || {};
  const nearbyBonuses = isNearPartner ? MARRIAGE_BONUSES.nearbyBonus : {};
  
  return {
    expBonus: (baseBonuses.expBonus || 0) + (ringBonuses.expBonus || 0) + (nearbyBonuses.expBonus || 0),
    goldBonus: (baseBonuses.goldBonus || 0) + (ringBonuses.goldBonus || 0) + (nearbyBonuses.goldBonus || 0),
    luckBonus: (ringBonuses.luckBonus || 0)
  };
};

/**
 * Добавить очки отношений
 */
export const addRelationshipPoints = (currentPoints, amount) => {
  return Math.min(currentPoints + amount, 100000); // Максимум 100000 очков
};

/**
 * Подарить подарок партнеру
 */
export const giveGift = (player, gift) => {
  if (player.gold < gift.cost) {
    return { success: false, message: 'Недостаточно золота!' };
  }
  
  return {
    success: true,
    message: `Вы подарили ${gift.name}!`,
    relationshipPoints: parseInt(gift.effect.match(/\d+/)[0])
  };
};

/**
 * Проверить годовщину
 */
export const checkAnniversary = (weddingDate) => {
  const now = Date.now();
  const daysSinceWedding = Math.floor((now - weddingDate) / (1000 * 60 * 60 * 24));
  const yearsSinceWedding = Math.floor(daysSinceWedding / 365);
  
  const anniversary = ANNIVERSARIES.find(a => a.years === yearsSinceWedding);
  
  if (anniversary && daysSinceWedding % 365 === 0) {
    return {
      hasAnniversary: true,
      anniversary: anniversary
    };
  }
  
  return { hasAnniversary: false };
};

/**
 * Телепортация к партнеру
 */
export const teleportToPartner = (player, lastTeleport) => {
  const now = Date.now();
  const cooldown = MARRIAGE_BONUSES.teleport.cooldown;
  
  if (lastTeleport && (now - lastTeleport) < cooldown) {
    const remainingTime = Math.ceil((cooldown - (now - lastTeleport)) / 60000);
    return {
      success: false,
      message: `Телепортация доступна через ${remainingTime} минут`
    };
  }
  
  return {
    success: true,
    message: 'Вы телепортировались к партнеру!',
    timestamp: now
  };
};

/**
 * Развод (если нужно)
 */
export const divorce = (player, partner) => {
  return {
    success: true,
    message: 'Вы развелись. Все совместные бонусы потеряны.',
    penalties: {
      goldLoss: Math.floor((player.gold + partner.gold) * 0.1), // 10% от общего золота
      relationshipPoints: 0
    }
  };
};

/**
 * Получить информацию о браке
 */
export const getMarriageInfo = (player) => {
  if (!player.isMarried) {
    return null;
  }
  
  const daysSinceWedding = Math.floor((Date.now() - player.weddingDate) / (1000 * 60 * 60 * 24));
  const relationshipLevel = getRelationshipLevel(player.relationshipPoints || 0);
  const bonuses = getMarriageBonuses(player);
  
  return {
    partnerName: player.partnerName,
    daysTogether: daysSinceWedding,
    relationshipLevel: relationshipLevel,
    bonuses: bonuses,
    sharedBankGold: player.sharedBank?.gold || 0,
    venue: player.weddingVenue
  };
};

/**
 * Инициализация данных брака для нового игрока
 */
export const initializeMarriageData = () => {
  return {
    isMarried: false,
    partnerName: null,
    partnerId: null,
    weddingDate: null,
    weddingVenue: null,
    marriageRing: null,
    relationshipPoints: 0,
    sharedBank: {
      gold: 0,
      items: []
    },
    proposals: [],
    lastTeleport: null,
    anniversariesClaimed: []
  };
};
