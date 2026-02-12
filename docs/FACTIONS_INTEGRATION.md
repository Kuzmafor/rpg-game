# Интеграция системы фракций

## Обзор

Система репутации с фракциями добавляет 5 уникальных фракций, задания, награды и торговцев в игру.

## Быстрый старт

### 1. Импорт компонентов

```javascript
import { FactionScreen } from './components/Factions';
```

### 2. Добавление в навигацию

```javascript
import { Users } from 'lucide-react';

// В компоненте навигации
<NavItem 
  icon={Users} 
  label="Фракции" 
  active={activeTab === 'factions'} 
  onClick={() => setActiveTab('factions')} 
/>
```

### 3. Рендеринг экрана

```javascript
{activeTab === 'factions' && (
  <FactionScreen
    player={player}
    setPlayer={setPlayer}
    addNotification={addNotification}
    addLog={addLog}
    ITEMS_DB={ITEMS_DB}
  />
)}
```

### 4. Инициализация данных игрока

При создании нового персонажа добавьте:

```javascript
import { initializeFactionReputation } from './utils/factionUtils';
import { FACTION_QUESTS } from './constants/factionConstants';

const newPlayer = {
  // ... существующие поля ...
  
  // Репутация с фракциями
  factionReputation: initializeFactionReputation(),
  
  // Выполненные задания фракций
  completedFactionQuests: [],
  
  // Ежедневные задания
  dailyFactionQuests: FACTION_QUESTS
    .filter(q => q.isDaily)
    .map(q => ({
      questId: q.id,
      factionId: q.factionId,
      completedToday: false
    })),
  
  lastDailyReset: Date.now()
};
```

### 5. Миграция существующих сохранений

```javascript
import { migrateFactionData } from './utils/factionUtils';

// При загрузке игры
const loadGame = () => {
  const savedPlayer = localStorage.getItem('rpg_game_save');
  if (savedPlayer) {
    let playerData = JSON.parse(savedPlayer);
    
    // Мигрировать данные фракций
    playerData = migrateFactionData(playerData);
    
    setPlayer(playerData);
  }
};
```

## Фракции

### 1. Орден Света
- **Конфликт**: Культ Тьмы
- **Преимущества**: Священное оружие, бонусы против нежити, скидки на зелья

### 2. Культ Тьмы
- **Конфликт**: Орден Света
- **Преимущества**: Темная магия, бонусы к урону заклинаниями, проклятия

### 3. Гильдия Торговцев
- **Конфликт**: Нет
- **Преимущества**: Скидки у торговцев, бонусы к золоту, редкие товары

### 4. Ложа Следопытов
- **Конфликт**: Нет
- **Преимущества**: Бонусы к сбору ресурсов, луки и ловушки, находки

### 5. Круг Магов
- **Конфликт**: Нет
- **Преимущества**: Магические предметы, бонусы к опыту, зачарования

## Уровни репутации

1. **Враждебный** (-12000 до -6000) - Красный
2. **Недружелюбный** (-6000 до -3000) - Оранжевый
3. **Нейтральный** (-3000 до 3000) - Желтый
4. **Дружелюбный** (3000 до 9000) - Зеленый
5. **Уважаемый** (9000 до 21000) - Синий
6. **Почитаемый** (21000 до 42000) - Фиолетовый
7. **Превознесенный** (42000+) - Розовый

## API функций

### getReputationLevel(value)
Получить уровень репутации по значению.

```javascript
import { getReputationLevel } from './utils/factionUtils';

const level = getReputationLevel(5000);
// { id: 'friendly', name: 'Дружелюбный', ... }
```

### updateFactionReputation(player, setPlayer, addNotification, factionId, amount)
Обновить репутацию с фракцией.

```javascript
import { updateFactionReputation } from './utils/factionUtils';

updateFactionReputation(
  player,
  setPlayer,
  addNotification,
  'order_of_light',
  250
);
```

### canAcceptQuest(quest, player)
Проверить доступность задания.

```javascript
import { canAcceptQuest } from './utils/factionUtils';

const { canAccept, reason } = canAcceptQuest(quest, player);
```

### completeFactionQuest(quest, player, setPlayer, addNotification, addLog, ITEMS_DB)
Выполнить задание фракции.

```javascript
import { completeFactionQuest } from './utils/factionUtils';

completeFactionQuest(
  quest,
  player,
  setPlayer,
  addNotification,
  addLog,
  ITEMS_DB
);
```

### getFactionMerchantItems(factionId, player)
Получить товары торговца фракции.

```javascript
import { getFactionMerchantItems } from './utils/factionUtils';

const items = getFactionMerchantItems('merchants_guild', player);
```

### getReputationDiscount(factionId, player)
Получить скидку на основе репутации.

```javascript
import { getReputationDiscount } from './utils/factionUtils';

const discount = getReputationDiscount('merchants_guild', player);
// 0.15 (15% скидка)
```

### purchaseFactionReward(reward, player, setPlayer, addNotification, addLog)
Купить награду у торговца.

```javascript
import { purchaseFactionReward } from './utils/factionUtils';

purchaseFactionReward(
  reward,
  player,
  setPlayer,
  addNotification,
  addLog
);
```

## Типы заданий

- **kill**: Убить определенных врагов
- **collect**: Собрать ресурсы
- **craft**: Создать предметы
- **explore**: Исследовать локации
- **earn_gold**: Заработать золото
- **visit_locations**: Посетить локации
- **kill_location**: Убить врагов в локации
- **collect_category**: Собрать категорию ресурсов
- **craft_category**: Создать категорию предметов

## Конфликты фракций

При повышении репутации с фракцией, имеющей конфликт:
- Репутация с конфликтующей фракцией понижается на 40%
- Отображается предупреждение
- При враждебной репутации блокируется доступ к заданиям и торговцу

## Ежедневные задания

- Обновляются каждые 24 часа
- Дают +50% репутации
- Отмечены специальной иконкой календаря

## Награды и торговец

- Награды разблокируются по уровням репутации
- Скидки: 5% (Дружелюбный), 10% (Уважаемый), 15% (Почитаемый), 20% (Превознесенный)
- Уникальные предметы для каждой фракции

## Стилизация

Все компоненты используют Tailwind CSS и следуют дизайн-системе игры:
- Темная тема (slate-800, slate-900)
- Цветовое кодирование по редкости
- Анимации и переходы
- Адаптивный дизайн

## Примеры использования

### Добавление репутации при победе над врагом

```javascript
const handleEnemyDefeated = (enemy) => {
  // ... существующая логика ...
  
  // Добавить репутацию, если враг связан с фракцией
  if (enemy.factionId) {
    updateFactionReputation(
      player,
      setPlayer,
      addNotification,
      enemy.factionId,
      50
    );
  }
};
```

### Проверка ежедневных заданий

```javascript
useEffect(() => {
  const checkDailyReset = () => {
    const now = Date.now();
    const lastReset = player.lastDailyReset || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastReset >= oneDayMs) {
      setPlayer(prev => ({
        ...prev,
        dailyFactionQuests: prev.dailyFactionQuests.map(dq => ({
          ...dq,
          completedToday: false
        })),
        lastDailyReset: now
      }));
      
      addNotification('Ежедневные задания обновлены!', 'info');
    }
  };
  
  checkDailyReset();
  const interval = setInterval(checkDailyReset, 60000); // Проверка каждую минуту
  
  return () => clearInterval(interval);
}, [player.lastDailyReset]);
```

## Troubleshooting

### Проблема: Репутация не сохраняется
**Решение**: Убедитесь, что вызывается `saveGame(player)` после обновления репутации.

### Проблема: Задания не отображаются
**Решение**: Проверьте, что `FACTION_QUESTS` импортирован и `factionId` совпадает.

### Проблема: Конфликты фракций не работают
**Решение**: Убедитесь, что `conflictsWith` указан правильно в `FACTIONS`.

### Проблема: Ежедневные задания не сбрасываются
**Решение**: Проверьте, что `lastDailyReset` обновляется и сравнение времени работает корректно.
