# Design Document: Marriage System

## Overview

Система свадеб представляет собой комплексную социальную механику для RPG игры, позволяющую игрокам создавать романтические отношения, жениться и получать игровые преимущества от совместной игры. Система построена на прогрессивной модели отношений с 10 уровнями, где каждый уровень открывает новые возможности.

Архитектура системы разделена на независимые модули, каждый из которых отвечает за конкретный аспект брачной механики. Это обеспечивает модульность, тестируемость и возможность расширения функционала в будущем.

Ключевые особенности дизайна:
- Модульная архитектура с четким разделением ответственности
- Хранение всех данных в объекте Player для персистентности
- Симуляция мультиплеерного взаимодействия для однопользовательского режима
- Интеграция с существующей системой друзей
- React-based UI с градиентами и анимациями

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Marriage System                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Relationship │  │   Proposal   │  │   Wedding    │     │
│  │   Manager    │  │   Handler    │  │  Organizer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Couple    │  │    Shared    │  │     Gift     │     │
│  │   Benefits   │  │     Home     │  │    System    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Anniversary  │  │Wedding Quest │  │   Divorce    │     │
│  │   Tracker    │  │   Manager    │  │   Handler    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Player Object   │
                  │  (Data Storage)  │
                  └──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Friends System  │
                  │  (Integration)   │
                  └──────────────────┘
```

### Component Interaction Flow

1. **Relationship Building**: Player → Relationship_Manager → Player Object
2. **Proposal**: Player → Proposal_Handler → Partner (simulated/real) → Player Object
3. **Wedding**: Player → Wedding_Organizer → Ceremony → Player Object
4. **Benefits**: Player Object → Couple_Benefits → Player Stats
5. **Shared Resources**: Player → Shared_Home → Shared_Bank → Player Object
6. **Gifts**: Player → Gift_System → Partner → Relationship_Manager
7. **Anniversaries**: Anniversary_Tracker → Player Object → Rewards
8. **Quests**: Player → Wedding_Quest_Manager → Relationship_Manager
9. **Divorce**: Player → Divorce_Handler → Player Object

## Components and Interfaces

### 1. Relationship Manager

**Responsibility**: Управление уровнями отношений и накоплением очков между игроками.

**Interface**:
```javascript
class RelationshipManager {
  // Добавить очки отношений между игроками
  addRelationshipPoints(playerId, partnerId, points)
  
  // Получить текущий уровень отношений
  getRelationshipLevel(playerId, partnerId)
  
  // Получить очки отношений
  getRelationshipPoints(playerId, partnerId)
  
  // Получить прогресс до следующего уровня (0-100%)
  getProgressToNextLevel(playerId, partnerId)
  
  // Получить название уровня отношений
  getRelationshipLevelName(level)
  
  // Проверить, достигнут ли требуемый уровень
  hasRequiredLevel(playerId, partnerId, requiredLevel)
  
  // Сбросить отношения (для развода)
  resetRelationship(playerId, partnerId)
}
```

**Key Data**:
- Relationship levels: 10 уровней с порогами очков
- Level thresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
- Level names: массив из 10 названий

### 2. Proposal Handler

**Responsibility**: Обработка предложений руки и сердца, включая покупку колец и ответы партнеров.

**Interface**:
```javascript
class ProposalHandler {
  // Купить обручальное кольцо
  purchaseRing(playerId, ringType)
  
  // Отправить предложение
  sendProposal(playerId, partnerId, ringType)
  
  // Проверить требования для предложения
  canSendProposal(playerId, partnerId)
  
  // Обработать ответ на предложение
  handleProposalResponse(proposalId, accepted)
  
  // Получить список доступных колец
  getAvailableRings()
  
  // Получить информацию о кольце
  getRingInfo(ringType)
  
  // Симулировать ответ партнера (для AI)
  simulatePartnerResponse(playerId, partnerId)
}
```

**Key Data**:
- Ring types: 5 типов с характеристиками
- Ring data: { name, cost, xpBonus, rarity, description }
- Proposal requirements: level >= 10, relationshipLevel >= 5

### 3. Wedding Organizer

**Responsibility**: Организация и проведение свадебных церемоний.

**Interface**:
```javascript
class WeddingOrganizer {
  // Начать организацию свадьбы
  startWeddingPlanning(playerId, partnerId)
  
  // Выбрать место проведения
  selectVenue(weddingId, venueType)
  
  // Пригласить гостей
  inviteGuests(weddingId, guestIds)
  
  // Получить список доступных мест
  getAvailableVenues()
  
  // Получить информацию о месте
  getVenueInfo(venueType)
  
  // Провести церемонию
  conductCeremony(weddingId)
  
  // Проверить возможность организации
  canOrganizeWedding(playerId, partnerId)
}
```

**Key Data**:
- Venue types: 5 локаций с характеристиками
- Venue data: { name, cost, blessing, description, imageUrl }
- Max guests: 20
- Ceremony duration: симуляция 5 минут

### 4. Couple Benefits

**Responsibility**: Применение и управление бонусами для женатых пар.

**Interface**:
```javascript
class CoupleBenefits {
  // Получить все активные бонусы пары
  getActiveBonuses(playerId)
  
  // Применить базовые бонусы брака
  applyMarriageBonuses(playerId)
  
  // Применить бонусы совместной игры
  applyPartyBonuses(playerId, partnerId)
  
  // Применить бонус кольца
  applyRingBonus(playerId, ringType)
  
  // Применить благословение места
  applyVenueBlessing(playerId, venueType)
  
  // Телепортация к партнеру
  teleportToPartner(playerId)
  
  // Проверить кулдаун телепортации
  canTeleport(playerId)
  
  // Удалить все бонусы (для развода)
  removeBonuses(playerId)
}
```

**Key Data**:
- Base bonuses: +10% XP, +15% gold
- Party bonuses: +5% XP, +5% gold (when together)
- Teleport cooldown: 3600 seconds (1 hour)
- Ring bonuses: зависят от типа кольца
- Venue blessings: зависят от места проведения

### 5. Shared Home

**Responsibility**: Управление общим домом и банком пары.

**Interface**:
```javascript
class SharedHome {
  // Создать общий дом для пары
  createSharedHome(playerId, partnerId)
  
  // Получить доступ к общему банку
  getSharedBank(coupleId)
  
  // Положить в общий банк
  depositToSharedBank(playerId, items, gold)
  
  // Взять из общего банка
  withdrawFromSharedBank(playerId, items, gold)
  
  // Получить содержимое общего сундука
  getSharedChest(coupleId)
  
  // Сохранить кастомизацию дома
  saveHomeCustomization(coupleId, customizationData)
  
  // Получить кастомизацию дома
  getHomeCustomization(coupleId)
  
  // Удалить общий дом (для развода)
  removeSharedHome(coupleId)
  
  // Разделить ресурсы при разводе
  splitResources(coupleId)
}
```

**Key Data**:
- Shared chest capacity: 100 slots
- Shared bank: unlimited gold, items
- Home customization: декор, мебель, цвета

### 6. Gift System

**Responsibility**: Обработка подарков между партнерами.

**Interface**:
```javascript
class GiftSystem {
  // Отправить подарок
  sendGift(playerId, partnerId, giftType)
  
  // Получить список доступных подарков
  getAvailableGifts()
  
  // Получить информацию о подарке
  getGiftInfo(giftType)
  
  // Обработать получение подарка
  receiveGift(partnerId, giftType, senderId)
  
  // Применить эффект подарка
  applyGiftEffect(playerId, giftType)
  
  // Проверить возможность отправки
  canSendGift(playerId, giftType)
}
```

**Key Data**:
- Gift types: 4 типа с характеристиками
- Gift data: { name, cost, relationshipPoints, effect, duration, description }
- Effects: временные баффы или постоянные предметы

### 7. Anniversary Tracker

**Responsibility**: Отслеживание годовщин и выдача наград.

**Interface**:
```javascript
class AnniversaryTracker {
  // Проверить годовщины
  checkAnniversaries(playerId)
  
  // Получить следующую годовщину
  getNextAnniversary(playerId)
  
  // Получить время до следующей годовщины
  getTimeToNextAnniversary(playerId)
  
  // Выдать награду за годовщину
  grantAnniversaryReward(playerId, anniversaryYear)
  
  // Получить список всех годовщин
  getAllAnniversaries()
  
  // Получить информацию о годовщине
  getAnniversaryInfo(year)
  
  // Проверить, была ли получена награда
  hasReceivedReward(playerId, anniversaryYear)
}
```

**Key Data**:
- Anniversary milestones: [1, 5, 10, 25, 50] years
- Rewards: titles, gold, mounts, weapons, armor, pets
- Time calculation: in-game time (accelerated)

### 8. Wedding Quest Manager

**Responsibility**: Управление свадебными квестами для пар.

**Interface**:
```javascript
class WeddingQuestManager {
  // Получить доступные квесты
  getAvailableQuests(playerId, partnerId)
  
  // Начать квест
  startQuest(playerId, partnerId, questId)
  
  // Обновить прогресс квеста
  updateQuestProgress(questId, progress)
  
  // Завершить квест
  completeQuest(questId)
  
  // Получить информацию о квесте
  getQuestInfo(questId)
  
  // Проверить требования квеста
  canStartQuest(playerId, partnerId, questId)
  
  // Выдать награды за квест
  grantQuestRewards(playerId, partnerId, questId)
}
```

**Key Data**:
- Quest types: 3 основных квеста
- Quest requirements: зависят от уровня отношений
- Rewards: +100 relationship points, gold, items, XP

### 9. Divorce Handler

**Responsibility**: Обработка разводов и разделение ресурсов.

**Interface**:
```javascript
class DivorceHandler {
  // Инициировать развод
  initiateDivorce(playerId)
  
  // Подтвердить развод
  confirmDivorce(playerId)
  
  // Рассчитать штраф за развод
  calculateDivorcePenalty(playerId, partnerId)
  
  // Обработать развод
  processDivorce(playerId, partnerId)
  
  // Разделить общие ресурсы
  splitSharedResources(playerId, partnerId)
  
  // Удалить статус брака
  removeMarriageStatus(playerId, partnerId)
  
  // Сбросить бонусы
  removeBonuses(playerId, partnerId)
}
```

**Key Data**:
- Divorce penalty: 10% of total gold
- Resource split: 50/50 from shared bank
- Status reset: marriage status, relationship level, points

## Data Models

### Player Marriage Data

```javascript
{
  marriageData: {
    // Статус брака
    status: "single" | "engaged" | "married",
    
    // ID партнера
    partnerId: string | null,
    
    // Дата свадьбы (timestamp)
    weddingDate: number | null,
    
    // Тип обручального кольца
    ringType: string | null,
    
    // Тип места проведения свадьбы
    venueType: string | null,
    
    // Отношения с другими игроками
    relationships: {
      [partnerId: string]: {
        level: number,           // 1-10
        points: number,          // Текущие очки
        lastInteraction: number  // Timestamp последнего взаимодействия
      }
    },
    
    // Активные эффекты подарков
    activeGiftEffects: [
      {
        type: string,
        effect: string,
        expiresAt: number
      }
    ],
    
    // Полученные награды за годовщины
    anniversaryRewards: {
      [year: number]: boolean
    },
    
    // Завершенные свадебные квесты
    completedWeddingQuests: string[],
    
    // Кулдаун телепортации
    teleportCooldown: number | null,
    
    // История предложений
    proposalHistory: [
      {
        partnerId: string,
        date: number,
        accepted: boolean
      }
    ]
  }
}
```

### Shared Couple Data

```javascript
{
  coupleData: {
    // Уникальный ID пары
    coupleId: string,
    
    // ID обоих партнеров
    player1Id: string,
    player2Id: string,
    
    // Общий банк
    sharedBank: {
      gold: number,
      items: [
        {
          id: string,
          quantity: number
        }
      ]
    },
    
    // Общий сундук
    sharedChest: {
      slots: 100,
      items: [
        {
          id: string,
          slot: number,
          quantity: number
        }
      ]
    },
    
    // Кастомизация дома
    homeCustomization: {
      wallColor: string,
      floorType: string,
      furniture: [
        {
          id: string,
          position: { x: number, y: number }
        }
      ]
    },
    
    // Дата создания пары
    createdAt: number
  }
}
```

### Wedding Ring Data

```javascript
const WEDDING_RINGS = [
  {
    id: "simple",
    name: "Простое кольцо",
    cost: 100,
    xpBonus: 0.05,
    rarity: "common",
    description: "Простое обручальное кольцо"
  },
  {
    id: "silver",
    name: "Серебряное кольцо",
    cost: 500,
    xpBonus: 0.07,
    rarity: "uncommon",
    description: "Серебряное обручальное кольцо"
  },
  {
    id: "gold",
    name: "Золотое кольцо",
    cost: 1000,
    xpBonus: 0.10,
    rarity: "rare",
    description: "Золотое обручальное кольцо"
  },
  {
    id: "platinum",
    name: "Платиновое кольцо",
    cost: 2500,
    xpBonus: 0.12,
    rarity: "epic",
    description: "Платиновое обручальное кольцо"
  },
  {
    id: "legendary",
    name: "Легендарное кольцо",
    cost: 5000,
    xpBonus: 0.15,
    rarity: "legendary",
    description: "Легендарное обручальное кольцо"
  }
];
```

### Wedding Venue Data

```javascript
const WEDDING_VENUES = [
  {
    id: "temple",
    name: "Храм",
    cost: 500,
    blessing: { type: "healing", value: 0.05 },
    description: "Священный храм с благословением исцеления",
    imageUrl: "/assets/venues/temple.jpg"
  },
  {
    id: "garden",
    name: "Сад",
    cost: 750,
    blessing: { type: "natureDamage", value: 0.05 },
    description: "Прекрасный сад с благословением природы",
    imageUrl: "/assets/venues/garden.jpg"
  },
  {
    id: "beach",
    name: "Пляж",
    cost: 1000,
    blessing: { type: "waterResistance", value: 0.05 },
    description: "Романтический пляж с благословением воды",
    imageUrl: "/assets/venues/beach.jpg"
  },
  {
    id: "castle",
    name: "Замок",
    cost: 2000,
    blessing: { type: "defense", value: 0.10 },
    description: "Величественный замок с благословением защиты",
    imageUrl: "/assets/venues/castle.jpg"
  },
  {
    id: "skyIsland",
    name: "Небесный остров",
    cost: 5000,
    blessing: { type: "allStats", value: 0.15 },
    description: "Мистический небесный остров с благословением всех характеристик",
    imageUrl: "/assets/venues/sky-island.jpg"
  }
];
```

### Gift Data

```javascript
const GIFTS = [
  {
    id: "flowers",
    name: "Цветы",
    cost: 50,
    relationshipPoints: 10,
    effect: { type: "happiness", value: 0.05, duration: 3600 },
    description: "Букет прекрасных цветов"
  },
  {
    id: "chocolate",
    name: "Шоколад",
    cost: 100,
    relationshipPoints: 20,
    effect: { type: "energyRegen", value: 0.10, duration: 7200 },
    description: "Коробка изысканного шоколада"
  },
  {
    id: "jewelry",
    name: "Украшения",
    cost: 500,
    relationshipPoints: 50,
    effect: { type: "allStats", value: 0.05, duration: 14400 },
    description: "Красивые украшения"
  },
  {
    id: "pet",
    name: "Питомец",
    cost: 2000,
    relationshipPoints: 200,
    effect: { type: "companion", value: 1, duration: -1 },
    description: "Милый питомец-компаньон"
  }
];
```

### Anniversary Data

```javascript
const ANNIVERSARIES = [
  {
    year: 1,
    title: "Годовалая пара",
    rewards: {
      gold: 1000,
      title: "Годовалая пара"
    },
    description: "Первая годовщина свадьбы"
  },
  {
    year: 5,
    title: "Пятилетняя пара",
    rewards: {
      mount: "wedding_carriage",
      title: "Пятилетняя пара"
    },
    description: "Пять лет вместе"
  },
  {
    year: 10,
    title: "Десятилетняя пара",
    rewards: {
      weapon: "eternal_bond_sword",
      title: "Десятилетняя пара"
    },
    description: "Десять лет любви"
  },
  {
    year: 25,
    title: "Серебряная пара",
    rewards: {
      armorSet: "silver_anniversary_set",
      title: "Серебряная пара"
    },
    description: "Серебряная свадьба"
  },
  {
    year: 50,
    title: "Золотая пара",
    rewards: {
      pet: "mythic_phoenix",
      title: "Золотая пара"
    },
    description: "Золотая свадьба"
  }
];
```

### Wedding Quest Data

```javascript
const WEDDING_QUESTS = [
  {
    id: "first_date",
    name: "Первое свидание",
    description: "Посетите романтическую локацию вместе",
    requiredLevel: 3,
    objectives: [
      {
        type: "visitLocation",
        location: "romantic_overlook",
        withPartner: true
      }
    ],
    rewards: {
      relationshipPoints: 100,
      gold: 500,
      xp: 1000
    }
  },
  {
    id: "romantic_dinner",
    name: "Романтический ужин",
    description: "Приготовьте и разделите трапезу с партнером",
    requiredLevel: 4,
    objectives: [
      {
        type: "cookMeal",
        meal: "romantic_dinner"
      },
      {
        type: "shareMeal",
        withPartner: true
      }
    ],
    rewards: {
      relationshipPoints: 100,
      gold: 750,
      xp: 1500
    }
  },
  {
    id: "joint_adventure",
    name: "Совместное приключение",
    description: "Пройдите подземелье вместе с партнером",
    requiredLevel: 5,
    objectives: [
      {
        type: "completeDungeon",
        dungeon: "lovers_trial",
        withPartner: true
      }
    ],
    rewards: {
      relationshipPoints: 100,
      gold: 1000,
      xp: 2000,
      item: "lovers_amulet"
    }
  }
];
```

### Relationship Level Configuration

```javascript
const RELATIONSHIP_LEVELS = [
  { level: 1, name: "Незнакомцы", pointsRequired: 0 },
  { level: 2, name: "Знакомые", pointsRequired: 100 },
  { level: 3, name: "Друзья", pointsRequired: 300 },
  { level: 4, name: "Близкие друзья", pointsRequired: 600 },
  { level: 5, name: "Влюбленные", pointsRequired: 1000 },
  { level: 6, name: "Помолвлены", pointsRequired: 1500 },
  { level: 7, name: "Молодожены", pointsRequired: 2200 },
  { level: 8, name: "Счастливая пара", pointsRequired: 3000 },
  { level: 9, name: "Идеальная пара", pointsRequired: 4000 },
  { level: 10, name: "Легендарная пара", pointsRequired: 5500 }
];
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Relationship level configuration integrity

*For any* relationship level configuration, the system should have exactly 10 levels, each with a unique level number (1-10), a name, and a points threshold, where thresholds are monotonically increasing.

**Validates: Requirements 1.1**

### Property 2: Joint actions increase relationship points

*For any* pair of players and any joint action, performing the action should increase the relationship points between those players by a positive amount.

**Validates: Requirements 1.2**

### Property 3: Level advancement on threshold crossing

*For any* relationship between players, when relationship points reach or exceed the threshold for level N+1, the relationship level should advance to exactly N+1 (not skip levels or stay at N).

**Validates: Requirements 1.3**

### Property 4: Relationship data persistence

*For any* relationship operation (adding points, advancing level), the updated relationship data (level, points, last interaction timestamp) should be present in the Player object immediately after the operation.

**Validates: Requirements 1.5**

### Property 5: Ring purchase validation

*For any* player attempting to purchase a wedding ring, if the player's gold is less than the ring cost, the purchase should be rejected and the player's gold should remain unchanged.

**Validates: Requirements 2.1**

### Property 6: Ring configuration integrity

*For any* wedding ring configuration, the system should have exactly 5 ring types, each with a unique ID, name, cost, XP bonus, rarity, and description.

**Validates: Requirements 2.2**

### Property 7: Proposal level requirement

*For any* player attempting to send a proposal, if the player's level is less than 10, the proposal should be rejected.

**Validates: Requirements 2.3**

### Property 8: Proposal relationship requirement

*For any* player attempting to send a proposal to a partner, if the relationship level with that partner is less than 5 ("Влюбленные"), the proposal should be rejected.

**Validates: Requirements 2.4**

### Property 9: Proposal acceptance state transition

*For any* accepted proposal, both the proposer and the partner should have their marriage status set to "engaged" and their relationship level advanced to exactly 6 ("Помолвлены").

**Validates: Requirements 2.6**

### Property 10: Proposal decline ring return

*For any* declined proposal, the wedding ring should be returned to the proposer's inventory, and the proposer's gold should remain unchanged.

**Validates: Requirements 2.7**

### Property 11: Venue configuration integrity

*For any* wedding venue configuration, the system should have exactly 5 venue types, each with a unique ID, name, cost, blessing (type and value), description, and image URL.

**Validates: Requirements 3.1**

### Property 12: Wedding organization engagement requirement

*For any* attempt to organize a wedding, if either player's marriage status is not "engaged", the organization should be rejected.

**Validates: Requirements 3.2**

### Property 13: Wedding organization gold requirement

*For any* attempt to organize a wedding with a chosen venue, if the organizing player's gold is less than the venue cost, the organization should be rejected.

**Validates: Requirements 3.3**

### Property 14: Guest invitation limit

*For any* wedding organization, attempting to invite more than 20 guests should be rejected, and the guest list should contain at most 20 guests.

**Validates: Requirements 3.4**

### Property 15: Venue cost deduction

*For any* successful wedding organization, the organizing player's gold should decrease by exactly the venue cost.

**Validates: Requirements 3.5**

### Property 16: Guest notification

*For any* wedding organization with invited guests, all invited guests should receive a wedding invitation notification.

**Validates: Requirements 3.6**

### Property 17: Marriage ceremony state transition

*For any* completed wedding ceremony, both players should have their marriage status set to "married", their relationship level advanced to exactly 7 ("Молодожены"), and the wedding date recorded in their player data.

**Validates: Requirements 4.3, 4.4, 4.6**

### Property 18: Venue blessing application

*For any* completed wedding ceremony, both players should have the venue blessing (matching the chosen venue type) applied to their active effects permanently.

**Validates: Requirements 4.5**

### Property 19: Marriage bonuses application

*For any* player with marriage status "married", the player should have all configured marriage bonuses active: base XP bonus (+10%), base gold bonus (+15%), ring bonus (matching ring type), and venue blessing (matching venue type).

**Validates: Requirements 5.1, 5.2, 5.5, 5.6**

### Property 20: Party bonuses application

*For any* married couple in the same party, both players should have additional party bonuses active: +5% XP and +5% gold, which should be removed when they leave the party.

**Validates: Requirements 5.3, 5.4**

### Property 21: Teleport cooldown

*For any* player using the teleport-to-partner ability, the ability should have a cooldown of exactly 3600 seconds (1 hour), and attempting to use it again before cooldown expires should be rejected.

**Validates: Requirements 5.7**

### Property 22: Shared home creation

*For any* couple that gets married, a shared home instance should be created with a unique couple ID, and both players should have access to it.

**Validates: Requirements 6.1**

### Property 23: Shared bank accessibility

*For any* married couple, both partners should be able to access the shared bank, and deposits by one partner should be visible to the other partner.

**Validates: Requirements 6.2, 6.3**

### Property 24: Shared bank withdrawal

*For any* withdrawal from the shared bank, the shared bank's gold and items should decrease by exactly the withdrawn amounts.

**Validates: Requirements 6.4**

### Property 25: Shared chest capacity

*For any* shared home, the shared chest should have exactly 100 item slots, and attempting to add items beyond capacity should be rejected.

**Validates: Requirements 6.5**

### Property 26: Gift configuration integrity

*For any* gift configuration, the system should have exactly 4 gift types, each with a unique ID, name, cost, relationship points value, effect (type, value, duration), and description.

**Validates: Requirements 7.1**

### Property 27: Gift purchase validation

*For any* player attempting to send a gift, if the player's gold is less than the gift cost, the gift sending should be rejected and the player's gold should remain unchanged.

**Validates: Requirements 7.2**

### Property 28: Gift relationship points increase

*For any* gift received by a partner, the relationship points between the sender and receiver should increase by exactly the gift's configured relationship points value.

**Validates: Requirements 7.3**

### Property 29: Gift effect application

*For any* gift received by a partner, the partner should have the gift's special effect applied to their active effects with the correct type, value, and duration.

**Validates: Requirements 7.4**

### Property 30: Anniversary configuration integrity

*For any* anniversary configuration, the system should have exactly 5 anniversary milestones (1, 5, 10, 25, 50 years), each with a unique year, title, rewards, and description.

**Validates: Requirements 8.1**

### Property 31: Anniversary notification

*For any* anniversary milestone reached, both partners should receive an anniversary notification.

**Validates: Requirements 8.2**

### Property 32: Anniversary time calculation

*For any* married couple, anniversary milestones should be calculated based on in-game time elapsed since the wedding date.

**Validates: Requirements 8.8**

### Property 33: Quest completion relationship points

*For any* completed wedding quest, the couple should receive exactly +100 relationship points.

**Validates: Requirements 9.4**

### Property 34: Quest completion rewards distribution

*For any* completed wedding quest, both partners should receive the quest's configured rewards (gold, items, XP).

**Validates: Requirements 9.5**

### Property 35: Quest availability by level

*For any* wedding quest, the quest should only be available to couples whose relationship level meets or exceeds the quest's required level.

**Validates: Requirements 9.6**

### Property 36: Divorce penalty calculation

*For any* confirmed divorce, the penalty should be exactly 10% of the couple's total gold (sum of both players' personal gold plus shared bank gold).

**Validates: Requirements 10.2**

### Property 37: Divorce state reset

*For any* confirmed divorce, both players should have their marriage status set to "single", relationship level reset to 1 ("Незнакомцы"), relationship points reset to 0, and all couple bonuses removed.

**Validates: Requirements 10.4, 10.5, 10.6, 10.7**

### Property 38: Divorce resource split

*For any* confirmed divorce, the shared bank contents should be split equally (50/50) between the two players, and both players should lose access to the shared home.

**Validates: Requirements 10.8, 10.9**

### Property 39: Friends list integration

*For any* player viewing potential partners, the list should include all players from the player's friends list, and friends should appear before non-friends in the list.

**Validates: Requirements 11.1, 11.5**

### Property 40: Proposal option visibility

*For any* friend's profile being viewed, the proposal option should be visible if and only if all proposal requirements are met (player level >= 10, relationship level >= 5, not already engaged/married).

**Validates: Requirements 11.3**

### Property 41: Simulated partner response generation

*For any* proposal sent to a simulated partner, the system should generate an accept or decline response based on the relationship level with the partner.

**Validates: Requirements 12.2**

### Property 42: Simulated acceptance probability

*For any* large number of proposals sent to simulated partners with relationship level >= 5 ("Влюбленные"), approximately 80% (±10%) should be accepted.

**Validates: Requirements 12.3**

### Property 43: Simulated decline probability

*For any* large number of proposals sent to simulated partners with relationship level < 5, approximately 90% (±10%) should be declined.

**Validates: Requirements 12.4**

### Property 44: Marriage data serialization round-trip

*For any* player with marriage data (status, partner, relationship levels, ring, venue, shared bank, etc.), serializing the data to storage and then deserializing it should produce equivalent marriage data.

**Validates: Requirements 14.9, 14.10**

## Error Handling

### Validation Errors

**Insufficient Resources**:
- When player lacks gold for ring/venue/gift purchase
- Return error message: "Недостаточно золота"
- Do not modify player state
- Log attempt for analytics

**Requirement Not Met**:
- When player level < 10 for proposal
- When relationship level < required for proposal/quest
- When marriage status incorrect for operation
- Return specific error message explaining requirement
- Do not modify player state

**Capacity Exceeded**:
- When guest list > 20
- When shared chest > 100 slots
- Return error message: "Превышен лимит"
- Reject operation
- Do not modify state

### State Errors

**Invalid State Transition**:
- When attempting operation in wrong marriage status
- Example: organizing wedding when not engaged
- Return error message: "Неверный статус для этой операции"
- Do not modify state
- Log error

**Partner Not Found**:
- When partner ID references non-existent player
- Return error message: "Партнер не найден"
- For simulated partners, generate partner on-demand
- Log warning

**Cooldown Active**:
- When attempting teleport during cooldown
- Return error message with time remaining
- Do not execute teleport
- Display cooldown timer in UI

### Data Errors

**Corrupted Data**:
- When player marriage data is invalid/corrupted
- Attempt to repair with default values
- Log error with details
- Notify user of data reset if repair fails

**Missing Configuration**:
- When ring/venue/gift/quest configuration missing
- Use fallback default configuration
- Log critical error
- Notify developers

**Shared Resource Conflict**:
- When both partners attempt simultaneous shared bank operation
- Use optimistic locking with retry
- If conflict persists, show error to second player
- Log conflict for monitoring

### Network/Simulation Errors

**Partner Unavailable**:
- When real partner is offline/disconnected
- Fall back to simulated partner behavior
- Log simulation mode activation
- Notify player of simulation mode

**Timeout**:
- When waiting for partner response > 5 minutes
- Auto-decline proposal
- Notify proposer of timeout
- Return ring to proposer

## Testing Strategy

### Dual Testing Approach

The marriage system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific ceremony flows (temple wedding, beach wedding, etc.)
- Edge cases (exactly 20 guests, exactly 100 chest slots)
- Error conditions (insufficient gold, wrong status, cooldown active)
- Integration with friends system
- UI rendering for specific states

**Property Tests**: Verify universal properties across all inputs
- All correctness properties listed above
- Run minimum 100 iterations per property test
- Use random generation for: players, gold amounts, relationship levels, ring types, venue types, gift types
- Each property test must reference its design document property

### Property-Based Testing Configuration

**Testing Library**: Use `fast-check` for JavaScript/TypeScript property-based testing

**Test Configuration**:
```javascript
// Example property test structure
fc.assert(
  fc.property(
    // Generators for random inputs
    playerGenerator(),
    ringTypeGenerator(),
    (player, ringType) => {
      // Test property
      // Tag: Feature: marriage-system, Property 5: Ring purchase validation
    }
  ),
  { numRuns: 100 } // Minimum 100 iterations
);
```

**Generators Needed**:
- `playerGenerator()`: Random players with varied levels, gold, status
- `ringTypeGenerator()`: Random ring types from configuration
- `venueTypeGenerator()`: Random venue types from configuration
- `giftTypeGenerator()`: Random gift types from configuration
- `relationshipLevelGenerator()`: Random relationship levels 1-10
- `relationshipPointsGenerator()`: Random points within valid ranges

**Tag Format**: Each property test must include a comment:
```javascript
// Feature: marriage-system, Property 5: Ring purchase validation
```

### Test Coverage Goals

**Unit Tests**:
- All error conditions
- All state transitions
- All UI components
- Integration points with friends system
- Specific examples for each feature

**Property Tests**:
- All 44 correctness properties
- Minimum 100 iterations each
- Cover all validation logic
- Cover all state transitions
- Cover all resource operations

**Integration Tests**:
- End-to-end wedding flow
- End-to-end divorce flow
- Shared bank operations with concurrent access
- Anniversary tracking over time
- Quest completion flows

### Testing Priority

**High Priority** (must test before release):
1. Proposal validation and state transitions (Properties 5-10)
2. Wedding organization and ceremony (Properties 11-18)
3. Marriage bonuses application (Properties 19-21)
4. Shared bank operations (Properties 22-25)
5. Divorce processing (Properties 36-38)
6. Data serialization round-trip (Property 44)

**Medium Priority** (test during development):
1. Relationship level progression (Properties 1-4)
2. Gift system (Properties 26-29)
3. Quest system (Properties 33-35)
4. Simulated partner behavior (Properties 41-43)

**Low Priority** (test for polish):
1. Anniversary tracking (Properties 30-32)
2. Friends list integration (Properties 39-40)
3. UI rendering properties
4. Configuration integrity properties

### Mock Data for Testing

**Test Players**:
- Low level player (level 5, 100 gold)
- Mid level player (level 15, 5000 gold)
- High level player (level 50, 50000 gold)
- Engaged player (status: engaged, partner set)
- Married player (status: married, partner set, wedding date set)

**Test Relationships**:
- Strangers (level 1, 0 points)
- Friends (level 3, 400 points)
- Lovers (level 5, 1200 points)
- Engaged (level 6, 1800 points)
- Married (level 7+, 2500+ points)

**Test Scenarios**:
- Successful proposal flow
- Rejected proposal flow
- Complete wedding ceremony
- Divorce with shared resources
- Anniversary milestone reached
- Quest completion
- Gift exchange
- Shared bank operations
