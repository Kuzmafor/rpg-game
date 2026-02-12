import React from 'react';
import { 
  User, 
  MessageSquare, 
  Copy, 
  Ban, 
  Flag,
  Sword,
  Shield,
  Zap,
  Skull,
  Ghost,
  Crown,
  Gamepad2,
  VenetianMask,
  Bot,
  Smile,
  Flame,
  Target,
  PartyPopper
} from 'lucide-react';
import { formatTime } from '../../utils/chatUtils';
import { STICKERS } from '../../constants/chatConstants';

// База аватаров (импортируется из App.jsx, но для автономности компонента дублируем)
const AVATARS_DB = [
  { id: 1, name: 'Путник', icon: User, rarity: 'common', color: 'bg-blue-500' },
  { id: 2, name: 'Воин', icon: Sword, rarity: 'common', color: 'bg-red-500' },
  { id: 3, name: 'Страж', icon: Shield, rarity: 'common', color: 'bg-green-500' },
  { id: 4, name: 'Маг', icon: Zap, rarity: 'rare', color: 'bg-purple-500' },
  { id: 5, name: 'Разбойник', icon: Skull, rarity: 'rare', color: 'bg-yellow-500' },
  { id: 6, name: 'Призрак', icon: Ghost, rarity: 'epic', color: 'bg-indigo-500' },
  { id: 7, name: 'Король', icon: Crown, rarity: 'legendary', color: 'bg-yellow-400' },
  { id: 8, name: 'Геймер', icon: Gamepad2, rarity: 'uncommon', color: 'bg-pink-500' },
  { id: 9, name: 'Аноним', icon: VenetianMask, rarity: 'epic', color: 'bg-slate-700' },
  { id: 10, name: 'Робот', icon: Bot, rarity: 'rare', color: 'bg-cyan-500' },
  { id: 11, name: 'Улыбака', icon: Smile, rarity: 'common', color: 'bg-orange-400' },
  { id: 12, name: 'Демон', icon: Flame, rarity: 'legendary', color: 'bg-red-700' },
  { id: 13, name: 'Тень', icon: User, rarity: 'epic', color: 'bg-black border border-white/20' },
  { id: 14, name: 'Охотник', icon: Target, rarity: 'uncommon', color: 'bg-emerald-600' },
  { id: 15, name: 'Тусовщик', icon: PartyPopper, rarity: 'rare', color: 'bg-fuchsia-500' },
];

/**
 * MessageItem - Отдельное сообщение с контекстным меню
 * 
 * @param {Object} message - объект сообщения
 * @param {Object} settings - настройки чата
 * @param {boolean} isOwnMessage - является ли сообщение от текущего игрока
 * @param {boolean} isMentioned - упоминается ли игрок в сообщении
 * @param {boolean} isHovered - наведен ли курсор на сообщение
 * @param {Function} onMouseEnter - обработчик наведения
 * @param {Function} onMouseLeave - обработчик ухода курсора
 * @param {Function} onReply - обработчик ответа
 * @param {Function} onBlock - обработчик блокировки
 * @param {Function} onReport - обработчик жалобы
 */
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
  // Получить иконку и цвет аватара
  const AvatarIcon = AVATARS_DB.find(a => a.id === message.author.avatarId)?.icon || User;
  const avatarColor = AVATARS_DB.find(a => a.id === message.author.avatarId)?.color || 'bg-gray-500';

  // Определить размер шрифта на основе настроек
  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[settings.fontSize];

  // Обработчик копирования текста
  const handleCopy = () => {
    if (message.type === 'text') {
      navigator.clipboard.writeText(message.content);
    }
  };

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
            onClick={handleCopy}
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

MessageItem.displayName = 'MessageItem';

export default MessageItem;
