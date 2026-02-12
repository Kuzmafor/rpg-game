import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { 
  CHAT_CHANNELS, 
  DEFAULT_CHAT_SETTINGS,
  NPC_MESSAGE_MIN_INTERVAL,
  NPC_MESSAGE_MAX_INTERVAL
} from '../../constants/chatConstants.js';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  generateNPCMessage,
  getRandomInt,
  playNotificationSound,
  showBrowserNotification
} from '../../utils/chatUtils.js';
import ChannelTabs from './ChannelTabs.jsx';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import EmojiPicker from './EmojiPicker.jsx';
import StickerPicker from './StickerPicker.jsx';
import ChatSettings from './ChatSettings.jsx';

/**
 * Инициализировать каналы с пустыми массивами сообщений
 * @returns {Object} объект каналов
 */
const initializeChannels = () => {
  const channels = {};
  CHAT_CHANNELS.forEach(channel => {
    channels[channel.id] = {
      ...channel,
      messages: [],
      unreadCount: 0
    };
  });
  return channels;
};

/**
 * ChatPanel - Главный контейнер чата
 * Управляет всем состоянием чата и координирует дочерние компоненты
 * 
 * @param {Object} player - объект игрока
 * @param {boolean} isOpen - открыт ли чат
 * @param {Function} onToggle - функция переключения состояния чата
 */
const ChatPanel = ({ player, isOpen, onToggle }) => {
  // ============================================================================
  // Состояние
  // ============================================================================
  
  // Активный канал
  const [activeChannel, setActiveChannel] = useState(() => 
    loadFromLocalStorage('chat_active_channel', 'general')
  );
  
  // Каналы с сообщениями
  const [channels, setChannels] = useState(() => initializeChannels());
  
  // Заблокированные игроки
  const [blockedPlayers, setBlockedPlayers] = useState(() => 
    loadFromLocalStorage('chat_blocked_players', [])
  );
  
  // Настройки чата
  const [settings, setSettings] = useState(() => 
    loadFromLocalStorage('chat_settings', DEFAULT_CHAT_SETTINGS)
  );
  
  // UI состояние
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Кулдаун и спам
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [spamState, setSpamState] = useState({
    lastMessages: [],
    blockedUntil: 0
  });
  
  // ============================================================================
  // Эффекты для загрузки данных из localStorage
  // ============================================================================
  
  // Загрузка сообщений из localStorage при монтировании
  useEffect(() => {
    const savedMessages = loadFromLocalStorage('chat_messages', {});
    setChannels(prev => {
      const updated = { ...prev };
      Object.keys(savedMessages).forEach(channelId => {
        if (updated[channelId]) {
          updated[channelId].messages = savedMessages[channelId] || [];
        }
      });
      return updated;
    });
  }, []);
  
  // ============================================================================
  // Эффекты для сохранения данных в localStorage
  // ============================================================================
  
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
  
  // Сохранение заблокированных игроков
  useEffect(() => {
    saveToLocalStorage('chat_blocked_players', blockedPlayers);
  }, [blockedPlayers]);
  
  // Сохранение настроек
  useEffect(() => {
    saveToLocalStorage('chat_settings', settings);
  }, [settings]);
  
  // ============================================================================
  // Генерация NPC-сообщений
  // ============================================================================
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.5) { // 50% шанс генерации
        const channelIds = ['general', 'trade', 'help'];
        const randomChannel = channelIds[Math.floor(Math.random() * channelIds.length)];
        const npcMessage = generateNPCMessage(randomChannel);
        addMessage(randomChannel, npcMessage);
      }
    }, getRandomInt(NPC_MESSAGE_MIN_INTERVAL, NPC_MESSAGE_MAX_INTERVAL));

    return () => clearInterval(interval);
  }, [activeChannel, isOpen, player.name]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // ============================================================================
  // Кулдаун отправки сообщений
  // ============================================================================
  
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);
  
  // ============================================================================
  // Функция добавления сообщения
  // ============================================================================
  
  /**
   * Добавить сообщение в канал
   * @param {string} channelId - ID канала
   * @param {Object} message - объект сообщения
   */
  const addMessage = useCallback((channelId, message) => {
    setChannels(prev => {
      const channel = prev[channelId];
      if (!channel) return prev;
      
      const updatedMessages = [...channel.messages, message];
      
      // Ограничение до maxMessages (обычно 100)
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
      if (settings.soundEnabled) {
        playNotificationSound();
      }
      showBrowserNotification(message);
    }
  }, [activeChannel, isOpen, player.name, settings.soundEnabled]);
  
  // ============================================================================
  // Обработчики
  // ============================================================================
  
  const handleChannelChange = (channelId) => {
    setActiveChannel(channelId);
    // Сбросить непрочитанные для этого канала
    setChannels(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        unreadCount: 0
      }
    }));
  };
  
  const handleSendMessage = (content, replyTo = null) => {
    // Эта функция будет полностью реализована в задаче 7
    // Пока просто добавляем сообщение
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      channelId: activeChannel,
      author: {
        id: player.id || 'player_1',
        name: player.name || 'Player',
        level: player.level || 1,
        avatarId: player.avatarId || 1,
        isNPC: false
      },
      content,
      timestamp: Date.now(),
      type: 'text',
      replyTo,
      mentions: []
    };
    
    addMessage(activeChannel, message);
    setCooldownRemaining(3); // 3 секунды кулдаун
  };
  
  const handleReply = (message) => {
    // Будет реализовано в задаче 13
    console.log('Reply to:', message);
  };
  
  const handleBlock = (playerId) => {
    // Будет реализовано в задаче 12
    console.log('Block player:', playerId);
  };
  
  const handleReport = (messageId) => {
    // Будет реализовано в задаче 13
    console.log('Report message:', messageId);
  };
  
  const handleEmojiSelect = (emoji) => {
    // Будет реализовано в задаче 10
    console.log('Selected emoji:', emoji);
    setShowEmojiPicker(false);
  };
  
  const handleStickerSelect = (sticker) => {
    // Будет реализовано в задаче 10
    console.log('Selected sticker:', sticker);
    setShowStickerPicker(false);
  };
  
  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
  };
  
  const handleUnblock = (playerId) => {
    setBlockedPlayers(prev => prev.filter(id => id !== playerId));
  };
  
  // ============================================================================
  // Рендер
  // ============================================================================
  
  return (
    <div className={`fixed right-4 bottom-20 transition-all duration-300 z-50 ${
      isOpen ? 'w-80 h-[500px]' : 'w-0 h-0'
    }`}>
      {isOpen && (
        <div 
          className="h-full bg-slate-800 border border-slate-700 rounded-lg flex flex-col shadow-2xl"
          style={{ opacity: settings.opacity / 100 }}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Чат</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Настройки"
              >
                <Settings size={20} className="text-slate-400" />
              </button>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Закрыть"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Вкладки каналов */}
          <ChannelTabs
            channels={channels}
            activeChannel={activeChannel}
            onChannelChange={handleChannelChange}
          />

          {/* Список сообщений */}
          <MessageList
            messages={channels[activeChannel]?.messages || []}
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

export default ChatPanel;
