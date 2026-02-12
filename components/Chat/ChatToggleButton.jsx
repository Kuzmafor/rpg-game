import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

/**
 * ChatToggleButton - Кнопка открытия/закрытия чата
 * Отображает индикатор непрочитанных сообщений
 * 
 * @param {boolean} isOpen - открыт ли чат
 * @param {number} unreadCount - количество непрочитанных сообщений
 * @param {boolean} hasNewMentions - есть ли новые упоминания
 * @param {Function} onClick - обработчик клика
 */
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

export default ChatToggleButton;
