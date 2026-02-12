import React from 'react';

/**
 * ChannelTabs - Вкладки для переключения между каналами
 * Отображает вкладки для всех каналов с цветовым кодированием,
 * счетчиком непрочитанных сообщений и переключением активного канала
 * 
 * Requirements: 2.2, 2.3, 2.5, 2.6
 * 
 * @param {Object} channels - объект каналов с данными
 * @param {string} activeChannel - ID активного канала
 * @param {Function} onChannelChange - обработчик смены канала
 */
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
            {/* Иконка канала */}
            <Icon size={18} />
            
            {/* Название канала */}
            <span className="text-sm font-medium">{channel.name}</span>
            
            {/* Счетчик непрочитанных на неактивных вкладках */}
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

export default ChannelTabs;
