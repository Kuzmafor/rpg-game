# Документ дизайна: Система друзей

## Обзор

Данный документ описывает технический дизайн для реализации системы друзей в браузерной RPG игре на React. Система включает управление друзьями, совместные квесты, обмен предметами, чат и интеграцию с существующими игровыми системами.

### Цели дизайна

- Добавить социальный аспект в игру через систему друзей
- Обеспечить безопасный обмен предметами между игроками
- Создать систему совместных квестов с бонусными наградами
- Интегрировать друзей с существующими системами (гильдии, PvP, подземелья)
- Обеспечить простой и интуитивный интерфейс для взаимодействия с друзьями

### Технологический стек

- React 18+ с хуками (useState, useEffect, useRef)
- Tailwind CSS для стилизации
- Lucide React для иконок
- localStorage для сохранения данных друзей
- Симуляция "онлайн" статуса через генерацию ботов-друзей

## Архитектура

### Структура данных

Поскольку это браузерная игра без backend, система друзей будет симулироваться через:
1. **Генерация NPC-друзей**: Создание виртуальных игроков с реалистичными характеристиками
2. **Локальное хранение**: Сохранение списка друзей и истории взаимодействий в localStorage
3. **Симуляция активности**: Генерация случайных событий для друзей (повышение уровня, находки предметов)

### Модель данных друга

```javascript
interface Friend {
  id: string;
  name: string;
  level: number;
  className: string;
  classId: string;
  avatarId: number;
  status: 'online' | 'offline' | 'in_combat' | 'traveling' | 'in_dungeon';
  lastActive: number;
  location: number;
  stats: {
    totalKills: number;
    pvpRating: number;
    gold: number;
    questsCompleted: number;
  };
  friendship: {
    addedAt: number;
    giftsReceived: number;
    giftsSent: number;
    questsCompleted: number;
  };
}
```


### Модель данных игрока (расширение)

```javascript
// Добавить к существующей модели Player:
{
  // ... существующие поля ...
  
  // НОВОЕ: Друзья
  friends: string[], // массив ID друзей
  friendRequests: Array<{
    id: string,
    from: string,
    timestamp: number
  }>,
  sentRequests: string[], // ID игроков, которым отправлены запросы
  blockedPlayers: string[],
  
  // НОВОЕ: Статистика друзей
  friendStats: {
    totalFriends: number,
    giftsReceived: number,
    giftsSent: number,
    coopQuestsCompleted: number,
    tradesCompleted: number
  },
  
  // НОВОЕ: Чат
  chatHistory: Record<string, Array<{
    id: string,
    from: string,
    message: string,
    timestamp: number,
    read: boolean
  }>>,
  
  // НОВОЕ: Активные взаимодействия
  activeParty: {
    questId: number,
    members: string[],
    progress: number
  } | null,
  
  activeTrade: {
    partnerId: string,
    myItems: number[],
    myGold: number,
    partnerItems: number[],
    partnerGold: number,
    myConfirmed: boolean,
    partnerConfirmed: boolean
  } | null
}
```

## Компоненты и интерфейсы

### 1. Генерация NPC-друзей

#### Константы имен и классов

```javascript
const FRIEND_NAMES = [
  'Артур', 'Мерлин', 'Ланселот', 'Гвиневра', 'Моргана',
  'Персиваль', 'Галахад', 'Тристан', 'Изольда', 'Бедивер',
  'Кей', 'Гарет', 'Гавейн', 'Элейн', 'Вивиана',
  'Утер', 'Игрейна', 'Модред', 'Агравейн', 'Борс'
];

const generateFriend = (playerId) => {
  const id = `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const name = FRIEND_NAMES[getRandomInt(0, FRIEND_NAMES.length - 1)];
  const classData = PLAYER_CLASSES[getRandomInt(0, PLAYER_CLASSES.length - 1)];
  const level = getRandomInt(1, 50);
  
  return {
    id,
    name,
    level,
    className: classData.name,
    classId: classData.id,
    avatarId: getRandomInt(1, 15),
    status: Math.random() > 0.3 ? 'online' : 'offline',
    lastActive: Date.now() - getRandomInt(0, 86400000), // последние 24 часа
    location: getRandomInt(1, 8),
    stats: {
      totalKills: getRandomInt(level * 5, level * 20),
      pvpRating: getRandomInt(800, 2000),
      gold: getRandomInt(level * 100, level * 500),
      questsCompleted: getRandomInt(level, level * 3)
    },
    friendship: {
      addedAt: Date.now(),
      giftsReceived: 0,
      giftsSent: 0,
      questsCompleted: 0
    }
  };
};
```


### 2. Компонент FriendsScreen

Главный экран управления друзьями с вкладками:

```javascript
const FriendsScreen = ({ player, setPlayer }) => {
  const [activeTab, setActiveTab] = useState('list'); // list, requests, search, chat
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  return (
    <div>
      {/* Вкладки */}
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setActiveTab('list')}>Друзья ({player.friends.length})</Button>
        <Button onClick={() => setActiveTab('requests')}>Запросы ({player.friendRequests.length})</Button>
        <Button onClick={() => setActiveTab('search')}>Найти друзей</Button>
        <Button onClick={() => setActiveTab('chat')}>Чат</Button>
      </div>
      
      {/* Контент вкладок */}
      {activeTab === 'list' && <FriendsList />}
      {activeTab === 'requests' && <FriendRequests />}
      {activeTab === 'search' && <SearchFriends />}
      {activeTab === 'chat' && <FriendChat />}
    </div>
  );
};
```

#### Подкомпонент: Список друзей

```javascript
const FriendsList = ({ player, friends, onSelectFriend }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends.map(friend => (
        <Card key={friend.id} className="hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            {/* Аватар */}
            <div className={`w-16 h-16 rounded-full ${AVATARS_DB.find(a => a.id === friend.avatarId)?.color} flex items-center justify-center`}>
              <Icon size={32} />
            </div>
            
            {/* Информация */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{friend.name}</h3>
                <StatusBadge status={friend.status} />
              </div>
              <p className="text-sm text-slate-400">
                {friend.className} • Уровень {friend.level}
              </p>
              <p className="text-xs text-slate-500">
                {friend.status === 'offline' 
                  ? `Был(а) ${formatTimeAgo(friend.lastActive)}`
                  : `В локации: ${LOCATIONS.find(l => l.id === friend.location)?.name}`
                }
              </p>
            </div>
            
            {/* Действия */}
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => onSelectFriend(friend)}>
                <MessageCircle size={16} /> Чат
              </Button>
              <Button size="sm" variant="secondary" onClick={() => inviteToParty(friend)}>
                <Users size={16} /> Группа
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
```


### 3. Система совместных квестов

#### Константы совместных квестов

```javascript
const COOP_QUESTS = [
  {
    id: 1,
    name: 'Охота на Дракона',
    description: 'Победите Древнего Дракона вместе с друзьями',
    minPlayers: 2,
    maxPlayers: 4,
    requirements: { minLevel: 20 },
    objectives: [
      { type: 'kill', target: 'Древний Дракон', count: 1 }
    ],
    rewards: {
      gold: 2000,
      exp: 1000,
      items: [{ id: 16, name: 'Драконий клык' }]
    },
    bonusPerPlayer: 0.25 // +25% за каждого участника
  },
  {
    id: 2,
    name: 'Зачистка Подземелья',
    description: 'Пройдите подземелье "Забытые Катакомбы" вместе',
    minPlayers: 2,
    maxPlayers: 3,
    requirements: { minLevel: 10 },
    objectives: [
      { type: 'dungeon', dungeonId: 1, floors: 5 }
    ],
    rewards: {
      gold: 1000,
      exp: 500,
      items: [{ id: 25, name: 'Большое зелье здоровья' }]
    },
    bonusPerPlayer: 0.25
  },
  {
    id: 3,
    name: 'Сбор Ресурсов',
    description: 'Соберите редкие ресурсы в опасных локациях',
    minPlayers: 2,
    maxPlayers: 4,
    requirements: { minLevel: 15 },
    objectives: [
      { type: 'collect', resourceId: 'dragon_scale', count: 5 },
      { type: 'collect', resourceId: 'mithril_ore', count: 10 }
    ],
    rewards: {
      gold: 1500,
      exp: 750
    },
    bonusPerPlayer: 0.25
  }
];
```

#### Функции управления группой

```javascript
const createParty = (player, questId, invitedFriends) => {
  const quest = COOP_QUESTS.find(q => q.id === questId);
  
  if (!quest) return { success: false, error: 'Квест не найден' };
  if (player.level < quest.requirements.minLevel) {
    return { success: false, error: 'Недостаточный уровень' };
  }
  if (invitedFriends.length < quest.minPlayers - 1) {
    return { success: false, error: 'Недостаточно участников' };
  }
  if (invitedFriends.length > quest.maxPlayers - 1) {
    return { success: false, error: 'Слишком много участников' };
  }
  
  const party = {
    questId,
    leader: player.id,
    members: [player.id, ...invitedFriends.map(f => f.id)],
    status: 'pending', // pending, active, completed
    progress: 0,
    createdAt: Date.now()
  };
  
  // Отправить приглашения друзьям
  invitedFriends.forEach(friend => {
    sendPartyInvite(friend.id, party);
  });
  
  return { success: true, party };
};

const completeCoopQuest = (player, party) => {
  const quest = COOP_QUESTS.find(q => q.id === party.questId);
  const memberCount = party.members.length;
  const bonus = 1 + (quest.bonusPerPlayer * (memberCount - 1));
  
  const rewards = {
    gold: Math.floor(quest.rewards.gold * bonus),
    exp: Math.floor(quest.rewards.exp * bonus),
    items: quest.rewards.items || []
  };
  
  // Выдать награды всем участникам
  party.members.forEach(memberId => {
    giveRewards(memberId, rewards);
  });
  
  // Обновить статистику
  player.friendStats.coopQuestsCompleted += 1;
  
  addNotification(`Совместный квест "${quest.name}" выполнен! Бонус: +${Math.floor((bonus - 1) * 100)}%`, 'success');
  
  return rewards;
};
```


### 4. Система обмена предметами

#### Компонент TradeWindow

```javascript
const TradeWindow = ({ player, partner, onClose, onComplete }) => {
  const [myOffer, setMyOffer] = useState({ items: [], gold: 0 });
  const [partnerOffer, setPartnerOffer] = useState({ items: [], gold: 0 });
  const [myConfirmed, setMyConfirmed] = useState(false);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  
  const addItemToTrade = (item) => {
    if (myOffer.items.length >= 10) {
      addNotification('Максимум 10 предметов в обмене', 'warning');
      return;
    }
    setMyOffer(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    setMyConfirmed(false);
  };
  
  const confirmTrade = () => {
    setMyConfirmed(true);
    
    // Симуляция подтверждения партнера (для NPC)
    setTimeout(() => {
      setPartnerConfirmed(true);
    }, 1000);
  };
  
  useEffect(() => {
    if (myConfirmed && partnerConfirmed) {
      executeTrade();
    }
  }, [myConfirmed, partnerConfirmed]);
  
  const executeTrade = () => {
    // Проверки
    if (player.gold < myOffer.gold) {
      addNotification('Недостаточно золота', 'error');
      return;
    }
    
    // Выполнить обмен
    const newPlayer = { ...player };
    
    // Удалить предметы игрока
    myOffer.items.forEach(item => {
      const index = newPlayer.inventory.findIndex(i => i.id === item.id);
      if (index !== -1) {
        newPlayer.inventory.splice(index, 1);
      }
    });
    
    // Добавить предметы партнера
    partnerOffer.items.forEach(item => {
      newPlayer.inventory.push(item);
    });
    
    // Обмен золотом
    newPlayer.gold = newPlayer.gold - myOffer.gold + partnerOffer.gold;
    
    // Обновить статистику
    newPlayer.friendStats.tradesCompleted += 1;
    
    // Логирование
    console.log('Trade completed:', {
      with: partner.name,
      gave: myOffer,
      received: partnerOffer,
      timestamp: Date.now()
    });
    
    addNotification(`Обмен с ${partner.name} завершен!`, 'success');
    onComplete(newPlayer);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Обмен с {partner.name}</h2>
          <Button variant="danger" onClick={onClose}><X size={20} /></Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Ваше предложение */}
          <div>
            <h3 className="font-bold mb-2">Ваше предложение</h3>
            <div className="space-y-2">
              {myOffer.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                  <span>{item.name}</span>
                  <Button size="sm" variant="danger" onClick={() => removeItem(idx)}>
                    <X size={14} />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Coins size={16} />
                <input
                  type="number"
                  value={myOffer.gold}
                  onChange={(e) => setMyOffer(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-700 rounded px-2 py-1 w-full"
                  placeholder="Золото"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-bold mb-2">Ваш инвентарь</h4>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {player.inventory.map(item => (
                  <Button
                    key={item.id}
                    size="sm"
                    onClick={() => addItemToTrade(item)}
                    disabled={myConfirmed}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Предложение партнера */}
          <div>
            <h3 className="font-bold mb-2">Предложение {partner.name}</h3>
            <div className="space-y-2">
              {partnerOffer.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                  <span>{item.name}</span>
                </div>
              ))}
              {partnerOffer.gold > 0 && (
                <div className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                  <Coins size={16} />
                  <span>{partnerOffer.gold} золота</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button
            variant={myConfirmed ? 'success' : 'primary'}
            onClick={confirmTrade}
            disabled={myConfirmed}
            className="flex-1"
          >
            {myConfirmed ? '✓ Подтверждено' : 'Подтвердить обмен'}
          </Button>
          <Button variant="danger" onClick={onClose}>
            Отменить
          </Button>
        </div>
        
        {partnerConfirmed && (
          <p className="text-center text-green-400 mt-2">
            {partner.name} подтвердил(а) обмен
          </p>
        )}
      </Card>
    </div>
  );
};
```


### 5. Система чата

#### Компонент FriendChat

```javascript
const FriendChat = ({ player, friend, chatHistory, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
  
  const messages = chatHistory[friend.id] || [];
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      from: player.id,
      message: message.trim(),
      timestamp: Date.now(),
      read: false
    };
    
    onSendMessage(friend.id, newMessage);
    setMessage('');
    
    // Симуляция ответа друга (для NPC)
    setTimeout(() => {
      const responses = [
        'Привет! Как дела?',
        'Давай сходим в подземелье?',
        'У меня есть отличный предмет для обмена!',
        'Спасибо за помощь!',
        'Пойдем на совместный квест?'
      ];
      const response = {
        id: (Date.now() + 1).toString(),
        from: friend.id,
        message: responses[getRandomInt(0, responses.length - 1)],
        timestamp: Date.now() + 1000,
        read: false
      };
      onSendMessage(friend.id, response);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col h-[600px]">
      {/* Заголовок */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${AVATARS_DB.find(a => a.id === friend.avatarId)?.color} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold">{friend.name}</h3>
            <p className="text-xs text-slate-400">
              {friend.status === 'online' ? '🟢 Онлайн' : '⚫ Оффлайн'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.from === player.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.from === player.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p>{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      {/* Ввод сообщения */}
      <div className="bg-slate-800 p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Введите сообщение..."
            className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-white"
          />
          <Button onClick={sendMessage}>
            <Send size={20} />
          </Button>
        </div>
        
        {/* Быстрые фразы */}
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={() => setMessage('Привет!')}>
            👋 Привет
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setMessage('Пойдем в группу?')}>
            👥 Группа
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setMessage('Спасибо!')}>
            🙏 Спасибо
          </Button>
        </div>
      </div>
    </div>
  );
};
```


### 6. Система подарков

#### Функции отправки подарков

```javascript
const sendGift = (player, friendId, gift) => {
  // Проверки
  if (player.friendStats.giftsSent >= 10) {
    return { success: false, error: 'Достигнут дневной лимит подарков (10)' };
  }
  
  // Типы подарков
  const giftTypes = {
    energy: { name: 'Энергия', value: 5, icon: Zap },
    gold: { name: 'Золото', value: 100, icon: Coins },
    item: { name: 'Предмет', value: gift.item, icon: Gift }
  };
  
  const giftData = giftTypes[gift.type];
  
  // Удалить из инвентаря игрока
  if (gift.type === 'gold') {
    if (player.gold < gift.value) {
      return { success: false, error: 'Недостаточно золота' };
    }
    player.gold -= gift.value;
  } else if (gift.type === 'item') {
    const itemIndex = player.inventory.findIndex(i => i.id === gift.item.id);
    if (itemIndex === -1) {
      return { success: false, error: 'Предмет не найден' };
    }
    player.inventory.splice(itemIndex, 1);
  }
  
  // Создать уведомление для друга
  const notification = {
    id: Date.now().toString(),
    type: 'gift',
    from: player.name,
    gift: giftData,
    timestamp: Date.now()
  };
  
  // Обновить статистику
  player.friendStats.giftsSent += 1;
  
  addNotification(`Подарок отправлен ${getFriendName(friendId)}!`, 'success');
  
  return { success: true, player };
};

const receiveGift = (player, gift) => {
  // Добавить подарок
  if (gift.type === 'energy') {
    player.energy = Math.min(player.maxEnergy, player.energy + gift.value);
    addNotification(`Получено: +${gift.value} энергии от ${gift.from}`, 'success');
  } else if (gift.type === 'gold') {
    player.gold += gift.value;
    addNotification(`Получено: +${gift.value} золота от ${gift.from}`, 'success');
  } else if (gift.type === 'item') {
    player.inventory.push(gift.value);
    addNotification(`Получен предмет: ${gift.value.name} от ${gift.from}`, 'success');
  }
  
  // Обновить статистику
  player.friendStats.giftsReceived += 1;
  
  return player;
};
```

### 7. Рейтинг друзей

#### Компонент FriendsLeaderboard

```javascript
const FriendsLeaderboard = ({ player, friends }) => {
  const [category, setCategory] = useState('level'); // level, gold, kills, pvp
  
  const sortedFriends = useMemo(() => {
    const allPlayers = [
      { ...player, isPlayer: true },
      ...friends.map(f => ({ ...f, isPlayer: false }))
    ];
    
    return allPlayers.sort((a, b) => {
      switch (category) {
        case 'level':
          return b.level - a.level;
        case 'gold':
          return b.gold - a.gold;
        case 'kills':
          return b.stats.totalKills - a.stats.totalKills;
        case 'pvp':
          return b.stats.pvpRating - a.stats.pvpRating;
        default:
          return 0;
      }
    });
  }, [player, friends, category]);
  
  return (
    <Card title="Рейтинг друзей" icon={Trophy}>
      {/* Категории */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={category === 'level' ? 'primary' : 'secondary'}
          onClick={() => setCategory('level')}
        >
          Уровень
        </Button>
        <Button
          variant={category === 'gold' ? 'primary' : 'secondary'}
          onClick={() => setCategory('gold')}
        >
          Золото
        </Button>
        <Button
          variant={category === 'kills' ? 'primary' : 'secondary'}
          onClick={() => setCategory('kills')}
        >
          Убийства
        </Button>
        <Button
          variant={category === 'pvp' ? 'primary' : 'secondary'}
          onClick={() => setCategory('pvp')}
        >
          PvP
        </Button>
      </div>
      
      {/* Список */}
      <div className="space-y-2">
        {sortedFriends.map((p, index) => (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              p.isPlayer ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-slate-700'
            }`}
          >
            {/* Позиция */}
            <div className="w-8 text-center font-bold">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </div>
            
            {/* Аватар */}
            <div className={`w-10 h-10 rounded-full ${AVATARS_DB.find(a => a.id === p.avatarId)?.color} flex items-center justify-center`}>
              <Icon size={20} />
            </div>
            
            {/* Информация */}
            <div className="flex-1">
              <p className="font-bold">{p.isPlayer ? `${p.name} (Вы)` : p.name}</p>
              <p className="text-sm text-slate-400">{p.className} • Ур. {p.level}</p>
            </div>
            
            {/* Значение */}
            <div className="text-right">
              <p className="font-bold text-lg">
                {category === 'level' && p.level}
                {category === 'gold' && `${p.gold} 💰`}
                {category === 'kills' && p.stats.totalKills}
                {category === 'pvp' && p.stats.pvpRating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
```


## Свойства корректности

### Свойство 1: Добавление друга создает двустороннюю связь

*Для любого* игрока A и игрока B, когда A отправляет запрос дружбы и B принимает, оба игрока должны быть в списках друзей друг друга.

**Validates: Requirements 1.4**

### Свойство 2: Ограничение количества друзей

*Для любого* игрока, количество друзей не должно превышать 50.

**Validates: Requirements 9.1**

### Свойство 3: Совместный квест требует минимум участников

*Для любого* совместного квеста Q с минимальным количеством участников N, группа не может начать квест, если участников меньше N.

**Validates: Requirements 3.2**

### Свойство 4: Бонусы совместного квеста пропорциональны участникам

*Для любого* совместного квеста с бонусом B за участника, награды должны быть умножены на (1 + B * (количество_участников - 1)).

**Validates: Requirements 3.6**

### Свойство 5: Обмен требует подтверждения обеих сторон

*Для любого* обмена между игроками A и B, предметы и золото не должны быть переданы, пока оба игрока не подтвердят обмен.

**Validates: Requirements 4.6**

### Свойство 6: Обмен сохраняет общее количество предметов

*Для любого* обмена, сумма предметов у обоих игроков до и после обмена должна быть одинаковой.

**Validates: Requirements 4.7**

### Свойство 7: Ограничение обменов в день

*Для любого* игрока, количество обменов в день не должно превышать 20.

**Validates: Requirements 9.3**

### Свойство 8: Задержка обмена для новых друзей

*Для любого* друга, добавленного менее 24 часов назад, обмен предметами должен быть недоступен.

**Validates: Requirements 9.5**

### Свойство 9: Ограничение подарков в день

*Для любого* игрока, количество отправленных подарков в день не должно превышать 10.

**Validates: Requirements 9.4**

### Свойство 10: Сообщения сохраняются в истории

*Для любого* отправленного сообщения, оно должно быть добавлено в историю чата и доступно для просмотра.

**Validates: Requirements 6.6**

## Обработка ошибок

### Недостаточно участников для квеста

```javascript
const startCoopQuest = (player, questId, party) => {
  const quest = COOP_QUESTS.find(q => q.id === questId);
  
  if (party.members.length < quest.minPlayers) {
    addNotification(`Для этого квеста нужно минимум ${quest.minPlayers} участников`, 'error');
    return false;
  }
  
  // ... начать квест
};
```

### Превышен лимит друзей

```javascript
const sendFriendRequest = (player, targetId) => {
  if (player.friends.length >= 50) {
    addNotification('Достигнут максимум друзей (50)', 'error');
    return false;
  }
  
  if (player.sentRequests.length >= 10) {
    addNotification('Достигнут дневной лимит запросов дружбы (10)', 'error');
    return false;
  }
  
  // ... отправить запрос
};
```

### Недоступен для обмена

```javascript
const initiateTrade = (player, friendId) => {
  const friend = getFriend(friendId);
  
  if (friend.status !== 'online') {
    addNotification('Друг не в сети', 'error');
    return false;
  }
  
  const friendshipAge = Date.now() - friend.friendship.addedAt;
  if (friendshipAge < 86400000) { // 24 часа
    addNotification('Обмен доступен через 24 часа после добавления в друзья', 'error');
    return false;
  }
  
  if (player.friendStats.tradesCompleted >= 20) {
    addNotification('Достигнут дневной лимит обменов (20)', 'error');
    return false;
  }
  
  // ... начать обмен
};
```

## Интеграция с существующими системами

### Интеграция с гильдиями

```javascript
// Приоритет приглашения друзей в гильдию
const inviteToGuild = (player, targetId) => {
  const isFriend = player.friends.includes(targetId);
  
  if (isFriend) {
    addNotification('Друг получит приоритетное приглашение в гильдию', 'info');
  }
  
  // ... отправить приглашение
};
```

### Интеграция с PvP

```javascript
// Дружеский поединок
const challengeFriend = (player, friendId) => {
  const friend = getFriend(friendId);
  
  if (friend.status !== 'online') {
    addNotification('Друг не в сети', 'error');
    return false;
  }
  
  // Создать PvP матч без потери рейтинга
  const match = {
    type: 'friendly',
    opponent: friend,
    noRatingLoss: true
  };
  
  startPvPMatch(player, match);
};
```

### Интеграция с подземельями

```javascript
// Совместное прохождение подземелий
const enterDungeonWithParty = (player, dungeonId, party) => {
  const dungeon = DUNGEONS.find(d => d.id === dungeonId);
  
  // Бонус за группу: -10% сложности за каждого участника
  const difficultyReduction = 0.1 * (party.members.length - 1);
  
  const modifiedDungeon = {
    ...dungeon,
    enemyPower: dungeon.enemyPower * (1 - difficultyReduction)
  };
  
  addNotification(`Сложность подземелья снижена на ${Math.floor(difficultyReduction * 100)}%`, 'info');
  
  enterDungeon(player, modifiedDungeon);
};
```

## Стратегия тестирования

### Unit-тесты

- Добавление и удаление друзей
- Отправка и принятие запросов дружбы
- Создание и завершение совместных квестов
- Инициация и выполнение обмена
- Отправка и получение подарков
- Отправка и получение сообщений

### Property-тесты

- Свойство 1-10 (см. выше)
- Каждое свойство должно быть покрыто property-based тестом с минимум 100 итерациями

### Интеграционные тесты

- Полный цикл дружбы (запрос → принятие → взаимодействие)
- Полный цикл совместного квеста (создание группы → выполнение → награды)
- Полный цикл обмена (инициация → добавление предметов → подтверждение → выполнение)

