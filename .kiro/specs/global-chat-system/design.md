# Документ дизайна: Система глобального чата

## Обзор

Данный документ описывает технический дизайн для реализации системы глобального чата в браузерной RPG игре на React. Система включает многоканальный чат, эмодзи/стикеры, фильтрацию сообщений, блокировку игроков, команды чата и симуляцию NPC-активности.

### Цели дизайна

- Создать интуитивный интерфейс чата с поддержкой нескольких каналов
- Обеспечить плавную работу чата без влияния на производительность игры
- Реализовать систему фильтрации и модерации контента
- Симулировать активность через NPC-сообщения для создания живой атмосферы
- Интегрировать чат с существующими игровыми системами
- Обеспечить сохранение состояния и настроек в localStorage

### Технологический стек

- React 18+ с хуками (useState, useEffect, useRef, useMemo, useCallback)
- Tailwind CSS для стилизации
- Lucide React для иконок
- localStorage для сохранения данных чата
- React.memo для оптимизации рендеринга
- Виртуализация списков для производительности

## Архитектура

### Общая структура

Система чата состоит из следующих основных компонентов:

1. **ChatPanel**: Главный контейнер чата (правая панель)
2. **ChatToggleButton**: Кнопка открытия/закрытия чата
3. **ChannelTabs**: Вкладки переключения каналов
4. **MessageList**: Виртуализированный список сообщений
5. **MessageInput**: Поле ввода с поддержкой команд
6. **EmojiPicker**: Панель выбора эмодзи
7. **StickerPicker**: Панель выбора стикеров
8. **ChatSettings**: Настройки чата
9. **NPCMessageGenerator**: Генератор NPC-сообщений

### Модель данных


#### Структура сообщения

```javascript
interface Message {
  id: string;
  channelId: string;
  author: {
    id: string;
    name: string;
    level: number;
    avatarId: number;
    isNPC: boolean;
  };
  content: string;
  timestamp: number;
  type: 'text' | 'sticker' | 'system';
  stickerId?: number;
  replyTo?: {
    messageId: string;
    authorName: string;
    content: string;
  };
  mentions?: string[];
}
```

#### Структура канала

```javascript
interface Channel {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
  messages: Message[];
  unreadCount: number;
  maxMessages: number;
}
```

#### Состояние чата

```javascript
interface ChatState {
  isOpen: boolean;
  activeChannelId: string;
  channels: Record<string, Channel>;
  blockedPlayers: string[];
  settings: ChatSettings;
  lastMessageTime: number;
  cooldownRemaining: number;
  spamDetection: {
    lastMessages: string[];
    spamBlockedUntil: number;
  };
}
```

#### Настройки чата

```javascript
interface ChatSettings {
  fontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  showAvatars: boolean;
  soundEnabled: boolean;
  profanityFilter: boolean;
  opacity: number; // 0-100
}
```

## Компоненты и интерфейсы

### 1. Константы и данные


#### Каналы чата

```javascript
const CHAT_CHANNELS = [
  {
    id: 'general',
    name: 'Общий',
    color: 'bg-blue-500',
    icon: MessageSquare,
    maxMessages: 100
  },
  {
    id: 'trade',
    name: 'Торговля',
    color: 'bg-yellow-500',
    icon: ShoppingBag,
    maxMessages: 100
  },
  {
    id: 'help',
    name: 'Помощь',
    color: 'bg-green-500',
    icon: Info,
    maxMessages: 100
  }
];
```

#### Эмодзи

```javascript
const EMOJI_CATEGORIES = {
  emotions: {
    name: 'Эмоции',
    emojis: ['😀', '😂', '😍', '😎', '😢', '😡', '🤔', '😱']
  },
  actions: {
    name: 'Действия',
    emojis: ['👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '👋']
  },
  items: {
    name: 'Предметы',
    emojis: ['⚔️', '🛡️', '🏹', '🔮', '💎', '👑', '🎁', '💰']
  }
};

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES)
  .flatMap(cat => cat.emojis);
```

#### Стикеры

```javascript
const STICKERS = [
  { id: 1, name: 'Победа', emoji: '🎉', category: 'celebration' },
  { id: 2, name: 'Поражение', emoji: '💀', category: 'combat' },
  { id: 3, name: 'Удача', emoji: '🍀', category: 'general' },
  { id: 4, name: 'Сила', emoji: '💪', category: 'combat' },
  { id: 5, name: 'Магия', emoji: '✨', category: 'magic' },
  { id: 6, name: 'Дракон', emoji: '🐉', category: 'creatures' },
  { id: 7, name: 'Меч', emoji: '⚔️', category: 'items' },
  { id: 8, name: 'Щит', emoji: '🛡️', category: 'items' },
  { id: 9, name: 'Зелье', emoji: '🧪', category: 'items' },
  { id: 10, name: 'Сокровище', emoji: '💎', category: 'items' }
];
```

#### Список запрещенных слов

```javascript
const PROFANITY_LIST = [
  'плохое_слово1',
  'плохое_слово2',
  'плохое_слово3'
  // ... расширяемый список
];
```

#### Команды чата

```javascript
const CHAT_COMMANDS = [
  {
    command: '/help',
    description: 'Показать список команд',
    usage: '/help'
  },
  {
    command: '/clear',
    description: 'Очистить историю чата',
    usage: '/clear'
  },
  {
    command: '/whisper',
    description: 'Отправить личное сообщение',
    usage: '/whisper [имя] [сообщение]'
  },
  {
    command: '/block',
    description: 'Заблокировать игрока',
    usage: '/block [имя]'
  },
  {
    command: '/unblock',
    description: 'Разблокировать игрока',
    usage: '/unblock [имя]'
  }
];
```

### 2. Компонент ChatPanel

Главный контейнер чата, управляющий всем состоянием.


```javascript
const ChatPanel = ({ player, isOpen, onToggle }) => {
  const [activeChannel, setActiveChannel] = useState('general');
  const [channels, setChannels] = useState(() => initializeChannels());
  const [blockedPlayers, setBlockedPlayers] = useState(() => 
    loadFromLocalStorage('chat_blocked_players', [])
  );
  const [settings, setSettings] = useState(() => 
    loadFromLocalStorage('chat_settings', DEFAULT_SETTINGS)
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [spamState, setSpamState] = useState({
    lastMessages: [],
    blockedUntil: 0
  });

  // Загрузка сообщений из localStorage при монтировании
  useEffect(() => {
    const savedMessages = loadFromLocalStorage('chat_messages', {});
    setChannels(prev => {
      const updated = { ...prev };
      Object.keys(savedMessages).forEach(channelId => {
        if (updated[channelId]) {
          updated[channelId].messages = savedMessages[channelId];
        }
      });
      return updated;
    });
  }, []);

  // Сохранение сообщений в localStorage
  useEffect(() => {
    const messagesToSave = {};
    Object.entries(channels).forEach(([id, channel]) => {
      messagesToSave[id] = channel.messages;
    });
    saveToLocalStorage('chat_messages', messagesToSave);
  }, [channels]);

  // Сохранение состояния открытия/закрытия
  useEffect(() => {
    saveToLocalStorage('chat_is_open', isOpen);
  }, [isOpen]);

  // Сохранение активного канала
  useEffect(() => {
    saveToLocalStorage('chat_active_channel', activeChannel);
  }, [activeChannel]);

  // Генерация NPC-сообщений
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.5) { // 50% шанс генерации
        const randomChannel = ['general', 'trade', 'help'][
          Math.floor(Math.random() * 3)
        ];
        const npcMessage = generateNPCMessage(randomChannel);
        addMessage(randomChannel, npcMessage);
      }
    }, getRandomInt(10000, 30000)); // 10-30 секунд

    return () => clearInterval(interval);
  }, []);

  // Кулдаун отправки сообщений
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const addMessage = useCallback((channelId, message) => {
    setChannels(prev => {
      const channel = prev[channelId];
      const updatedMessages = [...channel.messages, message];
      
      // Ограничение до 100 сообщений
      if (updatedMessages.length > channel.maxMessages) {
        updatedMessages.shift();
      }

      // Увеличить счетчик непрочитанных, если канал неактивен
      const unreadCount = channelId !== activeChannel 
        ? channel.unreadCount + 1 
        : 0;

      return {
        ...prev,
        [channelId]: {
          ...channel,
          messages: updatedMessages,
          unreadCount
        }
      };
    });

    // Уведомление о новом сообщении
    if (!isOpen && message.mentions?.includes(player.name)) {
      playNotificationSound();
      showBrowserNotification(message);
    }
  }, [activeChannel, isOpen, player.name]);

  return (
    <div className={`fixed right-0 top-0 h-full transition-all duration-300 ${
      isOpen ? 'w-96' : 'w-0'
    }`}>
      {isOpen && (
        <div 
          className="h-full bg-slate-800 border-l border-slate-700 flex flex-col"
          style={{ opacity: settings.opacity / 100 }}
        >
          {/* Заголовок */}
          <ChatHeader 
            onClose={onToggle}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Вкладки каналов */}
          <ChannelTabs
            channels={channels}
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
          />

          {/* Список сообщений */}
          <MessageList
            messages={channels[activeChannel].messages}
            blockedPlayers={blockedPlayers}
            settings={settings}
            player={player}
            onReply={handleReply}
            onBlock={handleBlock}
            onReport={handleReport}
          />

          {/* Поле ввода */}
          <MessageInput
            onSendMessage={handleSendMessage}
            cooldownRemaining={cooldownRemaining}
            spamBlocked={spamState.blockedUntil > Date.now()}
            onOpenEmoji={() => setShowEmojiPicker(true)}
            onOpenSticker={() => setShowStickerPicker(true)}
          />

          {/* Модальные окна */}
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
          {showStickerPicker && (
            <StickerPicker
              onSelect={handleStickerSelect}
              onClose={() => setShowStickerPicker(false)}
            />
          )}
          {showSettings && (
            <ChatSettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              onClose={() => setShowSettings(false)}
              blockedPlayers={blockedPlayers}
              onUnblock={handleUnblock}
            />
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Компонент ChatToggleButton

Кнопка открытия/закрытия чата с индикатором новых сообщений.


```javascript
const ChatToggleButton = ({ isOpen, unreadCount, hasNewMentions, onClick }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (hasNewMentions && !isOpen) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasNewMentions, isOpen]);

  return (
    <button
      onClick={onClick}
      className={`fixed right-4 bottom-4 w-14 h-14 rounded-full bg-blue-600 
        hover:bg-blue-700 flex items-center justify-center shadow-lg 
        transition-all ${isPulsing ? 'animate-pulse' : ''}`}
    >
      {isOpen ? (
        <X size={24} className="text-white" />
      ) : (
        <>
          <MessageSquare size={24} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white 
              text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
};
```

### 4. Компонент ChannelTabs

Вкладки для переключения между каналами.

```javascript
const ChannelTabs = ({ channels, activeChannel, onChannelChange }) => {
  return (
    <div className="flex border-b border-slate-700">
      {Object.entries(channels).map(([id, channel]) => {
        const Icon = channel.icon;
        const isActive = id === activeChannel;
        
        return (
          <button
            key={id}
            onClick={() => onChannelChange(id)}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 
              transition-colors relative ${
              isActive 
                ? 'bg-slate-700 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{channel.name}</span>
            
            {channel.unreadCount > 0 && !isActive && (
              <span className="absolute top-1 right-1 bg-red-500 text-white 
                text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
```

### 5. Компонент MessageList

Виртуализированный список сообщений с оптимизацией производительности.


```javascript
const MessageList = React.memo(({ 
  messages, 
  blockedPlayers, 
  settings, 
  player,
  onReply,
  onBlock,
  onReport 
}) => {
  const messagesEndRef = useRef(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Фильтрация заблокированных игроков
  const visibleMessages = useMemo(() => {
    return messages.filter(msg => 
      !blockedPlayers.includes(msg.author.id)
    );
  }, [messages, blockedPlayers]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {visibleMessages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          settings={settings}
          isOwnMessage={message.author.id === player.id}
          isMentioned={message.mentions?.includes(player.name)}
          isHovered={hoveredMessageId === message.id}
          onMouseEnter={() => setHoveredMessageId(message.id)}
          onMouseLeave={() => setHoveredMessageId(null)}
          onReply={() => onReply(message)}
          onBlock={() => onBlock(message.author.id)}
          onReport={() => onReport(message.id)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});
```

### 6. Компонент MessageItem

Отдельное сообщение с контекстным меню.

```javascript
const MessageItem = React.memo(({ 
  message, 
  settings, 
  isOwnMessage,
  isMentioned,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onReply,
  onBlock,
  onReport
}) => {
  const AvatarIcon = AVATARS_DB.find(a => a.id === message.author.avatarId)?.icon || User;
  const avatarColor = AVATARS_DB.find(a => a.id === message.author.avatarId)?.color || 'bg-gray-500';

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[settings.fontSize];

  return (
    <div
      className={`flex gap-3 p-2 rounded-lg transition-colors ${
        isMentioned ? 'bg-blue-900/30 border-l-4 border-blue-500' : ''
      } ${isHovered ? 'bg-slate-700/50' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Аватар */}
      {settings.showAvatars && (
        <div className={`w-10 h-10 rounded-full ${avatarColor} 
          flex items-center justify-center flex-shrink-0`}>
          <AvatarIcon size={20} className="text-white" />
        </div>
      )}

      {/* Контент */}
      <div className="flex-1 min-w-0">
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white">
            {message.author.name}
          </span>
          <span className="text-xs text-slate-400">
            Ур. {message.author.level}
          </span>
          {message.author.isNPC && (
            <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">
              NPC
            </span>
          )}
          {settings.showTimestamps && (
            <span className="text-xs text-slate-500">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>

        {/* Ответ на сообщение */}
        {message.replyTo && (
          <div className="bg-slate-700/50 border-l-2 border-slate-500 
            pl-2 py-1 mb-2 text-sm text-slate-400">
            <span className="font-semibold">{message.replyTo.authorName}:</span>{' '}
            {message.replyTo.content.substring(0, 50)}
            {message.replyTo.content.length > 50 && '...'}
          </div>
        )}

        {/* Текст сообщения */}
        {message.type === 'text' && (
          <p className={`text-slate-200 break-words ${fontSizeClass}`}>
            {message.content}
          </p>
        )}

        {/* Стикер */}
        {message.type === 'sticker' && (
          <div className="text-6xl">
            {STICKERS.find(s => s.id === message.stickerId)?.emoji}
          </div>
        )}

        {/* Системное сообщение */}
        {message.type === 'system' && (
          <p className="text-yellow-400 italic text-sm">
            {message.content}
          </p>
        )}
      </div>

      {/* Контекстное меню */}
      {isHovered && !isOwnMessage && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onReply}
            className="p-1 hover:bg-slate-600 rounded"
            title="Ответить"
          >
            <MessageSquare size={16} className="text-slate-400" />
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(message.content)}
            className="p-1 hover:bg-slate-600 rounded"
            title="Копировать"
          >
            <Copy size={16} className="text-slate-400" />
          </button>
          <button
            onClick={onBlock}
            className="p-1 hover:bg-slate-600 rounded"
            title="Заблокировать"
          >
            <Ban size={16} className="text-slate-400" />
          </button>
          <button
            onClick={onReport}
            className="p-1 hover:bg-slate-600 rounded"
            title="Пожаловаться"
          >
            <Flag size={16} className="text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
});
```

### 7. Компонент MessageInput

Поле ввода с поддержкой команд, эмодзи и кулдауна.


```javascript
const MessageInput = ({ 
  onSendMessage, 
  cooldownRemaining, 
  spamBlocked,
  onOpenEmoji,
  onOpenSticker 
}) => {
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Debounce для ввода текста
  const debouncedMessage = useDebounce(message, 300);

  // Автодополнение команд
  useEffect(() => {
    if (message.startsWith('/')) {
      setShowCommandSuggestions(true);
    } else {
      setShowCommandSuggestions(false);
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (cooldownRemaining > 0) return;
    if (spamBlocked) return;
    if (message.length > 500) {
      addNotification('Сообщение слишком длинное (макс. 500 символов)', 'error');
      return;
    }

    // Проверка на команду
    if (message.startsWith('/')) {
      handleCommand(message);
    } else {
      onSendMessage(message, replyTo);
    }

    setMessage('');
    setReplyTo(null);
  };

  const handleCommand = (cmd) => {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/help':
        showCommandHelp();
        break;
      case '/clear':
        clearChatHistory();
        break;
      case '/whisper':
        if (parts.length < 3) {
          addNotification('Использование: /whisper [имя] [сообщение]', 'error');
        } else {
          sendWhisper(parts[1], parts.slice(2).join(' '));
        }
        break;
      case '/block':
        if (parts.length < 2) {
          addNotification('Использование: /block [имя]', 'error');
        } else {
          blockPlayer(parts[1]);
        }
        break;
      case '/unblock':
        if (parts.length < 2) {
          addNotification('Использование: /unblock [имя]', 'error');
        } else {
          unblockPlayer(parts[1]);
        }
        break;
      default:
        addNotification('Неизвестная команда. Используйте /help', 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-700 p-4">
      {/* Ответ на сообщение */}
      {replyTo && (
        <div className="bg-slate-700 rounded-lg p-2 mb-2 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-400">Ответ на:</span>{' '}
            <span className="text-white font-semibold">{replyTo.authorName}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Автодополнение команд */}
      {showCommandSuggestions && (
        <div className="bg-slate-700 rounded-lg mb-2 max-h-40 overflow-y-auto">
          {CHAT_COMMANDS
            .filter(cmd => cmd.command.startsWith(message.split(' ')[0]))
            .map(cmd => (
              <button
                key={cmd.command}
                onClick={() => setMessage(cmd.usage)}
                className="w-full text-left p-2 hover:bg-slate-600 transition-colors"
              >
                <div className="font-mono text-sm text-blue-400">{cmd.command}</div>
                <div className="text-xs text-slate-400">{cmd.description}</div>
              </button>
            ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-2">
        <button
          onClick={onOpenEmoji}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Эмодзи"
        >
          <Smile size={20} className="text-slate-400" />
        </button>

        <button
          onClick={onOpenSticker}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Стикеры"
        >
          <Image size={20} className="text-slate-400" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            spamBlocked 
              ? 'Заблокировано за спам...' 
              : cooldownRemaining > 0 
              ? `Подождите ${cooldownRemaining}с...`
              : 'Введите сообщение...'
          }
          disabled={cooldownRemaining > 0 || spamBlocked}
          maxLength={500}
          className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-white 
            placeholder-slate-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || cooldownRemaining > 0 || spamBlocked}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          {cooldownRemaining > 0 ? (
            <span className="text-sm">{cooldownRemaining}s</span>
          ) : (
            <Send size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* Счетчик символов */}
      <div className="text-xs text-slate-500 mt-1 text-right">
        {message.length}/500
      </div>
    </div>
  );
};
```

### 8. Компонент EmojiPicker

Панель выбора эмодзи с категориями.


```javascript
const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('emotions');

  return (
    <div className="absolute bottom-20 left-4 bg-slate-800 rounded-lg 
      shadow-xl border border-slate-700 p-4 w-80 z-50">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white">Эмодзи</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Категории */}
      <div className="flex gap-2 mb-3">
        {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Эмодзи */}
      <div className="grid grid-cols-8 gap-2">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-2xl hover:bg-slate-700 rounded p-2 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 9. Компонент StickerPicker

Панель выбора стикеров.

```javascript
const StickerPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(STICKERS.map(s => s.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredStickers = useMemo(() => {
    if (activeCategory === 'all') return STICKERS;
    return STICKERS.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="absolute bottom-20 left-4 bg-slate-800 rounded-lg 
      shadow-xl border border-slate-700 p-4 w-80 z-50">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white">Стикеры</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Категории */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap 
              transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Все' : cat}
          </button>
        ))}
      </div>

      {/* Стикеры */}
      <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
        {filteredStickers.map(sticker => (
          <button
            key={sticker.id}
            onClick={() => {
              onSelect(sticker);
              onClose();
            }}
            className="text-4xl hover:bg-slate-700 rounded p-2 transition-colors"
            title={sticker.name}
          >
            {sticker.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 10. Компонент ChatSettings

Настройки чата и управление заблокированными игроками.


```javascript
const ChatSettings = ({ 
  settings, 
  onUpdate, 
  onClose, 
  blockedPlayers,
  onUnblock 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Настройки чата</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Размер шрифта */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Размер шрифта
            </label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    localSettings.fontSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {size === 'small' && 'Маленький'}
                  {size === 'medium' && 'Средний'}
                  {size === 'large' && 'Большой'}
                </button>
              ))}
            </div>
          </div>

          {/* Прозрачность */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Прозрачность: {localSettings.opacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={localSettings.opacity}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                opacity: parseInt(e.target.value) 
              }))}
              className="w-full"
            />
          </div>

          {/* Переключатели */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-slate-300">Показывать временные метки</span>
              <input
                type="checkbox"
                checked={localSettings.showTimestamps}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  showTimestamps: e.target.checked 
                }))}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-slate-300">Показывать аватары</span>
              <input
                type="checkbox"
                checked={localSettings.showAvatars}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  showAvatars: e.target.checked 
                }))}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-slate-300">Звуковые уведомления</span>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  soundEnabled: e.target.checked 
                }))}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-slate-300">Фильтр нецензурной лексики</span>
              <input
                type="checkbox"
                checked={localSettings.profanityFilter}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  profanityFilter: e.target.checked 
                }))}
                className="w-5 h-5"
              />
            </label>
          </div>

          {/* Заблокированные игроки */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Заблокированные игроки ({blockedPlayers.length}/50)
            </h3>
            <div className="bg-slate-700 rounded-lg p-2 max-h-40 overflow-y-auto">
              {blockedPlayers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-2">
                  Нет заблокированных игроков
                </p>
              ) : (
                <div className="space-y-1">
                  {blockedPlayers.map(playerId => (
                    <div 
                      key={playerId}
                      className="flex items-center justify-between p-2 
                        bg-slate-600 rounded"
                    >
                      <span className="text-white text-sm">{playerId}</span>
                      <button
                        onClick={() => onUnblock(playerId)}
                        className="text-xs bg-red-600 hover:bg-red-700 
                          px-2 py-1 rounded"
                      >
                        Разблокировать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white 
                py-2 rounded-lg transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white 
                py-2 rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Логика и функции

### 1. Генерация NPC-сообщений


```javascript
const NPC_NAMES = [
  'Артур', 'Мерлин', 'Ланселот', 'Гвиневра', 'Моргана',
  'Персиваль', 'Галахад', 'Тристан', 'Изольда', 'Бедивер',
  'Кей', 'Гарет', 'Гавейн', 'Элейн', 'Вивиана'
];

const MESSAGE_TEMPLATES = {
  general: [
    'Привет всем!',
    'Кто-нибудь хочет пойти в подземелье?',
    'Только что достиг {level} уровня!',
    'Эта игра потрясающая!',
    'Кто-нибудь знает, где найти {resource}?',
    'Ищу группу для квеста',
    'Спасибо за помощь!',
    'Кто онлайн?'
  ],
  trade: [
    'Продаю {item} за {price} золота',
    'Куплю {item}, предлагайте цену',
    'Обменяю {item1} на {item2}',
    'WTS {item} - шепните цену',
    'Ищу {item}, заплачу хорошо',
    'Распродажа! {item} всего за {price} золота',
    'Кто-нибудь продает {item}?'
  ],
  help: [
    'Как мне повысить уровень быстрее?',
    'Где найти {resource}?',
    'Помогите с квестом "{quest}"',
    'Какой класс лучше для новичка?',
    'Как работает крафтинг?',
    'Спасибо за совет!',
    'Кто-нибудь может объяснить систему гильдий?',
    'Где лучше фармить золото?'
  ]
};

const generateNPCMessage = (channelId) => {
  const name = NPC_NAMES[getRandomInt(0, NPC_NAMES.length - 1)];
  const level = getRandomInt(1, 50);
  const avatarId = getRandomInt(1, 15);
  
  const templates = MESSAGE_TEMPLATES[channelId] || MESSAGE_TEMPLATES.general;
  let content = templates[getRandomInt(0, templates.length - 1)];
  
  // Замена плейсхолдеров
  content = content
    .replace('{level}', level)
    .replace('{resource}', getRandomResource())
    .replace('{item}', getRandomItem())
    .replace('{item1}', getRandomItem())
    .replace('{item2}', getRandomItem())
    .replace('{price}', getRandomInt(100, 5000))
    .replace('{quest}', getRandomQuest());

  return {
    id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    author: {
      id: `npc_${name}_${level}`,
      name,
      level,
      avatarId,
      isNPC: true
    },
    content,
    timestamp: Date.now(),
    type: 'text',
    mentions: []
  };
};

const getRandomResource = () => {
  const resources = ['wood', 'iron_ore', 'gold_ore', 'crystal', 'mithril_ore'];
  return resources[getRandomInt(0, resources.length - 1)];
};

const getRandomItem = () => {
  const items = [
    'Стальной меч', 'Кожаная броня', 'Зелье здоровья',
    'Огненный клинок', 'Латы рыцаря', 'Эльфийский лук'
  ];
  return items[getRandomInt(0, items.length - 1)];
};

const getRandomQuest = () => {
  const quests = [
    'Охота на волков', 'Сбор трав', 'Зачистка пещеры',
    'Поиск артефакта', 'Спасение деревни'
  ];
  return quests[getRandomInt(0, quests.length - 1)];
};
```

### 2. Фильтрация сообщений

```javascript
const filterProfanity = (text, enabled) => {
  if (!enabled) return text;
  
  let filtered = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  
  return filtered;
};

const detectSpam = (message, spamState) => {
  const now = Date.now();
  
  // Проверка блокировки за спам
  if (spamState.blockedUntil > now) {
    return {
      isSpam: true,
      blocked: true,
      remainingTime: Math.ceil((spamState.blockedUntil - now) / 1000)
    };
  }
  
  // Добавить сообщение в историю
  const recentMessages = [...spamState.lastMessages, message].slice(-3);
  
  // Проверка на повторяющиеся сообщения
  if (recentMessages.length === 3 && 
      recentMessages.every(msg => msg === message)) {
    return {
      isSpam: true,
      blocked: true,
      blockedUntil: now + 30000, // 30 секунд
      lastMessages: []
    };
  }
  
  return {
    isSpam: false,
    blocked: false,
    lastMessages: recentMessages
  };
};
```

### 3. Обработка упоминаний

```javascript
const detectMentions = (text, playerName) => {
  const mentions = [];
  const words = text.split(/\s+/);
  
  words.forEach(word => {
    if (word.startsWith('@')) {
      const mentionedName = word.substring(1);
      mentions.push(mentionedName);
    }
  });
  
  return {
    mentions,
    isMentioned: mentions.includes(playerName)
  };
};

const highlightMentions = (text) => {
  return text.replace(/@(\w+)/g, '<span class="text-blue-400 font-bold">@$1</span>');
};
```

### 4. Уведомления

```javascript
const playNotificationSound = () => {
  // Создать и воспроизвести звук уведомления
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const showBrowserNotification = (message) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification('Новое сообщение в чате', {
      body: `${message.author.name}: ${message.content.substring(0, 50)}...`,
      icon: '/chat-icon.png',
      tag: 'chat-notification'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showBrowserNotification(message);
      }
    });
  }
};

const updatePageTitle = (unreadCount) => {
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) RPG Game - Chat`;
  } else {
    document.title = 'RPG Game';
  }
};
```

### 5. Утилиты localStorage

```javascript
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const clearChatHistory = (channelId) => {
  const messages = loadFromLocalStorage('chat_messages', {});
  if (channelId) {
    messages[channelId] = [];
  } else {
    Object.keys(messages).forEach(key => {
      messages[key] = [];
    });
  }
  saveToLocalStorage('chat_messages', messages);
};
```

### 6. Утилиты форматирования

```javascript
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}д назад`;
  if (hours > 0) return `${hours}ч назад`;
  if (minutes > 0) return `${minutes}м назад`;
  return 'только что';
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

## Интеграция с существующей игрой

### Добавление в App.jsx

```javascript
// В компоненте App
const [chatOpen, setChatOpen] = useState(() => 
  loadFromLocalStorage('chat_is_open', false)
);

// В JSX перед закрывающим тегом
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    {/* Существующий контент игры */}
    
    {/* Чат */}
    <ChatPanel 
      player={player}
      isOpen={chatOpen}
      onToggle={() => setChatOpen(prev => !prev)}
    />
    
    <ChatToggleButton
      isOpen={chatOpen}
      unreadCount={getTotalUnreadCount()}
      hasNewMentions={hasNewMentions()}
      onClick={() => setChatOpen(prev => !prev)}
    />
  </div>
);
```

### Расчет непрочитанных сообщений

```javascript
const getTotalUnreadCount = () => {
  const channels = loadFromLocalStorage('chat_channels', {});
  return Object.values(channels).reduce((sum, channel) => 
    sum + (channel.unreadCount || 0), 0
  );
};

const hasNewMentions = () => {
  const messages = loadFromLocalStorage('chat_messages', {});
  const playerName = player.name;
  
  return Object.values(messages).some(channelMessages =>
    channelMessages.some(msg => 
      msg.mentions?.includes(playerName) && !msg.read
    )
  );
};
```


## Свойства корректности

*Свойство (property) - это характеристика или поведение, которое должно выполняться для всех допустимых выполнений системы - по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Property Reflection

После анализа всех критериев приемки, выявлены следующие группы избыточных свойств:

1. **localStorage round-trip properties** (1.5, 2.4, 5.7, 6.3, 10.8) - можно объединить в одно свойство о сохранении состояния
2. **Message limit properties** (2.7, 12.1, 12.3) - все проверяют ограничение в 100 сообщений, можно объединить
3. **Block button properties** (6.1, 7.5) - оба проверяют наличие кнопки блокировки
4. **Settings toggle properties** (10.2-10.7) - все проверяют обновление настроек, можно объединить
5. **NPC message template properties** (11.3, 11.6) - оба проверяют использование правильных шаблонов для каналов

Финальный список свойств исключает избыточность и фокусируется на уникальной валидации.

### Свойство 1: Переключение состояния чата

*Для любого* состояния чата (открыт/закрыт), переключение должно изменить состояние на противоположное и корректно отобразить/скрыть панель.

**Validates: Requirements 1.3, 1.4**

### Свойство 2: Сохранение состояния в localStorage

*Для любого* состояния чата (isOpen, activeChannel, settings, blockedPlayers), сохранение в localStorage и последующая загрузка должны вернуть эквивалентное состояние.

**Validates: Requirements 1.5, 2.4, 5.7, 6.3, 10.8**

### Свойство 3: Индикатор непрочитанных сообщений

*Для любого* количества непрочитанных сообщений больше нуля, когда чат закрыт, кнопка чата должна отображать счетчик с этим количеством.

**Validates: Requirements 1.6, 8.1**

### Свойство 4: Переключение каналов

*Для любого* канала, переключение на него должно отобразить сообщения только этого канала и сбросить счетчик непрочитанных для него.

**Validates: Requirements 2.3, 2.5**

### Свойство 5: Ограничение истории сообщений

*Для любого* канала с 100 сообщениями, добавление нового сообщения должно удалить самое старое сообщение, сохраняя общее количество равным 100.

**Validates: Requirements 2.7, 12.1, 12.3**

### Свойство 6: Добавление сообщения в канал

*Для любого* валидного сообщения и канала, отправка должна добавить сообщение в массив сообщений этого канала с корректными метаданными (автор, временная метка, содержимое).

**Validates: Requirements 3.2, 3.3, 3.4**

### Свойство 7: Валидация длины сообщения

*Для любого* сообщения длиной более 500 символов, система должна отклонить отправку и показать уведомление об ошибке.

**Validates: Requirements 3.5**

### Свойство 8: Отклонение пустых сообщений

*Для любой* строки, состоящей только из пробельных символов, система должна отклонить отправку.

**Validates: Requirements 3.6**

### Свойство 9: Кулдаун между сообщениями

*Для любых* двух последовательных попыток отправки сообщений, если между ними прошло менее 3 секунд, вторая попытка должна быть заблокирована с отображением оставшегося времени.

**Validates: Requirements 3.7, 3.8**

### Свойство 10: Вставка эмодзи

*Для любого* эмодзи из списка, выбор должен вставить его в текущую позицию курсора в поле ввода.

**Validates: Requirements 4.4**

### Свойство 11: Отображение стикеров

*Для любого* сообщения типа 'sticker', оно должно отображаться как графический элемент (эмодзи) вместо текста.

**Validates: Requirements 4.6**

### Свойство 12: Фильтрация нецензурной лексики

*Для любого* сообщения, содержащего слова из списка запрещенных, когда фильтр включен, все вхождения должны быть заменены на '***'.

**Validates: Requirements 5.1**

### Свойство 13: Детекция спама

*Для любой* последовательности из 3 идентичных сообщений подряд от одного пользователя, система должна заблокировать отправку на 30 секунд и показать предупреждение.

**Validates: Requirements 5.4, 5.5, 5.6**

### Свойство 14: Скрытие заблокированных игроков

*Для любого* списка сообщений и списка заблокированных игроков, отображаемые сообщения не должны содержать сообщения от заблокированных игроков.

**Validates: Requirements 6.2**

### Свойство 15: Разблокировка игрока

*Для любого* игрока в списке заблокированных, разблокировка должна удалить его из списка и снова показать его сообщения.

**Validates: Requirements 6.5**

### Свойство 16: Ограничение заблокированных игроков

*Для любого* списка заблокированных игроков, его размер не должен превышать 50 элементов.

**Validates: Requirements 6.6**

### Свойство 17: Контекстное меню сообщений

*Для любого* сообщения от другого игрока, при наведении курсора должны отображаться кнопки действий (ответить, копировать, заблокировать, пожаловаться).

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Свойство 18: Ответ на сообщение

*Для любого* сообщения, выбор "ответить" должен установить replyTo состояние с ссылкой на оригинальное сообщение, и отправленный ответ должен содержать эту ссылку.

**Validates: Requirements 7.6, 7.7**

### Свойство 19: Сброс непрочитанных при открытии

*Для любого* канала с непрочитанными сообщениями, открытие чата и переключение на этот канал должно сбросить счетчик непрочитанных до 0.

**Validates: Requirements 8.6**

### Свойство 20: Выделение упоминаний

*Для любого* сообщения, содержащего @имя_игрока, где имя совпадает с именем текущего игрока, сообщение должно быть выделено специальным стилем.

**Validates: Requirements 8.4**

### Свойство 21: Обновление заголовка страницы

*Для любого* количества непрочитанных сообщений N > 0, заголовок страницы (document.title) должен содержать "(N)".

**Validates: Requirements 8.7**

### Свойство 22: Обработка команд

*Для любого* сообщения, начинающегося с '/', система должна обработать его как команду, а не как обычное сообщение.

**Validates: Requirements 9.1**

### Свойство 23: Автодополнение команд

*Для любого* ввода, начинающегося с '/', система должна отображать список команд, начинающихся с введенного префикса.

**Validates: Requirements 9.7**

### Свойство 24: Ошибка неверной команды

*Для любой* команды, не существующей в списке CHAT_COMMANDS, система должна показать уведомление об ошибке.

**Validates: Requirements 9.8**

### Свойство 25: Обновление настроек

*Для любого* изменения настроек (fontSize, showTimestamps, showAvatars, soundEnabled, profanityFilter, opacity), новое значение должно немедленно применяться к UI без перезагрузки.

**Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.9**

### Свойство 26: Генерация NPC-сообщений

*Для любого* NPC-сообщения, оно должно иметь случайное имя из списка NPC_NAMES, случайный уровень (1-50), флаг isNPC=true, и содержимое из шаблонов соответствующего канала.

**Validates: Requirements 11.1, 11.3, 11.4, 11.6**

### Свойство 27: Распределение NPC по каналам

*Для любого* периода времени, NPC-сообщения должны появляться во всех каналах (general, trade, help), а не только в одном.

**Validates: Requirements 11.5**

### Свойство 28: Ограничение NPC-сообщений

*Для любого* канала, доля NPC-сообщений не должна превышать 50% от общего количества сообщений.

**Validates: Requirements 11.7**

## Обработка ошибок

### Превышение лимита символов

```javascript
const validateMessageLength = (message) => {
  if (message.length > 500) {
    addNotification('Сообщение слишком длинное (макс. 500 символов)', 'error');
    return false;
  }
  return true;
};
```

### Попытка отправки во время кулдауна

```javascript
const checkCooldown = (lastMessageTime) => {
  const now = Date.now();
  const timeSinceLastMessage = now - lastMessageTime;
  const cooldownDuration = 3000; // 3 секунды
  
  if (timeSinceLastMessage < cooldownDuration) {
    const remaining = Math.ceil((cooldownDuration - timeSinceLastMessage) / 1000);
    addNotification(`Подождите ${remaining} секунд перед отправкой`, 'warning');
    return false;
  }
  return true;
};
```

### Блокировка за спам

```javascript
const handleSpamBlock = (blockedUntil) => {
  const now = Date.now();
  if (blockedUntil > now) {
    const remaining = Math.ceil((blockedUntil - now) / 1000);
    addNotification(
      `Вы заблокированы за спам на ${remaining} секунд`, 
      'error'
    );
    return false;
  }
  return true;
};
```

### Превышение лимита заблокированных игроков

```javascript
const validateBlockLimit = (blockedPlayers) => {
  if (blockedPlayers.length >= 50) {
    addNotification(
      'Достигнут максимум заблокированных игроков (50)', 
      'error'
    );
    return false;
  }
  return true;
};
```

### Ошибка localStorage

```javascript
const handleStorageError = (error, operation) => {
  console.error(`localStorage ${operation} error:`, error);
  addNotification(
    'Ошибка сохранения данных. Проверьте настройки браузера.', 
    'error'
  );
};
```

### Неверная команда

```javascript
const handleInvalidCommand = (command) => {
  addNotification(
    `Неизвестная команда: ${command}. Используйте /help для списка команд.`,
    'error'
  );
};
```

## Стратегия тестирования

### Двойной подход к тестированию

Система чата будет тестироваться с использованием двух дополняющих подходов:

1. **Unit-тесты**: Проверка конкретных примеров, граничных случаев и условий ошибок
2. **Property-based тесты**: Проверка универсальных свойств на множестве сгенерированных входных данных

Оба подхода необходимы для комплексного покрытия: unit-тесты ловят конкретные баги, property-тесты проверяют общую корректность.

### Библиотека для property-based тестирования

Для React/JavaScript проекта будет использоваться **fast-check** - зрелая библиотека для property-based тестирования в JavaScript/TypeScript.

Установка:
```bash
npm install --save-dev fast-check
```

### Конфигурация property-тестов

Каждый property-тест должен:
- Выполняться минимум **100 итераций** (из-за рандомизации)
- Иметь комментарий-тег: **Feature: global-chat-system, Property N: [текст свойства]**
- Ссылаться на соответствующее свойство из документа дизайна

Пример:
```javascript
// Feature: global-chat-system, Property 5: Ограничение истории сообщений
test('channel message limit property', () => {
  fc.assert(
    fc.property(
      fc.array(fc.anything(), { minLength: 101, maxLength: 200 }),
      (messages) => {
        const channel = { messages: [], maxMessages: 100 };
        messages.forEach(msg => addMessageToChannel(channel, msg));
        expect(channel.messages.length).toBe(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Баланс unit и property тестов

**Unit-тесты фокусируются на:**
- Конкретных примерах корректного поведения
- Граничных случаях (пустые строки, максимальная длина, нулевые значения)
- Условиях ошибок (превышение лимитов, невалидные входные данные)
- Интеграции между компонентами

**Property-тесты фокусируются на:**
- Универсальных свойствах, которые должны выполняться для всех входных данных
- Комплексном покрытии входных данных через рандомизацию
- Инвариантах системы (ограничения, сохранение данных)

Избегайте написания слишком большого количества unit-тестов - property-based тесты покрывают множество входных данных автоматически.

### Примеры тестовых сценариев

**Unit-тесты:**
- Отправка конкретного сообщения "Hello" добавляет его в канал
- Пустая строка "" отклоняется
- Сообщение длиной ровно 500 символов принимается
- Сообщение длиной 501 символ отклоняется
- Команда "/help" показывает список команд
- Блокировка игрока "Player1" скрывает его сообщения

**Property-тесты:**
- Для любого валидного сообщения, отправка добавляет его в канал (Property 6)
- Для любой строки из пробелов, отправка отклоняется (Property 8)
- Для любого канала со 100 сообщениями, добавление удаляет старейшее (Property 5)
- Для любого состояния чата, сохранение и загрузка возвращают эквивалент (Property 2)
- Для любого списка заблокированных, размер ≤ 50 (Property 16)

### Генераторы для property-тестов

```javascript
// Генератор сообщений
const messageGenerator = fc.record({
  id: fc.string(),
  channelId: fc.constantFrom('general', 'trade', 'help'),
  author: fc.record({
    id: fc.string(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    level: fc.integer({ min: 1, max: 50 }),
    avatarId: fc.integer({ min: 1, max: 15 }),
    isNPC: fc.boolean()
  }),
  content: fc.string({ maxLength: 500 }),
  timestamp: fc.integer({ min: 0 }),
  type: fc.constantFrom('text', 'sticker', 'system')
});

// Генератор настроек
const settingsGenerator = fc.record({
  fontSize: fc.constantFrom('small', 'medium', 'large'),
  showTimestamps: fc.boolean(),
  showAvatars: fc.boolean(),
  soundEnabled: fc.boolean(),
  profanityFilter: fc.boolean(),
  opacity: fc.integer({ min: 0, max: 100 })
});

// Генератор состояния чата
const chatStateGenerator = fc.record({
  isOpen: fc.boolean(),
  activeChannelId: fc.constantFrom('general', 'trade', 'help'),
  blockedPlayers: fc.array(fc.string(), { maxLength: 50 }),
  settings: settingsGenerator
});
```

