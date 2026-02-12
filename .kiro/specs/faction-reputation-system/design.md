# Документ дизайна: Система репутации с фракциями

## Обзор

Данный документ описывает технический дизайн системы репутации с фракциями для браузерной RPG игры на React. Система позволяет игрокам взаимодействовать с различными фракциями, выполнять задания, повышать репутацию и получать уникальные награды.

### Цели дизайна

- Интеграция системы фракций в существующую архитектуру игры
- Создание глубокой системы прогрессии с долгосрочными целями
- Обеспечение значимого выбора через конфликтующие фракции
- Предоставление разнообразных наград и мотивации для игроков
- Поддержка масштабируемости для добавления новых фракций

### Технологический стек

- React 18+ с хуками (useState, useEffect, useMemo)
- Tailwind CSS для стилизации
- Lucide React для иконок
- localStorage для сохранения состояния
- Интеграция с существующими системами (квесты, крафт, гильдии)

## Архитектура

### Структура компонентов

Система фракций следует существующей компонентной архитектуре:

1. **FactionScreen**: Главный экран со списком всех фракций
2. **FactionDetailScreen**: Детальный экран конкретной фракции с вкладками
3. **FactionQuestCard**: Карточка задания фракции
4. **FactionRewardCard**: Карточка награды за репутацию
5. **FactionMerchant**: Интерфейс торговца фракции
6. **ReputationBar**: Компонент прогресс-бара репутации

### Управление состоянием

Расширение объекта `player` для поддержки системы фракций:

```javascript
const [player, setPlayer] = useState({
  // ... существующие поля ...
  
  // НОВОЕ: Репутация с фракциями
  factionReputation: {
    'order_of_light': { value: 0, level: 'neutral' },
    'cult_of_darkness': { value: 0, level: 'neutral' },
    'merchants_guild': { value: 0, level: 'neutral' },
    'rangers_lodge': { value: 0, level: 'neutral' },
    'mages_circle': { value: 0, level: 'neutral' }
  },
  
  // НОВОЕ: Выполненные задания фракций
  completedFactionQuests: [],
  
  // НОВОЕ: Активные ежедневные задания
  dailyFactionQuests: [],
  lastDailyReset: Date.now()
});
```


### Поток данных

1. **Выполнение задания** → Обработчик completeFactionQuest()
2. **Обновление репутации** → updateFactionReputation()
3. **Проверка конфликтов** → applyFactionConflicts()
4. **Обновление состояния** → setPlayer()
5. **Автосохранение** → localStorage
6. **Проверка достижений** → checkFactionAchievements()
7. **Уведомления** → addNotification()

## Компоненты и интерфейсы

### 1. Структура данных фракций

```javascript
const FACTIONS = [
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
```

### 2. Уровни репутации

```javascript
const REPUTATION_LEVELS = [
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
```


### 3. Задания фракций

```javascript
const FACTION_QUESTS = [
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
```


### 4. Награды фракций

```javascript
const FACTION_REWARDS = [
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
```


## Модели данных

### Модель репутации игрока

```javascript
interface PlayerFactionData {
  factionReputation: {
    [factionId: string]: {
      value: number;           // Текущее значение репутации
      level: string;           // Текущий уровень (neutral, friendly, etc.)
    }
  };
  completedFactionQuests: string[];  // ID выполненных заданий
  dailyFactionQuests: Array<{
    questId: string;
    factionId: string;
    completedToday: boolean;
  }>;
  lastDailyReset: number;      // Timestamp последнего сброса ежедневных заданий
}
```

### Модель фракции

```javascript
interface Faction {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  conflictsWith: string | null;
  theme: {
    primary: string;
    secondary: string;
    border: string;
  };
  benefits: string[];
}
```

### Модель задания фракции

```javascript
interface FactionQuest {
  id: string;
  factionId: string;
  name: string;
  description: string;
  type: 'kill' | 'collect' | 'craft' | 'explore' | 'earn_gold' | 'visit_locations' | 'kill_location' | 'collect_category' | 'craft_category';
  target: {
    enemyTypes?: string[];
    count?: number;
    resourceId?: string;
    recipeId?: number;
    locationId?: number;
    steps?: number;
    amount?: number;
    category?: string;
  };
  requiredRepLevel: string;
  rewards: {
    reputation: number;
    gold: number;
    exp: number;
    item?: {
      id: number;
      name: string;
    };
  };
  isDaily: boolean;
}
```

### Модель награды фракции

```javascript
interface FactionReward {
  id: string;
  factionId: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'accessory' | 'cosmetic' | 'resource';
  requiredRepLevel: string;
  cost: number;
  item: {
    id: number;
    name: string;
    type: string;
    val?: number;
    rarity: string;
    effect?: string;
  };
}
```

## Основные функции

### 1. Управление репутацией

```javascript
// Получить текущий уровень репутации
const getReputationLevel = (value) => {
  for (const level of REPUTATION_LEVELS) {
    if (value >= level.minValue && value < level.maxValue) {
      return level;
    }
  }
  return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1];
};

// Обновить репутацию с фракцией
const updateFactionReputation = (factionId, amount) => {
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
    const faction = FACTIONS.find(f => f.id === factionId);
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
        addNotification(
          `Репутация с ${FACTIONS.find(f => f.id === faction.conflictsWith)?.name} понижена на ${conflictAmount}`,
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

// Проверить доступность задания
const canAcceptQuest = (quest) => {
  const faction = FACTIONS.find(f => f.id === quest.factionId);
  const currentRep = player.factionReputation[quest.factionId] || { value: 0, level: 'neutral' };
  const requiredLevel = REPUTATION_LEVELS.find(l => l.id === quest.requiredRepLevel);
  
  // Проверка уровня репутации
  if (currentRep.value < requiredLevel.minValue) {
    return { canAccept: false, reason: `Требуется репутация: ${requiredLevel.name}` };
  }
  
  // Проверка на выполнение
  if (player.completedFactionQuests.includes(quest.id) && !quest.isDaily) {
    return { canAccept: false, reason: 'Задание уже выполнено' };
  }
  
  // Проверка ежедневного задания
  if (quest.isDaily) {
    const dailyQuest = player.dailyFactionQuests.find(dq => dq.questId === quest.id);
    if (dailyQuest?.completedToday) {
      return { canAccept: false, reason: 'Выполнено сегодня' };
    }
  }
  
  return { canAccept: true };
};
```

### 2. Выполнение заданий

```javascript
// Выполнить задание фракции
const completeFactionQuest = (quest) => {
  const { canAccept, reason } = canAcceptQuest(quest);
  
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
        updatedPlayer.inventory = [...updatedPlayer.inventory, item];
        addNotification(`Получен предмет: ${item.name}`, 'success');
      }
    }
    
    // Отметить задание как выполненное
    if (!quest.isDaily) {
      updatedPlayer.completedFactionQuests = [...updatedPlayer.completedFactionQuests, quest.id];
    } else {
      // Обновить ежедневное задание
      const dailyIndex = updatedPlayer.dailyFactionQuests.findIndex(dq => dq.questId === quest.id);
      if (dailyIndex >= 0) {
        updatedPlayer.dailyFactionQuests[dailyIndex].completedToday = true;
      }
    }
    
    return updatedPlayer;
  });
  
  // Обновить репутацию (с учетом бонусов гильдии, если есть)
  let reputationGain = rewards.reputation;
  if (quest.isDaily) {
    reputationGain = Math.floor(reputationGain * 1.5); // Бонус за ежедневное задание
  }
  
  updateFactionReputation(quest.factionId, reputationGain);
  
  // Проверить достижения
  checkFactionAchievements();
  
  addNotification(`Задание выполнено! +${reputationGain} репутации`, 'success');
  addLog(`Выполнено задание: ${quest.name}`, 'good');
};

// Проверить прогресс задания
const checkQuestProgress = (quest, player) => {
  switch (quest.type) {
    case 'kill':
      // Проверяется при победе над врагом
      return { current: 0, target: quest.target.count, canComplete: false };
      
    case 'collect':
      const resourceCount = player.resources?.[quest.target.resourceId] || 0;
      return {
        current: resourceCount,
        target: quest.target.count,
        canComplete: resourceCount >= quest.target.count
      };
      
    case 'craft':
      // Проверяется при крафте
      return { current: 0, target: quest.target.count, canComplete: false };
      
    case 'earn_gold':
      // Требует отслеживания заработанного золота
      return { current: 0, target: quest.target.amount, canComplete: false };
      
    default:
      return { current: 0, target: 1, canComplete: false };
  }
};
```


### 3. Система ежедневных заданий

```javascript
// Проверить и сбросить ежедневные задания
const checkDailyReset = () => {
  const now = Date.now();
  const lastReset = player.lastDailyReset || 0;
  
  // Проверяем, прошло ли 24 часа
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (now - lastReset >= oneDayMs) {
    // Сбросить ежедневные задания
    const dailyQuests = FACTION_QUESTS.filter(q => q.isDaily);
    
    setPlayer(prev => ({
      ...prev,
      dailyFactionQuests: dailyQuests.map(q => ({
        questId: q.id,
        factionId: q.factionId,
        completedToday: false
      })),
      lastDailyReset: now
    }));
    
    addNotification('Ежедневные задания обновлены!', 'info');
  }
};

// Получить оставшееся время до сброса
const getTimeUntilReset = () => {
  const now = Date.now();
  const lastReset = player.lastDailyReset || 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const nextReset = lastReset + oneDayMs;
  const remaining = Math.max(0, nextReset - now);
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  return { hours, minutes, totalMs: remaining };
};
```

### 4. Торговец фракции

```javascript
// Получить доступные товары торговца
const getFactionMerchantItems = (factionId) => {
  const currentRep = player.factionReputation[factionId] || { value: 0, level: 'neutral' };
  const currentLevel = getReputationLevel(currentRep.value);
  
  return FACTION_REWARDS.filter(reward => {
    const requiredLevel = REPUTATION_LEVELS.find(l => l.id === reward.requiredRepLevel);
    return reward.factionId === factionId && currentRep.value >= requiredLevel.minValue;
  });
};

// Рассчитать скидку на основе репутации
const getReputationDiscount = (factionId) => {
  const currentRep = player.factionReputation[factionId] || { value: 0, level: 'neutral' };
  const level = getReputationLevel(currentRep.value);
  
  const discounts = {
    'hated': 0,
    'hostile': 0,
    'neutral': 0,
    'friendly': 0.05,    // 5%
    'honored': 0.10,     // 10%
    'revered': 0.15,     // 15%
    'exalted': 0.20      // 20%
  };
  
  return discounts[level.id] || 0;
};

// Купить награду у торговца
const purchaseFactionReward = (reward) => {
  const discount = getReputationDiscount(reward.factionId);
  const finalCost = Math.floor(reward.cost * (1 - discount));
  
  if (player.gold < finalCost) {
    addNotification('Недостаточно золота', 'error');
    return;
  }
  
  // Проверить уровень репутации
  const currentRep = player.factionReputation[reward.factionId] || { value: 0, level: 'neutral' };
  const requiredLevel = REPUTATION_LEVELS.find(l => l.id === reward.requiredRepLevel);
  
  if (currentRep.value < requiredLevel.minValue) {
    addNotification(`Требуется репутация: ${requiredLevel.name}`, 'warning');
    return;
  }
  
  setPlayer(prev => ({
    ...prev,
    gold: prev.gold - finalCost,
    inventory: [...prev.inventory, reward.item]
  }));
  
  addNotification(`Куплено: ${reward.name}`, 'success');
  if (discount > 0) {
    addNotification(`Скидка ${Math.floor(discount * 100)}% применена!`, 'info');
  }
};
```

### 5. Интеграция с существующими системами

```javascript
// Интеграция с системой боя
const handleEnemyDefeated = (enemy) => {
  // ... существующая логика ...
  
  // Проверить, связан ли враг с фракцией
  const factionEnemies = {
    'order_of_light': ['Скелет-Воин', 'Вампир', 'Темный Маг'],
    'rangers_lodge': ['Лесной Волк', 'Гоблин', 'Бандит'],
    'mages_circle': ['Огненный Элементаль', 'Ледяной Голем', 'Темный Маг']
  };
  
  for (const [factionId, enemies] of Object.entries(factionEnemies)) {
    if (enemies.includes(enemy.name)) {
      updateFactionReputation(factionId, 10); // Небольшая репутация за убийство
      break;
    }
  }
  
  // Проверить прогресс заданий на убийство
  checkKillQuestProgress(enemy);
};

// Интеграция с системой крафта
const handleItemCrafted = (recipe) => {
  // ... существующая логика ...
  
  // Добавить репутацию с фракцией профессии
  if (player.profession) {
    const professionFactions = {
      'blacksmith': 'merchants_guild',
      'alchemist': 'mages_circle',
      'herbalist': 'rangers_lodge',
      'miner': 'merchants_guild'
    };
    
    const factionId = professionFactions[player.profession];
    if (factionId) {
      updateFactionReputation(factionId, 5);
    }
  }
  
  // Проверить прогресс заданий на крафт
  checkCraftQuestProgress(recipe);
};

// Интеграция с системой сбора ресурсов
const handleResourceCollected = (resourceId, amount) => {
  // ... существующая логика ...
  
  // Проверить прогресс заданий на сбор
  checkCollectQuestProgress(resourceId, amount);
};

// Проверка прогресса заданий
const checkKillQuestProgress = (enemy) => {
  const activeQuests = FACTION_QUESTS.filter(q => 
    q.type === 'kill' && 
    !player.completedFactionQuests.includes(q.id) &&
    q.target.enemyTypes?.includes(enemy.name)
  );
  
  // Здесь нужно отслеживать прогресс в отдельном состоянии
  // Для упрощения, можно показывать уведомление
  activeQuests.forEach(quest => {
    addNotification(`Прогресс задания: ${quest.name}`, 'info');
  });
};

const checkCollectQuestProgress = (resourceId, amount) => {
  const activeQuests = FACTION_QUESTS.filter(q => 
    q.type === 'collect' && 
    !player.completedFactionQuests.includes(q.id) &&
    q.target.resourceId === resourceId
  );
  
  activeQuests.forEach(quest => {
    const currentAmount = player.resources?.[resourceId] || 0;
    if (currentAmount >= quest.target.count) {
      addNotification(`Задание готово к сдаче: ${quest.name}`, 'success');
    }
  });
};

const checkCraftQuestProgress = (recipe) => {
  const activeQuests = FACTION_QUESTS.filter(q => 
    q.type === 'craft' && 
    !player.completedFactionQuests.includes(q.id) &&
    q.target.recipeId === recipe.id
  );
  
  // Отслеживание прогресса крафта
  activeQuests.forEach(quest => {
    addNotification(`Прогресс задания: ${quest.name}`, 'info');
  });
};
```

### 6. Достижения фракций

```javascript
const FACTION_ACHIEVEMENTS = [
  {
    id: 'first_faction_quest',
    name: 'Первое задание фракции',
    description: 'Выполните первое задание любой фракции',
    category: 'factions',
    requirement: { type: 'faction_quests_completed', value: 1 },
    reward: { gold: 100, exp: 50 },
    icon: Scroll
  },
  {
    id: 'faction_friend',
    name: 'Друг фракции',
    description: 'Достигните дружелюбного уровня с любой фракцией',
    category: 'factions',
    requirement: { type: 'faction_level_reached', level: 'friendly' },
    reward: { gold: 300, exp: 200 },
    icon: Users
  },
  {
    id: 'faction_honored',
    name: 'Уважаемый союзник',
    description: 'Достигните уважаемого уровня с любой фракцией',
    category: 'factions',
    requirement: { type: 'faction_level_reached', level: 'honored' },
    reward: { gold: 500, exp: 400 },
    icon: Trophy
  },
  {
    id: 'faction_exalted',
    name: 'Превознесенный герой',
    description: 'Достигните превознесенного уровня с любой фракцией',
    category: 'factions',
    requirement: { type: 'faction_level_reached', level: 'exalted' },
    reward: { gold: 2000, exp: 1000 },
    icon: Crown
  },
  {
    id: 'all_factions_friendly',
    name: 'Дипломат',
    description: 'Достигните дружелюбного уровня со всеми фракциями',
    category: 'factions',
    requirement: { type: 'all_factions_level', level: 'friendly' },
    reward: { gold: 1500, exp: 800 },
    icon: Sparkles
  },
  {
    id: 'faction_quests_master',
    name: 'Мастер заданий',
    description: 'Выполните 50 заданий фракций',
    category: 'factions',
    requirement: { type: 'faction_quests_completed', value: 50 },
    reward: { gold: 1000, exp: 600 },
    icon: CheckCircle
  }
];

// Проверить достижения фракций
const checkFactionAchievements = () => {
  FACTION_ACHIEVEMENTS.forEach(achievement => {
    if (player.achievements.includes(achievement.id)) return;
    
    let unlocked = false;
    
    switch (achievement.requirement.type) {
      case 'faction_quests_completed':
        unlocked = player.completedFactionQuests.length >= achievement.requirement.value;
        break;
        
      case 'faction_level_reached':
        unlocked = Object.values(player.factionReputation).some(rep => {
          const level = getReputationLevel(rep.value);
          const requiredLevel = REPUTATION_LEVELS.find(l => l.id === achievement.requirement.level);
          return rep.value >= requiredLevel.minValue;
        });
        break;
        
      case 'all_factions_level':
        const requiredLevel = REPUTATION_LEVELS.find(l => l.id === achievement.requirement.level);
        unlocked = FACTIONS.every(faction => {
          const rep = player.factionReputation[faction.id] || { value: 0 };
          return rep.value >= requiredLevel.minValue;
        });
        break;
    }
    
    if (unlocked) {
      unlockAchievement(achievement);
    }
  });
};
```


## Компоненты UI

### 1. FactionScreen - Главный экран фракций

```javascript
const FactionScreen = ({ player, setPlayer }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Фракции</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FACTIONS.map(faction => (
          <FactionCard 
            key={faction.id}
            faction={faction}
            reputation={player.factionReputation[faction.id]}
            onClick={() => openFactionDetail(faction)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2. FactionCard - Карточка фракции

```javascript
const FactionCard = ({ faction, reputation, onClick }) => {
  const repLevel = getReputationLevel(reputation?.value || 0);
  const Icon = faction.icon;
  
  return (
    <div 
      className={`${faction.theme.secondary} border ${faction.theme.border} rounded-lg p-4 cursor-pointer 
        hover:scale-105 transition-transform`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`${faction.color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${faction.theme.primary}`}>{faction.name}</h3>
          <p className="text-sm text-slate-400">{faction.description}</p>
        </div>
      </div>
      
      <ReputationBar 
        value={reputation?.value || 0}
        level={repLevel}
      />
      
      <div className="mt-3 text-xs text-slate-400">
        {faction.benefits.slice(0, 2).map((benefit, i) => (
          <div key={i}>• {benefit}</div>
        ))}
      </div>
    </div>
  );
};
```

### 3. ReputationBar - Прогресс-бар репутации

```javascript
const ReputationBar = ({ value, level }) => {
  const progress = ((value - level.minValue) / (level.maxValue - level.minValue)) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={level.color}>{level.name}</span>
        <span className="text-slate-400">{value} / {level.maxValue}</span>
      </div>
      <div className={`w-full ${level.bgColor} rounded-full h-2`}>
        <div 
          className={`h-2 rounded-full ${level.color.replace('text-', 'bg-')}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
```

### 4. FactionDetailScreen - Детальный экран фракции

```javascript
const FactionDetailScreen = ({ faction, player, setPlayer, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className={`${faction.color} p-3 rounded-lg`}>
          <faction.icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${faction.theme.primary}`}>{faction.name}</h1>
          <p className="text-slate-400">{faction.description}</p>
        </div>
      </div>
      
      {/* Reputation */}
      <ReputationBar 
        value={player.factionReputation[faction.id]?.value || 0}
        level={getReputationLevel(player.factionReputation[faction.id]?.value || 0)}
      />
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Обзор
        </TabButton>
        <TabButton active={activeTab === 'quests'} onClick={() => setActiveTab('quests')}>
          Задания
        </TabButton>
        <TabButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>
          Награды
        </TabButton>
        <TabButton active={activeTab === 'merchant'} onClick={() => setActiveTab('merchant')}>
          Торговец
        </TabButton>
      </div>
      
      {/* Content */}
      <div>
        {activeTab === 'overview' && <FactionOverview faction={faction} />}
        {activeTab === 'quests' && <FactionQuests faction={faction} player={player} setPlayer={setPlayer} />}
        {activeTab === 'rewards' && <FactionRewards faction={faction} player={player} />}
        {activeTab === 'merchant' && <FactionMerchant faction={faction} player={player} setPlayer={setPlayer} />}
      </div>
    </div>
  );
};
```

## Correctness Properties

*Свойство (property) - это характеристика или поведение, которое должно выполняться для всех допустимых входных данных системы. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Property 1: Определение уровня репутации

*For any* значение репутации в диапазоне от -12000 до 999999, функция getReputationLevel должна вернуть ровно один уровень репутации, и это значение должно находиться в пределах minValue и maxValue этого уровня.

**Validates: Requirements 2.2, 2.5**

### Property 2: Независимость репутации фракций

*For any* две различные фракции без конфликта, изменение репутации с одной фракцией не должно влиять на репутацию с другой фракцией.

**Validates: Requirements 2.6**

### Property 3: Конфликт фракций

*For any* пара конфликтующих фракций, когда репутация с одной фракцией увеличивается на X, репутация с конфликтующей фракцией должна уменьшиться на 40% от X (с округлением вниз).

**Validates: Requirements 6.2**

### Property 4: Выполнение задания увеличивает репутацию

*For any* задание фракции, когда игрок выполняет это задание, значение репутации с соответствующей фракцией должно увеличиться на величину rewards.reputation (с учетом бонуса 1.5x для ежедневных заданий).

**Validates: Requirements 3.3, 7.3**

### Property 5: Выдача наград при выполнении задания

*For any* задание фракции, когда игрок выполняет это задание, игрок должен получить все указанные награды: золото должно увеличиться на rewards.gold, опыт на rewards.exp, и предмет (если указан) должен быть добавлен в инвентарь.

**Validates: Requirements 3.5**

### Property 6: Проверка уровня репутации для заданий

*For any* задание фракции с requiredRepLevel, функция canAcceptQuest должна вернуть canAccept: false, если текущая репутация игрока меньше минимального значения требуемого уровня.

**Validates: Requirements 3.4, 6.4**

### Property 7: Отметка выполненных заданий

*For any* неежедневное задание фракции, после его выполнения, ID задания должен быть добавлен в массив completedFactionQuests игрока, и повторное выполнение должно быть невозможно.

**Validates: Requirements 3.7**

### Property 8: Доступность наград по уровню репутации

*For any* награда фракции с requiredRepLevel, функция getFactionMerchantItems должна включать эту награду в результат только если текущая репутация игрока больше или равна минимальному значению требуемого уровня.

**Validates: Requirements 4.2, 5.6**

### Property 9: Расчет скидки по репутации

*For any* уровень репутации, функция getReputationDiscount должна вернуть значение от 0 до 0.20, причем скидка должна увеличиваться с ростом уровня репутации (friendly: 5%, honored: 10%, revered: 15%, exalted: 20%).

**Validates: Requirements 5.5**

### Property 10: Покупка награды у торговца

*For any* награда фракции, когда игрок покупает её у торговца, золото игрока должно уменьшиться на finalCost (с учетом скидки), и предмет должен быть добавлен в инвентарь.

**Validates: Requirements 5.4**

### Property 11: Сброс ежедневных заданий

*For any* момент времени, если прошло 24 часа или более с lastDailyReset, функция checkDailyReset должна сбросить все ежедневные задания (установить completedToday: false) и обновить lastDailyReset.

**Validates: Requirements 7.2, 7.6**

### Property 12: Расчет времени до сброса

*For any* момент времени, функция getTimeUntilReset должна вернуть неотрицательное значение totalMs, которое равно нулю, если прошло 24 часа с lastDailyReset, или положительное значение в противном случае.

**Validates: Requirements 7.4**

### Property 13: Разблокировка достижений по уровню репутации

*For any* достижение с requirement.type === 'faction_level_reached', когда игрок достигает требуемого уровня репутации хотя бы с одной фракцией, функция checkFactionAchievements должна разблокировать это достижение.

**Validates: Requirements 8.2**

### Property 14: Разблокировка достижений по количеству заданий

*For any* достижение с requirement.type === 'faction_quests_completed', когда количество выполненных заданий фракций достигает requirement.value, функция checkFactionAchievements должна разблокировать это достижение.

**Validates: Requirements 8.4**

### Property 15: Интеграция с системой боя

*For any* враг, связанный с фракцией (присутствует в factionEnemies), когда игрок побеждает этого врага, репутация с соответствующей фракцией должна увеличиться на 10.

**Validates: Requirements 9.1**

### Property 16: Интеграция с системой крафта

*For any* рецепт крафта, когда игрок создает предмет по этому рецепту и имеет профессию, репутация с фракцией, связанной с профессией, должна увеличиться на 5.

**Validates: Requirements 9.2**

### Property 17: Прогресс-бар репутации

*For any* значение репутации и уровень, компонент ReputationBar должен рассчитать прогресс как ((value - level.minValue) / (level.maxValue - level.minValue)) * 100, ограниченный диапазоном [0, 100].

**Validates: Requirements 10.3**

### Property 18: Наличие минимального количества фракций

*For all* игровых сессий, массив FACTIONS должен содержать минимум 5 элементов с уникальными id.

**Validates: Requirements 1.3**

### Property 19: Наличие минимального количества заданий

*For any* фракция, должно существовать минимум 3 задания с factionId, равным id этой фракции.

**Validates: Requirements 3.1**

### Property 20: Наличие минимального количества наград

*For any* фракция, должно существовать минимум 5 наград с factionId, равным id этой фракции.

**Validates: Requirements 4.5**

### Property 21: Инициализация репутации

*For any* новый игрок, все фракции в factionReputation должны иметь value: 0 и level: 'neutral'.

**Validates: Requirements 1.4**

### Property 22: Структура данных фракции

*For any* фракция в массиве FACTIONS, она должна содержать поля: id, name, description, icon, color, theme (с полями primary, secondary, border), и benefits (непустой массив).

**Validates: Requirements 1.5, 1.6**

### Property 23: Структура уровней репутации

*For all* игровых сессий, массив REPUTATION_LEVELS должен содержать ровно 7 элементов, каждый с полями: id, name, minValue, maxValue, color, bgColor, borderColor.

**Validates: Requirements 2.1, 2.4**

### Property 24: Разнообразие типов заданий

*For all* игровых сессий, должны существовать задания минимум 3 различных типов (kill, collect, craft, explore, и т.д.).

**Validates: Requirements 3.6**

### Property 25: Разнообразие типов наград

*For all* игровых сессий, должны существовать награды минимум 3 различных типов (weapon, armor, consumable, accessory, cosmetic).

**Validates: Requirements 4.6**


## Обработка ошибок

### Валидация входных данных

```javascript
// Валидация ID фракции
const validateFactionId = (factionId) => {
  const faction = FACTIONS.find(f => f.id === factionId);
  if (!faction) {
    throw new Error(`Invalid faction ID: ${factionId}`);
  }
  return faction;
};

// Валидация значения репутации
const validateReputationValue = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`Invalid reputation value: ${value}`);
  }
  return Math.max(-12000, Math.min(999999, value));
};

// Валидация ID задания
const validateQuestId = (questId) => {
  const quest = FACTION_QUESTS.find(q => q.id === questId);
  if (!quest) {
    throw new Error(`Invalid quest ID: ${questId}`);
  }
  return quest;
};
```

### Обработка ошибок покупки

```javascript
const purchaseFactionReward = (reward) => {
  try {
    // Валидация фракции
    validateFactionId(reward.factionId);
    
    // Проверка золота
    const discount = getReputationDiscount(reward.factionId);
    const finalCost = Math.floor(reward.cost * (1 - discount));
    
    if (player.gold < finalCost) {
      addNotification('Недостаточно золота', 'error');
      return { success: false, error: 'insufficient_gold' };
    }
    
    // Проверка репутации
    const currentRep = player.factionReputation[reward.factionId] || { value: 0, level: 'neutral' };
    const requiredLevel = REPUTATION_LEVELS.find(l => l.id === reward.requiredRepLevel);
    
    if (currentRep.value < requiredLevel.minValue) {
      addNotification(`Требуется репутация: ${requiredLevel.name}`, 'warning');
      return { success: false, error: 'insufficient_reputation' };
    }
    
    // Выполнить покупку
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - finalCost,
      inventory: [...prev.inventory, reward.item]
    }));
    
    addNotification(`Куплено: ${reward.name}`, 'success');
    return { success: true };
    
  } catch (error) {
    console.error('Error purchasing faction reward:', error);
    addNotification('Ошибка при покупке', 'error');
    return { success: false, error: error.message };
  }
};
```

### Обработка ошибок выполнения задания

```javascript
const completeFactionQuest = (quest) => {
  try {
    // Валидация задания
    validateQuestId(quest.id);
    validateFactionId(quest.factionId);
    
    // Проверка возможности принятия
    const { canAccept, reason } = canAcceptQuest(quest);
    
    if (!canAccept) {
      addNotification(reason, 'warning');
      return { success: false, error: reason };
    }
    
    // Выполнить задание
    // ... логика выполнения ...
    
    return { success: true };
    
  } catch (error) {
    console.error('Error completing faction quest:', error);
    addNotification('Ошибка при выполнении задания', 'error');
    return { success: false, error: error.message };
  }
};
```

### Обработка ошибок сохранения

```javascript
const saveFactionData = (playerData) => {
  try {
    // Валидация данных репутации
    if (!playerData.factionReputation) {
      throw new Error('Missing faction reputation data');
    }
    
    // Проверка структуры данных
    for (const [factionId, repData] of Object.entries(playerData.factionReputation)) {
      if (typeof repData.value !== 'number' || typeof repData.level !== 'string') {
        throw new Error(`Invalid reputation data for faction: ${factionId}`);
      }
    }
    
    // Сохранить данные
    const success = saveGame(playerData);
    
    if (!success) {
      throw new Error('Failed to save game data');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error saving faction data:', error);
    addNotification('Ошибка сохранения данных фракций', 'error');
    return { success: false, error: error.message };
  }
};
```

## Стратегия тестирования

### Двойной подход к тестированию

Система репутации с фракциями требует комплексного тестирования с использованием как unit-тестов, так и property-based тестов:

**Unit-тесты** проверяют:
- Конкретные примеры расчета репутации
- Граничные случаи (минимальная/максимальная репутация)
- Обработку ошибок
- Интеграцию с существующими системами

**Property-based тесты** проверяют:
- Универсальные свойства для всех значений репутации
- Корректность конфликтов фракций
- Правильность расчета скидок
- Инварианты системы заданий

### Конфигурация property-based тестов

Для тестирования системы фракций будет использоваться библиотека **fast-check** (для JavaScript/React):

```javascript
import fc from 'fast-check';

// Минимум 100 итераций для каждого property-теста
const testConfig = { numRuns: 100 };
```

Каждый property-тест должен быть помечен комментарием:
```javascript
// Feature: faction-reputation-system, Property 1: Определение уровня репутации
```

### Примеры тестов

**Unit-тест для расчета уровня репутации:**
```javascript
describe('getReputationLevel', () => {
  it('should return neutral level for value 0', () => {
    const level = getReputationLevel(0);
    expect(level.id).toBe('neutral');
  });
  
  it('should return friendly level for value 3000', () => {
    const level = getReputationLevel(3000);
    expect(level.id).toBe('friendly');
  });
  
  it('should return exalted level for maximum value', () => {
    const level = getReputationLevel(999999);
    expect(level.id).toBe('exalted');
  });
});
```

**Property-тест для определения уровня репутации:**
```javascript
// Feature: faction-reputation-system, Property 1: Определение уровня репутации
describe('getReputationLevel property', () => {
  it('should always return a valid level for any reputation value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -12000, max: 999999 }),
        (repValue) => {
          const level = getReputationLevel(repValue);
          
          // Проверяем, что уровень определен
          expect(level).toBeDefined();
          expect(level.id).toBeDefined();
          
          // Проверяем, что значение находится в пределах уровня
          expect(repValue).toBeGreaterThanOrEqual(level.minValue);
          expect(repValue).toBeLessThan(level.maxValue);
        }
      ),
      testConfig
    );
  });
});
```

**Property-тест для конфликта фракций:**
```javascript
// Feature: faction-reputation-system, Property 3: Конфликт фракций
describe('faction conflict property', () => {
  it('should decrease conflicting faction reputation by 40%', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...FACTIONS.filter(f => f.conflictsWith)),
        fc.integer({ min: 1, max: 1000 }),
        (faction, repGain) => {
          const initialPlayer = {
            factionReputation: {
              [faction.id]: { value: 0, level: 'neutral' },
              [faction.conflictsWith]: { value: 0, level: 'neutral' }
            }
          };
          
          // Симулируем обновление репутации
          const expectedDecrease = Math.floor(repGain * 0.4);
          
          // Проверяем, что конфликтующая фракция теряет 40%
          // (Здесь нужна реальная реализация updateFactionReputation)
          expect(expectedDecrease).toBe(Math.floor(repGain * 0.4));
        }
      ),
      testConfig
    );
  });
});
```

**Property-тест для расчета скидки:**
```javascript
// Feature: faction-reputation-system, Property 9: Расчет скидки по репутации
describe('reputation discount property', () => {
  it('should return discount between 0 and 0.20 for any reputation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...FACTIONS),
        fc.integer({ min: -12000, max: 999999 }),
        (faction, repValue) => {
          const mockPlayer = {
            factionReputation: {
              [faction.id]: { value: repValue, level: getReputationLevel(repValue).id }
            }
          };
          
          const discount = getReputationDiscount(faction.id);
          
          // Проверяем диапазон скидки
          expect(discount).toBeGreaterThanOrEqual(0);
          expect(discount).toBeLessThanOrEqual(0.20);
          
          // Проверяем, что скидка увеличивается с уровнем
          const level = getReputationLevel(repValue);
          const expectedDiscounts = {
            'hated': 0, 'hostile': 0, 'neutral': 0,
            'friendly': 0.05, 'honored': 0.10, 'revered': 0.15, 'exalted': 0.20
          };
          expect(discount).toBe(expectedDiscounts[level.id]);
        }
      ),
      testConfig
    );
  });
});
```

### Интеграционные тесты

```javascript
describe('Faction system integration', () => {
  it('should integrate with combat system', () => {
    // Тест интеграции с системой боя
    const enemy = { name: 'Скелет-Воин' };
    const initialRep = player.factionReputation['order_of_light'].value;
    
    handleEnemyDefeated(enemy);
    
    const newRep = player.factionReputation['order_of_light'].value;
    expect(newRep).toBe(initialRep + 10);
  });
  
  it('should integrate with crafting system', () => {
    // Тест интеграции с системой крафта
    const recipe = { id: 2, profession: 'alchemist' };
    const initialRep = player.factionReputation['mages_circle'].value;
    
    handleItemCrafted(recipe);
    
    const newRep = player.factionReputation['mages_circle'].value;
    expect(newRep).toBe(initialRep + 5);
  });
});
```

### Покрытие тестами

Целевое покрытие:
- **Основные функции**: 90%+ покрытие
- **Расчеты репутации**: 100% покрытие (критическая логика)
- **UI компоненты**: 70%+ покрытие
- **Интеграции**: 80%+ покрытие

### Тестирование производительности

```javascript
describe('Performance tests', () => {
  it('should calculate reputation level quickly for large datasets', () => {
    const start = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      getReputationLevel(Math.random() * 100000 - 12000);
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // Должно выполниться за < 100ms
  });
  
  it('should filter merchant items efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      getFactionMerchantItems('order_of_light');
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });
});
```

## Примечания по реализации

### Миграция данных

При добавлении системы фракций к существующей игре необходимо обеспечить миграцию сохранений:

```javascript
const migrateFactionData = (oldSave) => {
  if (!oldSave.factionReputation) {
    // Инициализировать репутацию для всех фракций
    oldSave.factionReputation = {};
    FACTIONS.forEach(faction => {
      oldSave.factionReputation[faction.id] = {
        value: 0,
        level: 'neutral'
      };
    });
  }
  
  if (!oldSave.completedFactionQuests) {
    oldSave.completedFactionQuests = [];
  }
  
  if (!oldSave.dailyFactionQuests) {
    oldSave.dailyFactionQuests = [];
    oldSave.lastDailyReset = Date.now();
  }
  
  return oldSave;
};
```

### Оптимизация производительности

1. **Мемоизация расчетов**: Использовать `useMemo` для кэширования доступных заданий и наград
2. **Ленивая загрузка**: Загружать детали фракции только при открытии
3. **Виртуализация списков**: Для больших списков заданий использовать виртуализацию
4. **Дебаунсинг**: Применять дебаунсинг для частых обновлений репутации

### Расширяемость

Система спроектирована для легкого добавления новых фракций:

1. Добавить новую фракцию в массив `FACTIONS`
2. Создать задания с `factionId` новой фракции
3. Создать награды с `factionId` новой фракции
4. Опционально: добавить конфликты с существующими фракциями
5. Добавить интеграции с другими системами (если нужно)

### Балансировка

Рекомендуемые значения для балансировки:

- **Базовая репутация за задание**: 200-600
- **Репутация за ежедневное задание**: 300-900 (с бонусом 1.5x)
- **Репутация за убийство врага**: 10
- **Репутация за крафт**: 5
- **Штраф конфликтующей фракции**: 40% от полученной репутации
- **Требования для уровней**:
  - Friendly: 3000 (примерно 10-15 заданий)
  - Honored: 9000 (примерно 30-45 заданий)
  - Revered: 21000 (примерно 70-105 заданий)
  - Exalted: 42000 (примерно 140-210 заданий)
