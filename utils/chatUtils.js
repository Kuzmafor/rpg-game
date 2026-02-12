import { useState, useEffect } from 'react';
import { 
  PROFANITY_LIST, 
  RESOURCES, 
  ITEMS, 
  QUESTS, 
  NPC_NAMES,
  MESSAGE_TEMPLATES 
} from '../constants/chatConstants.js';

// ============================================================================
// localStorage утилиты
// ============================================================================

/**
 * Загрузить данные из localStorage
 * @param {string} key - ключ для загрузки
 * @param {*} defaultValue - значение по умолчанию, если ключ не найден
 * @returns {*} загруженное значение или defaultValue
 */
export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Сохранить данные в localStorage
 * @param {string} key - ключ для сохранения
 * @param {*} value - значение для сохранения
 */
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

/**
 * Очистить историю чата
 * @param {string|null} channelId - ID канала для очистки (null = все каналы)
 */
export const clearChatHistory = (channelId = null) => {
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

// ============================================================================
// Утилиты форматирования
// ============================================================================

/**
 * Форматировать временную метку в формат HH:MM
 * @param {number} timestamp - временная метка в миллисекундах
 * @returns {string} отформатированное время
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Форматировать временную метку в относительный формат (например, "5м назад")
 * @param {number} timestamp - временная метка в миллисекундах
 * @returns {string} относительное время
 */
export const formatTimeAgo = (timestamp) => {
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

// ============================================================================
// Хук debounce
// ============================================================================

/**
 * Хук для debounce значения
 * @param {*} value - значение для debounce
 * @param {number} delay - задержка в миллисекундах
 * @returns {*} debounced значение
 */
export const useDebounce = (value, delay) => {
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

// ============================================================================
// Фильтрация и модерация
// ============================================================================

/**
 * Фильтровать нецензурную лексику в тексте
 * @param {string} text - текст для фильтрации
 * @param {boolean} enabled - включен ли фильтр
 * @returns {string} отфильтрованный текст
 */
export const filterProfanity = (text, enabled) => {
  if (!enabled) return text;
  
  let filtered = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  
  return filtered;
};

/**
 * Детектировать спам в сообщениях
 * @param {string} message - текущее сообщение
 * @param {Object} spamState - состояние спам-детекции
 * @returns {Object} результат проверки на спам
 */
export const detectSpam = (message, spamState) => {
  const now = Date.now();
  
  // Проверка блокировки за спам
  if (spamState.blockedUntil > now) {
    return {
      isSpam: true,
      blocked: true,
      remainingTime: Math.ceil((spamState.blockedUntil - now) / 1000),
      lastMessages: spamState.lastMessages
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
    blockedUntil: 0,
    lastMessages: recentMessages
  };
};

// ============================================================================
// Обработка упоминаний
// ============================================================================

/**
 * Детектировать упоминания в тексте
 * @param {string} text - текст сообщения
 * @param {string} playerName - имя текущего игрока
 * @returns {Object} информация об упоминаниях
 */
export const detectMentions = (text, playerName) => {
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

/**
 * Выделить упоминания в тексте
 * @param {string} text - текст для обработки
 * @returns {string} текст с выделенными упоминаниями
 */
export const highlightMentions = (text) => {
  return text.replace(/@(\w+)/g, '<span class="text-blue-400 font-bold">@$1</span>');
};

// ============================================================================
// Уведомления
// ============================================================================

/**
 * Воспроизвести звук уведомления
 */
export const playNotificationSound = () => {
  try {
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
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Показать браузерное уведомление
 * @param {Object} message - объект сообщения
 */
export const showBrowserNotification = (message) => {
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

/**
 * Обновить заголовок страницы с количеством непрочитанных
 * @param {number} unreadCount - количество непрочитанных сообщений
 */
export const updatePageTitle = (unreadCount) => {
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) RPG Game - Chat`;
  } else {
    document.title = 'RPG Game';
  }
};

// ============================================================================
// Генерация NPC-сообщений
// ============================================================================

/**
 * Получить случайное целое число в диапазоне
 * @param {number} min - минимальное значение (включительно)
 * @param {number} max - максимальное значение (включительно)
 * @returns {number} случайное число
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Получить случайный элемент из массива
 * @param {Array} array - массив
 * @returns {*} случайный элемент
 */
export const getRandomElement = (array) => {
  return array[getRandomInt(0, array.length - 1)];
};

/**
 * Получить случайный ресурс
 * @returns {string} название ресурса
 */
export const getRandomResource = () => {
  return getRandomElement(RESOURCES);
};

/**
 * Получить случайный предмет
 * @returns {string} название предмета
 */
export const getRandomItem = () => {
  return getRandomElement(ITEMS);
};

/**
 * Получить случайный квест
 * @returns {string} название квеста
 */
export const getRandomQuest = () => {
  return getRandomElement(QUESTS);
};

/**
 * Сгенерировать NPC-сообщение для канала
 * @param {string} channelId - ID канала
 * @returns {Object} объект сообщения
 */
export const generateNPCMessage = (channelId) => {
  const name = getRandomElement(NPC_NAMES);
  const level = getRandomInt(1, 50);
  const avatarId = getRandomInt(1, 15);
  
  const templates = MESSAGE_TEMPLATES[channelId] || MESSAGE_TEMPLATES.general;
  let content = getRandomElement(templates);
  
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

// ============================================================================
// Валидация
// ============================================================================

/**
 * Валидировать длину сообщения
 * @param {string} message - текст сообщения
 * @param {number} maxLength - максимальная длина
 * @returns {boolean} валидно ли сообщение
 */
export const validateMessageLength = (message, maxLength = 500) => {
  return message.length <= maxLength;
};

/**
 * Проверить, является ли сообщение пустым
 * @param {string} message - текст сообщения
 * @returns {boolean} пустое ли сообщение
 */
export const isEmptyMessage = (message) => {
  return !message || message.trim().length === 0;
};

/**
 * Проверить кулдаун между сообщениями
 * @param {number} lastMessageTime - время последнего сообщения
 * @param {number} cooldownDuration - длительность кулдауна в мс
 * @returns {Object} информация о кулдауне
 */
export const checkCooldown = (lastMessageTime, cooldownDuration = 3000) => {
  const now = Date.now();
  const timeSinceLastMessage = now - lastMessageTime;
  
  if (timeSinceLastMessage < cooldownDuration) {
    const remaining = Math.ceil((cooldownDuration - timeSinceLastMessage) / 1000);
    return {
      isOnCooldown: true,
      remainingSeconds: remaining
    };
  }
  
  return {
    isOnCooldown: false,
    remainingSeconds: 0
  };
};

/**
 * Валидировать лимит заблокированных игроков
 * @param {Array} blockedPlayers - список заблокированных игроков
 * @param {number} maxBlocked - максимальное количество
 * @returns {boolean} можно ли добавить еще
 */
export const validateBlockLimit = (blockedPlayers, maxBlocked = 50) => {
  return blockedPlayers.length < maxBlocked;
};
