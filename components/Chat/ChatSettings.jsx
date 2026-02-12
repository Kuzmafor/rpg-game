import React from 'react';
import { X } from 'lucide-react';

/**
 * ChatSettings - Настройки чата и управление заблокированными игроками
 * 
 * @param {Object} settings - текущие настройки
 * @param {Function} onUpdate - обработчик обновления настроек
 * @param {Function} onClose - обработчик закрытия
 * @param {Array} blockedPlayers - список заблокированных игроков
 * @param {Function} onUnblock - обработчик разблокировки игрока
 */
const ChatSettings = ({ 
  settings, 
  onUpdate, 
  onClose, 
  blockedPlayers,
  onUnblock 
}) => {
  // TODO: Будет реализовано в задаче 15
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Настройки чата</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="text-slate-400 text-center">
          Настройки (задача 15)
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
