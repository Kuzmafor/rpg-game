import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image, X } from 'lucide-react';
import { useDebounce } from '../../utils/chatUtils.js';
import { CHAT_COMMANDS, MAX_MESSAGE_LENGTH } from '../../constants/chatConstants.js';

/**
 * MessageInput - Поле ввода с поддержкой команд, эмодзи и кулдауна
 * 
 * @param {Function} onSendMessage - обработчик отправки сообщения (message, replyTo)
 * @param {number} cooldownRemaining - оставшееся время кулдауна в секундах
 * @param {boolean} spamBlocked - заблокирован ли пользователь за спам
 * @param {Function} onOpenEmoji - обработчик открытия панели эмодзи
 * @param {Function} onOpenSticker - обработчик открытия панели стикеров
 * @param {Function} onCommand - обработчик команд чата (опционально)
 * @param {Object} replyTo - сообщение, на которое отвечаем (опционально)
 * @param {Function} onCancelReply - обработчик отмены ответа (опционально)
 */
const MessageInput = ({ 
  onSendMessage, 
  cooldownRemaining = 0, 
  spamBlocked = false,
  onOpenEmoji,
  onOpenSticker,
  onCommand,
  replyTo = null,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Debounce для ввода текста (300ms)
  const debouncedMessage = useDebounce(message, 300);

  // Автодополнение команд
  useEffect(() => {
    if (message.startsWith('/') && message.length > 1) {
      setShowCommandSuggestions(true);
    } else {
      setShowCommandSuggestions(false);
    }
  }, [message]);

  // Фильтрация команд для автодополнения
  const filteredCommands = CHAT_COMMANDS.filter(cmd => 
    cmd.command.startsWith(message.split(' ')[0])
  );

  /**
   * Обработчик отправки сообщения
   */
  const handleSend = () => {
    // Валидация: пустое сообщение
    if (!message.trim()) {
      return;
    }

    // Валидация: кулдаун
    if (cooldownRemaining > 0) {
      return;
    }

    // Валидация: блокировка за спам
    if (spamBlocked) {
      return;
    }

    // Валидация: длина сообщения
    if (message.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    // Проверка на команду
    if (message.startsWith('/')) {
      if (onCommand) {
        onCommand(message);
      }
    } else {
      // Отправка обычного сообщения
      onSendMessage(message, replyTo);
    }

    // Очистка поля ввода
    setMessage('');
    setShowCommandSuggestions(false);
  };

  /**
   * Обработчик нажатия клавиши Enter
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Обработчик выбора команды из автодополнения
   */
  const handleCommandSelect = (command) => {
    setMessage(command.usage);
    setShowCommandSuggestions(false);
    inputRef.current?.focus();
  };

  /**
   * Обработчик изменения текста
   */
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Ограничение длины на уровне ввода
    if (newValue.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newValue);
    }
  };

  /**
   * Определение placeholder в зависимости от состояния
   */
  const getPlaceholder = () => {
    if (spamBlocked) {
      return 'Заблокировано за спам...';
    }
    if (cooldownRemaining > 0) {
      return `Подождите ${cooldownRemaining}с...`;
    }
    return 'Введите сообщение...';
  };

  /**
   * Определение цвета счетчика символов
   */
  const getCharCountColor = () => {
    const ratio = message.length / MAX_MESSAGE_LENGTH;
    if (ratio >= 1) return 'text-red-500';
    if (ratio >= 0.9) return 'text-yellow-500';
    return 'text-slate-500';
  };

  return (
    <div className="border-t border-slate-700 p-4">
      {/* Ответ на сообщение */}
      {replyTo && (
        <div className="bg-slate-700 rounded-lg p-2 mb-2 flex items-center justify-between">
          <div className="text-sm flex-1 min-w-0">
            <span className="text-slate-400">Ответ на:</span>{' '}
            <span className="text-white font-semibold">{replyTo.authorName}</span>
            <p className="text-slate-300 truncate text-xs mt-1">
              {replyTo.content}
            </p>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="text-slate-400 hover:text-white ml-2 flex-shrink-0"
              title="Отменить ответ"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Автодополнение команд */}
      {showCommandSuggestions && filteredCommands.length > 0 && (
        <div className="bg-slate-700 rounded-lg mb-2 max-h-40 overflow-y-auto">
          {filteredCommands.map(cmd => (
            <button
              key={cmd.command}
              onClick={() => handleCommandSelect(cmd)}
              className="w-full text-left p-2 hover:bg-slate-600 transition-colors"
            >
              <div className="font-mono text-sm text-blue-400">{cmd.command}</div>
              <div className="text-xs text-slate-400">{cmd.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-1">
        <button
          onClick={onOpenEmoji}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title="Эмодзи"
          disabled={cooldownRemaining > 0 || spamBlocked}
        >
          <Smile size={18} className="text-slate-400" />
        </button>

        <button
          onClick={onOpenSticker}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title="Стикеры"
          disabled={cooldownRemaining > 0 || spamBlocked}
        >
          <Image size={18} className="text-slate-400" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          disabled={cooldownRemaining > 0 || spamBlocked}
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-sm text-white 
            placeholder-slate-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || cooldownRemaining > 0 || spamBlocked || message.length > MAX_MESSAGE_LENGTH}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-1 flex-shrink-0"
          title={cooldownRemaining > 0 ? `Кулдаун: ${cooldownRemaining}с` : 'Отправить'}
        >
          {cooldownRemaining > 0 ? (
            <span className="text-xs font-medium">{cooldownRemaining}s</span>
          ) : (
            <Send size={18} className="text-white" />
          )}
        </button>
      </div>

      {/* Счетчик символов */}
      <div className={`text-xs mt-1 text-right ${getCharCountColor()}`}>
        {message.length}/{MAX_MESSAGE_LENGTH}
      </div>
    </div>
  );
};

export default MessageInput;
