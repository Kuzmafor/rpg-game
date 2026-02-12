import { Shield, Skull, Coins, Target, Sparkles } from 'lucide-react';

// ФРАКЦИИ
export const FACTIONS = [
  {
    id: 'order_of_light',
    name: 'Орден Света',
    description: 'Благородные паладины, защищающие мир от тьмы',
    icon: Shield,
    color: 'bg-yellow-500',
    conflictsWith: 'cult_of_darkness',
    theme: {
      primary: 'text-yellow-400',
      secondary: 'bg-yellow-900/20',
      border: 'border-yellow-600'
    },
    benefits: [
      'Доступ к священному оружию',
      'Бонусы против нежити',
      'Скидки на зелья лечения'
    ]
  },
  {
    id: 'cult_of_darkness',
    name: 'Культ Тьмы',
    description: 'Темные маги, изучающие запретную магию',
    icon: Skull,
    color: 'bg-purple-700',
    conflictsWith: 'order_of_light',
    theme: {
      primary: 'text-purple-400',
      secondary: 'bg-purple-900/20',
      border: 'border-purple-600'
    },
    benefits: [
      'Доступ к темной магии',
      'Бонусы к урону заклинаниями',
      'Уникальные проклятия'
    ]
  },
  {
    id: 'merchants_guild',
    name: 'Гильдия Торговцев',
    description: 'Богатые купцы, контролирующие торговые пути',
    icon: Coins,
    color: 'bg-green-600',
    conflictsWith: null,
    theme: {
      primary: 'text-green-400',
      secondary: 'bg-green-900/20',
      border: 'border-green-600'
    },
    benefits: [
      'Скидки у всех торговцев',
      'Бонусы к золоту',
      'Доступ к редким товарам'
    ]
  },
  {
    id: 'rangers_lodge',
    name: 'Ложа Следопытов',
    description: 'Опытные охотники и мастера выживания',
    icon: Target,
    color: 'bg-emerald-700',
    conflictsWith: null,
    theme: {
      primary: 'text-emerald-400',
      secondary: 'bg-emerald-900/20',
      border: 'border-emerald-600'
    },
    benefits: [
      'Бонусы к сбору ресурсов',
      'Доступ к луками и ловушкам',
      'Увеличенный шанс находок'
    ]
  },
  {
    id: 'mages_circle',
    name: 'Круг Магов',
    description: 'Ученые маги, хранители древних знаний',
    icon: Sparkles,
    color: 'bg-blue-600',
    conflictsWith: null,
    theme: {
      primary: 'text-blue-400',
      secondary: 'bg-blue-900/20',
      border: 'border-blue-600'
    },
    benefits: [
      'Доступ к магическим предметам',
      'Бонусы к опыту',
      'Уникальные зачарования'
    ]
  }
];

// УРОВНИ РЕПУТАЦИИ
export const REPUTATION_LEVELS = [
  { 
    id: 'hated', 
    name: 'Враждебный', 
    minValue: -12000, 
    maxValue: -6000,
    color: 'text-red-500',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-600'
  },
  { 
    id: 'hostile', 
    name: 'Недружелюбный', 
    minValue: -6000, 
    maxValue: -3000,
    color: 'text-orange-500',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-600'
  },
  { 
    id: 'neutral', 
    name: 'Нейтральный', 
    minValue: -3000, 
    maxValue: 3000,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-600'
  },
  { 
    id: 'friendly', 
    name: 'Дружелюбный', 
    minValue: 3000, 
    maxValue: 9000,
    color: 'text-green-500',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-600'
  },
  { 
    id: 'honored', 
    name: 'Уважаемый', 
    minValue: 9000, 
    maxValue: 21000,
    color: 'text-blue-500',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-600'
  },
  { 
    id: 'revered', 
    name: 'Почитаемый', 
    minValue: 21000, 
    maxValue: 42000,
    color: 'text-purple-500',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-600'
  },
  { 
    id: 'exalted', 
    name: 'Превознесенный', 
    minValue: 42000, 
    maxValue: 999999,
    color: 'text-pink-500',
    bgColor: 'bg-pink-900/20',
    borderColor: 'border-pink-600'
  }
];

// ЗАДАНИЯ ФРАКЦИЙ
export const FACTION_QUESTS = [
  // ОРДЕН СВЕТА
  {
    id: 'light_1',
    factionId: 'order_of_light',
    name: 'Очищение леса',
    description: 'Победите 5 нежити в любой локации',
    type: 'kill',
    target: { enemyTypes: ['Скелет-Воин', 'Вампир'], count: 5 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 250,
      gold: 100,
      exp: 150
    },
    isDaily: false
  },
  {
    id: 'light_2',
    factionId: 'order_of_light',
    name: 'Сбор священных трав',
    description: 'Соберите 10 единиц красной травы',
    type: 'collect',
    target: { resourceId: 'red_herb', count: 10 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 200,
      gold: 80,
      exp: 100
    },
    isDaily: false
  },
  {
    id: 'light_3',
    factionId: 'order_of_light',
    name: 'Защита храма',
    description: 'Победите 3 врагов в Заброшенном Храме',
    type: 'kill_location',
    target: { locationId: 5, count: 3 },
    requiredRepLevel: 'friendly',
    rewards: {
      reputation: 400,
      gold: 200,
      exp: 300,
      item: { id: 14, name: 'Посох мага' }
    },
    isDaily: false
  },
  {
    id: 'light_daily_1',
    factionId: 'order_of_light',
    name: 'Ежедневное благословение',
    description: 'Победите 3 любых врагов',
    type: 'kill',
    target: { count: 3 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 300,
      gold: 150,
      exp: 200
    },
    isDaily: true
  },
  
  // КУЛЬТ ТЬМЫ
  {
    id: 'dark_1',
    factionId: 'cult_of_darkness',
    name: 'Сбор темной энергии',
    description: 'Соберите 5 кристаллов',
    type: 'collect',
    target: { resourceId: 'crystal', count: 5 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 250,
      gold: 120,
      exp: 150
    },
    isDaily: false
  },
  {
    id: 'dark_2',
    factionId: 'cult_of_darkness',
    name: 'Ритуал тьмы',
    description: 'Создайте 3 зелья здоровья',
    type: 'craft',
    target: { recipeId: 2, count: 3 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 300,
      gold: 100,
      exp: 200
    },
    isDaily: false
  },
  {
    id: 'dark_3',
    factionId: 'cult_of_darkness',
    name: 'Исследование темного леса',
    description: 'Сделайте 20 шагов в Темном Лесу',
    type: 'explore',
    target: { locationId: 7, steps: 20 },
    requiredRepLevel: 'friendly',
    rewards: {
      reputation: 500,
      gold: 250,
      exp: 400
    },
    isDaily: false
  },
  
  // ГИЛЬДИЯ ТОРГОВЦЕВ
  {
    id: 'merchant_1',
    factionId: 'merchants_guild',
    name: 'Торговый путь',
    description: 'Заработайте 500 золота',
    type: 'earn_gold',
    target: { amount: 500 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 200,
      gold: 100,
      exp: 100
    },
    isDaily: false
  },
  {
    id: 'merchant_2',
    factionId: 'merchants_guild',
    name: 'Поставка ресурсов',
    description: 'Соберите 15 единиц древесины',
    type: 'collect',
    target: { resourceId: 'wood', count: 15 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 250,
      gold: 150,
      exp: 150
    },
    isDaily: false
  },
  {
    id: 'merchant_3',
    factionId: 'merchants_guild',
    name: 'Защита каравана',
    description: 'Победите 10 бандитов',
    type: 'kill',
    target: { enemyTypes: ['Бандит'], count: 10 },
    requiredRepLevel: 'friendly',
    rewards: {
      reputation: 600,
      gold: 400,
      exp: 500
    },
    isDaily: false
  },
  
  // ЛОЖА СЛЕДОПЫТОВ
  {
    id: 'ranger_1',
    factionId: 'rangers_lodge',
    name: 'Охота на волков',
    description: 'Победите 5 лесных волков',
    type: 'kill',
    target: { enemyTypes: ['Лесной Волк'], count: 5 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 250,
      gold: 100,
      exp: 150
    },
    isDaily: false
  },
  {
    id: 'ranger_2',
    factionId: 'rangers_lodge',
    name: 'Сбор трав',
    description: 'Соберите 20 единиц любых трав',
    type: 'collect_category',
    target: { category: 'herb', count: 20 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 300,
      gold: 120,
      exp: 180
    },
    isDaily: false
  },
  {
    id: 'ranger_3',
    factionId: 'rangers_lodge',
    name: 'Исследование дикой природы',
    description: 'Посетите 3 различные локации',
    type: 'visit_locations',
    target: { count: 3 },
    requiredRepLevel: 'friendly',
    rewards: {
      reputation: 500,
      gold: 200,
      exp: 350
    },
    isDaily: false
  },
  
  // КРУГ МАГОВ
  {
    id: 'mage_1',
    factionId: 'mages_circle',
    name: 'Сбор магических кристаллов',
    description: 'Соберите 8 кристаллов',
    type: 'collect',
    target: { resourceId: 'crystal', count: 8 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 300,
      gold: 150,
      exp: 200
    },
    isDaily: false
  },
  {
    id: 'mage_2',
    factionId: 'mages_circle',
    name: 'Изучение алхимии',
    description: 'Создайте 5 любых зелий',
    type: 'craft_category',
    target: { category: 'consumable', count: 5 },
    requiredRepLevel: 'neutral',
    rewards: {
      reputation: 350,
      gold: 100,
      exp: 250
    },
    isDaily: false
  },
  {
    id: 'mage_3',
    factionId: 'mages_circle',
    name: 'Победа над магическими существами',
    description: 'Победите 5 элементалей',
    type: 'kill',
    target: { enemyTypes: ['Огненный Элементаль', 'Ледяной Голем', 'Воздушный Элементаль'], count: 5 },
    requiredRepLevel: 'friendly',
    rewards: {
      reputation: 550,
      gold: 300,
      exp: 450
    },
    isDaily: false
  }
];

// НАГРАДЫ ФРАКЦИЙ
export const FACTION_REWARDS = [
  // ОРДЕН СВЕТА
  {
    id: 'light_reward_1',
    factionId: 'order_of_light',
    name: 'Священный меч',
    type: 'weapon',
    requiredRepLevel: 'friendly',
    cost: 500,
    item: {
      id: 101,
      name: 'Священный меч',
      type: 'weapon',
      val: 18,
      rarity: 'rare',
      effect: '+10% урона против нежити'
    }
  },
  {
    id: 'light_reward_2',
    factionId: 'order_of_light',
    name: 'Доспехи паладина',
    type: 'armor',
    requiredRepLevel: 'honored',
    cost: 1000,
    item: {
      id: 102,
      name: 'Доспехи паладина',
      type: 'armor',
      val: 20,
      rarity: 'epic',
      effect: '+15 к максимальному здоровью'
    }
  },
  {
    id: 'light_reward_3',
    factionId: 'order_of_light',
    name: 'Благословение света',
    type: 'consumable',
    requiredRepLevel: 'revered',
    cost: 300,
    item: {
      id: 103,
      name: 'Благословение света',
      type: 'consumable',
      val: 0,
      rarity: 'epic',
      effect: '+20% к опыту на 30 минут'
    }
  },
  {
    id: 'light_reward_4',
    factionId: 'order_of_light',
    name: 'Щит веры',
    type: 'armor',
    requiredRepLevel: 'exalted',
    cost: 3000,
    item: {
      id: 104,
      name: 'Щит веры',
      type: 'armor',
      val: 30,
      rarity: 'legendary',
      effect: 'Блокирует 20% входящего урона'
    }
  },
  {
    id: 'light_reward_5',
    factionId: 'order_of_light',
    name: 'Табард Ордена',
    type: 'cosmetic',
    requiredRepLevel: 'friendly',
    cost: 200,
    item: {
      id: 105,
      name: 'Табард Ордена Света',
      type: 'cosmetic',
      rarity: 'uncommon',
      effect: 'Косметический предмет'
    }
  },
  
  // КУЛЬТ ТЬМЫ
  {
    id: 'dark_reward_1',
    factionId: 'cult_of_darkness',
    name: 'Темный посох',
    type: 'weapon',
    requiredRepLevel: 'friendly',
    cost: 500,
    item: {
      id: 106,
      name: 'Темный посох',
      type: 'weapon',
      val: 22,
      rarity: 'rare',
      effect: '+15% урона заклинаниями'
    }
  },
  {
    id: 'dark_reward_2',
    factionId: 'cult_of_darkness',
    name: 'Мантия тьмы',
    type: 'armor',
    requiredRepLevel: 'honored',
    cost: 1000,
    item: {
      id: 107,
      name: 'Мантия тьмы',
      type: 'armor',
      val: 18,
      rarity: 'epic',
      effect: '+10 к максимальной энергии'
    }
  },
  {
    id: 'dark_reward_3',
    factionId: 'cult_of_darkness',
    name: 'Эликсир теней',
    type: 'consumable',
    requiredRepLevel: 'revered',
    cost: 300,
    item: {
      id: 108,
      name: 'Эликсир теней',
      type: 'consumable',
      val: 0,
      rarity: 'epic',
      effect: 'Невидимость: враги не атакуют 10 шагов'
    }
  },
  {
    id: 'dark_reward_4',
    factionId: 'cult_of_darkness',
    name: 'Проклятый клинок',
    type: 'weapon',
    requiredRepLevel: 'exalted',
    cost: 3000,
    item: {
      id: 109,
      name: 'Проклятый клинок',
      type: 'weapon',
      val: 40,
      rarity: 'legendary',
      effect: 'Вампиризм: восстанавливает 15% нанесенного урона'
    }
  },
  {
    id: 'dark_reward_5',
    factionId: 'cult_of_darkness',
    name: 'Маска культиста',
    type: 'cosmetic',
    requiredRepLevel: 'friendly',
    cost: 200,
    item: {
      id: 110,
      name: 'Маска Культа Тьмы',
      type: 'cosmetic',
      rarity: 'uncommon',
      effect: 'Косметический предмет'
    }
  },
  
  // ГИЛЬДИЯ ТОРГОВЦЕВ
  {
    id: 'merchant_reward_1',
    factionId: 'merchants_guild',
    name: 'Кошель торговца',
    type: 'accessory',
    requiredRepLevel: 'friendly',
    cost: 400,
    item: {
      id: 111,
      name: 'Кошель торговца',
      type: 'accessory',
      rarity: 'rare',
      effect: '+10% к получаемому золоту'
    }
  },
  {
    id: 'merchant_reward_2',
    factionId: 'merchants_guild',
    name: 'Торговая лицензия',
    type: 'accessory',
    requiredRepLevel: 'honored',
    cost: 1000,
    item: {
      id: 112,
      name: 'Торговая лицензия',
      type: 'accessory',
      rarity: 'epic',
      effect: '15% скидка у всех торговцев'
    }
  },
  {
    id: 'merchant_reward_3',
    factionId: 'merchants_guild',
    name: 'Золотой слиток',
    type: 'resource',
    requiredRepLevel: 'revered',
    cost: 500,
    item: {
      id: 113,
      name: 'Золотой слиток',
      type: 'resource',
      rarity: 'epic',
      effect: 'Можно продать за 1000 золота'
    }
  },
  {
    id: 'merchant_reward_4',
    factionId: 'merchants_guild',
    name: 'Печать гильдии',
    type: 'accessory',
    requiredRepLevel: 'exalted',
    cost: 2500,
    item: {
      id: 114,
      name: 'Печать Гильдии Торговцев',
      type: 'accessory',
      rarity: 'legendary',
      effect: '+25% к получаемому золоту и 20% скидка у торговцев'
    }
  },
  {
    id: 'merchant_reward_5',
    factionId: 'merchants_guild',
    name: 'Плащ купца',
    type: 'cosmetic',
    requiredRepLevel: 'friendly',
    cost: 200,
    item: {
      id: 115,
      name: 'Плащ Гильдии Торговцев',
      type: 'cosmetic',
      rarity: 'uncommon',
      effect: 'Косметический предмет'
    }
  },
  
  // ЛОЖА СЛЕДОПЫТОВ
  {
    id: 'ranger_reward_1',
    factionId: 'rangers_lodge',
    name: 'Лук следопыта',
    type: 'weapon',
    requiredRepLevel: 'friendly',
    cost: 500,
    item: {
      id: 116,
      name: 'Лук следопыта',
      type: 'weapon',
      val: 20,
      rarity: 'rare',
      effect: '+15% шанс критического удара'
    }
  },
  {
    id: 'ranger_reward_2',
    factionId: 'rangers_lodge',
    name: 'Кожаная броня охотника',
    type: 'armor',
    requiredRepLevel: 'honored',
    cost: 1000,
    item: {
      id: 117,
      name: 'Кожаная броня охотника',
      type: 'armor',
      val: 16,
      rarity: 'epic',
      effect: '+20% к сбору ресурсов'
    }
  },
  {
    id: 'ranger_reward_3',
    factionId: 'rangers_lodge',
    name: 'Зелье выслеживания',
    type: 'consumable',
    requiredRepLevel: 'revered',
    cost: 300,
    item: {
      id: 118,
      name: 'Зелье выслеживания',
      type: 'consumable',
      val: 0,
      rarity: 'epic',
      effect: '+50% шанс находок на 20 шагов'
    }
  },
  {
    id: 'ranger_reward_4',
    factionId: 'rangers_lodge',
    name: 'Легендарный арбалет',
    type: 'weapon',
    requiredRepLevel: 'exalted',
    cost: 3000,
    item: {
      id: 119,
      name: 'Легендарный арбалет',
      type: 'weapon',
      val: 38,
      rarity: 'legendary',
      effect: '25% шанс мгновенного убийства врагов ниже 20% HP'
    }
  },
  {
    id: 'ranger_reward_5',
    factionId: 'rangers_lodge',
    name: 'Плащ следопыта',
    type: 'cosmetic',
    requiredRepLevel: 'friendly',
    cost: 200,
    item: {
      id: 120,
      name: 'Плащ Ложи Следопытов',
      type: 'cosmetic',
      rarity: 'uncommon',
      effect: 'Косметический предмет'
    }
  },
  
  // КРУГ МАГОВ
  {
    id: 'mage_reward_1',
    factionId: 'mages_circle',
    name: 'Посох архимага',
    type: 'weapon',
    requiredRepLevel: 'friendly',
    cost: 500,
    item: {
      id: 121,
      name: 'Посох архимага',
      type: 'weapon',
      val: 24,
      rarity: 'rare',
      effect: '+10 к максимальной энергии'
    }
  },
  {
    id: 'mage_reward_2',
    factionId: 'mages_circle',
    name: 'Мантия мудреца',
    type: 'armor',
    requiredRepLevel: 'honored',
    cost: 1000,
    item: {
      id: 122,
      name: 'Мантия мудреца',
      type: 'armor',
      val: 17,
      rarity: 'epic',
      effect: '+15% к получаемому опыту'
    }
  },
  {
    id: 'mage_reward_3',
    factionId: 'mages_circle',
    name: 'Эликсир знаний',
    type: 'consumable',
    requiredRepLevel: 'revered',
    cost: 300,
    item: {
      id: 123,
      name: 'Эликсир знаний',
      type: 'consumable',
      val: 0,
      rarity: 'epic',
      effect: '+50% к опыту на 1 час'
    }
  },
  {
    id: 'mage_reward_4',
    factionId: 'mages_circle',
    name: 'Посох вечности',
    type: 'weapon',
    requiredRepLevel: 'exalted',
    cost: 3000,
    item: {
      id: 124,
      name: 'Посох вечности',
      type: 'weapon',
      val: 42,
      rarity: 'legendary',
      effect: '+20 к максимальной энергии и +25% к опыту'
    }
  },
  {
    id: 'mage_reward_5',
    factionId: 'mages_circle',
    name: 'Шляпа мага',
    type: 'cosmetic',
    requiredRepLevel: 'friendly',
    cost: 200,
    item: {
      id: 125,
      name: 'Шляпа Круга Магов',
      type: 'cosmetic',
      rarity: 'uncommon',
      effect: 'Косметический предмет'
    }
  }
];
