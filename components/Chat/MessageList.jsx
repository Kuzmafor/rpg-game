import React, { useRef, useEffect, useState, useMemo } from 'react';
import MessageItem from './MessageItem';

/**
 * MessageList - Виртуализированный список сообщений
 * 
 * @param {Array} messages - массив сообщений
 * @param {Array} blockedPlayers - список заблокированных игроков
 * @param {Object} settings - настройки чата
 * @param {Object} player - объект игрока
 * @param {Function} onReply - обработчик ответа на сообщение
 * @param {Function} onBlock - обработчик блокировки игрока
 * @param {Function} onReport - обработчик жалобы на сообщение
 */
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
      {visibleMessages.length === 0 ? (
        <div className="text-slate-400 text-center py-8">
          Нет сообщений в этом канале
        </div>
      ) : (
        visibleMessages.map(message => (
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
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
