# Документ дизайна: Улучшения RPG игры

## Обзор

Данный документ описывает технический дизайн для реализации улучшений браузерной RPG игры на React. Дизайн включает три основные системы (профессии, крафт, гильдии), улучшения UI/UX и расширение игрового контента.

### Цели дизайна

- Интеграция новых систем без нарушения существующей архитектуры
- Расширение модели данных игрока для поддержки новых функций
- Создание переиспользуемых компонентов для новых разделов
- Обеспечение плавного пользовательского опыта
- Поддержка масштабируемости для будущих расширений

### Технологический стек

- React 18+ с хуками (useState, useEffect, useRef)
- Tailwind CSS для стилизации
- Lucide React для иконок
- localStorage для сохранения состояния
- Функциональное программирование для игровой логики

## Архитектура

### Структура компонентов

Приложение следует компонентной архитектуре React с разделением на:

1. **Основной компонент App**: Управляет глобальным состоянием игры и навигацией
2. **UI компоненты**: Переиспользуемые элементы (Button, Card, ProgressBar)
3. **Экраны разделов**: Компоненты для каждого раздела игры (профессии, крафт, гильдии)
4. **Утилиты**: Вспомогательные функции для игровой логики

### Управление состоянием

Состояние игры хранится в объекте `player` с использованием хука `useState`:

```javascript
const [player, setPlayer] = useState({
  // Базовые характеристики
  name, className, classId, avatarId,
  level, exp, maxExp,
  hp, maxHp, energy, maxEnergy,
  str, def, gold,
  
  // Инвентарь и экипировка
  inventory: [],
  equipment: { weapon, armor },
  
  // Квесты
  activeQuests: [],
  completedQuests: [],
  
  // Статистика
  totalSteps, totalKills, questsCompletedCount,
  
  // Коллекции
  collectedAvatars: [],
  
  // НОВОЕ: Профессии
  profession: null,
  professionLevel: 0,
  professionExp: 0,
  professionMaxExp: 100,
  
  // НОВОЕ: Гильдия
  guildId: null,
  guildRole: null,
  
  // НОВОЕ: Достижения
  achievements: []
});
```


### Поток данных

1. **Действие игрока** → Обработчик события
2. **Обработчик** → Обновление состояния через `setPlayer`
3. **Обновление состояния** → Автоматическое сохранение в localStorage
4. **Изменение состояния** → Перерисовка компонентов React
5. **Побочные эффекты** → Логирование, уведомления, проверка квестов

## Компоненты и интерфейсы

### 1. Система профессий

#### Структура данных профессий

```javascript
const PROFESSIONS = [
  {
    id: 'blacksmith',
    name: 'Кузнец',
    description: 'Создает оружие и броню из металлов',
    icon: Hammer,
    color: 'bg-orange-600',
    baseExp: 100,
    expGrowth: 1.5,
    unlockLevel: 5
  },
  {
    id: 'alchemist',
    name: 'Алхимик',
    description: 'Варит зелья и эликсиры',
    icon: FlaskConical,
    color: 'bg-purple-600',
    baseExp: 100,
    expGrowth: 1.5,
    unlockLevel: 5
  },
  {
    id: 'herbalist',
    name: 'Травник',
    description: 'Собирает и обрабатывает травы',
    icon: Wind,
    color: 'bg-green-600',
    baseExp: 80,
    expGrowth: 1.4,
    unlockLevel: 3
  },
  {
    id: 'miner',
    name: 'Шахтер',
    description: 'Добывает руду и драгоценные камни',
    icon: Target,
    color: 'bg-slate-600',
    baseExp: 120,
    expGrowth: 1.6,
    unlockLevel: 7
  }
];
```

#### Компонент ProfessionScreen

Отображает:
- Список доступных профессий (если не выбрана)
- Текущую профессию с прогресс-баром уровня
- Кнопку выполнения действия профессии
- Список разблокированных рецептов

Функции:
- `selectProfession(professionId)`: Назначает профессию игроку
- `performProfessionAction()`: Выполняет действие профессии, добавляет опыт
- `calculateProfessionRewards()`: Определяет награды за действие


### 2. Система крафта

#### Структура данных рецептов

```javascript
const RECIPES = [
  {
    id: 1,
    name: 'Железный меч',
    profession: 'blacksmith',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'iron_ore', amount: 3 },
      { resourceId: 'wood', amount: 1 }
    ],
    result: {
      itemId: 11,
      name: 'Железный меч',
      type: 'weapon',
      val: 12,
      rarity: 'uncommon'
    },
    craftTime: 2000, // миллисекунды
    expReward: 25
  },
  {
    id: 2,
    name: 'Зелье здоровья',
    profession: 'alchemist',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'red_herb', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 8,
      name: 'Зелье здоровья',
      type: 'consumable',
      val: 50,
      rarity: 'common'
    },
    craftTime: 1500,
    expReward: 15
  }
  // ... больше рецептов
];
```

#### Структура данных ресурсов

```javascript
const RESOURCES = [
  { id: 'iron_ore', name: 'Железная руда', icon: Box, rarity: 'common', locations: [1, 2, 3] },
  { id: 'gold_ore', name: 'Золотая руда', icon: Coins, rarity: 'rare', locations: [3, 4] },
  { id: 'wood', name: 'Древесина', icon: Box, rarity: 'common', locations: [1] },
  { id: 'red_herb', name: 'Красная трава', icon: Wind, rarity: 'common', locations: [1, 2] },
  { id: 'blue_herb', name: 'Синяя трава', icon: Wind, rarity: 'uncommon', locations: [2, 3] },
  { id: 'crystal', name: 'Кристалл', icon: Sparkles, rarity: 'rare', locations: [4, 5] },
  { id: 'water', name: 'Вода', icon: FlaskConical, rarity: 'common', locations: [1, 2, 3, 4] }
  // ... больше ресурсов
];
```

#### Компонент CraftScreen

Отображает:
- Список доступных рецептов (фильтр по профессии и уровню)
- Детали рецепта с требуемыми ресурсами
- Индикатор наличия ресурсов
- Прогресс-бар крафта (если в процессе)

Функции:
- `getAvailableRecipes()`: Фильтрует рецепты по профессии и уровню
- `canCraft(recipe)`: Проверяет наличие всех ресурсов
- `startCrafting(recipe)`: Начинает процесс крафта с таймером
- `completeCraft(recipe)`: Удаляет ресурсы, добавляет предмет, дает опыт


### 3. Система ресурсов

#### Интеграция с путешествиями

Модификация функции `handleStep()`:

```javascript
const handleStep = () => {
  // ... существующая логика ...
  
  // Новая логика: шанс найти ресурс
  if (roll < 0.35) { // 35% шанс
    const locationResources = RESOURCES.filter(r => 
      r.locations.includes(player.locationId)
    );
    
    if (locationResources.length > 0) {
      const resource = locationResources[getRandomInt(0, locationResources.length - 1)];
      
      // Проверка редкости для вероятности
      const rarityChance = {
        'common': 0.7,
        'uncommon': 0.2,
        'rare': 0.08,
        'epic': 0.02
      };
      
      if (Math.random() < rarityChance[resource.rarity]) {
        addResourceToInventory(resource.id, 1);
        addLog(`Вы нашли: ${resource.name}!`, 'good');
      }
    }
  }
};
```

#### Управление ресурсами в инвентаре

Ресурсы хранятся отдельно от предметов:

```javascript
player.resources = {
  'iron_ore': 5,
  'wood': 3,
  'red_herb': 8
  // ...
}
```

Функции:
- `addResourceToInventory(resourceId, amount)`: Добавляет ресурс
- `removeResourceFromInventory(resourceId, amount)`: Удаляет ресурс
- `getResourceCount(resourceId)`: Возвращает количество ресурса
- `hasResources(requirements)`: Проверяет наличие всех требуемых ресурсов

### 4. Система гильдий

#### Структура данных гильдии

```javascript
const GUILDS = [
  {
    id: 1,
    name: 'Стальные Воины',
    leaderId: 'player123',
    level: 5,
    exp: 450,
    maxExp: 1000,
    members: [
      { playerId: 'player123', name: 'Артур', level: 15, role: 'leader', contribution: 500 },
      { playerId: 'player456', name: 'Мерлин', level: 12, role: 'member', contribution: 300 }
    ],
    bonuses: {
      expBonus: 10, // +10% опыта
      goldBonus: 5, // +5% золота
      energyRegen: 1 // +1 энергия/5сек
    },
    createdAt: Date.now()
  }
];
```

#### Компонент GuildScreen

Отображает:
- Список доступных гильдий (если не в гильдии)
- Информацию о текущей гильдии
- Список членов гильдии
- Бонусы гильдии
- Прогресс уровня гильдии

Функции:
- `createGuild(name)`: Создает новую гильдию (стоимость 1000 золота)
- `joinGuild(guildId)`: Отправляет заявку на вступление
- `leaveGuild()`: Покидает текущую гильдию
- `contributeToGuild(amount)`: Вносит вклад в развитие гильдии
- `applyGuildBonuses()`: Применяет бонусы гильдии к наградам


### 5. Улучшения UI/UX

#### Система уведомлений

Компонент `NotificationSystem`:

```javascript
const [notifications, setNotifications] = useState([]);

const addNotification = (message, type, duration = 3000) => {
  const id = Date.now();
  setNotifications(prev => [...prev, { id, message, type }]);
  
  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, duration);
};

// Типы уведомлений:
// 'success' - зеленый (получение предмета, выполнение квеста)
// 'info' - синий (информация)
// 'warning' - желтый (предупреждение)
// 'error' - красный (ошибка)
// 'legendary' - оранжевый (редкая находка)
```

Позиционирование: верхний правый угол экрана, стек уведомлений.

#### Всплывающие подсказки (Tooltips)

Компонент `Tooltip`:

```javascript
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 bg-slate-900 border border-slate-700 
          rounded-lg p-3 shadow-xl text-sm ${positionClasses[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
};
```

Использование для предметов, способностей, статистики.

#### Анимации переходов

Использование Tailwind CSS классов:
- `animate-in fade-in zoom-in duration-300` для появления элементов
- `transition-all duration-200` для плавных изменений
- `hover:scale-105` для интерактивных элементов
- `active:scale-95` для кнопок

#### Цветовое кодирование редкости

```javascript
const RARITY_COLORS = {
  common: 'text-slate-400 border-slate-600',
  uncommon: 'text-green-400 border-green-600',
  rare: 'text-blue-400 border-blue-600',
  epic: 'text-purple-400 border-purple-600',
  legendary: 'text-orange-400 border-orange-600'
};

const RARITY_BG = {
  common: 'bg-slate-800',
  uncommon: 'bg-green-900/20',
  rare: 'bg-blue-900/20',
  epic: 'bg-purple-900/20',
  legendary: 'bg-orange-900/20'
};
```


### 6. Расширение контента

#### Новые локации

```javascript
const NEW_LOCATIONS = [
  { 
    id: 5, 
    name: 'Заброшенный Храм', 
    minLvl: 15, 
    enemyPower: 3.5, 
    text: 'Древние руины, полные тайн и опасностей.',
    resources: ['crystal', 'gold_ore', 'ancient_stone']
  },
  { 
    id: 6, 
    name: 'Ледяные Пики', 
    minLvl: 25, 
    enemyPower: 5, 
    text: 'Суровые горы, где правит вечная зима.',
    resources: ['ice_crystal', 'mithril_ore', 'frozen_herb']
  },
  { 
    id: 7, 
    name: 'Темный Лес', 
    minLvl: 18, 
    enemyPower: 4, 
    text: 'Мрачный лес, где солнечный свет не проникает сквозь кроны.',
    resources: ['dark_wood', 'shadow_herb', 'spider_silk']
  },
  { 
    id: 8, 
    name: 'Драконье Логово', 
    minLvl: 35, 
    enemyPower: 7, 
    text: 'Логово древних драконов. Только для самых смелых.',
    resources: ['dragon_scale', 'dragon_bone', 'fire_crystal']
  }
];
```

#### Новые враги

```javascript
const NEW_ENEMIES = [
  { name: 'Лесной Волк', baseHp: 45, baseDmg: 8, exp: 18, gold: 15 },
  { name: 'Скелет-Воин', baseHp: 80, baseDmg: 12, exp: 35, gold: 30 },
  { name: 'Темный Маг', baseHp: 100, baseDmg: 20, exp: 60, gold: 50 },
  { name: 'Ледяной Голем', baseHp: 200, baseDmg: 25, exp: 100, gold: 80 },
  { name: 'Огненный Элементаль', baseHp: 180, baseDmg: 30, exp: 120, gold: 100 },
  { name: 'Тролль', baseHp: 250, baseDmg: 22, exp: 90, gold: 70 },
  { name: 'Вампир', baseHp: 150, baseDmg: 28, exp: 110, gold: 90 },
  { name: 'Древний Дракон', baseHp: 800, baseDmg: 50, exp: 800, gold: 2000 }
];
```

#### Новые предметы

Оружие:
- Эльфийский лук (редкий, урон 15)
- Посох мага (эпический, урон 25, +5 к энергии)
- Клинок теней (легендарный, урон 35, шанс крита +10%)

Броня:
- Кожаная куртка (обычная, защита 6)
- Кольчуга (необычная, защита 10)
- Драконья чешуя (легендарная, защита 25, +50 к здоровью)

Расходники:
- Большое зелье здоровья (лечит 100 HP)
- Зелье энергии (восстанавливает 10 энергии)
- Эликсир силы (временно +10 к силе на 5 шагов)

Ресурсы:
- Мифриловая руда (редкая)
- Драконья кость (эпическая)
- Кристалл души (легендарный)


### 7. Система достижений

#### Структура данных достижений

```javascript
const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'Первые шаги',
    description: 'Сделайте 10 шагов',
    category: 'exploration',
    requirement: { type: 'steps', value: 10 },
    reward: { gold: 50, exp: 20 },
    icon: Footprints
  },
  {
    id: 'monster_slayer',
    name: 'Убийца монстров',
    description: 'Победите 50 врагов',
    category: 'combat',
    requirement: { type: 'kills', value: 50 },
    reward: { gold: 200, exp: 100 },
    icon: Skull
  },
  {
    id: 'master_crafter',
    name: 'Мастер крафта',
    description: 'Создайте 25 предметов',
    category: 'crafting',
    requirement: { type: 'crafts', value: 25 },
    reward: { gold: 300, exp: 150 },
    icon: Hammer
  },
  {
    id: 'guild_founder',
    name: 'Основатель гильдии',
    description: 'Создайте гильдию',
    category: 'social',
    requirement: { type: 'guild_created', value: 1 },
    reward: { gold: 500, exp: 200 },
    icon: Users
  },
  {
    id: 'legendary_collector',
    name: 'Коллекционер легенд',
    description: 'Получите 3 легендарных предмета',
    category: 'collection',
    requirement: { type: 'legendary_items', value: 3 },
    reward: { gold: 1000, exp: 500 },
    icon: Crown
  }
  // ... больше достижений
];
```

#### Компонент AchievementsScreen

Отображает:
- Категории достижений (вкладки)
- Список достижений с прогрессом
- Индикация выполненных достижений
- Кнопка получения награды

Функции:
- `checkAchievements()`: Проверяет прогресс всех достижений
- `unlockAchievement(achievementId)`: Разблокирует достижение
- `claimAchievementReward(achievementId)`: Выдает награду

### 8. Система сохранения

#### Структура сохранения

```javascript
const SAVE_KEY = 'rpg_game_save_v2';

const saveGame = (playerData) => {
  try {
    const saveData = {
      version: 2,
      timestamp: Date.now(),
      player: playerData
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    addNotification('Игра сохранена', 'success');
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    addNotification('Ошибка сохранения', 'error');
    return false;
  }
};

const loadGame = () => {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    
    const parsed = JSON.parse(saveData);
    
    // Проверка версии
    if (parsed.version !== 2) {
      console.warn('Несовместимая версия сохранения');
      return null;
    }
    
    return parsed.player;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return null;
  }
};
```

#### Автосохранение

```javascript
useEffect(() => {
  if (!player) return;
  
  // Автосохранение каждые 30 секунд
  const autoSaveInterval = setInterval(() => {
    saveGame(player);
  }, 30000);
  
  return () => clearInterval(autoSaveInterval);
}, [player]);

// Сохранение при закрытии страницы
useEffect(() => {
  const handleBeforeUnload = () => {
    if (player) saveGame(player);
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [player]);
```

#### Экспорт/Импорт

```javascript
const exportSave = () => {
  const saveData = localStorage.getItem(SAVE_KEY);
  if (!saveData) return;
  
  const blob = new Blob([saveData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rpg_save_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importSave = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const saveData = JSON.parse(e.target.result);
      if (saveData.version === 2) {
        localStorage.setItem(SAVE_KEY, e.target.result);
        window.location.reload();
      } else {
        addNotification('Несовместимая версия сохранения', 'error');
      }
    } catch (error) {
      addNotification('Ошибка импорта', 'error');
    }
  };
  reader.readAsText(file);
};
```


## Модели данных

### Расширенная модель игрока

```javascript
interface Player {
  // Базовые характеристики
  name: string;
  className: string;
  classId: string;
  avatarId: number;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  str: number;
  def: number;
  gold: number;
  locationId: number;
  
  // Инвентарь
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
  };
  resources: Record<string, number>; // НОВОЕ
  
  // Квесты
  activeQuests: Quest[];
  completedQuests: number[];
  
  // Статистика
  totalSteps: number;
  totalKills: number;
  questsCompletedCount: number;
  totalCrafts: number; // НОВОЕ
  
  // Коллекции
  collectedAvatars: number[];
  
  // Профессия (НОВОЕ)
  profession: string | null;
  professionLevel: number;
  professionExp: number;
  professionMaxExp: number;
  
  // Гильдия (НОВОЕ)
  guildId: number | null;
  guildRole: 'leader' | 'member' | null;
  guildContribution: number;
  
  // Достижения (НОВОЕ)
  achievements: number[];
  unclaimedAchievements: number[];
}
```

### Модель рецепта

```javascript
interface Recipe {
  id: number;
  name: string;
  profession: string;
  requiredLevel: number;
  ingredients: Array<{
    resourceId: string;
    amount: number;
  }>;
  result: {
    itemId: number;
    name: string;
    type: string;
    val: number;
    rarity: string;
  };
  craftTime: number;
  expReward: number;
}
```

### Модель гильдии

```javascript
interface Guild {
  id: number;
  name: string;
  leaderId: string;
  level: number;
  exp: number;
  maxExp: number;
  members: Array<{
    playerId: string;
    name: string;
    level: number;
    role: 'leader' | 'member';
    contribution: number;
  }>;
  bonuses: {
    expBonus: number;
    goldBonus: number;
    energyRegen: number;
  };
  createdAt: number;
}
```


### 9. Группировка предметов в кузнице

#### Структура компонента кузницы

Компонент кузницы должен отображать предметы, сгруппированные по категориям:

```javascript
const ForgeScreen = ({ player, setPlayer }) => {
  // Группировка предметов по типу
  const weaponItems = player.inventory.filter(item => item.type === 'weapon');
  const armorItems = player.inventory.filter(item => item.type === 'armor');
  
  return (
    <div className="space-y-6">
      {/* Секция оружия */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sword className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-orange-400">Оружие</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {weaponItems.map((item, index) => (
            <ForgeItemCard 
              key={index} 
              item={item} 
              player={player}
              setPlayer={setPlayer}
            />
          ))}
          {weaponItems.length === 0 && (
            <p className="text-slate-400 text-center py-4">
              Нет оружия для улучшения
            </p>
          )}
        </div>
      </div>
      
      {/* Секция брони */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-blue-400">Броня</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {armorItems.map((item, index) => (
            <ForgeItemCard 
              key={index} 
              item={item} 
              player={player}
              setPlayer={setPlayer}
            />
          ))}
          {armorItems.length === 0 && (
            <p className="text-slate-400 text-center py-4">
              Нет брони для улучшения
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Компонент карточки предмета

```javascript
const ForgeItemCard = ({ item, player, setPlayer }) => {
  const upgradeCost = calculateUpgradeCost(item);
  const enchantCost = calculateEnchantCost(item);
  
  return (
    <div className={`border rounded-lg p-3 ${RARITY_COLORS[item.rarity]} ${RARITY_BG[item.rarity]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-sm text-slate-400">
            {item.type === 'weapon' ? `Урон: ${item.val}` : `Защита: ${item.val}`}
          </p>
          {item.level && <p className="text-sm text-slate-400">Уровень: {item.level}</p>}
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleUpgrade(item)}
          disabled={player.gold < upgradeCost}
          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 
            disabled:text-slate-500 rounded transition-colors text-sm"
        >
          Улучшить ({upgradeCost} золота)
        </button>
        
        <button
          onClick={() => handleEnchant(item)}
          disabled={player.gold < enchantCost}
          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 
            disabled:text-slate-500 rounded transition-colors text-sm"
        >
          Зачаровать ({enchantCost} золота)
        </button>
      </div>
    </div>
  );
};
```

#### Функции улучшения и зачарования

```javascript
const calculateUpgradeCost = (item) => {
  const baseLevel = item.level || 1;
  return Math.floor(100 * baseLevel * 1.5);
};

const calculateEnchantCost = (item) => {
  const baseLevel = item.level || 1;
  return Math.floor(200 * baseLevel * 1.8);
};

const handleUpgrade = (item) => {
  const cost = calculateUpgradeCost(item);
  
  if (player.gold < cost) {
    addNotification('Недостаточно золота', 'error');
    return;
  }
  
  setPlayer(prev => {
    const updatedInventory = prev.inventory.map(invItem => {
      if (invItem === item) {
        return {
          ...invItem,
          level: (invItem.level || 1) + 1,
          val: Math.floor(invItem.val * 1.2)
        };
      }
      return invItem;
    });
    
    return {
      ...prev,
      gold: prev.gold - cost,
      inventory: updatedInventory
    };
  });
  
  addNotification(`${item.name} улучшен!`, 'success');
};

const handleEnchant = (item) => {
  const cost = calculateEnchantCost(item);
  
  if (player.gold < cost) {
    addNotification('Недостаточно золота', 'error');
    return;
  }
  
  // Случайное зачарование
  const enchantments = [
    { name: 'Огненное', bonus: '+10% урона от огня' },
    { name: 'Ледяное', bonus: '+10% урона от льда' },
    { name: 'Молниеносное', bonus: '+5% шанс крита' },
    { name: 'Защитное', bonus: '+15 к защите' },
    { name: 'Живучее', bonus: '+20 к здоровью' }
  ];
  
  const randomEnchant = enchantments[Math.floor(Math.random() * enchantments.length)];
  
  setPlayer(prev => {
    const updatedInventory = prev.inventory.map(invItem => {
      if (invItem === item) {
        return {
          ...invItem,
          enchantment: randomEnchant.name,
          enchantmentBonus: randomEnchant.bonus,
          name: `${randomEnchant.name} ${invItem.name}`
        };
      }
      return invItem;
    });
    
    return {
      ...prev,
      gold: prev.gold - cost,
      inventory: updatedInventory
    };
  });
  
  addNotification(`${item.name} зачарован! ${randomEnchant.bonus}`, 'legendary');
};
```

### 10. Система случайных событий

#### Структура данных событий

```javascript
const RANDOM_EVENTS = [
  {
    id: 'meteor_shower',
    name: 'Метеоритный дождь',
    description: 'С неба падают метеориты с редкими ресурсами!',
    icon: Sparkles,
    chance: 0.05, // 5% шанс при каждом шаге
    duration: 300000, // 5 минут
    cooldown: 1800000, // 30 минут
    action: 'collect',
    energyCost: 5,
    rewards: {
      resources: ['crystal', 'mithril_ore', 'star_dust'],
      amount: [2, 3]
    }
  },
  {
    id: 'monster_invasion',
    name: 'Нашествие монстров',
    description: 'Орда монстров атакует! Защитите территорию!',
    icon: Skull,
    chance: 0.03, // 3% шанс
    duration: 600000, // 10 минут
    cooldown: 3600000, // 60 минут
    action: 'fight',
    energyCost: 10,
    waves: 5,
    rewards: {
      gold: [100, 200],
      exp: [150, 250],
      itemChance: 0.3
    }
  },
  {
    id: 'traveling_merchant',
    name: 'Торговец-путешественник',
    description: 'Загадочный торговец предлагает редкие товары!',
    icon: ShoppingBag,
    chance: 0.08, // 8% шанс
    duration: 180000, // 3 минуты
    cooldown: 1200000, // 20 минут
    action: 'trade',
    stock: [
      { itemId: 15, discount: 0.4 },
      { itemId: 23, discount: 0.5 },
      { itemId: 31, discount: 0.6 }
    ]
  },
  {
    id: 'treasure_vault',
    name: 'Сокровищница',
    description: 'Вы нашли древнюю сокровищницу!',
    icon: Package,
    chance: 0.04, // 4% шанс
    duration: 120000, // 2 минуты
    cooldown: 2400000, // 40 минут
    action: 'open',
    energyCost: 20,
    rewards: {
      gold: [500, 1000],
      exp: [300, 500],
      guaranteedItem: { rarity: 'rare', minRarity: 'rare' },
      chestChance: 0.3
    }
  }
];
```

#### Компонент EventNotification

Отображает:
- Название и описание события
- Иконку события
- Таймер обратного отсчета
- Кнопку взаимодействия с событием
- Стоимость энергии (если применимо)

Позиционирование: верхняя часть экрана, над основным контентом.

#### Функции управления событиями

```javascript
const triggerRandomEvent = () => {
  // Проверяем, нет ли активного события
  if (activeEvent) return;
  
  const now = Date.now();
  
  // Фильтруем события по кулдауну
  const availableEvents = RANDOM_EVENTS.filter(event => {
    const lastTrigger = eventCooldowns[event.id] || 0;
    return now - lastTrigger >= event.cooldown;
  });
  
  if (availableEvents.length === 0) return;
  
  // Проверяем шанс для каждого события
  for (const event of availableEvents) {
    if (Math.random() < event.chance) {
      startEvent(event);
      break;
    }
  }
};

const startEvent = (event) => {
  const now = Date.now();
  
  setActiveEvent({
    ...event,
    startTime: now,
    endTime: now + event.duration
  });
  
  addNotification(`Событие: ${event.name}!`, 'legendary', 5000);
};
```

#### Интеграция в handleStep

Модификация функции `handleStep()`:

```javascript
const handleStep = () => {
  // ... существующая логика ...
  
  // Проверка случайных событий
  triggerRandomEvent();
  
  // ... остальная логика ...
};
```

#### Автоматическое закрытие событий

```javascript
useEffect(() => {
  if (!activeEvent) return;
  
  const checkExpiration = setInterval(() => {
    const now = Date.now();
    if (now >= activeEvent.endTime) {
      // Событие истекло
      setEventCooldowns(prev => ({
        ...prev,
        [activeEvent.id]: now
      }));
      setActiveEvent(null);
      addNotification('Событие завершено', 'info');
    }
  }, 1000);
  
  return () => clearInterval(checkExpiration);
}, [activeEvent]);
```

#### Обработчики событий

**Метеоритный дождь:**
```javascript
const collectMeteorResources = () => {
  if (!activeEvent || activeEvent.id !== 'meteor_shower') return;
  if (player.energy < 5) {
    addNotification('Недостаточно энергии', 'warning');
    return;
  }
  
  const event = RANDOM_EVENTS.find(e => e.id === 'meteor_shower');
  const rewards = event.rewards;
  
  // Выбираем случайный ресурс
  const resource = rewards.resources[getRandomInt(0, rewards.resources.length - 1)];
  const amount = getRandomInt(rewards.amount[0], rewards.amount[1]);
  
  addResourceToInventory(resource, amount);
  setPlayer(prev => ({ ...prev, energy: prev.energy - 5 }));
  addNotification(`Собрано: ${amount}x ${resource}`, 'success');
};
```

**Нашествие монстров:**
```javascript
const fightMonsterWave = () => {
  if (!activeEvent || activeEvent.id !== 'monster_invasion') return;
  if (player.energy < 10) {
    addNotification('Недостаточно энергии', 'warning');
    return;
  }
  
  // Создаем врага для волны
  const waveEnemy = {
    name: `Захватчик (Волна ${monsterWave + 1})`,
    hp: 50 + monsterWave * 20,
    maxHp: 50 + monsterWave * 20,
    dmg: 10 + monsterWave * 5
  };
  
  setEnemy(waveEnemy);
  setPlayer(prev => ({ ...prev, energy: prev.energy - 10 }));
  setMonsterWave(prev => prev + 1);
  
  // Проверяем, последняя ли это волна
  if (monsterWave + 1 >= activeEvent.waves) {
    // Финальные награды после победы над последней волной
    // (обрабатывается в handleAttack при победе)
  }
};
```

**Торговец-путешественник:**
```javascript
const buyFromMerchant = (stockItem) => {
  if (!activeEvent || activeEvent.id !== 'traveling_merchant') return;
  
  const item = ITEMS_DB.find(i => i.id === stockItem.itemId);
  const discountedPrice = Math.floor(item.price * (1 - stockItem.discount));
  
  if (player.gold < discountedPrice) {
    addNotification('Недостаточно золота', 'warning');
    return;
  }
  
  setPlayer(prev => ({
    ...prev,
    gold: prev.gold - discountedPrice,
    inventory: [...prev.inventory, item]
  }));
  
  addNotification(`Куплено: ${item.name} за ${discountedPrice} золота`, 'success');
};
```

**Сокровищница:**
```javascript
const openTreasureVault = () => {
  if (!activeEvent || activeEvent.id !== 'treasure_vault') return;
  if (player.energy < 20) {
    addNotification('Недостаточно энергии', 'warning');
    return;
  }
  
  const event = RANDOM_EVENTS.find(e => e.id === 'treasure_vault');
  const rewards = event.rewards;
  
  // Золото и опыт
  const gold = getRandomInt(rewards.gold[0], rewards.gold[1]);
  const exp = getRandomInt(rewards.exp[0], rewards.exp[1]);
  
  // Гарантированный редкий предмет
  const rareItems = ITEMS_DB.filter(i => 
    i.rarity === 'rare' || i.rarity === 'epic' || i.rarity === 'legendary'
  );
  const item = rareItems[getRandomInt(0, rareItems.length - 1)];
  
  // Шанс на сундук
  const chestReward = Math.random() < rewards.chestChance ? 
    { type: 'chest', name: 'Золотой сундук' } : null;
  
  setPlayer(prev => ({
    ...prev,
    energy: prev.energy - 20,
    gold: prev.gold + gold,
    exp: prev.exp + exp,
    inventory: [...prev.inventory, item, ...(chestReward ? [chestReward] : [])]
  }));
  
  addNotification(`Получено: ${gold} золота, ${exp} опыта, ${item.name}`, 'legendary');
  if (chestReward) addNotification('Бонус: Золотой сундук!', 'legendary');
  
  // Закрываем событие
  setActiveEvent(null);
};
```

## Свойства корректности

*Свойство — это характеристика или поведение, которое должно выполняться во всех допустимых выполнениях системы — по сути, формальное утверждение о том, что должна делать система. Свойства служат мостом между человекочитаемыми спецификациями и машинопроверяемыми гарантиями корректности.*

### Свойство 1: Назначение профессии устанавливает начальное состояние

*Для любой* выбранной профессии, после назначения профессии персонажу, поле `player.profession` должно быть установлено в ID профессии, а `player.professionLevel` должен равняться 1.

**Validates: Requirements 1.2**

### Свойство 2: Действия профессии увеличивают опыт

*Для любой* профессии и любого начального значения опыта профессии, выполнение действия профессии должно увеличить `player.professionExp` на положительное значение.

**Validates: Requirements 1.3**

### Свойство 3: Повышение уровня профессии сбрасывает опыт

*Для любой* профессии, когда `player.professionExp` достигает `player.professionMaxExp`, выполнение действия должно увеличить `player.professionLevel` на 1 и установить `player.professionExp` меньше `player.professionMaxExp`.

**Validates: Requirements 1.4**

### Свойство 4: Повышение уровня разблокирует рецепты

*Для любого* уровня профессии N, все рецепты с `requiredLevel <= N` и соответствующей профессией должны быть доступны для крафта.

**Validates: Requirements 1.6**

### Свойство 5: Фильтрация рецептов по профессии и уровню

*Для любой* комбинации профессии и уровня навыка, список доступных рецептов должен содержать только рецепты, где `recipe.profession === player.profession` и `recipe.requiredLevel <= player.professionLevel`.

**Validates: Requirements 2.1**

### Свойство 6: Валидация ресурсов перед крафтом

*Для любого* рецепта, попытка крафта должна быть разрешена только если для каждого ингредиента `player.resources[ingredient.resourceId] >= ingredient.amount`.

**Validates: Requirements 2.3**

### Свойство 7: Отклонение крафта при недостатке ресурсов

*Для любого* рецепта, если хотя бы для одного ингредиента `player.resources[ingredient.resourceId] < ingredient.amount`, то попытка крафта должна быть отклонена и состояние игрока не должно измениться.

**Validates: Requirements 2.4**

### Свойство 8: Транзакция крафта изменяет инвентарь

*Для любого* успешного крафта, количество каждого использованного ресурса должно уменьшиться на `ingredient.amount`, а созданный предмет должен появиться в `player.inventory`.

**Validates: Requirements 2.5**

### Свойство 9: Крафт добавляет опыт профессии

*Для любого* успешного крафта, `player.professionExp` должен увеличиться на `recipe.expReward`.

**Validates: Requirements 2.6**

### Свойство 10: Ресурсы соответствуют локации

*Для любого* ресурса, найденного во время путешествия в локации L, этот ресурс должен быть в списке `resource.locations` и содержать ID локации L.

**Validates: Requirements 3.2**

### Свойство 11: Находка ресурса показывает уведомление

*Для любого* найденного ресурса, должно быть добавлено уведомление в лог с типом 'good' и текстом, содержащим название ресурса.

**Validates: Requirements 3.3**

### Свойство 12: Группировка одинаковых ресурсов

*Для любого* ресурса с `player.resources[resourceId] > 1`, в UI должен отображаться один элемент с количеством, а не несколько отдельных элементов.

**Validates: Requirements 3.6**

### Свойство 13: Создание гильдии назначает лидера и списывает золото

*Для любого* игрока с `player.gold >= 1000`, создание гильдии должно установить `player.guildRole = 'leader'`, уменьшить `player.gold` на 1000, и создать новую гильдию с игроком в качестве лидера.

**Validates: Requirements 4.2**

### Свойство 14: Доступность вступления в гильдию

*Для любого* игрока с `player.guildId === null`, кнопка вступления в гильдию должна быть доступна (не disabled).

**Validates: Requirements 4.4**

### Свойство 15: Применение бонусов гильдии

*Для любого* члена гильдии, получаемые награды (опыт, золото) должны быть увеличены на процент соответствующего бонуса гильдии.

**Validates: Requirements 4.6**

### Свойство 16: Повышение уровня гильдии

*Для любой* гильдии, когда `guild.exp >= guild.maxExp`, добавление опыта должно увеличить `guild.level` на 1 и установить `guild.exp < guild.maxExp`.

**Validates: Requirements 4.7**

### Свойство 17: Уведомления о важных событиях

*Для любого* важного события (повышение уровня, получение предмета, выполнение квеста), должно быть добавлено уведомление в систему уведомлений.

**Validates: Requirements 5.2**

### Свойство 18: Цветовое кодирование редкости

*Для любого* предмета с редкостью R, CSS классы элемента должны включать цвет, соответствующий редкости: common → slate, uncommon → green, rare → blue, epic → purple, legendary → orange.

**Validates: Requirements 5.4, 8.3**

### Свойство 19: Разблокировка локаций по уровню

*Для любой* локации с `location.minLvl <= player.level`, локация должна быть доступна для выбора и путешествия.

**Validates: Requirements 6.2**

### Свойство 20: Масштабирование врагов по локации

*Для любого* врага, встреченного в локации L, характеристики врага (HP, урон) должны быть умножены на `location.enemyPower` локации L.

**Validates: Requirements 6.3, 7.3**

### Свойство 21: Соответствие врагов локации

*Для любого* врага, встреченного в локации L, этот враг должен быть в списке доступных врагов для локации L.

**Validates: Requirements 7.2**

### Свойство 22: Награды соответствуют сложности врага

*Для любого* врага, награды (золото, опыт) должны быть пропорциональны характеристикам врага (HP, урон).

**Validates: Requirements 7.5**

### Свойство 23: Характеристики предметов соответствуют типу и редкости

*Для любого* предмета, значение характеристики (`val`) должно быть в диапазоне, соответствующем комбинации типа и редкости предмета.

**Validates: Requirements 8.4**

### Свойство 24: Эпические и легендарные предметы имеют эффекты

*Для любого* предмета с редкостью 'epic' или 'legendary', предмет должен иметь дополнительное поле с уникальным эффектом.

**Validates: Requirements 8.5**

### Свойство 25: Отслеживание статистики действий

*Для любого* действия типа T (шаг, убийство, крафт, квест), соответствующий счетчик статистики должен увеличиться на 1.

**Validates: Requirements 9.1**

### Свойство 26: Разблокировка достижений при выполнении условий

*Для любого* достижения A с условием C, когда условие C выполнено, достижение A должно быть добавлено в `player.achievements`.

**Validates: Requirements 9.2**

### Свойство 27: Награды за достижения

*Для любого* разблокированного достижения, при получении награды игрок должен получить золото и опыт, указанные в `achievement.reward`.

**Validates: Requirements 9.4**

### Свойство 28: Расчет прогресса достижений

*Для любого* достижения с прогрессом P и целью T, отображаемый процент должен равняться `(P / T) * 100`.

**Validates: Requirements 9.5**

### Свойство 29: Автосохранение после значимых действий

*Для любого* значимого действия (шаг, крафт, покупка, выполнение квеста), состояние игры должно быть сохранено в localStorage.

**Validates: Requirements 10.1**

### Свойство 30: Round-trip сохранения и загрузки

*Для любого* состояния игрока P, сохранение P в localStorage и последующая загрузка должны вернуть эквивалентное состояние P'.

**Validates: Requirements 10.2**

### Свойство 31: Round-trip экспорта и импорта

*Для любого* состояния игрока P, экспорт P в файл и последующий импорт должны восстановить эквивалентное состояние P'.

**Validates: Requirements 10.5, 10.6**

### Свойство 32: Обработка поврежденных сохранений

*Для любого* невалидного или несовместимого сохранения, попытка загрузки должна вернуть null и показать сообщение об ошибке.

**Validates: Requirements 10.7**

### Свойство 33: Группировка предметов в кузнице по типу

*Для любого* набора предметов в инвентаре, отображение в кузнице должно группировать все предметы с `type === 'weapon'` в секцию "Оружие" и все предметы с `type === 'armor'` в секцию "Броня".

**Validates: Requirements 11.2, 11.3**

### Свойство 34: Запуск события при отсутствии активного

*Для любого* события E с шансом C, если нет активного события и событие не на кулдауне, то при проверке с вероятностью C событие E должно быть запущено.

**Validates: Requirements 12.1, 12.11**

### Свойство 35: Отображение информации о событии

*Для любого* активного события, UI должен отображать название, описание, иконку и таймер обратного отсчета события.

**Validates: Requirements 12.2, 12.4**

### Свойство 36: Автоматическое закрытие события по таймеру

*Для любого* активного события с временем окончания T, когда текущее время >= T, событие должно быть закрыто и добавлено в кулдауны.

**Validates: Requirements 12.5, 12.6**

### Свойство 37: Награды метеоритного дождя

*Для любого* взаимодействия с событием "метеоритный дождь", если у игрока >= 5 энергии, то должен быть добавлен случайный редкий ресурс из списка события, энергия уменьшена на 5.

**Validates: Requirements 12.7**

### Свойство 38: Волны нашествия монстров

*Для любого* взаимодействия с событием "нашествие монстров", если у игрока >= 10 энергии, то должен быть создан враг для текущей волны, энергия уменьшена на 10, счетчик волн увеличен на 1.

**Validates: Requirements 12.8**

### Свойство 39: Скидки торговца-путешественника

*Для любого* предмета в ассортименте торговца со скидкой D, цена покупки должна равняться `basePrice * (1 - D)`, где D находится в диапазоне [0.4, 0.6].

**Validates: Requirements 12.9**

### Свойство 40: Награды сокровищницы

*Для любого* взаимодействия с событием "сокровищница", если у игрока >= 20 энергии, то должны быть выданы: золото в диапазоне [500, 1000], опыт в диапазоне [300, 500], гарантированный предмет редкости >= rare, энергия уменьшена на 20.

**Validates: Requirements 12.10**

### Свойство 41: Эксклюзивность событий

*Для любого* момента времени, количество активных событий должно быть <= 1.

**Validates: Requirements 12.11**

### Свойство 42: Успешная ловля рыбы при своевременной реакции

*Для любой* попытки рыбалки, если игрок нажимает кнопку в течение окна реакции (2 секунды после поклевки), то рыба должна быть успешно поймана и добавлена в `player.resources`.

**Validates: Requirements 13.4**

### Свойство 43: Рыба соответствует локации

*Для любой* пойманной рыбы в локации L, тип рыбы должен быть в списке доступных рыб для локации L.

**Validates: Requirements 13.6**

### Свойство 44: Стоимость рыбы зависит от редкости

*Для любой* рыбы с редкостью R, цена продажи должна быть в диапазоне, соответствующем редкости: common [5-10], uncommon [15-30], rare [40-80], epic [100-200], legendary [300-500].

**Validates: Requirements 13.9**

### Свойство 45: Расход энергии при рыбалке

*Для любой* попытки рыбалки, `player.energy` должна уменьшиться на 3, независимо от успеха или неудачи.

**Validates: Requirements 13.1**


## 11. Система рыбалки

### Структура данных рыб

```javascript
const FISH_DB = [
  // ОБЫЧНЫЕ РЫБЫ
  { 
    id: 'small_fish', 
    name: 'Мелкая рыбешка', 
    rarity: 'common', 
    sellPrice: 5, 
    locations: [1, 2, 3, 4, 5, 6, 7, 8],
    icon: '🐟'
  },
  { 
    id: 'carp', 
    name: 'Карп', 
    rarity: 'common', 
    sellPrice: 8, 
    locations: [1, 2, 3],
    icon: '🐟'
  },
  { 
    id: 'perch', 
    name: 'Окунь', 
    rarity: 'common', 
    sellPrice: 10, 
    locations: [1, 2, 3, 4],
    icon: '🐟'
  },
  
  // НЕОБЫЧНЫЕ РЫБЫ
  { 
    id: 'pike', 
    name: 'Щука', 
    rarity: 'uncommon', 
    sellPrice: 20, 
    locations: [2, 3, 4],
    icon: '🐠'
  },
  { 
    id: 'salmon', 
    name: 'Лосось', 
    rarity: 'uncommon', 
    sellPrice: 25, 
    locations: [3, 4, 6],
    icon: '🐠'
  },
  { 
    id: 'catfish', 
    name: 'Сом', 
    rarity: 'uncommon', 
    sellPrice: 30, 
    locations: [3, 4, 7],
    icon: '🐠'
  },
  
  // РЕДКИЕ РЫБЫ
  { 
    id: 'golden_carp', 
    name: 'Золотой карп', 
    rarity: 'rare', 
    sellPrice: 60, 
    locations: [3, 4, 5],
    icon: '🐡'
  },
  { 
    id: 'ice_fish', 
    name: 'Ледяная рыба', 
    rarity: 'rare', 
    sellPrice: 70, 
    locations: [6],
    icon: '🐡'
  },
  { 
    id: 'shadow_fish', 
    name: 'Теневая рыба', 
    rarity: 'rare', 
    sellPrice: 80, 
    locations: [7],
    icon: '🐡'
  },
  
  // ЭПИЧЕСКИЕ РЫБЫ
  { 
    id: 'crystal_fish', 
    name: 'Кристальная рыба', 
    rarity: 'epic', 
    sellPrice: 150, 
    locations: [5, 6],
    icon: '🐬'
  },
  { 
    id: 'fire_fish', 
    name: 'Огненная рыба', 
    rarity: 'epic', 
    sellPrice: 180, 
    locations: [4, 8],
    icon: '🐬'
  },
  
  // ЛЕГЕНДАРНЫЕ РЫБЫ
  { 
    id: 'dragon_fish', 
    name: 'Драконья рыба', 
    rarity: 'legendary', 
    sellPrice: 400, 
    locations: [8],
    icon: '🐉'
  },
  { 
    id: 'ancient_leviathan', 
    name: 'Древний Левиафан', 
    rarity: 'legendary', 
    sellPrice: 500, 
    locations: [8],
    icon: '🐉'
  }
];
```

### Рецепты с использованием рыбы

Добавляем новые рецепты крафта, использующие рыбу:

```javascript
const FISH_RECIPES = [
  {
    id: 10,
    name: 'Рыбный суп',
    profession: 'alchemist',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'small_fish', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 34,
      name: 'Рыбный суп',
      type: 'consumable',
      val: 40,
      rarity: 'common',
      effect: 'Восстанавливает 40 HP'
    },
    craftTime: 1500,
    expReward: 15
  },
  {
    id: 11,
    name: 'Эликсир моря',
    profession: 'alchemist',
    requiredLevel: 3,
    ingredients: [
      { resourceId: 'golden_carp', amount: 1 },
      { resourceId: 'blue_herb', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 35,
      name: 'Эликсир моря',
      type: 'consumable',
      val: 0,
      rarity: 'rare',
      effect: '+5 к защите на 10 шагов'
    },
    craftTime: 3000,
    expReward: 50
  },
  {
    id: 12,
    name: 'Драконий эликсир',
    profession: 'alchemist',
    requiredLevel: 5,
    ingredients: [
      { resourceId: 'dragon_fish', amount: 1 },
      { resourceId: 'fire_crystal', amount: 2 },
      { resourceId: 'crystal', amount: 3 }
    ],
    result: {
      itemId: 36,
      name: 'Драконий эликсир',
      type: 'consumable',
      val: 0,
      rarity: 'legendary',
      effect: '+15 к силе и +10 к защите на 20 шагов'
    },
    craftTime: 5000,
    expReward: 150
  }
];
```

### Компонент FishingScreen

```javascript
const FishingScreen = ({ player, setPlayer, addLog, addNotification }) => {
  const [isFishing, setIsFishing] = useState(false);
  const [fishingTimer, setFishingTimer] = useState(0);
  const [biteTime, setBiteTime] = useState(null);
  const [reactionWindow, setReactionWindow] = useState(false);
  const [caughtFish, setCaughtFish] = useState(null);
  
  const currentLocation = LOCATIONS.find(l => l.id === player.locationId);
  const availableFish = FISH_DB.filter(f => f.locations.includes(player.locationId));
  
  // Статистика рыбалки
  const totalFishCaught = Object.keys(player.resources || {})
    .filter(key => FISH_DB.some(f => f.id === key))
    .reduce((sum, key) => sum + (player.resources[key] || 0), 0);
  
  const rarestFish = Object.keys(player.resources || {})
    .map(key => FISH_DB.find(f => f.id === key))
    .filter(Boolean)
    .sort((a, b) => {
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    })[0];
  
  const startFishing = () => {
    if (player.energy < 3) {
      addNotification('Недостаточно энергии (требуется 3)', 'warning');
      return;
    }
    
    setIsFishing(true);
    setFishingTimer(0);
    setCaughtFish(null);
    setReactionWindow(false);
    
    // Уменьшаем энергию
    setPlayer(p => ({ ...p, energy: p.energy - 3 }));
    
    // Случайное время поклевки (5-10 секунд)
    const biteDelay = getRandomInt(5000, 10000);
    setBiteTime(Date.now() + biteDelay);
    
    addLog('Вы забросили удочку...', 'neutral');
  };
  
  useEffect(() => {
    if (!isFishing || !biteTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (biteTime - 10000); // Время с начала рыбалки
      setFishingTimer(Math.floor(elapsed / 1000));
      
      // Проверяем, наступило ли время поклевки
      if (now >= biteTime && !reactionWindow) {
        setReactionWindow(true);
        addNotification('🎣 ПОКЛЕВКА! Нажмите кнопку!', 'legendary', 2000);
        
        // Окно реакции 2 секунды
        setTimeout(() => {
          if (reactionWindow) {
            // Игрок не успел
            setIsFishing(false);
            setReactionWindow(false);
            addLog('Рыба сорвалась с крючка...', 'bad');
            addNotification('Рыба сорвалась!', 'error');
          }
        }, 2000);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isFishing, biteTime, reactionWindow]);
  
  const catchFish = () => {
    if (!reactionWindow) return;
    
    setReactionWindow(false);
    setIsFishing(false);
    
    // Определяем пойманную рыбу
    const rarityChances = {
      common: 0.5,
      uncommon: 0.3,
      rare: 0.15,
      epic: 0.04,
      legendary: 0.01
    };
    
    // Бонус от уровня игрока (каждые 5 уровней +1% к редким)
    const levelBonus = Math.floor(player.level / 5) * 0.01;
    rarityChances.rare += levelBonus;
    rarityChances.epic += levelBonus / 2;
    rarityChances.legendary += levelBonus / 4;
    
    // Выбираем редкость
    const roll = Math.random();
    let selectedRarity = 'common';
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulative += chance;
      if (roll <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Выбираем рыбу из доступных с выбранной редкостью
    const fishOfRarity = availableFish.filter(f => f.rarity === selectedRarity);
    const fish = fishOfRarity.length > 0 
      ? fishOfRarity[getRandomInt(0, fishOfRarity.length - 1)]
      : availableFish[getRandomInt(0, availableFish.length - 1)];
    
    // Добавляем рыбу в ресурсы
    setPlayer(p => ({
      ...p,
      resources: {
        ...p.resources,
        [fish.id]: (p.resources[fish.id] || 0) + 1
      }
    }));
    
    setCaughtFish(fish);
    addLog(`Вы поймали ${fish.name}!`, fish.rarity === 'legendary' ? 'epic' : 'good');
    addNotification(`🎣 Поймана рыба: ${fish.name}!`, fish.rarity === 'legendary' ? 'legendary' : 'success');
  };
  
  const sellFish = (fishId) => {
    const fish = FISH_DB.find(f => f.id === fishId);
    if (!fish) return;
    
    const count = player.resources[fishId] || 0;
    if (count === 0) return;
    
    const totalPrice = fish.sellPrice * count;
    
    setPlayer(p => {
      const newResources = { ...p.resources };
      delete newResources[fishId];
      
      return {
        ...p,
        resources: newResources,
        gold: p.gold + totalPrice
      };
    });
    
    addLog(`Продано ${count}x ${fish.name} за ${totalPrice} золота`, 'good');
    addNotification(`Продано за ${totalPrice} золота`, 'success');
  };
  
  return (
    <div className="space-y-6">
      {/* Информация о локации */}
      <Card title="Рыбалка" icon={MapIcon}>
        <div className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-blue-400" size={20} />
              <div>
                <div className="font-bold text-white">{currentLocation.name}</div>
                <div className="text-sm text-slate-400">
                  Доступно рыб: {availableFish.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-2xl font-bold text-white">{totalFishCaught}</div>
              <div className="text-xs text-slate-500 uppercase">Всего поймано</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-lg font-bold text-orange-400">
                {rarestFish ? rarestFish.name : '—'}
              </div>
              <div className="text-xs text-slate-500 uppercase">Самая редкая</div>
            </div>
          </div>
          
          {/* Кнопка рыбалки */}
          {!isFishing ? (
            <Button 
              onClick={startFishing} 
              disabled={player.energy < 3}
              variant="primary"
              className="w-full py-3"
            >
              🎣 Начать рыбалку (3 энергии)
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 text-center">
                <div className="text-sm text-blue-300 mb-2">
                  {reactionWindow ? '🎣 ПОКЛЕВКА! НАЖМИТЕ СЕЙЧАС!' : 'Ожидание поклевки...'}
                </div>
                <div className="text-2xl font-bold text-white">{fishingTimer}s</div>
              </div>
              
              {reactionWindow && (
                <Button 
                  onClick={catchFish}
                  variant="success"
                  className="w-full py-4 text-lg animate-pulse"
                >
                  ⚡ ПОЙМАТЬ!
                </Button>
              )}
            </div>
          )}
          
          {/* Результат */}
          {caughtFish && (
            <div className={`${RARITY_BG[caughtFish.rarity]} border-2 ${RARITY_COLORS[caughtFish.rarity]} rounded-lg p-4 animate-in fade-in zoom-in duration-300`}>
              <div className="text-center">
                <div className="text-4xl mb-2">{caughtFish.icon}</div>
                <div className={`text-xl font-bold ${RARITY_COLORS[caughtFish.rarity]}`}>
                  {caughtFish.name}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Цена: {caughtFish.sellPrice} золота
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Инвентарь рыбы */}
      <Card title="Пойманная рыба" icon={Backpack}>
        <div className="space-y-2">
          {Object.keys(player.resources || {})
            .map(key => ({ fish: FISH_DB.find(f => f.id === key), count: player.resources[key] }))
            .filter(({ fish }) => fish)
            .sort((a, b) => {
              const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
              return rarityOrder[b.fish.rarity] - rarityOrder[a.fish.rarity];
            })
            .map(({ fish, count }) => (
              <div 
                key={fish.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${RARITY_COLORS[fish.rarity]} ${RARITY_BG[fish.rarity]}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{fish.icon}</div>
                  <div>
                    <div className="font-bold">{fish.name}</div>
                    <div className="text-xs text-slate-400">
                      Количество: {count} | Цена: {fish.sellPrice} золота
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => sellFish(fish.id)}
                  variant="gold"
                  className="text-sm"
                >
                  Продать все ({fish.sellPrice * count} 💰)
                </Button>
              </div>
            ))}
          
          {Object.keys(player.resources || {}).filter(key => FISH_DB.some(f => f.id === key)).length === 0 && (
            <div className="text-center text-slate-500 py-8">
              Вы еще не поймали ни одной рыбы
            </div>
          )}
        </div>
      </Card>
      
      {/* Доступные рыбы в локации */}
      <Card title="Рыбы в этой локации" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-2">
          {availableFish.map(fish => (
            <div 
              key={fish.id}
              className={`p-2 rounded-lg border ${RARITY_COLORS[fish.rarity]} ${RARITY_BG[fish.rarity]} text-center`}
            >
              <div className="text-2xl mb-1">{fish.icon}</div>
              <div className="text-xs font-bold">{fish.name}</div>
              <div className="text-[10px] text-slate-400">{fish.sellPrice} 💰</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
```

### Интеграция в навигацию

Добавляем новый раздел "Рыбалка" в навигацию:

```javascript
<NavItem 
  icon={Target} 
  label="Рыбалка" 
  active={activeTab === 'fishing'} 
  onClick={() => setActiveTab('fishing')} 
/>
```


## Обработка ошибок

### Стратегия обработки ошибок

1. **Валидация входных данных**: Все пользовательские действия проходят валидацию перед выполнением
2. **Graceful degradation**: При ошибках система сохраняет работоспособность
3. **Информативные сообщения**: Пользователь получает понятные уведомления об ошибках
4. **Логирование**: Все ошибки логируются в консоль для отладки

### Типы ошибок и их обработка

#### Недостаточно ресурсов

```javascript
const handleCraftAttempt = (recipe) => {
  if (!canCraft(recipe)) {
    addNotification('Недостаточно ресурсов для крафта', 'error');
    return false;
  }
  // ... продолжить крафт
};
```

#### Недостаточно золота

```javascript
const handleGuildCreation = (name) => {
  if (player.gold < 1000) {
    addNotification('Недостаточно золота для создания гильдии (требуется 1000)', 'error');
    return false;
  }
  // ... создать гильдию
};
```

#### Ошибки сохранения

```javascript
const saveGame = (playerData) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(playerData));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      addNotification('Недостаточно места для сохранения. Очистите localStorage.', 'error');
    } else {
      addNotification('Ошибка сохранения игры', 'error');
    }
    console.error('Save error:', error);
    return false;
  }
};
```

#### Поврежденные данные

```javascript
const loadGame = () => {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    
    const parsed = JSON.parse(saveData);
    
    // Валидация структуры
    if (!validateSaveStructure(parsed)) {
      throw new Error('Invalid save structure');
    }
    
    return parsed.player;
  } catch (error) {
    console.error('Load error:', error);
    addNotification('Сохранение повреждено. Начните новую игру.', 'error');
    return null;
  }
};
```

#### Недоступные действия

```javascript
const handleProfessionAction = () => {
  if (!player.profession) {
    addNotification('Сначала выберите профессию', 'warning');
    return;
  }
  
  if (player.energy < 5) {
    addNotification('Недостаточно энергии', 'warning');
    return;
  }
  
  // ... выполнить действие
};
```


## Стратегия тестирования

### Двойной подход к тестированию

Для обеспечения корректности системы используется комбинация unit-тестов и property-based тестов:

- **Unit-тесты**: Проверяют конкретные примеры, граничные случаи и условия ошибок
- **Property-тесты**: Проверяют универсальные свойства на множестве сгенерированных входных данных

Оба типа тестов дополняют друг друга и необходимы для комплексного покрытия.

### Баланс unit-тестирования

Unit-тесты полезны для конкретных примеров и граничных случаев, но следует избегать написания слишком большого количества unit-тестов, так как property-based тесты покрывают множество входных данных.

**Unit-тесты должны фокусироваться на:**
- Конкретных примерах, демонстрирующих корректное поведение
- Точках интеграции между компонентами
- Граничных случаях и условиях ошибок

**Property-тесты должны фокусироваться на:**
- Универсальных свойствах, которые выполняются для всех входных данных
- Комплексном покрытии входных данных через рандомизацию

### Конфигурация property-based тестов

Для property-based тестирования будет использоваться библиотека **fast-check** (для JavaScript/TypeScript).

**Требования к конфигурации:**
- Минимум 100 итераций на каждый property-тест (из-за рандомизации)
- Каждый property-тест должен ссылаться на свойство из документа дизайна
- Формат тега: `Feature: rpg-game-improvements, Property {number}: {property_text}`
- Каждое свойство корректности должно быть реализовано ОДНИМ property-based тестом

### Примеры тестов

#### Unit-тест: Создание гильдии

```javascript
describe('Guild Creation', () => {
  it('should create guild and deduct gold', () => {
    const player = { gold: 1500, guildId: null };
    const result = createGuild(player, 'Test Guild');
    
    expect(result.player.gold).toBe(500);
    expect(result.player.guildRole).toBe('leader');
    expect(result.guild.name).toBe('Test Guild');
  });
  
  it('should reject guild creation with insufficient gold', () => {
    const player = { gold: 500, guildId: null };
    const result = createGuild(player, 'Test Guild');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Недостаточно золота');
  });
});
```

#### Property-тест: Назначение профессии

```javascript
import fc from 'fast-check';

// Feature: rpg-game-improvements, Property 1: Назначение профессии устанавливает начальное состояние
describe('Profession Assignment Property', () => {
  it('should set profession and level to 1 for any profession', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('blacksmith', 'alchemist', 'herbalist', 'miner'),
        (professionId) => {
          const player = { profession: null, professionLevel: 0 };
          const result = selectProfession(player, professionId);
          
          return result.profession === professionId && 
                 result.professionLevel === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property-тест: Транзакция крафта

```javascript
// Feature: rpg-game-improvements, Property 8: Транзакция крафта изменяет инвентарь
describe('Crafting Transaction Property', () => {
  it('should consume resources and add item for any valid craft', () => {
    fc.assert(
      fc.property(
        fc.record({
          recipe: fc.constantFrom(...RECIPES),
          resources: fc.dictionary(fc.string(), fc.nat(100))
        }),
        ({ recipe, resources }) => {
          // Ensure player has enough resources
          const player = {
            resources: { ...resources },
            inventory: [],
            professionExp: 0
          };
          
          recipe.ingredients.forEach(ing => {
            player.resources[ing.resourceId] = ing.amount + 10;
          });
          
          const initialResources = { ...player.resources };
          const result = craftItem(player, recipe);
          
          // Check resources consumed
          const resourcesConsumed = recipe.ingredients.every(ing =>
            result.resources[ing.resourceId] === 
            initialResources[ing.resourceId] - ing.amount
          );
          
          // Check item added
          const itemAdded = result.inventory.some(item =>
            item.name === recipe.result.name
          );
          
          return resourcesConsumed && itemAdded;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property-тест: Round-trip сохранения

```javascript
// Feature: rpg-game-improvements, Property 30: Round-trip сохранения и загрузки
describe('Save/Load Round-trip Property', () => {
  it('should preserve player state after save and load', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          level: fc.nat(100),
          gold: fc.nat(10000),
          profession: fc.option(fc.constantFrom('blacksmith', 'alchemist', 'herbalist', 'miner')),
          resources: fc.dictionary(fc.string(), fc.nat(100))
        }),
        (playerData) => {
          // Save
          saveGame(playerData);
          
          // Load
          const loaded = loadGame();
          
          // Compare (deep equality)
          return JSON.stringify(playerData) === JSON.stringify(loaded);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Покрытие тестами

**Обязательное покрытие:**
- Все 32 свойства корректности должны иметь property-based тесты
- Критические пути (создание персонажа, сохранение/загрузка) должны иметь unit-тесты
- Обработка ошибок должна быть покрыта unit-тестами

**Рекомендуемое покрытие:**
- Минимум 80% покрытие кода
- 100% покрытие критических функций (сохранение, крафт, бой)

### Интеграционное тестирование

Для проверки взаимодействия компонентов:
- Тестирование полного цикла крафта (выбор профессии → сбор ресурсов → крафт)
- Тестирование цикла гильдии (создание → вступление → получение бонусов)
- Тестирование цикла достижений (действие → прогресс → разблокировка → награда)

