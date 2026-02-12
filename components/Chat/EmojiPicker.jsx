import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EMOJI_CATEGORIES } from '../../constants/chatConstants';

/**
 * EmojiPicker - Панель выбора эмодзи с категориями
 * 
 * @param {Function} onSelect - обработчик выбора эмодзи
 * @param {Function} onClose - обработчик закрытия панели
 */
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

export default EmojiPicker;
