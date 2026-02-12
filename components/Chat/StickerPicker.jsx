import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { STICKERS } from '../../constants/chatConstants';

/**
 * StickerPicker - Панель выбора стикеров
 * 
 * @param {Function} onSelect - обработчик выбора стикера
 * @param {Function} onClose - обработчик закрытия панели
 */
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

export default StickerPicker;
