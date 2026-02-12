import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Footprints, 
  Sword, 
  Shield, 
  Backpack, 
  User, 
  Home, 
  Menu, 
  X, 
  Heart, 
  Zap, 
  Coins, 
  Skull, 
  Trophy,
  MapPin,
  ChevronRight,
  Sparkles,
  Scroll,
  Dna,
  Briefcase,
  Hammer,
  CheckCircle,
  Users,
  Folder,
  Swords,
  LayoutDashboard,
  Map as MapIcon,
  Flame,        
  FlaskConical, 
  Wind,         
  PartyPopper,  
  Gift,
  Crown,
  Target,
  Ghost,
  Gamepad2,
  VenetianMask,
  Bot,
  Smile,
  Box,
  Lock,
  Unlock,
  Palette,
  Image as ImageIcon,
  Map as MapIcon2,
  Calendar,
  Settings,
  Download,
  Upload,
  Package,
  Save,
  RotateCcw,
  Info,
  MessageSquare,
  ShoppingBag,
  Send,
  Copy,
  Ban,
  Flag
} from 'lucide-react';

// --- ИМПОРТЫ ЧАТА ---
import { ChatPanel, ChatToggleButton } from './components/Chat';

// --- ИМПОРТЫ ФРАКЦИЙ ---
import { FactionScreen } from './components/Factions';
import { migrateFactionData, initializeFactionReputation } from './utils/factionUtils';
import { FACTION_QUESTS } from './constants/factionConstants';

// --- ИМПОРТЫ СВАДЕБ ---
import { MarriageScreen } from './components/Marriage';
// import { initializeMarriageData } from './utils/marriageUtils';
// import { WEDDING_RINGS, WEDDING_VENUES, WEDDING_GIFTS } from './constants/marriageConstants';

// --- ИМПОРТЫ РЕКРУТИНГА ---
import { ReferralPanel } from './components/Referral';

// --- КОНСТАНТЫ И ДАННЫЕ ---

const LOCATIONS = [
  { id: 1, name: 'Зеленый Лес', minLvl: 1, enemyPower: 1, text: 'Тихий лес, полный мелкой живности.', resources: ['wood', 'red_herb', 'water'] },
  { id: 2, name: 'Песчаные Дюны', minLvl: 5, enemyPower: 1.5, text: 'Жаркая пустыня. Осторожно, змеи!', resources: ['iron_ore', 'blue_herb', 'water'] },
  { id: 3, name: 'Мрачные Пещеры', minLvl: 10, enemyPower: 2.5, text: 'Темно и сыро. Здесь живут гоблины.', resources: ['iron_ore', 'gold_ore', 'crystal', 'water'] },
  { id: 4, name: 'Вулканический Пик', minLvl: 20, enemyPower: 4, text: 'Земля дрожит под ногами.', resources: ['gold_ore', 'crystal', 'blue_herb'] },
  { id: 5, name: 'Заброшенный Храм', minLvl: 15, enemyPower: 3.5, text: 'Древние руины, полные тайн и опасностей.', resources: ['crystal', 'gold_ore', 'ancient_stone'] },
  { id: 6, name: 'Ледяные Пики', minLvl: 25, enemyPower: 5, text: 'Суровые горы, где правит вечная зима.', resources: ['ice_crystal', 'mithril_ore', 'frozen_herb'] },
  { id: 7, name: 'Темный Лес', minLvl: 18, enemyPower: 4, text: 'Мрачный лес, где солнечный свет не проникает сквозь кроны.', resources: ['dark_wood', 'shadow_herb', 'spider_silk'] },
  { id: 8, name: 'Драконье Логово', minLvl: 35, enemyPower: 7, text: 'Логово древних драконов. Только для самых смелых.', resources: ['dragon_scale', 'dragon_bone', 'fire_crystal'] },
  { id: 9, name: 'Подводный Мир', minLvl: 30, enemyPower: 6, text: 'Глубины океана, полные тайн и опасностей.', resources: ['pearl', 'coral', 'sea_crystal', 'water'] },
  { id: 10, name: 'Небесные Острова', minLvl: 40, enemyPower: 8, text: 'Парящие острова в облаках. Царство ветра и молний.', resources: ['sky_crystal', 'cloud_essence', 'wind_stone'] },
  { id: 11, name: 'Ад', minLvl: 50, enemyPower: 10, text: 'Огненная бездна. Только для самых сильных героев.', resources: ['hell_fire', 'demon_horn', 'soul_stone', 'fire_crystal'] }
];

// Пулы врагов для каждой локации (индексы в ENEMIES_DB)
const LOCATION_ENEMY_POOLS = {
  1: ['Злая Крыса', 'Лесной Волк', 'Гоблин'], // Зеленый Лес
  2: ['Гоблин', 'Бандит', 'Лесной Волк'], // Песчаные Дюны
  3: ['Гоблин', 'Скелет-Воин', 'Бандит', 'Темный Маг'], // Мрачные Пещеры
  4: ['Орк-Воин', 'Огненный Элементаль', 'Тролль', 'Дракон'], // Вулканический Пик
  5: ['Скелет-Воин', 'Темный Маг', 'Вампир'], // Заброшенный Храм
  6: ['Ледяной Голем', 'Тролль', 'Орк-Воин'], // Ледяные Пики
  7: ['Лесной Волк', 'Вампир', 'Темный Маг', 'Тролль'], // Темный Лес
  8: ['Дракон', 'Древний Дракон', 'Огненный Элементаль', 'Ледяной Голем'], // Драконье Логово
  9: ['Морской Змей', 'Кракен', 'Водный Элементаль', 'Акула-Мутант'], // Подводный Мир
  10: ['Грифон', 'Воздушный Элементаль', 'Небесный Страж', 'Громовая Птица'], // Небесные Острова
  11: ['Демон', 'Адский Пес', 'Огненный Демон', 'Повелитель Ада'] // Ад
};

const PLAYER_CLASSES = [
  { 
    id: 'warrior', 
    name: 'Воин', 
    desc: 'Мастер ближнего боя. Сбалансированная сила и защита.', 
    baseStats: { str: 6, def: 3, hp: 60, energy: 20 },
    growth: { str: 2.5, def: 1.5, hp: 12 }
  },
  { 
    id: 'rogue', 
    name: 'Бродяга', 
    desc: 'Быстрый и смертоносный. Высокий урон, слабая защита.', 
    baseStats: { str: 8, def: 1, hp: 45, energy: 25 },
    growth: { str: 3.5, def: 0.5, hp: 8 }
  },
  { 
    id: 'guardian', 
    name: 'Страж', 
    desc: 'Живая крепость. Огромное здоровье и защита.', 
    baseStats: { str: 3, def: 6, hp: 80, energy: 15 },
    growth: { str: 1.5, def: 3.0, hp: 20 }
  }
];

// Расширенная база аватаров
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

// РАМКИ ДЛЯ АВАТАРОВ
const AVATAR_FRAMES = [
  // Common frames
  { 
    id: 1, 
    name: 'Базовая', 
    rarity: 'common', 
    style: 'border-4 border-slate-600',
    glow: '',
    animation: '',
    cost: 0
  },
  { 
    id: 2, 
    name: 'Синяя', 
    rarity: 'common', 
    style: 'border-4 border-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    animation: '',
    cost: 50
  },
  { 
    id: 3, 
    name: 'Зеленая', 
    rarity: 'common', 
    style: 'border-4 border-green-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    animation: '',
    cost: 50
  },
  
  // Uncommon frames
  { 
    id: 4, 
    name: 'Золотая', 
    rarity: 'uncommon', 
    style: 'border-4 border-yellow-500',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    animation: '',
    cost: 100
  },
  { 
    id: 5, 
    name: 'Пурпурная', 
    rarity: 'uncommon', 
    style: 'border-4 border-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    animation: '',
    cost: 100
  },
  
  // Rare frames
  { 
    id: 6, 
    name: 'Радужная', 
    rarity: 'rare', 
    style: 'border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-border',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    animation: 'animate-pulse',
    cost: 200
  },
  { 
    id: 7, 
    name: 'Огненная', 
    rarity: 'rare', 
    style: 'border-4 border-orange-500',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.8)]',
    animation: 'animate-pulse',
    cost: 200
  },
  { 
    id: 8, 
    name: 'Ледяная', 
    rarity: 'rare', 
    style: 'border-4 border-cyan-400',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.8)]',
    animation: 'animate-pulse',
    cost: 200
  },
  
  // Epic frames
  { 
    id: 9, 
    name: 'Драконья', 
    rarity: 'epic', 
    style: 'border-[6px] border-red-600',
    glow: 'shadow-[0_0_35px_rgba(220,38,38,0.9)]',
    animation: 'animate-pulse',
    cost: 400
  },
  { 
    id: 10, 
    name: 'Небесная', 
    rarity: 'epic', 
    style: 'border-[6px] border-sky-400',
    glow: 'shadow-[0_0_35px_rgba(56,189,248,0.9)]',
    animation: 'animate-pulse',
    cost: 400
  },
  { 
    id: 11, 
    name: 'Теневая', 
    rarity: 'epic', 
    style: 'border-[6px] border-slate-900',
    glow: 'shadow-[0_0_35px_rgba(15,23,42,0.9)]',
    animation: 'animate-pulse',
    cost: 400
  },
  
  // Legendary frames
  { 
    id: 12, 
    name: 'Божественная', 
    rarity: 'legendary', 
    style: 'border-[8px] border-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-border',
    glow: 'shadow-[0_0_40px_rgba(251,146,60,1)]',
    animation: 'animate-pulse',
    cost: 800
  },
  { 
    id: 13, 
    name: 'Космическая', 
    rarity: 'legendary', 
    style: 'border-[8px] border-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-border',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,1)]',
    animation: 'animate-pulse',
    cost: 800
  },
  { 
    id: 14, 
    name: 'Королевская', 
    rarity: 'legendary', 
    style: 'border-[8px] border-yellow-400',
    glow: 'shadow-[0_0_45px_rgba(250,204,21,1)]',
    animation: 'animate-pulse',
    cost: 1000
  },
  { 
    id: 15, 
    name: 'Бессмертная', 
    rarity: 'legendary', 
    style: 'border-[8px] border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-600 to-pink-500 bg-clip-border',
    glow: 'shadow-[0_0_50px_rgba(139,92,246,1)]',
    animation: 'animate-pulse',
    cost: 1200
  }
];

const ITEMS_DB = [
  // Existing items
  { id: 1, name: 'Деревянный меч', type: 'weapon', val: 2, cost: 10, rarity: 'common' },
  { id: 2, name: 'Ржавый кинжал', type: 'weapon', val: 3, cost: 25, rarity: 'common' },
  { id: 3, name: 'Стальной меч', type: 'weapon', val: 8, cost: 150, rarity: 'rare' },
  { id: 4, name: 'Огненный клинок', type: 'weapon', val: 20, cost: 1000, rarity: 'legendary', effect: 'Шанс поджечь врага (+10% урона)' },
  { id: 5, name: 'Тряпичная рубаха', type: 'armor', val: 1, cost: 10, rarity: 'common' },
  { id: 6, name: 'Кожаная броня', type: 'armor', val: 4, cost: 100, rarity: 'common' },
  { id: 7, name: 'Латы рыцаря', type: 'armor', val: 12, cost: 500, rarity: 'rare' },
  { id: 8, name: 'Зелье здоровья', type: 'consumable', val: 50, cost: 20, rarity: 'common' },
  
  // NEW WEAPONS
  { id: 9, name: 'Бронзовый топор', type: 'weapon', val: 5, cost: 50, rarity: 'uncommon' },
  { id: 10, name: 'Серебряный меч', type: 'weapon', val: 10, cost: 200, rarity: 'uncommon' },
  { id: 11, name: 'Железный меч', type: 'weapon', val: 12, cost: 250, rarity: 'uncommon' },
  { id: 12, name: 'Эльфийский лук', type: 'weapon', val: 15, cost: 400, rarity: 'rare' },
  { id: 13, name: 'Боевой молот', type: 'weapon', val: 16, cost: 450, rarity: 'rare' },
  { id: 14, name: 'Посох мага', type: 'weapon', val: 25, cost: 1500, rarity: 'epic', effect: '+5 к максимальной энергии' },
  { id: 15, name: 'Клинок теней', type: 'weapon', val: 35, cost: 3000, rarity: 'legendary', effect: 'Шанс крита +10%' },
  { id: 16, name: 'Драконий клык', type: 'weapon', val: 40, cost: 5000, rarity: 'legendary', effect: 'Вампиризм: восстанавливает 10% нанесенного урона' },
  
  // NEW ARMOR
  { id: 17, name: 'Кожаная куртка', type: 'armor', val: 6, cost: 80, rarity: 'common' },
  { id: 18, name: 'Кольчуга', type: 'armor', val: 10, cost: 180, rarity: 'uncommon' },
  { id: 19, name: 'Стальная броня', type: 'armor', val: 14, cost: 350, rarity: 'rare' },
  { id: 20, name: 'Мифриловая броня', type: 'armor', val: 18, cost: 800, rarity: 'rare' },
  { id: 21, name: 'Зачарованная мантия', type: 'armor', val: 20, cost: 1200, rarity: 'epic', effect: '+10 к максимальному здоровью' },
  { id: 22, name: 'Драконья чешуя', type: 'armor', val: 25, cost: 4000, rarity: 'legendary', effect: '+50 к максимальному здоровью' },
  { id: 23, name: 'Доспехи бессмертного', type: 'armor', val: 30, cost: 6000, rarity: 'legendary', effect: 'Регенерация: +1 HP каждые 5 секунд' },
  
  // NEW CONSUMABLES
  { id: 24, name: 'Малое зелье здоровья', type: 'consumable', val: 30, cost: 10, rarity: 'common' },
  { id: 25, name: 'Большое зелье здоровья', type: 'consumable', val: 100, cost: 50, rarity: 'uncommon' },
  { id: 26, name: 'Зелье энергии', type: 'consumable', val: 10, cost: 30, rarity: 'uncommon', effect: 'Восстанавливает энергию' },
  { id: 27, name: 'Эликсир силы', type: 'consumable', val: 10, cost: 100, rarity: 'rare', effect: 'Временно +10 к силе на 5 шагов' },
  { id: 28, name: 'Эликсир защиты', type: 'consumable', val: 5, cost: 100, rarity: 'rare', effect: 'Временно +5 к защите на 5 шагов' },
  { id: 29, name: 'Зелье удачи', type: 'consumable', val: 0, cost: 200, rarity: 'epic', effect: 'Удваивает находки на 10 шагов' },
  { id: 30, name: 'Эликсир бессмертия', type: 'consumable', val: 0, cost: 500, rarity: 'legendary', effect: 'Воскрешает при смерти с 50% HP (одноразовое)' },
  
  // RESOURCES (craftable materials)
  { id: 31, name: 'Мифриловая руда', type: 'resource', val: 0, cost: 150, rarity: 'rare' },
  { id: 32, name: 'Драконья кость', type: 'resource', val: 0, cost: 300, rarity: 'epic' },
  { id: 33, name: 'Кристалл души', type: 'resource', val: 0, cost: 500, rarity: 'legendary' },
  
  // ULTRA POWERFUL WEAPONS
  { id: 34, name: 'Меч Титана', type: 'weapon', val: 50, cost: 8000, rarity: 'legendary', effect: '+20% урона по боссам' },
  { id: 35, name: 'Клинок Вечности', type: 'weapon', val: 60, cost: 12000, rarity: 'legendary', effect: 'Игнорирует 30% защиты врага' },
  { id: 36, name: 'Посох Архимага', type: 'weapon', val: 55, cost: 10000, rarity: 'legendary', effect: '+15 к максимальной энергии' },
  { id: 37, name: 'Коса Жнеца', type: 'weapon', val: 70, cost: 15000, rarity: 'legendary', effect: 'Критический удар +25%' },
  { id: 38, name: 'Молот Грома', type: 'weapon', val: 65, cost: 13000, rarity: 'legendary', effect: 'Оглушает врага на 1 ход' },
  { id: 39, name: 'Лук Феникса', type: 'weapon', val: 58, cost: 11000, rarity: 'legendary', effect: 'Поджигает врага (+15% урона)' },
  { id: 40, name: 'Клинок Бездны', type: 'weapon', val: 80, cost: 20000, rarity: 'legendary', effect: 'Вампиризм 20% + Крит 15%' },
  
  // ULTRA POWERFUL ARMOR
  { id: 41, name: 'Доспехи Титана', type: 'armor', val: 35, cost: 8000, rarity: 'legendary', effect: '+100 к максимальному здоровью' },
  { id: 42, name: 'Мантия Архимага', type: 'armor', val: 32, cost: 9000, rarity: 'legendary', effect: '+20 к максимальной энергии' },
  { id: 43, name: 'Броня Дракона', type: 'armor', val: 40, cost: 12000, rarity: 'legendary', effect: '+150 HP, Регенерация +2 HP/5сек' },
  { id: 44, name: 'Латы Паладина', type: 'armor', val: 38, cost: 11000, rarity: 'legendary', effect: '+120 HP, Блок урона 10%' },
  { id: 45, name: 'Одеяние Теней', type: 'armor', val: 28, cost: 7000, rarity: 'legendary', effect: 'Уклонение 15%' },
  { id: 46, name: 'Кольчуга Берсерка', type: 'armor', val: 30, cost: 7500, rarity: 'legendary', effect: '+50 HP, +10% урона' },
  { id: 47, name: 'Доспехи Бога Войны', type: 'armor', val: 50, cost: 25000, rarity: 'legendary', effect: '+200 HP, +20% урона, Регенерация +3 HP/5сек' },
  
  // FISH-BASED CONSUMABLES
  { id: 48, name: 'Рыбный суп', type: 'consumable', val: 40, cost: 15, rarity: 'common', effect: 'Восстанавливает 40 HP' },
  { id: 49, name: 'Эликсир моря', type: 'consumable', val: 0, cost: 120, rarity: 'rare', effect: '+5 к защите на 10 шагов' },
  { id: 50, name: 'Драконий эликсир', type: 'consumable', val: 0, cost: 800, rarity: 'legendary', effect: '+15 к силе и +10 к защите на 20 шагов' },
];

// ПЕРКИ (БОНУСЫ)
const PERKS_DB = [
  // БОЕВЫЕ ПЕРКИ
  { id: 1, name: 'Критический удар', type: 'combat', icon: Target, rarity: 'rare', effect: '+10% шанс критического удара', bonus: { critChance: 10 } },
  { id: 2, name: 'Берсерк', type: 'combat', icon: Flame, rarity: 'epic', effect: '+15% урона', bonus: { damageBonus: 15 } },
  { id: 3, name: 'Железная кожа', type: 'defense', icon: Shield, rarity: 'rare', effect: '+10% защиты', bonus: { defenseBonus: 10 } },
  { id: 4, name: 'Вампиризм', type: 'combat', icon: Heart, rarity: 'epic', effect: 'Восстанавливает 5% нанесенного урона', bonus: { lifesteal: 5 } },
  { id: 5, name: 'Уклонение', type: 'defense', icon: Wind, rarity: 'rare', effect: '+8% шанс уклонения', bonus: { dodgeChance: 8 } },
  
  // РЕСУРСНЫЕ ПЕРКИ
  { id: 6, name: 'Удача', type: 'utility', icon: Sparkles, rarity: 'epic', effect: '+20% шанс найти предмет', bonus: { lootChance: 20 } },
  { id: 7, name: 'Золотая лихорадка', type: 'utility', icon: Coins, rarity: 'rare', effect: '+25% золота', bonus: { goldBonus: 25 } },
  { id: 8, name: 'Опыт', type: 'utility', icon: Trophy, rarity: 'rare', effect: '+20% опыта', bonus: { expBonus: 20 } },
  { id: 9, name: 'Энергичность', type: 'utility', icon: Zap, rarity: 'uncommon', effect: '+5 к максимальной энергии', bonus: { maxEnergy: 5 } },
  { id: 10, name: 'Живучесть', type: 'defense', icon: Heart, rarity: 'uncommon', effect: '+50 к максимальному здоровью', bonus: { maxHp: 50 } },
  
  // ЛЕГЕНДАРНЫЕ ПЕРКИ
  { id: 11, name: 'Бог Войны', type: 'combat', icon: Swords, rarity: 'legendary', effect: '+25% урона, +15% крита', bonus: { damageBonus: 25, critChance: 15 } },
  { id: 12, name: 'Неуязвимость', type: 'defense', icon: Shield, rarity: 'legendary', effect: '+20% защиты, +100 HP', bonus: { defenseBonus: 20, maxHp: 100 } },
  { id: 13, name: 'Мастер Удачи', type: 'utility', icon: Crown, rarity: 'legendary', effect: '+30% золота, +30% опыта, +25% лута', bonus: { goldBonus: 30, expBonus: 30, lootChance: 25 } },
  { id: 14, name: 'Феникс', type: 'defense', icon: Flame, rarity: 'legendary', effect: 'Воскрешение при смерти 1 раз за бой', bonus: { phoenix: true } },
  { id: 15, name: 'Титан', type: 'combat', icon: Target, rarity: 'legendary', effect: '+30% урона, +150 HP, +15% защиты', bonus: { damageBonus: 30, maxHp: 150, defenseBonus: 15 } },
];

const ENEMIES_DB = [
  { name: 'Злая Крыса', baseHp: 15, baseDmg: 2, exp: 5, gold: 3 },
  { name: 'Гоблин', baseHp: 30, baseDmg: 5, exp: 12, gold: 10 },
  { name: 'Бандит', baseHp: 60, baseDmg: 10, exp: 30, gold: 25 },
  { name: 'Орк-Воин', baseHp: 120, baseDmg: 18, exp: 80, gold: 60 },
  { name: 'Дракон', baseHp: 500, baseDmg: 40, exp: 500, gold: 1000 },
  { name: 'Лесной Волк', baseHp: 45, baseDmg: 8, exp: 18, gold: 15 },
  { name: 'Скелет-Воин', baseHp: 80, baseDmg: 12, exp: 35, gold: 30 },
  { name: 'Темный Маг', baseHp: 100, baseDmg: 20, exp: 60, gold: 50 },
  { name: 'Ледяной Голем', baseHp: 200, baseDmg: 25, exp: 100, gold: 80 },
  { name: 'Огненный Элементаль', baseHp: 180, baseDmg: 30, exp: 120, gold: 100 },
  { name: 'Тролль', baseHp: 250, baseDmg: 22, exp: 90, gold: 70 },
  { name: 'Вампир', baseHp: 150, baseDmg: 28, exp: 110, gold: 90 },
  { name: 'Древний Дракон', baseHp: 800, baseDmg: 50, exp: 800, gold: 2000 },
  { name: 'Морской Змей', baseHp: 300, baseDmg: 28, exp: 150, gold: 120 },
  { name: 'Кракен', baseHp: 600, baseDmg: 45, exp: 400, gold: 500 },
  { name: 'Водный Элементаль', baseHp: 250, baseDmg: 30, exp: 140, gold: 110 },
  { name: 'Акула-Мутант', baseHp: 350, baseDmg: 35, exp: 180, gold: 150 },
  { name: 'Грифон', baseHp: 400, baseDmg: 40, exp: 250, gold: 200 },
  { name: 'Воздушный Элементаль', baseHp: 280, baseDmg: 38, exp: 200, gold: 180 },
  { name: 'Небесный Страж', baseHp: 500, baseDmg: 48, exp: 350, gold: 300 },
  { name: 'Громовая Птица', baseHp: 450, baseDmg: 42, exp: 280, gold: 250 },
  { name: 'Демон', baseHp: 700, baseDmg: 55, exp: 600, gold: 800 },
  { name: 'Адский Пес', baseHp: 400, baseDmg: 45, exp: 300, gold: 350 },
  { name: 'Огненный Демон', baseHp: 650, baseDmg: 52, exp: 550, gold: 700 },
  { name: 'Повелитель Ада', baseHp: 1000, baseDmg: 70, exp: 1000, gold: 3000 }
];

// ПОДЗЕМЕЛЬЯ
const DUNGEONS = [
  {
    id: 1,
    name: 'Забытые катакомбы',
    minLevel: 1,
    energyCost: 10,
    waves: 3,
    enemyPool: ['Злая Крыса', 'Гоблин', 'Скелет-Воин'],
    rewards: {
      gold: { min: 50, max: 100 },
      exp: { min: 50, max: 100 },
      items: [24, 8] // Малое зелье здоровья, Зелье здоровья
    }
  },
  {
    id: 2,
    name: 'Огненные пещеры',
    minLevel: 10,
    energyCost: 15,
    waves: 5,
    enemyPool: ['Гоблин', 'Бандит', 'Огненный Элементаль', 'Орк-Воин'],
    rewards: {
      gold: { min: 150, max: 300 },
      exp: { min: 200, max: 400 },
      items: [25, 26, 9] // Большое зелье здоровья, Зелье энергии, Бронзовый топор
    }
  },
  {
    id: 3,
    name: 'Проклятый склеп',
    minLevel: 20,
    energyCost: 20,
    waves: 7,
    enemyPool: ['Скелет-Воин', 'Темный Маг', 'Вампир', 'Тролль'],
    rewards: {
      gold: { min: 300, max: 600 },
      exp: { min: 500, max: 800 },
      items: [27, 28, 10, 18] // Эликсир силы, Эликсир защиты, Серебряный меч, Кольчуга
    }
  },
  {
    id: 4,
    name: 'Логово дракона',
    minLevel: 30,
    energyCost: 30,
    waves: 1, // Boss fight
    enemyPool: ['Древний Дракон'],
    rewards: {
      gold: { min: 1000, max: 2000 },
      exp: { min: 1000, max: 1500 },
      items: [15, 16, 22, 23] // Клинок теней, Драконий клык, Драконья чешуя, Доспехи бессмертного
    }
  }
];

// ПРОФЕССИИ
const PROFESSIONS = [
  {
    id: 'blacksmith',
    name: 'Кузнец',
    description: 'Создает оружие и броню из металлов',
    icon: Hammer,
    color: 'bg-orange-600',
    baseExp: 100,
    expGrowth: 1.5,
    unlockLevel: 5
  },
  {
    id: 'alchemist',
    name: 'Алхимик',
    description: 'Варит зелья и эликсиры',
    icon: FlaskConical,
    color: 'bg-purple-600',
    baseExp: 100,
    expGrowth: 1.5,
    unlockLevel: 5
  },
  {
    id: 'herbalist',
    name: 'Травник',
    description: 'Собирает и обрабатывает травы',
    icon: Wind,
    color: 'bg-green-600',
    baseExp: 80,
    expGrowth: 1.4,
    unlockLevel: 3
  },
  {
    id: 'miner',
    name: 'Шахтер',
    description: 'Добывает руду и драгоценные камни',
    icon: Target,
    color: 'bg-slate-600',
    baseExp: 120,
    expGrowth: 1.6,
    unlockLevel: 7
  },
  {
    id: 'fisher',
    name: 'Рыбак',
    description: 'Ловит рыбу и морских существ',
    icon: Wind,
    color: 'bg-blue-600',
    baseExp: 90,
    expGrowth: 1.4,
    unlockLevel: 5
  },
  {
    id: 'gatherer',
    name: 'Собиратель',
    description: 'Собирает ягоды, грибы и редкие растения',
    icon: Sparkles,
    color: 'bg-emerald-600',
    baseExp: 85,
    expGrowth: 1.3,
    unlockLevel: 4
  }
];

// РЕСУРСЫ
const RESOURCES = [
  { id: 'iron_ore', name: 'Железная руда', icon: Box, rarity: 'common', locations: [1, 2, 3] },
  { id: 'gold_ore', name: 'Золотая руда', icon: Coins, rarity: 'rare', locations: [3, 4] },
  { id: 'wood', name: 'Древесина', icon: Box, rarity: 'common', locations: [1] },
  { id: 'red_herb', name: 'Красная трава', icon: Wind, rarity: 'common', locations: [1, 2] },
  { id: 'blue_herb', name: 'Синяя трава', icon: Wind, rarity: 'uncommon', locations: [2, 3] },
  { id: 'crystal', name: 'Кристалл', icon: Sparkles, rarity: 'rare', locations: [4, 5] },
  { id: 'water', name: 'Вода', icon: FlaskConical, rarity: 'common', locations: [1, 2, 3, 4] },
  { id: 'ancient_stone', name: 'Древний камень', icon: Box, rarity: 'uncommon', locations: [5] },
  { id: 'ice_crystal', name: 'Ледяной кристалл', icon: Sparkles, rarity: 'rare', locations: [6] },
  { id: 'mithril_ore', name: 'Мифриловая руда', icon: Coins, rarity: 'epic', locations: [6] },
  { id: 'frozen_herb', name: 'Замороженная трава', icon: Wind, rarity: 'uncommon', locations: [6] },
  { id: 'dark_wood', name: 'Темная древесина', icon: Box, rarity: 'uncommon', locations: [7] },
  { id: 'shadow_herb', name: 'Теневая трава', icon: Wind, rarity: 'rare', locations: [7] },
  { id: 'spider_silk', name: 'Паучий шелк', icon: Box, rarity: 'uncommon', locations: [7] },
  { id: 'dragon_scale', name: 'Драконья чешуя', icon: Shield, rarity: 'legendary', locations: [8] },
  { id: 'dragon_bone', name: 'Драконья кость', icon: Box, rarity: 'epic', locations: [8] },
  { id: 'fire_crystal', name: 'Огненный кристалл', icon: Flame, rarity: 'epic', locations: [8] },
  { id: 'pearl', name: 'Жемчуг', icon: Sparkles, rarity: 'rare', locations: [9] },
  { id: 'coral', name: 'Коралл', icon: Box, rarity: 'uncommon', locations: [9] },
  { id: 'sea_crystal', name: 'Морской кристалл', icon: Sparkles, rarity: 'epic', locations: [9] },
  { id: 'sky_crystal', name: 'Небесный кристалл', icon: Sparkles, rarity: 'legendary', locations: [10] },
  { id: 'cloud_essence', name: 'Сущность облаков', icon: Wind, rarity: 'rare', locations: [10] },
  { id: 'wind_stone', name: 'Камень ветра', icon: Box, rarity: 'epic', locations: [10] },
  { id: 'hell_fire', name: 'Адский огонь', icon: Flame, rarity: 'legendary', locations: [11] },
  { id: 'demon_horn', name: 'Рог демона', icon: Box, rarity: 'epic', locations: [11] },
  { id: 'soul_stone', name: 'Камень души', icon: Sparkles, rarity: 'legendary', locations: [11] },
  { id: 'fish_common', name: 'Обычная рыба', icon: Wind, rarity: 'common', locations: [1, 2, 3, 9] },
  { id: 'fish_rare', name: 'Редкая рыба', icon: Wind, rarity: 'rare', locations: [9] },
  { id: 'fish_legendary', name: 'Легендарная рыба', icon: Sparkles, rarity: 'legendary', locations: [9] },
  { id: 'berries', name: 'Ягоды', icon: Wind, rarity: 'common', locations: [1, 7] },
  { id: 'mushrooms', name: 'Грибы', icon: Wind, rarity: 'uncommon', locations: [1, 3, 7] },
  { id: 'rare_flower', name: 'Редкий цветок', icon: Sparkles, rarity: 'rare', locations: [5, 7, 10] }
];

// РЫБЫ
const FISH_DB = [
  // ОБЫЧНЫЕ РЫБЫ
  { 
    id: 'small_fish', 
    name: 'Мелкая рыбешка', 
    rarity: 'common', 
    sellPrice: 5, 
    locations: [1, 2, 3, 4, 5, 6, 7, 8],
    icon: '🐟'
  },
  { 
    id: 'carp', 
    name: 'Карп', 
    rarity: 'common', 
    sellPrice: 8, 
    locations: [1, 2, 3],
    icon: '🐟'
  },
  { 
    id: 'perch', 
    name: 'Окунь', 
    rarity: 'common', 
    sellPrice: 10, 
    locations: [1, 2, 3, 4],
    icon: '🐟'
  },
  
  // НЕОБЫЧНЫЕ РЫБЫ
  { 
    id: 'pike', 
    name: 'Щука', 
    rarity: 'uncommon', 
    sellPrice: 20, 
    locations: [2, 3, 4],
    icon: '🐠'
  },
  { 
    id: 'salmon', 
    name: 'Лосось', 
    rarity: 'uncommon', 
    sellPrice: 25, 
    locations: [3, 4, 6],
    icon: '🐠'
  },
  { 
    id: 'catfish', 
    name: 'Сом', 
    rarity: 'uncommon', 
    sellPrice: 30, 
    locations: [3, 4, 7],
    icon: '🐠'
  },
  
  // РЕДКИЕ РЫБЫ
  { 
    id: 'golden_carp', 
    name: 'Золотой карп', 
    rarity: 'rare', 
    sellPrice: 60, 
    locations: [3, 4, 5],
    icon: '🐡'
  },
  { 
    id: 'ice_fish', 
    name: 'Ледяная рыба', 
    rarity: 'rare', 
    sellPrice: 70, 
    locations: [6],
    icon: '🐡'
  },
  { 
    id: 'shadow_fish', 
    name: 'Теневая рыба', 
    rarity: 'rare', 
    sellPrice: 80, 
    locations: [7],
    icon: '🐡'
  },
  
  // ЭПИЧЕСКИЕ РЫБЫ
  { 
    id: 'crystal_fish', 
    name: 'Кристальная рыба', 
    rarity: 'epic', 
    sellPrice: 150, 
    locations: [5, 6],
    icon: '🐬'
  },
  { 
    id: 'fire_fish', 
    name: 'Огненная рыба', 
    rarity: 'epic', 
    sellPrice: 180, 
    locations: [4, 8],
    icon: '🐬'
  },
  
  // ЛЕГЕНДАРНЫЕ РЫБЫ
  { 
    id: 'dragon_fish', 
    name: 'Драконья рыба', 
    rarity: 'legendary', 
    sellPrice: 400, 
    locations: [8],
    icon: '🐉'
  },
  { 
    id: 'ancient_leviathan', 
    name: 'Древний Левиафан', 
    rarity: 'legendary', 
    sellPrice: 500, 
    locations: [8],
    icon: '🐉'
  }
];

// РЕЦЕПТЫ КРАФТА
const RECIPES = [
  {
    id: 1,
    name: 'Железный меч',
    profession: 'blacksmith',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'iron_ore', amount: 3 },
      { resourceId: 'wood', amount: 1 }
    ],
    result: {
      itemId: 11,
      name: 'Железный меч',
      type: 'weapon',
      val: 12,
      rarity: 'uncommon'
    },
    craftTime: 2000,
    expReward: 25
  },
  {
    id: 2,
    name: 'Зелье здоровья',
    profession: 'alchemist',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'red_herb', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 8,
      name: 'Зелье здоровья',
      type: 'consumable',
      val: 50,
      rarity: 'common'
    },
    craftTime: 1500,
    expReward: 15
  },
  {
    id: 3,
    name: 'Травяной отвар',
    profession: 'herbalist',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'red_herb', amount: 1 },
      { resourceId: 'blue_herb', amount: 1 }
    ],
    result: {
      itemId: 12,
      name: 'Травяной отвар',
      type: 'consumable',
      val: 30,
      rarity: 'common'
    },
    craftTime: 1000,
    expReward: 10
  },
  {
    id: 4,
    name: 'Серебряный меч',
    profession: 'blacksmith',
    requiredLevel: 2,
    ingredients: [
      { resourceId: 'iron_ore', amount: 5 },
      { resourceId: 'gold_ore', amount: 2 }
    ],
    result: {
      itemId: 10,
      name: 'Серебряный меч',
      type: 'weapon',
      val: 10,
      rarity: 'uncommon'
    },
    craftTime: 2500,
    expReward: 35
  },
  {
    id: 5,
    name: 'Большое зелье здоровья',
    profession: 'alchemist',
    requiredLevel: 2,
    ingredients: [
      { resourceId: 'red_herb', amount: 3 },
      { resourceId: 'blue_herb', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 25,
      name: 'Большое зелье здоровья',
      type: 'consumable',
      val: 100,
      rarity: 'uncommon'
    },
    craftTime: 2000,
    expReward: 30
  },
  {
    id: 6,
    name: 'Кольчуга',
    profession: 'blacksmith',
    requiredLevel: 3,
    ingredients: [
      { resourceId: 'iron_ore', amount: 8 },
      { resourceId: 'wood', amount: 2 }
    ],
    result: {
      itemId: 18,
      name: 'Кольчуга',
      type: 'armor',
      val: 10,
      rarity: 'uncommon'
    },
    craftTime: 3000,
    expReward: 50
  },
  {
    id: 7,
    name: 'Зелье энергии',
    profession: 'alchemist',
    requiredLevel: 3,
    ingredients: [
      { resourceId: 'blue_herb', amount: 3 },
      { resourceId: 'crystal', amount: 1 }
    ],
    result: {
      itemId: 26,
      name: 'Зелье энергии',
      type: 'consumable',
      val: 10,
      rarity: 'uncommon',
      effect: 'Восстанавливает энергию'
    },
    craftTime: 2000,
    expReward: 40
  },
  {
    id: 8,
    name: 'Эликсир силы',
    profession: 'alchemist',
    requiredLevel: 4,
    ingredients: [
      { resourceId: 'red_herb', amount: 5 },
      { resourceId: 'crystal', amount: 2 }
    ],
    result: {
      itemId: 27,
      name: 'Эликсир силы',
      type: 'consumable',
      val: 10,
      rarity: 'rare',
      effect: 'Временно +10 к силе на 5 шагов'
    },
    craftTime: 3000,
    expReward: 60
  },
  {
    id: 9,
    name: 'Мифриловая броня',
    profession: 'blacksmith',
    requiredLevel: 5,
    ingredients: [
      { resourceId: 'mithril_ore', amount: 5 },
      { resourceId: 'iron_ore', amount: 10 }
    ],
    result: {
      itemId: 20,
      name: 'Мифриловая броня',
      type: 'armor',
      val: 18,
      rarity: 'rare'
    },
    craftTime: 4000,
    expReward: 100
  },
  // LEVEL 6+ RECIPES
  {
    id: 10,
    name: 'Эликсир защиты',
    profession: 'alchemist',
    requiredLevel: 6,
    ingredients: [
      { resourceId: 'blue_herb', amount: 5 },
      { resourceId: 'ancient_stone', amount: 2 },
      { resourceId: 'water', amount: 2 }
    ],
    result: {
      itemId: 28,
      name: 'Эликсир защиты',
      type: 'consumable',
      val: 5,
      rarity: 'rare',
      effect: 'Временно +5 к защите на 5 шагов'
    },
    craftTime: 3500,
    expReward: 80
  },
  {
    id: 11,
    name: 'Ледяной клинок',
    profession: 'blacksmith',
    requiredLevel: 6,
    ingredients: [
      { resourceId: 'mithril_ore', amount: 3 },
      { resourceId: 'ice_crystal', amount: 4 },
      { resourceId: 'iron_ore', amount: 5 }
    ],
    result: {
      itemId: 12,
      name: 'Эльфийский лук',
      type: 'weapon',
      val: 15,
      rarity: 'rare'
    },
    craftTime: 4500,
    expReward: 120
  },
  {
    id: 12,
    name: 'Морозное зелье',
    profession: 'herbalist',
    requiredLevel: 6,
    ingredients: [
      { resourceId: 'frozen_herb', amount: 4 },
      { resourceId: 'ice_crystal', amount: 2 }
    ],
    result: {
      itemId: 26,
      name: 'Зелье энергии',
      type: 'consumable',
      val: 10,
      rarity: 'uncommon'
    },
    craftTime: 2500,
    expReward: 70
  },
  {
    id: 13,
    name: 'Золотой слиток',
    profession: 'miner',
    requiredLevel: 6,
    ingredients: [
      { resourceId: 'gold_ore', amount: 10 }
    ],
    result: {
      itemId: 31,
      name: 'Мифриловая руда',
      type: 'resource',
      val: 0,
      rarity: 'rare'
    },
    craftTime: 3000,
    expReward: 90
  },
  {
    id: 14,
    name: 'Боевой молот',
    profession: 'blacksmith',
    requiredLevel: 7,
    ingredients: [
      { resourceId: 'mithril_ore', amount: 6 },
      { resourceId: 'dark_wood', amount: 3 },
      { resourceId: 'iron_ore', amount: 8 }
    ],
    result: {
      itemId: 13,
      name: 'Боевой молот',
      type: 'weapon',
      val: 16,
      rarity: 'rare'
    },
    craftTime: 5000,
    expReward: 140
  },
  {
    id: 15,
    name: 'Теневой эликсир',
    profession: 'alchemist',
    requiredLevel: 7,
    ingredients: [
      { resourceId: 'shadow_herb', amount: 5 },
      { resourceId: 'crystal', amount: 3 },
      { resourceId: 'water', amount: 2 }
    ],
    result: {
      itemId: 27,
      name: 'Эликсир силы',
      type: 'consumable',
      val: 10,
      rarity: 'rare'
    },
    craftTime: 4000,
    expReward: 110
  },
  {
    id: 16,
    name: 'Паучий шелк доспех',
    profession: 'herbalist',
    requiredLevel: 7,
    ingredients: [
      { resourceId: 'spider_silk', amount: 8 },
      { resourceId: 'dark_wood', amount: 2 }
    ],
    result: {
      itemId: 17,
      name: 'Кожаная куртка',
      type: 'armor',
      val: 6,
      rarity: 'common'
    },
    craftTime: 3500,
    expReward: 100
  },
  {
    id: 17,
    name: 'Кристальная руда',
    profession: 'miner',
    requiredLevel: 7,
    ingredients: [
      { resourceId: 'crystal', amount: 5 },
      { resourceId: 'ancient_stone', amount: 3 }
    ],
    result: {
      itemId: 32,
      name: 'Драконья кость',
      type: 'resource',
      val: 0,
      rarity: 'epic'
    },
    craftTime: 4500,
    expReward: 130
  },
  {
    id: 18,
    name: 'Стальная броня',
    profession: 'blacksmith',
    requiredLevel: 8,
    ingredients: [
      { resourceId: 'mithril_ore', amount: 8 },
      { resourceId: 'iron_ore', amount: 15 },
      { resourceId: 'gold_ore', amount: 5 }
    ],
    result: {
      itemId: 19,
      name: 'Стальная броня',
      type: 'armor',
      val: 14,
      rarity: 'rare'
    },
    craftTime: 6000,
    expReward: 180
  },
  {
    id: 19,
    name: 'Зелье удачи',
    profession: 'alchemist',
    requiredLevel: 8,
    ingredients: [
      { resourceId: 'crystal', amount: 5 },
      { resourceId: 'red_herb', amount: 8 },
      { resourceId: 'blue_herb', amount: 8 },
      { resourceId: 'water', amount: 3 }
    ],
    result: {
      itemId: 29,
      name: 'Зелье удачи',
      type: 'consumable',
      val: 0,
      rarity: 'epic',
      effect: 'Удваивает находки на 10 шагов'
    },
    craftTime: 5000,
    expReward: 200
  },
  {
    id: 20,
    name: 'Древний отвар',
    profession: 'herbalist',
    requiredLevel: 8,
    ingredients: [
      { resourceId: 'shadow_herb', amount: 6 },
      { resourceId: 'frozen_herb', amount: 6 },
      { resourceId: 'ancient_stone', amount: 2 }
    ],
    result: {
      itemId: 25,
      name: 'Большое зелье здоровья',
      type: 'consumable',
      val: 100,
      rarity: 'uncommon'
    },
    craftTime: 4000,
    expReward: 150
  },
  {
    id: 21,
    name: 'Огненный кристалл обработка',
    profession: 'miner',
    requiredLevel: 8,
    ingredients: [
      { resourceId: 'fire_crystal', amount: 3 },
      { resourceId: 'mithril_ore', amount: 5 }
    ],
    result: {
      itemId: 33,
      name: 'Кристалл души',
      type: 'resource',
      val: 0,
      rarity: 'legendary'
    },
    craftTime: 6000,
    expReward: 220
  },
  {
    id: 22,
    name: 'Посох мага',
    profession: 'blacksmith',
    requiredLevel: 9,
    ingredients: [
      { resourceId: 'crystal', amount: 8 },
      { resourceId: 'dark_wood', amount: 5 },
      { resourceId: 'mithril_ore', amount: 10 }
    ],
    result: {
      itemId: 14,
      name: 'Посох мага',
      type: 'weapon',
      val: 25,
      rarity: 'epic',
      effect: '+5 к максимальной энергии'
    },
    craftTime: 7000,
    expReward: 250
  },
  {
    id: 23,
    name: 'Зачарованная мантия',
    profession: 'alchemist',
    requiredLevel: 9,
    ingredients: [
      { resourceId: 'spider_silk', amount: 10 },
      { resourceId: 'crystal', amount: 6 },
      { resourceId: 'shadow_herb', amount: 8 }
    ],
    result: {
      itemId: 21,
      name: 'Зачарованная мантия',
      type: 'armor',
      val: 20,
      rarity: 'epic',
      effect: '+10 к максимальному здоровью'
    },
    craftTime: 6500,
    expReward: 240
  },
  {
    id: 24,
    name: 'Эликсир жизни',
    profession: 'herbalist',
    requiredLevel: 9,
    ingredients: [
      { resourceId: 'red_herb', amount: 10 },
      { resourceId: 'blue_herb', amount: 10 },
      { resourceId: 'frozen_herb', amount: 5 },
      { resourceId: 'crystal', amount: 4 }
    ],
    result: {
      itemId: 25,
      name: 'Большое зелье здоровья',
      type: 'consumable',
      val: 100,
      rarity: 'uncommon'
    },
    craftTime: 5500,
    expReward: 230
  },
  {
    id: 25,
    name: 'Драконья кость обработка',
    profession: 'miner',
    requiredLevel: 9,
    ingredients: [
      { resourceId: 'dragon_bone', amount: 5 },
      { resourceId: 'fire_crystal', amount: 4 }
    ],
    result: {
      itemId: 32,
      name: 'Драконья кость',
      type: 'resource',
      val: 0,
      rarity: 'epic'
    },
    craftTime: 7000,
    expReward: 260
  },
  {
    id: 26,
    name: 'Клинок теней',
    profession: 'blacksmith',
    requiredLevel: 10,
    ingredients: [
      { resourceId: 'mithril_ore', amount: 15 },
      { resourceId: 'dragon_bone', amount: 5 },
      { resourceId: 'shadow_herb', amount: 10 }
    ],
    result: {
      itemId: 15,
      name: 'Клинок теней',
      type: 'weapon',
      val: 35,
      rarity: 'legendary',
      effect: 'Шанс крита +10%'
    },
    craftTime: 10000,
    expReward: 400
  },
  {
    id: 27,
    name: 'Эликсир бессмертия',
    profession: 'alchemist',
    requiredLevel: 10,
    ingredients: [
      { resourceId: 'dragon_scale', amount: 3 },
      { resourceId: 'crystal', amount: 10 },
      { resourceId: 'red_herb', amount: 15 },
      { resourceId: 'water', amount: 5 }
    ],
    result: {
      itemId: 30,
      name: 'Эликсир бессмертия',
      type: 'consumable',
      val: 0,
      rarity: 'legendary',
      effect: 'Воскрешает при смерти с 50% HP (одноразовое)'
    },
    craftTime: 12000,
    expReward: 500
  },
  {
    id: 28,
    name: 'Драконий эликсир',
    profession: 'herbalist',
    requiredLevel: 10,
    ingredients: [
      { resourceId: 'dragon_scale', amount: 2 },
      { resourceId: 'shadow_herb', amount: 12 },
      { resourceId: 'frozen_herb', amount: 8 }
    ],
    result: {
      itemId: 27,
      name: 'Эликсир силы',
      type: 'consumable',
      val: 10,
      rarity: 'rare'
    },
    craftTime: 8000,
    expReward: 350
  },
  {
    id: 29,
    name: 'Драконья чешуя обработка',
    profession: 'miner',
    requiredLevel: 10,
    ingredients: [
      { resourceId: 'dragon_scale', amount: 5 },
      { resourceId: 'fire_crystal', amount: 8 },
      { resourceId: 'mithril_ore', amount: 10 }
    ],
    result: {
      itemId: 22,
      name: 'Драконья чешуя',
      type: 'armor',
      val: 25,
      rarity: 'legendary',
      effect: '+50 к максимальному здоровью'
    },
    craftTime: 15000,
    expReward: 600
  },
  // FISH RECIPES
  {
    id: 24,
    name: 'Рыбный суп',
    profession: 'alchemist',
    requiredLevel: 1,
    ingredients: [
      { resourceId: 'small_fish', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 48,
      name: 'Рыбный суп',
      type: 'consumable',
      val: 40,
      rarity: 'common',
      effect: 'Восстанавливает 40 HP'
    },
    craftTime: 1500,
    expReward: 15
  },
  {
    id: 25,
    name: 'Эликсир моря',
    profession: 'alchemist',
    requiredLevel: 3,
    ingredients: [
      { resourceId: 'golden_carp', amount: 1 },
      { resourceId: 'blue_herb', amount: 2 },
      { resourceId: 'water', amount: 1 }
    ],
    result: {
      itemId: 49,
      name: 'Эликсир моря',
      type: 'consumable',
      val: 0,
      rarity: 'rare',
      effect: '+5 к защите на 10 шагов'
    },
    craftTime: 3000,
    expReward: 50
  },
  {
    id: 26,
    name: 'Драконий эликсир',
    profession: 'alchemist',
    requiredLevel: 5,
    ingredients: [
      { resourceId: 'dragon_fish', amount: 1 },
      { resourceId: 'fire_crystal', amount: 2 },
      { resourceId: 'crystal', amount: 3 }
    ],
    result: {
      itemId: 50,
      name: 'Драконий эликсир',
      type: 'consumable',
      val: 0,
      rarity: 'legendary',
      effect: '+15 к силе и +10 к защите на 20 шагов'
    },
    craftTime: 5000,
    expReward: 150
  }
];

// ПИТОМЦЫ/КОМПАНЬОНЫ
const PETS_DB = [
  // COMMON PETS
  {
    id: 1,
    name: 'Щенок',
    type: 'damage',
    rarity: 'common',
    icon: Heart,
    color: 'bg-slate-600',
    baseStats: { damage: 2, defense: 0, healing: 0 },
    growthRate: 1.2,
    maxLevel: 50,
    foodPerLevel: 5,
    description: 'Верный щенок, помогает в бою',
    evolutions: [
      { level: 10, evolvesTo: 2 }
    ]
  },
  {
    id: 2,
    name: 'Боевой Пес',
    type: 'damage',
    rarity: 'uncommon',
    icon: Skull,
    color: 'bg-green-600',
    baseStats: { damage: 8, defense: 2, healing: 0 },
    growthRate: 1.3,
    maxLevel: 50,
    foodPerLevel: 8,
    description: 'Эволюция щенка. Сильный боевой пес',
    evolutions: [
      { level: 25, evolvesTo: 3 }
    ]
  },
  {
    id: 3,
    name: 'Адский Пес',
    type: 'damage',
    rarity: 'epic',
    icon: Flame,
    color: 'bg-purple-600',
    baseStats: { damage: 20, defense: 5, healing: 0 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 15,
    description: 'Финальная эволюция. Огненный пес из преисподней',
    evolutions: []
  },
  {
    id: 4,
    name: 'Котенок',
    type: 'healing',
    rarity: 'common',
    icon: Sparkles,
    color: 'bg-slate-600',
    baseStats: { damage: 1, defense: 0, healing: 3 },
    growthRate: 1.2,
    maxLevel: 50,
    foodPerLevel: 4,
    description: 'Милый котенок, лечит после боя',
    evolutions: [
      { level: 10, evolvesTo: 5 }
    ]
  },
  {
    id: 5,
    name: 'Магический Кот',
    type: 'healing',
    rarity: 'uncommon',
    icon: Zap,
    color: 'bg-green-600',
    baseStats: { damage: 3, defense: 1, healing: 10 },
    growthRate: 1.3,
    maxLevel: 50,
    foodPerLevel: 7,
    description: 'Эволюция котенка. Обладает магией исцеления',
    evolutions: [
      { level: 25, evolvesTo: 6 }
    ]
  },
  {
    id: 6,
    name: 'Небесный Хранитель',
    type: 'healing',
    rarity: 'epic',
    icon: Crown,
    color: 'bg-purple-600',
    baseStats: { damage: 8, defense: 3, healing: 25 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 12,
    description: 'Финальная эволюция. Божественный целитель',
    evolutions: []
  },
  {
    id: 7,
    name: 'Черепашка',
    type: 'defense',
    rarity: 'common',
    icon: Shield,
    color: 'bg-slate-600',
    baseStats: { damage: 0, defense: 5, healing: 0 },
    growthRate: 1.2,
    maxLevel: 50,
    foodPerLevel: 6,
    description: 'Маленькая черепаха, повышает защиту',
    evolutions: [
      { level: 10, evolvesTo: 8 }
    ]
  },
  {
    id: 8,
    name: 'Каменная Черепаха',
    type: 'defense',
    rarity: 'uncommon',
    icon: Target,
    color: 'bg-green-600',
    baseStats: { damage: 2, defense: 15, healing: 0 },
    growthRate: 1.3,
    maxLevel: 50,
    foodPerLevel: 10,
    description: 'Эволюция черепашки. Непробиваемая защита',
    evolutions: [
      { level: 25, evolvesTo: 9 }
    ]
  },
  {
    id: 9,
    name: 'Титановый Страж',
    type: 'defense',
    rarity: 'epic',
    icon: Shield,
    color: 'bg-purple-600',
    baseStats: { damage: 5, defense: 35, healing: 0 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 18,
    description: 'Финальная эволюция. Неуязвимый защитник',
    evolutions: []
  },
  
  // RARE PETS
  {
    id: 10,
    name: 'Дракончик',
    type: 'damage',
    rarity: 'rare',
    icon: Flame,
    color: 'bg-blue-600',
    baseStats: { damage: 12, defense: 3, healing: 0 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 12,
    description: 'Молодой дракон, дышит огнем',
    evolutions: [
      { level: 20, evolvesTo: 11 }
    ]
  },
  {
    id: 11,
    name: 'Древний Дракон',
    type: 'damage',
    rarity: 'legendary',
    icon: Crown,
    color: 'bg-orange-600',
    baseStats: { damage: 40, defense: 15, healing: 0 },
    growthRate: 1.6,
    maxLevel: 50,
    foodPerLevel: 25,
    description: 'Эволюция дракончика. Могущественный древний дракон',
    evolutions: []
  },
  {
    id: 12,
    name: 'Феникс',
    type: 'healing',
    rarity: 'legendary',
    icon: Flame,
    color: 'bg-orange-600',
    baseStats: { damage: 15, defense: 10, healing: 30 },
    growthRate: 1.6,
    maxLevel: 50,
    foodPerLevel: 20,
    description: 'Легендарная птица возрождения',
    evolutions: []
  },
  {
    id: 13,
    name: 'Единорог',
    type: 'healing',
    rarity: 'legendary',
    icon: Sparkles,
    color: 'bg-orange-600',
    baseStats: { damage: 10, defense: 8, healing: 35 },
    growthRate: 1.6,
    maxLevel: 50,
    foodPerLevel: 22,
    description: 'Мифическое существо с целительной силой',
    evolutions: []
  },
  {
    id: 14,
    name: 'Грифон',
    type: 'damage',
    rarity: 'rare',
    icon: Wind,
    color: 'bg-blue-600',
    baseStats: { damage: 15, defense: 8, healing: 0 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 14,
    description: 'Величественный грифон, быстрый и смертоносный',
    evolutions: []
  },
  {
    id: 15,
    name: 'Ледяной Волк',
    type: 'damage',
    rarity: 'rare',
    icon: Wind,
    color: 'bg-blue-600',
    baseStats: { damage: 14, defense: 6, healing: 0 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 13,
    description: 'Волк из ледяных пустошей',
    evolutions: []
  },
  {
    id: 16,
    name: 'Теневой Призрак',
    type: 'damage',
    rarity: 'epic',
    icon: Ghost,
    color: 'bg-purple-600',
    baseStats: { damage: 18, defense: 4, healing: 0 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 16,
    description: 'Призрак из темного измерения',
    evolutions: []
  },
  {
    id: 17,
    name: 'Голем',
    type: 'defense',
    rarity: 'rare',
    icon: Box,
    color: 'bg-blue-600',
    baseStats: { damage: 5, defense: 20, healing: 0 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 15,
    description: 'Каменный голем, непробиваемая защита',
    evolutions: []
  },
  {
    id: 18,
    name: 'Лесной Дух',
    type: 'healing',
    rarity: 'rare',
    icon: Wind,
    color: 'bg-blue-600',
    baseStats: { damage: 6, defense: 5, healing: 18 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 11,
    description: 'Дух природы, исцеляет союзников',
    evolutions: []
  },
  {
    id: 19,
    name: 'Демон',
    type: 'damage',
    rarity: 'legendary',
    icon: Flame,
    color: 'bg-orange-600',
    baseStats: { damage: 35, defense: 12, healing: 0 },
    growthRate: 1.6,
    maxLevel: 50,
    foodPerLevel: 28,
    description: 'Могущественный демон из ада',
    evolutions: []
  },
  {
    id: 20,
    name: 'Ангел-Хранитель',
    type: 'healing',
    rarity: 'legendary',
    icon: Crown,
    color: 'bg-orange-600',
    baseStats: { damage: 12, defense: 15, healing: 40 },
    growthRate: 1.6,
    maxLevel: 50,
    foodPerLevel: 30,
    description: 'Небесный ангел, защищает и исцеляет',
    evolutions: []
  },
  {
    id: 21,
    name: 'Механический Страж',
    type: 'defense',
    rarity: 'epic',
    icon: Bot,
    color: 'bg-purple-600',
    baseStats: { damage: 10, defense: 25, healing: 0 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 17,
    description: 'Робот-защитник с прочной броней',
    evolutions: []
  },
  {
    id: 22,
    name: 'Кристальный Элементаль',
    type: 'healing',
    rarity: 'epic',
    icon: Sparkles,
    color: 'bg-purple-600',
    baseStats: { damage: 8, defense: 8, healing: 20 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 14,
    description: 'Элементаль из чистого кристалла',
    evolutions: []
  },
  {
    id: 23,
    name: 'Огненный Элементаль',
    type: 'damage',
    rarity: 'epic',
    icon: Flame,
    color: 'bg-purple-600',
    baseStats: { damage: 22, defense: 6, healing: 0 },
    growthRate: 1.5,
    maxLevel: 50,
    foodPerLevel: 16,
    description: 'Существо из чистого пламени',
    evolutions: []
  },
  {
    id: 24,
    name: 'Водный Элементаль',
    type: 'healing',
    rarity: 'rare',
    icon: FlaskConical,
    color: 'bg-blue-600',
    baseStats: { damage: 7, defense: 7, healing: 16 },
    growthRate: 1.4,
    maxLevel: 50,
    foodPerLevel: 12,
    description: 'Элементаль воды, исцеляет раны',
    evolutions: []
  },
  {
    id: 25,
    name: 'Левиафан',
    type: 'damage',
    rarity: 'legendary',
    icon: Wind,
    color: 'bg-orange-600',
    baseStats: { damage: 45, defense: 20, healing: 0 },
    growthRate: 1.7,
    maxLevel: 50,
    foodPerLevel: 35,
    description: 'Морское чудовище невероятной силы',
    evolutions: []
  }
];

// ЕДА ДЛЯ ПИТОМЦЕВ
const PET_FOOD = [
  { id: 'basic_food', name: 'Обычная еда', cost: 10, exp: 10, rarity: 'common' },
  { id: 'quality_food', name: 'Качественная еда', cost: 50, exp: 50, rarity: 'uncommon' },
  { id: 'premium_food', name: 'Премиум еда', cost: 150, exp: 150, rarity: 'rare' },
  { id: 'legendary_food', name: 'Легендарная еда', cost: 500, exp: 500, rarity: 'legendary' }
];

// СЛУЧАЙНЫЕ СОБЫТИЯ
const RANDOM_EVENTS = [
  {
    id: 'meteor_shower',
    name: 'Метеоритный дождь',
    description: 'С неба падают метеориты! Соберите редкие ресурсы!',
    icon: Sparkles,
    color: 'from-purple-600 to-pink-600',
    duration: 300000, // 5 минут
    chance: 0.05, // 5% шанс при каждом шаге
    cooldown: 1800000, // 30 минут кулдаун
    rewards: {
      resources: [
        { id: 'crystal', amount: { min: 3, max: 8 } },
        { id: 'fire_crystal', amount: { min: 2, max: 5 } },
        { id: 'ice_crystal', amount: { min: 2, max: 5 } },
        { id: 'sky_crystal', amount: { min: 1, max: 3 } },
        { id: 'mithril_ore', amount: { min: 2, max: 6 } }
      ],
      gold: { min: 100, max: 300 }
    }
  },
  {
    id: 'monster_invasion',
    name: 'Нашествие монстров',
    description: 'Волна монстров атакует! Защитите территорию и получите награды!',
    icon: Skull,
    color: 'from-red-600 to-orange-600',
    duration: 600000, // 10 минут
    chance: 0.03, // 3% шанс
    cooldown: 2400000, // 40 минут кулдаун
    waves: 5,
    rewards: {
      gold: { min: 200, max: 500 },
      exp: { min: 150, max: 400 },
      items: [3, 7, 11, 12, 13, 19, 20] // Хорошие предметы
    }
  },
  {
    id: 'traveling_merchant',
    name: 'Торговец-путешественник',
    description: 'Загадочный торговец предлагает редкие товары со скидкой!',
    icon: ShoppingBag,
    color: 'from-yellow-600 to-amber-600',
    duration: 180000, // 3 минуты
    chance: 0.08, // 8% шанс
    cooldown: 1200000, // 20 минут кулдаун
    specialItems: [
      { itemId: 14, discount: 0.5 }, // Посох мага -50%
      { itemId: 15, discount: 0.4 }, // Клинок теней -40%
      { itemId: 22, discount: 0.5 }, // Драконья чешуя -50%
      { itemId: 29, discount: 0.6 }, // Зелье удачи -40%
      { itemId: 31, discount: 0.5 }, // Мифриловая руда -50%
      { itemId: 32, discount: 0.5 }  // Драконья кость -50%
    ],
    petFood: [
      { foodId: 'premium_food', discount: 0.5, stock: 10 },
      { foodId: 'legendary_food', discount: 0.4, stock: 5 }
    ]
  },
  {
    id: 'treasure_vault',
    name: 'Сокровищница',
    description: 'Вы нашли древнюю сокровищницу! Откройте её за энергию!',
    icon: Gift,
    color: 'from-cyan-600 to-blue-600',
    duration: 120000, // 2 минуты
    chance: 0.04, // 4% шанс
    cooldown: 3600000, // 60 минут кулдаун
    energyCost: 20,
    rewards: {
      gold: { min: 500, max: 1500 },
      exp: { min: 300, max: 800 },
      items: [14, 15, 16, 21, 22, 23, 29, 30, 32, 33], // Эпические и легендарные предметы
      guaranteedRare: true,
      chestChance: 0.3 // 30% шанс получить сундук
    }
  }
];

const QUESTS_DB = [
  { id: 1, name: 'Первые шаги', type: 'step', target: 20, desc: 'Сделайте 20 шагов в путешествии.', gold: 50, exp: 20, minLvl: 1 },
  { id: 2, name: 'Охотник на крыс', type: 'kill', target: 3, desc: 'Победите 3 любых врагов.', gold: 100, exp: 50, minLvl: 1, itemReward: { id: 24, name: 'Малое зелье здоровья' } },
  { id: 3, name: 'Удачливый искатель', type: 'find', target: 1, desc: 'Найдите любой предмет в путешествии.', gold: 150, exp: 30, minLvl: 2 },
  { id: 4, name: 'Долгая дорога', type: 'step', target: 100, desc: 'Пройдите 100 шагов.', gold: 300, exp: 150, minLvl: 3, itemReward: { id: 9, name: 'Бронзовый топор' } },
  { id: 5, name: 'Ветеран боев', type: 'kill', target: 10, desc: 'Победите 10 врагов.', gold: 500, exp: 400, minLvl: 5, itemReward: { id: 17, name: 'Кожаная куртка' } },
  { id: 6, name: 'Магнат', type: 'earn_gold', target: 200, desc: 'Заработайте 200 золота (лут/продажа).', gold: 100, exp: 100, minLvl: 1 },
];

// ГИЛЬДЕЙСКИЕ КВЕСТЫ
const GUILD_QUESTS = [
  { id: 1, name: 'Охота на монстров', type: 'kill', target: 50, desc: 'Гильдия должна убить 50 врагов.', reward: { gold: 1000, exp: 500 } },
  { id: 2, name: 'Сбор ресурсов', type: 'collect_resources', target: 100, desc: 'Соберите 100 любых ресурсов.', reward: { gold: 800, exp: 400 } },
  { id: 3, name: 'Подземелья', type: 'dungeon_runs', target: 10, desc: 'Завершите 10 подземелий.', reward: { gold: 1500, exp: 750 } },
  { id: 4, name: 'Богатство гильдии', type: 'earn_gold', target: 5000, desc: 'Заработайте 5000 золота.', reward: { gold: 2000, exp: 1000 } },
  { id: 5, name: 'Убийцы боссов', type: 'boss_kills', target: 5, desc: 'Убейте 5 боссов.', reward: { gold: 3000, exp: 1500, itemReward: { id: 14, name: 'Посох мага' } } }
];

// ГИЛЬДИИ (для демонстрации - в реальном приложении это будет на backend)
const GUILDS = [
  {
    id: 1,
    name: 'Стальные Воины',
    level: 5,
    memberCount: 12,
    bonuses: { expBonus: 10, goldBonus: 5 },
    members: [
      { playerId: 'p1', name: 'Артур', level: 25, role: 'leader', contribution: 1500 },
      { playerId: 'p2', name: 'Ланселот', level: 22, role: 'member', contribution: 1200 },
      { playerId: 'p3', name: 'Гвиневра', level: 20, role: 'member', contribution: 900 },
      { playerId: 'p4', name: 'Мерлин', level: 28, role: 'member', contribution: 1800 }
    ],
    chat: [],
    activeQuests: [],
    completedQuests: []
  },
  {
    id: 2,
    name: 'Магический Круг',
    level: 3,
    memberCount: 8,
    bonuses: { expBonus: 5, goldBonus: 10 },
    members: [
      { playerId: 'p5', name: 'Гэндальф', level: 30, role: 'leader', contribution: 2000 },
      { playerId: 'p6', name: 'Саруман', level: 28, role: 'member', contribution: 1500 },
      { playerId: 'p7', name: 'Радагаст', level: 18, role: 'member', contribution: 600 }
    ],
    chat: [],
    activeQuests: [],
    completedQuests: []
  },
  {
    id: 3,
    name: 'Торговая Лига',
    level: 7,
    memberCount: 20,
    bonuses: { expBonus: 15, goldBonus: 15 },
    members: [
      { playerId: 'p8', name: 'Торговец Джо', level: 35, role: 'leader', contribution: 3000 },
      { playerId: 'p9', name: 'Купец Анна', level: 32, role: 'member', contribution: 2500 },
      { playerId: 'p10', name: 'Барон Смит', level: 30, role: 'member', contribution: 2200 }
    ],
    chat: [],
    activeQuests: [],
    completedQuests: []
  },
  {
    id: 4,
    name: 'Ночные Охотники',
    level: 4,
    memberCount: 10,
    bonuses: { expBonus: 8, goldBonus: 7 },
    members: [
      { playerId: 'p11', name: 'Тень', level: 24, role: 'leader', contribution: 1400 },
      { playerId: 'p12', name: 'Призрак', level: 21, role: 'member', contribution: 1100 },
      { playerId: 'p13', name: 'Ночь', level: 19, role: 'member', contribution: 800 }
    ],
    chat: [],
    activeQuests: [],
    completedQuests: []
  }
];

// ДРУЗЬЯ
const FRIEND_NAMES = [
  'Артур', 'Мерлин', 'Ланселот', 'Гвиневра', 'Моргана',
  'Персиваль', 'Галахад', 'Тристан', 'Изольда', 'Бедивер',
  'Кей', 'Гарет', 'Гавейн', 'Элейн', 'Вивиана',
  'Утер', 'Игрейна', 'Модред', 'Агравейн', 'Борс',
  'Ивейн', 'Динадан', 'Ламорак', 'Пеллинор', 'Лионель'
];

const FRIENDS_DB = [];

const generateFriend = () => {
  const id = `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const name = FRIEND_NAMES[getRandomInt(0, FRIEND_NAMES.length - 1)];
  const classData = PLAYER_CLASSES[getRandomInt(0, PLAYER_CLASSES.length - 1)];
  const level = getRandomInt(1, 50);
  const statuses = ['online', 'offline', 'in_combat', 'traveling', 'in_dungeon'];
  
  return {
    id,
    name,
    level,
    className: classData.name,
    classId: classData.id,
    avatarId: getRandomInt(1, 15),
    status: statuses[getRandomInt(0, statuses.length - 1)],
    lastActive: Date.now() - getRandomInt(0, 86400000),
    location: getRandomInt(1, 8),
    stats: {
      totalKills: getRandomInt(level * 5, level * 20),
      pvpRating: getRandomInt(800, 2000),
      gold: getRandomInt(level * 100, level * 500),
      questsCompleted: getRandomInt(level, level * 3)
    },
    friendship: {
      addedAt: Date.now(),
      giftsReceived: 0,
      giftsSent: 0,
      questsCompleted: 0
    }
  };
};

// ДОСТИЖЕНИЯ
const ACHIEVEMENTS = [
  // EXPLORATION (Путешествия)
  {
    id: 'first_steps',
    name: 'Первые шаги',
    description: 'Сделайте 10 шагов',
    category: 'exploration',
    requirement: { type: 'steps', value: 10 },
    reward: { gold: 50, exp: 20 },
    icon: Footprints
  },
  {
    id: 'seasoned_traveler',
    name: 'Опытный путешественник',
    description: 'Сделайте 100 шагов',
    category: 'exploration',
    requirement: { type: 'steps', value: 100 },
    reward: { gold: 200, exp: 100 },
    icon: Footprints
  },
  {
    id: 'explorer',
    name: 'Исследователь',
    description: 'Посетите 5 различных локаций',
    category: 'exploration',
    requirement: { type: 'locations_visited', value: 5 },
    reward: { gold: 300, exp: 150 },
    icon: MapPin
  },
  
  // COMBAT (Бои)
  {
    id: 'first_blood',
    name: 'Первая кровь',
    description: 'Победите первого врага',
    category: 'combat',
    requirement: { type: 'kills', value: 1 },
    reward: { gold: 30, exp: 15 },
    icon: Sword
  },
  {
    id: 'monster_slayer',
    name: 'Убийца монстров',
    description: 'Победите 50 врагов',
    category: 'combat',
    requirement: { type: 'kills', value: 50 },
    reward: { gold: 200, exp: 100 },
    icon: Skull
  },
  {
    id: 'legendary_warrior',
    name: 'Легендарный воин',
    description: 'Победите 200 врагов',
    category: 'combat',
    requirement: { type: 'kills', value: 200 },
    reward: { gold: 1000, exp: 500 },
    icon: Swords
  },
  
  // CRAFTING (Крафт)
  {
    id: 'first_craft',
    name: 'Первое творение',
    description: 'Создайте первый предмет',
    category: 'crafting',
    requirement: { type: 'crafts', value: 1 },
    reward: { gold: 50, exp: 25 },
    icon: Hammer
  },
  {
    id: 'apprentice_crafter',
    name: 'Подмастерье',
    description: 'Создайте 10 предметов',
    category: 'crafting',
    requirement: { type: 'crafts', value: 10 },
    reward: { gold: 150, exp: 75 },
    icon: Hammer
  },
  {
    id: 'master_crafter',
    name: 'Мастер крафта',
    description: 'Создайте 25 предметов',
    category: 'crafting',
    requirement: { type: 'crafts', value: 25 },
    reward: { gold: 300, exp: 150 },
    icon: Sparkles
  },
  
  // QUESTS (Квесты)
  {
    id: 'quest_beginner',
    name: 'Начинающий герой',
    description: 'Выполните первый квест',
    category: 'quests',
    requirement: { type: 'quests_completed', value: 1 },
    reward: { gold: 50, exp: 30 },
    icon: CheckCircle
  },
  {
    id: 'quest_master',
    name: 'Мастер квестов',
    description: 'Выполните 5 квестов',
    category: 'quests',
    requirement: { type: 'quests_completed', value: 5 },
    reward: { gold: 250, exp: 150 },
    icon: Scroll
  },
  
  // SOCIAL (Социальное)
  {
    id: 'guild_member',
    name: 'Член гильдии',
    description: 'Вступите в гильдию',
    category: 'social',
    requirement: { type: 'guild_joined', value: 1 },
    reward: { gold: 200, exp: 100 },
    icon: Users
  },
  {
    id: 'guild_founder',
    name: 'Основатель гильдии',
    description: 'Создайте гильдию',
    category: 'social',
    requirement: { type: 'guild_created', value: 1 },
    reward: { gold: 500, exp: 200 },
    icon: Crown
  },
  
  // COLLECTION (Коллекции)
  {
    id: 'collector',
    name: 'Коллекционер',
    description: 'Соберите 5 различных аватаров',
    category: 'collection',
    requirement: { type: 'avatars_collected', value: 5 },
    reward: { gold: 300, exp: 150 },
    icon: Dna
  },
  {
    id: 'legendary_collector',
    name: 'Коллекционер легенд',
    description: 'Получите 3 легендарных предмета',
    category: 'collection',
    requirement: { type: 'legendary_items', value: 3 },
    reward: { gold: 1000, exp: 500 },
    icon: Trophy
  },
  {
    id: 'wealthy',
    name: 'Богач',
    description: 'Накопите 5000 золота',
    category: 'collection',
    requirement: { type: 'gold_accumulated', value: 5000 },
    reward: { gold: 500, exp: 250 },
    icon: Coins
  }
];

// --- СУНДУКИ ---

const CHEST_TYPES = [
  {
    id: 'wooden',
    name: 'Деревянный сундук',
    rarity: 'common',
    cost: 50,
    color: 'from-amber-800 to-amber-900',
    borderColor: 'border-amber-700',
    icon: Box,
    rewards: {
      gold: { min: 20, max: 50 },
      exp: { min: 10, max: 30 },
      items: {
        chance: 0.3,
        pool: [1, 2, 5, 8, 24] // Деревянный меч, Ржавый кинжал, Тряпичная рубаха, Зелье здоровья, Малое зелье
      },
      perks: {
        chance: 0.05, // 5% шанс получить перк
        pool: [9, 10] // Энергичность, Живучесть
      },
      frames: {
        chance: 0.1, // 10% шанс получить рамку
        pool: [2, 3] // Синяя, Зеленая
      },
      pets: {
        chance: 0.15, // 15% шанс получить питомца
        pool: [1, 4, 7] // Щенок, Котенок, Черепашка
      }
    }
  },
  {
    id: 'silver',
    name: 'Серебряный сундук',
    rarity: 'uncommon',
    cost: 150,
    color: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-400',
    icon: Package,
    rewards: {
      gold: { min: 50, max: 150 },
      exp: { min: 30, max: 80 },
      items: {
        chance: 0.5,
        pool: [3, 6, 9, 10, 17, 18, 25, 26] // Стальной меч, Кожаная броня, Бронзовый топор и т.д.
      },
      perks: {
        chance: 0.1, // 10% шанс получить перк
        pool: [1, 3, 5, 7, 8, 9, 10] // Редкие перки
      },
      frames: {
        chance: 0.15, // 15% шанс получить рамку
        pool: [4, 5] // Золотая, Пурпурная
      },
      pets: {
        chance: 0.25, // 25% шанс получить питомца
        pool: [1, 2, 4, 5, 7, 8, 10, 14, 15, 17, 18, 24] // Обычные и необычные питомцы
      }
    }
  },
  {
    id: 'gold',
    name: 'Золотой сундук',
    rarity: 'rare',
    cost: 500,
    color: 'from-yellow-500 to-yellow-700',
    borderColor: 'border-yellow-500',
    icon: Gift,
    rewards: {
      gold: { min: 200, max: 500 },
      exp: { min: 100, max: 250 },
      items: {
        chance: 0.7,
        pool: [7, 11, 12, 13, 19, 20, 27, 28, 31, 34, 35, 36, 41, 42] // Латы рыцаря + новые мощные предметы
      },
      perks: {
        chance: 0.2, // 20% шанс получить перк
        pool: [1, 2, 3, 4, 5, 6, 7, 8] // Редкие и эпические перки
      },
      frames: {
        chance: 0.25, // 25% шанс получить рамку
        pool: [6, 7, 8] // Радужная, Огненная, Ледяная
      },
      pets: {
        chance: 0.35, // 35% шанс получить питомца
        pool: [2, 5, 8, 10, 11, 14, 15, 16, 17, 18, 22, 23, 24] // Редкие и эпические питомцы
      }
    }
  },
  {
    id: 'diamond',
    name: 'Алмазный сундук',
    rarity: 'epic',
    cost: 1500,
    color: 'from-cyan-400 to-blue-600',
    borderColor: 'border-cyan-400',
    icon: Sparkles,
    rewards: {
      gold: { min: 500, max: 1200 },
      exp: { min: 250, max: 600 },
      items: {
        chance: 0.9,
        pool: [14, 20, 21, 29, 31, 32, 37, 38, 39, 43, 44, 45, 46] // Посох мага + ультра мощные предметы
      },
      perks: {
        chance: 0.35, // 35% шанс получить перк
        pool: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12] // Эпические и легендарные перки
      },
      frames: {
        chance: 0.4, // 40% шанс получить рамку
        pool: [9, 10, 11] // Драконья, Небесная, Теневая
      },
      pets: {
        chance: 0.5, // 50% шанс получить питомца
        pool: [3, 6, 9, 11, 16, 17, 18, 21, 22, 23] // Эпические питомцы
      }
    }
  },
  {
    id: 'legendary',
    name: 'Легендарный сундук',
    rarity: 'legendary',
    cost: 5000,
    color: 'from-purple-500 via-pink-500 to-orange-500',
    borderColor: 'border-purple-500',
    icon: Crown,
    rewards: {
      gold: { min: 1000, max: 3000 },
      exp: { min: 500, max: 1500 },
      items: {
        chance: 1.0,
        pool: [4, 15, 16, 22, 23, 30, 33, 40, 47] // Огненный клинок + самые мощные предметы
      },
      perks: {
        chance: 0.6, // 60% шанс получить перк
        pool: [2, 4, 6, 11, 12, 13, 14, 15] // Легендарные перки
      },
      frames: {
        chance: 0.7, // 70% шанс получить рамку
        pool: [12, 13, 14, 15] // Божественная, Космическая, Королевская, Бессмертная
      },
      pets: {
        chance: 0.8, // 80% шанс получить питомца
        pool: [11, 12, 13, 19, 20, 25] // Легендарные питомцы
      },
      guaranteedLegendary: true
    }
  }
];

// --- СИСТЕМА УЛУЧШЕНИЯ ПРЕДМЕТОВ ---

const UPGRADE_COSTS = {
  1: { gold: 100, resources: { iron_ore: 2 } },
  2: { gold: 250, resources: { iron_ore: 4, gold_ore: 1 } },
  3: { gold: 500, resources: { iron_ore: 6, gold_ore: 2, crystal: 1 } },
  4: { gold: 1000, resources: { gold_ore: 5, crystal: 3, mithril_ore: 1 } },
  5: { gold: 2000, resources: { mithril_ore: 3, crystal: 5, dragon_bone: 1 } },
  6: { gold: 4000, resources: { mithril_ore: 5, dragon_bone: 2, dragon_scale: 1 } },
  7: { gold: 8000, resources: { dragon_bone: 4, dragon_scale: 3, fire_crystal: 2 } },
  8: { gold: 15000, resources: { dragon_scale: 5, fire_crystal: 4, ice_crystal: 3 } },
  9: { gold: 30000, resources: { dragon_scale: 8, fire_crystal: 6, ice_crystal: 6 } },
  10: { gold: 50000, resources: { dragon_scale: 10, fire_crystal: 10, ice_crystal: 10 } }
};

const MAX_UPGRADE_LEVEL = 10;

// --- СИСТЕМА ЗАЧАРОВАНИЯ ---

const ENCHANTMENTS = [
  // Оружие
  { id: 1, name: 'Острота', type: 'weapon', effect: '+5% урона', bonus: { damagePercent: 5 }, cost: { gold: 200, crystal: 2 }, rarity: 'common' },
  { id: 2, name: 'Огонь', type: 'weapon', effect: '+10% урона огнем', bonus: { damagePercent: 10, element: 'fire' }, cost: { gold: 500, fire_crystal: 1 }, rarity: 'rare' },
  { id: 3, name: 'Лед', type: 'weapon', effect: '+10% урона льдом', bonus: { damagePercent: 10, element: 'ice' }, cost: { gold: 500, ice_crystal: 1 }, rarity: 'rare' },
  { id: 4, name: 'Вампиризм', type: 'weapon', effect: 'Восстанавливает 5% урона', bonus: { lifesteal: 5 }, cost: { gold: 1000, dragon_bone: 2 }, rarity: 'epic' },
  { id: 5, name: 'Критический удар', type: 'weapon', effect: '+15% шанс крита', bonus: { critChance: 15 }, cost: { gold: 1500, crystal: 5 }, rarity: 'epic' },
  { id: 6, name: 'Разрушение', type: 'weapon', effect: '+25% урона', bonus: { damagePercent: 25 }, cost: { gold: 3000, dragon_scale: 2 }, rarity: 'legendary' },
  
  // Броня
  { id: 7, name: 'Защита', type: 'armor', effect: '+5% защиты', bonus: { defensePercent: 5 }, cost: { gold: 200, iron_ore: 5 }, rarity: 'common' },
  { id: 8, name: 'Живучесть', type: 'armor', effect: '+50 HP', bonus: { maxHp: 50 }, cost: { gold: 500, crystal: 2 }, rarity: 'rare' },
  { id: 9, name: 'Регенерация', type: 'armor', effect: '+1 HP каждые 5 сек', bonus: { regen: 1 }, cost: { gold: 1000, blue_herb: 10 }, rarity: 'epic' },
  { id: 10, name: 'Отражение', type: 'armor', effect: 'Отражает 10% урона', bonus: { thorns: 10 }, cost: { gold: 1500, mithril_ore: 3 }, rarity: 'epic' },
  { id: 11, name: 'Неуязвимость', type: 'armor', effect: '+15% защиты, +100 HP', bonus: { defensePercent: 15, maxHp: 100 }, cost: { gold: 3000, dragon_scale: 2 }, rarity: 'legendary' }
];

// --- СИСТЕМА НАСТАВНИЧЕСТВА ---

const MENTORSHIP_REWARDS = {
  mentor: {
    perStudent: {
      exp: 100,
      gold: 50
    },
    milestones: {
      5: { gold: 500, title: 'Наставник' },
      10: { gold: 1500, title: 'Мастер-наставник', perk: 8 }, // Перк "Опыт"
      25: { gold: 5000, title: 'Легендарный учитель', perk: 13 } // Перк "Мастер Удачи"
    }
  },
  student: {
    levelUp: {
      exp: 50,
      gold: 25
    },
    graduation: { // При достижении уровня 10
      gold: 1000,
      exp: 500,
      title: 'Выпускник'
    }
  }
};

// --- СИСТЕМА ТИТУЛОВ ---

const TITLES = [
  // Боевые титулы
  { id: 1, name: 'Новичок', requirement: { type: 'level', value: 1 }, color: 'text-slate-400', icon: '🔰' },
  { id: 2, name: 'Воин', requirement: { type: 'level', value: 10 }, color: 'text-blue-400', icon: '⚔️' },
  { id: 3, name: 'Ветеран', requirement: { type: 'level', value: 25 }, color: 'text-purple-400', icon: '🛡️' },
  { id: 4, name: 'Легенда', requirement: { type: 'level', value: 50 }, color: 'text-yellow-400', icon: '👑' },
  
  { id: 5, name: 'Убийца', requirement: { type: 'kills', value: 10 }, color: 'text-red-400', icon: '💀' },
  { id: 6, name: 'Палач', requirement: { type: 'kills', value: 50 }, color: 'text-red-500', icon: '⚰️' },
  { id: 7, name: 'Убийца драконов', requirement: { type: 'kills', value: 100 }, color: 'text-orange-500', icon: '🐉' },
  { id: 8, name: 'Истребитель', requirement: { type: 'kills', value: 500 }, color: 'text-red-600', icon: '☠️' },
  
  // Титулы исследователя
  { id: 9, name: 'Путешественник', requirement: { type: 'steps', value: 100 }, color: 'text-green-400', icon: '🥾' },
  { id: 10, name: 'Странник', requirement: { type: 'steps', value: 500 }, color: 'text-green-500', icon: '🗺️' },
  { id: 11, name: 'Исследователь', requirement: { type: 'steps', value: 1000 }, color: 'text-cyan-400', icon: '🧭' },
  
  // Титулы крафтера
  { id: 12, name: 'Ученик кузнеца', requirement: { type: 'crafts', value: 10 }, color: 'text-orange-400', icon: '🔨' },
  { id: 13, name: 'Мастер крафта', requirement: { type: 'crafts', value: 50 }, color: 'text-orange-500', icon: '⚒️' },
  { id: 14, name: 'Легендарный кузнец', requirement: { type: 'crafts', value: 100 }, color: 'text-yellow-500', icon: '🏆' },
  
  // Титулы квестов
  { id: 15, name: 'Помощник', requirement: { type: 'quests', value: 5 }, color: 'text-blue-300', icon: '📜' },
  { id: 16, name: 'Герой', requirement: { type: 'quests', value: 25 }, color: 'text-blue-500', icon: '🎖️' },
  { id: 17, name: 'Спаситель', requirement: { type: 'quests', value: 50 }, color: 'text-purple-500', icon: '✨' },
  
  // Титулы богатства
  { id: 18, name: 'Богач', requirement: { type: 'gold', value: 10000 }, color: 'text-yellow-400', icon: '💰' },
  { id: 19, name: 'Магнат', requirement: { type: 'gold', value: 50000 }, color: 'text-yellow-500', icon: '💎' },
  { id: 20, name: 'Король', requirement: { type: 'gold', value: 100000 }, color: 'text-yellow-600', icon: '👑' },
  
  // Титулы подземелий
  { id: 21, name: 'Исследователь подземелий', requirement: { type: 'dungeons', value: 5 }, color: 'text-purple-400', icon: '🏰' },
  { id: 22, name: 'Покоритель подземелий', requirement: { type: 'dungeons', value: 25 }, color: 'text-purple-500', icon: '🗝️' },
  
  // Титулы сундуков
  { id: 23, name: 'Охотник за сокровищами', requirement: { type: 'chests', value: 10 }, color: 'text-cyan-400', icon: '🎁' },
  { id: 24, name: 'Коллекционер', requirement: { type: 'chests', value: 50 }, color: 'text-cyan-500', icon: '📦' },
  
  // Особые титулы (выдаются вручную)
  { id: 25, name: 'Наставник', requirement: { type: 'special' }, color: 'text-blue-400', icon: '🎓' },
  { id: 26, name: 'Мастер-наставник', requirement: { type: 'special' }, color: 'text-blue-500', icon: '📚' },
  { id: 27, name: 'Легендарный учитель', requirement: { type: 'special' }, color: 'text-purple-500', icon: '🏅' },
  { id: 28, name: 'Выпускник', requirement: { type: 'special' }, color: 'text-green-400', icon: '🎓' },
  { id: 29, name: 'Убийца Демонов', requirement: { type: 'special' }, color: 'text-red-500', icon: '👹' }
];

// --- PVP АРЕНА ---

const ARENA_RANKS = [
  { id: 1, name: 'Новичок', minRating: 0, maxRating: 999, color: 'from-slate-600 to-slate-700', icon: User, reward: { gold: 50, exp: 25 } },
  { id: 2, name: 'Боец', minRating: 1000, maxRating: 1499, color: 'from-blue-600 to-blue-700', icon: Sword, reward: { gold: 100, exp: 50 } },
  { id: 3, name: 'Ветеран', minRating: 1500, maxRating: 1999, color: 'from-green-600 to-green-700', icon: Shield, reward: { gold: 200, exp: 100 } },
  { id: 4, name: 'Эксперт', minRating: 2000, maxRating: 2499, color: 'from-purple-600 to-purple-700', icon: Swords, reward: { gold: 300, exp: 150 } },
  { id: 5, name: 'Мастер', minRating: 2500, maxRating: 2999, color: 'from-yellow-600 to-orange-600', icon: Trophy, reward: { gold: 500, exp: 250 } },
  { id: 6, name: 'Гроссмейстер', minRating: 3000, maxRating: 3499, color: 'from-orange-600 to-red-600', icon: Crown, reward: { gold: 750, exp: 400 } },
  { id: 7, name: 'Легенда', minRating: 3500, maxRating: 99999, color: 'from-red-600 to-pink-600', icon: Flame, reward: { gold: 1000, exp: 500 } }
];

// Генерация противников для PvP
const PVP_OPPONENTS = [
  { name: 'Артур Храбрый', class: 'Воин', avatarId: 2, level: 10, rating: 1200 },
  { name: 'Элара Быстрая', class: 'Бродяга', avatarId: 5, level: 12, rating: 1350 },
  { name: 'Торин Железный', class: 'Страж', avatarId: 3, level: 15, rating: 1500 },
  { name: 'Лира Светлая', class: 'Воин', avatarId: 4, level: 18, rating: 1800 },
  { name: 'Грок Могучий', class: 'Страж', avatarId: 6, level: 20, rating: 2000 },
  { name: 'Сильва Тень', class: 'Бродяга', avatarId: 9, level: 22, rating: 2200 },
  { name: 'Драко Огненный', class: 'Воин', avatarId: 12, level: 25, rating: 2500 },
  { name: 'Нова Звездная', class: 'Бродяга', avatarId: 15, level: 28, rating: 2800 },
  { name: 'Титан Несокрушимый', class: 'Страж', avatarId: 7, level: 30, rating: 3000 },
  { name: 'Феникс Бессмертный', class: 'Воин', avatarId: 12, level: 35, rating: 3500 }
];

// --- МИРОВЫЕ БОССЫ ---

const WORLD_BOSSES = [
  {
    id: 1,
    name: 'Древний Голем',
    description: 'Каменный колосс, пробудившийся после тысячелетнего сна',
    hp: 5000,
    maxHp: 5000,
    damage: 80,
    level: 20,
    spawnInterval: 3600000, // 1 час
    location: 'Мрачные Пещеры',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    rewards: {
      gold: { min: 500, max: 1000 },
      exp: { min: 300, max: 600 },
      items: [19, 20, 31], // Стальная броня, Мифриловая броня, Мифриловая руда
      guaranteedDrop: true
    },
    participants: [] // Список игроков, атаковавших босса
  },
  {
    id: 2,
    name: 'Ледяной Дракон',
    description: 'Повелитель вечной зимы и холода',
    hp: 10000,
    maxHp: 10000,
    damage: 120,
    level: 35,
    spawnInterval: 7200000, // 2 часа
    location: 'Ледяные Пики',
    icon: Flame,
    color: 'from-cyan-400 to-blue-600',
    rewards: {
      gold: { min: 1000, max: 2000 },
      exp: { min: 800, max: 1500 },
      items: [22, 32, 33], // Драконья чешуя, Драконья кость, Кристалл души
      guaranteedDrop: true
    },
    participants: []
  },
  {
    id: 3,
    name: 'Кракен Глубин',
    description: 'Ужас морских глубин с бесчисленными щупальцами',
    hp: 15000,
    maxHp: 15000,
    damage: 150,
    level: 40,
    spawnInterval: 10800000, // 3 часа
    location: 'Подводный Мир',
    icon: Skull,
    color: 'from-blue-600 to-purple-600',
    rewards: {
      gold: { min: 2000, max: 3000 },
      exp: { min: 1500, max: 2500 },
      items: [40, 43, 33], // Клинок Бездны, Броня Дракона, Кристалл души
      guaranteedDrop: true
    },
    participants: []
  },
  {
    id: 4,
    name: 'Повелитель Бури',
    description: 'Элементаль молний, правящий небесными островами',
    hp: 20000,
    maxHp: 20000,
    damage: 180,
    level: 45,
    spawnInterval: 14400000, // 4 часа
    location: 'Небесные Острова',
    icon: Zap,
    color: 'from-yellow-400 to-purple-500',
    rewards: {
      gold: { min: 3000, max: 5000 },
      exp: { min: 2000, max: 3500 },
      items: [35, 36, 42, 47], // Клинок Вечности, Посох Архимага, Мантия Архимага, Доспехи Бога Войны
      guaranteedDrop: true
    },
    participants: []
  },
  {
    id: 5,
    name: 'Владыка Ада',
    description: 'Верховный демон, правитель огненной бездны',
    hp: 30000,
    maxHp: 30000,
    damage: 250,
    level: 55,
    spawnInterval: 21600000, // 6 часов
    location: 'Ад',
    icon: Flame,
    color: 'from-red-600 to-black',
    rewards: {
      gold: { min: 5000, max: 10000 },
      exp: { min: 4000, max: 7000 },
      items: [37, 40, 47, 33], // Коса Жнеца, Клинок Бездны, Доспехи Бога Войны, Кристалл души
      guaranteedDrop: true,
      specialReward: { type: 'title', id: 29, name: 'Убийца Демонов' }
    },
    participants: []
  }
];

// --- СЕЗОНЫ ---

const SEASONS = [
  {
    id: 1,
    name: 'Сезон Огня',
    description: 'Огненная стихия охватила мир. Сражайтесь с огненными врагами и получайте эксклюзивные награды!',
    theme: 'fire',
    icon: Flame,
    color: 'from-orange-600 to-red-700',
    startDate: Date.now(),
    endDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 дней
    levels: 50,
    rewards: {
      // Награды за уровни
      5: { gold: 500, exp: 200, item: { id: 48, name: 'Огненный амулет', type: 'accessory', val: 5, rarity: 'rare', effect: '+10% урона огнем' } },
      10: { gold: 1000, exp: 500, item: { id: 49, name: 'Пламенный плащ', type: 'armor', val: 15, rarity: 'epic', effect: 'Иммунитет к огню' } },
      15: { gold: 1500, exp: 800, frame: 16 }, // Эксклюзивная рамка
      20: { gold: 2000, exp: 1200, avatar: 16 }, // Эксклюзивный аватар
      25: { gold: 3000, exp: 2000, perk: 16 }, // Эксклюзивный перк
      30: { gold: 4000, exp: 3000, item: { id: 50, name: 'Меч Феникса', type: 'weapon', val: 45, rarity: 'legendary', effect: 'Воскрешение 1 раз за бой' } },
      40: { gold: 6000, exp: 5000, title: { id: 30, name: 'Повелитель Огня', color: 'text-orange-500', icon: '🔥' } },
      50: { gold: 10000, exp: 10000, item: { id: 51, name: 'Корона Феникса', type: 'accessory', val: 20, rarity: 'legendary', effect: '+30% урона, Воскрешение' } }
    },
    tasks: [
      { id: 1, name: 'Огненное крещение', type: 'kill_fire_enemies', target: 50, progress: 0, reward: 5 },
      { id: 2, name: 'Мастер огня', type: 'deal_fire_damage', target: 10000, progress: 0, reward: 10 },
      { id: 3, name: 'Покоритель вулкана', type: 'complete_fire_location', target: 20, progress: 0, reward: 15 },
      { id: 4, name: 'Огненный босс', type: 'kill_fire_boss', target: 5, progress: 0, reward: 20 }
    ]
  },
  {
    id: 2,
    name: 'Сезон Льда',
    description: 'Вечная зима пришла в мир. Исследуйте ледяные земли и получите морозные награды!',
    theme: 'ice',
    icon: Sparkles,
    color: 'from-cyan-400 to-blue-600',
    startDate: Date.now() + (31 * 24 * 60 * 60 * 1000), // Начнется через 31 день
    endDate: Date.now() + (61 * 24 * 60 * 60 * 1000), // 30 дней
    levels: 50,
    rewards: {
      5: { gold: 500, exp: 200, item: { id: 52, name: 'Ледяной амулет', type: 'accessory', val: 5, rarity: 'rare', effect: '+10% урона льдом' } },
      10: { gold: 1000, exp: 500, item: { id: 53, name: 'Морозный плащ', type: 'armor', val: 15, rarity: 'epic', effect: 'Иммунитет ко льду' } },
      15: { gold: 1500, exp: 800, frame: 17 },
      20: { gold: 2000, exp: 1200, avatar: 17 },
      25: { gold: 3000, exp: 2000, perk: 17 },
      30: { gold: 4000, exp: 3000, item: { id: 54, name: 'Меч Ледяного Дракона', type: 'weapon', val: 45, rarity: 'legendary', effect: 'Замораживает врагов' } },
      40: { gold: 6000, exp: 5000, title: { id: 31, name: 'Повелитель Льда', color: 'text-cyan-400', icon: '❄️' } },
      50: { gold: 10000, exp: 10000, item: { id: 55, name: 'Корона Ледяного Короля', type: 'accessory', val: 20, rarity: 'legendary', effect: '+30% урона, Заморозка' } }
    },
    tasks: [
      { id: 1, name: 'Ледяное испытание', type: 'kill_ice_enemies', target: 50, progress: 0, reward: 5 },
      { id: 2, name: 'Мастер льда', type: 'deal_ice_damage', target: 10000, progress: 0, reward: 10 },
      { id: 3, name: 'Покоритель севера', type: 'complete_ice_location', target: 20, progress: 0, reward: 15 },
      { id: 4, name: 'Ледяной босс', type: 'kill_ice_boss', target: 5, progress: 0, reward: 20 }
    ]
  },
  {
    id: 3,
    name: 'Сезон Тьмы',
    description: 'Тьма поглощает мир. Сражайтесь с силами зла и получите темные награды!',
    theme: 'dark',
    icon: Skull,
    color: 'from-purple-600 to-black',
    startDate: Date.now() + (62 * 24 * 60 * 60 * 1000),
    endDate: Date.now() + (92 * 24 * 60 * 60 * 1000),
    levels: 50,
    rewards: {
      5: { gold: 500, exp: 200, item: { id: 56, name: 'Темный амулет', type: 'accessory', val: 5, rarity: 'rare', effect: '+10% урона тьмой' } },
      10: { gold: 1000, exp: 500, item: { id: 57, name: 'Плащ Тени', type: 'armor', val: 15, rarity: 'epic', effect: 'Невидимость 5 сек' } },
      15: { gold: 1500, exp: 800, frame: 18 },
      20: { gold: 2000, exp: 1200, avatar: 18 },
      25: { gold: 3000, exp: 2000, perk: 18 },
      30: { gold: 4000, exp: 3000, item: { id: 58, name: 'Клинок Ночи', type: 'weapon', val: 45, rarity: 'legendary', effect: 'Крит +30% в темноте' } },
      40: { gold: 6000, exp: 5000, title: { id: 32, name: 'Повелитель Тьмы', color: 'text-purple-500', icon: '🌑' } },
      50: { gold: 10000, exp: 10000, item: { id: 59, name: 'Корона Владыки Тьмы', type: 'accessory', val: 20, rarity: 'legendary', effect: '+30% урона, Невидимость' } }
    },
    tasks: [
      { id: 1, name: 'Темное испытание', type: 'kill_dark_enemies', target: 50, progress: 0, reward: 5 },
      { id: 2, name: 'Мастер тьмы', type: 'deal_dark_damage', target: 10000, progress: 0, reward: 10 },
      { id: 3, name: 'Покоритель тьмы', type: 'complete_dark_location', target: 20, progress: 0, reward: 15 },
      { id: 4, name: 'Темный босс', type: 'kill_dark_boss', target: 5, progress: 0, reward: 20 }
    ]
  }
];

// --- МАГАЗИН БРИЛЛИАНТОВ ---

const DIAMOND_SHOP_ITEMS = [
  // Пакеты бриллиантов
  {
    id: 'diamonds_small',
    type: 'diamonds',
    name: 'Горстка бриллиантов',
    amount: 100,
    price: 'Бесплатно',
    realPrice: 0,
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    popular: false
  },
  {
    id: 'diamonds_medium',
    type: 'diamonds',
    name: 'Мешок бриллиантов',
    amount: 500,
    price: '99₽',
    realPrice: 99,
    bonus: '+50 бонус',
    icon: Gift,
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'diamonds_large',
    type: 'diamonds',
    name: 'Сундук бриллиантов',
    amount: 1200,
    price: '199₽',
    realPrice: 199,
    bonus: '+200 бонус',
    icon: Box,
    color: 'from-yellow-500 to-orange-500',
    popular: false
  },
  {
    id: 'diamonds_mega',
    type: 'diamonds',
    name: 'Сокровищница',
    amount: 3000,
    price: '499₽',
    realPrice: 499,
    bonus: '+700 бонус',
    icon: Crown,
    color: 'from-orange-500 to-red-500',
    popular: false
  },
  
  // Премиум предметы
  {
    id: 'premium_exp_boost',
    type: 'boost',
    name: 'Усилитель опыта',
    description: '+100% опыта на 24 часа',
    cost: 200,
    duration: 86400000, // 24 часа в мс
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    effect: { expBoost: 100 }
  },
  {
    id: 'premium_gold_boost',
    type: 'boost',
    name: 'Золотая лихорадка',
    description: '+100% золота на 24 часа',
    cost: 200,
    duration: 86400000,
    icon: Coins,
    color: 'from-yellow-500 to-amber-500',
    effect: { goldBoost: 100 }
  },
  {
    id: 'premium_luck_boost',
    type: 'boost',
    name: 'Благословение удачи',
    description: '+50% шанс найти предметы на 24 часа',
    cost: 300,
    duration: 86400000,
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500',
    effect: { luckBoost: 50 }
  },
  {
    id: 'premium_energy_boost',
    type: 'boost',
    name: 'Бесконечная энергия',
    description: 'Энергия не тратится 12 часов',
    cost: 400,
    duration: 43200000, // 12 часов
    icon: Zap,
    color: 'from-yellow-400 to-orange-400',
    effect: { infiniteEnergy: true }
  },
  
  // Эксклюзивные предметы
  {
    id: 'premium_legendary_chest',
    type: 'item',
    name: 'Легендарный сундук',
    description: 'Гарантированный легендарный предмет',
    cost: 500,
    icon: Crown,
    color: 'from-purple-500 via-pink-500 to-orange-500',
    reward: 'legendary_chest'
  },
  {
    id: 'premium_perk_token',
    type: 'item',
    name: 'Жетон перка',
    description: 'Выберите любой перк',
    cost: 800,
    icon: Target,
    color: 'from-red-500 to-orange-500',
    reward: 'perk_choice'
  },
  {
    id: 'premium_avatar_pack',
    type: 'item',
    name: 'Набор аватаров',
    description: '5 случайных редких аватаров',
    cost: 300,
    icon: Palette,
    color: 'from-pink-500 to-purple-500',
    reward: 'avatar_pack'
  },
  {
    id: 'premium_instant_level',
    type: 'item',
    name: 'Мгновенный уровень',
    description: '+1 уровень персонажа',
    cost: 1000,
    icon: Trophy,
    color: 'from-yellow-400 to-yellow-600',
    reward: 'instant_level'
  },
  
  // Рамки для аватаров
  {
    id: 'frame_rare_pack',
    type: 'item',
    name: 'Набор редких рамок',
    description: '3 случайные редкие рамки',
    cost: 300,
    icon: ImageIcon,
    color: 'from-blue-500 to-cyan-500',
    reward: 'frame_rare_pack'
  },
  {
    id: 'frame_epic_pack',
    type: 'item',
    name: 'Набор эпических рамок',
    description: '2 случайные эпические рамки',
    cost: 600,
    icon: ImageIcon,
    color: 'from-purple-500 to-pink-500',
    reward: 'frame_epic_pack'
  },
  {
    id: 'frame_legendary',
    type: 'item',
    name: 'Легендарная рамка',
    description: '1 случайная легендарная рамка',
    cost: 1000,
    icon: ImageIcon,
    color: 'from-orange-500 to-red-500',
    reward: 'frame_legendary'
  }
];

// --- КОНСТАНТЫ ЧАТА ---

const CHAT_CHANNELS = [
  { id: 'general', name: 'Общий', color: 'bg-blue-500', icon: MessageSquare, maxMessages: 100 },
  { id: 'trade', name: 'Торговля', color: 'bg-yellow-500', icon: ShoppingBag, maxMessages: 100 },
  { id: 'help', name: 'Помощь', color: 'bg-green-500', icon: Info, maxMessages: 100 }
];

const EMOJI_CATEGORIES = {
  emotions: { name: 'Эмоции', emojis: ['😀', '😂', '😍', '😎', '😢', '😡', '🤔', '😱', '🥳', '😴'] },
  actions: { name: 'Действия', emojis: ['👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '👋', '🤷', '🙌'] },
  items: { name: 'Предметы', emojis: ['⚔️', '🛡️', '🏹', '🔮', '💎', '👑', '🎁', '💰', '🗝️', '📜'] }
};

const STICKERS = [
  { id: 1, name: 'Победа', emoji: '🎉', category: 'celebration' },
  { id: 2, name: 'Поражение', emoji: '💀', category: 'combat' },
  { id: 3, name: 'Удача', emoji: '🍀', category: 'general' },
  { id: 4, name: 'Сила', emoji: '💪', category: 'combat' },
  { id: 5, name: 'Магия', emoji: '✨', category: 'magic' },
  { id: 6, name: 'Дракон', emoji: '🐉', category: 'creatures' },
  { id: 7, name: 'Меч', emoji: '⚔️', category: 'items' },
  { id: 8, name: 'Щит', emoji: '🛡️', category: 'items' },
  { id: 9, name: 'Зелье', emoji: '🧪', category: 'items' },
  { id: 10, name: 'Сокровище', emoji: '💎', category: 'items' }
];

const CHAT_COMMANDS = [
  { command: '/help', description: 'Показать список команд', usage: '/help' },
  { command: '/clear', description: 'Очистить историю чата', usage: '/clear' },
  { command: '/whisper', description: 'Отправить личное сообщение', usage: '/whisper [имя] [сообщение]' },
  { command: '/block', description: 'Заблокировать игрока', usage: '/block [имя]' },
  { command: '/unblock', description: 'Разблокировать игрока', usage: '/unblock [имя]' }
];

const NPC_NAMES = ['Артур', 'Мерлин', 'Ланселот', 'Гвиневра', 'Моргана', 'Персиваль', 'Галахад', 'Тристан', 'Изольда', 'Бедивер'];

const MESSAGE_TEMPLATES = {
  general: ['Привет всем!', 'Кто-нибудь хочет пойти в подземелье?', 'Только что достиг {level} уровня!', 'Эта игра потрясающая!', 'Ищу группу для квеста'],
  trade: ['Продаю {item} за {price} золота', 'Куплю {item}, предлагайте цену', 'Обменяю {item1} на {item2}', 'WTS {item} - шепните цену'],
  help: ['Как мне повысить уровень быстрее?', 'Где найти {resource}?', 'Какой класс лучше для новичка?', 'Как работает крафтинг?']
};

const PROFANITY_LIST = ['плохое_слово1', 'плохое_слово2', 'плохое_слово3'];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Calculate item stats based on type and rarity
const calculateItemStats = (type, rarity) => {
  const ranges = {
    weapon: {
      common: { min: 2, max: 5 },
      uncommon: { min: 5, max: 12 },
      rare: { min: 12, max: 20 },
      epic: { min: 20, max: 30 },
      legendary: { min: 30, max: 50 }
    },
    armor: {
      common: { min: 1, max: 6 },
      uncommon: { min: 6, max: 12 },
      rare: { min: 12, max: 20 },
      epic: { min: 18, max: 25 },
      legendary: { min: 25, max: 35 }
    },
    consumable: {
      common: { min: 20, max: 50 },
      uncommon: { min: 50, max: 100 },
      rare: { min: 100, max: 200 },
      epic: { min: 200, max: 500 },
      legendary: { min: 500, max: 1000 }
    }
  };

  const range = ranges[type]?.[rarity] || { min: 1, max: 10 };
  return getRandomInt(range.min, range.max);
};

// Get available titles for player
const getAvailableTitles = (player) => {
  if (!player) return [];
  
  return TITLES.filter(title => {
    if (title.requirement.type === 'special') {
      // Special titles are set manually via player.title
      return false;
    }
    
    const req = title.requirement;
    switch (req.type) {
      case 'level':
        return player.level >= req.value;
      case 'kills':
        return (player.totalKills || 0) >= req.value;
      case 'steps':
        return (player.totalSteps || 0) >= req.value;
      case 'crafts':
        return (player.totalCrafts || 0) >= req.value;
      case 'quests':
        return (player.questsCompletedCount || 0) >= req.value;
      case 'gold':
        return player.gold >= req.value;
      case 'dungeons':
        return (player.totalDungeonsCompleted || 0) >= req.value;
      case 'chests':
        return (player.totalChestsOpened || 0) >= req.value;
      default:
        return false;
    }
  }).sort((a, b) => {
    // Sort by requirement value descending (highest first)
    return (b.requirement.value || 0) - (a.requirement.value || 0);
  });
};

// Get current active title
const getCurrentTitle = (player) => {
  if (!player) return null;
  
  // Check if player has a special title set
  if (player.title) {
    const specialTitle = TITLES.find(t => t.name === player.title);
    if (specialTitle) return specialTitle;
  }
  
  // Otherwise get the highest available title
  const available = getAvailableTitles(player);
  return available[0] || TITLES[0]; // Default to "Новичок"
};

// --- СИСТЕМА СОХРАНЕНИЯ ---

const SAVE_KEY = 'rpg_game_save_v2';

const saveGame = (playerData) => {
  try {
    const saveData = {
      version: 2,
      timestamp: Date.now(),
      player: playerData
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    if (error.name === 'QuotaExceededError') {
      console.error('Недостаточно места для сохранения. Очистите localStorage.');
    }
    return false;
  }
};

const loadGame = () => {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    
    const parsed = JSON.parse(saveData);
    
    // Миграция старых сохранений (v1 -> v2)
    if (!parsed.version || parsed.version === 1) {
      console.warn('Обнаружено старое сохранение, выполняется миграция...');
      
      // Если это старое сохранение без версии, добавляем новые поля
      const migratedPlayer = {
        ...parsed.player || parsed,
        // Добавляем новые поля с дефолтными значениями
        profession: parsed.player?.profession || null,
        professionLevel: parsed.player?.professionLevel || 0,
        professionExp: parsed.player?.professionExp || 0,
        professionMaxExp: parsed.player?.professionMaxExp || 100,
        resources: parsed.player?.resources || {},
        totalCrafts: parsed.player?.totalCrafts || 0,
        guildId: parsed.player?.guildId || null,
        guildRole: parsed.player?.guildRole || null,
        guildContribution: parsed.player?.guildContribution || 0,
        guildChatMessages: parsed.player?.guildChatMessages || [],
        guildQuests: parsed.player?.guildQuests || [],
        guildQuestsCompleted: parsed.player?.guildQuestsCompleted || [],
        achievements: parsed.player?.achievements || [],
        unclaimedAchievements: parsed.player?.unclaimedAchievements || [],
        perks: parsed.player?.perks || [], // Добавляем перки
        diamonds: parsed.player?.diamonds || 0, // Добавляем бриллианты
        bankGold: parsed.player?.bankGold || 0, // Добавляем банковское золото
        avatarFrameId: parsed.player?.avatarFrameId || 1, // Добавляем рамку
        collectedFrames: parsed.player?.collectedFrames || [1], // Добавляем коллекцию рамок
        customAvatar: parsed.player?.customAvatar || null, // Добавляем кастомную аватарку
        hasPremium: parsed.player?.hasPremium || false, // Добавляем премиум статус
        pets: parsed.player?.pets || [], // Добавляем питомцев
        activePet: parsed.player?.activePet || null, // Добавляем активного питомца
        petFood: parsed.player?.petFood || { // Добавляем корм для питомцев
          basic_food: 0,
          quality_food: 0,
          premium_food: 0,
          legendary_food: 0
        }
      };
      
      // Сохраняем мигрированную версию
      saveGame(migratedPlayer);
      
      // Мигрируем данные фракций
      const migratedWithFactions = migrateFactionData(migratedPlayer);
      saveGame(migratedWithFactions);
      
      return migratedWithFactions;
    }
    
    // Проверка версии
    if (parsed.version !== 2) {
      console.warn('Несовместимая версия сохранения');
      return null;
    }
    
    // Мигрируем данные фракций для версии 2
    let playerData = parsed.player;
    if (!playerData.factionReputation) {
      playerData = migrateFactionData(playerData);
      saveGame(playerData);
    }
    
    return playerData;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return null;
  }
};

const exportSave = () => {
  const saveData = localStorage.getItem(SAVE_KEY);
  if (!saveData) {
    console.error('Нет сохранения для экспорта');
    return false;
  }
  
  try {
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpg_save_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    return false;
  }
};

const importSave = (file, onSuccess, onError) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const saveData = JSON.parse(e.target.result);
      
      // Валидация версии
      if (!saveData.version || saveData.version !== 2) {
        onError('Несовместимая версия сохранения');
        return;
      }
      
      // Валидация структуры
      if (!saveData.player || !saveData.player.name) {
        onError('Поврежденное сохранение');
        return;
      }
      
      // Сохраняем в localStorage
      localStorage.setItem(SAVE_KEY, e.target.result);
      onSuccess();
    } catch (error) {
      console.error('Ошибка импорта:', error);
      onError('Ошибка чтения файла');
    }
  };
  
  reader.onerror = () => {
    onError('Ошибка чтения файла');
  };
  
  reader.readAsText(file);
};

// --- УТИЛИТЫ ЧАТА ---

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const generateNPCMessage = (channelId) => {
  const name = NPC_NAMES[getRandomInt(0, NPC_NAMES.length - 1)];
  const level = getRandomInt(1, 50);
  const avatarId = getRandomInt(1, 15);
  const templates = MESSAGE_TEMPLATES[channelId] || MESSAGE_TEMPLATES.general;
  let content = templates[getRandomInt(0, templates.length - 1)];
  content = content.replace('{level}', level).replace('{item}', 'Меч').replace('{item1}', 'Щит').replace('{item2}', 'Броня').replace('{price}', getRandomInt(100, 5000)).replace('{resource}', 'руда');
  return {
    id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    author: { id: `npc_${name}`, name, level, avatarId, isNPC: true },
    content,
    timestamp: Date.now(),
    type: 'text',
    mentions: []
  };
};

const filterProfanity = (text, enabled) => {
  if (!enabled) return text;
  let filtered = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
};

const detectMentions = (text, playerName) => {
  const mentions = [];
  const words = text.split(/\s+/);
  words.forEach(word => {
    if (word.startsWith('@')) mentions.push(word.substring(1));
  });
  return { mentions, isMentioned: mentions.includes(playerName) };
};

// --- КОМПОНЕНТЫ UI ---

const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
    outline: "border-2 border-slate-600 text-slate-300 hover:bg-slate-800",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    purple: "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/30",
    gold: "bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, title, icon: Icon, className = '' }) => (
  <div className={`bg-gradient-to-br from-blue-900/40 to-slate-900/60 rounded-xl border border-blue-800/50 shadow-xl overflow-hidden backdrop-blur-sm ${className}`}>
    {title && (
      <div className="bg-blue-950/50 p-4 border-b border-blue-800/50 flex items-center gap-2">
        {Icon && <Icon size={20} className="text-blue-400" />}
        <h3 className="font-bold text-slate-100">{title}</h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, max, color = 'bg-blue-500', label, icon: Icon, showLabel = true }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-white">
            {Icon && <Icon size={16} className="drop-shadow-lg" />}
            {label}
          </span>
          <span className="text-xs md:text-sm font-bold text-white">{Math.floor(value)} / {Math.floor(max)}</span>
        </div>
      )}
      <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden border-2 border-slate-700/50 shadow-inner">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out shadow-lg`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, disabled, badge }) => (
  <button 
    onClick={disabled ? null : onClick} 
    className={`
      w-full flex items-center justify-between p-3 rounded-lg transition-colors mb-1 text-sm font-medium
      ${active ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-white' : ''} />
      <span>{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-700/80 text-orange-100 shadow-sm border border-orange-600/50">
        {badge}
      </span>
    )}
  </button>
);

const NavGroup = ({ title, children }) => (
  <div className="mb-6">
    <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
      {title}
    </div>
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

// --- NOTIFICATION SYSTEM ---

const NotificationSystem = React.memo(({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map(notification => {
        const typeStyles = {
          success: 'bg-green-900/90 border-green-600 text-green-100',
          info: 'bg-blue-900/90 border-blue-600 text-blue-100',
          warning: 'bg-yellow-900/90 border-yellow-600 text-yellow-100',
          error: 'bg-red-900/90 border-red-600 text-red-100',
          legendary: 'bg-orange-900/90 border-orange-500 text-orange-100'
        };

        const typeIcons = {
          success: CheckCircle,
          info: Sparkles,
          warning: Zap,
          error: X,
          legendary: Crown
        };

        const Icon = typeIcons[notification.type] || Sparkles;

        return (
          <div
            key={notification.id}
            className={`${typeStyles[notification.type]} border-2 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm pointer-events-auto animate-in fade-in slide-in-from-right-5 duration-300 min-w-[300px] max-w-[400px]`}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className="flex-shrink-0" />
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// --- TOOLTIP COMPONENT ---

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-50 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
};

// --- RARITY COLOR CONSTANTS ---

const RARITY_COLORS = {
  common: 'text-slate-400 border-slate-600',
  uncommon: 'text-green-400 border-green-600',
  rare: 'text-blue-400 border-blue-600',
  epic: 'text-purple-400 border-purple-600',
  legendary: 'text-orange-400 border-orange-600'
};

const RARITY_BG = {
  common: 'bg-slate-800',
  uncommon: 'bg-green-900/20',
  rare: 'bg-blue-900/20',
  epic: 'bg-purple-900/20',
  legendary: 'bg-orange-900/20'
};

// --- HELPER COMPONENTS FOR PROFILE ---

const StatRow = ({ label, value, icon: Icon, color, sub }) => (
  <div className="flex justify-between items-center bg-gradient-to-r from-slate-900/50 to-slate-900/30 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:scale-[1.02] group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-800 ${color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-200">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 font-mono">{sub}</div>}
      </div>
    </div>
    <div className="text-xl font-mono font-bold text-white drop-shadow-lg">{value}</div>
  </div>
);

const StatBox = ({ label, value, icon: Icon, color }) => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-lg border border-slate-800 text-center hover:scale-105 transition-all duration-200 hover:border-slate-700 shadow-lg group">
    {Icon && <Icon size={20} className={`${color} mx-auto mb-2 drop-shadow-glow group-hover:scale-110 transition-transform duration-200`} />}
    <div className="text-2xl font-bold text-white drop-shadow-lg">{value}</div>
    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">{label}</div>
  </div>
);

const EquipSlot = ({ item, type, icon: Icon, placeholder, onClick }) => (
  <div className="relative group">
    <div 
      className={`
        w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300
        ${placeholder 
          ? 'border-slate-800 bg-slate-900/30 opacity-40' 
          : item 
            ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-purple-900/20 shadow-xl shadow-blue-900/30 hover:shadow-blue-500/50 hover:scale-110 cursor-pointer' 
            : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 hover:scale-105'
        }
      `}
      onClick={() => item && onClick && onClick(item, type)}
    >
      {item ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
          <Icon size={28} className={`relative z-10 drop-shadow-glow ${item.rarity === 'legendary' ? 'text-orange-400' : item.rarity === 'rare' ? 'text-blue-400' : 'text-slate-200'}`} />
          {item.rarity === 'legendary' && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 animate-pulse"></div>
          )}
        </>
      ) : (
        <Icon size={28} className="opacity-30" />
      )}
    </div>
    {!placeholder && (
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
        {type}
      </div>
    )}
    {item && (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-slate-900 shadow-lg shadow-green-500/50 animate-pulse"></div>
    )}
  </div>
);

// --- КОМПОНЕНТ СОЗДАНИЯ ПЕРСОНАЖА ---

const CharacterCreation = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(PLAYER_CLASSES[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS_DB[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete({
      name,
      classId: selectedClass.id,
      className: selectedClass.name,
      avatarId: selectedAvatar.id,
      customAvatar: null, // Своя аватарка с устройства
      ...selectedClass.baseStats,
      maxHp: selectedClass.baseStats.hp,
      maxEnergy: selectedClass.baseStats.energy,
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 0,
      bankGold: 0, // Золото в банке
      diamonds: 0, // Премиум валюта
      locationId: 1,
      inventory: [],
      equipment: { weapon: null, armor: null },
      activeQuests: [],
      completedQuests: [],
      // Статистика и коллекции
      totalSteps: 0,
      totalKills: 0,
      totalDungeonsCompleted: 0,
      totalChestsOpened: 0,
      questsCompletedCount: 0,
      collectedAvatars: [selectedAvatar.id],
      // НОВЫЕ ПОЛЯ: Рамки аватаров
      avatarFrameId: 1, // Базовая рамка по умолчанию
      collectedFrames: [1], // Базовая рамка доступна сразу
      // НОВЫЕ ПОЛЯ: Профессия
      profession: null,
      professionLevel: 0,
      professionExp: 0,
      professionMaxExp: 100,
      // НОВЫЕ ПОЛЯ: Ресурсы
      resources: {},
      totalCrafts: 0,
      // НОВЫЕ ПОЛЯ: Гильдия
      guildId: null,
      guildRole: null,
      guildContribution: 0,
      guildChatMessages: [],
      guildQuests: [],
      guildQuestsCompleted: [],
      // НОВЫЕ ПОЛЯ: Достижения
      achievements: [],
      unclaimedAchievements: [],
      // НОВЫЕ ПОЛЯ: Друзья
      friends: [],
      friendRequests: [],
      sentRequests: [],
      blockedPlayers: [],
      friendStats: {
        totalFriends: 0,
        giftsReceived: 0,
        giftsSent: 0,
        coopQuestsCompleted: 0,
        tradesCompleted: 0
      },
      chatHistory: {},
      activeParty: null,
      activeTrade: null,
      createdAt: Date.now(),
      // НОВЫЕ ПОЛЯ: Перки
      perks: [], // Массив ID перков
      // НОВЫЕ ПОЛЯ: Наставничество
      isMentor: false,
      students: [],
      totalStudents: 0,
      mentorId: null,
      mentorName: null,
      // НОВЫЕ ПОЛЯ: Фракции
      factionReputation: initializeFactionReputation(),
      completedFactionQuests: [],
      dailyFactionQuests: FACTION_QUESTS
        .filter(q => q.isDaily)
        .map(q => ({
          questId: q.id,
          factionId: q.factionId,
          completedToday: false
        })),
      lastDailyReset: Date.now(),
      mentorLevel: null,
      mentorProgress: 0,
      // НОВЫЕ ПОЛЯ: PvP Арена
      pvpRating: 1000,
      pvpWins: 0,
      pvpLosses: 0,
      pvpWinStreak: 0,
      pvpBestStreak: 0,
      // НОВЫЕ ПОЛЯ: Премиум статус
      hasPremium: false,
      // НОВЫЕ ПОЛЯ: Питомцы
      pets: [], // Массив питомцев { id, petId, name, level, exp, maxExp, hunger, lastFed }
      activePet: null, // ID активного питомца
      petFood: { // Количество еды для питомцев
        basic_food: 0,
        quality_food: 0,
        premium_food: 0,
        legendary_food: 0
      },
      // НОВЫЕ ПОЛЯ: Система свадеб
      isMarried: false,
      partnerId: null,
      partnerName: null,
      weddingDate: null,
      weddingVenue: null,
      weddingRing: null,
      relationshipPoints: {}, // { playerId: points }
      marriageProposals: [],
      sentProposals: [],
      hasRing: false,
      purchasedRing: null,
      sharedBank: { gold: 0, items: [] },
      lastTeleport: null,
      anniversariesClaimed: [],
      marriageBonuses: { expBonus: 0, goldBonus: 0, luckBonus: 0 },
      // НОВЫЕ ПОЛЯ: Система рекрутинга
      referralCode: Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      referralTier: 'Bronze',
      referees: [],
      referralStats: { totalReferees: 0, totalExpEarned: 0, totalGoldEarned: 0, combinedLevel: 0 },
      referralAchievements: [],
      tiersRewarded: ['Bronze'],
      // НОВЫЕ ПОЛЯ: Улучшения дома
      homeUpgrades: {
        storageExpansion: 0, // Уровень расширения хранилища (0-5)
        alchemyLab: 0, // Уровень алхимической лаборатории (0-3)
        trainingDummy: 0 // Уровень тренировочного манекена (0-3)
      }
    });
  };

  const AvatarIcon = selectedAvatar.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Epic Title */}
        <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 mb-4 drop-shadow-2xl">
            Создание Героя
          </h1>
          <p className="text-xl text-slate-400 font-medium">Начните свое эпическое приключение</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
            <Sparkles className="text-blue-400" size={20} />
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Character Preview */}
          <div className="order-2 lg:order-1 animate-in slide-in-from-left-8 duration-700">
            <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-slate-700/50 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Avatar Display */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                    <div className={`relative w-40 h-40 rounded-3xl ${selectedAvatar.color} flex items-center justify-center border-4 border-white/20 shadow-2xl transform hover:scale-105 transition-transform`}>
                      <AvatarIcon size={80} className="text-white drop-shadow-2xl" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-full border-2 border-white/20 shadow-xl">
                      <span className="text-white font-black text-sm uppercase tracking-wider">Уровень 1</span>
                    </div>
                  </div>
                </div>

                {/* Character Name */}
                <div className="text-center mb-8 mt-8">
                  <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {name || 'Безымянный Герой'}
                  </h2>
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2 rounded-full">
                    <span className="text-white font-bold uppercase tracking-widest text-sm">{selectedClass.name}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 p-5 rounded-2xl border-2 border-red-500/30 hover:border-red-500/60 transition-all hover:scale-105 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <Heart size={20} className="text-white" />
                      </div>
                      <div className="text-xs text-red-300 uppercase font-bold tracking-wider">Здоровье</div>
                    </div>
                    <div className="text-3xl font-black text-white">{selectedClass.baseStats.hp}</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-950/50 p-5 rounded-2xl border-2 border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:scale-105 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Zap size={20} className="text-white" />
                      </div>
                      <div className="text-xs text-yellow-300 uppercase font-bold tracking-wider">Энергия</div>
                    </div>
                    <div className="text-3xl font-black text-white">{selectedClass.baseStats.energy}</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 p-5 rounded-2xl border-2 border-orange-500/30 hover:border-orange-500/60 transition-all hover:scale-105 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Sword size={20} className="text-white" />
                      </div>
                      <div className="text-xs text-orange-300 uppercase font-bold tracking-wider">Сила</div>
                    </div>
                    <div className="text-3xl font-black text-white">{selectedClass.baseStats.str}</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 p-5 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500/60 transition-all hover:scale-105 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div className="text-xs text-blue-300 uppercase font-bold tracking-wider">Защита</div>
                    </div>
                    <div className="text-3xl font-black text-white">{selectedClass.baseStats.def}</div>
                  </div>
                </div>

                {/* Class Description */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedClass.desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Customization */}
          <div className="order-1 lg:order-2 animate-in slide-in-from-right-8 duration-700 delay-150">
            <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-slate-700/50 shadow-2xl space-y-6 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-black text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-blue-400" />
                    Имя Героя
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите имя вашего героя..."
                    maxLength={20}
                    className="w-full bg-slate-900/80 border-2 border-slate-700 focus:border-blue-500 rounded-xl p-4 text-white text-lg font-bold placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-lg"
                  />
                  <div className="text-xs text-slate-500 mt-2">{name.length}/20 символов</div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-black text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} className="text-purple-400" />
                    Выберите Аватар
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATARS_DB.slice(0, 10).map(av => {
                      const AvIcon = av.icon;
                      return (
                        <button
                          key={av.id}
                          onClick={() => setSelectedAvatar(av)}
                          className={`aspect-square rounded-xl flex items-center justify-center transition-all transform ${
                            selectedAvatar.id === av.id 
                              ? 'ring-4 ring-white scale-110 shadow-2xl' 
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          } ${av.color} shadow-lg`}
                        >
                          <AvIcon className="text-white" size={28} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-black text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Swords size={16} className="text-orange-400" />
                    Выберите Класс
                  </label>
                  <div className="space-y-3">
                    {PLAYER_CLASSES.map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                          selectedClass.id === cls.id 
                            ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500 shadow-lg shadow-blue-500/50' 
                            : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-black text-xl text-white">{cls.name}</div>
                          {selectedClass.id === cls.id && (
                            <CheckCircle size={24} className="text-blue-400" />
                          )}
                        </div>
                        <div className="text-sm text-slate-400 mb-3">{cls.desc}</div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/30">
                            ❤️ {cls.baseStats.hp}
                          </span>
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">
                            ⚡ {cls.baseStats.energy}
                          </span>
                          <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                            ⚔️ {cls.baseStats.str}
                          </span>
                          <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                            🛡️ {cls.baseStats.def}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className={`w-full py-5 px-6 rounded-xl font-black text-xl transition-all transform shadow-2xl flex items-center justify-center gap-3 ${
                    !name.trim()
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-500 hover:via-cyan-500 hover:to-purple-500 text-white hover:scale-105 active:scale-95 shadow-blue-500/50 animate-pulse'
                  }`}
                >
                  <Sparkles size={24} />
                  Начать Приключение
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- РЕЙТИНГОВАЯ ТАБЛИЦА (MOCK DATA) ---

const LEADERBOARD_PLAYERS = [
  { id: 1, name: 'Артур Великий', level: 50, gold: 150000, kills: 2500, pvpRating: 3500, avatarId: 7, classId: 'warrior' },
  { id: 2, name: 'Мерлин Мудрый', level: 48, gold: 180000, kills: 1800, pvpRating: 3200, avatarId: 4, classId: 'warrior' },
  { id: 3, name: 'Ланселот Храбрый', level: 47, gold: 120000, kills: 3200, pvpRating: 3400, avatarId: 2, classId: 'warrior' },
  { id: 4, name: 'Гвиневра Прекрасная', level: 45, gold: 200000, kills: 1500, pvpRating: 2900, avatarId: 6, classId: 'rogue' },
  { id: 5, name: 'Галахад Чистый', level: 44, gold: 95000, kills: 2800, pvpRating: 3100, avatarId: 3, classId: 'guardian' },
  { id: 6, name: 'Моргана Темная', level: 43, gold: 160000, kills: 2200, pvpRating: 3000, avatarId: 9, classId: 'rogue' },
  { id: 7, name: 'Персиваль Отважный', level: 42, gold: 110000, kills: 2600, pvpRating: 2800, avatarId: 2, classId: 'warrior' },
  { id: 8, name: 'Тристан Верный', level: 41, gold: 140000, kills: 2100, pvpRating: 2700, avatarId: 5, classId: 'rogue' },
  { id: 9, name: 'Изольда Прекрасная', level: 40, gold: 175000, kills: 1600, pvpRating: 2600, avatarId: 15, classId: 'rogue' },
  { id: 10, name: 'Бедивер Верный', level: 39, gold: 105000, kills: 2400, pvpRating: 2500, avatarId: 3, classId: 'guardian' },
  { id: 11, name: 'Кей Сенешаль', level: 38, gold: 130000, kills: 2000, pvpRating: 2400, avatarId: 2, classId: 'warrior' },
  { id: 12, name: 'Гарет Молодой', level: 37, gold: 98000, kills: 2300, pvpRating: 2300, avatarId: 8, classId: 'warrior' },
  { id: 13, name: 'Гавейн Солнечный', level: 36, gold: 115000, kills: 1900, pvpRating: 2200, avatarId: 2, classId: 'warrior' },
  { id: 14, name: 'Элейн Белая', level: 35, gold: 155000, kills: 1400, pvpRating: 2100, avatarId: 6, classId: 'rogue' },
  { id: 15, name: 'Вивиана Озерная', level: 34, gold: 125000, kills: 1700, pvpRating: 2000, avatarId: 4, classId: 'rogue' },
  { id: 16, name: 'Утер Пендрагон', level: 33, gold: 145000, kills: 2100, pvpRating: 1900, avatarId: 7, classId: 'warrior' },
  { id: 17, name: 'Игрейна Прекрасная', level: 32, gold: 108000, kills: 1500, pvpRating: 1800, avatarId: 6, classId: 'rogue' },
  { id: 18, name: 'Модред Предатель', level: 31, gold: 135000, kills: 2500, pvpRating: 1700, avatarId: 12, classId: 'rogue' },
  { id: 19, name: 'Агравейн Гордый', level: 30, gold: 92000, kills: 1800, pvpRating: 1600, avatarId: 2, classId: 'warrior' },
  { id: 20, name: 'Борс Храбрый', level: 29, gold: 118000, kills: 2000, pvpRating: 1500, avatarId: 3, classId: 'guardian' }
];

// --- АУКЦИОН ---

// Моковые данные аукциона (в реальной игре это будет база данных)
const MOCK_AUCTION_LISTINGS = [
  {
    id: 1,
    sellerId: 2,
    sellerName: 'Мерлин Мудрый',
    item: { ...ITEMS_DB.find(i => i.id === 15), uid: 'auction_1', level: 0 }, // Клинок теней
    startPrice: 2000,
    currentBid: 2500,
    buyoutPrice: 4000,
    timeLeft: 7200000, // 2 часа в миллисекундах
    bids: [
      { bidderId: 5, bidderName: 'Ланселот Отважный', amount: 2500, timestamp: Date.now() - 300000 }
    ],
    createdAt: Date.now() - 3600000
  },
  {
    id: 2,
    sellerId: 8,
    sellerName: 'Тристан Верный',
    item: { ...ITEMS_DB.find(i => i.id === 22), uid: 'auction_2', level: 0 }, // Драконья чешуя
    startPrice: 3000,
    currentBid: 3000,
    buyoutPrice: 5000,
    timeLeft: 10800000, // 3 часа
    bids: [
      { bidderId: 3, bidderName: 'Галахад Чистый', amount: 3000, timestamp: Date.now() - 600000 }
    ],
    createdAt: Date.now() - 1800000
  },
  {
    id: 3,
    sellerId: 12,
    sellerName: 'Персиваль Искатель',
    item: { ...ITEMS_DB.find(i => i.id === 14), uid: 'auction_3', level: 0 }, // Посох мага
    startPrice: 1000,
    currentBid: 1000,
    buyoutPrice: 2000,
    timeLeft: 3600000, // 1 час
    bids: [
      { bidderId: 4, bidderName: 'Гавейн Солнечный', amount: 1000, timestamp: Date.now() - 900000 }
    ],
    createdAt: Date.now() - 5400000
  },
  {
    id: 4,
    sellerId: 15,
    sellerName: 'Кей Сенешаль',
    item: { ...ITEMS_DB.find(i => i.id === 25), uid: 'auction_4', level: 0 }, // Большое зелье здоровья
    startPrice: 30,
    currentBid: 30,
    buyoutPrice: 60,
    timeLeft: 1800000, // 30 минут
    bids: [],
    createdAt: Date.now() - 7200000
  },
  {
    id: 5,
    sellerId: 7,
    sellerName: 'Бедивер Одноручный',
    item: { ...ITEMS_DB.find(i => i.id === 20), uid: 'auction_5', level: 0 }, // Мифриловая броня
    startPrice: 600,
    currentBid: 750,
    buyoutPrice: 1000,
    timeLeft: 5400000, // 1.5 часа
    bids: [
      { bidderId: 9, bidderName: 'Гарет Вежливый', amount: 650, timestamp: Date.now() - 1200000 },
      { bidderId: 11, bidderName: 'Мордред Темный', amount: 750, timestamp: Date.now() - 600000 }
    ],
    createdAt: Date.now() - 2700000
  }
];

const AUCTION_COMMISSION = 0.05; // 5% комиссия с продажи

// --- БИРЖА РЕСУРСОВ ---

// Базовые цены ресурсов
const BASE_RESOURCE_PRICES = {
  iron_ore: 5,
  gold_ore: 15,
  wood: 3,
  red_herb: 4,
  blue_herb: 8,
  crystal: 20,
  water: 2,
  ancient_stone: 12,
  ice_crystal: 25,
  mithril_ore: 40,
  frozen_herb: 10,
  dark_wood: 8,
  shadow_herb: 18,
  spider_silk: 15,
  dragon_scale: 100,
  dragon_bone: 80,
  fire_crystal: 50,
  pearl: 30,
  coral: 12,
  sea_crystal: 60,
  sky_crystal: 120,
  cloud_essence: 35,
  wind_stone: 70,
  hell_fire: 150,
  demon_horn: 90,
  soul_stone: 130,
  fish_common: 5,
  fish_rare: 25,
  fish_legendary: 100,
  berries: 3,
  mushrooms: 6,
  rare_flower: 20
};

// Инициализация цен с небольшими колебаниями
const initializeResourcePrices = () => {
  const prices = {};
  const priceHistory = {};
  
  Object.keys(BASE_RESOURCE_PRICES).forEach(resourceId => {
    const basePrice = BASE_RESOURCE_PRICES[resourceId];
    const variation = 0.8 + Math.random() * 0.4; // ±20% от базовой цены
    prices[resourceId] = Math.floor(basePrice * variation);
    
    // История цен за последние 10 обновлений
    priceHistory[resourceId] = Array(10).fill(0).map(() => 
      Math.floor(basePrice * (0.8 + Math.random() * 0.4))
    );
  });
  
  return { prices, priceHistory };
};

// --- КЛАНВАРЫ (GUILD WARS) ---

// Территории для захвата
const TERRITORIES = [
  {
    id: 1,
    name: 'Зеленые Равнины',
    description: 'Плодородные земли с богатыми ресурсами',
    bonus: { type: 'resources', value: 20, label: '+20% к добыче ресурсов' },
    difficulty: 1,
    requiredPower: 1000,
    icon: MapIcon
  },
  {
    id: 2,
    name: 'Золотые Рудники',
    description: 'Древние шахты, полные драгоценностей',
    bonus: { type: 'gold', value: 25, label: '+25% к золоту' },
    difficulty: 2,
    requiredPower: 2000,
    icon: Coins
  },
  {
    id: 3,
    name: 'Башня Магов',
    description: 'Источник магической силы',
    bonus: { type: 'exp', value: 30, label: '+30% к опыту' },
    difficulty: 3,
    requiredPower: 3000,
    icon: Sparkles
  },
  {
    id: 4,
    name: 'Кузница Титанов',
    description: 'Легендарная кузница для создания артефактов',
    bonus: { type: 'craft', value: 50, label: '+50% к качеству крафта' },
    difficulty: 4,
    requiredPower: 5000,
    icon: Hammer
  },
  {
    id: 5,
    name: 'Драконье Гнездо',
    description: 'Логово древних драконов с несметными сокровищами',
    bonus: { type: 'all', value: 15, label: '+15% ко всем наградам' },
    difficulty: 5,
    requiredPower: 8000,
    icon: Flame
  }
];

// Моковые данные других гильдий для кланваров
const MOCK_ENEMY_GUILDS = [
  {
    id: 'guild_2',
    name: 'Стальные Волки',
    level: 3,
    memberCount: 8,
    totalPower: 2500,
    territories: [1],
    leader: 'Серый Вожак'
  },
  {
    id: 'guild_3',
    name: 'Огненные Драконы',
    level: 5,
    memberCount: 12,
    totalPower: 4500,
    territories: [2, 3],
    leader: 'Пламенный Король'
  },
  {
    id: 'guild_4',
    name: 'Теневые Убийцы',
    level: 4,
    memberCount: 10,
    totalPower: 3800,
    territories: [4],
    leader: 'Мастер Теней'
  },
  {
    id: 'guild_5',
    name: 'Небесные Стражи',
    level: 6,
    memberCount: 15,
    totalPower: 6000,
    territories: [5],
    leader: 'Архангел'
  }
];

// --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---

export default function App() {
  const [gameStage, setGameStage] = useState('creation'); 
  const [player, setPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [collectionTab, setCollectionTab] = useState('avatars'); // Sub-tab for Collections
  const [achievementCategory, setAchievementCategory] = useState('all'); // Category filter for Achievements
  const [guildTab, setGuildTab] = useState('info'); // Sub-tab for Guild (info, members, quests, chat, trade)
  const [shopCategory, setShopCategory] = useState('all'); // Category filter for Shop
  const [battleMode, setBattleMode] = useState('arena'); // Battle mode: arena or dungeon
  const [combatState, setCombatState] = useState(null);
  const [dungeonState, setDungeonState] = useState(null); // Dungeon state: { dungeonId, wave, enemies, rewards }
  const [logs, setLogs] = useState([]);
  const [lastStepText, setLastStepText] = useState("Нажмите кнопку, чтобы сделать шаг...");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftingRecipe, setCraftingRecipe] = useState(null); // Текущий рецепт для анимации
  const [craftingProgress, setCraftingProgress] = useState(0); // Прогресс крафта 0-100
  const [stepCooldown, setStepCooldown] = useState(0); // Кулдаун для кнопки "Сделай шаг"
  
  // --- QUICK ACTION STATES ---
  const [showPotionsMenu, setShowPotionsMenu] = useState(false);
  const [showPartyMenu, setShowPartyMenu] = useState(false);
  const [sprintActive, setSprintActive] = useState(false);
  const [sprintDuration, setSprintDuration] = useState(0);
  
  // --- СОСТОЯНИЕ СУНДУКОВ ---
  const [openingChest, setOpeningChest] = useState(null); // { type, rewards, stage: 'opening' | 'revealing' | 'complete' }
  const [chestAnimation, setChestAnimation] = useState(false);
  
  // --- СОСТОЯНИЕ УЛУЧШЕНИЯ И ЗАЧАРОВАНИЯ ---
  const [upgradeModal, setUpgradeModal] = useState(null); // { item, type: 'upgrade' | 'enchant' }
  const [selectedEnchantment, setSelectedEnchantment] = useState(null);
  
  // --- СОСТОЯНИЕ НАСТАВНИЧЕСТВА ---
  const [mentorshipTab, setMentorshipTab] = useState('overview'); // overview, find, myStudents, myMentor
  
  // --- СОСТОЯНИЕ БОЕВЫХ ЭФФЕКТОВ ---
  const [battleEffect, setBattleEffect] = useState(null); // { type: 'hit' | 'crit' | 'dodge' | 'heal', target: 'player' | 'enemy' }
  const [levelUpEffect, setLevelUpEffect] = useState(false);
  const [rareDropEffect, setRareDropEffect] = useState(null); // { itemName, rarity }
  
  // --- СОСТОЯНИЕ PVP АРЕНЫ ---
  const [pvpOpponent, setPvpOpponent] = useState(null); // Current opponent
  const [pvpSearching, setPvpSearching] = useState(false); // Searching for opponent
  
  // --- СОСТОЯНИЕ МИРОВЫХ БОССОВ ---
  const [worldBosses, setWorldBosses] = useState(() => {
    // Инициализируем боссов с таймерами спавна
    return WORLD_BOSSES.map(boss => ({
      ...boss,
      isAlive: false,
      nextSpawn: Date.now() + boss.spawnInterval,
      participants: []
    }));
  });
  const [selectedBoss, setSelectedBoss] = useState(null); // Выбранный босс для атаки
  
  // --- СОСТОЯНИЕ РЫБАЛКИ И СОБИРАТЕЛЬСТВА ---
  const [fishingState, setFishingState] = useState(null); // { inProgress: boolean, timeLeft: number }
  const [gatheringState, setGatheringState] = useState(null); // { inProgress: boolean, timeLeft: number }
  
  // --- СОСТОЯНИЕ СЕЗОНОВ ---
  const [currentSeason, setCurrentSeason] = useState(() => {
    // Находим активный сезон
    const now = Date.now();
    const activeSeason = SEASONS.find(s => now >= s.startDate && now <= s.endDate);
    if (activeSeason) {
      return {
        ...activeSeason,
        playerLevel: 0,
        playerExp: 0,
        expToNextLevel: 100,
        tasks: activeSeason.tasks.map(t => ({ ...t, progress: 0, completed: false })),
        claimedRewards: []
      };
    }
    return null;
  });
  const [showSeasonReward, setShowSeasonReward] = useState(null); // Показ полученной награды
  
  // --- СОСТОЯНИЕ РЕЙТИНГА ---
  const [leaderboardCategory, setLeaderboardCategory] = useState('level'); // level, gold, kills, pvp
  
  // --- СОСТОЯНИЕ АУКЦИОНА ---
  const [auctionListings, setAuctionListings] = useState(MOCK_AUCTION_LISTINGS);
  const [auctionTab, setAuctionTab] = useState('browse'); // browse, my_listings, my_bids, history
  const [auctionFilter, setAuctionFilter] = useState('all'); // all, weapon, armor, consumable
  const [selectedAuctionItem, setSelectedAuctionItem] = useState(null);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [listingItem, setListingItem] = useState(null);
  const [listingStartPrice, setListingStartPrice] = useState('');
  const [listingBuyoutPrice, setListingBuyoutPrice] = useState('');
  const [listingDuration, setListingDuration] = useState(3600000); // 1 час по умолчанию
  const [bidAmount, setBidAmount] = useState('');
  const [auctionHistory, setAuctionHistory] = useState([]); // История завершенных сделок
  
  // --- СОСТОЯНИЕ БИРЖИ РЕСУРСОВ ---
  const [resourcePrices, setResourcePrices] = useState(() => initializeResourcePrices().prices);
  const [resourcePriceHistory, setResourcePriceHistory] = useState(() => initializeResourcePrices().priceHistory);
  const [selectedResource, setSelectedResource] = useState(null);
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeMode, setExchangeMode] = useState('buy'); // buy or sell
  
  // --- СОСТОЯНИЕ КЛАНВАРОВ ---
  const [guildWars, setGuildWars] = useState([]); // Активные войны
  const [guildTerritories, setGuildTerritories] = useState({}); // { territoryId: guildId }
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [warHistory, setWarHistory] = useState([]); // История войн
  
  // --- СОСТОЯНИЕ ТОРГОВЛИ ---
  const [tradeOffer, setTradeOffer] = useState(null); // { targetMember, offeredItems: [], requestedGold: 0 }
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTradeItems, setSelectedTradeItems] = useState([]);
  
  // --- СОСТОЯНИЕ ПИТОМЦЕВ ---
  const [selectedPet, setSelectedPet] = useState(null); // Выбранный питомец для просмотра/управления
  const [showPetModal, setShowPetModal] = useState(false); // Модальное окно питомца
  const [petTab, setPetTab] = useState('collection'); // collection, active, shop
  
  // --- СОСТОЯНИЕ СЛУЧАЙНЫХ СОБЫТИЙ ---
  const [activeEvent, setActiveEvent] = useState(null); // Текущее активное событие
  const [eventCooldowns, setEventCooldowns] = useState({}); // Кулдауны событий
  const [monsterWave, setMonsterWave] = useState(0); // Текущая волна монстров
  const [merchantStock, setMerchantStock] = useState([]); // Товары торговца
  const [tradeGoldAmount, setTradeGoldAmount] = useState(0);
  
  // --- СОСТОЯНИЕ ЧАТА ---
  const [isChatOpen, setIsChatOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_is_open');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const logsEndRef = useRef(null);

  // Загрузка сохранения при монтировании
  useEffect(() => {
    const savedPlayer = loadGame();
    if (savedPlayer) {
      setPlayer(savedPlayer);
      setGameStage('playing');
      console.log('Игра загружена из сохранения');
    }
  }, []);

  // Автосохранение при изменении игрока
  useEffect(() => {
    if (player && gameStage === 'playing') {
      saveGame(player);
      setLastSaveTime(Date.now());
    }
  }, [player, gameStage]);

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!player || gameStage !== 'playing') return;
    
    const autoSaveInterval = setInterval(() => {
      saveGame(player);
      setLastSaveTime(Date.now());
      addNotification('Игра автоматически сохранена', 'success', 2000);
    }, 30000); // 30 секунд
    
    return () => clearInterval(autoSaveInterval);
  }, [player, gameStage]);

  // Сохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (player) {
        saveGame(player);
        setLastSaveTime(Date.now());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [player]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!player) return;
    const timer = setInterval(() => {
      setPlayer(p => {
        if (p.energy < p.maxEnergy && !combatState) {
          return { ...p, energy: p.energy + 1 };
        }
        return p;
      });
    }, 5000); 
    return () => clearInterval(timer);
  }, [combatState, player?.maxEnergy]);

  // Обновление статуса друзей
  useEffect(() => {
    if (!player || !player.friends || player.friends.length === 0) return;
    
    const timer = setInterval(() => {
      // Случайно меняем статус друзей
      FRIENDS_DB.forEach(friend => {
        if (Math.random() < 0.1) { // 10% шанс изменения статуса
          const statuses = ['online', 'offline', 'in_combat', 'traveling', 'in_dungeon'];
          friend.status = statuses[getRandomInt(0, statuses.length - 1)];
          if (friend.status === 'traveling') {
            friend.location = getRandomInt(1, 8);
          }
        }
      });
      
      // Форсируем обновление компонента
      setPlayer(p => ({ ...p }));
    }, 30000); // Каждые 30 секунд
    
    return () => clearInterval(timer);
  }, [player?.friends]);

  // Кулдаун для кнопки "Сделай шаг"
  useEffect(() => {
    if (stepCooldown > 0) {
      const timer = setTimeout(() => {
        setStepCooldown(stepCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stepCooldown]);
  
  // Таймер спринта
  useEffect(() => {
    if (sprintDuration > 0) {
      const timer = setTimeout(() => {
        setSprintDuration(sprintDuration - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (sprintActive && sprintDuration === 0) {
      setSprintActive(false);
      addNotification('Спринт закончился', 'info');
    }
  }, [sprintDuration, sprintActive]);

  // Таймер спавна мировых боссов
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setWorldBosses(bosses => bosses.map(boss => {
        if (!boss.isAlive && now >= boss.nextSpawn) {
          // Спавним босса
          setTimeout(() => spawnWorldBoss(boss.id), 0);
          return boss;
        }
        return boss;
      }));
    }, 10000); // Проверяем каждые 10 секунд
    
    return () => clearInterval(timer);
  }, []);

  const addLog = (text, type = 'neutral') => {
    const colors = {
      neutral: 'text-slate-400',
      good: 'text-green-400',
      bad: 'text-red-400',
      rare: 'text-yellow-400 font-bold',
      combat: 'text-orange-400',
      quest: 'text-cyan-400 font-bold',
      epic: 'text-purple-400 font-bold',
      legendary: 'text-orange-500 font-bold'
    };
    setLogs(prev => [...prev.slice(-19), { text, type: colors[type], id: Date.now() }]);
    setLastStepText(text);
  };

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random(); // Ensure unique ID
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const levelUp = (currentExp, currentMaxExp, currentLvl, classId) => {
    if (currentExp >= currentMaxExp) {
      addLog(`Поздравляем! Вы достигли уровня ${currentLvl + 1}!`, 'rare');
      addNotification(`Поздравляем! Вы достигли уровня ${currentLvl + 1}!`, 'success', 4000);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);

      const pClass = PLAYER_CLASSES.find(c => c.id === classId) || PLAYER_CLASSES[0];
      const growth = pClass.growth;
      const nextMaxExp = Math.floor(currentMaxExp * 1.5);

      return {
        lvl: currentLvl + 1,
        exp: currentExp - currentMaxExp,
        maxExp: nextMaxExp,
        stats: { 
          str: growth.str, 
          def: growth.def, 
          hp: growth.hp, 
          energy: 2 
        } 
      };
    }
    return null;
  };

  const checkQuestProgress = (type, amount = 1) => {
    if (!player || !player.activeQuests) return;

    const updatedQuests = player.activeQuests.map(q => {
      if (q.type === type && !q.isCompleted) {
        const newProgress = Math.min(q.target, q.progress + amount);
        if (newProgress >= q.target && q.progress < q.target) {
          addLog(`Квест "${q.name}" выполнен! Заберите награду.`, 'quest');
          addNotification(`Квест "${q.name}" выполнен!`, 'success', 4000);
          return { ...q, progress: newProgress, isCompleted: true };
        }
        return { ...q, progress: newProgress };
      }
      return q;
    });

    if (JSON.stringify(updatedQuests) !== JSON.stringify(player.activeQuests)) {
      setPlayer(p => ({ ...p, activeQuests: updatedQuests }));
    }
  };

  const startQuest = (questId) => {
    const quest = QUESTS_DB.find(q => q.id === questId);
    if (!quest) return;
    
    const newQuestState = {
      ...quest,
      progress: 0,
      isCompleted: false
    };

    setPlayer(p => ({
      ...p,
      activeQuests: [...(p.activeQuests || []), newQuestState]
    }));
    addLog(`Вы приняли квест: ${quest.name}`, 'quest');
  };

  const abandonQuest = (questId) => {
    const questState = player.activeQuests.find(q => q.id === questId);
    if (!questState) return;

    setPlayer(p => ({
      ...p,
      activeQuests: p.activeQuests.filter(q => q.id !== questId)
    }));
    addLog(`Вы отказались от квеста: ${questState.name}`, 'quest');
    addNotification(`Квест "${questState.name}" отменён`, 'info', 3000);
  };

  const claimQuestReward = (questId) => {
    const questState = player.activeQuests.find(q => q.id === questId);
    if (!questState || !questState.isCompleted) return;

    const newPlayer = {
      ...player,
      gold: player.gold + questState.gold,
      exp: player.exp + questState.exp,
      activeQuests: player.activeQuests.filter(q => q.id !== questId),
      completedQuests: [...(player.completedQuests || []), questId],
      questsCompletedCount: (player.questsCompletedCount || 0) + 1
    };

    // Add item reward if quest has one
    if (questState.itemReward) {
      const rewardItem = ITEMS_DB.find(item => item.id === questState.itemReward.id);
      if (rewardItem) {
        newPlayer.inventory = [...newPlayer.inventory, { ...rewardItem, uid: Date.now() }];
        addLog(`Награда получена: ${questState.gold} золота, ${questState.exp} опыта и ${rewardItem.name}!`, 'quest');
        addNotification(`Награда получена: ${questState.gold} золота, ${questState.exp} опыта и ${rewardItem.name}!`, 'success');
      }
    } else {
      addLog(`Награда получена: ${questState.gold} золота и ${questState.exp} опыта!`, 'quest');
      addNotification(`Награда получена: ${questState.gold} золота и ${questState.exp} опыта!`, 'success');
    }

    const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
    if (lvlCheck) {
       newPlayer.level = lvlCheck.lvl;
       newPlayer.exp = lvlCheck.exp;
       newPlayer.maxExp = lvlCheck.maxExp;
       newPlayer.str += lvlCheck.stats.str;
       newPlayer.def += lvlCheck.stats.def;
       newPlayer.maxHp += lvlCheck.stats.hp;
       newPlayer.hp = newPlayer.maxHp; 
       newPlayer.maxEnergy += lvlCheck.stats.energy;
       newPlayer.energy = newPlayer.maxEnergy; 
    }

    setPlayer(newPlayer);
    
    // Проверяем достижения после завершения квеста
    setTimeout(() => checkAchievements(), 100);
  };

  // --- МЕХАНИКА: КОЛЛЕКЦИИ ---

  const buyAvatarChest = () => {
    const COST = 500;
    if (player.gold < COST) {
      addLog("Недостаточно золота для покупки сундука!", 'bad');
      return;
    }

    // Фильтруем те, которых нет, но с шансом выпадения дубликата (для реализма, но упростим - всегда новый если есть)
    const uncollected = AVATARS_DB.filter(a => !player.collectedAvatars.includes(a.id));
    
    let newAvatarId;
    let isDuplicate = false;

    if (uncollected.length > 0 && Math.random() > 0.3) {
       // 70% шанс получить нового (если есть)
       const randomIndex = getRandomInt(0, uncollected.length - 1);
       newAvatarId = uncollected[randomIndex].id;
    } else {
       // 30% шанс получить дубликат (или любого если все собраны)
       const randomIndex = getRandomInt(0, AVATARS_DB.length - 1);
       newAvatarId = AVATARS_DB[randomIndex].id;
       if (player.collectedAvatars.includes(newAvatarId)) {
         isDuplicate = true;
       }
    }

    const rewardAvatar = AVATARS_DB.find(a => a.id === newAvatarId);

    if (isDuplicate) {
       setPlayer({ ...player, gold: player.gold - COST + 100 }); // Компенсация за дубликат
       addLog(`Вы открыли сундук... Это ${rewardAvatar.name}! У вас он уже есть. +100 золота компенсации.`, 'neutral');
    } else {
       setPlayer({ 
         ...player, 
         gold: player.gold - COST,
         collectedAvatars: [...player.collectedAvatars, newAvatarId]
       });
       addLog(`СУНДУК ОТКРЫТ! Вы получили новый аватар: ${rewardAvatar.name}!`, 'epic');
    }
  };

  const equipAvatar = (id) => {
    if (player.collectedAvatars.includes(id)) {
      setPlayer({ ...player, avatarId: id });
      addLog("Вы сменили аватар.", 'neutral');
    }
  };

  const equipRandomAvatar = () => {
    if (player.collectedAvatars.length > 0) {
      const randomId = player.collectedAvatars[getRandomInt(0, player.collectedAvatars.length - 1)];
      equipAvatar(randomId);
    }
  };

  // --- МЕХАНИКА: УПРАВЛЕНИЕ РЕСУРСАМИ ---

  const addResourceToInventory = (resourceId, amount) => {
    setPlayer(p => ({
      ...p,
      resources: {
        ...p.resources,
        [resourceId]: (p.resources[resourceId] || 0) + amount
      }
    }));
  };

  const removeResourceFromInventory = (resourceId, amount) => {
    setPlayer(p => {
      const newResources = { ...p.resources };
      newResources[resourceId] = Math.max(0, (newResources[resourceId] || 0) - amount);
      if (newResources[resourceId] === 0) {
        delete newResources[resourceId];
      }
      return { ...p, resources: newResources };
    });
  };

  const getResourceCount = (resourceId) => {
    return player.resources[resourceId] || 0;
  };

  const hasResources = (requirements) => {
    if (!player || !player.resources) return false;
    return requirements.every(req => 
      (player.resources[req.resourceId] || 0) >= req.amount
    );
  };

  // --- МЕХАНИКА: ПРОФЕССИИ ---

  const selectProfession = (professionId) => {
    if (!player) {
      addLog('Ошибка: игрок не инициализирован', 'bad');
      return;
    }
    
    const profession = PROFESSIONS.find(p => p.id === professionId);
    if (!profession) return;

    if (player.level < profession.unlockLevel) {
      addLog(`Требуется уровень ${profession.unlockLevel} для выбора этой профессии.`, 'bad');
      return;
    }

    setPlayer(p => ({
      ...p,
      profession: professionId,
      professionLevel: 1,
      professionExp: 0,
      professionMaxExp: profession.baseExp
    }));
    addLog(`Вы стали ${profession.name}!`, 'good');
  };

  const performProfessionAction = () => {
    if (!player) {
      addLog('Ошибка: игрок не инициализирован', 'bad');
      return;
    }
    
    if (!player.profession) {
      addLog('Сначала выберите профессию!', 'bad');
      return;
    }

    if (player.energy < 5) {
      addLog('Недостаточно энергии (требуется 5).', 'bad');
      return;
    }

    const profession = PROFESSIONS.find(p => p.id === player.profession);
    if (!profession) return;

    const expGain = getRandomInt(15, 30);
    const goldGain = getRandomInt(10, 25) * player.professionLevel;
    
    let newPlayer = {
      ...player,
      energy: player.energy - 5,
      gold: player.gold + goldGain,
      professionExp: player.professionExp + expGain
    };

    // Шанс получить ресурс
    if (Math.random() < 0.4) {
      const professionResources = {
        blacksmith: ['iron_ore', 'gold_ore'],
        alchemist: ['red_herb', 'blue_herb', 'water'],
        herbalist: ['red_herb', 'blue_herb', 'green_herb'],
        miner: ['iron_ore', 'gold_ore', 'crystal']
      };
      
      const possibleResources = professionResources[player.profession] || [];
      if (possibleResources.length > 0) {
        const resourceId = possibleResources[getRandomInt(0, possibleResources.length - 1)];
        newPlayer.resources = { ...newPlayer.resources };
        newPlayer.resources[resourceId] = (newPlayer.resources[resourceId] || 0) + 1;
        const resource = RESOURCES.find(r => r.id === resourceId);
        addLog(`Вы получили ${resource?.name || resourceId}!`, 'good');
      }
    }

    addLog(`Работа выполнена! +${expGain} опыта профессии, +${goldGain} золота.`, 'good');

    // Проверка повышения уровня профессии
    if (newPlayer.professionExp >= newPlayer.professionMaxExp) {
      newPlayer.professionLevel += 1;
      newPlayer.professionExp = newPlayer.professionExp - newPlayer.professionMaxExp;
      newPlayer.professionMaxExp = Math.floor(newPlayer.professionMaxExp * profession.expGrowth);
      addLog(`Уровень профессии повышен до ${newPlayer.professionLevel}!`, 'rare');
    }

    setPlayer(newPlayer);
  };

  // --- МЕХАНИКА: СВАДЬБЫ ---

  const handleBuyRing = (ring) => {
    if (player.gold < ring.cost) {
      addLog('Недостаточно золота!', 'bad');
      return;
    }
    setPlayer(p => ({
      ...p,
      gold: p.gold - ring.cost,
      hasRing: true,
      purchasedRing: ring
    }));
    addLog(`Вы купили ${ring.name}!`, 'good');
  };

  const handlePropose = (ring) => {
    // Симуляция предложения
    const accepted = Math.random() > 0.3; // 70% шанс принятия
    if (accepted) {
      const partnerName = 'Симулированный партнер';
      setPlayer(p => ({
        ...p,
        isMarried: true,
        partnerId: 'sim_partner',
        partnerName: partnerName,
        weddingDate: Date.now(),
        weddingRing: ring,
        hasRing: false,
        marriageBonuses: {
          expBonus: ring.bonuses.expBonus || 0,
          goldBonus: ring.bonuses.goldBonus || 0,
          luckBonus: ring.bonuses.luckBonus || 0
        }
      }));
      addLog(`${partnerName} принял(а) ваше предложение! Поздравляем!`, 'legendary');
    } else {
      setPlayer(p => ({ ...p, hasRing: false }));
      addLog('Предложение отклонено. Кольцо потеряно.', 'bad');
    }
  };

  const handleOrganizeWedding = (venue) => {
    if (player.gold < venue.cost) {
      addLog('Недостаточно золота!', 'bad');
      return;
    }
    setPlayer(p => ({
      ...p,
      gold: p.gold - venue.cost,
      weddingVenue: venue,
      marriageBonuses: {
        ...p.marriageBonuses,
        expBonus: (p.marriageBonuses.expBonus || 0) + 5,
        goldBonus: (p.marriageBonuses.goldBonus || 0) + 5
      }
    }));
    addLog(`Свадьба организована в ${venue.name}!`, 'legendary');
  };

  const handleGiveGift = (gift) => {
    if (player.gold < gift.cost) {
      addLog('Недостаточно золота!', 'bad');
      return;
    }
    const points = parseInt(gift.effect.match(/\d+/)[0]);
    setPlayer(p => ({
      ...p,
      gold: p.gold - gift.cost,
      relationshipPoints: {
        ...p.relationshipPoints,
        [p.partnerId]: (p.relationshipPoints[p.partnerId] || 0) + points
      }
    }));
    addLog(`Вы подарили ${gift.name}! +${points} к отношениям`, 'good');
  };

  const handleDivorce = () => {
    if (!window.confirm('Вы уверены, что хотите развестись? Все бонусы будут потеряны.')) return;
    
    const penalty = Math.floor(player.gold * 0.1);
    setPlayer(p => ({
      ...p,
      isMarried: false,
      partnerId: null,
      partnerName: null,
      weddingDate: null,
      weddingVenue: null,
      weddingRing: null,
      gold: Math.max(0, p.gold - penalty),
      marriageBonuses: { expBonus: 0, goldBonus: 0, luckBonus: 0 }
    }));
    addLog(`Вы развелись. Потеряно ${penalty} золота.`, 'bad');
  };

  // --- МЕХАНИКА: РЕКРУТИНГ ---

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleCopyReferralCode = () => {
    if (player?.referralCode) {
      navigator.clipboard?.writeText(player.referralCode);
      addLog(`Код скопирован: ${player.referralCode}`, 'neutral');
    }
  };

  const handleAddSimulatedReferee = () => {
    const names = ['Алекс', 'Мария', 'Иван', 'Елена', 'Дмитрий', 'Анна', 'Сергей', 'Ольга'];
    const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
    const level = Math.floor(Math.random() * 20) + 1;
    
    const newReferee = {
      id: 'sim_' + Date.now(),
      name: name,
      joinDate: Date.now(),
      currentLevel: level,
      isSimulated: true
    };

    setPlayer(p => {
      const newStats = {
        totalReferees: p.referralStats.totalReferees + 1,
        totalExpEarned: p.referralStats.totalExpEarned + 100,
        totalGoldEarned: p.referralStats.totalGoldEarned + 100,
        combinedLevel: p.referralStats.combinedLevel + level
      };

      // Проверка достижений
      const newAchievements = [...p.referralAchievements];
      if (newStats.totalReferees === 1 && !newAchievements.includes('first')) {
        newAchievements.push('first');
        addLog('Достижение разблокировано: Первый друг! +100 золота', 'legendary');
      }
      if (newStats.totalReferees === 5 && !newAchievements.includes('social')) {
        newAchievements.push('social');
        addLog('Достижение разблокировано: Социальная бабочка! +500 золота', 'legendary');
      }
      if (newStats.totalReferees === 10 && !newAchievements.includes('builder')) {
        newAchievements.push('builder');
        addLog('Достижение разблокировано: Строитель сообщества! +1500 золота', 'legendary');
      }

      // Проверка уровня
      let newTier = p.referralTier;
      if (newStats.totalReferees >= 5 && newStats.combinedLevel >= 25 && newTier === 'Bronze') {
        newTier = 'Silver';
        addLog('Повышение уровня рекрутинга: Silver! +1000 золота, +500 опыта', 'legendary');
      }
      if (newStats.totalReferees >= 10 && newStats.combinedLevel >= 100 && newTier === 'Silver') {
        newTier = 'Gold';
        addLog('Повышение уровня рекрутинга: Gold! +5000 золота, +2500 опыта', 'legendary');
      }

      return {
        ...p,
        referees: [...p.referees, newReferee],
        referralStats: newStats,
        referralAchievements: newAchievements,
        referralTier: newTier,
        gold: p.gold + 100,
        exp: p.exp + 100
      };
    });

    addLog(`Новый друг присоединился: ${name} (Ур. ${level})! +100 золота, +100 опыта`, 'good');
  };

  // --- МЕХАНИКА: УЛУЧШЕНИЯ ДОМА ---

  const UPGRADES = {
    storageExpansion: [
      { level: 1, cost: 500, bonus: 20, desc: '+20 слотов хранилища' },
      { level: 2, cost: 1000, bonus: 20, desc: '+20 слотов хранилища' },
      { level: 3, cost: 2000, bonus: 20, desc: '+20 слотов хранилища' },
      { level: 4, cost: 4000, bonus: 20, desc: '+20 слотов хранилища' },
      { level: 5, cost: 8000, bonus: 20, desc: '+20 слотов хранилища' }
    ],
    alchemyLab: [
      { level: 1, cost: 1000, bonus: 25, desc: 'Ускоряет крафт зелий на 25%' },
      { level: 2, cost: 2500, bonus: 25, desc: 'Ускоряет крафт зелий на 50%' },
      { level: 3, cost: 5000, bonus: 25, desc: 'Ускоряет крафт зелий на 75%' }
    ],
    trainingDummy: [
      { level: 1, cost: 750, bonus: 5, desc: '+5% опыта от боев' },
      { level: 2, cost: 2000, bonus: 5, desc: '+10% опыта от боев' },
      { level: 3, cost: 4000, bonus: 5, desc: '+15% опыта от боев' }
    ]
  };

  const handleUpgradeHome = (upgradeType) => {
    const currentLevel = player.homeUpgrades[upgradeType];
    const upgrade = UPGRADES[upgradeType][currentLevel];
    
    if (!upgrade) {
      addLog('Максимальный уровень улучшения!', 'neutral');
      return;
    }

    if (player.gold < upgrade.cost) {
      addLog('Недостаточно золота!', 'bad');
      return;
    }

    setPlayer(p => ({
      ...p,
      gold: p.gold - upgrade.cost,
      homeUpgrades: {
        ...p.homeUpgrades,
        [upgradeType]: currentLevel + 1
      }
    }));

    const names = {
      storageExpansion: 'Расширение хранилища',
      alchemyLab: 'Алхимическая лаборатория',
      trainingDummy: 'Тренировочный манекен'
    };

    addLog(`${names[upgradeType]} улучшено до уровня ${currentLevel + 1}!`, 'legendary');
  };

  // --- МЕХАНИКА: КРАФТ ---

  const getAvailableRecipes = useMemo(() => {
    if (!player || !player.profession) return [];
    return RECIPES.filter(r => 
      r.profession === player.profession && 
      r.requiredLevel <= player.professionLevel
    );
  }, [player?.profession, player?.professionLevel]);

  const canCraft = useCallback((recipe) => {
    if (!player) return false;
    return hasResources(recipe.ingredients);
  }, [player?.resources]);

  const craftItem = (recipe) => {
    if (!player) {
      addLog('Ошибка: игрок не инициализирован', 'bad');
      return;
    }
    
    if (!canCraft(recipe)) {
      addLog('Недостаточно ресурсов для крафта!', 'bad');
      addNotification('Недостаточно ресурсов для крафта!', 'error');
      return;
    }

    // Show crafting animation
    setIsCrafting(true);
    setCraftingRecipe(recipe);
    setCraftingProgress(0);
    addNotification(`Создание ${recipe.name}...`, 'info', 2000);

    // Анимация прогресса
    const craftTime = recipe.craftTime || 2000;
    const progressInterval = 50; // Обновление каждые 50мс
    const progressStep = (100 / craftTime) * progressInterval;
    
    const progressTimer = setInterval(() => {
      setCraftingProgress(prev => {
        const newProgress = prev + progressStep;
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return newProgress;
      });
    }, progressInterval);

    // Simulate crafting time
    setTimeout(() => {
      clearInterval(progressTimer);
      
      // Удаляем ресурсы
      let newResources = { ...player.resources };
      recipe.ingredients.forEach(ing => {
        newResources[ing.resourceId] = (newResources[ing.resourceId] || 0) - ing.amount;
        if (newResources[ing.resourceId] <= 0) {
          delete newResources[ing.resourceId];
        }
      });

      // Добавляем предмет
      const craftedItem = {
        ...recipe.result,
        uid: Date.now()
      };

      let newPlayer = {
        ...player,
        resources: newResources,
        inventory: [...player.inventory, craftedItem],
        professionExp: player.professionExp + recipe.expReward,
        totalCrafts: (player.totalCrafts || 0) + 1
      };

      addLog(`Вы создали ${recipe.result.name}!`, 'good');
      addNotification(`✨ Создан предмет: ${recipe.result.name}!`, 'success');

      // Проверка повышения уровня профессии
      const profession = PROFESSIONS.find(p => p.id === player.profession);
      if (profession && newPlayer.professionExp >= newPlayer.professionMaxExp) {
        newPlayer.professionLevel += 1;
        newPlayer.professionExp = newPlayer.professionExp - newPlayer.professionMaxExp;
        newPlayer.professionMaxExp = Math.floor(newPlayer.professionMaxExp * profession.expGrowth);
        addLog(`Уровень профессии повышен до ${newPlayer.professionLevel}!`, 'rare');
        addNotification(`🎉 Уровень профессии повышен до ${newPlayer.professionLevel}!`, 'legendary');
      }

      setPlayer(newPlayer);
      
      // Задержка перед закрытием модального окна
      setTimeout(() => {
        setIsCrafting(false);
        setCraftingRecipe(null);
        setCraftingProgress(0);
      }, 1000);
      
      // Проверяем достижения после крафта
      setTimeout(() => checkAchievements(), 100);
    }, craftTime);
  };

  // --- МЕХАНИКА: ГИЛЬДИИ ---

  const createGuild = (guildName) => {
    if (!player) {
      addLog('Ошибка: игрок не инициализирован', 'bad');
      return;
    }
    
    if (player.gold < 1000) {
      addLog('Недостаточно золота для создания гильдии (требуется 1000).', 'bad');
      return;
    }

    if (player.guildId) {
      addLog('Вы уже состоите в гильдии!', 'bad');
      return;
    }

    // В реальном приложении это создавало бы гильдию на сервере
    // Для демонстрации просто присоединяем к случайной гильдии
    const randomGuild = GUILDS[getRandomInt(0, GUILDS.length - 1)];
    
    setPlayer(p => ({
      ...p,
      gold: p.gold - 1000,
      guildId: randomGuild.id,
      guildRole: 'leader',
      guildContribution: 0
    }));

    addLog(`Гильдия "${guildName}" создана! (Демо: присоединены к ${randomGuild.name})`, 'good');
    
    // Проверяем достижения после создания гильдии
    setTimeout(() => checkAchievements(), 100);
  };

  const joinGuild = (guildId) => {
    if (!player) {
      addLog('Ошибка: игрок не инициализирован', 'bad');
      return;
    }
    
    if (player.guildId) {
      addLog('Вы уже состоите в гильдии!', 'bad');
      return;
    }

    setPlayer(p => ({
      ...p,
      guildId: guildId,
      guildRole: 'member',
      guildContribution: 0
    }));

    const guild = GUILDS.find(g => g.id === guildId);
    addLog(`Вы вступили в гильдию "${guild?.name}"!`, 'good');
    
    // Проверяем достижения после вступления в гильдию
    setTimeout(() => checkAchievements(), 100);
  };

  const leaveGuild = () => {
    setPlayer(p => ({
      ...p,
      guildId: null,
      guildRole: null,
      guildContribution: 0
    }));
    addLog('Вы покинули гильдию.', 'neutral');
  };

  const applyGuildBonuses = (baseGold, baseExp) => {
    if (!player.guildId) return { gold: baseGold, exp: baseExp };

    const guild = GUILDS.find(g => g.id === player.guildId);
    if (!guild) return { gold: baseGold, exp: baseExp };

    const gold = Math.floor(baseGold * (1 + guild.bonuses.goldBonus / 100));
    const exp = Math.floor(baseExp * (1 + guild.bonuses.expBonus / 100));

    return { gold, exp };
  };

  // Отправить сообщение в чат гильдии
  const sendGuildMessage = (message) => {
    if (!player.guildId || !message.trim()) return;

    const newMessage = {
      id: Date.now(),
      playerId: 'player',
      playerName: player.name,
      message: message.trim(),
      timestamp: Date.now()
    };

    setPlayer(p => ({
      ...p,
      guildChatMessages: [...(p.guildChatMessages || []), newMessage]
    }));

    addLog('Сообщение отправлено в чат гильдии.', 'good');
  };

  // Начать гильдейский квест
  const startGuildQuest = (questId) => {
    if (!player.guildId) {
      addLog('Вы не состоите в гильдии!', 'bad');
      return;
    }

    const quest = GUILD_QUESTS.find(q => q.id === questId);
    if (!quest) return;

    if (player.guildQuests?.some(q => q.id === questId)) {
      addLog('Этот квест уже активен!', 'bad');
      return;
    }

    if (player.guildQuestsCompleted?.includes(questId)) {
      addLog('Этот квест уже выполнен!', 'bad');
      return;
    }

    const newQuest = {
      ...quest,
      progress: 0,
      startedAt: Date.now()
    };

    setPlayer(p => ({
      ...p,
      guildQuests: [...(p.guildQuests || []), newQuest]
    }));

    addLog(`Начат гильдейский квест: ${quest.name}`, 'good');
  };

  // Обновить прогресс гильдейского квеста
  const updateGuildQuestProgress = (questType, amount = 1) => {
    if (!player.guildId || !player.guildQuests) return;

    setPlayer(p => {
      const updatedQuests = p.guildQuests.map(quest => {
        if (quest.type === questType && quest.progress < quest.target) {
          const newProgress = Math.min(quest.progress + amount, quest.target);
          return { ...quest, progress: newProgress };
        }
        return quest;
      });

      return { ...p, guildQuests: updatedQuests };
    });
  };

  // Завершить гильдейский квест
  const completeGuildQuest = (questId) => {
    const quest = player.guildQuests?.find(q => q.id === questId);
    if (!quest || quest.progress < quest.target) return;

    const { gold: rewardGold, exp: rewardExp, itemReward } = quest.reward;

    setPlayer(p => ({
      ...p,
      gold: p.gold + rewardGold,
      exp: p.exp + rewardExp,
      guildQuests: p.guildQuests.filter(q => q.id !== questId),
      guildQuestsCompleted: [...(p.guildQuestsCompleted || []), questId],
      guildContribution: p.guildContribution + rewardGold,
      inventory: itemReward ? [...p.inventory, { ...ITEMS_DB.find(i => i.id === itemReward.id), uid: Date.now() }] : p.inventory
    }));

    addLog(`Гильдейский квест "${quest.name}" выполнен! +${rewardGold} золота, +${rewardExp} опыта`, 'legendary');
    if (itemReward) {
      addLog(`Получен предмет: ${itemReward.name}`, 'legendary');
    }

    setTimeout(() => checkLevelUp(), 100);
  };

  // Внести вклад в гильдию
  const contributeToGuild = (amount) => {
    if (!player.guildId) {
      addLog('Вы не состоите в гильдии!', 'bad');
      return;
    }

    if (player.gold < amount) {
      addLog('Недостаточно золота!', 'bad');
      return;
    }

    setPlayer(p => ({
      ...p,
      gold: p.gold - amount,
      guildContribution: p.guildContribution + amount
    }));

    addLog(`Вы внесли ${amount} золота в казну гильдии.`, 'good');
  };

  // --- МЕХАНИКА: ТОРГОВЛЯ В ГИЛЬДИИ ---

  const openTradeWithMember = (member) => {
    if (!player.guildId) {
      addLog('Вы не состоите в гильдии!', 'bad');
      return;
    }

    setTradeOffer({
      targetMember: member,
      offeredItems: [],
      requestedGold: 0
    });
    setSelectedTradeItems([]);
    setTradeGoldAmount(0);
    setShowTradeModal(true);
  };

  const toggleTradeItem = (item) => {
    setSelectedTradeItems(prev => {
      const exists = prev.find(i => i.uid === item.uid);
      if (exists) {
        return prev.filter(i => i.uid !== item.uid);
      } else {
        return [...prev, item];
      }
    });
  };

  const sendTradeOffer = () => {
    if (!tradeOffer || selectedTradeItems.length === 0) {
      addNotification('Выберите хотя бы один предмет для обмена', 'error');
      return;
    }

    // В реальном приложении это отправило бы предложение на сервер
    // Для демонстрации симулируем принятие сделки
    const totalValue = selectedTradeItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const offerGold = tradeGoldAmount || Math.floor(totalValue * 0.7); // 70% от стоимости

    // Удаляем предметы из инвентаря и добавляем золото
    setPlayer(p => ({
      ...p,
      inventory: p.inventory.filter(item => !selectedTradeItems.find(si => si.uid === item.uid)),
      gold: p.gold + offerGold
    }));

    addLog(`Сделка с ${tradeOffer.targetMember.name} завершена! Получено ${offerGold} золота.`, 'good');
    addNotification(`✅ Сделка завершена! +${offerGold} золота`, 'success');

    // Закрываем модальное окно
    setShowTradeModal(false);
    setTradeOffer(null);
    setSelectedTradeItems([]);
    setTradeGoldAmount(0);
  };

  const cancelTrade = () => {
    setShowTradeModal(false);
    setTradeOffer(null);
    setSelectedTradeItems([]);
    setTradeGoldAmount(0);
  };

  // --- МЕХАНИКА: МАГАЗИН БРИЛЛИАНТОВ ---

  const buyDiamonds = (item) => {
    // ДЕМО-РЕЖИМ: Все пакеты доступны бесплатно для тестирования
    const totalAmount = item.bonus ? item.amount + parseInt(item.bonus.match(/\d+/)[0]) : item.amount;
    
    setPlayer(p => ({
      ...p,
      diamonds: (p.diamonds || 0) + totalAmount,
      hasPremium: true // Снимаем ограничение 3 секунд
    }));
    
    addLog(`Получено ${totalAmount} бриллиантов! (ДЕМО-РЕЖИМ)`, 'legendary');
    addNotification(`💎 +${totalAmount} бриллиантов! Снято ограничение на кнопку "Сделай шаг"!`, 'legendary');
  };

  const buyShopItem = (item) => {
    if (!player) return;

    if ((player.diamonds || 0) < item.cost) {
      addNotification('Недостаточно бриллиантов!', 'error');
      return;
    }

    // Списываем бриллианты
    let newPlayer = {
      ...player,
      diamonds: player.diamonds - item.cost,
      collectedFrames: player.collectedFrames || [1] // Инициализируем если нет
    };

    // Применяем эффект покупки
    switch (item.type) {
      case 'boost':
        // Добавляем активный буст
        const boostEnd = Date.now() + item.duration;
        newPlayer.activeBoosts = newPlayer.activeBoosts || [];
        newPlayer.activeBoosts.push({
          id: item.id,
          name: item.name,
          effect: item.effect,
          endsAt: boostEnd
        });
        addLog(`Активирован буст: ${item.name}!`, 'legendary');
        addNotification(`✨ ${item.name} активирован!`, 'legendary');
        break;

      case 'item':
        if (item.reward === 'legendary_chest') {
          // Открываем легендарный сундук
          const chest = CHEST_TYPES.find(c => c.id === 'legendary');
          if (chest) {
            const rewards = generateChestRewards(chest);
            newPlayer.gold += rewards.gold;
            newPlayer.exp += rewards.exp;
            newPlayer.inventory = [...newPlayer.inventory, ...rewards.items];
            if (rewards.perks) {
              newPlayer.perks = [...(newPlayer.perks || []), ...rewards.perks.map(p => p.id)];
            }
            addLog(`Легендарный сундук открыт! Получено: ${rewards.gold} золота, ${rewards.exp} опыта`, 'legendary');
          }
        } else if (item.reward === 'perk_choice') {
          // Показываем выбор перка (упрощенно - даем случайный легендарный)
          const legendaryPerks = PERKS_DB.filter(p => p.rarity === 'legendary' && !newPlayer.perks.includes(p.id));
          if (legendaryPerks.length > 0) {
            const perk = legendaryPerks[getRandomInt(0, legendaryPerks.length - 1)];
            newPlayer.perks = [...(newPlayer.perks || []), perk.id];
            addLog(`Получен перк: ${perk.name}!`, 'legendary');
            addNotification(`✨ Получен перк: ${perk.name}!`, 'legendary');
          }
        } else if (item.reward === 'avatar_pack') {
          // Даем 5 случайных аватаров
          const availableAvatars = AVATARS_DB.filter(a => !newPlayer.collectedAvatars.includes(a.id));
          const count = Math.min(5, availableAvatars.length);
          for (let i = 0; i < count; i++) {
            const avatar = availableAvatars[getRandomInt(0, availableAvatars.length - 1)];
            if (!newPlayer.collectedAvatars.includes(avatar.id)) {
              newPlayer.collectedAvatars = [...newPlayer.collectedAvatars, avatar.id];
            }
          }
          addLog(`Получено ${count} новых аватаров!`, 'legendary');
          addNotification(`🎨 +${count} аватаров!`, 'legendary');
        } else if (item.reward === 'instant_level') {
          // Повышаем уровень
          const classData = PLAYER_CLASSES.find(c => c.id === newPlayer.classId);
          if (classData) {
            newPlayer.level += 1;
            newPlayer.str += classData.growth.str;
            newPlayer.def += classData.growth.def;
            newPlayer.maxHp += classData.growth.hp;
            newPlayer.hp = newPlayer.maxHp;
            newPlayer.maxEnergy += 1;
            newPlayer.energy = newPlayer.maxEnergy;
            addLog(`Уровень повышен до ${newPlayer.level}!`, 'legendary');
            addNotification(`⬆️ Уровень ${newPlayer.level}!`, 'legendary');
          }
        } else if (item.reward === 'frame_rare_pack') {
          // Даем 3 случайные редкие рамки
          let availableFrames = AVATAR_FRAMES.filter(f => f.rarity === 'rare' && !newPlayer.collectedFrames.includes(f.id));
          const count = Math.min(3, availableFrames.length);
          for (let i = 0; i < count; i++) {
            if (availableFrames.length === 0) break;
            const randomIndex = getRandomInt(0, availableFrames.length - 1);
            const frame = availableFrames[randomIndex];
            newPlayer.collectedFrames = [...newPlayer.collectedFrames, frame.id];
            availableFrames = availableFrames.filter(f => f.id !== frame.id); // Удаляем из доступных
          }
          addLog(`Получено ${count} редких рамок!`, 'legendary');
          addNotification(`🖼️ +${count} редких рамок!`, 'legendary');
        } else if (item.reward === 'frame_epic_pack') {
          // Даем 2 случайные эпические рамки
          let availableFrames = AVATAR_FRAMES.filter(f => f.rarity === 'epic' && !newPlayer.collectedFrames.includes(f.id));
          const count = Math.min(2, availableFrames.length);
          for (let i = 0; i < count; i++) {
            if (availableFrames.length === 0) break;
            const randomIndex = getRandomInt(0, availableFrames.length - 1);
            const frame = availableFrames[randomIndex];
            newPlayer.collectedFrames = [...newPlayer.collectedFrames, frame.id];
            availableFrames = availableFrames.filter(f => f.id !== frame.id); // Удаляем из доступных
          }
          addLog(`Получено ${count} эпических рамок!`, 'legendary');
          addNotification(`🖼️ +${count} эпических рамок!`, 'legendary');
        } else if (item.reward === 'frame_legendary') {
          // Даем 1 случайную легендарную рамку
          const legendaryFrames = AVATAR_FRAMES.filter(f => f.rarity === 'legendary' && !newPlayer.collectedFrames.includes(f.id));
          if (legendaryFrames.length > 0) {
            const frame = legendaryFrames[getRandomInt(0, legendaryFrames.length - 1)];
            newPlayer.collectedFrames = [...newPlayer.collectedFrames, frame.id];
            addLog(`Получена легендарная рамка: ${frame.name}!`, 'legendary');
            addNotification(`🖼️ Легендарная рамка: ${frame.name}!`, 'legendary');
          }
        }
        break;
    }

    setPlayer(newPlayer);
  };

  // --- СИСТЕМА ДОСТИЖЕНИЙ ---

  const calculateAchievementProgress = useCallback((achievement, playerData) => {
    const req = achievement.requirement;
    let current = 0;

    switch (req.type) {
      case 'steps':
        current = playerData.totalSteps || 0;
        break;
      case 'kills':
        current = playerData.totalKills || 0;
        break;
      case 'crafts':
        current = playerData.totalCrafts || 0;
        break;
      case 'quests_completed':
        current = playerData.questsCompletedCount || 0;
        break;
      case 'guild_joined':
        current = playerData.guildId ? 1 : 0;
        break;
      case 'guild_created':
        current = playerData.guildRole === 'leader' ? 1 : 0;
        break;
      case 'avatars_collected':
        current = playerData.collectedAvatars?.length || 0;
        break;
      case 'legendary_items':
        current = playerData.inventory?.filter(item => item.rarity === 'legendary').length || 0;
        break;
      case 'gold_accumulated':
        current = playerData.gold || 0;
        break;
      case 'locations_visited':
        // Для простоты считаем, что игрок посетил все локации до текущей
        current = LOCATIONS.filter(loc => loc.minLvl <= playerData.level).length;
        break;
      default:
        current = 0;
    }

    const progress = Math.min(100, Math.floor((current / req.value) * 100));
    return progress;
  }, []);

  const checkAchievements = () => {
    if (!player) return;

    const newUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
      // Пропускаем уже разблокированные
      if (player.achievements.includes(achievement.id)) return;

      const progress = calculateAchievementProgress(achievement, player);

      if (progress >= 100) {
        newUnlocked.push(achievement.id);
      }
    });

    if (newUnlocked.length > 0) {
      setPlayer(p => ({
        ...p,
        achievements: [...p.achievements, ...newUnlocked],
        unclaimedAchievements: [...(p.unclaimedAchievements || []), ...newUnlocked]
      }));

      // Показываем уведомления о разблокированных достижениях
      newUnlocked.forEach(achId => {
        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (ach) {
          addNotification(`🏆 Достижение разблокировано: ${ach.name}!`, 'legendary');
          addLog(`Достижение разблокировано: ${ach.name}!`, 'epic');
        }
      });
    }
  };

  const claimAchievementReward = (achievementId) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    // Проверяем, что достижение разблокировано и не получено
    if (!player.achievements.includes(achievementId)) {
      addLog('Достижение еще не разблокировано!', 'bad');
      return;
    }

    if (!player.unclaimedAchievements.includes(achievementId)) {
      addLog('Награда уже получена!', 'bad');
      return;
    }

    // Выдаем награды
    const { gold = 0, exp = 0 } = achievement.reward;

    setPlayer(p => {
      const newExp = p.exp + exp;
      const newGold = p.gold + gold;
      
      // Удаляем из невостребованных
      const newUnclaimed = p.unclaimedAchievements.filter(id => id !== achievementId);

      return {
        ...p,
        gold: newGold,
        exp: newExp,
        unclaimedAchievements: newUnclaimed
      };
    });

    addLog(`Получена награда за достижение "${achievement.name}": ${gold} золота, ${exp} опыта!`, 'good');
    addNotification(`Награда получена: ${gold} 💰 ${exp} ✨`, 'success');

    // Проверяем повышение уровня после получения опыта
    setTimeout(() => {
      if (player.exp + exp >= player.maxExp) {
        levelUp();
      }
    }, 100);
  };

  // --- МЕХАНИКА: СУНДУКИ ---

  const buyChest = (chestType) => {
    const chest = CHEST_TYPES.find(c => c.id === chestType);
    if (!chest) return;

    if (player.gold < chest.cost) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    // Списываем золото
    setPlayer(p => ({ ...p, gold: p.gold - chest.cost }));

    // Генерируем награды
    const rewards = generateChestRewards(chest);

    // Запускаем анимацию открытия
    setOpeningChest({
      type: chest,
      rewards,
      stage: 'opening'
    });
    setChestAnimation(true);

    // Через 2 секунды показываем награды
    setTimeout(() => {
      setOpeningChest(prev => ({ ...prev, stage: 'revealing' }));
    }, 2000);
  };

  const generateChestRewards = (chest) => {
    const rewards = {
      gold: getRandomInt(chest.rewards.gold.min, chest.rewards.gold.max),
      exp: getRandomInt(chest.rewards.exp.min, chest.rewards.exp.max),
      items: [],
      perks: [],
      frames: [],
      pets: [] // НОВОЕ: питомцы
    };

    // Шанс получить предмет
    if (Math.random() < chest.rewards.items.chance) {
      const itemId = chest.rewards.items.pool[getRandomInt(0, chest.rewards.items.pool.length - 1)];
      const item = ITEMS_DB.find(i => i.id === itemId);
      if (item) {
        rewards.items.push({ ...item, uid: Date.now() });
      }
    }

    // Для легендарного сундука гарантируем легендарный предмет
    if (chest.rewards.guaranteedLegendary) {
      const legendaryItems = ITEMS_DB.filter(i => i.rarity === 'legendary');
      if (legendaryItems.length > 0) {
        const item = legendaryItems[getRandomInt(0, legendaryItems.length - 1)];
        rewards.items.push({ ...item, uid: Date.now() + 1 });
      }
    }

    // Шанс получить перк
    if (chest.rewards.perks && Math.random() < chest.rewards.perks.chance) {
      const perkId = chest.rewards.perks.pool[getRandomInt(0, chest.rewards.perks.pool.length - 1)];
      const perk = PERKS_DB.find(p => p.id === perkId);
      if (perk && !player.perks.includes(perkId)) { // Проверяем, что перк еще не получен
        rewards.perks.push(perk);
      }
    }

    // Шанс получить рамку
    if (chest.rewards.frames && Math.random() < chest.rewards.frames.chance) {
      const frameId = chest.rewards.frames.pool[getRandomInt(0, chest.rewards.frames.pool.length - 1)];
      const frame = AVATAR_FRAMES.find(f => f.id === frameId);
      if (frame && !player.collectedFrames.includes(frameId)) { // Проверяем, что рамка еще не получена
        rewards.frames.push(frame);
      }
    }

    // НОВОЕ: Шанс получить питомца
    if (chest.rewards.pets && Math.random() < chest.rewards.pets.chance) {
      const petId = chest.rewards.pets.pool[getRandomInt(0, chest.rewards.pets.pool.length - 1)];
      const pet = PETS_DB.find(p => p.id === petId);
      if (pet) {
        rewards.pets.push(pet);
      }
    }

    return rewards;
  };

  const claimChestRewards = () => {
    if (!openingChest || openingChest.stage !== 'revealing') return;

    const { rewards } = openingChest;

    // Добавляем питомцев
    if (rewards.pets && rewards.pets.length > 0) {
      rewards.pets.forEach(petData => {
        addPet(petData.id);
      });
    }

    setPlayer(p => {
      let newPlayer = {
        ...p,
        gold: p.gold + rewards.gold,
        exp: p.exp + rewards.exp,
        inventory: [...p.inventory, ...rewards.items],
        perks: [...(p.perks || []), ...rewards.perks.map(perk => perk.id)], // Добавляем новые перки
        collectedFrames: [...(p.collectedFrames || [1]), ...rewards.frames.map(frame => frame.id)], // Добавляем новые рамки
        totalChestsOpened: (p.totalChestsOpened || 0) + 1
      };

      // Проверяем повышение уровня
      const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
      if (lvlCheck) {
        newPlayer.level = lvlCheck.lvl;
        newPlayer.exp = lvlCheck.exp;
        newPlayer.maxExp = lvlCheck.maxExp;
        newPlayer.str += lvlCheck.stats.str;
        newPlayer.def += lvlCheck.stats.def;
        newPlayer.maxHp += lvlCheck.stats.hp;
        newPlayer.hp = Math.min(newPlayer.hp + lvlCheck.stats.hp, newPlayer.maxHp);
        newPlayer.maxEnergy += lvlCheck.stats.energy;
        newPlayer.energy = Math.min(newPlayer.energy + lvlCheck.stats.energy, newPlayer.maxEnergy);
      }

      return newPlayer;
    });

    const perkText = rewards.perks.length > 0 ? `, ПЕРК: ${rewards.perks.map(p => p.name).join(', ')}` : '';
    const frameText = rewards.frames && rewards.frames.length > 0 ? `, РАМКА: ${rewards.frames.map(f => f.name).join(', ')}` : '';
    const petText = rewards.pets && rewards.pets.length > 0 ? `, ПИТОМЕЦ: ${rewards.pets.map(p => p.name).join(', ')}` : '';
    addLog(`Сундук открыт! Получено: ${rewards.gold} золота, ${rewards.exp} опыта${rewards.items.length > 0 ? `, ${rewards.items.map(i => i.name).join(', ')}` : ''}${perkText}${frameText}${petText}`, 'legendary');
    
    if (rewards.pets && rewards.pets.length > 0) {
      addNotification(`🐾 Получен питомец: ${rewards.pets[0].name}!`, 'legendary', 6000);
    } else if (rewards.frames && rewards.frames.length > 0) {
      addNotification(`🖼️ Получена рамка: ${rewards.frames[0].name}!`, 'legendary');
    } else if (rewards.perks.length > 0) {
      addNotification(`✨ Получен перк: ${rewards.perks[0].name}!`, 'legendary');
    } else {
      addNotification(`🎁 Сундук открыт!`, 'success');
    }

    // Закрываем окно сундука
    setTimeout(() => {
      setOpeningChest(null);
      setChestAnimation(false);
    }, 500);

    checkAchievements();
  };

  // --- МЕХАНИКА: УЛУЧШЕНИЕ ПРЕДМЕТОВ ---

  const upgradeItem = (item) => {
    if (!item || !item.uid) {
      addNotification('Ошибка: предмет не найден', 'error');
      return;
    }

    const currentLevel = item.upgradeLevel || 0;
    
    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      addNotification('Предмет уже максимально улучшен!', 'warning');
      return;
    }

    const nextLevel = currentLevel + 1;
    const cost = UPGRADE_COSTS[nextLevel];

    if (!cost) {
      addNotification('Ошибка: стоимость улучшения не найдена', 'error');
      return;
    }

    // Проверяем золото
    if (player.gold < cost.gold) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    // Проверяем ресурсы
    for (const [resourceId, amount] of Object.entries(cost.resources)) {
      if ((player.resources[resourceId] || 0) < amount) {
        const resource = RESOURCES.find(r => r.id === resourceId);
        addNotification(`Недостаточно ресурса: ${resource?.name || resourceId}!`, 'error');
        return;
      }
    }

    // Списываем золото и ресурсы
    let newResources = { ...player.resources };
    for (const [resourceId, amount] of Object.entries(cost.resources)) {
      newResources[resourceId] -= amount;
      if (newResources[resourceId] <= 0) {
        delete newResources[resourceId];
      }
    }

    // Улучшаем предмет
    setPlayer(p => {
      const newInventory = p.inventory.map(invItem => {
        if (invItem.uid === item.uid) {
          const bonusPerLevel = item.type === 'weapon' ? 2 : item.type === 'armor' ? 1 : 0;
          return {
            ...invItem,
            upgradeLevel: nextLevel,
            val: invItem.val + bonusPerLevel
          };
        }
        return invItem;
      });

      return {
        ...p,
        gold: p.gold - cost.gold,
        resources: newResources,
        inventory: newInventory
      };
    });

    addLog(`Предмет ${item.name} улучшен до уровня +${nextLevel}!`, 'epic');
    addNotification(`✨ ${item.name} улучшен до +${nextLevel}!`, 'success');
    setUpgradeModal(null);
  };

  // --- МЕХАНИКА: ЗАЧАРОВАНИЕ ---

  const enchantItem = (item, enchantmentId) => {
    if (!item || !item.uid) {
      addNotification('Ошибка: предмет не найден', 'error');
      return;
    }

    const enchantment = ENCHANTMENTS.find(e => e.id === enchantmentId);
    if (!enchantment) {
      addNotification('Ошибка: зачарование не найдено', 'error');
      return;
    }

    // Проверяем тип предмета
    if (item.type !== enchantment.type) {
      addNotification(`Это зачарование можно применить только к ${enchantment.type === 'weapon' ? 'оружию' : 'броне'}!`, 'error');
      return;
    }

    // Проверяем, не зачарован ли уже предмет
    if (item.enchantment) {
      addNotification('Предмет уже зачарован! Сначала снимите зачарование.', 'warning');
      return;
    }

    // Проверяем золото
    if (player.gold < enchantment.cost.gold) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    // Проверяем ресурсы
    for (const [resourceId, amount] of Object.entries(enchantment.cost)) {
      if (resourceId === 'gold') continue;
      if ((player.resources[resourceId] || 0) < amount) {
        const resource = RESOURCES.find(r => r.id === resourceId);
        addNotification(`Недостаточно ресурса: ${resource?.name || resourceId}!`, 'error');
        return;
      }
    }

    // Списываем золото и ресурсы
    let newResources = { ...player.resources };
    for (const [resourceId, amount] of Object.entries(enchantment.cost)) {
      if (resourceId === 'gold') continue;
      newResources[resourceId] -= amount;
      if (newResources[resourceId] <= 0) {
        delete newResources[resourceId];
      }
    }

    // Зачаровываем предмет
    setPlayer(p => {
      const newInventory = p.inventory.map(invItem => {
        if (invItem.uid === item.uid) {
          return {
            ...invItem,
            enchantment: {
              id: enchantment.id,
              name: enchantment.name,
              effect: enchantment.effect,
              bonus: enchantment.bonus
            }
          };
        }
        return invItem;
      });

      return {
        ...p,
        gold: p.gold - enchantment.cost.gold,
        resources: newResources,
        inventory: newInventory
      };
    });

    addLog(`Предмет ${item.name} зачарован: ${enchantment.name}!`, 'legendary');
    addNotification(`✨ ${item.name} получил зачарование: ${enchantment.name}!`, 'legendary');
    setUpgradeModal(null);
    setSelectedEnchantment(null);
  };

  const removeEnchantment = (item) => {
    if (!item || !item.uid || !item.enchantment) {
      addNotification('Ошибка: предмет не зачарован', 'error');
      return;
    }

    setPlayer(p => {
      const newInventory = p.inventory.map(invItem => {
        if (invItem.uid === item.uid) {
          const { enchantment, ...rest } = invItem;
          return rest;
        }
        return invItem;
      });

      return {
        ...p,
        inventory: newInventory
      };
    });

    addLog(`Зачарование снято с ${item.name}`, 'neutral');
    addNotification(`Зачарование снято с ${item.name}`, 'info');
  };

  // --- МЕХАНИКА: НАСТАВНИЧЕСТВО ---

  const becomeMentor = () => {
    if (player.level < 10) {
      addNotification('Нужен 10 уровень, чтобы стать наставником!', 'error');
      return;
    }

    // Генерируем случайных учеников (1-3 ученика)
    const studentNames = [
      'Алекс Новичок', 'Мария Храбрая', 'Иван Сильный', 'Елена Быстрая', 
      'Дмитрий Умный', 'Анна Ловкая', 'Петр Смелый', 'Ольга Мудрая',
      'Сергей Отважный', 'Наталья Искусная', 'Михаил Стойкий', 'Татьяна Грациозная'
    ];
    
    const numStudents = getRandomInt(1, 3);
    const students = [];
    
    for (let i = 0; i < numStudents; i++) {
      const studentName = studentNames[getRandomInt(0, studentNames.length - 1)];
      const studentLevel = getRandomInt(1, 9);
      const baseStr = getRandomInt(3, 8);
      const baseDef = getRandomInt(2, 6);
      const baseHp = getRandomInt(40, 70);
      
      students.push({
        name: studentName,
        level: studentLevel,
        str: baseStr + studentLevel,
        def: baseDef + studentLevel,
        hp: baseHp + (studentLevel * 10),
        joinedAt: Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000) // Joined within last week
      });
    }

    setPlayer(p => ({
      ...p,
      isMentor: true,
      students: students,
      totalStudents: students.length
    }));

    addLog('Вы стали наставником!', 'epic');
    addNotification(`🎓 Теперь вы можете обучать новичков! У вас уже ${students.length} ${students.length === 1 ? 'ученик' : 'ученика'}!`, 'success');
  };

  const findMentor = () => {
    if (player.level >= 10) {
      addNotification('Вы уже достаточно опытны!', 'warning');
      return;
    }

    if (player.mentorId) {
      addNotification('У вас уже есть наставник!', 'warning');
      return;
    }

    // Симуляция поиска наставника
    const mentorNames = ['Артур Мудрый', 'Элара Светлая', 'Торин Железный', 'Лира Быстрая', 'Грок Могучий'];
    const mentorName = mentorNames[getRandomInt(0, mentorNames.length - 1)];
    const mentorLevel = getRandomInt(15, 50);

    // Создаем данные ученика для добавления к наставнику
    const studentData = {
      name: player.name,
      level: player.level,
      str: player.str,
      def: player.def,
      hp: player.maxHp,
      joinedAt: Date.now()
    };

    setPlayer(p => ({
      ...p,
      mentorId: Date.now(),
      mentorName,
      mentorLevel,
      mentorProgress: 0
    }));

    addLog(`Вы нашли наставника: ${mentorName} (Уровень ${mentorLevel})!`, 'epic');
    addNotification(`🎓 Наставник найден: ${mentorName}!`, 'success');
  };

  const graduateStudent = () => {
    if (!player.mentorId || player.level < 10) {
      return;
    }

    const rewards = MENTORSHIP_REWARDS.student.graduation;

    setPlayer(p => ({
      ...p,
      gold: p.gold + rewards.gold,
      exp: p.exp + rewards.exp,
      mentorId: null,
      mentorName: null,
      mentorLevel: null,
      mentorProgress: null,
      title: rewards.title
    }));

    addLog(`Вы завершили обучение! Получено: ${rewards.gold} золота, ${rewards.exp} опыта`, 'legendary');
    addNotification(`🎓 Обучение завершено! Вы получили титул: ${rewards.title}!`, 'legendary');
  };

  // Функция для симуляции прогресса учеников
  const updateStudentsProgress = () => {
    if (!player || !player.isMentor || !player.students || player.students.length === 0) {
      return;
    }

    setPlayer(p => {
      const updatedStudents = p.students.map(student => {
        // Случайный шанс повышения уровня ученика (10% при каждом действии игрока)
        if (Math.random() < 0.1 && student.level < 10) {
          const newLevel = student.level + 1;
          
          // Выдаем награды наставнику
          const mentorRewards = MENTORSHIP_REWARDS.mentor.perStudent;
          
          addLog(`Ваш ученик ${student.name} достиг ${newLevel} уровня! +${mentorRewards.gold} золота, +${mentorRewards.exp} опыта`, 'rare');
          addNotification(`🎓 ${student.name} повысил уровень!`, 'success');
          
          return {
            ...student,
            level: newLevel,
            str: student.str + 2,
            def: student.def + 1,
            hp: student.hp + 10
          };
        }
        return student;
      });

      // Удаляем учеников, достигших 10 уровня (выпускники)
      const graduates = updatedStudents.filter(s => s.level >= 10);
      const activeStudents = updatedStudents.filter(s => s.level < 10);
      
      let newGold = p.gold;
      let newExp = p.exp;
      let newTotalStudents = p.totalStudents || 0;

      // Выдаем награды за выпускников
      graduates.forEach(graduate => {
        const mentorRewards = MENTORSHIP_REWARDS.mentor.perStudent;
        newGold += mentorRewards.gold;
        newExp += mentorRewards.exp;
        addLog(`${graduate.name} завершил обучение! Вы получили награду за наставничество!`, 'legendary');
        addNotification(`🎓 ${graduate.name} выпустился!`, 'legendary');
      });

      // Проверяем достижения наставника
      const milestones = MENTORSHIP_REWARDS.mentor.milestones;
      Object.keys(milestones).forEach(count => {
        if (newTotalStudents === parseInt(count) - 1 && newTotalStudents + graduates.length >= parseInt(count)) {
          const milestone = milestones[count];
          newGold += milestone.gold;
          addLog(`Достижение наставника! ${count} учеников обучено! +${milestone.gold} золота`, 'legendary');
          addNotification(`🏆 Достижение: ${milestone.title}!`, 'legendary');
          
          if (milestone.perk) {
            // Добавляем перк
            const perk = PERKS_DB.find(p => p.id === milestone.perk);
            if (perk) {
              addNotification(`Получен перк: ${perk.name}!`, 'legendary');
            }
          }
        }
      });

      return {
        ...p,
        students: activeStudents,
        totalStudents: newTotalStudents + graduates.length,
        gold: newGold,
        exp: newExp
      };
    });
  };

  // Функция для поиска новых учеников
  const findNewStudent = () => {
    if (!player || !player.isMentor) {
      addNotification('Вы должны быть наставником!', 'error');
      return;
    }

    if (player.students && player.students.length >= 5) {
      addNotification('У вас уже максимальное количество учеников (5)!', 'warning');
      return;
    }

    const studentNames = [
      'Алекс Новичок', 'Мария Храбрая', 'Иван Сильный', 'Елена Быстрая', 
      'Дмитрий Умный', 'Анна Ловкая', 'Петр Смелый', 'Ольга Мудрая',
      'Сергей Отважный', 'Наталья Искусная', 'Михаил Стойкий', 'Татьяна Грациозная',
      'Владимир Решительный', 'Екатерина Грозная', 'Николай Верный'
    ];
    
    const studentName = studentNames[getRandomInt(0, studentNames.length - 1)];
    const studentLevel = getRandomInt(1, 5);
    const baseStr = getRandomInt(3, 8);
    const baseDef = getRandomInt(2, 6);
    const baseHp = getRandomInt(40, 70);
    
    const newStudent = {
      name: studentName,
      level: studentLevel,
      str: baseStr + studentLevel,
      def: baseDef + studentLevel,
      hp: baseHp + (studentLevel * 10),
      joinedAt: Date.now()
    };

    setPlayer(p => ({
      ...p,
      students: [...(p.students || []), newStudent]
    }));

    addLog(`Новый ученик найден: ${studentName} (Уровень ${studentLevel})!`, 'rare');
    addNotification(`🎓 ${studentName} стал вашим учеником!`, 'success');
  };

  // Проверка выпуска ученика при повышении уровня
  useEffect(() => {
    if (player && player.mentorId && player.level >= 10) {
      graduateStudent();
    }
    
    // Обновляем прогресс учеников при повышении уровня игрока
    if (player && player.isMentor) {
      updateStudentsProgress();
    }
  }, [player?.level]);

  // --- МЕХАНИКА: PVP АРЕНА ---

  const getCurrentRank = (rating) => {
    return ARENA_RANKS.find(rank => rating >= rank.minRating && rating <= rank.maxRating) || ARENA_RANKS[0];
  };

  const findPvPOpponent = () => {
    if (!player) return;
    
    setPvpSearching(true);
    
    // Simulate matchmaking delay
    setTimeout(() => {
      // Find opponent with similar rating (±200)
      const ratingRange = 200;
      const minRating = Math.max(0, player.pvpRating - ratingRange);
      const maxRating = player.pvpRating + ratingRange;
      
      const suitableOpponents = PVP_OPPONENTS.filter(opp => 
        opp.rating >= minRating && opp.rating <= maxRating
      );
      
      let opponent;
      if (suitableOpponents.length > 0) {
        opponent = suitableOpponents[getRandomInt(0, suitableOpponents.length - 1)];
      } else {
        // Fallback to any opponent
        opponent = PVP_OPPONENTS[getRandomInt(0, PVP_OPPONENTS.length - 1)];
      }
      
      // Generate opponent stats based on level and class
      const classData = PLAYER_CLASSES.find(c => c.name === opponent.class) || PLAYER_CLASSES[0];
      const opponentStats = {
        name: opponent.name,
        class: opponent.class,
        avatarId: opponent.avatarId,
        level: opponent.level,
        rating: opponent.rating,
        hp: classData.baseStats.hp + (classData.growth.hp * (opponent.level - 1)),
        maxHp: classData.baseStats.hp + (classData.growth.hp * (opponent.level - 1)),
        str: classData.baseStats.str + (classData.growth.str * (opponent.level - 1)),
        def: classData.baseStats.def + (classData.growth.def * (opponent.level - 1))
      };
      
      setPvpOpponent(opponentStats);
      setPvpSearching(false);
      addNotification(`Противник найден: ${opponent.name}!`, 'info');
    }, 2000);
  };

  const startPvPBattle = () => {
    if (!pvpOpponent) return;
    
    // Create enemy object for combat
    const enemy = {
      name: pvpOpponent.name,
      hp: pvpOpponent.hp,
      maxHp: pvpOpponent.maxHp,
      dmg: Math.floor(pvpOpponent.str * 1.2),
      exp: 0, // No exp from PvP
      gold: 0, // Gold handled separately
      isPvP: true,
      opponentRating: pvpOpponent.rating
    };
    
    setCombatState({ enemy, log: [] });
    addLog(`PvP бой начался против ${pvpOpponent.name}!`, 'epic');
  };

  const handlePvPVictory = (opponentRating) => {
    // Calculate rating change
    const ratingDiff = opponentRating - player.pvpRating;
    const baseChange = 25;
    const ratingChange = Math.floor(baseChange + (ratingDiff / 50));
    const finalChange = Math.max(10, Math.min(50, ratingChange)); // Between 10-50
    
    const currentRank = getCurrentRank(player.pvpRating);
    const newRating = player.pvpRating + finalChange;
    const newRank = getCurrentRank(newRating);
    
    setPlayer(p => ({
      ...p,
      pvpRating: newRating,
      pvpWins: (p.pvpWins || 0) + 1,
      pvpWinStreak: (p.pvpWinStreak || 0) + 1,
      pvpBestStreak: Math.max((p.pvpBestStreak || 0), (p.pvpWinStreak || 0) + 1),
      gold: p.gold + currentRank.reward.gold,
      exp: p.exp + currentRank.reward.exp
    }));
    
    addLog(`🏆 Победа в PvP! +${finalChange} рейтинга, +${currentRank.reward.gold} золота, +${currentRank.reward.exp} опыта`, 'legendary');
    
    if (newRank.id > currentRank.id) {
      addNotification(`🎉 Новый ранг: ${newRank.name}!`, 'legendary');
    }
    
    setPvpOpponent(null);
  };

  const handlePvPDefeat = (opponentRating) => {
    // Calculate rating loss
    const ratingDiff = player.pvpRating - opponentRating;
    const baseChange = 20;
    const ratingChange = Math.floor(baseChange + (ratingDiff / 50));
    const finalChange = Math.max(5, Math.min(40, ratingChange)); // Between 5-40
    
    const newRating = Math.max(0, player.pvpRating - finalChange);
    
    setPlayer(p => ({
      ...p,
      pvpRating: newRating,
      pvpLosses: (p.pvpLosses || 0) + 1,
      pvpWinStreak: 0
    }));
    
    addLog(`💔 Поражение в PvP. -${finalChange} рейтинга`, 'bad');
    setPvpOpponent(null);
  };

  // --- МИРОВЫЕ БОССЫ ---

  const spawnWorldBoss = (bossId) => {
    setWorldBosses(bosses => bosses.map(boss => {
      if (boss.id === bossId) {
        return {
          ...boss,
          isAlive: true,
          hp: boss.maxHp,
          participants: [],
          spawnedAt: Date.now()
        };
      }
      return boss;
    }));
    
    const boss = WORLD_BOSSES.find(b => b.id === bossId);
    addNotification(`🔥 Мировой босс "${boss.name}" появился на карте!`, 'legendary');
    addLog(`🔥 Мировой босс "${boss.name}" появился в локации "${boss.location}"!`, 'legendary');
  };

  const attackWorldBoss = (bossId) => {
    if (!player) return;
    
    const boss = worldBosses.find(b => b.id === bossId);
    if (!boss || !boss.isAlive) {
      addNotification('Этот босс еще не появился!', 'error');
      return;
    }
    
    if (player.level < boss.level) {
      addNotification(`Требуется уровень ${boss.level}!`, 'error');
      return;
    }
    
    if (player.energy < 20) {
      addNotification('Недостаточно энергии! Требуется 20 энергии.', 'error');
      return;
    }
    
    // Создаем врага для боя
    const enemy = {
      name: boss.name,
      hp: boss.hp,
      maxHp: boss.maxHp,
      dmg: boss.damage,
      exp: 0, // Награда выдается после убийства босса
      gold: 0,
      isWorldBoss: true,
      bossId: boss.id
    };
    
    // Тратим энергию
    setPlayer(p => ({ ...p, energy: p.energy - 20 }));
    
    setCombatState({ enemy, log: [] });
    setSelectedBoss(boss);
    addLog(`⚔️ Вы атакуете мирового босса "${boss.name}"!`, 'epic');
  };

  const handleWorldBossDamage = (bossId, damage) => {
    setWorldBosses(bosses => bosses.map(boss => {
      if (boss.id === bossId) {
        const newHp = Math.max(0, boss.hp - damage);
        
        // Добавляем игрока в участники, если его еще нет
        const participants = boss.participants || [];
        if (!participants.find(p => p.id === player.id)) {
          participants.push({
            id: player.id,
            name: player.name,
            damage: damage
          });
        } else {
          // Обновляем урон игрока
          participants.forEach(p => {
            if (p.id === player.id) {
              p.damage += damage;
            }
          });
        }
        
        return {
          ...boss,
          hp: newHp,
          participants
        };
      }
      return boss;
    }));
  };

  const handleWorldBossDefeat = (bossId) => {
    const boss = worldBosses.find(b => b.id === bossId);
    if (!boss) return;
    
    // Выдаем награды
    const goldReward = getRandomInt(boss.rewards.gold.min, boss.rewards.gold.max);
    const expReward = getRandomInt(boss.rewards.exp.min, boss.rewards.exp.max);
    
    // Случайный предмет из пула
    const itemId = boss.rewards.items[getRandomInt(0, boss.rewards.items.length - 1)];
    const item = ITEMS_DB.find(i => i.id === itemId);
    
    setPlayer(p => {
      const newInv = [...p.inventory];
      newInv.push({ ...item, id: Date.now() });
      
      let updates = {
        ...p,
        gold: p.gold + goldReward,
        exp: p.exp + expReward,
        inventory: newInv,
        totalBossKills: (p.totalBossKills || 0) + 1
      };
      
      // Особая награда (титул)
      if (boss.rewards.specialReward) {
        updates.specialTitles = [...(p.specialTitles || []), boss.rewards.specialReward.id];
        addNotification(`🏆 Получен титул: ${boss.rewards.specialReward.name}!`, 'legendary');
      }
      
      return updates;
    });
    
    addLog(`🏆 Мировой босс "${boss.name}" повержен!`, 'legendary');
    addLog(`💰 Получено: ${goldReward} золота, ${expReward} опыта, ${item.name}`, 'good');
    
    // Убираем босса и устанавливаем таймер следующего спавна
    setWorldBosses(bosses => bosses.map(b => {
      if (b.id === bossId) {
        return {
          ...b,
          isAlive: false,
          nextSpawn: Date.now() + b.spawnInterval,
          participants: []
        };
      }
      return b;
    }));
    
    setSelectedBoss(null);
  };

  // --- СЕЗОНЫ ---

  const addSeasonExp = (amount) => {
    if (!currentSeason) return;
    
    setCurrentSeason(season => {
      const newExp = season.playerExp + amount;
      let newLevel = season.playerLevel;
      let remainingExp = newExp;
      let expNeeded = season.expToNextLevel;
      
      // Проверяем повышение уровня
      while (remainingExp >= expNeeded && newLevel < season.levels) {
        remainingExp -= expNeeded;
        newLevel++;
        expNeeded = Math.floor(expNeeded * 1.2); // Увеличиваем требуемый опыт
        
        // Проверяем, есть ли награда за этот уровень
        if (season.rewards[newLevel]) {
          addNotification(`🎉 Сезон: достигнут уровень ${newLevel}!`, 'legendary');
        }
      }
      
      return {
        ...season,
        playerLevel: newLevel,
        playerExp: remainingExp,
        expToNextLevel: expNeeded
      };
    });
  };

  const updateSeasonTaskProgress = (taskType, amount = 1) => {
    if (!currentSeason) return;
    
    setCurrentSeason(season => {
      const updatedTasks = season.tasks.map(task => {
        if (task.type === taskType && !task.completed) {
          const newProgress = Math.min(task.target, task.progress + amount);
          const wasCompleted = task.completed;
          const isNowCompleted = newProgress >= task.target;
          
          if (isNowCompleted && !wasCompleted) {
            addNotification(`✅ Сезонное задание "${task.name}" выполнено!`, 'success');
            // Добавляем опыт сезона за выполнение задания
            setTimeout(() => addSeasonExp(task.reward * 20), 100);
          }
          
          return {
            ...task,
            progress: newProgress,
            completed: isNowCompleted
          };
        }
        return task;
      });
      
      return {
        ...season,
        tasks: updatedTasks
      };
    });
  };

  const claimSeasonReward = (level) => {
    if (!currentSeason) return;
    
    const reward = currentSeason.rewards[level];
    if (!reward) return;
    
    if (currentSeason.claimedRewards.includes(level)) {
      addNotification('Награда уже получена!', 'error');
      return;
    }
    
    if (currentSeason.playerLevel < level) {
      addNotification(`Требуется уровень сезона ${level}!`, 'error');
      return;
    }
    
    // Выдаем награды
    setPlayer(p => {
      let updates = {
        ...p,
        gold: p.gold + (reward.gold || 0),
        exp: p.exp + (reward.exp || 0)
      };
      
      // Предмет
      if (reward.item) {
        const newInv = [...p.inventory];
        newInv.push({ ...reward.item, id: Date.now() });
        updates.inventory = newInv;
      }
      
      // Рамка
      if (reward.frame) {
        updates.unlockedFrames = [...(p.unlockedFrames || []), reward.frame];
      }
      
      // Аватар
      if (reward.avatar) {
        updates.unlockedAvatars = [...(p.unlockedAvatars || []), reward.avatar];
      }
      
      // Перк
      if (reward.perk) {
        updates.perks = [...(p.perks || []), reward.perk];
      }
      
      // Титул
      if (reward.title) {
        updates.specialTitles = [...(p.specialTitles || []), reward.title.id];
      }
      
      return updates;
    });
    
    // Отмечаем награду как полученную
    setCurrentSeason(season => ({
      ...season,
      claimedRewards: [...season.claimedRewards, level]
    }));
    
    // Показываем награду
    setShowSeasonReward({ level, reward });
    setTimeout(() => setShowSeasonReward(null), 3000);
    
    addLog(`🎁 Получена награда сезона за уровень ${level}!`, 'legendary');
  };

  // Проверка смены сезона
  useEffect(() => {
    const checkSeasonChange = () => {
      const now = Date.now();
      const activeSeason = SEASONS.find(s => now >= s.startDate && now <= s.endDate);
      
      if (activeSeason && (!currentSeason || currentSeason.id !== activeSeason.id)) {
        // Новый сезон начался
        setCurrentSeason({
          ...activeSeason,
          playerLevel: 0,
          playerExp: 0,
          expToNextLevel: 100,
          tasks: activeSeason.tasks.map(t => ({ ...t, progress: 0, completed: false })),
          claimedRewards: []
        });
        addNotification(`🎉 Начался новый сезон: ${activeSeason.name}!`, 'legendary');
      } else if (!activeSeason && currentSeason) {
        // Сезон закончился
        addNotification(`Сезон "${currentSeason.name}" завершен!`, 'info');
        setCurrentSeason(null);
      }
    };
    
    const timer = setInterval(checkSeasonChange, 60000); // Проверяем каждую минуту
    checkSeasonChange(); // Проверяем сразу
    
    return () => clearInterval(timer);
  }, [currentSeason]);

  // --- МЕХАНИКА: ПУТЕШЕСТВИЕ ---

  // --- МЕХАНИКА: АУКЦИОН ---

  // Создать лот на аукционе
  const createAuctionListing = () => {
    if (!listingItem || !listingStartPrice || !listingBuyoutPrice) {
      addNotification('Заполните все поля!', 'error');
      return;
    }

    const startPrice = parseInt(listingStartPrice);
    const buyoutPrice = parseInt(listingBuyoutPrice);

    if (startPrice <= 0 || buyoutPrice <= 0) {
      addNotification('Цены должны быть больше 0!', 'error');
      return;
    }

    if (buyoutPrice <= startPrice) {
      addNotification('Цена выкупа должна быть выше начальной цены!', 'error');
      return;
    }

    // Удаляем предмет из инвентаря
    setPlayer(p => ({
      ...p,
      inventory: p.inventory.filter(i => i.uid !== listingItem.uid)
    }));

    // Создаем новый лот
    const newListing = {
      id: Date.now(),
      sellerId: 'player',
      sellerName: player.name,
      item: listingItem,
      startPrice,
      currentBid: startPrice,
      buyoutPrice,
      timeLeft: listingDuration,
      bids: [],
      createdAt: Date.now()
    };

    setAuctionListings(prev => [newListing, ...prev]);
    setShowCreateListingModal(false);
    setListingItem(null);
    setListingStartPrice('');
    setListingBuyoutPrice('');
    
    addNotification(`Предмет "${listingItem.name}" выставлен на аукцион!`, 'success');
    addLog(`Вы выставили "${listingItem.name}" на аукцион за ${startPrice} золота.`, 'good');
  };

  // Сделать ставку
  const placeBid = (listing) => {
    const amount = parseInt(bidAmount);

    if (!amount || amount <= 0) {
      addNotification('Введите корректную сумму!', 'error');
      return;
    }

    if (amount <= listing.currentBid) {
      addNotification(`Ставка должна быть выше текущей (${listing.currentBid})!`, 'error');
      return;
    }

    if (player.gold < amount) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    // Возвращаем золото предыдущему ставившему (если это не игрок)
    if (listing.bids.length > 0) {
      const lastBid = listing.bids[listing.bids.length - 1];
      if (lastBid.bidderId === 'player') {
        setPlayer(p => ({
          ...p,
          gold: p.gold + lastBid.amount
        }));
      }
    }

    // Списываем золото
    setPlayer(p => ({
      ...p,
      gold: p.gold - amount
    }));

    // Обновляем лот
    setAuctionListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        return {
          ...l,
          currentBid: amount,
          bids: [...l.bids, {
            bidderId: 'player',
            bidderName: player.name,
            amount,
            timestamp: Date.now()
          }]
        };
      }
      return l;
    }));

    setBidAmount('');
    setSelectedAuctionItem(null);
    addNotification(`Ставка ${amount} золота сделана!`, 'success');
    addLog(`Вы сделали ставку ${amount} золота на "${listing.item.name}".`, 'good');
  };

  // Выкупить сразу
  const buyoutListing = (listing) => {
    if (player.gold < listing.buyoutPrice) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    // Списываем золото с учетом комиссии
    const commission = Math.floor(listing.buyoutPrice * AUCTION_COMMISSION);
    const sellerGets = listing.buyoutPrice - commission;

    setPlayer(p => ({
      ...p,
      gold: p.gold - listing.buyoutPrice,
      inventory: [...p.inventory, listing.item]
    }));

    // Добавляем в историю
    setAuctionHistory(prev => [{
      id: Date.now(),
      item: listing.item,
      seller: listing.sellerName,
      buyer: player.name,
      price: listing.buyoutPrice,
      commission,
      type: 'buyout',
      timestamp: Date.now()
    }, ...prev]);

    // Удаляем лот
    setAuctionListings(prev => prev.filter(l => l.id !== listing.id));

    addNotification(`Вы купили "${listing.item.name}" за ${listing.buyoutPrice} золота!`, 'success');
    addLog(`Вы выкупили "${listing.item.name}" за ${listing.buyoutPrice} золота (комиссия: ${commission}).`, 'good');
  };

  // Отменить свой лот
  const cancelListing = (listing) => {
    // Возвращаем предмет в инвентарь
    setPlayer(p => ({
      ...p,
      inventory: [...p.inventory, listing.item]
    }));

    // Возвращаем золото последнему ставившему
    if (listing.bids.length > 0) {
      const lastBid = listing.bids[listing.bids.length - 1];
      if (lastBid.bidderId === 'player') {
        setPlayer(p => ({
          ...p,
          gold: p.gold + lastBid.amount
        }));
      }
    }

    // Удаляем лот
    setAuctionListings(prev => prev.filter(l => l.id !== listing.id));

    addNotification(`Лот "${listing.item.name}" отменен!`, 'info');
    addLog(`Вы отменили продажу "${listing.item.name}".`, 'neutral');
  };

  // Обновление таймеров аукциона
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctionListings(prev => {
        const updated = prev.map(listing => ({
          ...listing,
          timeLeft: Math.max(0, listing.timeLeft - 1000)
        }));

        // Завершаем истекшие лоты
        updated.forEach(listing => {
          if (listing.timeLeft === 0 && prev.find(l => l.id === listing.id)?.timeLeft > 0) {
            // Лот истек
            if (listing.bids.length > 0) {
              const winningBid = listing.bids[listing.bids.length - 1];
              const commission = Math.floor(listing.currentBid * AUCTION_COMMISSION);
              
              // Если победитель - игрок
              if (winningBid.bidderId === 'player') {
                setPlayer(p => ({
                  ...p,
                  inventory: [...p.inventory, listing.item]
                }));
                addNotification(`Вы выиграли аукцион! Получен предмет: ${listing.item.name}`, 'success');
              }

              // Если продавец - игрок
              if (listing.sellerId === 'player') {
                const sellerGets = listing.currentBid - commission;
                setPlayer(p => ({
                  ...p,
                  gold: p.gold + sellerGets
                }));
                addNotification(`Ваш лот "${listing.item.name}" продан за ${listing.currentBid} золота! Получено: ${sellerGets} (комиссия: ${commission})`, 'success');
              }

              // Добавляем в историю
              setAuctionHistory(prev => [{
                id: Date.now(),
                item: listing.item,
                seller: listing.sellerName,
                buyer: winningBid.bidderName,
                price: listing.currentBid,
                commission,
                type: 'auction',
                timestamp: Date.now()
              }, ...prev]);
            } else {
              // Нет ставок - возвращаем предмет продавцу
              if (listing.sellerId === 'player') {
                setPlayer(p => ({
                  ...p,
                  inventory: [...p.inventory, listing.item]
                }));
                addNotification(`Лот "${listing.item.name}" не продан. Предмет возвращен.`, 'info');
              }
            }
          }
        });

        return updated.filter(l => l.timeLeft > 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  // --- МЕХАНИКА: БИРЖА РЕСУРСОВ ---

  // Покупка ресурса
  const buyResource = (resourceId, amount) => {
    const price = resourcePrices[resourceId];
    const totalCost = price * amount;

    if (player.gold < totalCost) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }

    setPlayer(p => ({
      ...p,
      gold: p.gold - totalCost,
      resources: {
        ...p.resources,
        [resourceId]: (p.resources[resourceId] || 0) + amount
      }
    }));

    const resource = RESOURCES.find(r => r.id === resourceId);
    addNotification(`Куплено: ${amount}x ${resource.name} за ${totalCost} золота`, 'success');
    addLog(`Вы купили ${amount}x ${resource.name} за ${totalCost} золота.`, 'good');
  };

  // Продажа ресурса
  const sellResource = (resourceId, amount) => {
    if ((player.resources[resourceId] || 0) < amount) {
      addNotification('Недостаточно ресурсов!', 'error');
      return;
    }

    const price = resourcePrices[resourceId];
    const totalEarned = price * amount;

    setPlayer(p => ({
      ...p,
      gold: p.gold + totalEarned,
      resources: {
        ...p.resources,
        [resourceId]: p.resources[resourceId] - amount
      }
    }));

    const resource = RESOURCES.find(r => r.id === resourceId);
    addNotification(`Продано: ${amount}x ${resource.name} за ${totalEarned} золота`, 'success');
    addLog(`Вы продали ${amount}x ${resource.name} за ${totalEarned} золота.`, 'good');
  };

  // Обновление цен на бирже (каждые 30 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      setResourcePrices(prev => {
        const newPrices = {};
        Object.keys(prev).forEach(resourceId => {
          const basePrice = BASE_RESOURCE_PRICES[resourceId];
          const currentPrice = prev[resourceId];
          
          // Случайное изменение цены ±10%
          const change = 0.9 + Math.random() * 0.2;
          let newPrice = Math.floor(currentPrice * change);
          
          // Ограничиваем цену в пределах ±50% от базовой
          const minPrice = Math.floor(basePrice * 0.5);
          const maxPrice = Math.floor(basePrice * 1.5);
          newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
          
          newPrices[resourceId] = newPrice;
        });
        return newPrices;
      });

      // Обновляем историю цен
      setResourcePriceHistory(prev => {
        const newHistory = {};
        Object.keys(prev).forEach(resourceId => {
          const history = [...prev[resourceId]];
          history.shift(); // Удаляем самую старую цену
          history.push(resourcePrices[resourceId]); // Добавляем текущую
          newHistory[resourceId] = history;
        });
        return newHistory;
      });
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [resourcePrices]);

  // --- МЕХАНИКА: КЛАНВАРЫ ---

  // Объявить войну за территорию
  const declareWar = (territory, enemyGuild) => {
    if (!player.guildId) {
      addNotification('Вы должны быть в гильдии!', 'error');
      return;
    }

    const guild = MOCK_GUILDS.find(g => g.id === player.guildId);
    if (!guild) return;

    const guildPower = guild.members.reduce((sum, m) => sum + m.level * 100, 0);

    if (guildPower < territory.requiredPower) {
      addNotification(`Недостаточно силы гильдии! Требуется: ${territory.requiredPower}`, 'error');
      return;
    }

    // Создаем войну
    const war = {
      id: Date.now(),
      territoryId: territory.id,
      attackerGuildId: player.guildId,
      attackerGuildName: guild.name,
      defenderGuildId: enemyGuild?.id || null,
      defenderGuildName: enemyGuild?.name || 'Нейтральная территория',
      startTime: Date.now(),
      duration: 3600000, // 1 час
      attackerScore: 0,
      defenderScore: 0,
      status: 'active'
    };

    setGuildWars(prev => [...prev, war]);
    addNotification(`Война за ${territory.name} объявлена!`, 'legendary');
    addLog(`Ваша гильдия объявила войну за территорию "${territory.name}"!`, 'legendary');
  };

  // Участвовать в войне (атака)
  const participateInWar = (war) => {
    if (!player.guildId) return;

    const isAttacker = war.attackerGuildId === player.guildId;
    const isDefender = war.defenderGuildId === player.guildId;

    if (!isAttacker && !isDefender) {
      addNotification('Вы не участвуете в этой войне!', 'error');
      return;
    }

    // Симуляция боя
    const playerPower = player.level * 100 + (player.str || 0) * 10;
    const contribution = Math.floor(playerPower * (0.8 + Math.random() * 0.4));

    setGuildWars(prev => prev.map(w => {
      if (w.id === war.id) {
        if (isAttacker) {
          return { ...w, attackerScore: w.attackerScore + contribution };
        } else {
          return { ...w, defenderScore: w.defenderScore + contribution };
        }
      }
      return w;
    }));

    addNotification(`Вы внесли вклад: ${contribution} очков!`, 'success');
    addLog(`Вы участвовали в войне и заработали ${contribution} очков для гильдии.`, 'good');
  };

  // Обновление войн (проверка завершения)
  useEffect(() => {
    const interval = setInterval(() => {
      setGuildWars(prev => {
        const updated = [];
        const completed = [];

        prev.forEach(war => {
          const timeLeft = war.startTime + war.duration - Date.now();
          
          if (timeLeft <= 0 && war.status === 'active') {
            // Война завершена
            const winner = war.attackerScore > war.defenderScore ? 'attacker' : 'defender';
            const completedWar = { ...war, status: 'completed', winner };
            completed.push(completedWar);

            // Обновляем территории
            if (winner === 'attacker') {
              setGuildTerritories(prev => ({
                ...prev,
                [war.territoryId]: war.attackerGuildId
              }));

              if (war.attackerGuildId === player.guildId) {
                addNotification(`Победа! Территория захвачена!`, 'legendary');
              }
            } else {
              if (war.defenderGuildId === player.guildId) {
                addNotification(`Победа! Территория защищена!`, 'legendary');
              }
            }

            // Добавляем в историю
            setWarHistory(prev => [completedWar, ...prev].slice(0, 20));
          } else if (timeLeft > 0) {
            updated.push(war);
          }
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  // --- МЕХАНИКА: РЫБАЛКА ---

  const fishingTimerRef = useRef(null);

  const startFishing = (locationId) => {
    if (player.energy < 5) {
      addNotification('Недостаточно энергии для рыбалки!', 'error');
      return;
    }

    // Начинаем рыбалку
    setFishingState({
      inProgress: true,
      locationId: locationId,
      timeLeft: getRandomInt(5, 10), // 5-10 секунд до поклевки
      stage: 'waiting' // waiting, bite, caught
    });

    // Уменьшаем энергию
    setPlayer(p => ({
      ...p,
      energy: Math.max(0, p.energy - 5)
    }));

    addLog('Вы забросили удочку...', 'good');
    addNotification('🎣 Рыбалка началась!', 'info');

    // Таймер до поклевки
    fishingTimerRef.current = setTimeout(() => {
      setFishingState(prev => ({
        ...prev,
        stage: 'bite',
        timeLeft: 2 // 2 секунды на реакцию
      }));
      addNotification('🐟 Поклевка! Быстрее нажмите "Поймать"!', 'success');

      // Таймер на упущенную рыбу
      fishingTimerRef.current = setTimeout(() => {
        if (fishingState?.stage === 'bite') {
          setFishingState(null);
          addLog('Рыба сорвалась с крючка...', 'bad');
          addNotification('😞 Рыба ушла!', 'error');
        }
      }, 2000);
    }, getRandomInt(5000, 10000));
  };

  const catchFish = () => {
    if (!fishingState || fishingState.stage !== 'bite') {
      return;
    }

    clearTimeout(fishingTimerRef.current);

    // Определяем пойманную рыбу
    const caughtFish = determineFish(fishingState.locationId);
    
    if (caughtFish) {
      // Добавляем рыбу в ресурсы
      addResourceToInventory(caughtFish.id, 1);
      
      setFishingState({
        ...fishingState,
        stage: 'caught',
        caughtFish: caughtFish
      });

      addLog(`Вы поймали ${caughtFish.name}!`, 'good');
      addNotification(`🎣 Поймана ${caughtFish.name}!`, 'success');

      // Закрываем окно через 2 секунды
      setTimeout(() => {
        setFishingState(null);
      }, 2000);
    }
  };

  const determineFish = (locationId) => {
    // Получаем рыб доступных в этой локации
    const availableFish = FISH_DB.filter(fish => fish.locations.includes(locationId));
    
    if (availableFish.length === 0) return null;

    // Вероятности по редкости (с бонусом от уровня)
    const levelBonus = player.level * 0.5; // +0.5% за уровень
    const rarityChances = {
      common: 60 - levelBonus,
      uncommon: 25,
      rare: 10 + levelBonus * 0.3,
      epic: 4 + levelBonus * 0.2,
      legendary: 1 + levelBonus * 0.1
    };

    // Определяем редкость
    const roll = Math.random() * 100;
    let rarity = 'common';
    let cumulative = 0;
    
    for (const [r, chance] of Object.entries(rarityChances)) {
      cumulative += chance;
      if (roll <= cumulative) {
        rarity = r;
        break;
      }
    }

    // Выбираем случайную рыбу нужной редкости из доступных
    const fishOfRarity = availableFish.filter(f => f.rarity === rarity);
    if (fishOfRarity.length === 0) {
      // Если нет рыбы нужной редкости, берем любую доступную
      return availableFish[Math.floor(Math.random() * availableFish.length)];
    }

    return fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];
  };

  const cancelFishing = () => {
    if (fishingTimerRef.current) {
      clearTimeout(fishingTimerRef.current);
    }
    setFishingState(null);
    addLog('Вы прекратили рыбалку.', 'neutral');
  };

  const sellFish = (fishId, amount) => {
    const fish = FISH_DB.find(f => f.id === fishId);
    if (!fish) return;

    const playerFishAmount = player.resources?.[fishId] || 0;
    if (playerFishAmount < amount) {
      addNotification('Недостаточно рыбы!', 'error');
      return;
    }

    const totalPrice = fish.sellPrice * amount;

    setPlayer(p => ({
      ...p,
      gold: p.gold + totalPrice,
      resources: {
        ...p.resources,
        [fishId]: playerFishAmount - amount
      }
    }));

    addLog(`Продано ${amount}x ${fish.name} за ${totalPrice} золота`, 'good');
    addNotification(`💰 Продано за ${totalPrice} золота!`, 'success');
  };

  const sellAllFish = () => {
    let totalGold = 0;
    let soldCount = 0;

    const newResources = { ...player.resources };

    FISH_DB.forEach(fish => {
      const amount = player.resources?.[fish.id] || 0;
      if (amount > 0) {
        totalGold += fish.sellPrice * amount;
        soldCount += amount;
        delete newResources[fish.id];
      }
    });

    if (soldCount === 0) {
      addNotification('Нет рыбы для продажи!', 'error');
      return;
    }

    setPlayer(p => ({
      ...p,
      gold: p.gold + totalGold,
      resources: newResources
    }));

    addLog(`Продано ${soldCount} рыб за ${totalGold} золота`, 'good');
    addNotification(`💰 Продано всё за ${totalGold} золота!`, 'success');
  };

  // --- МЕХАНИКА: ПРОСМОТР СНАРЯЖЕНИЯ ---

  const handleEquipmentClick = (item, type) => {
    setSelectedEquipment({ item, type });
    setShowEquipmentModal(true);
  };

  // --- МЕХАНИКА: ШАГ ---

  const handleStep = () => {
    if (player.energy <= 0) {
      addLog("Недостаточно энергии. Отдохните немного.", 'bad');
      return;
    }

    if (stepCooldown > 0) {
      addLog("Подождите немного перед следующим шагом.", 'bad');
      return;
    }

    // Устанавливаем кулдаун 3 секунды (если нет премиума)
    // Спринт уменьшает кулдаун до 0
    if (!player.hasPremium && !sprintActive) {
      setStepCooldown(3);
    }

    const newEnergy = player.energy - 1;
    let newPlayer = { 
        ...player, 
        energy: newEnergy,
        totalSteps: (player.totalSteps || 0) + 1 // Обновляем статистику шагов
    };
    
    checkQuestProgress('step', 1);

    const roll = Math.random();
    
    if (roll < 0.15) {
      const loc = LOCATIONS.find(l => l.id === player.locationId);
      
      // Получаем пул врагов для текущей локации
      const locationEnemyNames = LOCATION_ENEMY_POOLS[loc.id] || ['Злая Крыса'];
      const enemyPool = ENEMIES_DB.filter(e => locationEnemyNames.includes(e.name));
      
      // Выбираем случайного врага из пула
      const enemyTemplate = enemyPool[getRandomInt(0, enemyPool.length - 1)] || ENEMIES_DB[0];
      
      // Проверяем, будет ли это редкий враг (10% шанс)
      const isRare = Math.random() < 0.1;
      const rareMultiplier = isRare ? 1.5 : 1;
      
      const enemy = {
        ...enemyTemplate,
        hp: Math.floor(enemyTemplate.baseHp * loc.enemyPower),
        maxHp: Math.floor(enemyTemplate.baseHp * loc.enemyPower),
        dmg: Math.floor(enemyTemplate.baseDmg * loc.enemyPower),
        exp: Math.floor(enemyTemplate.exp * rareMultiplier),
        gold: Math.floor(enemyTemplate.gold * rareMultiplier),
        isRare: isRare
      };

      setCombatState({ enemy, log: [] });
      const enemyPrefix = isRare ? 'РЕДКОГО врага' : 'врага';
      addLog(`Вы встретили ${enemyPrefix}: ${enemy.name}!`, 'bad');
      if (isRare) {
        addNotification(`Встречен редкий враг: ${enemy.name}! (+50% наград)`, 'warning');
      }
    } else if (roll < 0.25) {
      // Weighted random item selection based on rarity
      const rarityWeights = {
        common: 0.50,      // 50% chance
        uncommon: 0.30,    // 30% chance
        rare: 0.15,        // 15% chance
        epic: 0.04,        // 4% chance
        legendary: 0.01    // 1% chance
      };
      
      // Filter items by type (exclude resources from random drops)
      const droppableItems = ITEMS_DB.filter(item => item.type !== 'resource');
      
      // Select item based on weighted rarity
      let selectedItem = null;
      const rarityRoll = Math.random();
      let cumulativeWeight = 0;
      
      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        cumulativeWeight += weight;
        if (rarityRoll <= cumulativeWeight) {
          const itemsOfRarity = droppableItems.filter(item => item.rarity === rarity);
          if (itemsOfRarity.length > 0) {
            selectedItem = itemsOfRarity[getRandomInt(0, itemsOfRarity.length - 1)];
            break;
          }
        }
      }
      
      // Fallback to random item if no item selected
      if (!selectedItem) {
        selectedItem = droppableItems[getRandomInt(0, droppableItems.length - 1)];
      }
      
      newPlayer.inventory = [...newPlayer.inventory, { ...selectedItem, uid: Date.now() }];
      addLog(`Вы нашли предмет: ${selectedItem.name}!`, selectedItem.rarity === 'legendary' || selectedItem.rarity === 'epic' ? 'epic' : 'good');
      
      // Add notification based on rarity
      const notifType = selectedItem.rarity === 'legendary' ? 'legendary' : selectedItem.rarity === 'epic' ? 'warning' : 'success';
      addNotification(`Найден предмет: ${selectedItem.name}!`, notifType);
      
      checkQuestProgress('find', 1); 
    } else if (roll < 0.50) {
      // НОВОЕ: Шанс найти ресурс (35% от этого диапазона)
      if (Math.random() < 0.7) {
        const loc = LOCATIONS.find(l => l.id === player.locationId);
        const locationResources = RESOURCES.filter(r => r.locations.includes(loc.id));
        
        if (locationResources.length > 0) {
          // Выбираем случайный ресурс с учетом редкости
          const rarityChances = { common: 0.7, uncommon: 0.2, rare: 0.08, epic: 0.02 };
          let selectedResource = null;
          
          for (let i = 0; i < 10; i++) { // Пытаемся 10 раз найти подходящий ресурс
            const resource = locationResources[getRandomInt(0, locationResources.length - 1)];
            if (Math.random() < (rarityChances[resource.rarity] || 0.1)) {
              selectedResource = resource;
              break;
            }
          }
          
          if (selectedResource) {
            newPlayer.resources = { ...newPlayer.resources };
            newPlayer.resources[selectedResource.id] = (newPlayer.resources[selectedResource.id] || 0) + 1;
            addLog(`Вы нашли ресурс: ${selectedResource.name}!`, 'good');
            
            // Add notification for resource
            const notifType = selectedResource.rarity === 'epic' || selectedResource.rarity === 'rare' ? 'warning' : 'info';
            addNotification(`Найден ресурс: ${selectedResource.name}!`, notifType);
            
            // Обновляем прогресс гильдейских квестов
            updateGuildQuestProgress('collect_resources', 1);
          }
        }
      } else {
        const goldFound = getRandomInt(2, 10 * player.level);
        newPlayer.gold += goldFound;
        addLog(`Вы нашли ${goldFound} золота.`, 'good');
        checkQuestProgress('earn_gold', goldFound);
      }
    } else {
      const flavors = [
        "Вы идете по тропинке и наслаждаетесь видом.",
        "Красивый вид открывается перед вами.",
        "Вы пнули камешек и он покатился.",
        "Ничего интересного не произошло, просто прогулка.",
        "Вы услышали шорох в кустах, но это был ветер."
      ];
      addLog(flavors[getRandomInt(0, flavors.length - 1)]);
    }

    // ОЧЕНЬ МАЛЫЙ ШАНС НАЙТИ ПЕРК (0.5%)
    if (Math.random() < 0.005) {
      const availablePerks = PERKS_DB.filter(perk => !newPlayer.perks.includes(perk.id));
      if (availablePerks.length > 0) {
        // Выбираем перк с учетом редкости
        const rarityWeights = {
          uncommon: 0.50,
          rare: 0.35,
          epic: 0.12,
          legendary: 0.03
        };
        
        let selectedPerk = null;
        const rarityRoll = Math.random();
        let cumulativeWeight = 0;
        
        for (const [rarity, weight] of Object.entries(rarityWeights)) {
          cumulativeWeight += weight;
          if (rarityRoll <= cumulativeWeight) {
            const perksOfRarity = availablePerks.filter(perk => perk.rarity === rarity);
            if (perksOfRarity.length > 0) {
              selectedPerk = perksOfRarity[getRandomInt(0, perksOfRarity.length - 1)];
              break;
            }
          }
        }
        
        if (selectedPerk) {
          newPlayer.perks = [...newPlayer.perks, selectedPerk.id];
          addLog(`✨ НЕВЕРОЯТНАЯ УДАЧА! Вы получили перк: ${selectedPerk.name}!`, 'legendary');
          addNotification(`✨ Получен перк: ${selectedPerk.name}!`, 'legendary');
        }
      }
    }

    newPlayer.exp += 1;
    const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
    
    if (lvlCheck) {
      newPlayer.level = lvlCheck.lvl;
      newPlayer.exp = lvlCheck.exp;
      newPlayer.maxExp = lvlCheck.maxExp;
      newPlayer.str += lvlCheck.stats.str;
      newPlayer.def += lvlCheck.stats.def;
      newPlayer.maxHp += lvlCheck.stats.hp;
      newPlayer.hp = newPlayer.maxHp; 
      newPlayer.maxEnergy += lvlCheck.stats.energy;
      newPlayer.energy = newPlayer.maxEnergy; 
    }

    setPlayer(newPlayer);
    
    // Проверяем достижения после шага
    setTimeout(() => checkAchievements(), 100);
  };

  const handleCombatTurn = (action) => {
    if (!combatState) return;
    
    const { enemy } = combatState;
    let newEnemyHp = enemy.hp;
    let newPlayerHp = player.hp;
    let combatLog = [];

    if (action === 'attack') {
      const weaponDmg = player.equipment.weapon ? player.equipment.weapon.val : 0;
      const totalDmg = Math.floor((player.str + weaponDmg) * (getRandomInt(80, 120) / 100));
      
      // Check for critical hit (10% chance)
      const isCrit = Math.random() < 0.1;
      const finalDmg = isCrit ? Math.floor(totalDmg * 2) : totalDmg;
      
      newEnemyHp -= finalDmg;
      
      if (isCrit) {
        combatLog.push(`💥 КРИТИЧЕСКИЙ УДАР! Вы нанесли ${finalDmg} урона ${enemy.name}!`);
        setBattleEffect({ type: 'crit', target: 'enemy' });
      } else {
        combatLog.push(`Вы нанесли ${finalDmg} урона ${enemy.name}.`);
        setBattleEffect({ type: 'hit', target: 'enemy' });
      }
      
      // Clear effect after animation
      setTimeout(() => setBattleEffect(null), 500);
    } else if (action === 'flee') {
       if (Math.random() > 0.5) {
         setCombatState(null);
         addLog("Вы успешно сбежали!", 'neutral');
         return;
       } else {
         combatLog.push("Не удалось сбежать!");
       }
    }

    if (newEnemyHp <= 0) {
      let baseGoldReward = Math.floor(enemy.gold * getRandomInt(80, 120) / 100);
      let baseExpReward = enemy.exp;
      
      // Применяем бонусы гильдии
      const rewards = applyGuildBonuses(baseGoldReward, baseExpReward);
      
      // Применяем бонус от тренировочного манекена
      const trainingDummyLevel = player.homeUpgrades?.trainingDummy || 0;
      if (trainingDummyLevel > 0) {
        const expBonus = trainingDummyLevel * 5; // 5% за уровень
        rewards.exp = Math.floor(rewards.exp * (1 + expBonus / 100));
      }
      
      let newPlayer = { 
        ...player, 
        gold: player.gold + rewards.gold,
        exp: player.exp + rewards.exp,
        totalKills: (player.totalKills || 0) + 1 // Обновляем счетчик убийств
      };

      checkQuestProgress('kill', 1);
      checkQuestProgress('earn_gold', rewards.gold);
      
      // Обновляем прогресс гильдейских квестов
      updateGuildQuestProgress('kill', 1);
      updateGuildQuestProgress('earn_gold', rewards.gold);
      
      // Проверяем, является ли враг боссом (высокий уровень)
      if (enemy.baseHp >= 500) {
        updateGuildQuestProgress('boss_kills', 1);
      }

      const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
      if (lvlCheck) {
        newPlayer.level = lvlCheck.lvl;
        newPlayer.exp = lvlCheck.exp;
        newPlayer.maxExp = lvlCheck.maxExp;
        newPlayer.str += lvlCheck.stats.str;
        newPlayer.def += lvlCheck.stats.def;
        newPlayer.maxHp += lvlCheck.stats.hp;
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.maxEnergy += lvlCheck.stats.energy;
        newPlayer.energy = newPlayer.maxEnergy;
        
        // Trigger level up effect
        setLevelUpEffect(true);
        setTimeout(() => setLevelUpEffect(false), 2000);
      }

      setPlayer(newPlayer);
      setCombatState(null);
      
      // Добавляем опыт сезона за победу
      if (currentSeason) {
        addSeasonExp(Math.floor(rewards.exp * 0.5)); // 50% от обычного опыта
        updateSeasonTaskProgress('kill_enemies', 1);
        
        // Проверяем тип врага для сезонных заданий
        if (enemy.name.includes('Огненный') || enemy.name.includes('Огонь')) {
          updateSeasonTaskProgress('kill_fire_enemies', 1);
        } else if (enemy.name.includes('Ледяной') || enemy.name.includes('Лед')) {
          updateSeasonTaskProgress('kill_ice_enemies', 1);
        } else if (enemy.name.includes('Темный') || enemy.name.includes('Тень')) {
          updateSeasonTaskProgress('kill_dark_enemies', 1);
        }
      }
      
      // Check if this was a world boss battle
      if (enemy.isWorldBoss) {
        handleWorldBossDamage(enemy.bossId, enemy.maxHp - newEnemyHp);
        handleWorldBossDefeat(enemy.bossId);
        if (currentSeason) {
          updateSeasonTaskProgress('kill_boss', 1);
        }
      }
      // Check if this was a PvP battle
      else if (enemy.isPvP) {
        handlePvPVictory(enemy.opponentRating);
      } else {
        addLog(`Победа! Получено ${rewards.exp} XP и ${rewards.gold} золота.`, 'good');
        
        // Если это бой в подземелье, переходим к следующей волне
        if (dungeonState) {
          handleDungeonWaveComplete();
        }
      }
      
      // Проверяем достижения после победы
      setTimeout(() => checkAchievements(), 100);
      return;
    }

    const armorDef = player.equipment.armor ? player.equipment.armor.val : 0;
    const totalDef = player.def + armorDef;
    
    // Check for dodge (5% chance)
    const isDodge = Math.random() < 0.05;
    
    if (isDodge) {
      combatLog.push(`✨ Вы уклонились от атаки ${enemy.name}!`);
      setBattleEffect({ type: 'dodge', target: 'player' });
      setTimeout(() => setBattleEffect(null), 400);
    } else {
      const enemyDmg = Math.max(1, Math.floor(enemy.dmg * (getRandomInt(80, 120) / 100) - (totalDef * 0.5)));
      
      newPlayerHp -= enemyDmg;
      combatLog.push(`${enemy.name} нанес вам ${enemyDmg} урона.`);
      setBattleEffect({ type: 'hit', target: 'player' });
      setTimeout(() => setBattleEffect(null), 300);
    }

    if (newPlayerHp <= 0) {
      newPlayerHp = 0;
      setCombatState(null);
      
      // Check if this was a PvP battle
      if (enemy.isPvP) {
        handlePvPDefeat(enemy.opponentRating);
        setPlayer({
          ...player,
          hp: Math.floor(player.maxHp * 0.5),
          energy: Math.max(0, player.energy - 5)
        });
      } else {
        // Если игрок умер в подземелье, завершаем подземелье
        if (dungeonState) {
          setDungeonState(null);
          addLog(`Вы погибли в подземелье. Подземелье провалено.`, 'bad');
        } else {
          addLog(`Вы погибли от рук ${enemy.name}. Вы потеряли немного золота.`, 'bad');
        }
        
        setPlayer({
          ...player,
          hp: Math.floor(player.maxHp * 0.5),
          energy: 0,
          gold: Math.floor(player.gold * 0.8)
        });
      }
    } else {
      setPlayer(p => ({ ...p, hp: newPlayerHp }));
      setCombatState({ 
        ...combatState, 
        enemy: { ...enemy, hp: newEnemyHp },
        log: combatLog
      });
    }
  };

  // --- СИСТЕМА ПОДЗЕМЕЛИЙ ---

  const enterDungeon = (dungeonId) => {
    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return;

    // Проверяем уровень
    if (player.level < dungeon.minLevel) {
      addNotification(`Требуется уровень ${dungeon.minLevel}!`, 'error');
      return;
    }

    // Проверяем энергию
    if (player.energy < dungeon.energyCost) {
      addNotification('Недостаточно энергии!', 'error');
      return;
    }

    // Списываем энергию
    setPlayer(p => ({ ...p, energy: p.energy - dungeon.energyCost }));

    // Инициализируем состояние подземелья
    setDungeonState({
      dungeonId: dungeon.id,
      dungeonName: dungeon.name,
      currentWave: 1,
      totalWaves: dungeon.waves,
      enemyPool: dungeon.enemyPool,
      rewards: dungeon.rewards,
      accumulatedGold: 0,
      accumulatedExp: 0,
      accumulatedItems: []
    });

    addLog(`Вы вошли в подземелье: ${dungeon.name}!`, 'epic');
    addNotification(`Подземелье: ${dungeon.name} - Волна 1/${dungeon.waves}`, 'info');

    // Начинаем первую волну
    setTimeout(() => startDungeonWave(), 500);
  };

  const startDungeonWave = () => {
    if (!dungeonState) return;

    const { enemyPool, currentWave } = dungeonState;
    
    // Выбираем случайного врага из пула
    const enemyName = enemyPool[getRandomInt(0, enemyPool.length - 1)];
    const enemyData = ENEMIES_DB.find(e => e.name === enemyName);
    
    if (!enemyData) return;

    // Масштабируем врага по волне (каждая волна +10% к характеристикам)
    const waveMultiplier = 1 + (currentWave - 1) * 0.1;
    const scaledHp = Math.floor(enemyData.baseHp * waveMultiplier);
    const scaledDmg = Math.floor(enemyData.baseDmg * waveMultiplier);

    const enemy = {
      name: enemyData.name,
      hp: scaledHp,
      maxHp: scaledHp,
      dmg: scaledDmg,
      exp: Math.floor(enemyData.exp * waveMultiplier),
      gold: Math.floor(enemyData.gold * waveMultiplier),
      baseHp: enemyData.baseHp
    };

    setCombatState({ enemy, log: [] });
    addLog(`Волна ${currentWave}: ${enemy.name} появился!`, 'bad');
  };

  const handleDungeonWaveComplete = () => {
    if (!dungeonState) return;

    const { currentWave, totalWaves, rewards } = dungeonState;

    // Накапливаем награды
    const waveGold = getRandomInt(rewards.gold.min, rewards.gold.max) / totalWaves;
    const waveExp = getRandomInt(rewards.exp.min, rewards.exp.max) / totalWaves;

    setDungeonState(prev => ({
      ...prev,
      accumulatedGold: prev.accumulatedGold + waveGold,
      accumulatedExp: prev.accumulatedExp + waveExp
    }));

    if (currentWave < totalWaves) {
      // Переходим к следующей волне
      setDungeonState(prev => ({
        ...prev,
        currentWave: prev.currentWave + 1
      }));

      addLog(`Волна ${currentWave} завершена! Готовьтесь к волне ${currentWave + 1}...`, 'good');
      addNotification(`Волна ${currentWave + 1}/${totalWaves}`, 'info');

      // Небольшая пауза перед следующей волной
      setTimeout(() => startDungeonWave(), 2000);
    } else {
      // Подземелье завершено!
      completeDungeon();
    }
  };

  const completeDungeon = () => {
    if (!dungeonState) return;

    const { dungeonName, accumulatedGold, accumulatedExp, rewards } = dungeonState;

    // Применяем бонусы гильдии к финальным наградам
    const finalRewards = applyGuildBonuses(
      Math.floor(accumulatedGold),
      Math.floor(accumulatedExp)
    );

    // Шанс получить предмет из списка наград
    let itemReward = null;
    if (rewards.items && rewards.items.length > 0 && Math.random() < 0.5) {
      const itemId = rewards.items[getRandomInt(0, rewards.items.length - 1)];
      itemReward = ITEMS_DB.find(i => i.id === itemId);
    }

    // Обновляем игрока
    let newPlayer = {
      ...player,
      gold: player.gold + finalRewards.gold,
      exp: player.exp + finalRewards.exp,
      totalDungeonsCompleted: (player.totalDungeonsCompleted || 0) + 1
    };

    if (itemReward) {
      newPlayer.inventory = [...newPlayer.inventory, { ...itemReward, uid: Date.now() }];
    }

    // Проверяем повышение уровня
    const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
    if (lvlCheck) {
      newPlayer.level = lvlCheck.lvl;
      newPlayer.exp = lvlCheck.exp;
      newPlayer.maxExp = lvlCheck.maxExp;
      newPlayer.str += lvlCheck.stats.str;
      newPlayer.def += lvlCheck.stats.def;
      newPlayer.maxHp += lvlCheck.stats.hp;
      newPlayer.hp = newPlayer.maxHp;
      newPlayer.maxEnergy += lvlCheck.stats.energy;
      newPlayer.energy = newPlayer.maxEnergy;
    }

    setPlayer(newPlayer);

    // Обновляем прогресс гильдейских квестов
    updateGuildQuestProgress('dungeon_runs', 1);

    // Сбрасываем состояние подземелья
    setDungeonState(null);

    // Показываем награды
    addLog(`🎉 Подземелье "${dungeonName}" завершено!`, 'legendary');
    addLog(`Получено: ${finalRewards.gold} золота, ${finalRewards.exp} опыта`, 'good');
    
    if (itemReward) {
      addLog(`Получен предмет: ${itemReward.name}!`, 'epic');
      addNotification(`Получен предмет: ${itemReward.name}!`, 'legendary');
    }

    addNotification(`Подземелье завершено! +${finalRewards.gold} 💰 +${finalRewards.exp} ✨`, 'success');

    // Проверяем достижения
    setTimeout(() => checkAchievements(), 100);
  };

  const exitDungeon = () => {
    if (!dungeonState) return;

    setDungeonState(null);
    setCombatState(null);
    addLog('Вы покинули подземелье.', 'neutral');
    addNotification('Подземелье покинуто', 'info');
  };

  const equipItem = (item) => {
    let newEquipment = { ...player.equipment };
    let newInventory = player.inventory.filter(i => i.uid !== item.uid);

    if (newEquipment[item.type]) {
      newInventory.push(newEquipment[item.type]);
    }

    newEquipment[item.type] = item;
    setPlayer({ ...player, equipment: newEquipment, inventory: newInventory });
    addLog(`Вы экипировали ${item.name}.`, 'neutral');
  };

  const useItem = (item) => {
    if (item.type === 'consumable') {
      const healed = Math.min(player.maxHp - player.hp, item.val);
      setPlayer({
        ...player,
        hp: player.hp + healed,
        inventory: player.inventory.filter(i => i.uid !== item.uid)
      });
      addLog(`Вы использовали ${item.name} и восстановили ${healed} HP.`, 'good');
    }
  };

  // === ФУНКЦИИ ПИТОМЦЕВ ===
  
  const addPet = (petId) => {
    const petData = PETS_DB.find(p => p.id === petId);
    if (!petData) return;
    
    const newPet = {
      id: Date.now() + Math.random(), // Уникальный ID экземпляра
      petId: petData.id,
      name: petData.name,
      level: 1,
      exp: 0,
      maxExp: 100,
      hunger: 100, // 0-100, уменьшается со временем
      lastFed: Date.now()
    };
    
    setPlayer(p => ({
      ...p,
      pets: [...(p.pets || []), newPet]
    }));
    
    addLog(`Вы получили питомца: ${petData.name}!`, 'legendary');
    addNotification(`Новый питомец: ${petData.name}!`, 'legendary', 5000);
  };
  
  const feedPet = (petInstanceId, foodId) => {
    const food = PET_FOOD.find(f => f.id === foodId);
    if (!food) return;
    
    if (!player.petFood || player.petFood[foodId] <= 0) {
      addNotification('У вас нет этой еды!', 'error');
      return;
    }
    
    const petIndex = player.pets.findIndex(p => p.id === petInstanceId);
    if (petIndex === -1) return;
    
    const pet = player.pets[petIndex];
    const petData = PETS_DB.find(p => p.id === pet.petId);
    
    // Добавляем опыт
    let newExp = pet.exp + food.exp;
    let newLevel = pet.level;
    let newMaxExp = pet.maxExp;
    
    // Проверка повышения уровня
    while (newExp >= newMaxExp && newLevel < petData.maxLevel) {
      newExp -= newMaxExp;
      newLevel++;
      newMaxExp = Math.floor(newMaxExp * 1.5);
      addLog(`${pet.name} достиг уровня ${newLevel}!`, 'rare');
      addNotification(`${pet.name} достиг уровня ${newLevel}!`, 'success', 4000);
      
      // Проверка эволюции
      const evolution = petData.evolutions?.find(e => e.level === newLevel);
      if (evolution) {
        const evolvedPetData = PETS_DB.find(p => p.id === evolution.evolvesTo);
        if (evolvedPetData) {
          addLog(`${pet.name} эволюционировал в ${evolvedPetData.name}!`, 'legendary');
          addNotification(`${pet.name} эволюционировал в ${evolvedPetData.name}!`, 'legendary', 6000);
          
          const updatedPets = [...player.pets];
          updatedPets[petIndex] = {
            ...pet,
            petId: evolvedPetData.id,
            name: evolvedPetData.name,
            level: newLevel,
            exp: newExp,
            maxExp: newMaxExp,
            hunger: 100,
            lastFed: Date.now()
          };
          
          setPlayer(p => ({
            ...p,
            pets: updatedPets,
            petFood: {
              ...p.petFood,
              [foodId]: p.petFood[foodId] - 1
            }
          }));
          return;
        }
      }
    }
    
    // Обновляем питомца
    const updatedPets = [...player.pets];
    updatedPets[petIndex] = {
      ...pet,
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      hunger: Math.min(100, pet.hunger + 20),
      lastFed: Date.now()
    };
    
    setPlayer(p => ({
      ...p,
      pets: updatedPets,
      petFood: {
        ...p.petFood,
        [foodId]: p.petFood[foodId] - 1
      }
    }));
    
    addLog(`Вы покормили ${pet.name}`, 'good');
  };
  
  const setActivePet = (petInstanceId) => {
    setPlayer(p => ({
      ...p,
      activePet: petInstanceId
    }));
    
    const pet = player.pets.find(p => p.id === petInstanceId);
    if (pet) {
      addLog(`${pet.name} теперь ваш активный питомец!`, 'good');
      addNotification(`${pet.name} активирован!`, 'success');
    }
  };
  
  const getPetStats = (petInstance) => {
    if (!petInstance) return { damage: 0, defense: 0, healing: 0 };
    
    const petData = PETS_DB.find(p => p.id === petInstance.petId);
    if (!petData) return { damage: 0, defense: 0, healing: 0 };
    
    // Рассчитываем статы на основе уровня
    const levelMultiplier = 1 + (petInstance.level - 1) * (petData.growthRate - 1);
    
    return {
      damage: Math.floor(petData.baseStats.damage * levelMultiplier),
      defense: Math.floor(petData.baseStats.defense * levelMultiplier),
      healing: Math.floor(petData.baseStats.healing * levelMultiplier)
    };
  };
  
  const buyPetFood = (foodId, amount = 1) => {
    const food = PET_FOOD.find(f => f.id === foodId);
    if (!food) return;
    
    const totalCost = food.cost * amount;
    
    if (player.gold < totalCost) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }
    
    setPlayer(p => ({
      ...p,
      gold: p.gold - totalCost,
      petFood: {
        ...(p.petFood || {}),
        [foodId]: ((p.petFood && p.petFood[foodId]) || 0) + amount
      }
    }));
    
    addLog(`Вы купили ${food.name} x${amount} за ${totalCost} золота`, 'good');
    addNotification(`Куплено: ${food.name} x${amount}`, 'success');
  };

  // === ФУНКЦИИ СЛУЧАЙНЫХ СОБЫТИЙ ===
  
  const triggerRandomEvent = () => {
    // Проверяем, нет ли уже активного события
    if (activeEvent) return;
    
    const now = Date.now();
    
    // Фильтруем события, которые не на кулдауне
    const availableEvents = RANDOM_EVENTS.filter(event => {
      const lastTrigger = eventCooldowns[event.id] || 0;
      return now - lastTrigger >= event.cooldown;
    });
    
    if (availableEvents.length === 0) return;
    
    // Проверяем шанс для каждого события
    for (const event of availableEvents) {
      if (Math.random() < event.chance) {
        startEvent(event);
        break;
      }
    }
  };
  
  const startEvent = (event) => {
    const now = Date.now();
    
    setActiveEvent({
      ...event,
      startTime: now,
      endTime: now + event.duration
    });
    
    setEventCooldowns(prev => ({
      ...prev,
      [event.id]: now
    }));
    
    // Специальная инициализация для разных типов событий
    if (event.id === 'monster_invasion') {
      setMonsterWave(1);
    } else if (event.id === 'traveling_merchant') {
      // Генерируем случайный товар торговца
      const stock = [];
      event.specialItems.forEach(item => {
        if (Math.random() < 0.6) { // 60% шанс что товар будет в наличии
          stock.push(item);
        }
      });
      setMerchantStock(stock);
    }
    
    addLog(`🎉 СОБЫТИЕ: ${event.name}!`, 'legendary');
    addNotification(`🎉 ${event.name}!`, 'legendary', 6000);
  };
  
  const collectMeteorResources = () => {
    if (!activeEvent || activeEvent.id !== 'meteor_shower') return;
    
    if (player.energy < 5) {
      addNotification('Недостаточно энергии!', 'error');
      return;
    }
    
    const event = RANDOM_EVENTS.find(e => e.id === 'meteor_shower');
    const rewards = event.rewards;
    
    // Выбираем случайный ресурс
    const resource = rewards.resources[getRandomInt(0, rewards.resources.length - 1)];
    const amount = getRandomInt(resource.amount.min, resource.amount.max);
    const gold = getRandomInt(rewards.gold.min, rewards.gold.max);
    
    setPlayer(p => ({
      ...p,
      energy: p.energy - 5,
      gold: p.gold + gold,
      resources: {
        ...(p.resources || {}),
        [resource.id]: ((p.resources && p.resources[resource.id]) || 0) + amount
      }
    }));
    
    const resourceData = RESOURCES.find(r => r.id === resource.id);
    addLog(`Собрано: ${resourceData?.name || resource.id} x${amount}, ${gold} золота`, 'legendary');
    addNotification(`+${amount} ${resourceData?.name}, +${gold} золота`, 'success');
  };
  
  const fightMonsterWave = () => {
    if (!activeEvent || activeEvent.id !== 'monster_invasion') return;
    
    if (player.energy < 10) {
      addNotification('Недостаточно энергии! (требуется 10)', 'error');
      return;
    }
    
    // Создаем врага для волны
    const locationEnemies = LOCATION_ENEMY_POOLS[player.locationId] || ['Гоблин'];
    const enemyName = locationEnemies[getRandomInt(0, locationEnemies.length - 1)];
    const enemyData = ENEMIES_DB.find(e => e.name === enemyName) || ENEMIES_DB[0];
    
    const location = LOCATIONS.find(l => l.id === player.locationId) || LOCATIONS[0];
    const power = location.enemyPower * (1 + monsterWave * 0.2); // Каждая волна сильнее
    
    const enemy = {
      name: `${enemyName} (Волна ${monsterWave})`,
      hp: Math.floor(enemyData.baseHp * power),
      maxHp: Math.floor(enemyData.baseHp * power),
      dmg: Math.floor(enemyData.baseDmg * power),
      exp: Math.floor(enemyData.exp * power * 1.5),
      gold: Math.floor(enemyData.gold * power * 1.5),
      isEventEnemy: true
    };
    
    setPlayer(p => ({ ...p, energy: p.energy - 10 }));
    setCombatState({ enemy, log: [] });
    addLog(`Волна ${monsterWave}: ${enemy.name} атакует!`, 'bad');
  };
  
  const buyFromMerchant = (itemId, discount) => {
    const item = ITEMS_DB.find(i => i.id === itemId);
    if (!item) return;
    
    const discountedPrice = Math.floor(item.cost * (1 - discount));
    
    if (player.gold < discountedPrice) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }
    
    setPlayer(p => ({
      ...p,
      gold: p.gold - discountedPrice,
      inventory: [...p.inventory, { ...item, uid: Date.now() }]
    }));
    
    // Убираем товар из stock
    setMerchantStock(prev => prev.filter(i => i.itemId !== itemId));
    
    addLog(`Куплено у торговца: ${item.name} за ${discountedPrice} золота (скидка ${Math.floor(discount * 100)}%)`, 'good');
    addNotification(`Куплено: ${item.name}`, 'success');
  };
  
  const buyFoodFromMerchant = (foodId, discount, maxStock) => {
    const food = PET_FOOD.find(f => f.id === foodId);
    if (!food) return;
    
    const discountedPrice = Math.floor(food.cost * (1 - discount));
    
    if (player.gold < discountedPrice) {
      addNotification('Недостаточно золота!', 'error');
      return;
    }
    
    setPlayer(p => ({
      ...p,
      gold: p.gold - discountedPrice,
      petFood: {
        ...(p.petFood || {}),
        [foodId]: ((p.petFood && p.petFood[foodId]) || 0) + 1
      }
    }));
    
    addLog(`Куплено у торговца: ${food.name} за ${discountedPrice} золота`, 'good');
    addNotification(`Куплено: ${food.name}`, 'success');
  };
  
  const openTreasureVault = () => {
    if (!activeEvent || activeEvent.id !== 'treasure_vault') return;
    
    if (player.energy < 20) {
      addNotification('Недостаточно энергии! (требуется 20)', 'error');
      return;
    }
    
    const event = RANDOM_EVENTS.find(e => e.id === 'treasure_vault');
    const rewards = event.rewards;
    
    const gold = getRandomInt(rewards.gold.min, rewards.gold.max);
    const exp = getRandomInt(rewards.exp.min, rewards.exp.max);
    
    // Гарантированный редкий предмет
    const itemId = rewards.items[getRandomInt(0, rewards.items.length - 1)];
    const item = ITEMS_DB.find(i => i.id === itemId);
    
    let newPlayer = {
      ...player,
      energy: player.energy - 20,
      gold: player.gold + gold,
      exp: player.exp + exp,
      inventory: item ? [...player.inventory, { ...item, uid: Date.now() }] : player.inventory
    };
    
    // Проверяем повышение уровня
    const lvlCheck = levelUp(newPlayer.exp, newPlayer.maxExp, newPlayer.level, newPlayer.classId);
    if (lvlCheck) {
      newPlayer.level = lvlCheck.lvl;
      newPlayer.exp = lvlCheck.exp;
      newPlayer.maxExp = lvlCheck.maxExp;
      newPlayer.str += lvlCheck.stats.str;
      newPlayer.def += lvlCheck.stats.def;
      newPlayer.maxHp += lvlCheck.stats.hp;
      newPlayer.hp = Math.min(newPlayer.hp + lvlCheck.stats.hp, newPlayer.maxHp);
      newPlayer.maxEnergy += lvlCheck.stats.energy;
      newPlayer.energy = Math.min(newPlayer.energy + lvlCheck.stats.energy, newPlayer.maxEnergy);
    }
    
    setPlayer(newPlayer);
    
    addLog(`Сокровищница открыта! +${gold} золота, +${exp} опыта${item ? `, ${item.name}` : ''}`, 'legendary');
    addNotification('Сокровищница открыта!', 'legendary', 5000);
    
    // Шанс получить сундук
    if (Math.random() < rewards.chestChance) {
      const chestTypes = ['wooden', 'silver', 'gold'];
      const chestType = chestTypes[getRandomInt(0, chestTypes.length - 1)];
      const chest = CHEST_TYPES.find(c => c.id === chestType);
      if (chest) {
        const chestRewards = generateChestRewards(chest);
        setOpeningChest({ type: chest, rewards: chestRewards, stage: 'opening' });
        setChestAnimation(true);
        addNotification(`Бонус: ${chest.name}!`, 'legendary', 5000);
      }
    }
    
    // Закрываем событие
    setActiveEvent(null);
  };

  const sellItem = (item) => {
    const goldEarned = Math.floor(item.cost / 2);
    setPlayer({
      ...player,
      gold: player.gold + goldEarned,
      inventory: player.inventory.filter(i => i.uid !== item.uid)
    });
    addLog(`Вы продали ${item.name} за ${goldEarned} золота.`, 'neutral');
    checkQuestProgress('earn_gold', goldEarned);
  };

  if (gameStage === 'creation') {
    return <CharacterCreation onComplete={(data) => { setPlayer(data); setGameStage('playing'); }} />;
  }

  const PlayerAvatarIcon = AVATARS_DB.find(a => a.id === player.avatarId)?.icon || User;
  const PlayerAvatarColor = AVATARS_DB.find(a => a.id === player.avatarId)?.color || 'bg-blue-500';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* --- NOTIFICATION SYSTEM --- */}
      <NotificationSystem notifications={notifications} />
      
      {/* --- MOBILE BACKDROP --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50 transform transition-transform duration-300
        md:relative md:translate-x-0 overflow-y-auto flex flex-col
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>
         
        {/* Profile Header Block */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-slate-700/50 bg-gradient-to-b from-slate-800/30 to-transparent">
           {/* Avatar */}
           <div className="relative group cursor-pointer" onClick={() => {setActiveTab('character'); setSidebarOpen(false)}}>
             {player.customAvatar ? (
               <div className={`
                 w-32 h-32 rounded-full overflow-hidden
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.style || 'border-4 border-slate-600'}
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.glow || ''}
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.animation || ''}
                 group-hover:scale-110 transition-all duration-300 shadow-xl
               `}>
                 <img src={player.customAvatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
             ) : (
               <div className={`
                 w-32 h-32 rounded-full flex items-center justify-center ${PlayerAvatarColor}
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.style || 'border-4 border-slate-600'}
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.glow || ''}
                 ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.animation || ''}
                 group-hover:scale-110 transition-all duration-300 shadow-xl
               `}>
                 <PlayerAvatarIcon size={48} className="text-white" />
               </div>
             )}
             {/* Online Status Indicator */}
             <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
           </div>
           
           {/* Level Badge - Below Avatar */}
           <div className="mt-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full border border-slate-800 shadow-lg hover:shadow-purple-500/50 transition-shadow">
             <span className="text-xs font-bold text-white">Ур. {player.level}</span>
           </div>

           {/* Name & Stats */}
           <div className="mt-4 text-center w-full">
             <div className="text-lg font-bold text-white tracking-wide mb-2">{player.name}</div>
             
             {/* Badges */}
             <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
               <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                 {player.className}
               </span>
               {player.guildId && (
                 <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                   <Users size={10} className="inline mr-1" />
                   Guild
                 </span>
               )}
               {player.profession && (
                 <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                   <Hammer size={10} className="inline mr-1" />
                   {PROFESSIONS.find(p => p.id === player.profession)?.name || 'Профессия'}
                 </span>
               )}
             </div>
             
             {/* Mini Currency Display */}
             <div className="flex items-center justify-center gap-3 mt-4 bg-blue-900/40 px-4 py-2 rounded-lg border border-blue-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-yellow-400" />
                  <span className="text-sm font-bold text-white">{player?.gold || 0}</span>
                </div>
                <div className="w-px h-4 bg-slate-600"></div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-400" />
                  <span className="text-sm font-bold text-white">{player?.diamonds || 0}</span>
                </div>
             </div>
           </div>
        </div>

        {/* Меню Навигации */}
        <nav className="p-4 flex-1">
          
          <NavGroup title="ГЛАВНОЕ">
            <NavItem 
              label="Домой" 
              icon={LayoutDashboard} 
              active={activeTab === 'home'} 
              onClick={() => {setActiveTab('home'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Мой дом" 
              icon={Home} 
              active={activeTab === 'myhouse'} 
              onClick={() => {setActiveTab('myhouse'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Город" 
              icon={MapIcon} 
              active={activeTab === 'city'} 
              onClick={() => {setActiveTab('city'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Банк" 
              icon={Coins} 
              active={activeTab === 'bank'} 
              onClick={() => {setActiveTab('bank'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Инвентарь" 
              icon={Zap} 
              active={activeTab === 'inventory'} 
              onClick={() => {setActiveTab('inventory'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Сражения" 
              icon={Flame} 
              active={activeTab === 'battles'} 
              onClick={() => {setActiveTab('battles'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Квесты" 
              icon={CheckCircle} 
              active={activeTab === 'quests'} 
              onClick={() => {setActiveTab('quests'); setSidebarOpen(false)}} 
              badge={player.activeQuests && player.activeQuests.some(q => q.isCompleted) ? '!' : null}
            />
            <NavItem 
              label="Сундуки" 
              icon={Gift} 
              active={activeTab === 'chests'} 
              onClick={() => {setActiveTab('chests'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Фракции" 
              icon={Users} 
              active={activeTab === 'factions'} 
              onClick={() => {setActiveTab('factions'); setSidebarOpen(false)}} 
            />
          </NavGroup>

          <NavGroup title="СОБЫТИЯ">
            <NavItem 
              label="Арена" 
              icon={Swords} 
              active={activeTab === 'arena'} 
              onClick={() => {setActiveTab('arena'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Рыбалка" 
              icon={Wind} 
              active={activeTab === 'fishing'} 
              onClick={() => {setActiveTab('fishing'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Сезоны" 
              icon={Calendar} 
              active={activeTab === 'seasons'} 
              onClick={() => {setActiveTab('seasons'); setSidebarOpen(false)}} 
              badge={currentSeason && currentSeason.rewards[currentSeason.playerLevel] && !currentSeason.claimedRewards.includes(currentSeason.playerLevel) ? '!' : null}
            />
          </NavGroup>

          <NavGroup title="ПЕРСОНАЖ">
            <NavItem 
              label="Ваш персонаж" 
              icon={Shield} 
              active={activeTab === 'character'} 
              onClick={() => {setActiveTab('character'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Профессия" 
              icon={Briefcase} 
              active={activeTab === 'profession'} 
              onClick={() => {setActiveTab('profession'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Крафт" 
              icon={Sparkles} 
              active={activeTab === 'craft'} 
              onClick={() => {setActiveTab('craft'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Питомцы" 
              icon={Heart} 
              active={activeTab === 'pets'} 
              onClick={() => {setActiveTab('pets'); setSidebarOpen(false)}} 
              badge={player.pets && player.pets.length > 0 ? player.pets.length : null}
            />
            <NavItem 
              label="Кузница" 
              icon={Hammer} 
              active={activeTab === 'forge'} 
              onClick={() => {setActiveTab('forge'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Наставничество" 
              icon={Users} 
              active={activeTab === 'mentorship'} 
              onClick={() => {setActiveTab('mentorship'); setSidebarOpen(false)}} 
            />
             <NavItem 
              label="Коллекции" 
              icon={Folder} 
              active={activeTab === 'collections'} 
              onClick={() => {setActiveTab('collections'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Гильдии" 
              icon={Users} 
              active={activeTab === 'guilds'} 
              onClick={() => {setActiveTab('guilds'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Друзья" 
              icon={Heart} 
              active={activeTab === 'friends'} 
              onClick={() => {setActiveTab('friends'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Свадьбы" 
              icon={Crown} 
              active={activeTab === 'marriage'} 
              onClick={() => {setActiveTab('marriage'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Достижения" 
              icon={Trophy} 
              active={activeTab === 'achievements'} 
              onClick={() => {setActiveTab('achievements'); setSidebarOpen(false)}} 
              badge={player.unclaimedAchievements && player.unclaimedAchievements.length > 0 ? player.unclaimedAchievements.length : null}
            />
            <NavItem 
              label="Рейтинг" 
              icon={Trophy} 
              active={activeTab === 'leaderboard'} 
              onClick={() => {setActiveTab('leaderboard'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Аукцион" 
              icon={Package} 
              active={activeTab === 'auction'} 
              onClick={() => {setActiveTab('auction'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Биржа ресурсов" 
              icon={Coins} 
              active={activeTab === 'exchange'} 
              onClick={() => {setActiveTab('exchange'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Магазин" 
              icon={ShoppingBag} 
              active={activeTab === 'shop'} 
              onClick={() => {setActiveTab('shop'); setSidebarOpen(false)}} 
            />
            <NavItem 
              label="Настройки" 
              icon={Settings} 
              active={activeTab === 'settings'} 
              onClick={() => {setActiveTab('settings'); setSidebarOpen(false)}} 
            />
          </NavGroup>

        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full relative bg-slate-900">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300">
            <Menu />
          </button>
          <span className="font-bold text-slate-100">SimpleMMO</span>
          <div className="w-6"></div> 
        </header>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 p-3 md:p-4 shadow-lg z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
            <ProgressBar value={player.hp} max={player.maxHp} color="bg-gradient-to-r from-red-600 to-red-500" label="HP" icon={Heart} />
            <ProgressBar 
              value={player.energy} 
              max={player.maxEnergy} 
              color={player.energy < 5 ? 'bg-gradient-to-r from-orange-600 to-orange-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'} 
              label="Энергия" 
              icon={Zap} 
            />
            <ProgressBar value={player.exp} max={player.maxExp} color="bg-gradient-to-r from-green-600 to-emerald-500" label="Опыт" icon={Trophy} />
          </div>
        </div>

        {/* Level Up Overlay */}
        {showLevelUp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-2xl transform scale-125 animate-bounce">
              НОВЫЙ УРОВЕНЬ!
            </div>
          </div>
        )}

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
              {/* Заголовок */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Palette size={28} className="text-purple-400 drop-shadow-glow" />
                  <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Выбор аватара</h2>
                    <p className="text-sm text-slate-400">Выберите новый аватар для вашего персонажа</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Сетка аватаров */}
              <div className="p-6">
                {/* Кнопка загрузки своей аватарки */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <ImageIcon size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Своя аватарка</h3>
                        <p className="text-xs text-slate-400">Загрузите изображение с устройства</p>
                      </div>
                    </div>
                    <label className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold text-sm cursor-pointer transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2">
                      <Upload size={16} />
                      Загрузить
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const imageUrl = event.target?.result;
                              setPlayer(prev => ({
                                ...prev,
                                customAvatar: imageUrl
                              }));
                              addNotification('Аватарка загружена!', 'success');
                              setShowAvatarPicker(false);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {player.customAvatar && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500">
                        <img src={player.customAvatar} alt="Custom" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => {
                          setPlayer(prev => ({
                            ...prev,
                            customAvatar: null
                          }));
                          addNotification('Своя аватарка удалена', 'info');
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-all"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {AVATARS_DB.map(avatar => {
                    const AvatarIcon = avatar.icon;
                    const isCollected = player.collectedAvatars?.includes(avatar.id);
                    const isCurrent = player.avatarId === avatar.id;
                    const rarityColors = {
                      common: 'border-slate-600 hover:border-slate-500',
                      uncommon: 'border-green-600 hover:border-green-500',
                      rare: 'border-blue-600 hover:border-blue-500',
                      epic: 'border-purple-600 hover:border-purple-500',
                      legendary: 'border-orange-600 hover:border-orange-500'
                    };

                    return (
                      <button
                        key={avatar.id}
                        onClick={() => {
                          if (isCollected) {
                            setPlayer(prev => ({
                              ...prev,
                              avatarId: avatar.id
                            }));
                            addNotification(`Аватар изменен на "${avatar.name}"`, 'success');
                            setShowAvatarPicker(false);
                          } else {
                            addNotification('Этот аватар еще не разблокирован!', 'error');
                          }
                        }}
                        disabled={!isCollected}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all duration-200
                          ${isCurrent ? 'ring-4 ring-blue-500 scale-105' : ''}
                          ${isCollected ? `${avatar.color} ${rarityColors[avatar.rarity]} hover:scale-110 cursor-pointer` : 'bg-slate-900/50 border-slate-800 opacity-40 cursor-not-allowed'}
                        `}
                      >
                        {/* Иконка текущего */}
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        )}

                        {/* Замок для неразблокированных */}
                        {!isCollected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={32} className="text-slate-700" />
                          </div>
                        )}

                        {/* Аватар */}
                        <div className={`flex flex-col items-center gap-2 ${!isCollected ? 'opacity-30' : ''}`}>
                          <AvatarIcon size={48} className="text-white drop-shadow-lg" />
                          <div className="text-xs font-bold text-white text-center truncate w-full">{avatar.name}</div>
                          <div className={`text-[10px] uppercase font-bold ${
                            avatar.rarity === 'legendary' ? 'text-orange-400' :
                            avatar.rarity === 'epic' ? 'text-purple-400' :
                            avatar.rarity === 'rare' ? 'text-blue-400' :
                            avatar.rarity === 'uncommon' ? 'text-green-400' :
                            'text-slate-400'
                          }`}>
                            {avatar.rarity}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Подсказка */}
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-bold mb-1">Как разблокировать аватары?</p>
                      <p className="text-blue-300/80">Собирайте аватары в разделе "Коллекции". Найденные аватары можно использовать здесь.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Modal */}
        {showEquipmentModal && selectedEquipment && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowEquipmentModal(false)}
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-md w-full animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Заголовок */}
              <div className={`bg-gradient-to-r p-6 border-b border-slate-700 flex items-center justify-between ${
                selectedEquipment.item.rarity === 'legendary' ? 'from-orange-900/50 to-red-900/50 border-orange-500/30' :
                selectedEquipment.item.rarity === 'epic' ? 'from-purple-900/50 to-pink-900/50 border-purple-500/30' :
                selectedEquipment.item.rarity === 'rare' ? 'from-blue-900/50 to-cyan-900/50 border-blue-500/30' :
                selectedEquipment.item.rarity === 'uncommon' ? 'from-green-900/50 to-emerald-900/50 border-green-500/30' :
                'from-slate-800 to-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  {selectedEquipment.type === 'weapon' ? (
                    <Sword size={28} className={`drop-shadow-glow ${
                      selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                      selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                      selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                      selectedEquipment.item.rarity === 'uncommon' ? 'text-green-400' :
                      'text-slate-400'
                    }`} />
                  ) : (
                    <Shield size={28} className={`drop-shadow-glow ${
                      selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                      selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                      selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                      selectedEquipment.item.rarity === 'uncommon' ? 'text-green-400' :
                      'text-slate-400'
                    }`} />
                  )}
                  <div>
                    <h2 className={`text-2xl font-black ${
                      selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                      selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                      selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                      selectedEquipment.item.rarity === 'uncommon' ? 'text-green-400' :
                      'text-white'
                    }`}>
                      {selectedEquipment.item.name}
                    </h2>
                    <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">
                      {selectedEquipment.type === 'weapon' ? 'Оружие' : 'Броня'} • {selectedEquipment.item.rarity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Контент */}
              <div className="p-6 space-y-4">
                {/* Основные характеристики */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Характеристики</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-2">
                        {selectedEquipment.type === 'weapon' ? (
                          <>
                            <Sword size={16} className="text-red-400" />
                            Урон
                          </>
                        ) : (
                          <>
                            <Shield size={16} className="text-blue-400" />
                            Защита
                          </>
                        )}
                      </span>
                      <span className={`text-xl font-bold ${
                        selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                        selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                        selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                        selectedEquipment.item.rarity === 'uncommon' ? 'text-green-400' :
                        'text-white'
                      }`}>
                        +{selectedEquipment.item.val}
                      </span>
                    </div>
                    {selectedEquipment.item.cost && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <span className="text-slate-300 flex items-center gap-2">
                          <Coins size={16} className="text-yellow-400" />
                          Стоимость
                        </span>
                        <span className="text-lg font-bold text-yellow-400">
                          {selectedEquipment.item.cost}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Эффекты */}
                {selectedEquipment.item.effect && (
                  <div className={`rounded-xl p-4 border-2 ${
                    selectedEquipment.item.rarity === 'legendary' ? 'bg-orange-900/20 border-orange-500/50' :
                    selectedEquipment.item.rarity === 'epic' ? 'bg-purple-900/20 border-purple-500/50' :
                    selectedEquipment.item.rarity === 'rare' ? 'bg-blue-900/20 border-blue-500/50' :
                    'bg-green-900/20 border-green-500/50'
                  }`}>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles size={16} className={
                        selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                        selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                        selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                        'text-green-400'
                      } />
                      Особый эффект
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {selectedEquipment.item.effect}
                    </p>
                  </div>
                )}

                {/* Редкость */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[...Array(
                    selectedEquipment.item.rarity === 'legendary' ? 5 :
                    selectedEquipment.item.rarity === 'epic' ? 4 :
                    selectedEquipment.item.rarity === 'rare' ? 3 :
                    selectedEquipment.item.rarity === 'uncommon' ? 2 : 1
                  )].map((_, i) => (
                    <Sparkles 
                      key={i} 
                      size={16} 
                      className={`${
                        selectedEquipment.item.rarity === 'legendary' ? 'text-orange-400' :
                        selectedEquipment.item.rarity === 'epic' ? 'text-purple-400' :
                        selectedEquipment.item.rarity === 'rare' ? 'text-blue-400' :
                        selectedEquipment.item.rarity === 'uncommon' ? 'text-green-400' :
                        'text-slate-400'
                      } ${selectedEquipment.item.rarity === 'legendary' ? 'animate-pulse' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto relative">
          
          {/* Level Up Effect Overlay */}
          {levelUpEffect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="animate-level-up">
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-2xl">
                  ⭐ LEVEL UP! ⭐
                </div>
                {/* Particles */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-particle"
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 100}%`,
                      top: `${50 + (Math.random() - 0.5) * 100}%`,
                      '--particle-x': `${(Math.random() - 0.5) * 200}px`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* --- BATTLE MODE --- */}
          {combatState ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
              {/* Боевой экран */}
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl border-2 border-red-900/50 shadow-2xl overflow-hidden relative">
                {/* Анимированный фон */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
                
                {/* Заголовок */}
                <div className="relative z-10 bg-gradient-to-r from-red-900/50 to-orange-900/50 p-4 border-b-2 border-red-800/50">
                  <h2 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center gap-2">
                    <Sword size={28} className="text-red-500 drop-shadow-glow" />
                    {dungeonState ? `${dungeonState.dungeonName} - Волна ${dungeonState.currentWave}/${dungeonState.totalWaves}` : 'Сражение!'}
                    <Sword size={28} className="text-red-500 drop-shadow-glow" />
                  </h2>
                  {dungeonState && (
                    <div className="mt-2 flex justify-center">
                      <div className="bg-purple-900/50 px-4 py-1 rounded-full border border-purple-700/50">
                        <span className="text-purple-300 text-sm font-bold">
                          🏰 Подземелье
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 p-6">
                  {/* Бойцы */}
                  <div className="flex justify-between items-start mb-8">
                    {/* Игрок */}
                    <div className="text-center flex-1 relative">
                      <div className={`w-24 h-24 rounded-2xl mx-auto mb-3 flex items-center justify-center ${PlayerAvatarColor} border-4 border-blue-500 shadow-xl shadow-blue-500/50 relative group ${
                        battleEffect?.target === 'player' ? (
                          battleEffect.type === 'hit' ? 'animate-hit' :
                          battleEffect.type === 'dodge' ? 'animate-dodge' :
                          battleEffect.type === 'heal' ? 'animate-heal' : ''
                        ) : ''
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <PlayerAvatarIcon className="text-white drop-shadow-lg relative z-10" size={48} />
                        <div className="absolute -bottom-2 bg-blue-600 text-xs px-3 py-1 rounded-full border-2 border-slate-900 font-bold shadow-lg">
                          Lvl {player.level}
                        </div>
                      </div>
                      
                      {/* Battle effect text for player */}
                      {battleEffect?.target === 'player' && (
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 font-black text-2xl animate-in fade-in zoom-in duration-300 ${
                          battleEffect.type === 'dodge' ? 'text-cyan-400' :
                          battleEffect.type === 'heal' ? 'text-green-400' :
                          'text-red-500'
                        }`}>
                          {battleEffect.type === 'dodge' ? '✨ УКЛОНЕНИЕ!' : 
                           battleEffect.type === 'heal' ? '💚 ЛЕЧЕНИЕ!' : 
                           '💥'}
                        </div>
                      )}
                      
                      <div className="font-bold text-xl text-white mb-2">{player.name}</div>
                      
                      {/* HP Bar игрока */}
                      <div className="bg-slate-950 rounded-full h-6 overflow-hidden border-2 border-slate-700 shadow-inner mb-1">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                        >
                          {player.hp > 0 && `${player.hp}`}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mb-3">{player.hp}/{player.maxHp} HP</div>
                      
                      {/* Статы игрока */}
                      <div className="flex gap-2 justify-center h-8">
                        <div className="bg-red-900/30 px-2 py-1 rounded border border-red-800/50 text-xs flex items-center">
                          <Sword size={12} className="inline text-red-400 mr-1" /> {player.str + (player.equipment.weapon?.val || 0)}
                        </div>
                        <div className="bg-blue-900/30 px-2 py-1 rounded border border-blue-800/50 text-xs flex items-center">
                          <Shield size={12} className="inline text-blue-400 mr-1" /> {player.def + (player.equipment.armor?.val || 0)}
                        </div>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="text-4xl font-black text-red-500 mx-8 animate-pulse drop-shadow-glow self-center">VS</div>

                    {/* Враг */}
                    <div className="text-center flex-1 relative">
                      <div className={`w-24 h-24 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 border-4 border-red-500 shadow-xl shadow-red-500/50 relative ${
                        battleEffect?.target === 'enemy' ? (
                          battleEffect.type === 'hit' ? 'animate-hit' :
                          battleEffect.type === 'crit' ? 'animate-crit' : ''
                        ) : ''
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                        <Skull size={48} className="text-red-500 drop-shadow-glow relative z-10 animate-pulse" />
                      </div>
                      
                      {/* Battle effect text for enemy */}
                      {battleEffect?.target === 'enemy' && battleEffect.type === 'crit' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 font-black text-3xl text-yellow-400 animate-in fade-in zoom-in duration-300 drop-shadow-glow">
                          💥 КРИТ!
                        </div>
                      )}
                      
                      <div className="font-bold text-xl text-white mb-2">{combatState.enemy.name}</div>
                      
                      {/* HP Bar врага */}
                      <div className="bg-slate-950 rounded-full h-6 overflow-hidden border-2 border-slate-700 shadow-inner mb-1">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-600 to-red-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{ width: `${(combatState.enemy.hp / combatState.enemy.maxHp) * 100}%` }}
                        >
                          {combatState.enemy.hp > 0 && `${combatState.enemy.hp}`}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mb-3">{combatState.enemy.hp}/{combatState.enemy.maxHp} HP</div>
                      
                      {/* Пустое место для выравнивания */}
                      <div className="h-8"></div>
                    </div>
                  </div>

                  {/* Лог боя */}
                  <div className="mb-6 bg-slate-950/80 rounded-xl p-4 h-40 overflow-y-auto border-2 border-slate-800 shadow-inner backdrop-blur-sm">
                    {combatState.log.length === 0 && (
                      <div className="text-slate-600 text-center italic h-full flex items-center justify-center">
                        <Flame className="mr-2 text-orange-500 animate-pulse" size={20} />
                        Битва начинается...
                      </div>
                    )}
                    {combatState.log.map((l, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1 animate-in slide-in-from-left duration-200" style={{animationDelay: `${i * 50}ms`}}>
                        {l}
                      </div>
                    ))}
                  </div>

                  {/* Зелья в бою */}
                  {player.inventory.filter(item => item.type === 'consumable').length > 0 && (
                    <div className="mb-6 bg-gradient-to-br from-purple-950/30 to-slate-950/30 rounded-xl p-4 border-2 border-purple-900/50">
                      <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                        <FlaskConical size={16} className="text-purple-400" />
                        Зелья
                      </h3>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {player.inventory
                          .filter(item => item.type === 'consumable')
                          .slice(0, 5)
                          .map((potion) => {
                            const rarityClass = RARITY_COLORS[potion.rarity] || RARITY_COLORS.common;
                            return (
                              <button
                                key={potion.uid}
                                onClick={() => {
                                  const healAmount = potion.val;
                                  const newHp = Math.min(player.hp + healAmount, player.maxHp);
                                  setPlayer(prev => ({
                                    ...prev,
                                    hp: newHp,
                                    inventory: prev.inventory.filter(i => i.uid !== potion.uid)
                                  }));
                                  setCombatState(prev => ({
                                    ...prev,
                                    log: [...prev.log, `💚 Вы использовали ${potion.name} и восстановили ${healAmount} HP!`]
                                  }));
                                  addNotification(`Использовано: ${potion.name} (+${healAmount} HP)`, 'success');
                                }}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg ${RARITY_BG[potion.rarity]} border-2 ${rarityClass.split(' ')[1]} flex flex-col items-center justify-center hover:scale-110 transition-all shadow-lg hover:shadow-purple-500/50 group relative`}
                                title={potion.name}
                              >
                                <Heart size={24} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`} />
                                <span className="text-[10px] font-bold text-white mt-1">+{potion.val}</span>
                                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900">
                                  {player.inventory.filter(i => i.id === potion.id).length}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleCombatTurn('attack')}
                      className="py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold text-lg text-white transition-all shadow-xl hover:shadow-red-500/50 active:scale-95 flex items-center justify-center gap-2 border-2 border-red-500/50"
                    >
                      <Sword size={24} className="drop-shadow-glow" />
                      Атака
                    </button>
                    {dungeonState ? (
                      <button
                        onClick={() => {
                          if (window.confirm('Вы уверены, что хотите покинуть подземелье? Весь прогресс будет потерян!')) {
                            exitDungeon();
                          }
                        }}
                        className="py-4 px-6 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-bold text-lg text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border-2 border-purple-600/50"
                      >
                        <X size={24} />
                        Выйти
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCombatTurn('flee')}
                        className="py-4 px-6 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl font-bold text-lg text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border-2 border-slate-600/50"
                      >
                        <Footprints size={24} />
                        Бежать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* --- TAB: ДОМОЙ (ПУТЕШЕСТВИЕ) --- */}
              {activeTab === 'home' && (
                <div className="flex flex-col h-full relative">
                  {/* Container for the visual scene */}
                  <div className="relative h-2/3 w-full overflow-hidden flex flex-col items-center justify-center group">
                    
                    {/* --- BACKGROUND LAYERS --- */}
                    {/* Background image */}
                    <div 
                      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: 'url(/rpg-game/forest-lake.jpg)',
                        filter: 'brightness(0.8)'
                      }}
                    ></div>
                    {/* Overlay gradient for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-0"></div>

                    {/* --- CONTENT OVERLAY --- */}
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      {/* Party Button */}
                      <button 
                        onClick={() => setShowPartyMenu(!showPartyMenu)}
                        className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded border border-white/10 flex items-center gap-1 backdrop-blur-sm transition-colors relative"
                      >
                        <Users size={14} /> Вечеринка
                        {player?.friends && player.friends.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                            {player.friends.length}
                          </span>
                        )}
                      </button>
                      
                      {/* Potions Button */}
                      <button 
                        onClick={() => setShowPotionsMenu(!showPotionsMenu)}
                        className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded border border-white/10 flex items-center gap-1 backdrop-blur-sm transition-colors relative"
                      >
                        <FlaskConical size={14} /> Зелья
                        {player?.inventory && player.inventory.filter(item => ITEMS_DB.find(i => i.id === item.id && i.type === 'consumable')).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                            {player.inventory.filter(item => ITEMS_DB.find(i => i.id === item.id && i.type === 'consumable')).length}
                          </span>
                        )}
                      </button>
                      
                      {/* Sprint Button */}
                      <button 
                        onClick={() => {
                          if (!sprintActive && player.energy >= 10) {
                            setSprintActive(true);
                            setSprintDuration(30);
                            setPlayer(p => ({ ...p, energy: p.energy - 10 }));
                            addNotification('Спринт активирован! Кулдаун шагов уменьшен на 30 секунд', 'success');
                          }
                        }}
                        disabled={sprintActive || player.energy < 10}
                        className={`text-white text-xs px-3 py-1.5 rounded border flex items-center gap-1 backdrop-blur-sm transition-colors ${
                          sprintActive 
                            ? 'bg-green-600/60 border-green-400/30 cursor-not-allowed' 
                            : player.energy < 10
                            ? 'bg-black/40 border-white/10 cursor-not-allowed opacity-50'
                            : 'bg-black/60 hover:bg-black/80 border-white/10'
                        }`}
                      >
                        <Wind size={14} /> {sprintActive ? `${sprintDuration}с` : 'Спринт'}
                      </button>
                    </div>
                    
                    {/* Potions Quick Menu */}
                    {showPotionsMenu && (
                      <div className="absolute top-16 right-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg p-4 shadow-2xl z-30 w-64 animate-in fade-in zoom-in duration-200">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                          <FlaskConical size={16} />
                          Быстрые зелья
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {player?.inventory && player.inventory
                            .filter(item => ITEMS_DB.find(i => i.id === item.id && i.type === 'consumable'))
                            .map((item, idx) => {
                              const itemData = ITEMS_DB.find(i => i.id === item.id);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (itemData.effect && itemData.effect.includes('Восстанавливает')) {
                                      const healAmount = itemData.val;
                                      setPlayer(p => ({
                                        ...p,
                                        hp: Math.min(p.maxHp, p.hp + healAmount),
                                        inventory: p.inventory.filter((_, i) => i !== idx)
                                      }));
                                      addNotification(`Использовано: ${itemData.name} (+${healAmount} HP)`, 'success');
                                      setShowPotionsMenu(false);
                                    }
                                  }}
                                  className="w-full bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded border border-slate-600/50 text-left transition-colors"
                                >
                                  <div className="text-white text-sm font-bold">{itemData.name}</div>
                                  <div className="text-slate-400 text-xs">{itemData.effect || `+${itemData.val} HP`}</div>
                                </button>
                              );
                            })}
                          {(!player?.inventory || player.inventory.filter(item => ITEMS_DB.find(i => i.id === item.id && i.type === 'consumable')).length === 0) && (
                            <div className="text-slate-400 text-sm text-center py-4">
                              Нет зелий в инвентаре
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Party Quick Menu */}
                    {showPartyMenu && (
                      <div className="absolute top-16 right-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg p-4 shadow-2xl z-30 w-64 animate-in fade-in zoom-in duration-200">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                          <Users size={16} />
                          Вечеринка
                        </h4>
                        <div className="space-y-2">
                          {player?.friends && player.friends.length > 0 ? (
                            <>
                              <div className="text-slate-300 text-xs mb-2">Пригласить друзей:</div>
                              {player.friends.slice(0, 5).map((friend, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    addNotification(`Приглашение отправлено ${friend.name}`, 'info');
                                    setShowPartyMenu(false);
                                  }}
                                  className="w-full bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded border border-slate-600/50 text-left transition-colors flex items-center gap-2"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                  </div>
                                  <div>
                                    <div className="text-white text-sm font-bold">{friend.name}</div>
                                    <div className="text-slate-400 text-xs">Уровень {friend.level}</div>
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="text-slate-400 text-sm text-center py-4">
                              Добавьте друзей, чтобы создать вечеринку
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 w-full max-w-lg px-4 mb-8">
                       <div className="bg-black/90 text-center p-8 rounded-xl border border-slate-600/50 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200">
                         <h3 className="text-white font-bold mb-3 text-xl tracking-wide drop-shadow-lg">Ты делаешь шаг...</h3>
                         <p className="text-slate-100 text-base leading-relaxed font-medium drop-shadow-md">
                           {lastStepText}
                         </p>
                       </div>
                    </div>

                    <div className="relative z-10 flex gap-3">
                      <Button 
                        onClick={handleStep} 
                        variant="purple" 
                        className="px-10 py-4 text-xl font-bold rounded-lg transform transition-transform active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)] border border-indigo-400/30"
                        disabled={stepCooldown > 0}
                      >
                         <Footprints size={28} /> 
                         {stepCooldown > 0 ? `Подождите ${stepCooldown}с` : 'Сделай шаг'}
                      </Button>
                      <Button
                        onClick={() => setShowUpgradesModal(true)}
                        variant="purple"
                        className="px-6 py-4 text-xl font-bold rounded-lg transform transition-transform active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)] border border-indigo-400/30"
                      >
                        <Hammer size={28} />
                      </Button>
                    </div>
                    {!player.hasPremium && (
                      <p className="text-xs text-slate-400 text-center mt-2">
                        Купите валюту в магазине, чтобы снять ограничение 3 секунд
                      </p>
                    )}

                    <div className="absolute bottom-6 left-6 bg-black/60 px-4 py-1.5 rounded-full text-xs text-slate-300 border border-white/10 backdrop-blur-md flex items-center gap-2 z-10 cursor-pointer hover:bg-black/80 transition-colors group" onClick={() => setShowLocationSelector(!showLocationSelector)}>
                      <MapPin size={14} className="text-green-400" />
                      {LOCATIONS.find(l => l.id === player.locationId)?.name}
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    
                    {/* Location Selector Popup */}
                    {showLocationSelector && (
                      <div className="absolute bottom-20 left-6 bg-slate-900 border border-slate-700 rounded-lg p-4 z-20 w-80 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-bold text-sm">Выбрать локацию</h3>
                          <button onClick={() => setShowLocationSelector(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                          {LOCATIONS.map(loc => {
                            const isUnlocked = player.level >= loc.minLvl;
                            const isCurrent = loc.id === player.locationId;
                            return (
                              <button
                                key={loc.id}
                                onClick={() => {
                                  if (isUnlocked && !isCurrent) {
                                    setPlayer(prev => ({ ...prev, locationId: loc.id }));
                                    addLog(`Вы отправились в: ${loc.name}`, 'info');
                                    setShowLocationSelector(false);
                                  }
                                }}
                                disabled={!isUnlocked || isCurrent}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                  isCurrent 
                                    ? 'bg-green-900/20 border-green-700 cursor-default' 
                                    : isUnlocked 
                                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 cursor-pointer' 
                                      : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-bold text-sm ${isCurrent ? 'text-green-400' : isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                    {loc.name}
                                    {isCurrent && <span className="ml-2 text-xs text-green-500">(текущая)</span>}
                                  </span>
                                  {!isUnlocked && (
                                    <Lock size={14} className="text-red-400" />
                                  )}
                                </div>
                                <p className={`text-xs ${isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {loc.text}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                  <span className={isUnlocked ? 'text-slate-500' : 'text-red-400'}>
                                    Уровень: {loc.minLvl}
                                  </span>
                                  <span className={isUnlocked ? 'text-amber-500' : 'text-slate-600'}>
                                    Сложность: {loc.enemyPower}x
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* History Log Section */}
                  <div className="h-1/3 bg-[#0b0f19] p-4 border-t border-slate-800 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-[#475569] uppercase mb-3 tracking-widest pl-2 border-l-2 border-blue-900">История</div>
                    <div className="space-y-1">
                       {logs.slice(-6).reverse().map(log => {
                         const timeOptions = { hour: '2-digit', minute: '2-digit' };
                         return (
                           <div key={log.id} className={`text-sm py-1 px-2 rounded hover:bg-white/5 transition-colors ${log.type}`}>
                             <span className="text-slate-600 text-xs mr-3 font-mono">[{new Date(log.id).toLocaleTimeString([], timeOptions)}]</span>
                             {log.text}
                           </div>
                         );
                       })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: БАНК --- */}
              {activeTab === 'bank' && (
                <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Заголовок банка */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-amber-200 mb-1">Банк</h2>
                      <p className="text-slate-400 text-sm">Храните свое золото в безопасности</p>
                    </div>
                  </div>

                  {/* Баланс */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Золото в кармане */}
                    <div className="bg-gradient-to-br from-yellow-950/30 to-slate-950 rounded-xl border-2 border-yellow-700/50 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                            <Coins size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-yellow-600 uppercase font-bold tracking-wider">В кармане</div>
                            <div className="text-3xl font-black text-yellow-400 drop-shadow-glow">{player.gold}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">Золото, которое вы носите с собой</p>
                      </div>
                    </div>

                    {/* Золото в банке */}
                    <div className="bg-gradient-to-br from-blue-950/30 to-slate-950 rounded-xl border-2 border-blue-700/50 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                            <Lock size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-blue-600 uppercase font-bold tracking-wider">В банке</div>
                            <div className="text-3xl font-black text-blue-400 drop-shadow-glow">{player.bankGold || 0}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">Золото под надежной защитой</p>
                      </div>
                    </div>
                  </div>

                  {/* Общий баланс */}
                  <div className="bg-gradient-to-br from-purple-950/30 to-slate-950 rounded-xl border-2 border-purple-700/50 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-purple-400 uppercase font-bold tracking-wider mb-1">Общий баланс</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-glow">
                          {player.gold + (player.bankGold || 0)}
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                        <Trophy size={32} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Операции */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Пополнить счет */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Download size={20} className="text-green-400" />
                        Пополнить счет
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Внесите золото из кармана на банковский счет</p>
                      
                      <div className="space-y-3">
                        {[100, 500, 1000, 5000].map(amount => (
                          <button
                            key={amount}
                            onClick={() => {
                              if (player.gold >= amount) {
                                setPlayer(p => ({
                                  ...p,
                                  gold: p.gold - amount,
                                  bankGold: (p.bankGold || 0) + amount
                                }));
                                addNotification(`💰 Внесено ${amount} золота в банк`, 'success');
                                addLog(`Вы внесли ${amount} золота в банк`, 'good');
                              } else {
                                addNotification('Недостаточно золота в кармане!', 'error');
                              }
                            }}
                            disabled={player.gold < amount}
                            className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                              player.gold >= amount
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white active:scale-95 hover:shadow-green-500/50'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <Download size={16} />
                            Внести {amount}
                            <Coins size={16} className={player.gold >= amount ? 'text-yellow-300' : 'text-slate-600'} />
                          </button>
                        ))}
                        
                        {/* Внести все */}
                        <button
                          onClick={() => {
                            if (player.gold > 0) {
                              const amount = player.gold;
                              setPlayer(p => ({
                                ...p,
                                gold: 0,
                                bankGold: (p.bankGold || 0) + amount
                              }));
                              addNotification(`💰 Внесено ${amount} золота в банк`, 'success');
                              addLog(`Вы внесли все золото (${amount}) в банк`, 'good');
                            }
                          }}
                          disabled={player.gold === 0}
                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 border-2 ${
                            player.gold > 0
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-400 active:scale-95 hover:shadow-blue-500/50'
                              : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Download size={16} />
                          Внести всё ({player.gold})
                          <Coins size={16} className={player.gold > 0 ? 'text-yellow-300' : 'text-slate-600'} />
                        </button>
                      </div>
                    </div>

                    {/* Вывод средств */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-blue-400" />
                        Вывод средств
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Снимите золото с банковского счета</p>
                      
                      <div className="space-y-3">
                        {[100, 500, 1000, 5000].map(amount => (
                          <button
                            key={amount}
                            onClick={() => {
                              if ((player.bankGold || 0) >= amount) {
                                setPlayer(p => ({
                                  ...p,
                                  gold: p.gold + amount,
                                  bankGold: (p.bankGold || 0) - amount
                                }));
                                addNotification(`💰 Снято ${amount} золота с банка`, 'success');
                                addLog(`Вы сняли ${amount} золота с банка`, 'good');
                              } else {
                                addNotification('Недостаточно золота в банке!', 'error');
                              }
                            }}
                            disabled={(player.bankGold || 0) < amount}
                            className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                              (player.bankGold || 0) >= amount
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white active:scale-95 hover:shadow-blue-500/50'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <Upload size={16} />
                            Снять {amount}
                            <Coins size={16} className={(player.bankGold || 0) >= amount ? 'text-yellow-300' : 'text-slate-600'} />
                          </button>
                        ))}
                        
                        {/* Снять все */}
                        <button
                          onClick={() => {
                            if ((player.bankGold || 0) > 0) {
                              const amount = player.bankGold || 0;
                              setPlayer(p => ({
                                ...p,
                                gold: p.gold + amount,
                                bankGold: 0
                              }));
                              addNotification(`💰 Снято ${amount} золота с банка`, 'success');
                              addLog(`Вы сняли все золото (${amount}) с банка`, 'good');
                            }
                          }}
                          disabled={(player.bankGold || 0) === 0}
                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 border-2 ${
                            (player.bankGold || 0) > 0
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-purple-400 active:scale-95 hover:shadow-purple-500/50'
                              : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Upload size={16} />
                          Снять всё ({player.bankGold || 0})
                          <Coins size={16} className={(player.bankGold || 0) > 0 ? 'text-yellow-300' : 'text-slate-600'} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-950/50 to-slate-950 p-4 rounded-xl border-2 border-green-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield size={20} className="text-green-400" />
                        <h3 className="font-bold text-green-300">Безопасность</h3>
                      </div>
                      <p className="text-xs text-slate-400">Золото в банке защищено от потерь при смерти в бою!</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-950/50 to-slate-950 p-4 rounded-xl border-2 border-blue-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Info size={20} className="text-blue-400" />
                        <h3 className="font-bold text-blue-300">Совет</h3>
                      </div>
                      <p className="text-xs text-slate-400">Храните крупные суммы в банке, а в кармане держите только необходимое для покупок!</p>
                    </div>
                  </div>

                </div>
              )}

              {/* --- TAB: ИНВЕНТАРЬ --- */}
              {activeTab === 'inventory' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Заголовок с балансом */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Инвентарь</h2>
                        <p className="text-slate-400 text-sm">Управляйте своими предметами и ресурсами</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 px-6 py-3 rounded-xl border border-yellow-600/40 shadow-lg">
                        <Coins size={24} className="text-yellow-400" />
                        <div>
                          <div className="text-2xl font-bold text-yellow-300">{player.gold}</div>
                          <div className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">Золото</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Статистика инвентаря */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                      <Backpack className="text-blue-400 mb-2" size={28} />
                      <div className="text-2xl font-bold text-white">{player.inventory.length}</div>
                      <div className="text-xs text-slate-400 uppercase font-bold">Предметов</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                      <Box className="text-amber-400 mb-2" size={28} />
                      <div className="text-2xl font-bold text-white">{Object.keys(player.resources || {}).length}</div>
                      <div className="text-xs text-slate-400 uppercase font-bold">Ресурсов</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                      <Sword className="text-purple-400 mb-2" size={28} />
                      <div className="text-2xl font-bold text-white">{player.equipment.weapon ? 1 : 0}</div>
                      <div className="text-xs text-slate-400 uppercase font-bold">Оружие</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                      <Shield className="text-green-400 mb-2" size={28} />
                      <div className="text-2xl font-bold text-white">{player.equipment.armor ? 1 : 0}</div>
                      <div className="text-xs text-slate-400 uppercase font-bold">Броня</div>
                    </div>
                  </div>

                  {/* РЕСУРСЫ */}
                  {Object.keys(player.resources || {}).length > 0 && (
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 shadow-xl">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Box size={24} className="text-amber-400" />
                        <span className="text-white">Ресурсы</span>
                        <span className="text-sm text-slate-500 font-normal ml-2">({Object.keys(player.resources).length} типов)</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(player.resources).map(([resourceId, count]) => {
                          const resource = RESOURCES.find(r => r.id === resourceId);
                          if (!resource) return null;
                          
                          const rarityClass = RARITY_COLORS[resource.rarity] || RARITY_COLORS.common;
                          const rarityBg = RARITY_BG[resource.rarity] || RARITY_BG.common;
                          
                          const tooltipContent = (
                            <div className="text-left">
                              <div className={`font-bold mb-1 ${rarityClass.split(' ')[0]}`}>{resource.name}</div>
                              <div className="text-xs text-slate-400">Редкость: {resource.rarity}</div>
                              <div className="text-xs text-slate-500">Количество: {count}</div>
                            </div>
                          );
                          
                          return (
                            <Tooltip key={resourceId} content={tooltipContent} position="top">
                              <div className={`${rarityBg} p-4 rounded-xl border-2 ${rarityClass.split(' ')[1]} hover:scale-110 transition-all duration-200 cursor-pointer group relative`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <resource.icon size={28} className={`${rarityClass.split(' ')[0]} mx-auto mb-2 drop-shadow-glow`} />
                                <div className="text-center">
                                  <div className={`text-xs font-bold truncate ${rarityClass.split(' ')[0]}`}>{resource.name}</div>
                                  <div className="text-lg font-bold text-white mt-1">x{count}</div>
                                </div>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ПРЕДМЕТЫ */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Backpack size={24} className="text-blue-400 drop-shadow-glow" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Предметы</span>
                      <span className="text-sm text-slate-500 font-normal ml-2">
                        ({player.inventory.length} / {100 + (player.homeUpgrades?.storageExpansion || 0) * 20} слотов)
                      </span>
                    </h3>
                    
                    {player.inventory.length === 0 ? (
                      <div className="text-center py-20 bg-slate-900/50 rounded-xl border-2 border-slate-800 border-dashed">
                        <Backpack className="mx-auto mb-4 text-slate-700" size={64} />
                        <p className="text-slate-500 text-lg font-bold mb-2">Рюкзак пуст</p>
                        <p className="text-slate-600 text-sm">Отправляйтесь в путешествие, чтобы найти предметы!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {player.inventory.map((item) => {
                          const rarityClass = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                          const rarityBg = RARITY_BG[item.rarity] || RARITY_BG.common;
                          const glowEffect = item.rarity === 'legendary' ? 'shadow-[0_0_20px_rgba(251,146,60,0.6)] animate-pulse' : item.rarity === 'epic' ? 'shadow-[0_0_15px_rgba(168,85,247,0.4)]' : '';
                          
                          const tooltipContent = (
                            <div className="text-left">
                              <div className={`font-bold mb-1 ${rarityClass.split(' ')[0]}`}>{item.name}</div>
                              <div className="text-xs text-slate-400 mb-2">
                                {item.type === 'weapon' && `⚔️ Урон: +${item.val}`}
                                {item.type === 'armor' && `🛡️ Защита: +${item.val}`}
                                {item.type === 'consumable' && `❤️ Лечит: +${item.val} HP`}
                              </div>
                              {item.effect && (
                                <div className="text-xs text-purple-400 mb-2 border-t border-slate-700 pt-2">
                                  <span className="text-slate-500">✨ Эффект:</span> {item.effect}
                                </div>
                              )}
                              <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                                <div>Редкость: {item.rarity}</div>
                                <div>💰 Цена продажи: {Math.floor(item.cost/2)} золота</div>
                              </div>
                            </div>
                          );
                          
                          return (
                            <Tooltip key={item.uid} content={tooltipContent} position="top">
                              <div className={`${rarityBg} p-4 rounded-xl border-2 ${rarityClass.split(' ')[1]} ${glowEffect} group hover:scale-105 transition-all duration-200 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                {/* Иконка предмета */}
                                <div className="relative z-10 flex items-start gap-3 mb-3">
                                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${rarityBg} border-2 ${rarityClass.split(' ')[1]} shadow-lg`}>
                                    {item.type === 'weapon' ? <Sword size={28} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/> : 
                                     item.type === 'armor' ? <Shield size={28} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/> : 
                                     <Heart size={28} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm ${rarityClass.split(' ')[0]} mb-1 truncate`}>{item.name}</div>
                                    <div className="text-xs text-slate-400">
                                      {item.type === 'weapon' && `⚔️ Урон: +${item.val}`}
                                      {item.type === 'armor' && `🛡️ Защита: +${item.val}`}
                                      {item.type === 'consumable' && `❤️ Лечит: +${item.val}`}
                                    </div>
                                    {item.effect && (
                                      <div className="text-[10px] text-purple-400 mt-1 truncate">✨ {item.effect}</div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Кнопки действий */}
                                <div className="relative z-10 flex gap-2">
                                  {item.type !== 'consumable' && (
                                    <button 
                                      onClick={() => equipItem(item)} 
                                      className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white text-xs font-bold active:scale-95 transition-all shadow-lg hover:shadow-blue-500/50"
                                    >
                                      <Sword size={14} className="inline mr-1" />
                                      Надеть
                                    </button>
                                  )}
                                  {item.type === 'consumable' && (
                                    <button 
                                      onClick={() => useItem(item)} 
                                      className="flex-1 py-2 px-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg text-white text-xs font-bold active:scale-95 transition-all shadow-lg hover:shadow-green-500/50"
                                    >
                                      <Heart size={14} className="inline mr-1" />
                                      Использовать
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => sellItem(item)} 
                                    className="py-2 px-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-red-900 hover:to-red-800 rounded-lg text-slate-300 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-lg"
                                    title={`Продать за ${Math.floor(item.cost/2)} золота`}
                                  >
                                    <Coins size={14} className="inline" />
                                  </button>
                                </div>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: СРАЖЕНИЯ (АРЕНА И ПОДЗЕМЕЛЬЕ) --- */}
              {activeTab === 'battles' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Заголовок */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-orange-200 mb-1">Сражения</h2>
                        <p className="text-slate-400 text-sm">Испытайте свою силу в арене или исследуйте подземелья</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 px-6 py-3 rounded-xl border-2 border-red-700/50 shadow-lg">
                        <div className="text-sm text-slate-400 mb-1">Ваша сила</div>
                        <div className="text-2xl font-bold text-red-400 drop-shadow-glow flex items-center gap-2">
                          <Sword size={20} />
                          {player.str + (player.equipment.weapon?.val || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Переключатель режимов */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBattleMode('arena')}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                        battleMode === 'arena'
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Swords size={20} className="inline mr-2" />
                      Арена
                    </button>
                    <button
                      onClick={() => setBattleMode('dungeon')}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                        battleMode === 'dungeon'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Ghost size={20} className="inline mr-2" />
                      Подземелье
                    </button>
                    <button
                      onClick={() => setBattleMode('worldboss')}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                        battleMode === 'worldboss'
                          ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Flame size={20} className="inline mr-2" />
                      Мировые боссы
                    </button>
                  </div>

                  {/* АРЕНА */}
                  {battleMode === 'arena' && (
                    <div className="grid grid-cols-1 gap-4">
                      {ENEMIES_DB.map((enemy, index) => {
                        const playerDmg = player.str + (player.equipment.weapon?.val || 0);
                        const playerDef = player.def + (player.equipment.armor?.val || 0);
                        const enemyDmg = Math.max(1, enemy.baseDmg - (playerDef * 0.5));
                        const roundsToKillEnemy = Math.ceil(enemy.baseHp / playerDmg);
                        const roundsToDie = Math.ceil(player.hp / enemyDmg);
                        
                        let difficulty = 'Легко';
                        let diffColor = 'text-green-500';
                        let diffBg = 'bg-green-950/30';
                        let diffBorder = 'border-green-900/50';
                        
                        if (roundsToKillEnemy > roundsToDie) {
                          difficulty = 'Смертельно';
                          diffColor = 'text-red-500';
                          diffBg = 'bg-red-950/30';
                          diffBorder = 'border-red-900/50';
                        } else if (roundsToKillEnemy > roundsToDie * 0.6) {
                          difficulty = 'Сложно';
                          diffColor = 'text-orange-500';
                          diffBg = 'bg-orange-950/30';
                          diffBorder = 'border-orange-900/50';
                        } else if (roundsToKillEnemy > roundsToDie * 0.3) {
                          difficulty = 'Нормально';
                          diffColor = 'text-yellow-500';
                          diffBg = 'bg-yellow-950/30';
                          diffBorder = 'border-yellow-900/50';
                        }

                        return (
                          <div key={index} className={`bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border-2 ${diffBorder} hover:scale-105 transition-all shadow-lg`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-xl ${diffBg} flex items-center justify-center border-2 ${diffBorder} shadow-lg`}>
                                  <Skull size={32} className={`${diffColor} drop-shadow-glow`} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-xl mb-1">{enemy.name}</h4>
                                  <div className="flex gap-3 text-sm">
                                    <span className="flex items-center gap-1 text-red-400">
                                      <Heart size={14} /> {enemy.baseHp} HP
                                    </span>
                                    <span className="flex items-center gap-1 text-orange-400">
                                      <Sword size={14} /> {enemy.baseDmg} ATK
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right flex flex-col items-end gap-3">
                                <div className={`px-3 py-1 rounded-lg ${diffBg} border ${diffBorder}`}>
                                  <span className={`text-sm font-bold uppercase ${diffColor}`}>{difficulty}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setCombatState({ 
                                      enemy: { 
                                        ...enemy, 
                                        hp: enemy.baseHp, 
                                        maxHp: enemy.baseHp, 
                                        dmg: enemy.baseDmg 
                                      }, 
                                      log: [] 
                                    });
                                  }}
                                  className="py-2 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-red-500/50 active:scale-95 flex items-center gap-2"
                                >
                                  <Swords size={16} />
                                  Атаковать
                                </button>
                                <div className="flex gap-3 text-xs">
                                  <span className="text-yellow-400 font-bold flex items-center gap-1">
                                    <Coins size={12} /> +{enemy.gold}
                                  </span>
                                  <span className="text-blue-400 font-bold flex items-center gap-1">
                                    <Sparkles size={12} /> +{enemy.exp}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ПОДЗЕМЕЛЬЕ */}
                  {battleMode === 'dungeon' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-950/50 to-slate-950 p-6 rounded-xl border-2 border-purple-900/50">
                        <h3 className="text-xl font-bold text-purple-300 mb-2 flex items-center gap-2">
                          <Ghost size={24} className="drop-shadow-glow" />
                          Подземелья
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Исследуйте опасные подземелья, сражайтесь с волнами врагов и получайте ценные награды!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Подземелье 1 */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border-2 border-green-900/50 hover:scale-105 transition-all shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-green-950/30 flex items-center justify-center border-2 border-green-900/50">
                              <Ghost size={28} className="text-green-500 drop-shadow-glow" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">Забытые катакомбы</h4>
                              <p className="text-xs text-green-400">Уровень 1-5 • 3 волны</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">
                            Древние катакомбы, населенные нежитью. Идеально для новичков.
                          </p>
                          <div className="flex gap-2 mb-4 text-xs">
                            <span className="bg-green-950/30 px-2 py-1 rounded border border-green-900/50 text-green-400">
                              Легко
                            </span>
                            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800 text-slate-400">
                              Энергия: 10
                            </span>
                          </div>
                          <button
                            onClick={() => enterDungeon(1)}
                            disabled={player.energy < 10}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all shadow-lg ${
                              player.energy < 10
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white active:scale-95'
                            }`}
                          >
                            {player.energy < 10 ? 'Недостаточно энергии' : 'Войти'}
                          </button>
                        </div>

                        {/* Подземелье 2 */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border-2 border-yellow-900/50 hover:scale-105 transition-all shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-yellow-950/30 flex items-center justify-center border-2 border-yellow-900/50">
                              <Flame size={28} className="text-yellow-500 drop-shadow-glow" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">Огненные пещеры</h4>
                              <p className="text-xs text-yellow-400">Уровень 10-15 • 5 волн</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">
                            Раскаленные пещеры с огненными элементалями. Требуется опыт.
                          </p>
                          <div className="flex gap-2 mb-4 text-xs">
                            <span className="bg-yellow-950/30 px-2 py-1 rounded border border-yellow-900/50 text-yellow-400">
                              Средне
                            </span>
                            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800 text-slate-400">
                              Энергия: 15
                            </span>
                          </div>
                          <button
                            disabled={player.level < 10}
                            onClick={() => {
                              if (player.level >= 10) {
                                enterDungeon(2);
                              }
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all shadow-lg ${
                              player.level < 10
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : player.energy < 15
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white active:scale-95'
                            }`}
                          >
                            {player.level < 10 ? 'Требуется уровень 10' : player.energy < 15 ? 'Недостаточно энергии' : 'Войти'}
                          </button>
                        </div>

                        {/* Подземелье 3 */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border-2 border-purple-900/50 hover:scale-105 transition-all shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-purple-950/30 flex items-center justify-center border-2 border-purple-900/50">
                              <Skull size={28} className="text-purple-500 drop-shadow-glow" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">Проклятый склеп</h4>
                              <p className="text-xs text-purple-400">Уровень 20-25 • 7 волн</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">
                            Темный склеп с могущественной нежитью. Только для опытных.
                          </p>
                          <div className="flex gap-2 mb-4 text-xs">
                            <span className="bg-orange-950/30 px-2 py-1 rounded border border-orange-900/50 text-orange-400">
                              Сложно
                            </span>
                            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800 text-slate-400">
                              Энергия: 20
                            </span>
                          </div>
                          <button
                            disabled={player.level < 20}
                            onClick={() => {
                              if (player.level >= 20) {
                                enterDungeon(3);
                              }
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all shadow-lg ${
                              player.level < 20
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : player.energy < 20
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95'
                            }`}
                          >
                            {player.level < 20 ? 'Требуется уровень 20' : player.energy < 20 ? 'Недостаточно энергии' : 'Войти'}
                          </button>
                        </div>

                        {/* Подземелье 4 */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border-2 border-red-900/50 hover:scale-105 transition-all shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-red-950/30 flex items-center justify-center border-2 border-red-900/50 animate-pulse">
                              <Flame size={28} className="text-red-500 drop-shadow-glow" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">Логово дракона</h4>
                              <p className="text-xs text-red-400">Уровень 30+ • Босс</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">
                            Легендарное логово древнего дракона. Смертельная опасность!
                          </p>
                          <div className="flex gap-2 mb-4 text-xs">
                            <span className="bg-red-950/30 px-2 py-1 rounded border border-red-900/50 text-red-400 animate-pulse">
                              Смертельно
                            </span>
                            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800 text-slate-400">
                              Энергия: 30
                            </span>
                          </div>
                          <button
                            disabled={player.level < 30}
                            onClick={() => {
                              if (player.level >= 30) {
                                enterDungeon(4);
                              }
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all shadow-lg ${
                              player.level < 30
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : player.energy < 30
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95 animate-pulse'
                            }`}
                          >
                            {player.level < 30 ? 'Требуется уровень 30' : player.energy < 30 ? 'Недостаточно энергии' : 'Войти'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* МИРОВЫЕ БОССЫ */}
                  {battleMode === 'worldboss' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-orange-950/50 to-red-950/50 p-6 rounded-xl border-2 border-orange-900/50">
                        <h3 className="text-xl font-bold text-orange-300 mb-2 flex items-center gap-2">
                          <Flame size={24} className="drop-shadow-glow animate-pulse" />
                          Мировые боссы
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Могущественные боссы появляются на карте. Все игроки могут атаковать их и получить награды!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {worldBosses.map((boss) => {
                          const timeUntilSpawn = boss.isAlive ? 0 : Math.max(0, boss.nextSpawn - Date.now());
                          const hours = Math.floor(timeUntilSpawn / 3600000);
                          const minutes = Math.floor((timeUntilSpawn % 3600000) / 60000);
                          const seconds = Math.floor((timeUntilSpawn % 60000) / 1000);
                          
                          const BossIcon = boss.icon;
                          const hpPercent = boss.isAlive ? (boss.hp / boss.maxHp) * 100 : 0;
                          
                          return (
                            <div key={boss.id} className={`bg-gradient-to-br ${boss.color} p-6 rounded-xl border-2 ${boss.isAlive ? 'border-orange-500 animate-pulse' : 'border-slate-700'} shadow-lg`}>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-20 h-20 rounded-xl bg-black/30 flex items-center justify-center border-2 ${boss.isAlive ? 'border-orange-500 animate-pulse' : 'border-slate-700'}`}>
                                    <BossIcon size={40} className={`${boss.isAlive ? 'text-orange-400' : 'text-slate-600'} drop-shadow-glow`} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white text-2xl mb-1">{boss.name}</h4>
                                    <p className="text-sm text-slate-300 mb-2">{boss.description}</p>
                                    <div className="flex gap-3 text-sm">
                                      <span className="flex items-center gap-1 text-slate-300">
                                        <MapPin size={14} /> {boss.location}
                                      </span>
                                      <span className="flex items-center gap-1 text-yellow-400">
                                        <Trophy size={14} /> Уровень {boss.level}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {boss.isAlive ? (
                                  <div className="text-right">
                                    <div className="bg-green-950/50 px-3 py-1 rounded-lg border border-green-700 mb-2">
                                      <span className="text-sm font-bold text-green-400 animate-pulse">🟢 АКТИВЕН</span>
                                    </div>
                                    <button
                                      onClick={() => attackWorldBoss(boss.id)}
                                      disabled={player.level < boss.level || player.energy < 20}
                                      className={`py-2 px-6 rounded-lg font-bold transition-all shadow-lg ${
                                        player.level < boss.level || player.energy < 20
                                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white active:scale-95'
                                      }`}
                                    >
                                      {player.level < boss.level ? `Требуется ур. ${boss.level}` : player.energy < 20 ? 'Нужно 20 энергии' : '⚔️ Атаковать'}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="bg-red-950/50 px-3 py-1 rounded-lg border border-red-700 mb-2">
                                      <span className="text-sm font-bold text-red-400">🔴 НЕ ПОЯВИЛСЯ</span>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                      Появится через:<br/>
                                      <span className="text-white font-bold">{hours}ч {minutes}м {seconds}с</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {boss.isAlive && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Здоровье босса</span>
                                    <span className="text-white font-bold">{boss.hp} / {boss.maxHp}</span>
                                  </div>
                                  <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-700">
                                    <div 
                                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                                      style={{ width: `${hpPercent}%` }}
                                    ></div>
                                  </div>
                                  
                                  {boss.participants && boss.participants.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                      <p className="text-xs text-slate-400 mb-2">Участники атаки:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {boss.participants.slice(0, 5).map((p, idx) => (
                                          <div key={idx} className="bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-300">
                                            {p.name} ({p.damage} урона)
                                          </div>
                                        ))}
                                        {boss.participants.length > 5 && (
                                          <div className="bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-400">
                                            +{boss.participants.length - 5} еще
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-400 mb-2">Награды:</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-yellow-950/30 px-2 py-1 rounded text-xs text-yellow-400 border border-yellow-900/50">
                                    💰 {boss.rewards.gold.min}-{boss.rewards.gold.max} золота
                                  </span>
                                  <span className="bg-blue-950/30 px-2 py-1 rounded text-xs text-blue-400 border border-blue-900/50">
                                    ✨ {boss.rewards.exp.min}-{boss.rewards.exp.max} опыта
                                  </span>
                                  <span className="bg-purple-950/30 px-2 py-1 rounded text-xs text-purple-400 border border-purple-900/50">
                                    🎁 Легендарные предметы
                                  </span>
                                  {boss.rewards.specialReward && (
                                    <span className="bg-orange-950/30 px-2 py-1 rounded text-xs text-orange-400 border border-orange-900/50 animate-pulse">
                                      👑 Титул: {boss.rewards.specialReward.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: КВЕСТЫ (НОВОЕ) --- */}
              {activeTab === 'quests' && (
                <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Scroll className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">Задания</h2>
                        <p className="text-slate-400 text-sm">Выполняйте задания для получения наград</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors">
                        <span className="text-slate-400">Активных:</span>
                        <span className="ml-2 font-bold text-green-400">{player.activeQuests?.length || 0}</span>
                      </div>
                      <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors">
                        <span className="text-slate-400">Выполнено:</span>
                        <span className="ml-2 font-bold text-blue-400">{player.questsCompletedCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Активные квесты */}
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                       <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                       Активные задания
                     </h3>
                     {player.activeQuests && player.activeQuests.length > 0 ? (
                       <div className="grid gap-4">
                         {player.activeQuests.map(quest => {
                           const questTypeIcon = quest.type === 'step' ? Footprints : 
                                                 quest.type === 'kill' ? Skull : 
                                                 quest.type === 'find' ? Gift : 
                                                 quest.type === 'earn_gold' ? Coins : Sparkles;
                           const QuestIcon = questTypeIcon;
                           
                           return (
                             <div key={quest.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border-2 border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl relative overflow-hidden group">
                               {/* Background decoration */}
                               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
                               
                               <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-3">
                                   <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-2">
                                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                         quest.isCompleted ? 'bg-green-900/30 border-2 border-green-500/50' : 'bg-blue-900/30 border-2 border-blue-500/50'
                                       }`}>
                                         <QuestIcon size={20} className={quest.isCompleted ? 'text-green-400' : 'text-blue-400'} />
                                       </div>
                                       <div>
                                         <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                           {quest.name}
                                           {quest.isCompleted && (
                                             <span className="text-green-500 bg-green-900/30 text-xs px-2 py-1 rounded-lg border border-green-500/30 flex items-center gap-1 animate-pulse">
                                               <CheckCircle size={12} />
                                               ВЫПОЛНЕНО
                                             </span>
                                           )}
                                         </h4>
                                         <p className="text-slate-400 text-sm">{quest.desc}</p>
                                       </div>
                                     </div>
                                   </div>
                                   
                                   <div className="flex flex-col gap-2">
                                     {quest.isCompleted ? (
                                       <button 
                                         onClick={() => claimQuestReward(quest.id)} 
                                         className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-yellow-500/50 transition-all active:scale-95"
                                       >
                                         <Gift size={16} />
                                         Забрать
                                       </button>
                                     ) : (
                                       <button 
                                         onClick={() => abandonQuest(quest.id)}
                                         className="bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-slate-600 hover:border-red-500/50 transition-all active:scale-95"
                                       >
                                         <X size={16} />
                                         Отказаться
                                       </button>
                                     )}
                                   </div>
                                 </div>

                                 {/* Rewards display */}
                                 <div className="flex gap-3 mb-4 flex-wrap">
                                   <div className="bg-yellow-950/30 px-3 py-1.5 rounded-lg border border-yellow-900/50 flex items-center gap-2">
                                     <Coins size={14} className="text-yellow-500" />
                                     <span className="text-yellow-400 font-bold text-sm">{quest.gold}</span>
                                   </div>
                                   <div className="bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-900/50 flex items-center gap-2">
                                     <Sparkles size={14} className="text-blue-500" />
                                     <span className="text-blue-400 font-bold text-sm">{quest.exp} XP</span>
                                   </div>
                                   {quest.itemReward && (
                                     <div className="bg-purple-950/30 px-3 py-1.5 rounded-lg border border-purple-900/50 flex items-center gap-2">
                                       <Gift size={14} className="text-purple-500" />
                                       <span className="text-purple-400 font-bold text-sm">{quest.itemReward.name}</span>
                                     </div>
                                   )}
                                 </div>

                                 {/* Progress bar */}
                                 <div>
                                   <div className="flex justify-between text-xs mb-2 text-slate-400 font-bold">
                                     <span className="flex items-center gap-1">
                                       <Target size={12} />
                                       Прогресс
                                     </span>
                                     <span className={quest.isCompleted ? 'text-green-400' : 'text-blue-400'}>
                                       {quest.progress} / {quest.target}
                                     </span>
                                   </div>
                                   <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700 shadow-inner relative">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                     <div 
                                       className={`h-full transition-all duration-500 relative ${
                                         quest.isCompleted 
                                           ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg shadow-green-500/50' 
                                           : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30'
                                       }`}
                                       style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                                     >
                                       <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     ) : (
                       <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500">
                         <Scroll size={48} className="mx-auto mb-3 opacity-30" />
                         <p className="font-bold">Нет активных заданий</p>
                         <p className="text-sm mt-1">Выберите задание из списка ниже</p>
                       </div>
                     )}
                  </div>

                  {/* Доступные квесты */}
                  <div className="space-y-4 mt-8">
                     <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                       <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                       Доступные задания
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {QUESTS_DB
                          .filter(q => 
                             !player.activeQuests.find(aq => aq.id === q.id) && 
                             !player.completedQuests.includes(q.id) &&
                             player.level >= (q.minLvl || 1)
                          )
                          .map(quest => {
                            const questTypeIcon = quest.type === 'step' ? Footprints : 
                                                  quest.type === 'kill' ? Skull : 
                                                  quest.type === 'find' ? Gift : 
                                                  quest.type === 'earn_gold' ? Coins : Sparkles;
                            const QuestIcon = questTypeIcon;
                            
                            return (
                              <div key={quest.id} className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
                                
                                <div className="relative z-10">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:border-purple-500/60 transition-all">
                                      <QuestIcon size={24} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">{quest.name}</h4>
                                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{quest.desc}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Quest info badges */}
                                  <div className="flex gap-2 mb-4 flex-wrap">
                                    <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700 text-slate-400 text-xs flex items-center gap-1">
                                      <Crown size={10} />
                                      Уровень {quest.minLvl || 1}+
                                    </span>
                                    <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700 text-slate-400 text-xs flex items-center gap-1">
                                      <Target size={10} />
                                      Цель: {quest.target}
                                    </span>
                                  </div>

                                  {/* Rewards */}
                                  <div className="flex gap-2 mb-4 text-xs flex-wrap">
                                    <span className="flex items-center gap-1 bg-yellow-950/30 px-2 py-1 rounded-md border border-yellow-900/50">
                                      <Coins size={12} className="text-yellow-500"/>
                                      <span className="text-yellow-400 font-bold">{quest.gold}</span>
                                    </span>
                                    <span className="flex items-center gap-1 bg-blue-950/30 px-2 py-1 rounded-md border border-blue-900/50">
                                      <Sparkles size={12} className="text-blue-500"/>
                                      <span className="text-blue-400 font-bold">{quest.exp}</span>
                                    </span>
                                    {quest.itemReward && (
                                      <span className="flex items-center gap-1 bg-purple-950/30 px-2 py-1 rounded-md border border-purple-900/50">
                                        <Gift size={12} className="text-purple-500"/>
                                        <span className="text-purple-400 font-bold text-[10px]">{quest.itemReward.name}</span>
                                      </span>
                                    )}
                                  </div>

                                  <button 
                                    onClick={() => startQuest(quest.id)} 
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2.5 px-4 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-purple-500/50 active:scale-95 flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle size={16} />
                                    Принять задание
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        {QUESTS_DB.filter(q => !player.completedQuests.includes(q.id) && !player.activeQuests.find(aq => aq.id === q.id) && player.level < q.minLvl).length > 0 && (
                          <div className="col-span-full text-center bg-slate-900/30 border border-slate-800 rounded-xl py-6 px-4">
                            <Lock size={32} className="mx-auto mb-2 text-slate-600" />
                            <p className="text-slate-500 text-sm font-bold">Некоторые задания станут доступны на более высоком уровне</p>
                          </div>
                        )}
                        {QUESTS_DB.filter(q => !player.completedQuests.includes(q.id) && !player.activeQuests.find(aq => aq.id === q.id) && player.level >= (q.minLvl || 1)).length === 0 && (
                          <div className="col-span-full text-center bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl py-8 px-4">
                            <Trophy size={48} className="mx-auto mb-3 text-green-400" />
                            <p className="text-green-400 font-bold text-lg">Все доступные задания выполнены!</p>
                            <p className="text-green-600 text-sm mt-1">Повышайте уровень для новых заданий</p>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              )}

              {/* --- TAB: РЫБАЛКА --- */}
              {activeTab === 'fishing' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-slate-900 rounded-2xl p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzA4OWNmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <Wind className="text-white" size={28} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 mb-1">Рыбалка</h2>
                            <p className="text-blue-300 text-sm font-medium">Ловите рыбу и зарабатывайте золото</p>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="hidden md:flex gap-3">
                          <div className="bg-slate-900/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-500/30">
                            <div className="text-xs text-blue-300 mb-1">Всего поймано</div>
                            <div className="text-xl font-black text-white">{player.totalFishCaught || 0}</div>
                          </div>
                          <div className="bg-slate-900/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-cyan-500/30">
                            <div className="text-xs text-cyan-300 mb-1">Заработано</div>
                            <div className="text-xl font-black text-yellow-400">{player.totalFishGold || 0} 💰</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Energy Bar */}
                      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-blue-300">Энергия</span>
                          <span className="text-sm font-bold text-white">{player.energy} / {player.maxEnergy}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 transition-all duration-500 shadow-lg shadow-blue-500/50"
                            style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">Стоимость рыбалки: 5 энергии</div>
                      </div>
                    </div>
                  </div>

                  {/* Fishing State */}
                  {fishingState && (
                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl border-2 border-blue-500/50 p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 animate-pulse"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative z-10">
                        {fishingState.stage === 'waiting' && (
                          <div className="text-center">
                            <div className="relative inline-block mb-6">
                              <div className="text-8xl animate-bounce">🎣</div>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500/30 rounded-full blur-sm"></div>
                            </div>
                            <h3 className="text-3xl font-black text-blue-200 mb-3">Ожидание поклевки...</h3>
                            <p className="text-blue-300/80 text-lg mb-6">Будьте готовы нажать "Поймать" когда рыба клюнет!</p>
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={cancelFishing}
                                className="bg-red-600/80 hover:bg-red-500 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/50 border border-red-500/50"
                              >
                                Отменить
                              </button>
                            </div>
                          </div>
                        )}
                        {fishingState.stage === 'bite' && (
                          <div className="text-center">
                            <div className="relative inline-block mb-6">
                              <div className="text-8xl animate-ping">🐟</div>
                              <div className="absolute inset-0 text-8xl animate-bounce">🐟</div>
                            </div>
                            <h3 className="text-4xl font-black text-green-300 mb-3 animate-pulse">⚡ ПОКЛЕВКА! ⚡</h3>
                            <p className="text-green-200 text-lg mb-6 animate-pulse">Быстрее нажмите кнопку!</p>
                            <button
                              onClick={catchFish}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-4 rounded-xl font-black text-xl shadow-2xl hover:shadow-green-500/50 transition-all animate-pulse border-2 border-green-400/50 hover:scale-110"
                            >
                              🎣 ПОЙМАТЬ!
                            </button>
                          </div>
                        )}
                        {fishingState.stage === 'caught' && fishingState.caughtFish && (
                          <div className="text-center">
                            <div className="relative inline-block mb-6">
                              <div className="text-8xl animate-bounce">{fishingState.caughtFish.icon}</div>
                              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                            </div>
                            <h3 className="text-3xl font-black text-green-300 mb-3">🎉 Поймана рыба! 🎉</h3>
                            <p className="text-2xl text-white font-black mb-3">{fishingState.caughtFish.name}</p>
                            <div className="flex items-center justify-center gap-3 mb-4">
                              <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                                fishingState.caughtFish.rarity === 'common' ? 'bg-slate-700 text-slate-300 border border-slate-500' :
                                fishingState.caughtFish.rarity === 'uncommon' ? 'bg-green-700 text-green-300 border border-green-500' :
                                fishingState.caughtFish.rarity === 'rare' ? 'bg-blue-700 text-blue-300 border border-blue-500' :
                                fishingState.caughtFish.rarity === 'epic' ? 'bg-purple-700 text-purple-300 border border-purple-500' :
                                'bg-yellow-700 text-yellow-300 border border-yellow-500 animate-pulse'
                              }`}>
                                {fishingState.caughtFish.rarity === 'common' ? '⚪ Обычная' :
                                 fishingState.caughtFish.rarity === 'uncommon' ? '🟢 Необычная' :
                                 fishingState.caughtFish.rarity === 'rare' ? '🔷 Редкая' :
                                 fishingState.caughtFish.rarity === 'epic' ? '💎 Эпическая' :
                                 '⭐ Легендарная'}
                              </span>
                            </div>
                            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 inline-block">
                              <p className="text-yellow-300 font-bold">Цена продажи: {fishingState.caughtFish.sellPrice} 💰</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fishing Locations */}
                  {!fishingState && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                          Места для рыбалки
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {LOCATIONS.filter(loc => player.level >= loc.minLvl).map(location => {
                          const availableFish = FISH_DB.filter(fish => fish.locations.includes(location.id));
                          const rareFish = availableFish.filter(f => f.rarity === 'rare' || f.rarity === 'epic' || f.rarity === 'legendary').length;
                          
                          return (
                            <div key={location.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 group relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-start gap-3 mb-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600/50 to-cyan-600/50 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-lg group-hover:shadow-blue-500/50 transition-all">
                                    <MapPin size={28} className="text-blue-300" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-black text-white text-lg mb-1">{location.name}</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed">{location.text}</p>
                                  </div>
                                </div>
                                
                                {/* Fish Preview */}
                                <div className="bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-700/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-slate-400 font-bold">Доступная рыба:</p>
                                    <span className="text-xs text-cyan-400 font-bold">{availableFish.length} видов</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {availableFish.slice(0, 6).map(fish => (
                                      <div key={fish.id} className="relative group/fish">
                                        <span className="text-2xl cursor-pointer hover:scale-125 transition-transform" title={fish.name}>
                                          {fish.icon}
                                        </span>
                                      </div>
                                    ))}
                                    {availableFish.length > 6 && (
                                      <span className="text-slate-500 text-sm self-center">+{availableFish.length - 6}</span>
                                    )}
                                  </div>
                                  {rareFish > 0 && (
                                    <div className="text-xs text-purple-400 font-bold">
                                      ⭐ {rareFish} редких видов
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => startFishing(location.id)}
                                  disabled={player.energy < 5}
                                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-800 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 border border-blue-500/30 disabled:border-slate-700"
                                >
                                  <Wind size={18} />
                                  {player.energy < 5 ? 'Недостаточно энергии' : 'Начать рыбалку'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fish Inventory */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                        Ваш улов
                      </h3>
                      {FISH_DB.some(fish => (player.resources?.[fish.id] || 0) > 0) && (
                        <button
                          onClick={sellAllFish}
                          className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/50 transition-all active:scale-95 flex items-center gap-2 border border-yellow-500/30"
                        >
                          <Coins size={18} />
                          Продать всё
                        </button>
                      )}
                    </div>
                    
                    {FISH_DB.some(fish => (player.resources?.[fish.id] || 0) > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FISH_DB.filter(fish => (player.resources?.[fish.id] || 0) > 0).map(fish => {
                          const amount = player.resources?.[fish.id] || 0;
                          const totalValue = fish.sellPrice * amount;
                          
                          return (
                            <div key={fish.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all shadow-xl hover:scale-105 group relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="text-5xl">{fish.icon}</div>
                                  <div className="flex-1">
                                    <h4 className="font-black text-white mb-1">{fish.name}</h4>
                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                                      fish.rarity === 'common' ? 'bg-slate-700 text-slate-300' :
                                      fish.rarity === 'uncommon' ? 'bg-green-700 text-green-300' :
                                      fish.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                                      fish.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                                      'bg-yellow-700 text-yellow-300'
                                    }`}>
                                      {fish.rarity === 'common' ? '⚪ Обычная' :
                                       fish.rarity === 'uncommon' ? '🟢 Необычная' :
                                       fish.rarity === 'rare' ? '🔷 Редкая' :
                                       fish.rarity === 'epic' ? '💎 Эпическая' :
                                       '⭐ Легендарная'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-slate-900/50 rounded-xl p-3 mb-4 space-y-2 border border-slate-700/50">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Количество:</span>
                                    <span className="font-black text-cyan-400 text-lg">{amount}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Цена за шт:</span>
                                    <span className="font-bold text-yellow-400">{fish.sellPrice} 💰</span>
                                  </div>
                                  <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-300 font-bold">Всего:</span>
                                    <span className="font-black text-yellow-400 text-xl">{totalValue} 💰</span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => sellFish(fish.id, amount)}
                                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/50 transition-all active:scale-95 flex items-center justify-center gap-2 border border-yellow-500/30"
                                >
                                  <Coins size={16} />
                                  Продать за {totalValue} 💰
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-800">
                        <div className="relative inline-block mb-4">
                          <Wind size={64} className="text-slate-700 opacity-50" />
                          <div className="absolute inset-0 animate-ping">
                            <Wind size={64} className="text-slate-700 opacity-20" />
                          </div>
                        </div>
                        <p className="font-black text-slate-500 text-xl mb-2">У вас пока нет рыбы</p>
                        <p className="text-slate-600 text-sm">Отправляйтесь на рыбалку!</p>
                      </div>
                    )}
                  </div>

                  {/* Fish Database */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                      База данных рыб
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {FISH_DB.map(fish => {
                        const caught = (player.resources?.[fish.id] || 0) > 0;
                        
                        return (
                          <div key={fish.id} className={`bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm p-4 rounded-xl border transition-all text-center hover:scale-105 ${
                            caught ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
                          }`}>
                            <div className="text-4xl mb-2">{fish.icon}</div>
                            <p className="text-white text-sm font-bold mb-1 truncate">{fish.name}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold mb-2 ${
                              fish.rarity === 'common' ? 'bg-slate-700 text-slate-300' :
                              fish.rarity === 'uncommon' ? 'bg-green-700 text-green-300' :
                              fish.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                              fish.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                              'bg-yellow-700 text-yellow-300'
                            }`}>
                            {fish.rarity === 'common' ? 'Обычная' :
                             fish.rarity === 'uncommon' ? 'Необычная' :
                             fish.rarity === 'rare' ? 'Редкая' :
                             fish.rarity === 'epic' ? 'Эпическая' :
                             'Легендарная'}
                            </span>
                            <p className="text-yellow-400 text-sm font-bold">{fish.sellPrice} 💰</p>
                            {caught && (
                              <div className="mt-2 text-xs text-cyan-400 font-bold">✓ Поймана</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: СУНДУКИ --- */}
              {activeTab === 'chests' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Gift className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Сундуки</h2>
                          <p className="text-slate-400 text-sm">Откройте сундуки и получите ценные награды</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 text-sm">
                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                          <span className="text-slate-400">Открыто сундуков:</span>
                          <span className="ml-2 font-bold text-purple-400">{player.totalChestsOpened || 0}</span>
                        </div>
                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                          <span className="text-slate-400">Ваше золото:</span>
                          <span className="ml-2 font-bold text-yellow-400">{player.gold}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chest Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHEST_TYPES.map((chest, idx) => {
                      const ChestIcon = chest.icon;
                      const canAfford = player.gold >= chest.cost;
                      
                      return (
                        <div 
                          key={chest.id} 
                          className={`relative bg-gradient-to-br ${chest.color} p-6 rounded-2xl border-2 ${chest.borderColor} shadow-2xl transition-all hover:scale-105 group overflow-hidden ${!canAfford ? 'opacity-50' : ''}`}
                        >
                          {/* Background glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          {/* Rarity badge */}
                          <div className="absolute top-3 right-3">
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                              chest.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse' :
                              chest.rarity === 'epic' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' :
                              chest.rarity === 'rare' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                              chest.rarity === 'uncommon' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                              'bg-slate-500/20 text-slate-300 border border-slate-500/50'
                            }`}>
                              {chest.rarity === 'legendary' ? '⭐ Легендарный' :
                               chest.rarity === 'epic' ? '💎 Эпический' :
                               chest.rarity === 'rare' ? '🔷 Редкий' :
                               chest.rarity === 'uncommon' ? '🟢 Необычный' :
                               '⚪ Обычный'}
                            </div>
                          </div>

                          <div className="relative z-10 mt-8">
                            {/* Chest icon */}
                            <div className="flex justify-center mb-4">
                              <div className="w-24 h-24 bg-black/30 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                                <ChestIcon size={48} className="text-white drop-shadow-lg" />
                              </div>
                            </div>

                            {/* Chest name */}
                            <h3 className="text-2xl font-black text-white text-center mb-4 drop-shadow-lg">
                              {chest.name}
                            </h3>

                            {/* Rewards preview */}
                            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/10">
                              <div className="text-xs text-white/80 mb-2 font-bold uppercase text-center">Возможные награды:</div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <Coins size={14} />
                                    Золото:
                                  </span>
                                  <span className="text-yellow-300 font-bold">{chest.rewards.gold.min}-{chest.rewards.gold.max}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <Sparkles size={14} />
                                    Опыт:
                                  </span>
                                  <span className="text-blue-300 font-bold">{chest.rewards.exp.min}-{chest.rewards.exp.max}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <Package size={14} />
                                    Предметы:
                                  </span>
                                  <span className="text-purple-300 font-bold">{Math.round(chest.rewards.items.chance * 100)}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Buy button */}
                            <button
                              onClick={() => canAfford && buyChest(chest.id)}
                              disabled={!canAfford}
                              className={`w-full py-3 px-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                                !canAfford
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  : 'bg-white text-slate-900 hover:bg-slate-100 active:scale-95 hover:shadow-2xl'
                              }`}
                            >
                              <Coins size={20} />
                              {chest.cost}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chest Opening Modal */}
              {openingChest && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="relative max-w-2xl w-full">
                    {openingChest.stage === 'opening' && (
                      <div className="text-center">
                        <div className={`inline-block w-48 h-48 bg-gradient-to-br ${openingChest.type.color} rounded-3xl border-4 ${openingChest.type.borderColor} shadow-2xl animate-bounce`}>
                          <div className="w-full h-full flex items-center justify-center">
                            {React.createElement(openingChest.type.icon, { size: 96, className: "text-white animate-pulse" })}
                          </div>
                        </div>
                        <h2 className="text-4xl font-black text-white mt-8 animate-pulse">Открываем сундук...</h2>
                      </div>
                    )}

                    {openingChest.stage === 'revealing' && (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-purple-500 shadow-2xl animate-in zoom-in">
                        <div className="text-center mb-6">
                          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2">
                            🎉 Поздравляем! 🎉
                          </h2>
                          <p className="text-slate-400">Вы получили следующие награды:</p>
                        </div>

                        <div className="space-y-4 mb-6">
                          {/* Gold */}
                          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-4 rounded-xl border-2 border-yellow-500/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <Coins size={24} className="text-white" />
                              </div>
                              <span className="text-xl font-bold text-white">Золото</span>
                            </div>
                            <span className="text-3xl font-black text-yellow-400">+{openingChest.rewards.gold}</span>
                          </div>

                          {/* Experience */}
                          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border-2 border-blue-500/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Sparkles size={24} className="text-white" />
                              </div>
                              <span className="text-xl font-bold text-white">Опыт</span>
                            </div>
                            <span className="text-3xl font-black text-blue-400">+{openingChest.rewards.exp}</span>
                          </div>

                          {/* Items */}
                          {openingChest.rewards.items.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 rounded-xl border-2 border-purple-500/50">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <Package size={24} className="text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">Предметы</span>
                              </div>
                              <div className="space-y-2">
                                {openingChest.rewards.items.map((item, idx) => (
                                  <div key={idx} className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
                                    <span className={`font-bold ${
                                      item.rarity === 'legendary' ? 'text-orange-400' :
                                      item.rarity === 'epic' ? 'text-purple-400' :
                                      item.rarity === 'rare' ? 'text-blue-400' :
                                      item.rarity === 'uncommon' ? 'text-green-400' :
                                      'text-slate-400'
                                    }`}>
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase">{item.rarity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Perks */}
                          {openingChest.rewards.perks && openingChest.rewards.perks.length > 0 && (
                            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 p-4 rounded-xl border-2 border-orange-500/50 animate-pulse">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                  <Sparkles size={24} className="text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">✨ ПЕРКИ ✨</span>
                              </div>
                              <div className="space-y-2">
                                {openingChest.rewards.perks.map((perk, idx) => {
                                  const PerkIcon = perk.icon;
                                  return (
                                    <div key={idx} className="bg-black/30 p-3 rounded-lg">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                          perk.rarity === 'legendary' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                                          perk.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                                          perk.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                          'bg-gradient-to-br from-green-500 to-emerald-500'
                                        }`}>
                                          <PerkIcon size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className={`font-bold ${
                                              perk.rarity === 'legendary' ? 'text-orange-400' :
                                              perk.rarity === 'epic' ? 'text-purple-400' :
                                              perk.rarity === 'rare' ? 'text-blue-400' :
                                              'text-green-400'
                                            }`}>
                                              {perk.name}
                                            </span>
                                            <span className="text-xs text-slate-500 uppercase">{perk.rarity}</span>
                                          </div>
                                          <p className="text-xs text-slate-400 mt-1">{perk.effect}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={claimChestRewards}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-black text-xl transition-all shadow-lg hover:shadow-purple-500/50 active:scale-95"
                        >
                          Забрать награды
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: КУЗНИЦА (УЛУЧШЕНИЕ И ЗАЧАРОВАНИЕ) --- */}
              {activeTab === 'forge' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Hammer className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">Кузница</h2>
                          <p className="text-slate-400 text-sm">Улучшайте и зачаровывайте свое снаряжение</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weapons */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sword size={20} className="text-red-500" />
                        Оружие
                      </h3>
                      <div className="space-y-3">
                        {player.inventory.filter(item => item.type === 'weapon').map(item => (
                          <div key={item.uid} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:border-orange-500 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-bold text-white">{item.name} {item.upgradeLevel ? `+${item.upgradeLevel}` : ''}</div>
                                <div className="text-sm text-slate-400">Урон: {item.val}</div>
                                {item.enchantment && (
                                  <div className="text-xs text-purple-400 mt-1">⚡ {item.enchantment.name}: {item.enchantment.effect}</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setUpgradeModal({ item, type: 'upgrade' })}
                                  className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs font-bold transition-colors"
                                  disabled={(item.upgradeLevel || 0) >= MAX_UPGRADE_LEVEL}
                                >
                                  Улучшить
                                </button>
                                <button
                                  onClick={() => setUpgradeModal({ item, type: 'enchant' })}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold transition-colors"
                                  disabled={!!item.enchantment}
                                >
                                  Зачаровать
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {player.inventory.filter(item => item.type === 'weapon').length === 0 && (
                          <div className="text-center text-slate-500 py-8">Нет оружия</div>
                        )}
                      </div>
                    </div>

                    {/* Armor */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-blue-500" />
                        Броня
                      </h3>
                      <div className="space-y-3">
                        {player.inventory.filter(item => item.type === 'armor').map(item => (
                          <div key={item.uid} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:border-orange-500 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-bold text-white">{item.name} {item.upgradeLevel ? `+${item.upgradeLevel}` : ''}</div>
                                <div className="text-sm text-slate-400">Защита: {item.val}</div>
                                {item.enchantment && (
                                  <div className="text-xs text-purple-400 mt-1">⚡ {item.enchantment.name}: {item.enchantment.effect}</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setUpgradeModal({ item, type: 'upgrade' })}
                                  className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs font-bold transition-colors"
                                  disabled={(item.upgradeLevel || 0) >= MAX_UPGRADE_LEVEL}
                                >
                                  Улучшить
                                </button>
                                <button
                                  onClick={() => setUpgradeModal({ item, type: 'enchant' })}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold transition-colors"
                                  disabled={!!item.enchantment}
                                >
                                  Зачаровать
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {player.inventory.filter(item => item.type === 'armor').length === 0 && (
                          <div className="text-center text-slate-500 py-8">Нет брони</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade/Enchant Modal */}
              {upgradeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-orange-500 shadow-2xl max-w-md w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-white">
                        {upgradeModal.type === 'upgrade' ? '⚒️ Улучшение' : '✨ Зачарование'}
                      </h3>
                      <button onClick={() => { setUpgradeModal(null); setSelectedEnchantment(null); }} className="text-slate-400 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
                      <div className="font-bold text-white mb-2">{upgradeModal.item.name}</div>
                      <div className="text-sm text-slate-400">
                        {upgradeModal.item.type === 'weapon' ? 'Урон' : 'Защита'}: {upgradeModal.item.val}
                        {upgradeModal.item.upgradeLevel ? ` (+${upgradeModal.item.upgradeLevel})` : ''}
                      </div>
                    </div>

                    {upgradeModal.type === 'upgrade' ? (
                      <>
                        {(() => {
                          const currentLevel = upgradeModal.item.upgradeLevel || 0;
                          const nextLevel = currentLevel + 1;
                          const cost = UPGRADE_COSTS[nextLevel];
                          
                          if (!cost) return <div className="text-center text-slate-400">Максимальный уровень достигнут!</div>;

                          const canAfford = player.gold >= cost.gold && 
                            Object.entries(cost.resources).every(([resourceId, amount]) => 
                              (player.resources[resourceId] || 0) >= amount
                            );

                          return (
                            <>
                              <div className="space-y-3 mb-6">
                                <div className="text-sm text-slate-300 font-bold">Стоимость улучшения до +{nextLevel}:</div>
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 flex items-center gap-2">
                                      <Coins size={16} className="text-yellow-500" />
                                      Золото:
                                    </span>
                                    <span className={player.gold >= cost.gold ? 'text-green-400' : 'text-red-400'}>
                                      {cost.gold} ({player.gold})
                                    </span>
                                  </div>
                                  {Object.entries(cost.resources).map(([resourceId, amount]) => {
                                    const resource = RESOURCES.find(r => r.id === resourceId);
                                    const hasAmount = player.resources[resourceId] || 0;
                                    return (
                                      <div key={resourceId} className="flex items-center justify-between">
                                        <span className="text-slate-400">{resource?.name || resourceId}:</span>
                                        <span className={hasAmount >= amount ? 'text-green-400' : 'text-red-400'}>
                                          {amount} ({hasAmount})
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="text-sm text-green-400">
                                  Бонус: +{upgradeModal.item.type === 'weapon' ? 2 : 1} к {upgradeModal.item.type === 'weapon' ? 'урону' : 'защите'}
                                </div>
                              </div>

                              <button
                                onClick={() => upgradeItem(upgradeModal.item)}
                                disabled={!canAfford}
                                className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                Улучшить
                              </button>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                          {ENCHANTMENTS.filter(e => e.type === upgradeModal.item.type).map(enchantment => {
                            const canAfford = player.gold >= enchantment.cost.gold &&
                              Object.entries(enchantment.cost).every(([resourceId, amount]) => 
                                resourceId === 'gold' || (player.resources[resourceId] || 0) >= amount
                              );

                            return (
                              <div
                                key={enchantment.id}
                                onClick={() => setSelectedEnchantment(enchantment.id)}
                                className={`bg-slate-900/50 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                                  selectedEnchantment === enchantment.id
                                    ? 'border-purple-500 bg-purple-900/20'
                                    : 'border-slate-700 hover:border-purple-500/50'
                                } ${!canAfford ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-bold text-white">{enchantment.name}</div>
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    enchantment.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-300' :
                                    enchantment.rarity === 'epic' ? 'bg-cyan-500/20 text-cyan-300' :
                                    enchantment.rarity === 'rare' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-slate-500/20 text-slate-300'
                                  }`}>
                                    {enchantment.rarity}
                                  </div>
                                </div>
                                <div className="text-sm text-purple-400 mb-2">{enchantment.effect}</div>
                                <div className="text-xs text-slate-400">
                                  Стоимость: {enchantment.cost.gold} золота
                                  {Object.entries(enchantment.cost).filter(([k]) => k !== 'gold').map(([resourceId, amount]) => {
                                    const resource = RESOURCES.find(r => r.id === resourceId);
                                    return `, ${amount} ${resource?.name || resourceId}`;
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => selectedEnchantment && enchantItem(upgradeModal.item, selectedEnchantment)}
                          disabled={!selectedEnchantment}
                          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                            selectedEnchantment
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Зачаровать
                        </button>

                        {upgradeModal.item.enchantment && (
                          <button
                            onClick={() => removeEnchantment(upgradeModal.item)}
                            className="w-full mt-3 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-sm transition-all"
                          >
                            Снять зачарование
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: НАСТАВНИЧЕСТВО --- */}
              {activeTab === 'mentorship' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Users className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Наставничество</h2>
                          <p className="text-slate-400 text-sm">Обучайте новичков или найдите наставника</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setMentorshipTab('overview')}
                      className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                        mentorshipTab === 'overview'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Обзор
                    </button>
                    <button
                      onClick={() => setMentorshipTab('find')}
                      className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                        mentorshipTab === 'find'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {player.level >= 10 ? 'Мои ученики' : 'Найти наставника'}
                    </button>
                  </div>

                  {/* Overview Tab */}
                  {mentorshipTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Status Card */}
                      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30">
                        <h3 className="text-xl font-bold text-white mb-4">Ваш статус</h3>
                        {player.isMentor ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                                <Users size={32} className="text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-black text-white">Наставник</div>
                                <div className="text-sm text-blue-300">Вы можете обучать новичков</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <div className="text-slate-400 text-sm">Всего учеников:</div>
                                <div className="text-2xl font-bold text-white">{player.totalStudents || 0}</div>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <div className="text-slate-400 text-sm">Активных:</div>
                                <div className="text-2xl font-bold text-white">{player.students?.length || 0}</div>
                              </div>
                            </div>
                          </div>
                        ) : player.mentorId ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                <User size={32} className="text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-black text-white">Ученик</div>
                                <div className="text-sm text-green-300">Вы обучаетесь у наставника</div>
                              </div>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-slate-400 text-sm">Ваш наставник:</div>
                                <div className="font-bold text-white">{player.mentorName}</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-slate-400 text-sm">Уровень наставника:</div>
                                <div className="font-bold text-cyan-400">{player.mentorLevel}</div>
                              </div>
                              <div className="mt-3 text-xs text-slate-500">
                                Достигните 10 уровня, чтобы завершить обучение
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-slate-400 mb-4">Вы еще не участвуете в системе наставничества</div>
                            {player.level >= 10 ? (
                              <button
                                onClick={becomeMentor}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all shadow-lg"
                              >
                                Стать наставником
                              </button>
                            ) : (
                              <button
                                onClick={findMentor}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold transition-all shadow-lg"
                              >
                                Найти наставника
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Rewards Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy size={20} className="text-yellow-500" />
                            Награды для наставников
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">За каждого ученика:</span>
                              <span className="text-green-400">+100 опыта, +50 золота</span>
                            </div>
                            <div className="text-slate-500 text-xs mt-4">Особые награды:</div>
                            <div className="text-slate-400 text-xs">• 5 учеников: +500 золота, титул "Наставник"</div>
                            <div className="text-slate-400 text-xs">• 10 учеников: +1500 золота, перк "Опыт"</div>
                            <div className="text-slate-400 text-xs">• 25 учеников: +5000 золота, перк "Мастер Удачи"</div>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Gift size={20} className="text-blue-500" />
                            Награды для учеников
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">За каждый уровень:</span>
                              <span className="text-green-400">+50 опыта, +25 золота</span>
                            </div>
                            <div className="text-slate-500 text-xs mt-4">При выпуске (уровень 10):</div>
                            <div className="text-slate-400 text-xs">• +1000 золота</div>
                            <div className="text-slate-400 text-xs">• +500 опыта</div>
                            <div className="text-slate-400 text-xs">• Титул "Выпускник"</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Find/Students Tab */}
                  {mentorshipTab === 'find' && (
                    <div className="space-y-6">
                      {player.level >= 10 ? (
                        // Mentor view - show students
                        <div>
                          {!player.isMentor ? (
                            <div className="text-center py-12">
                              <div className="text-slate-400 mb-4">Станьте наставником, чтобы обучать новичков</div>
                              <button
                                onClick={becomeMentor}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all shadow-lg"
                              >
                                Стать наставником
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* My Students List */}
                              {player.students && player.students.length > 0 ? (
                                <div className="space-y-4">
                                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users size={20} className="text-blue-400" />
                                    Мои ученики ({player.students.length})
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {player.students.map((student, idx) => (
                                      <div key={idx} className="bg-slate-900/50 rounded-xl p-5 border border-slate-700 hover:border-blue-500/50 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                                              <User size={24} className="text-white" />
                                            </div>
                                            <div>
                                              <div className="font-bold text-white">{student.name}</div>
                                              <div className="text-sm text-slate-400">Уровень {student.level}</div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-xs text-slate-500">Прогресс</div>
                                            <div className="text-lg font-bold text-cyan-400">{student.level}/10</div>
                                          </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div 
                                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                                              style={{ width: `${(student.level / 10) * 100}%` }}
                                            ></div>
                                          </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                            <div className="text-slate-500">Сила</div>
                                            <div className="font-bold text-white">{student.str}</div>
                                          </div>
                                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                            <div className="text-slate-500">Защита</div>
                                            <div className="font-bold text-white">{student.def}</div>
                                          </div>
                                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                            <div className="text-slate-500">HP</div>
                                            <div className="font-bold text-white">{student.hp}</div>
                                          </div>
                                        </div>

                                        {/* Rewards earned */}
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Получено наград:</span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-yellow-400 font-bold">+{student.level * 50} 💰</span>
                                              <span className="text-blue-400 font-bold">+{student.level * 100} ⭐</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Add New Student Button */}
                                  {player.students.length < 5 && (
                                    <div className="text-center pt-4">
                                      <button
                                        onClick={findNewStudent}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all shadow-lg"
                                      >
                                        Найти еще ученика ({player.students.length}/5)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700">
                                  <Users size={48} className="mx-auto mb-4 text-slate-600" />
                                  <div className="text-slate-400 mb-4">У вас пока нет учеников</div>
                                  <button
                                    onClick={findNewStudent}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all shadow-lg"
                                  >
                                    Найти ученика
                                  </button>
                                  <div className="text-sm text-slate-500 mt-3">Максимум 5 учеников одновременно</div>
                                </div>
                              )}

                              {/* Milestones Progress */}
                              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                  <Trophy size={20} className="text-yellow-500" />
                                  Достижения наставника
                                </h3>
                                <div className="space-y-3">
                                  {[
                                    { count: 5, reward: '500 золота + титул "Наставник"', completed: (player.totalStudents || 0) >= 5 },
                                    { count: 10, reward: '1500 золота + перк "Опыт"', completed: (player.totalStudents || 0) >= 10 },
                                    { count: 25, reward: '5000 золота + перк "Мастер Удачи"', completed: (player.totalStudents || 0) >= 25 }
                                  ].map((milestone, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${milestone.completed ? 'bg-green-900/30 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                                      <div className="flex items-center gap-3">
                                        {milestone.completed ? (
                                          <CheckCircle size={20} className="text-green-400" />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
                                        )}
                                        <div>
                                          <div className={`font-bold ${milestone.completed ? 'text-green-400' : 'text-white'}`}>
                                            {milestone.count} учеников
                                          </div>
                                          <div className="text-xs text-slate-400">{milestone.reward}</div>
                                        </div>
                                      </div>
                                      <div className="text-sm font-bold text-slate-400">
                                        {player.totalStudents || 0}/{milestone.count}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Student view - find mentor
                        <div>
                          {player.mentorId ? (
                            <div className="space-y-6">
                              {/* Mentor Info Card */}
                              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                  <User size={20} className="text-green-400" />
                                  Ваш наставник
                                </h3>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                    <User size={40} className="text-white" />
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-white">{player.mentorName}</div>
                                    <div className="text-green-300">Уровень {player.mentorLevel}</div>
                                    <div className="text-sm text-slate-400 mt-1">Опытный наставник</div>
                                  </div>
                                </div>

                                {/* Progress to graduation */}
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 text-sm">Прогресс обучения</span>
                                    <span className="text-white font-bold">{player.level}/10</span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2">
                                    <div 
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                      style={{ width: `${(player.level / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-slate-500 text-center">
                                    {player.level < 10 ? `Еще ${10 - player.level} уровней до выпуска` : 'Обучение завершено!'}
                                  </div>
                                </div>
                              </div>

                              {/* Benefits Card */}
                              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Gift size={20} className="text-blue-400" />
                                  Ваши бонусы от наставника
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-400">Бонус опыта за уровень:</span>
                                    <span className="text-blue-400 font-bold">+50 ⭐</span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-400">Бонус золота за уровень:</span>
                                    <span className="text-yellow-400 font-bold">+25 💰</span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-400">Всего получено:</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-yellow-400 font-bold">{player.level * 25} 💰</span>
                                      <span className="text-blue-400 font-bold">{player.level * 50} ⭐</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Graduation Preview */}
                              {player.level >= 8 && player.level < 10 && (
                                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
                                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Trophy size={20} className="text-purple-400" />
                                    Скоро выпуск!
                                  </h3>
                                  <div className="text-sm text-slate-300 mb-3">
                                    При достижении 10 уровня вы получите:
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Coins size={16} className="text-yellow-400" />
                                      <span className="text-slate-300">1000 золота</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Sparkles size={16} className="text-blue-400" />
                                      <span className="text-slate-300">500 опыта</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Crown size={16} className="text-purple-400" />
                                      <span className="text-slate-300">Титул "Выпускник"</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Users size={48} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Найдите наставника</h3>
                                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                  Опытный наставник поможет вам быстрее развиваться и получать дополнительные награды за каждый уровень
                                </p>
                              </div>
                              
                              {/* Benefits Preview */}
                              <div className="max-w-md mx-auto mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                <div className="text-sm font-bold text-slate-300 mb-3">Преимущества ученика:</div>
                                <div className="space-y-2 text-sm text-left">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-slate-300">+50 опыта за каждый уровень</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-slate-300">+25 золота за каждый уровень</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-slate-300">Особые награды при выпуске</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-slate-300">Уникальный титул</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={findMentor}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold transition-all shadow-lg text-lg"
                              >
                                Найти наставника
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: PVP АРЕНА --- */}
              {activeTab === 'arena' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Swords className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200">PvP Арена</h2>
                          <p className="text-slate-400 text-sm">Сражайтесь с другими игроками за рейтинг и награды</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Rank Card */}
                    <div className={`bg-gradient-to-br ${getCurrentRank(player.pvpRating || 1000).color} rounded-xl p-6 border-2 border-white/20 shadow-2xl`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          {React.createElement(getCurrentRank(player.pvpRating || 1000).icon, { size: 32, className: "text-white" })}
                        </div>
                        <div>
                          <div className="text-white/80 text-sm font-bold uppercase">Ваш ранг</div>
                          <div className="text-2xl font-black text-white">{getCurrentRank(player.pvpRating || 1000).name}</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-white mb-1">{player.pvpRating || 1000}</div>
                        <div className="text-white/70 text-sm font-bold">Рейтинг</div>
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy size={20} className="text-yellow-500" />
                        <h3 className="text-lg font-bold text-white">Статистика</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Побед:</span>
                          <span className="text-green-400 font-bold">{player.pvpWins || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Поражений:</span>
                          <span className="text-red-400 font-bold">{player.pvpLosses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Винрейт:</span>
                          <span className="text-blue-400 font-bold">
                            {player.pvpWins || player.pvpLosses ? 
                              Math.round((player.pvpWins || 0) / ((player.pvpWins || 0) + (player.pvpLosses || 0)) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Card */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Flame size={20} className="text-orange-500" />
                        <h3 className="text-lg font-bold text-white">Серии побед</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Серия побед:</span>
                          <span className="text-orange-400 font-bold">{player.pvpWinStreak || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Лучшая серия:</span>
                          <span className="text-yellow-400 font-bold">{player.pvpBestStreak || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matchmaking */}
                  {!pvpOpponent && !combatState && (
                    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-8 border-2 border-red-800/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Target size={24} className="text-red-400" />
                        <h3 className="text-2xl font-bold text-white">Поиск противника</h3>
                      </div>
                      <p className="text-slate-300 mb-6">
                        Система подберет противника с похожим рейтингом. Победа даст вам рейтинг, золото и опыт!
                      </p>
                      <button
                        onClick={findPvPOpponent}
                        disabled={pvpSearching}
                        className={`w-full py-4 px-6 rounded-xl font-black text-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
                          pvpSearching
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95'
                        }`}
                      >
                        {pvpSearching ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Поиск противника...
                          </>
                        ) : (
                          <>
                            <Swords size={24} />
                            Найти противника
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Opponent Found */}
                  {pvpOpponent && !combatState && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border-2 border-blue-500/50 shadow-2xl animate-in zoom-in duration-300">
                      <div className="text-center mb-6">
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                          Противник найден!
                        </h3>
                        <p className="text-slate-400">Готовы к бою?</p>
                      </div>

                      <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
                        <div className="flex items-center gap-6">
                          {/* Opponent Avatar */}
                          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${AVATARS_DB.find(a => a.id === pvpOpponent.avatarId)?.color || 'bg-blue-500'} border-4 border-white/20 shadow-xl`}>
                            {React.createElement(AVATARS_DB.find(a => a.id === pvpOpponent.avatarId)?.icon || User, { size: 48, className: "text-white" })}
                          </div>

                          {/* Opponent Info */}
                          <div className="flex-1">
                            <div className="text-2xl font-black text-white mb-1">{pvpOpponent.name}</div>
                            <div className="text-blue-400 font-bold text-sm mb-2">{pvpOpponent.class}</div>
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Trophy size={14} className="text-yellow-500" />
                                <span className="text-slate-400">Уровень:</span>
                                <span className="text-white font-bold">{pvpOpponent.level}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target size={14} className="text-orange-500" />
                                <span className="text-slate-400">Рейтинг:</span>
                                <span className="text-white font-bold">{pvpOpponent.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex gap-3">
                            <div className="bg-red-900/30 px-3 py-2 rounded border border-red-800/50 text-center">
                              <div className="text-xs text-red-400 mb-1">HP</div>
                              <div className="text-lg font-bold text-white">{pvpOpponent.hp}</div>
                            </div>
                            <div className="bg-orange-900/30 px-3 py-2 rounded border border-orange-800/50 text-center">
                              <div className="text-xs text-orange-400 mb-1">ATK</div>
                              <div className="text-lg font-bold text-white">{pvpOpponent.str}</div>
                            </div>
                            <div className="bg-blue-900/30 px-3 py-2 rounded border border-blue-800/50 text-center">
                              <div className="text-xs text-blue-400 mb-1">DEF</div>
                              <div className="text-lg font-bold text-white">{pvpOpponent.def}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={startPvPBattle}
                          className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-4 px-6 rounded-xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Sword size={20} />
                          Начать бой!
                        </button>
                        <button
                          onClick={() => setPvpOpponent(null)}
                          className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ranks Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Crown size={24} className="text-yellow-500" />
                      Ранги арены
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ARENA_RANKS.map((rank, index) => {
                        const RankIcon = rank.icon;
                        const isCurrentRank = (player.pvpRating || 1000) >= rank.minRating && (player.pvpRating || 1000) <= rank.maxRating;
                        
                        return (
                          <div
                            key={rank.id}
                            className={`bg-gradient-to-br ${rank.color} rounded-xl p-4 border-2 ${
                              isCurrentRank ? 'border-white shadow-2xl scale-105' : 'border-white/20'
                            } transition-all`}
                          >
                            {isCurrentRank && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full px-3 py-1 text-xs font-black text-slate-900 shadow-lg">
                                Ваш ранг
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <RankIcon size={24} className="text-white" />
                              </div>
                              <div>
                                <div className="text-white font-black text-lg">{rank.name}</div>
                                <div className="text-white/70 text-xs">
                                  {rank.minRating} - {rank.maxRating === 99999 ? '∞' : rank.maxRating} рейтинга
                                </div>
                              </div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-xs">
                              <div className="text-white/80">Награда за победу:</div>
                              <div className="flex gap-3 mt-1">
                                <span className="text-yellow-400 font-bold">💰 {rank.reward.gold}</span>
                                <span className="text-blue-400 font-bold">✨ {rank.reward.exp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: СЕЗОНЫ --- */}
              {activeTab === 'seasons' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {!currentSeason ? (
                    <div className="text-center py-20">
                      <div className="w-32 h-32 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                        <Calendar size={64} className="text-slate-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4">Нет активного сезона</h2>
                      <p className="text-slate-400 mb-6">Сейчас нет активных сезонных событий. Следите за обновлениями!</p>
                      
                      {/* Upcoming seasons */}
                      <div className="max-w-2xl mx-auto mt-8">
                        <h3 className="text-xl font-bold text-slate-300 mb-4">Предстоящие сезоны:</h3>
                        <div className="space-y-3">
                          {SEASONS.filter(s => s.startDate > Date.now()).map(season => {
                            const SeasonIcon = season.icon;
                            const daysUntil = Math.ceil((season.startDate - Date.now()) / (24 * 60 * 60 * 1000));
                            return (
                              <div key={season.id} className={`bg-gradient-to-r ${season.color} p-4 rounded-xl border border-slate-700`}>
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-black/30 rounded-xl flex items-center justify-center">
                                    <SeasonIcon size={32} className="text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">{season.name}</h4>
                                    <p className="text-sm text-white/70">{season.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-white/70">Начнется через:</div>
                                    <div className="text-xl font-bold text-white">{daysUntil} дней</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Season Header */}
                      <div className={`bg-gradient-to-br ${currentSeason.color} rounded-2xl p-6 border-2 border-white/20 shadow-2xl relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-black/30 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                                {React.createElement(currentSeason.icon, { size: 40, className: "text-white" })}
                              </div>
                              <div>
                                <h2 className="text-4xl font-black text-white drop-shadow-lg">{currentSeason.name}</h2>
                                <p className="text-white/80 text-sm mt-1">{currentSeason.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white/70">Осталось:</div>
                              <div className="text-2xl font-bold text-white">
                                {Math.ceil((currentSeason.endDate - Date.now()) / (24 * 60 * 60 * 1000))} дней
                              </div>
                            </div>
                          </div>
                          
                          {/* Season Level */}
                          <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-bold">Уровень сезона: {currentSeason.playerLevel}</span>
                              <span className="text-white/70 text-sm">{currentSeason.playerExp} / {currentSeason.expToNextLevel}</span>
                            </div>
                            <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden border border-white/20">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                                style={{ width: `${(currentSeason.playerExp / currentSeason.expToNextLevel) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Season Tasks */}
                      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <CheckCircle size={24} className="text-green-400" />
                          Сезонные задания
                        </h3>
                        <div className="space-y-3">
                          {currentSeason.tasks.map(task => (
                            <div key={task.id} className={`bg-slate-800 p-4 rounded-lg border ${task.completed ? 'border-green-500' : 'border-slate-700'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {task.completed ? (
                                    <CheckCircle size={20} className="text-green-400" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
                                  )}
                                  <span className={`font-bold ${task.completed ? 'text-green-400' : 'text-white'}`}>
                                    {task.name}
                                  </span>
                                </div>
                                <span className="text-sm text-slate-400">
                                  +{task.reward} уровней
                                </span>
                              </div>
                              <div className="ml-8">
                                <div className="flex justify-between text-sm text-slate-400 mb-1">
                                  <span>Прогресс</span>
                                  <span>{task.progress} / {task.target}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Season Rewards */}
                      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <Gift size={24} className="text-purple-400" />
                          Награды сезона
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(currentSeason.rewards).map(([level, reward]) => {
                            const levelNum = parseInt(level);
                            const isUnlocked = currentSeason.playerLevel >= levelNum;
                            const isClaimed = currentSeason.claimedRewards.includes(levelNum);
                            
                            return (
                              <div 
                                key={level} 
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                  isClaimed ? 'bg-green-950/30 border-green-700' :
                                  isUnlocked ? 'bg-purple-950/30 border-purple-500 animate-pulse' :
                                  'bg-slate-800 border-slate-700 opacity-50'
                                }`}
                              >
                                {/* Level badge */}
                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                  <span className="text-white font-black">{level}</span>
                                </div>

                                <div className="space-y-2 text-sm">
                                  {reward.gold && (
                                    <div className="flex items-center gap-2 text-yellow-400">
                                      <Coins size={16} />
                                      <span>{reward.gold} золота</span>
                                    </div>
                                  )}
                                  {reward.exp && (
                                    <div className="flex items-center gap-2 text-blue-400">
                                      <Sparkles size={16} />
                                      <span>{reward.exp} опыта</span>
                                    </div>
                                  )}
                                  {reward.item && (
                                    <div className="flex items-center gap-2 text-purple-400">
                                      <Package size={16} />
                                      <span className="font-bold">{reward.item.name}</span>
                                    </div>
                                  )}
                                  {reward.frame && (
                                    <div className="flex items-center gap-2 text-cyan-400">
                                      <Palette size={16} />
                                      <span>Эксклюзивная рамка</span>
                                    </div>
                                  )}
                                  {reward.avatar && (
                                    <div className="flex items-center gap-2 text-pink-400">
                                      <User size={16} />
                                      <span>Эксклюзивный аватар</span>
                                    </div>
                                  )}
                                  {reward.perk && (
                                    <div className="flex items-center gap-2 text-orange-400">
                                      <Sparkles size={16} />
                                      <span>Эксклюзивный перк</span>
                                    </div>
                                  )}
                                  {reward.title && (
                                    <div className="flex items-center gap-2 text-red-400">
                                      <Crown size={16} />
                                      <span className="font-bold">{reward.title.name}</span>
                                    </div>
                                  )}
                                </div>

                                {isUnlocked && !isClaimed && (
                                  <button
                                    onClick={() => claimSeasonReward(levelNum)}
                                    className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
                                  >
                                    Получить награду
                                  </button>
                                )}
                                {isClaimed && (
                                  <div className="w-full mt-3 py-2 px-4 bg-green-900/50 text-green-400 rounded-lg font-bold text-center border border-green-700">
                                    ✓ Получено
                                  </div>
                                )}
                                {!isUnlocked && (
                                  <div className="w-full mt-3 py-2 px-4 bg-slate-800 text-slate-600 rounded-lg font-bold text-center">
                                    🔒 Заблокировано
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* --- TAB: ФРАКЦИИ --- */}
              {activeTab === 'factions' && (
                <FactionScreen
                  player={player}
                  setPlayer={setPlayer}
                  addNotification={addNotification}
                  addLog={addLog}
                  ITEMS_DB={ITEMS_DB}
                />
              )}

              {/* Season Reward Modal */}
              {showSeasonReward && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-8 border-4 border-yellow-500 shadow-2xl max-w-md w-full animate-in zoom-in">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-3xl font-black text-white mb-2">Награда получена!</h2>
                      <p className="text-white/80 mb-6">Уровень сезона {showSeasonReward.level}</p>
                      
                      <div className="bg-black/30 rounded-xl p-4 mb-6">
                        <div className="space-y-2 text-left">
                          {showSeasonReward.reward.gold && (
                            <div className="flex items-center justify-between text-yellow-400">
                              <span>Золото:</span>
                              <span className="font-bold">+{showSeasonReward.reward.gold}</span>
                            </div>
                          )}
                          {showSeasonReward.reward.exp && (
                            <div className="flex items-center justify-between text-blue-400">
                              <span>Опыт:</span>
                              <span className="font-bold">+{showSeasonReward.reward.exp}</span>
                            </div>
                          )}
                          {showSeasonReward.reward.item && (
                            <div className="text-purple-400 font-bold text-center mt-3">
                              🎁 {showSeasonReward.reward.item.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowSeasonReward(null)}
                        className="w-full py-3 px-6 bg-white text-purple-900 rounded-xl font-bold hover:bg-slate-100 transition-all"
                      >
                        Отлично!
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: РЕЙТИНГ --- */}
              {activeTab === 'leaderboard' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Trophy className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-200">Рейтинг игроков</h2>
                          <p className="text-slate-400 text-sm">Лучшие игроки мира</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setLeaderboardCategory('level')}
                      className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold transition-all ${
                        leaderboardCategory === 'level'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Trophy size={18} className="inline mr-2" />
                      По уровню
                    </button>
                    <button
                      onClick={() => setLeaderboardCategory('gold')}
                      className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold transition-all ${
                        leaderboardCategory === 'gold'
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Coins size={18} className="inline mr-2" />
                      По золоту
                    </button>
                    <button
                      onClick={() => setLeaderboardCategory('kills')}
                      className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold transition-all ${
                        leaderboardCategory === 'kills'
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Skull size={18} className="inline mr-2" />
                      По убийствам
                    </button>
                    <button
                      onClick={() => setLeaderboardCategory('pvp')}
                      className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold transition-all ${
                        leaderboardCategory === 'pvp'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Swords size={18} className="inline mr-2" />
                      PvP рейтинг
                    </button>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-800 border-b border-slate-700">
                            <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Место</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Игрок</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Класс</th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                              {leaderboardCategory === 'level' && 'Уровень'}
                              {leaderboardCategory === 'gold' && 'Золото'}
                              {leaderboardCategory === 'kills' && 'Убийства'}
                              {leaderboardCategory === 'pvp' && 'PvP рейтинг'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Sort players based on category
                            const sortedPlayers = [...LEADERBOARD_PLAYERS].sort((a, b) => {
                              if (leaderboardCategory === 'level') return b.level - a.level;
                              if (leaderboardCategory === 'gold') return b.gold - a.gold;
                              if (leaderboardCategory === 'kills') return b.kills - a.kills;
                              if (leaderboardCategory === 'pvp') return b.pvpRating - a.pvpRating;
                              return 0;
                            });

                            // Find player's position
                            const playerPosition = sortedPlayers.findIndex(p => p.name === player.name) + 1;

                            return sortedPlayers.map((p, index) => {
                              const rank = index + 1;
                              const isPlayer = p.name === player.name;
                              const avatar = AVATARS_DB.find(a => a.id === p.avatarId);
                              const AvatarIcon = avatar?.icon || User;
                              const playerClass = PLAYER_CLASSES.find(c => c.id === p.classId);
                              
                              let rankColor = 'text-slate-400';
                              let rankBg = 'bg-slate-800';
                              let rankText = rank.toString();
                              
                              if (rank === 1) {
                                rankColor = 'text-yellow-400';
                                rankBg = 'bg-gradient-to-r from-yellow-600 to-orange-600';
                                rankText = '1';
                              } else if (rank === 2) {
                                rankColor = 'text-slate-300';
                                rankBg = 'bg-gradient-to-r from-slate-400 to-slate-500';
                                rankText = '2';
                              } else if (rank === 3) {
                                rankColor = 'text-orange-400';
                                rankBg = 'bg-gradient-to-r from-orange-600 to-amber-700';
                                rankText = '3';
                              }

                              return (
                                <tr 
                                  key={p.id} 
                                  className={`border-b border-slate-800 transition-colors ${
                                    isPlayer ? 'bg-blue-950/30 hover:bg-blue-950/50' : 'hover:bg-slate-800/50'
                                  }`}
                                >
                                  <td className="px-4 py-4">
                                    <div className={`w-10 h-10 rounded-lg ${rankBg} flex items-center justify-center font-black ${rankColor} shadow-lg`}>
                                      {rankText}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-12 h-12 rounded-lg ${avatar?.color || 'bg-slate-700'} flex items-center justify-center border-2 ${
                                        rank <= 3 ? 'border-yellow-500' : 'border-slate-600'
                                      }`}>
                                        <AvatarIcon size={24} className="text-white" />
                                      </div>
                                      <div>
                                        <div className={`font-bold ${isPlayer ? 'text-blue-400' : 'text-white'} flex items-center gap-2`}>
                                          {p.name}
                                          {isPlayer && <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">ВЫ</span>}
                                        </div>
                                        <div className="text-xs text-slate-400">ID: {p.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="text-sm text-slate-300">{playerClass?.name || 'Неизвестно'}</span>
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <div className="font-bold text-lg">
                                      {leaderboardCategory === 'level' && (
                                        <span className="text-blue-400">{p.level}</span>
                                      )}
                                      {leaderboardCategory === 'gold' && (
                                        <span className="text-yellow-400">{p.gold.toLocaleString()}</span>
                                      )}
                                      {leaderboardCategory === 'kills' && (
                                        <span className="text-red-400">{p.kills.toLocaleString()}</span>
                                      )}
                                      {leaderboardCategory === 'pvp' && (
                                        <span className="text-purple-400">{p.pvpRating}</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Player's Position */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border-2 border-blue-500/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Ваша позиция</h3>
                        <p className="text-sm text-slate-300">
                          {(() => {
                            const sortedPlayers = [...LEADERBOARD_PLAYERS].sort((a, b) => {
                              if (leaderboardCategory === 'level') return b.level - a.level;
                              if (leaderboardCategory === 'gold') return b.gold - a.gold;
                              if (leaderboardCategory === 'kills') return b.kills - a.kills;
                              if (leaderboardCategory === 'pvp') return b.pvpRating - a.pvpRating;
                              return 0;
                            });
                            const playerPosition = sortedPlayers.findIndex(p => p.name === player.name) + 1;
                            return playerPosition > 0 ? `#${playerPosition} из ${sortedPlayers.length}` : 'Не в рейтинге';
                          })()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-white">
                          {leaderboardCategory === 'level' && player.level}
                          {leaderboardCategory === 'gold' && player.gold.toLocaleString()}
                          {leaderboardCategory === 'kills' && (player.totalKills || 0).toLocaleString()}
                          {leaderboardCategory === 'pvp' && (player.pvpRating || 1000)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {leaderboardCategory === 'level' && 'Уровень'}
                          {leaderboardCategory === 'gold' && 'Золото'}
                          {leaderboardCategory === 'kills' && 'Убийства'}
                          {leaderboardCategory === 'pvp' && 'PvP рейтинг'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: ВАШ ПЕРСОНАЖ (ОБНОВЛЕННЫЙ) --- */}
              {activeTab === 'character' && (
                <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in zoom-in duration-300">
                  
                  {/* 1. HERO HEADER */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                          <div className="flex flex-col items-center">
                              {player.customAvatar ? (
                                <div>
                                  <div className={`
                                    w-32 h-32 rounded-full overflow-hidden shadow-2xl relative group hover:scale-105 transition-transform duration-300 cursor-pointer
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.style || 'border-4 border-slate-600'}
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.glow || ''}
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.animation || ''}
                                  `}
                                    onClick={() => setShowAvatarPicker(true)}
                                  >
                                      <img src={player.customAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/0 group-hover:ring-blue-500/50 transition-all duration-300"></div>
                                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Palette size={32} className="text-white" />
                                      </div>
                                  </div>
                                  {/* Level Badge - Below Avatar */}
                                  <div className="mt-3 flex justify-center">
                                    <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full border-2 border-slate-900 font-bold shadow-lg">
                                      <span className="text-sm text-white">Lvl {player.level}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className={`
                                    w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${PlayerAvatarColor} relative group hover:scale-105 transition-transform duration-300 cursor-pointer
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.style || 'border-4 border-slate-600'}
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.glow || ''}
                                    ${AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.animation || ''}
                                  `}
                                    onClick={() => setShowAvatarPicker(true)}
                                  >
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                                      <PlayerAvatarIcon size={64} className="text-white drop-shadow-lg relative z-10" />
                                      <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/0 group-hover:ring-blue-500/50 transition-all duration-300"></div>
                                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Palette size={32} className="text-white" />
                                      </div>
                                  </div>
                                  {/* Level Badge - Below Avatar */}
                                  <div className="mt-3 flex justify-center">
                                    <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full border-2 border-slate-900 font-bold shadow-lg">
                                      <span className="text-sm text-white">Lvl {player.level}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => setShowAvatarPicker(true)}
                                className="mt-4 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
                              >
                                <Palette size={14} />
                                Сменить аватар
                              </button>
                              <div className="flex gap-2 mt-3 bg-slate-900/50 px-3 py-2 rounded-full border border-slate-700">
                                  {player.level >= 5 && <Trophy size={18} className="text-yellow-500 drop-shadow-glow animate-pulse" title="Уровень 5+" />}
                                  {player.totalKills >= 10 && <Skull size={18} className="text-red-500 drop-shadow-glow" title="Убийца" />}
                                  {player.totalSteps >= 100 && <Footprints size={18} className="text-green-500 drop-shadow-glow" title="Путешественник" />}
                                  {player.questsCompletedCount >= 5 && <CheckCircle size={18} className="text-blue-400 drop-shadow-glow" title="Герой заданий" />}
                              </div>
                          </div>

                          <div className="flex-1 text-center md:text-left space-y-4 w-full">
                              <div>
                                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 tracking-tight drop-shadow-lg">{player.name}</h2>
                                  
                                  {/* Title Display */}
                                  {(() => {
                                    const currentTitle = getCurrentTitle(player);
                                    if (currentTitle) {
                                      return (
                                        <div className={`${currentTitle.color} font-bold text-sm tracking-wide mt-2 flex items-center justify-center md:justify-start gap-2 animate-in fade-in duration-300`}>
                                          <span className="text-lg">{currentTitle.icon}</span>
                                          <span>{currentTitle.name}</span>
                                        </div>
                                      );
                                    }
                                  })()}
                                  
                                  <div className="text-blue-400 font-bold text-sm uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                      {player.className}
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-300">
                                      <span className="flex items-center gap-1">
                                          <Sparkles size={12} className="text-cyan-400" />
                                          XP Progress
                                      </span>
                                      <span className="text-cyan-400">{Math.floor((player.exp / player.maxExp) * 100)}%</span>
                                  </div>
                                  <div className="h-5 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-700/50 shadow-inner relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                                      <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 shadow-lg shadow-blue-500/50 relative" style={{ width: `${(player.exp / player.maxExp) * 100}%` }}>
                                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                                      </div>
                                  </div>
                                  <div className="text-right text-[10px] text-slate-400 font-mono">{player.exp} / {player.maxExp} XP</div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 mt-4">
                                  <div className="bg-gradient-to-br from-red-950/50 to-slate-950/50 p-3 rounded-xl border-2 border-red-900/50 flex flex-col items-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-red-900/50">
                                      <Heart className="text-red-500 mb-1 drop-shadow-glow" size={22} />
                                      <span className="font-bold text-xl text-white">{player.hp}</span>
                                      <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">HP</span>
                                  </div>
                                  <div className="bg-gradient-to-br from-yellow-950/50 to-slate-950/50 p-3 rounded-xl border-2 border-yellow-900/50 flex flex-col items-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-yellow-900/50">
                                      <Zap className="text-yellow-500 mb-1 drop-shadow-glow" size={22} />
                                      <span className="font-bold text-xl text-white">{player.energy}</span>
                                      <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">Energy</span>
                                  </div>
                                  <div className="bg-gradient-to-br from-amber-950/50 to-slate-950/50 p-3 rounded-xl border-2 border-amber-900/50 flex flex-col items-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-amber-900/50">
                                      <Coins className="text-yellow-400 mb-1 drop-shadow-glow" size={22} />
                                      <span className="font-bold text-xl text-white">{player.gold}</span>
                                      <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">Gold</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* 2. STATS & EQUIPMENT GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card title="Боевые параметры" icon={Dna}>
                          <div className="space-y-3">
                              <StatRow label="Сила атаки" value={player.str + (player.equipment.weapon?.val || 0)} icon={Sword} color="text-red-400" sub={`База: ${player.str}`} />
                              <StatRow label="Защита" value={player.def + (player.equipment.armor?.val || 0)} icon={Shield} color="text-blue-400" sub={`База: ${player.def}`} />
                              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-3"></div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gradient-to-br from-yellow-950/30 to-slate-900 p-3 rounded-lg border border-yellow-900/30 text-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-yellow-900/30">
                                      <div className="text-xs text-yellow-400 mb-1 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                          <Target size={12} />
                                          Крит
                                      </div>
                                      <div className="text-yellow-500 font-mono font-bold text-xl drop-shadow-glow">{(player.str * 0.5).toFixed(1)}%</div>
                                  </div>
                                  <div className="bg-gradient-to-br from-green-950/30 to-slate-900 p-3 rounded-lg border border-green-900/30 text-center hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-green-900/30">
                                      <div className="text-xs text-green-400 mb-1 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                          <Zap size={12} />
                                          Уклон
                                      </div>
                                      <div className="text-green-500 font-mono font-bold text-xl drop-shadow-glow">{(player.def * 0.2 + player.level * 0.1).toFixed(1)}%</div>
                                  </div>
                              </div>
                          </div>
                      </Card>

                      <Card title="Статистика" icon={Scroll}>
                           <div className="grid grid-cols-2 gap-3 h-full content-start">
                              <StatBox label="Шагов пройдено" value={player.totalSteps || 0} icon={Footprints} color="text-green-400" />
                              <StatBox label="Врагов убито" value={player.totalKills || 0} icon={Skull} color="text-red-400" />
                              <StatBox label="Квестов" value={player.questsCompletedCount || 0} icon={CheckCircle} color="text-blue-400" />
                              <StatBox label="Предметов" value={player.inventory.length} icon={Package} color="text-purple-400" />
                           </div>
                      </Card>
                  </div>

                  {/* 3. EQUIPMENT VISUALIZER */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                          <Backpack size={20} className="text-blue-400"/> 
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Снаряжение</span>
                      </h3>
                      <div className="flex flex-wrap justify-center gap-6 relative z-10">
                          <EquipSlot item={player.equipment.weapon} type="weapon" icon={Sword} onClick={handleEquipmentClick} />
                          <EquipSlot item={player.equipment.armor} type="armor" icon={Shield} onClick={handleEquipmentClick} />
                          <EquipSlot type="helmet" icon={Crown} placeholder />
                          <EquipSlot type="boots" icon={Footprints} placeholder />
                          <EquipSlot type="ring" icon={Target} placeholder />
                      </div>
                  </div>

                  {/* 4. PERKS SECTION */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                          <Sparkles size={20} className="text-orange-400"/> 
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Перки ({(player.perks || []).length})</span>
                      </h3>
                      
                      {(!player.perks || player.perks.length === 0) ? (
                        <div className="text-center py-8 relative z-10">
                          <div className="text-slate-500 mb-2">У вас пока нет перков</div>
                          <div className="text-xs text-slate-600">Получайте перки из сундуков или при путешествиях!</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                          {player.perks.map(perkId => {
                            const perk = PERKS_DB.find(p => p.id === perkId);
                            if (!perk) return null;
                            const PerkIcon = perk.icon;
                            return (
                              <div key={perkId} className={`bg-gradient-to-br ${
                                perk.rarity === 'legendary' ? 'from-orange-950/50 to-red-950/50 border-orange-500/50' :
                                perk.rarity === 'epic' ? 'from-purple-950/50 to-pink-950/50 border-purple-500/50' :
                                perk.rarity === 'rare' ? 'from-blue-950/50 to-cyan-950/50 border-blue-500/50' :
                                'from-green-950/50 to-emerald-950/50 border-green-500/50'
                              } p-4 rounded-xl border-2 hover:scale-105 transition-transform duration-200 shadow-lg`}>
                                <div className="flex items-start gap-3">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    perk.rarity === 'legendary' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                                    perk.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                                    perk.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                    'bg-gradient-to-br from-green-500 to-emerald-500'
                                  }`}>
                                    <PerkIcon size={24} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className={`font-bold text-sm ${
                                        perk.rarity === 'legendary' ? 'text-orange-400' :
                                        perk.rarity === 'epic' ? 'text-purple-400' :
                                        perk.rarity === 'rare' ? 'text-blue-400' :
                                        'text-green-400'
                                      }`}>
                                        {perk.name}
                                      </h4>
                                      <span className="text-[10px] text-slate-500 uppercase font-bold">{perk.rarity}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{perk.effect}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* --- TAB: КОЛЛЕКЦИИ (НОВОЕ) --- */}
              {activeTab === 'collections' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  
                  {/* Top Stats Bar */}
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                     <div className="flex items-center gap-3">
                       <div className="bg-slate-800 p-2 rounded-lg">
                         <Coins className="text-yellow-500" />
                       </div>
                       <div>
                         <div className="text-xs text-slate-500 uppercase font-bold">Итого (Золото)</div>
                         <div className="text-xl font-bold text-white">{player.gold}</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-xs text-slate-500 uppercase font-bold">Собрано</div>
                       <div className="text-xl font-bold text-white">
                         {player.collectedAvatars.length} <span className="text-slate-500 text-sm">/ {AVATARS_DB.length}</span>
                       </div>
                     </div>
                  </div>

                  {/* Progress Bar (Chest Progress style) */}
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                     <div className="flex justify-between text-sm mb-2 font-bold text-slate-300">
                        <span className="flex items-center gap-2"><Box size={16} className="text-yellow-600"/> Прогресс коллекции</span>
                        <span>{Math.round((player.collectedAvatars.length / AVATARS_DB.length) * 100)}%</span>
                     </div>
                     <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(player.collectedAvatars.length / AVATARS_DB.length) * 100}%` }}></div>
                     </div>
                     <div className="mt-4 flex gap-4">
                        <Button onClick={buyAvatarChest} variant="gold" className="text-sm">
                           <Box size={16} /> Купить сундук (500 G)
                        </Button>
                        <Button onClick={equipRandomAvatar} variant="outline" className="text-sm">
                           <User size={16} /> Надеть случайный
                        </Button>
                     </div>
                  </div>

                  {/* Navigation Tabs (Visual mostly) */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                     {['Аватары', 'Рамки', 'Предметы', 'Спрайты', 'Фоны', 'Карты', 'NPC', 'События'].map(tab => (
                       <button 
                         key={tab}
                         onClick={() => {
                           if (tab === 'Аватары') setCollectionTab('avatars');
                           else if (tab === 'Рамки') setCollectionTab('frames');
                           else setCollectionTab('other');
                         }}
                         className={`px-4 py-2 rounded-t-lg text-sm font-bold whitespace-nowrap transition-colors ${
                           (tab === 'Аватары' && collectionTab === 'avatars') || 
                           (tab === 'Рамки' && collectionTab === 'frames') ||
                           (collectionTab === 'other' && tab !== 'Аватары' && tab !== 'Рамки')
                             ? 'bg-slate-800 text-white border-b-2 border-emerald-500' 
                             : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                         }`}
                       >
                         {tab}
                       </button>
                     ))}
                  </div>

                  {/* Content Grid */}
                  {collectionTab === 'avatars' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {AVATARS_DB.map(avatar => {
                        const isCollected = player.collectedAvatars.includes(avatar.id);
                        const isEquipped = player.avatarId === avatar.id;

                        return (
                          <div 
                            key={avatar.id} 
                            className={`
                              relative group rounded-xl p-4 flex flex-col items-center justify-between border-2 transition-all cursor-pointer h-40
                              ${isEquipped 
                                ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                : isCollected 
                                  ? 'bg-slate-900 border-slate-700 hover:border-slate-500' 
                                  : 'bg-slate-950 border-slate-800 opacity-50 grayscale'
                              }
                            `}
                            onClick={() => equipAvatar(avatar.id)}
                          >
                             <div className="absolute top-2 right-2 text-slate-600">
                               {isCollected ? <Unlock size={14} /> : <Lock size={14} />}
                             </div>

                             <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${avatar.color} mb-2 shadow-lg`}>
                               <avatar.icon size={32} className="text-white" />
                             </div>
                             
                             <div className="text-center w-full">
                               <div className="font-bold text-xs text-white truncate">{avatar.name}</div>
                               <div className={`text-[10px] uppercase font-bold mt-1 
                                 ${avatar.rarity === 'legendary' ? 'text-orange-500' 
                                 : avatar.rarity === 'epic' ? 'text-purple-500'
                                 : avatar.rarity === 'rare' ? 'text-blue-400'
                                 : avatar.rarity === 'uncommon' ? 'text-green-400'
                                 : 'text-slate-500'}
                               `}>
                                 {avatar.rarity}
                               </div>
                             </div>

                             {isEquipped && (
                               <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none">
                                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-slate-900 text-[10px] px-2 py-0.5 rounded font-bold">
                                    ВЫБРАНО
                                  </div>
                               </div>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  ) : collectionTab === 'frames' ? (
                    <div>
                      {/* Frames Stats */}
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Собрано рамок</div>
                            <div className="text-2xl font-bold text-white">
                              {player.collectedFrames?.length || 1} <span className="text-slate-500 text-sm">/ {AVATAR_FRAMES.length}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase font-bold">Активная рамка</div>
                            <div className="text-lg font-bold text-emerald-400">
                              {AVATAR_FRAMES.find(f => f.id === player.avatarFrameId)?.name || 'Базовая'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Frames Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {AVATAR_FRAMES.map(frame => {
                          const isCollected = player.collectedFrames?.includes(frame.id);
                          const isEquipped = player.avatarFrameId === frame.id;
                          const currentAvatar = AVATARS_DB.find(a => a.id === player.avatarId);

                          return (
                            <div 
                              key={frame.id} 
                              className={`
                                relative group rounded-xl p-4 flex flex-col items-center justify-between border-2 transition-all cursor-pointer
                                ${isEquipped 
                                  ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                  : isCollected 
                                    ? 'bg-slate-900 border-slate-700 hover:border-slate-500' 
                                    : 'bg-slate-950 border-slate-800 opacity-50 grayscale'
                                }
                              `}
                              onClick={() => {
                                if (isCollected) {
                                  setPlayer(p => ({ ...p, avatarFrameId: frame.id }));
                                  addNotification(`🖼️ Рамка "${frame.name}" экипирована!`, 'success');
                                }
                              }}
                            >
                              <div className="absolute top-2 right-2 text-slate-600">
                                {isCollected ? <Unlock size={14} /> : <Lock size={14} />}
                              </div>

                              {/* Frame Preview with Avatar */}
                              <div className="relative mb-3">
                                <div className={`
                                  w-20 h-20 rounded-full flex items-center justify-center ${currentAvatar?.color || 'bg-slate-700'}
                                  ${frame.style} ${frame.glow} ${frame.animation}
                                `}>
                                  {currentAvatar && <currentAvatar.icon size={32} className="text-white" />}
                                </div>
                              </div>
                              
                              <div className="text-center w-full">
                                <div className="font-bold text-xs text-white truncate">{frame.name}</div>
                                <div className={`text-[10px] uppercase font-bold mt-1 
                                  ${frame.rarity === 'legendary' ? 'text-orange-500' 
                                  : frame.rarity === 'epic' ? 'text-purple-500'
                                  : frame.rarity === 'rare' ? 'text-blue-400'
                                  : frame.rarity === 'uncommon' ? 'text-green-400'
                                  : 'text-slate-500'}
                                `}>
                                  {frame.rarity}
                                </div>
                              </div>

                              {isEquipped && (
                                <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none">
                                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-slate-900 text-[10px] px-2 py-0.5 rounded font-bold">
                                    ВЫБРАНО
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800 border-dashed text-slate-500">
                      <div className="mb-4 flex justify-center"><Folder size={48} className="text-slate-700" /></div>
                      Этот раздел коллекции пока пуст. Исследуйте мир, чтобы найти новые предметы!
                    </div>
                  )}

                </div>
              )}

              {/* --- TAB: МОЙ ДОМ --- */}
              {activeTab === 'myhouse' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Заголовок */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-orange-200 mb-1">Мой дом</h2>
                      <p className="text-slate-400 text-sm">Ваше личное убежище для отдыха и хранения</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Хранилище */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <Box size={24} className="text-purple-400 drop-shadow-glow" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Хранилище</span>
                        <span className="text-sm text-slate-500 font-normal ml-2">(0/50 слотов)</span>
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 relative z-10">
                        Храните предметы в безопасности. Вместимость: 50 слотов
                      </p>
                      <div className="bg-slate-950/80 p-8 rounded-xl border-2 border-slate-800 relative z-10">
                        <div className="text-center">
                          <Box size={64} className="mx-auto mb-4 text-slate-700" />
                          <p className="text-slate-500 text-lg font-bold mb-2">Хранилище пусто</p>
                          <p className="text-slate-600 text-sm">Перетащите предметы из инвентаря для хранения</p>
                        </div>
                      </div>
                    </div>

                    {/* Отдых */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <Home size={24} className="text-green-400 drop-shadow-glow" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">Кровать</span>
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 relative z-10">
                        Отдохните, чтобы восстановить здоровье и энергию
                      </p>
                      <div className="space-y-4 relative z-10">
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Heart size={14} className="text-red-400" />
                              Здоровье:
                            </span>
                            <span className="text-green-400 font-bold">{player.hp} / {player.maxHp}</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-600 to-pink-500" style={{width: `${(player.hp / player.maxHp) * 100}%`}}></div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Zap size={14} className="text-yellow-400" />
                              Энергия:
                            </span>
                            <span className="text-blue-400 font-bold">{player.energy} / {player.maxEnergy}</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{width: `${(player.energy / player.maxEnergy) * 100}%`}}></div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setPlayer(p => ({
                              ...p,
                              hp: p.maxHp,
                              energy: p.maxEnergy
                            }));
                            addLog('Вы хорошо отдохнули! Здоровье и энергия восстановлены.', 'good');
                            addNotification('Здоровье и энергия восстановлены!', 'success');
                          }}
                          disabled={player.hp === player.maxHp && player.energy === player.maxEnergy}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                            player.hp === player.maxHp && player.energy === player.maxEnergy
                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white active:scale-95 hover:shadow-green-500/50'
                          }`}
                        >
                          <Home size={18} />
                          Отдохнуть
                        </button>
                      </div>
                    </div>

                    {/* Улучшения дома */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <Hammer size={24} className="text-orange-400 drop-shadow-glow" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">Улучшения</span>
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 relative z-10">
                        Улучшайте свой дом для получения бонусов
                      </p>
                      <div className="space-y-3 relative z-10">
                        <div className="bg-gradient-to-br from-purple-950/30 to-slate-950/30 p-4 rounded-xl border-2 border-purple-900/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-200 flex items-center gap-2">
                              <Box size={16} className="text-purple-400" />
                              Расширение хранилища
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              Уровень {player.homeUpgrades?.storageExpansion || 0} / 5
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">+20 слотов хранилища за уровень</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-950/30 to-slate-950/30 p-4 rounded-xl border-2 border-blue-900/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-200 flex items-center gap-2">
                              <FlaskConical size={16} className="text-blue-400" />
                              Алхимическая лаборатория
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              Уровень {player.homeUpgrades?.alchemyLab || 0} / 3
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">Ускоряет крафт зелий на 25% за уровень</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-950/30 to-slate-950/30 p-4 rounded-xl border-2 border-red-900/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-200 flex items-center gap-2">
                              <Target size={16} className="text-red-400" />
                              Тренировочный манекен
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              Уровень {player.homeUpgrades?.trainingDummy || 0} / 3
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">+5% опыта от боев за уровень</p>
                        </div>
                        
                        <button
                          onClick={() => setShowUpgradesModal(true)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
                        >
                          <Hammer size={20} />
                          Открыть улучшения
                        </button>
                      </div>
                    </div>

                    {/* Статистика дома */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <Info size={24} className="text-blue-400 drop-shadow-glow" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Информация</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        <div className="bg-gradient-to-br from-amber-950/50 to-slate-950 p-4 rounded-xl border-2 border-amber-900/50 hover:scale-105 transition-transform">
                          <Home className="text-amber-400 mb-2 drop-shadow-glow" size={24} />
                          <div className="text-2xl font-bold text-white">1</div>
                          <div className="text-xs text-amber-400 uppercase font-bold">Уровень дома</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-950/50 to-slate-950 p-4 rounded-xl border-2 border-purple-900/50 hover:scale-105 transition-transform">
                          <Box className="text-purple-400 mb-2 drop-shadow-glow" size={24} />
                          <div className="text-2xl font-bold text-white">0/50</div>
                          <div className="text-xs text-purple-400 uppercase font-bold">Хранилище</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-950/50 to-slate-950 p-4 rounded-xl border-2 border-orange-900/50 hover:scale-105 transition-transform">
                          <Hammer className="text-orange-400 mb-2 drop-shadow-glow" size={24} />
                          <div className="text-2xl font-bold text-white">0/10</div>
                          <div className="text-xs text-orange-400 uppercase font-bold">Улучшения</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-950/50 to-slate-950 p-4 rounded-xl border-2 border-green-900/50 hover:scale-105 transition-transform">
                          <Sparkles className="text-green-400 mb-2 drop-shadow-glow" size={24} />
                          <div className="text-2xl font-bold text-white">50%</div>
                          <div className="text-xs text-green-400 uppercase font-bold">Комфорт</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: ГОРОД (МАГАЗИН) --- */}
              {activeTab === 'city' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Заголовок рынка */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-amber-200 mb-1">Городской рынок</h2>
                        <p className="text-slate-400 text-sm">Лучшие товары для искателей приключений</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-br from-yellow-900/30 to-amber-900/20 px-6 py-3 rounded-xl border-2 border-yellow-700/50 shadow-lg">
                        <Coins size={24} className="text-yellow-400 drop-shadow-glow" />
                        <div>
                          <div className="text-2xl font-bold text-yellow-400 drop-shadow-glow">{player.gold}</div>
                          <div className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider">Золото</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Категории товаров */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'weapon', 'armor', 'consumable', 'resource'].map(category => (
                      <button
                        key={category}
                        onClick={() => setShopCategory(category)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                          shopCategory === category
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {category === 'all' && '🏪 Все товары'}
                        {category === 'weapon' && '⚔️ Оружие'}
                        {category === 'armor' && '🛡️ Броня'}
                        {category === 'consumable' && '🧪 Зелья'}
                        {category === 'resource' && '📦 Ресурсы'}
                      </button>
                    ))}
                  </div>

                  {/* Сетка товаров */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ITEMS_DB
                      .filter(item => shopCategory === 'all' || item.type === shopCategory)
                      .map(item => {
                        const rarityClass = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                        const rarityBg = RARITY_BG[item.rarity] || RARITY_BG.common;
                        const canAfford = player.gold >= item.cost;
                        const glowEffect = item.rarity === 'legendary' ? 'shadow-[0_0_20px_rgba(251,146,60,0.6)] animate-pulse' : item.rarity === 'epic' ? 'shadow-[0_0_15px_rgba(168,85,247,0.4)]' : '';
                        
                        const tooltipContent = (
                          <div className="text-left max-w-xs">
                            <div className={`font-bold mb-1 ${rarityClass.split(' ')[0]}`}>{item.name}</div>
                            <div className="text-xs text-slate-400 mb-2">
                              {item.type === 'weapon' && `⚔️ Урон: +${item.val}`}
                              {item.type === 'armor' && `🛡️ Защита: +${item.val}`}
                              {item.type === 'consumable' && `❤️ Эффект: ${item.val}`}
                              {item.type === 'resource' && `📦 Материал для крафта`}
                            </div>
                            {item.effect && (
                              <div className="text-xs text-purple-400 mb-2 border-t border-slate-700 pt-2">
                                <span className="text-slate-500">✨ Эффект:</span> {item.effect}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                              <div>Редкость: {item.rarity}</div>
                              <div>💰 Цена: {item.cost} золота</div>
                            </div>
                          </div>
                        );
                        
                        return (
                          <Tooltip key={item.id} content={tooltipContent} position="top">
                            <div className={`${rarityBg} rounded-xl border-2 ${rarityClass.split(' ')[1]} ${glowEffect} overflow-hidden group hover:scale-105 transition-all duration-200 relative h-full flex flex-col`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              {/* Бейдж редкости */}
                              <div className="absolute top-2 right-2 z-10">
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${rarityBg} border ${rarityClass.split(' ')[1]}`}>
                                  {item.rarity}
                                </div>
                              </div>

                              <div className="p-4 relative z-10 flex flex-col flex-1">
                                {/* Иконка товара */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${rarityBg} border-2 ${rarityClass.split(' ')[1]} shadow-lg flex-shrink-0`}>
                                    {item.type === 'weapon' ? <Sword size={32} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/> : 
                                     item.type === 'armor' ? <Shield size={32} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/> : 
                                     item.type === 'consumable' ? <Heart size={32} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/> :
                                     <Box size={32} className={`${rarityClass.split(' ')[0]} drop-shadow-glow`}/>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm ${rarityClass.split(' ')[0]} mb-1 truncate`}>{item.name}</h4>
                                    <p className="text-xs text-slate-400">
                                      {item.type === 'weapon' && `⚔️ Урон: +${item.val}`}
                                      {item.type === 'armor' && `🛡️ Защита: +${item.val}`}
                                      {item.type === 'consumable' && `❤️ Эффект: ${item.val}`}
                                      {item.type === 'resource' && `📦 Материал`}
                                    </p>
                                  </div>
                                </div>

                                {/* Эффект - фиксированная высота */}
                                <div className="mb-3 h-12 flex items-center">
                                  {item.effect ? (
                                    <div className="w-full p-2 bg-purple-900/20 border border-purple-800/30 rounded-lg">
                                      <p className="text-[10px] text-purple-300 line-clamp-2">
                                        ✨ {item.effect}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="w-full"></div>
                                  )}
                                </div>

                                {/* Кнопка покупки - прижата к низу */}
                                <div className="mt-auto">
                                  <button
                                    disabled={!canAfford}
                                    onClick={() => {
                                      if(canAfford) {
                                        setPlayer({
                                          ...player,
                                          gold: player.gold - item.cost,
                                          inventory: [...player.inventory, {...item, uid: Date.now()}]
                                        });
                                        addLog(`Вы купили ${item.name}`, 'neutral');
                                        addNotification(`Куплено: ${item.name}`, 'success');
                                      }
                                    }}
                                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                      canAfford
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white active:scale-95 hover:shadow-green-500/50'
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    }`}
                                  >
                                    <ShoppingBag size={16} />
                                    <span>{item.cost}</span>
                                    <Coins size={16} className={canAfford ? 'text-yellow-300' : 'text-slate-600'} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Tooltip>
                        );
                      })}
                  </div>

                  {/* Информационная панель */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-950/50 to-slate-950 p-4 rounded-xl border-2 border-blue-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Info size={20} className="text-blue-400" />
                        <h3 className="font-bold text-blue-300">Совет торговца</h3>
                      </div>
                      <p className="text-xs text-slate-400">Легендарные предметы дают уникальные эффекты и светятся особым образом!</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-950/50 to-slate-950 p-4 rounded-xl border-2 border-purple-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles size={20} className="text-purple-400" />
                        <h3 className="font-bold text-purple-300">Редкость</h3>
                      </div>
                      <p className="text-xs text-slate-400">Чем выше редкость, тем мощнее предмет. Ищите эпические и легендарные вещи!</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-950/50 to-slate-950 p-4 rounded-xl border-2 border-green-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Coins size={20} className="text-green-400" />
                        <h3 className="font-bold text-green-300">Экономия</h3>
                      </div>
                      <p className="text-xs text-slate-400">Продавайте ненужные предметы в инвентаре, чтобы заработать золото!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: ПРОФЕССИЯ --- */}
              {activeTab === 'profession' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8">
                  {/* Заголовок с градиентом */}
                  <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      Профессии
                    </h2>
                    <p className="text-slate-400">Выберите свой путь и станьте мастером своего дела</p>
                  </div>

                  {!player ? (
                    <div className="text-center py-12 text-slate-500">
                      <div className="animate-spin w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto"></div>
                    </div>
                  ) : !player.profession ? (
                    // Выбор профессии - улучшенный дизайн
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PROFESSIONS && PROFESSIONS.length > 0 ? PROFESSIONS.map((prof, idx) => {
                          const isLocked = player.level < prof.unlockLevel;
                          const ProfIcon = prof.icon;
                          
                          // Градиенты для каждой профессии
                          const gradients = {
                            'blacksmith': 'from-orange-600 via-red-600 to-orange-700',
                            'alchemist': 'from-purple-600 via-pink-600 to-purple-700',
                            'herbalist': 'from-green-600 via-emerald-600 to-green-700',
                            'miner': 'from-slate-600 via-gray-600 to-slate-700'
                          };
                          
                          return (
                            <div 
                              key={prof.id} 
                              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                                isLocked 
                                  ? 'border-slate-800 opacity-60 cursor-not-allowed' 
                                  : 'border-slate-700 hover:border-slate-500 hover:scale-105 hover:shadow-2xl cursor-pointer'
                              }`}
                              style={{
                                animationDelay: `${idx * 100}ms`
                              }}
                            >
                              {/* Фоновый градиент */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[prof.id] || 'from-slate-700 to-slate-800'} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                              
                              {/* Анимированный блик */}
                              {!isLocked && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              )}
                              
                              <div className="relative p-6 bg-slate-900/80 backdrop-blur">
                                {/* Иконка профессии */}
                                <div className="flex items-start gap-4 mb-4">
                                  <div className={`relative w-20 h-20 rounded-xl bg-gradient-to-br ${gradients[prof.id]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <ProfIcon size={36} className="text-white drop-shadow-lg" />
                                    {!isLocked && (
                                      <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-2xl flex items-center gap-2 mb-1">
                                      {prof.name}
                                      {isLocked && <Lock size={18} className="text-slate-600" />}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{prof.description}</p>
                                  </div>
                                </div>
                                
                                {/* Статистика профессии */}
                                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 mb-1">Базовый опыт</div>
                                    <div className="text-sm font-bold text-blue-400">{prof.baseExp}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 mb-1">Рост опыта</div>
                                    <div className="text-sm font-bold text-purple-400">×{prof.expGrowth}</div>
                                  </div>
                                </div>

                                {/* Кнопка выбора */}
                                {isLocked ? (
                                  <div className="text-center py-3 px-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <Lock size={16} className="inline mr-2 text-slate-600" />
                                    <span className="text-sm text-slate-500 font-medium">
                                      Требуется уровень {prof.unlockLevel}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => selectProfession(prof.id)}
                                    className={`w-full px-6 py-3 bg-gradient-to-r ${gradients[prof.id]} hover:shadow-lg text-white rounded-xl font-bold transition-all transform active:scale-95`}
                                  >
                                    Выбрать профессию
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="col-span-2 text-center py-12 text-slate-500">
                            Профессии не найдены
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Экран профессии - улучшенный дизайн
                    <div>
                      {(() => {
                        const prof = PROFESSIONS.find(p => p.id === player.profession);
                        if (!prof) return null;
                        const ProfIcon = prof.icon;
                        const progress = (player.professionExp / player.professionMaxExp) * 100;
                        
                        const gradients = {
                          'blacksmith': 'from-orange-600 via-red-600 to-orange-700',
                          'alchemist': 'from-purple-600 via-pink-600 to-purple-700',
                          'herbalist': 'from-green-600 via-emerald-600 to-green-700',
                          'miner': 'from-slate-600 via-gray-600 to-slate-700'
                        };
                        
                        return (
                          <div className="space-y-6">
                            {/* Карточка профессии с градиентом */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-700">
                              {/* Фоновый градиент */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[prof.id]} opacity-20`}></div>
                              
                              <div className="relative p-8 bg-slate-900/90 backdrop-blur">
                                <div className="flex items-start gap-6 mb-6">
                                  {/* Большая иконка профессии */}
                                  <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${gradients[prof.id]} flex items-center justify-center shadow-2xl`}>
                                    <ProfIcon size={48} className="text-white drop-shadow-lg" />
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-4 border-slate-900">
                                      {player.professionLevel}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                      {prof.name}
                                    </h3>
                                    <p className="text-slate-400 mb-4">{prof.description}</p>
                                    
                                    {/* Статистика в строку */}
                                    <div className="flex gap-4">
                                      <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-xs text-slate-500">Уровень</div>
                                        <div className="text-lg font-bold text-blue-400">{player.professionLevel}</div>
                                      </div>
                                      <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-xs text-slate-500">Опыт</div>
                                        <div className="text-lg font-bold text-purple-400">{player.professionExp}/{player.professionMaxExp}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Прогресс-бар с градиентом */}
                                <div className="mb-6">
                                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span className="font-medium">Прогресс до следующего уровня</span>
                                    <span className="font-bold">{Math.floor(progress)}%</span>
                                  </div>
                                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                                    <div 
                                      className={`h-full bg-gradient-to-r ${gradients[prof.id]} transition-all duration-500 relative overflow-hidden`}
                                      style={{ width: `${progress}%` }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Кнопка действия с градиентом */}
                                <button
                                  onClick={performProfessionAction}
                                  disabled={player.energy < 5}
                                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                                    player.energy < 5
                                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700'
                                      : `bg-gradient-to-r ${gradients[prof.id]} hover:shadow-2xl hover:scale-105 text-white active:scale-95`
                                  }`}
                                >
                                  {player.energy < 5 ? (
                                    <>
                                      <Zap size={20} className="inline mr-2" />
                                      Недостаточно энергии
                                    </>
                                  ) : (
                                    <>
                                      <ProfIcon size={20} className="inline mr-2" />
                                      Работать (5 энергии)
                                    </>
                                  )}
                                </button>

                                {/* Рыбалка и собирательство */}
                                {(prof.id === 'fisher' || prof.id === 'gatherer') && (
                                  <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                                    {prof.id === 'fisher' && (
                                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/30">
                                        <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                                          <span className="text-2xl">🎣</span> Рыбалка
                                        </h4>
                                        <button
                                          onClick={startFishing}
                                          disabled={player.energy < 5 || fishingState?.inProgress}
                                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all transform ${
                                            player.energy < 5 || fishingState?.inProgress
                                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white hover:scale-105 active:scale-95 shadow-lg'
                                          }`}
                                        >
                                          {fishingState?.inProgress 
                                            ? `🎣 Рыбалка... ${fishingState.timeLeft}с` 
                                            : player.energy < 5 
                                            ? 'Недостаточно энергии' 
                                            : 'Начать рыбалку (5 энергии)'}
                                        </button>
                                        <p className="text-xs text-blue-300/70 mt-2">Ловите рыбу в локациях с водой</p>
                                      </div>
                                    )}
                                    
                                    {prof.id === 'gatherer' && (
                                      <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30">
                                        <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                                          <span className="text-2xl">🌿</span> Собирательство
                                        </h4>
                                        <button
                                          onClick={startGathering}
                                          disabled={player.energy < 5 || gatheringState?.inProgress}
                                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all transform ${
                                            player.energy < 5 || gatheringState?.inProgress
                                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:scale-105 active:scale-95 shadow-lg'
                                          }`}
                                        >
                                          {gatheringState?.inProgress 
                                            ? `🌿 Собирательство... ${gatheringState.timeLeft}с` 
                                            : player.energy < 5 
                                            ? 'Недостаточно энергии' 
                                            : 'Начать собирательство (5 энергии)'}
                                        </button>
                                        <p className="text-xs text-green-300/70 mt-2">Собирайте ягоды, грибы и редкие растения</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Доступные рецепты */}
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="text-yellow-400" size={24} />
                                <h3 className="text-2xl font-bold">Доступные рецепты</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getAvailableRecipes.map((recipe, idx) => (
                                  <div 
                                    key={recipe.id} 
                                    className="group relative overflow-hidden bg-slate-900 p-5 rounded-xl border-2 border-slate-700 hover:border-slate-600 transition-all hover:scale-105 hover:shadow-xl"
                                    style={{
                                      animationDelay: `${idx * 50}ms`
                                    }}
                                  >
                                    {/* Блик при наведении */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    
                                    <div className="relative">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="font-bold text-lg">{recipe.name}</div>
                                        <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                          Ур. {recipe.requiredLevel}
                                        </div>
                                      </div>
                                      <div className="text-sm text-slate-400 mb-2">
                                        Награда: <span className="text-purple-400 font-bold">+{recipe.expReward} опыта</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Hammer size={14} />
                                        <span>Смотрите в разделе "Крафт"</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {getAvailableRecipes.length === 0 && (
                                  <div className="col-span-2 text-center py-12 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-800">
                                    <Sparkles size={48} className="mx-auto mb-4 text-slate-700" />
                                    <p className="text-slate-500">Повышайте уровень профессии, чтобы разблокировать рецепты</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: КРАФТ --- */}
              {activeTab === 'craft' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8">
                  {/* Заголовок с градиентом */}
                  <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      Крафт
                    </h2>
                    <p className="text-slate-400">Создавайте легендарные предметы из собранных ресурсов</p>
                  </div>

                  {!player.profession ? (
                    <div className="text-center py-20 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 backdrop-blur">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-30"></div>
                        <Hammer size={64} className="relative text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-lg mb-2">Профессия не выбрана</p>
                      <p className="text-slate-500 text-sm">Сначала выберите профессию в разделе "Профессия"</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Информация о профессии */}
                      {(() => {
                        const prof = PROFESSIONS.find(p => p.id === player.profession);
                        if (!prof) return null;
                        const ProfIcon = prof.icon;
                        
                        const gradients = {
                          'blacksmith': 'from-orange-600 via-red-600 to-orange-700',
                          'alchemist': 'from-purple-600 via-pink-600 to-purple-700',
                          'herbalist': 'from-green-600 via-emerald-600 to-green-700',
                          'miner': 'from-slate-600 via-gray-600 to-slate-700'
                        };
                        
                        return (
                          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-700 mb-6">
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[prof.id]} opacity-10`}></div>
                            <div className="relative p-6 bg-slate-900/90 backdrop-blur">
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradients[prof.id]} flex items-center justify-center shadow-lg`}>
                                  <ProfIcon size={32} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold mb-1">{prof.name}</h3>
                                  <p className="text-sm text-slate-400">Уровень {player.professionLevel} • {getAvailableRecipes.length} доступных рецептов</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Рецепты */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getAvailableRecipes.map((recipe, idx) => {
                          const canCraftThis = canCraft(recipe);
                          const rarityClass = RARITY_COLORS[recipe.result.rarity] || RARITY_COLORS.common;
                          const rarityBg = RARITY_BG[recipe.result.rarity] || RARITY_BG.common;
                          
                          // Градиенты для редкости
                          const rarityGradients = {
                            'common': 'from-slate-700 to-slate-800',
                            'uncommon': 'from-green-700 to-green-800',
                            'rare': 'from-blue-700 to-blue-800',
                            'epic': 'from-purple-700 to-purple-800',
                            'legendary': 'from-orange-700 to-orange-800'
                          };
                          
                          const tooltipContent = (
                            <div className="text-left max-w-xs">
                              <div className={`font-bold mb-1 ${rarityClass.split(' ')[0]}`}>{recipe.name}</div>
                              <div className="text-xs text-slate-400 mb-2">
                                {recipe.result.type === 'weapon' && `⚔️ Урон: ${recipe.result.val}`}
                                {recipe.result.type === 'armor' && `🛡️ Защита: ${recipe.result.val}`}
                                {recipe.result.type === 'consumable' && `✨ Эффект: ${recipe.result.val}`}
                              </div>
                              <div className="text-xs text-slate-500 mb-1">
                                Редкость: {recipe.result.rarity}
                              </div>
                              <div className="text-xs text-purple-400">
                                Опыт профессии: +{recipe.expReward}
                              </div>
                            </div>
                          );
                          
                          return (
                            <Tooltip key={recipe.id} content={tooltipContent} position="right">
                              <div 
                                className={`group relative overflow-hidden ${rarityBg} rounded-2xl border-2 ${rarityClass.split(' ')[1]} transition-all duration-300 ${
                                  canCraftThis && !isCrafting ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : ''
                                }`}
                                style={{
                                  animationDelay: `${idx * 50}ms`
                                }}
                              >
                                {/* Фоновый градиент редкости */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradients[recipe.result.rarity] || rarityGradients.common} opacity-20`}></div>
                                
                                {/* Блик при наведении */}
                                {canCraftThis && !isCrafting && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                )}
                                
                                <div className="relative p-6 bg-slate-900/80 backdrop-blur">
                                  {/* Заголовок */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className={`font-bold text-xl mb-1 ${rarityClass.split(' ')[0]}`}>
                                        {recipe.name}
                                      </h3>
                                      <p className="text-sm text-slate-400">
                                        {recipe.result.type === 'weapon' && `⚔️ Урон: ${recipe.result.val}`}
                                        {recipe.result.type === 'armor' && `🛡️ Защита: ${recipe.result.val}`}
                                        {recipe.result.type === 'consumable' && `✨ Эффект: ${recipe.result.val}`}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${rarityClass.split(' ')[1]} ${rarityBg} border ${rarityClass.split(' ')[1]}`}>
                                        {recipe.result.rarity}
                                      </span>
                                      <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        +{recipe.expReward} XP
                                      </span>
                                    </div>
                                  </div>

                                  {/* Ингредиенты */}
                                  <div className="mb-4">
                                    <div className="text-xs text-slate-500 mb-3 font-medium flex items-center gap-2">
                                      <Package size={14} />
                                      Требуемые ресурсы:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {recipe.ingredients.map(ing => {
                                        const resource = RESOURCES.find(r => r.id === ing.resourceId);
                                        const hasEnough = getResourceCount(ing.resourceId) >= ing.amount;
                                        const current = getResourceCount(ing.resourceId);
                                        const progress = Math.min((current / ing.amount) * 100, 100);
                                        
                                        return (
                                          <div 
                                            key={ing.resourceId} 
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                              hasEnough 
                                                ? 'bg-green-900/20 border-green-700/50' 
                                                : 'bg-red-900/20 border-red-700/50'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between mb-1">
                                              <span className={`text-xs font-medium ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                {resource?.name || ing.resourceId}
                                              </span>
                                              <span className={`text-xs font-bold ${hasEnough ? 'text-green-300' : 'text-red-300'}`}>
                                                {current}/{ing.amount}
                                              </span>
                                            </div>
                                            {/* Мини прогресс-бар */}
                                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full transition-all ${hasEnough ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${progress}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Кнопка крафта */}
                                  <button
                                    onClick={() => craftItem(recipe)}
                                    disabled={!canCraftThis || isCrafting}
                                    className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all transform ${
                                      !canCraftThis || isCrafting
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700'
                                        : `bg-gradient-to-r ${rarityGradients[recipe.result.rarity]} hover:shadow-2xl hover:scale-105 text-white active:scale-95 border-2 ${rarityClass.split(' ')[1]}`
                                    }`}
                                  >
                                    {isCrafting ? (
                                      <>
                                        <Hammer size={20} className="inline mr-2 animate-pulse" />
                                        Создание...
                                      </>
                                    ) : canCraftThis ? (
                                      <>
                                        <Hammer size={20} className="inline mr-2" />
                                        Создать
                                      </>
                                    ) : (
                                      <>
                                        <X size={20} className="inline mr-2" />
                                        Недостаточно ресурсов
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>

                      {getAvailableRecipes.length === 0 && (
                        <div className="text-center py-20 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                          <Sparkles size={64} className="mx-auto mb-4 text-slate-600" />
                          <p className="text-slate-400 text-lg mb-2">Нет доступных рецептов</p>
                          <p className="text-slate-500 text-sm">Повышайте уровень профессии, чтобы разблокировать рецепты</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: ГИЛЬДИИ --- */}
              {activeTab === 'guilds' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {!player.guildId ? (
                    // Список гильдий (не в гильдии)
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Users className="text-white" size={24} />
                            </div>
                            <div>
                              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Гильдии</h2>
                              <p className="text-slate-400 text-sm">Объединяйтесь для достижения великих целей</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Создать гильдию */}
                      <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 p-6 rounded-2xl border-2 border-yellow-500/30 shadow-xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Crown className="text-white" size={32} />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-yellow-400 mb-1">Создать свою гильдию</h3>
                                <p className="text-slate-400 text-sm">Станьте лидером и соберите команду</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-yellow-900/50">
                                <span className="text-slate-400 text-sm">Стоимость:</span>
                                <span className="ml-2 font-bold text-yellow-400 flex items-center gap-1">
                                  <Coins size={16} />
                                  1000
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                <div className="flex items-center gap-1 mb-1">
                                  <CheckCircle size={12} className="text-green-500" />
                                  Уникальное название
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle size={12} className="text-green-500" />
                                  Полный контроль
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const name = prompt('Введите название гильдии:');
                                if (name) createGuild(name);
                              }}
                              disabled={player.gold < 1000}
                              className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center gap-2 ${
                                player.gold < 1000
                                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 hover:shadow-yellow-500/50 active:scale-95'
                              }`}
                            >
                              <Crown size={20} />
                              Создать гильдию
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Список гильдий */}
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                          Доступные гильдии
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {GUILDS.map((guild, idx) => (
                            <div key={guild.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border-2 border-slate-700 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
                              {/* Background decoration */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all"></div>
                              
                              <div className="relative z-10">
                                {/* Guild header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-500/30">
                                      <Users className="text-white" size={28} />
                                    </div>
                                    <div>
                                      <h4 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{guild.name}</h4>
                                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700">
                                          <Crown size={10} />
                                          Уровень {guild.level}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700">
                                          <Users size={10} />
                                          {guild.memberCount} членов
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {idx === 0 && (
                                    <div className="bg-yellow-500/20 px-2 py-1 rounded-lg border border-yellow-500/30 text-yellow-400 text-xs font-bold flex items-center gap-1">
                                      <Trophy size={12} />
                                      ТОП
                                    </div>
                                  )}
                                </div>

                                {/* Guild bonuses */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="bg-blue-950/30 p-3 rounded-lg border border-blue-900/50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Sparkles size={14} className="text-blue-400" />
                                      <span className="text-xs text-slate-400">Опыт</span>
                                    </div>
                                    <div className="text-lg font-bold text-blue-400">+{guild.bonuses.expBonus}%</div>
                                  </div>
                                  <div className="bg-yellow-950/30 p-3 rounded-lg border border-yellow-900/50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Coins size={14} className="text-yellow-400" />
                                      <span className="text-xs text-slate-400">Золото</span>
                                    </div>
                                    <div className="text-lg font-bold text-yellow-400">+{guild.bonuses.goldBonus}%</div>
                                  </div>
                                </div>

                                {/* Top members preview */}
                                <div className="mb-4">
                                  <div className="text-xs text-slate-500 mb-2 font-bold">Топ участники:</div>
                                  <div className="flex -space-x-2">
                                    {guild.members.slice(0, 5).map((member, mIdx) => (
                                      <div 
                                        key={member.playerId}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs border-2 border-slate-900 hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                                        title={`${member.name} (Lvl ${member.level})`}
                                      >
                                        {member.name.charAt(0)}
                                      </div>
                                    ))}
                                    {guild.memberCount > 5 && (
                                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 border-2 border-slate-900">
                                        +{guild.memberCount - 5}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Join button */}
                                <button
                                  onClick={() => joinGuild(guild.id)}
                                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <Users size={18} />
                                  Вступить в гильдию
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Интерфейс гильдии с вкладками (в гильдии)
                    <div>
                      {(() => {
                        const guild = GUILDS.find(g => g.id === player.guildId);
                        if (!guild) return null;

                        return (
                          <div className="space-y-6">
                            {/* Заголовок гильдии */}
                            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border-2 border-slate-700 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-blue-500/30">
                                      <Users className="text-white" size={40} />
                                    </div>
                                    <div>
                                      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">{guild.name}</h3>
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className="bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700 text-sm flex items-center gap-1">
                                          <Crown size={14} className="text-yellow-400" />
                                          <span className="text-slate-400">Уровень</span>
                                          <span className="text-white font-bold">{guild.level}</span>
                                        </span>
                                        <span className="bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700 text-sm flex items-center gap-1">
                                          <Users size={14} className="text-blue-400" />
                                          <span className="text-white font-bold">{guild.members.length}</span>
                                          <span className="text-slate-400">членов</span>
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg border text-sm font-bold flex items-center gap-1 ${
                                          player.guildRole === 'leader' 
                                            ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' 
                                            : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                        }`}>
                                          {player.guildRole === 'leader' ? <Crown size={14} /> : <Sword size={14} />}
                                          {player.guildRole === 'leader' ? 'Лидер' : 'Член'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={leaveGuild}
                                    className="bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-slate-600 hover:border-red-500/50 transition-all active:scale-95"
                                  >
                                    <X size={16} />
                                    Покинуть
                                  </button>
                                </div>

                                {/* Guild stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gradient-to-br from-blue-950/50 to-slate-950/50 p-4 rounded-xl border-2 border-blue-900/50 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Sparkles className="text-blue-400" size={20} />
                                      <span className="text-xs text-slate-400 uppercase font-bold">Бонус опыта</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-400">+{guild.bonuses.expBonus}%</div>
                                  </div>
                                  <div className="bg-gradient-to-br from-yellow-950/50 to-slate-950/50 p-4 rounded-xl border-2 border-yellow-900/50 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Coins className="text-yellow-400" size={20} />
                                      <span className="text-xs text-slate-400 uppercase font-bold">Бонус золота</span>
                                    </div>
                                    <div className="text-2xl font-black text-yellow-400">+{guild.bonuses.goldBonus}%</div>
                                  </div>
                                  <div className="bg-gradient-to-br from-purple-950/50 to-slate-950/50 p-4 rounded-xl border-2 border-purple-900/50 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Trophy className="text-purple-400" size={20} />
                                      <span className="text-xs text-slate-400 uppercase font-bold">Ваш вклад</span>
                                    </div>
                                    <div className="text-2xl font-black text-purple-400">{player.guildContribution || 0}</div>
                                  </div>
                                  <div className="bg-gradient-to-br from-green-950/50 to-slate-950/50 p-4 rounded-xl border-2 border-green-900/50 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Target className="text-green-400" size={20} />
                                      <span className="text-xs text-slate-400 uppercase font-bold">Квестов</span>
                                    </div>
                                    <div className="text-2xl font-black text-green-400">{player.guildQuestsCompleted?.length || 0}</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Вкладки гильдии */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {[
                                { id: 'info', label: 'Информация', icon: Info },
                                { id: 'members', label: 'Члены', icon: Users },
                                { id: 'quests', label: 'Квесты', icon: Target },
                                { id: 'chat', label: 'Чат', icon: MessageSquare },
                                { id: 'trade', label: 'Торговля', icon: ShoppingBag },
                                { id: 'wars', label: 'Кланвары', icon: Swords }
                              ].map(tab => {
                                const TabIcon = tab.icon;
                                const isActive = guildTab === tab.id;
                                return (
                                  <button
                                    key={tab.id}
                                    onClick={() => setGuildTab(tab.id)}
                                    className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                                      isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/50 scale-105'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700 hover:border-slate-600'
                                    }`}
                                  >
                                    <TabIcon size={18} />
                                    {tab.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Содержимое вкладок */}
                            {guildTab === 'info' && (
                              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">
                                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                    <Info size={20} className="text-white" />
                                  </div>
                                  <span>Преимущества гильдии</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {[
                                    {
                                      icon: Sparkles,
                                      title: 'Увеличенные награды',
                                      desc: 'Получайте больше опыта и золота за все действия',
                                      color: 'blue'
                                    },
                                    {
                                      icon: Target,
                                      title: 'Совместные квесты',
                                      desc: 'Выполняйте гильдейские задания для получения особых наград',
                                      color: 'green'
                                    },
                                    {
                                      icon: MessageSquare,
                                      title: 'Общение и торговля',
                                      desc: 'Общайтесь с членами гильдии и обменивайтесь предметами',
                                      color: 'cyan'
                                    },
                                    {
                                      icon: Trophy,
                                      title: 'Развитие гильдии',
                                      desc: 'Вносите вклад для повышения уровня и разблокировки новых бонусов',
                                      color: 'yellow'
                                    }
                                  ].map((benefit, idx) => {
                                    const BenefitIcon = benefit.icon;
                                    return (
                                      <div key={idx} className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group hover:scale-105">
                                        <div className="flex items-start gap-4">
                                          <div className={`w-12 h-12 bg-gradient-to-br from-${benefit.color}-600 to-${benefit.color}-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                            <BenefitIcon size={24} className="text-white" />
                                          </div>
                                          <div>
                                            <div className="font-bold text-white mb-1">{benefit.title}</div>
                                            <div className="text-sm text-slate-400">{benefit.desc}</div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {guildTab === 'members' && (
                              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">
                                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Users size={20} className="text-white" />
                                  </div>
                                  <span>Члены гильдии ({guild.members.length})</span>
                                </h4>
                                <div className="grid gap-3">
                                  {guild.members
                                    .sort((a, b) => b.contribution - a.contribution)
                                    .map((member, idx) => (
                                      <div 
                                        key={member.playerId} 
                                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-900 transition-all group"
                                      >
                                        <div className="flex items-center gap-4">
                                          {/* Rank badge */}
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                                            idx === 0 ? 'bg-gradient-to-br from-yellow-600 to-amber-600 text-white shadow-lg shadow-yellow-500/50' :
                                            idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg' :
                                            idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg' :
                                            'bg-slate-800 text-slate-500 border border-slate-700'
                                          }`}>
                                            #{idx + 1}
                                          </div>
                                          
                                          {/* Avatar */}
                                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform">
                                            {member.name.charAt(0)}
                                          </div>
                                          
                                          {/* Info */}
                                          <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                              {member.name}
                                              {member.role === 'leader' && (
                                                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 flex items-center gap-1">
                                                  <Crown size={12} />
                                                  Лидер
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-sm text-slate-400 flex items-center gap-3 mt-1">
                                              <span className="flex items-center gap-1">
                                                <Crown size={12} className="text-blue-400" />
                                                Уровень {member.level}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Trophy size={12} className="text-purple-400" />
                                                Вклад: {member.contribution}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Medal for top 3 */}
                                        {idx < 3 && (
                                          <div className="flex items-center gap-2">
                                            <Trophy size={24} className={
                                              idx === 0 ? 'text-yellow-400' :
                                              idx === 1 ? 'text-slate-300' :
                                              'text-orange-600'
                                            } />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {guildTab === 'quests' && (
                              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                  <Target size={18} className="text-blue-400" />
                                  Гильдейские квесты
                                </h4>

                                {/* Активные квесты */}
                                {player.guildQuests && player.guildQuests.length > 0 && (
                                  <div className="mb-6">
                                    <h5 className="text-sm font-bold text-slate-400 mb-3">Активные квесты</h5>
                                    <div className="space-y-3">
                                      {player.guildQuests.map(quest => (
                                        <div key={quest.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                          <div className="flex items-start justify-between mb-2">
                                            <div>
                                              <h6 className="font-bold">{quest.name}</h6>
                                              <p className="text-xs text-slate-400">{quest.desc}</p>
                                            </div>
                                            {quest.progress >= quest.target && (
                                              <Button
                                                onClick={() => completeGuildQuest(quest.id)}
                                                variant="success"
                                                className="text-xs"
                                              >
                                                Завершить
                                              </Button>
                                            )}
                                          </div>
                                          <div className="mt-3">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                              <span>Прогресс</span>
                                              <span>{quest.progress} / {quest.target}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs mt-3">
                                            <span className="flex items-center gap-1 text-yellow-400">
                                              <Coins size={12} />
                                              {quest.reward.gold}
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-400">
                                              <Sparkles size={12} />
                                              {quest.reward.exp}
                                            </span>
                                            {quest.reward.itemReward && (
                                              <span className="flex items-center gap-1 text-purple-400">
                                                <Gift size={12} />
                                                {quest.reward.itemReward.name}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Доступные квесты */}
                                <div>
                                  <h5 className="text-sm font-bold text-slate-400 mb-3">Доступные квесты</h5>
                                  <div className="space-y-3">
                                    {GUILD_QUESTS
                                      .filter(q => 
                                        !player.guildQuests?.some(aq => aq.id === q.id) &&
                                        !player.guildQuestsCompleted?.includes(q.id)
                                      )
                                      .map(quest => (
                                        <div key={quest.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
                                          <div className="flex items-start justify-between mb-2">
                                            <div>
                                              <h6 className="font-bold">{quest.name}</h6>
                                              <p className="text-xs text-slate-400">{quest.desc}</p>
                                            </div>
                                            <Button
                                              onClick={() => startGuildQuest(quest.id)}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Начать
                                            </Button>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs mt-3">
                                            <span className="flex items-center gap-1 text-yellow-400">
                                              <Coins size={12} />
                                              {quest.reward.gold}
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-400">
                                              <Sparkles size={12} />
                                              {quest.reward.exp}
                                            </span>
                                            {quest.reward.itemReward && (
                                              <span className="flex items-center gap-1 text-purple-400">
                                                <Gift size={12} />
                                                {quest.reward.itemReward.name}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                  
                                  {GUILD_QUESTS.every(q => 
                                    player.guildQuests?.some(aq => aq.id === q.id) ||
                                    player.guildQuestsCompleted?.includes(q.id)
                                  ) && (
                                    <div className="text-center py-8 text-slate-500">
                                      Все гильдейские квесты выполнены!
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {guildTab === 'chat' && (
                              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                  <MessageSquare size={18} className="text-blue-400" />
                                  Чат гильдии
                                </h4>

                                {/* Сообщения чата */}
                                <div className="mb-4 h-64 overflow-y-auto bg-slate-800 rounded-lg p-4 space-y-3">
                                  {(!player.guildChatMessages || player.guildChatMessages.length === 0) ? (
                                    <div className="text-center py-12 text-slate-500">
                                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                      <p className="text-sm">Пока нет сообщений. Начните общение!</p>
                                    </div>
                                  ) : (
                                    player.guildChatMessages.map(msg => (
                                      <div key={msg.id} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                                          {msg.playerName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-medium text-sm">{msg.playerName}</span>
                                            <span className="text-xs text-slate-500">
                                              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-300">{msg.message}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Форма отправки сообщения */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Введите сообщение..."
                                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && e.target.value.trim()) {
                                        sendGuildMessage(e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                    id="guild-chat-input"
                                  />
                                  <Button
                                    onClick={() => {
                                      const input = document.getElementById('guild-chat-input');
                                      if (input && input.value.trim()) {
                                        sendGuildMessage(input.value);
                                        input.value = '';
                                      }
                                    }}
                                    variant="primary"
                                  >
                                    <MessageSquare size={18} />
                                    Отправить
                                  </Button>
                                </div>
                              </div>
                            )}

                            {guildTab === 'trade' && (
                              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                  <ShoppingBag size={18} className="text-blue-400" />
                                  Торговля и вклад
                                </h4>

                                {/* Вклад в гильдию */}
                                <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                  <h5 className="font-bold mb-3 flex items-center gap-2">
                                    <Coins size={16} className="text-yellow-400" />
                                    Внести вклад в гильдию
                                  </h5>
                                  <p className="text-sm text-slate-400 mb-4">
                                    Ваш текущий вклад: <span className="text-yellow-400 font-bold">{player.guildContribution || 0}</span> золота
                                  </p>
                                  <div className="flex gap-2">
                                    {[100, 500, 1000].map(amount => (
                                      <Button
                                        key={amount}
                                        onClick={() => contributeToGuild(amount)}
                                        disabled={player.gold < amount}
                                        variant="gold"
                                        className="flex-1 text-sm"
                                      >
                                        <Coins size={14} />
                                        {amount}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                {/* Торговля между членами */}
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                  <h5 className="font-bold mb-3 flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-purple-400" />
                                    Торговля с членами гильдии
                                  </h5>
                                  
                                  <div className="space-y-3">
                                    {guild.members
                                      .filter(m => m.playerId !== 'player') // Исключаем себя
                                      .map(member => (
                                        <div key={member.playerId} className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                                <User size={20} className="text-white" />
                                              </div>
                                              <div>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                  {member.name}
                                                  {member.role === 'leader' && (
                                                    <Crown size={14} className="text-yellow-400" />
                                                  )}
                                                </div>
                                                <div className="text-xs text-slate-400">Уровень {member.level}</div>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => openTradeWithMember(member)}
                                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                              <ShoppingBag size={16} />
                                              Предложить обмен
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    
                                    {guild.members.filter(m => m.playerId !== 'player').length === 0 && (
                                      <div className="text-center py-8 text-slate-500">
                                        <Users size={40} className="mx-auto mb-3 opacity-50" />
                                        <p className="text-sm">Нет других членов гильдии для торговли</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Топ вкладчиков */}
                                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                  <h5 className="font-bold mb-3 flex items-center gap-2">
                                    <Trophy size={16} className="text-yellow-400" />
                                    Топ вкладчиков
                                  </h5>
                                  <div className="space-y-2">
                                    {guild.members
                                      .sort((a, b) => b.contribution - a.contribution)
                                      .slice(0, 5)
                                      .map((member, idx) => (
                                        <div key={member.playerId} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${
                                              idx === 0 ? 'text-yellow-400' :
                                              idx === 1 ? 'text-slate-300' :
                                              idx === 2 ? 'text-orange-600' :
                                              'text-slate-500'
                                            }`}>
                                              #{idx + 1}
                                            </span>
                                            <span className="text-sm">{member.name}</span>
                                          </div>
                                          <span className="text-sm text-yellow-400 font-bold">
                                            {member.contribution}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}


                            {guildTab === 'wars' && (
                              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-700">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                  <Swords size={18} className="text-red-400" />
                                  Кланвары - Битвы за территории
                                </h4>
                                <p className="text-sm text-slate-400 mb-6">
                                  Захватывайте территории для получения бонусов гильдии. Войны длятся 1 час.
                                </p>

                                {/* Активные войны */}
                                {guildWars.length > 0 && (
                                  <div className="mb-6">
                                    <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                      <Flame size={16} className="text-orange-400" />
                                      Активные войны
                                    </h5>
                                    <div className="space-y-3">
                                      {guildWars.map(war => {
                                        const territory = TERRITORIES.find(t => t.id === war.territoryId);
                                        const timeLeft = Math.max(0, war.startTime + war.duration - Date.now());
                                        const minutes = Math.floor(timeLeft / 60000);
                                        const seconds = Math.floor((timeLeft % 60000) / 1000);
                                        const isParticipant = war.attackerGuildId === player.guildId || war.defenderGuildId === player.guildId;

                                        return (
                                          <div key={war.id} className="bg-slate-800 rounded-xl p-4 border-2 border-red-500/50">
                                            <div className="flex items-start justify-between mb-3">
                                              <div>
                                                <h6 className="font-bold text-white text-lg">{territory.name}</h6>
                                                <p className="text-xs text-slate-400">
                                                  {war.attackerGuildName} vs {war.defenderGuildName}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-sm font-bold text-orange-400">
                                                  {minutes}:{seconds.toString().padStart(2, '0')}
                                                </div>
                                                <div className="text-xs text-slate-500">осталось</div>
                                              </div>
                                            </div>

                                            <div className="mb-3">
                                              <div className="flex justify-between text-sm mb-1">
                                                <span className="text-blue-400">{war.attackerGuildName}</span>
                                                <span className="text-red-400">{war.defenderGuildName}</span>
                                              </div>
                                              <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex">
                                                <div
                                                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                                                  style={{
                                                    width: `${(war.attackerScore / (war.attackerScore + war.defenderScore || 1)) * 100}%`
                                                  }}
                                                />
                                                <div
                                                  className="bg-gradient-to-r from-red-600 to-orange-600"
                                                  style={{
                                                    width: `${(war.defenderScore / (war.attackerScore + war.defenderScore || 1)) * 100}%`
                                                  }}
                                                />
                                              </div>
                                              <div className="flex justify-between text-xs mt-1">
                                                <span className="text-blue-400">{war.attackerScore}</span>
                                                <span className="text-red-400">{war.defenderScore}</span>
                                              </div>
                                            </div>

                                            {isParticipant && (
                                              <button
                                                onClick={() => participateInWar(war)}
                                                className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg font-bold text-white transition-all"
                                              >
                                                Участвовать в битве
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Территории */}
                                <div className="mb-6">
                                  <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <MapIcon size={16} className="text-green-400" />
                                    Доступные территории
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TERRITORIES.map(territory => {
                                      const TerritoryIcon = territory.icon;
                                      const owner = guildTerritories[territory.id];
                                      const ownerGuild = owner ? MOCK_ENEMY_GUILDS.find(g => g.id === owner) || { name: guild?.name } : null;
                                      const isOwned = owner === player.guildId;
                                      const hasActiveWar = guildWars.some(w => w.territoryId === territory.id);

                                      return (
                                        <div
                                          key={territory.id}
                                          className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border-2 ${
                                            isOwned ? 'border-green-500' : 'border-slate-700'
                                          } hover:scale-105 transition-all cursor-pointer`}
                                          onClick={() => setSelectedTerritory(territory)}
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                isOwned ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-slate-700 to-slate-800'
                                              }`}>
                                                <TerritoryIcon size={24} className="text-white" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-white">{territory.name}</h6>
                                                <p className="text-xs text-slate-400">Сложность: {'⭐'.repeat(territory.difficulty)}</p>
                                              </div>
                                            </div>
                                            {isOwned && (
                                              <span className="text-xs bg-green-600 px-2 py-1 rounded font-bold">ВАША</span>
                                            )}
                                          </div>

                                          <p className="text-sm text-slate-400 mb-3">{territory.description}</p>

                                          <div className="bg-slate-900/50 rounded-lg p-2 mb-3">
                                            <div className="text-xs text-green-400 font-bold">{territory.bonus.label}</div>
                                          </div>

                                          {ownerGuild && (
                                            <div className="text-xs text-slate-500 mb-2">
                                              Владелец: <span className="text-white font-bold">{ownerGuild.name}</span>
                                            </div>
                                          )}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!hasActiveWar) {
                                                declareWar(territory, ownerGuild);
                                              }
                                            }}
                                            disabled={hasActiveWar || isOwned}
                                            className={`w-full py-2 rounded-lg font-bold text-white transition-all ${
                                              hasActiveWar
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : isOwned
                                                ? 'bg-green-700 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                                            }`}
                                          >
                                            {hasActiveWar ? 'Идет война' : isOwned ? 'Под контролем' : 'Объявить войну'}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* История войн */}
                                {warHistory.length > 0 && (
                                  <div>
                                    <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                      <Scroll size={16} className="text-purple-400" />
                                      История войн
                                    </h5>
                                    <div className="space-y-2">
                                      {warHistory.slice(0, 5).map(war => {
                                        const territory = TERRITORIES.find(t => t.id === war.territoryId);
                                        const winnerName = war.winner === 'attacker' ? war.attackerGuildName : war.defenderGuildName;
                                        return (
                                          <div key={war.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <div className="font-bold text-white text-sm">{territory.name}</div>
                                                <div className="text-xs text-slate-400">
                                                  {war.attackerGuildName} vs {war.defenderGuildName}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-sm font-bold text-green-400">Победа: {winnerName}</div>
                                                <div className="text-xs text-slate-500">
                                                  {war.attackerScore} - {war.defenderScore}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Resource Exchange Modal */}
              {selectedResource && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResource(null)}>
                  <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-orange-500/50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedResource.name}</h2>
                        <p className="text-slate-400">Торговля ресурсами</p>
                      </div>
                      <button onClick={() => setSelectedResource(null)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      {/* Текущая цена и график */}
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-slate-400 mb-1">Текущая цена</div>
                            <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                              <Coins size={24} />
                              {resourcePrices[selectedResource.id]}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400 mb-1">У вас</div>
                            <div className="text-2xl font-bold text-white">
                              {player.resources[selectedResource.id] || 0}
                            </div>
                          </div>
                        </div>

                        {/* График цен */}
                        <div className="h-32 flex items-end gap-2 bg-slate-900 rounded-lg p-3">
                          {resourcePriceHistory[selectedResource.id]?.map((histPrice, idx) => {
                            const maxPrice = Math.max(...resourcePriceHistory[selectedResource.id]);
                            const height = (histPrice / maxPrice) * 100;
                            const basePrice = BASE_RESOURCE_PRICES[selectedResource.id];
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full rounded-t transition-all ${
                                    histPrice > basePrice
                                      ? 'bg-gradient-to-t from-green-600 to-green-400'
                                      : 'bg-gradient-to-t from-red-600 to-red-400'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                                <div className="text-[8px] text-slate-500 mt-1">{histPrice}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Режим торговли */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExchangeMode('buy')}
                          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                            exchangeMode === 'buy'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          Купить
                        </button>
                        <button
                          onClick={() => setExchangeMode('sell')}
                          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                            exchangeMode === 'sell'
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          Продать
                        </button>
                      </div>

                      {/* Ввод количества */}
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Количество</label>
                        <input
                          type="number"
                          value={exchangeAmount}
                          onChange={(e) => setExchangeAmount(e.target.value)}
                          placeholder="Введите количество"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg"
                        />
                        <div className="flex gap-2 mt-2">
                          {[10, 50, 100].map(amount => (
                            <button
                              key={amount}
                              onClick={() => setExchangeAmount(amount.toString())}
                              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-300 transition-all"
                            >
                              {amount}
                            </button>
                          ))}
                          {exchangeMode === 'sell' && (
                            <button
                              onClick={() => setExchangeAmount((player.resources[selectedResource.id] || 0).toString())}
                              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-300 transition-all"
                            >
                              Все
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Итого */}
                      {exchangeAmount && parseInt(exchangeAmount) > 0 && (
                        <div className="bg-slate-800 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Итого:</span>
                            <span className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                              <Coins size={20} />
                              {resourcePrices[selectedResource.id] * parseInt(exchangeAmount)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Кнопка действия */}
                      <button
                        onClick={() => {
                          const amount = parseInt(exchangeAmount);
                          if (amount > 0) {
                            if (exchangeMode === 'buy') {
                              buyResource(selectedResource.id, amount);
                            } else {
                              sellResource(selectedResource.id, amount);
                            }
                            setSelectedResource(null);
                            setExchangeAmount('');
                          }
                        }}
                        disabled={!exchangeAmount || parseInt(exchangeAmount) <= 0}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                          exchangeMode === 'buy'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {exchangeMode === 'buy' ? 'Купить' : 'Продать'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: ДРУЗЬЯ --- */}
              {activeTab === 'friends' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                  {/* Вкладки */}
                  <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700 mb-6">
                    <button
                      onClick={() => setActiveTab('friends')}
                      className="flex-1 py-2 px-4 rounded-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg"
                    >
                      Друзья
                    </button>
                    <button
                      onClick={() => setActiveTab('referral')}
                      className="flex-1 py-2 px-4 rounded-lg font-bold text-slate-400 hover:text-white transition-all"
                    >
                      Рекрутинг
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Heart className="text-pink-400" />
                    Друзья
                  </h2>

                  {/* Статистика друзей */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-2xl font-bold text-white">{player.friends?.length || 0}</div>
                      <div className="text-xs text-slate-400 uppercase">Друзей</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-2xl font-bold text-green-400">
                        {player.friends?.filter(fId => {
                          const friend = FRIENDS_DB.find(f => f.id === fId);
                          return friend?.status === 'online';
                        }).length || 0}
                      </div>
                      <div className="text-xs text-slate-400 uppercase">Онлайн</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-2xl font-bold text-blue-400">{player.friendStats?.coopQuestsCompleted || 0}</div>
                      <div className="text-xs text-slate-400 uppercase">Квестов вместе</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-2xl font-bold text-purple-400">{player.friendStats?.giftsReceived || 0}</div>
                      <div className="text-xs text-slate-400 uppercase">Подарков</div>
                    </div>
                  </div>

                  {/* Список друзей */}
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Users className="text-blue-400" size={20} />
                      Список друзей
                    </h3>

                    {(!player.friends || player.friends.length === 0) ? (
                      <div className="text-center py-12">
                        <Heart className="mx-auto mb-4 text-slate-600" size={48} />
                        <p className="text-slate-400 mb-4">У вас пока нет друзей</p>
                        <button
                          onClick={() => {
                            // Генерируем 3 случайных друзей
                            const newFriends = [];
                            for (let i = 0; i < 3; i++) {
                              const friend = generateFriend();
                              FRIENDS_DB.push(friend);
                              newFriends.push(friend.id);
                            }
                            setPlayer(prev => ({
                              ...prev,
                              friends: [...(prev.friends || []), ...newFriends],
                              friendStats: {
                                totalFriends: newFriends.length,
                                giftsReceived: 0,
                                giftsSent: 0,
                                coopQuestsCompleted: 0,
                                tradesCompleted: 0
                              }
                            }));
                            addNotification('Добавлено 3 друга!', 'success');
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
                        >
                          Найти друзей
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {player.friends.map(friendId => {
                          const friend = FRIENDS_DB.find(f => f.id === friendId);
                          if (!friend) return null;

                          const FriendAvatar = AVATARS_DB.find(a => a.id === friend.avatarId)?.icon || User;
                          const statusColors = {
                            online: 'bg-green-500',
                            offline: 'bg-slate-600',
                            in_combat: 'bg-red-500',
                            traveling: 'bg-blue-500',
                            in_dungeon: 'bg-purple-500'
                          };
                          const statusTexts = {
                            online: 'Онлайн',
                            offline: 'Оффлайн',
                            in_combat: 'В бою',
                            traveling: 'В путешествии',
                            in_dungeon: 'В подземелье'
                          };

                          return (
                            <div key={friend.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all">
                              <div className="flex items-center gap-4">
                                {/* Аватар */}
                                <div className="relative">
                                  <div className={`w-16 h-16 rounded-lg ${AVATARS_DB.find(a => a.id === friend.avatarId)?.color || 'bg-slate-700'} flex items-center justify-center border-2 border-slate-600`}>
                                    <FriendAvatar size={32} className="text-white" />
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[friend.status]} rounded-full border-2 border-slate-900`}></div>
                                </div>

                                {/* Информация */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-white">{friend.name}</h4>
                                    <span className="text-xs text-slate-400">Lvl {friend.level}</span>
                                  </div>
                                  <div className="text-sm text-slate-400 mb-1">{friend.className}</div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${friend.status === 'online' ? 'bg-green-900/50 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                      {statusTexts[friend.status]}
                                    </span>
                                    {friend.status === 'traveling' && (
                                      <span className="text-xs text-blue-400">
                                        {LOCATIONS.find(l => l.id === friend.location)?.name}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Статистика */}
                                <div className="hidden md:flex gap-4 text-center">
                                  <div>
                                    <div className="text-sm font-bold text-yellow-400">{friend.stats.gold}</div>
                                    <div className="text-[10px] text-slate-500">Золото</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-red-400">{friend.stats.totalKills}</div>
                                    <div className="text-[10px] text-slate-500">Убийств</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-blue-400">{friend.stats.questsCompleted}</div>
                                    <div className="text-[10px] text-slate-500">Квестов</div>
                                  </div>
                                </div>

                                {/* Действия */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      addNotification(`Отправлено сообщение для ${friend.name}`, 'info');
                                    }}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    title="Написать"
                                  >
                                    <MessageSquare size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const gift = ITEMS_DB[getRandomInt(0, 7)];
                                      addNotification(`Отправлен подарок "${gift.name}" для ${friend.name}`, 'success');
                                      setPlayer(prev => ({
                                        ...prev,
                                        friendStats: {
                                          ...prev.friendStats,
                                          giftsSent: (prev.friendStats?.giftsSent || 0) + 1
                                        }
                                      }));
                                    }}
                                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                    title="Отправить подарок"
                                  >
                                    <Gift size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Удалить ${friend.name} из друзей?`)) {
                                        setPlayer(prev => ({
                                          ...prev,
                                          friends: prev.friends.filter(id => id !== friend.id)
                                        }));
                                        addNotification(`${friend.name} удален из друзей`, 'info');
                                      }
                                    }}
                                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    title="Удалить из друзей"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Кнопка добавить друзей */}
                  {player.friends && player.friends.length > 0 && player.friends.length < 50 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => {
                          const friend = generateFriend();
                          FRIENDS_DB.push(friend);
                          setPlayer(prev => ({
                            ...prev,
                            friends: [...(prev.friends || []), friend.id],
                            friendStats: {
                              ...prev.friendStats,
                              totalFriends: (prev.friendStats?.totalFriends || 0) + 1
                            }
                          }));
                          addNotification(`${friend.name} добавлен в друзья!`, 'success');
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Users size={20} />
                        Найти нового друга
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: СВАДЬБЫ --- */}
              {activeTab === 'marriage' && (
                <MarriageScreen 
                  player={player}
                  onBuyRing={handleBuyRing}
                  onPropose={handlePropose}
                  onOrganizeWedding={handleOrganizeWedding}
                  onGiveGift={handleGiveGift}
                  onDivorce={handleDivorce}
                />
              )}

              {/* --- TAB: РЕКРУТИНГ --- */}
              {activeTab === 'referral' && (
                <ReferralPanel
                  player={player}
                  onAddReferee={handleAddSimulatedReferee}
                  onCopyCode={handleCopyReferralCode}
                />
              )}

              {/* --- TAB: ДОСТИЖЕНИЯ --- */}
              {activeTab === 'achievements' && (
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    Достижения
                  </h2>

                  {/* Категории достижений */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'exploration', 'combat', 'crafting', 'quests', 'social', 'collection'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setAchievementCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          achievementCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {cat === 'all' && 'Все'}
                        {cat === 'exploration' && 'Путешествия'}
                        {cat === 'combat' && 'Бои'}
                        {cat === 'crafting' && 'Крафт'}
                        {cat === 'quests' && 'Квесты'}
                        {cat === 'social' && 'Социальное'}
                        {cat === 'collection' && 'Коллекции'}
                      </button>
                    ))}
                  </div>

                  {/* Список достижений */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACHIEVEMENTS
                      .filter(ach => achievementCategory === 'all' || ach.category === achievementCategory)
                      .map(achievement => {
                        const isUnlocked = player.achievements.includes(achievement.id);
                        const isClaimed = isUnlocked && !player.unclaimedAchievements.includes(achievement.id);
                        const progress = calculateAchievementProgress(achievement, player);
                        const AchIcon = achievement.icon;

                        return (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              isUnlocked
                                ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/50 hover:border-yellow-500'
                                : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isUnlocked ? 'bg-yellow-600' : 'bg-slate-800'
                              }`}>
                                <AchIcon size={24} className={isUnlocked ? 'text-white' : 'text-slate-600'} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                  <h3 className={`font-bold ${isUnlocked ? 'text-yellow-400' : 'text-slate-300'}`}>
                                    {achievement.name}
                                  </h3>
                                  {isUnlocked && (
                                    <CheckCircle size={20} className={isClaimed ? 'text-green-500' : 'text-yellow-400'} />
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                                
                                {/* Прогресс */}
                                {!isUnlocked && (
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                      <span>Прогресс</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                {/* Награды */}
                                <div className="flex items-center gap-3 text-xs">
                                  {achievement.reward.gold > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-400">
                                      <Coins size={12} />
                                      {achievement.reward.gold}
                                    </span>
                                  )}
                                  {achievement.reward.exp > 0 && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                      <Sparkles size={12} />
                                      {achievement.reward.exp}
                                    </span>
                                  )}
                                </div>

                                {/* Кнопка получения награды */}
                                {isUnlocked && !isClaimed && (
                                  <Button
                                    onClick={() => claimAchievementReward(achievement.id)}
                                    className="w-full mt-2 text-xs"
                                    variant="primary"
                                  >
                                    Получить награду
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Статистика */}
                  <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-700">
                    <h3 className="font-bold mb-4">Статистика достижений</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{player.achievements.length}</div>
                        <div className="text-xs text-slate-500">Разблокировано</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-400">{ACHIEVEMENTS.length}</div>
                        <div className="text-xs text-slate-500">Всего</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.round((player.achievements.length / ACHIEVEMENTS.length) * 100)}%
                        </div>
                        <div className="text-xs text-slate-500">Прогресс</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{player.unclaimedAchievements.length}</div>
                        <div className="text-xs text-slate-500">Не получено</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: ПИТОМЦЫ --- */}
              {activeTab === 'pets' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-pink-800 via-purple-900 to-slate-950 rounded-2xl p-6 border border-pink-700/50 shadow-2xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Heart className="text-white" size={28} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">Питомцы</h2>
                          <p className="text-slate-300 text-sm">Собирайте и прокачивайте компаньонов</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                      onClick={() => setPetTab('collection')}
                      className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                        petTab === 'collection'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Моя коллекция ({player.pets?.length || 0})
                    </button>
                    <button
                      onClick={() => setPetTab('active')}
                      className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                        petTab === 'active'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Активный питомец
                    </button>
                    <button
                      onClick={() => setPetTab('shop')}
                      className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                        petTab === 'shop'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Магазин еды
                    </button>
                  </div>

                  {/* Collection Tab */}
                  {petTab === 'collection' && (
                    <div>
                      {!player.pets || player.pets.length === 0 ? (
                        <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-700">
                          <Heart size={64} className="mx-auto text-slate-600 mb-4" />
                          <h3 className="text-xl font-bold text-slate-400 mb-2">У вас пока нет питомцев</h3>
                          <p className="text-slate-500 mb-4">Открывайте сундуки, чтобы получить питомцев!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {player.pets.map(petInstance => {
                            const petData = PETS_DB.find(p => p.id === petInstance.petId);
                            if (!petData) return null;
                            
                            const PetIcon = petData.icon;
                            const stats = getPetStats(petInstance);
                            const expProgress = (petInstance.exp / petInstance.maxExp) * 100;
                            const hungerColor = petInstance.hunger > 70 ? 'text-green-400' : petInstance.hunger > 30 ? 'text-yellow-400' : 'text-red-400';
                            const isActive = player.activePet === petInstance.id;
                            
                            const rarityColors = {
                              common: 'from-slate-700 to-slate-800 border-slate-600',
                              uncommon: 'from-green-700 to-green-800 border-green-600',
                              rare: 'from-blue-700 to-blue-800 border-blue-600',
                              epic: 'from-purple-700 to-purple-800 border-purple-600',
                              legendary: 'from-orange-700 to-orange-800 border-orange-600'
                            };
                            
                            return (
                              <div
                                key={petInstance.id}
                                className={`bg-gradient-to-br ${rarityColors[petData.rarity]} rounded-xl p-5 border-2 shadow-lg hover:scale-105 transition-all cursor-pointer relative ${
                                  isActive ? 'ring-4 ring-pink-500' : ''
                                }`}
                                onClick={() => {
                                  setSelectedPet(petInstance);
                                  setShowPetModal(true);
                                }}
                              >
                                {isActive && (
                                  <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    АКТИВЕН
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-16 h-16 rounded-xl ${petData.color} flex items-center justify-center shadow-lg`}>
                                    <PetIcon size={32} className="text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg">{petInstance.name}</h3>
                                    <div className="text-xs text-white/70">Уровень {petInstance.level}</div>
                                  </div>
                                </div>
                                
                                {/* Exp Bar */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs text-white/70 mb-1">
                                    <span>Опыт</span>
                                    <span>{petInstance.exp}/{petInstance.maxExp}</span>
                                  </div>
                                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${expProgress}%` }}></div>
                                  </div>
                                </div>
                                
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                  {stats.damage > 0 && (
                                    <div className="bg-black/30 rounded-lg p-2 text-center">
                                      <Sword size={14} className="mx-auto text-red-400 mb-1" />
                                      <div className="text-xs text-white font-bold">{stats.damage}</div>
                                    </div>
                                  )}
                                  {stats.defense > 0 && (
                                    <div className="bg-black/30 rounded-lg p-2 text-center">
                                      <Shield size={14} className="mx-auto text-blue-400 mb-1" />
                                      <div className="text-xs text-white font-bold">{stats.defense}</div>
                                    </div>
                                  )}
                                  {stats.healing > 0 && (
                                    <div className="bg-black/30 rounded-lg p-2 text-center">
                                      <Heart size={14} className="mx-auto text-green-400 mb-1" />
                                      <div className="text-xs text-white font-bold">{stats.healing}</div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Hunger */}
                                <div className="flex items-center gap-2 text-xs">
                                  <Heart size={14} className={hungerColor} />
                                  <span className={`${hungerColor} font-bold`}>Сытость: {petInstance.hunger}%</span>
                                </div>
                                
                                {/* Type Badge */}
                                <div className="mt-3 text-center">
                                  <span className="text-xs bg-black/40 px-3 py-1 rounded-full text-white/80 uppercase font-bold">
                                    {petData.type === 'damage' ? '⚔️ Урон' : petData.type === 'defense' ? '🛡️ Защита' : '💚 Лечение'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Pet Tab */}
                  {petTab === 'active' && (
                    <div>
                      {!player.activePet ? (
                        <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-700">
                          <Heart size={64} className="mx-auto text-slate-600 mb-4" />
                          <h3 className="text-xl font-bold text-slate-400 mb-2">Нет активного питомца</h3>
                          <p className="text-slate-500">Выберите питомца из коллекции, чтобы он помогал вам в боях</p>
                        </div>
                      ) : (() => {
                        const activePetInstance = player.pets.find(p => p.id === player.activePet);
                        if (!activePetInstance) return null;
                        
                        const petData = PETS_DB.find(p => p.id === activePetInstance.petId);
                        if (!petData) return null;
                        
                        const PetIcon = petData.icon;
                        const stats = getPetStats(activePetInstance);
                        const expProgress = (activePetInstance.exp / activePetInstance.maxExp) * 100;
                        
                        return (
                          <div className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-br from-pink-900 to-purple-900 rounded-2xl p-8 border-2 border-pink-600 shadow-2xl">
                              <div className="text-center mb-6">
                                <div className={`w-32 h-32 mx-auto rounded-2xl ${petData.color} flex items-center justify-center shadow-2xl mb-4`}>
                                  <PetIcon size={64} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2">{activePetInstance.name}</h2>
                                <div className="inline-block bg-black/30 px-4 py-2 rounded-full">
                                  <span className="text-white font-bold">Уровень {activePetInstance.level}</span>
                                </div>
                              </div>
                              
                              {/* Description */}
                              <p className="text-center text-white/80 mb-6">{petData.description}</p>
                              
                              {/* Exp Bar */}
                              <div className="mb-6">
                                <div className="flex justify-between text-sm text-white/70 mb-2">
                                  <span>Опыт до следующего уровня</span>
                                  <span>{activePetInstance.exp}/{activePetInstance.maxExp}</span>
                                </div>
                                <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${expProgress}%` }}></div>
                                </div>
                              </div>
                              
                              {/* Stats Grid */}
                              <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-black/30 rounded-xl p-4 text-center">
                                  <Sword size={24} className="mx-auto text-red-400 mb-2" />
                                  <div className="text-2xl font-black text-white mb-1">{stats.damage}</div>
                                  <div className="text-xs text-white/60">Урон</div>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4 text-center">
                                  <Shield size={24} className="mx-auto text-blue-400 mb-2" />
                                  <div className="text-2xl font-black text-white mb-1">{stats.defense}</div>
                                  <div className="text-xs text-white/60">Защита</div>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4 text-center">
                                  <Heart size={24} className="mx-auto text-green-400 mb-2" />
                                  <div className="text-2xl font-black text-white mb-1">{stats.healing}</div>
                                  <div className="text-xs text-white/60">Лечение</div>
                                </div>
                              </div>
                              
                              {/* Hunger */}
                              <div className="bg-black/30 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-white font-bold">Сытость</span>
                                  <span className={`font-bold ${activePetInstance.hunger > 70 ? 'text-green-400' : activePetInstance.hunger > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {activePetInstance.hunger}%
                                  </span>
                                </div>
                                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${activePetInstance.hunger > 70 ? 'bg-green-500' : activePetInstance.hunger > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${activePetInstance.hunger}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-white/60 mt-2">Кормите питомца, чтобы он был эффективнее в бою</p>
                              </div>
                              
                              {/* Feed Buttons */}
                              <div className="grid grid-cols-2 gap-3">
                                {PET_FOOD.map(food => (
                                  <button
                                    key={food.id}
                                    onClick={() => feedPet(activePetInstance.id, food.id)}
                                    disabled={!player.petFood || player.petFood[food.id] <= 0}
                                    className={`p-3 rounded-lg font-bold transition-all ${
                                      player.petFood && player.petFood[food.id] > 0
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    }`}
                                  >
                                    <div className="text-sm">{food.name}</div>
                                    <div className="text-xs opacity-80">
                                      {player.petFood && player.petFood[food.id] > 0 ? `x${player.petFood[food.id]}` : 'Нет в наличии'}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              
                              {/* Evolution Info */}
                              {petData.evolutions && petData.evolutions.length > 0 && (
                                <div className="mt-6 bg-black/30 rounded-xl p-4">
                                  <h4 className="text-white font-bold mb-2">🌟 Эволюция</h4>
                                  {petData.evolutions.map(evo => {
                                    const nextPet = PETS_DB.find(p => p.id === evo.evolvesTo);
                                    if (!nextPet) return null;
                                    
                                    return (
                                      <div key={evo.level} className="text-sm text-white/70">
                                        На уровне {evo.level} эволюционирует в <span className="text-purple-400 font-bold">{nextPet.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              <button
                                onClick={() => setActivePet(null)}
                                className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-all"
                              >
                                Снять питомца
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Shop Tab */}
                  {petTab === 'shop' && (
                    <div>
                      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 mb-6">
                        <h3 className="text-xl font-bold mb-2">Магазин еды для питомцев</h3>
                        <p className="text-slate-400 text-sm">Покупайте еду, чтобы кормить и прокачивать своих питомцев</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PET_FOOD.map(food => {
                          const rarityColors = {
                            common: 'from-slate-700 to-slate-800 border-slate-600',
                            uncommon: 'from-green-700 to-green-800 border-green-600',
                            rare: 'from-blue-700 to-blue-800 border-blue-600',
                            legendary: 'from-orange-700 to-orange-800 border-orange-600'
                          };
                          
                          return (
                            <div key={food.id} className={`bg-gradient-to-br ${rarityColors[food.rarity]} rounded-xl p-6 border-2 shadow-lg`}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-bold text-white">{food.name}</h4>
                                  <div className="text-sm text-white/70">+{food.exp} опыта</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-black text-yellow-400">{food.cost}</div>
                                  <div className="text-xs text-white/70">золота</div>
                                </div>
                              </div>
                              
                              <div className="bg-black/30 rounded-lg p-3 mb-4">
                                <div className="text-sm text-white/80">
                                  В наличии: <span className="font-bold text-white">{player.petFood?.[food.id] || 0}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => buyPetFood(food.id, 1)}
                                  disabled={player.gold < food.cost}
                                  className={`py-2 rounded-lg font-bold transition-all ${
                                    player.gold >= food.cost
                                      ? 'bg-green-600 hover:bg-green-500 text-white'
                                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  }`}
                                >
                                  x1
                                </button>
                                <button
                                  onClick={() => buyPetFood(food.id, 5)}
                                  disabled={player.gold < food.cost * 5}
                                  className={`py-2 rounded-lg font-bold transition-all ${
                                    player.gold >= food.cost * 5
                                      ? 'bg-green-600 hover:bg-green-500 text-white'
                                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  }`}
                                >
                                  x5
                                </button>
                                <button
                                  onClick={() => buyPetFood(food.id, 10)}
                                  disabled={player.gold < food.cost * 10}
                                  className={`py-2 rounded-lg font-bold transition-all ${
                                    player.gold >= food.cost * 10
                                      ? 'bg-green-600 hover:bg-green-500 text-white'
                                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  }`}
                                >
                                  x10
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pet Modal */}
              {showPetModal && selectedPet && (() => {
                const petData = PETS_DB.find(p => p.id === selectedPet.petId);
                if (!petData) return null;
                
                const PetIcon = petData.icon;
                const stats = getPetStats(selectedPet);
                const isActive = player.activePet === selectedPet.id;
                
                return (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPetModal(false)}>
                    <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-pink-600 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-white">{selectedPet.name}</h3>
                        <button onClick={() => setShowPetModal(false)} className="text-slate-400 hover:text-white">
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className={`w-24 h-24 mx-auto rounded-xl ${petData.color} flex items-center justify-center shadow-lg mb-4`}>
                        <PetIcon size={48} className="text-white" />
                      </div>
                      
                      <p className="text-center text-slate-300 mb-4">{petData.description}</p>
                      
                      <div className="space-y-3">
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="text-sm text-slate-400">Уровень</div>
                          <div className="text-xl font-bold text-white">{selectedPet.level} / {petData.maxLevel}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-800 rounded-lg p-3 text-center">
                            <Sword size={16} className="mx-auto text-red-400 mb-1" />
                            <div className="text-lg font-bold text-white">{stats.damage}</div>
                          </div>
                          <div className="bg-slate-800 rounded-lg p-3 text-center">
                            <Shield size={16} className="mx-auto text-blue-400 mb-1" />
                            <div className="text-lg font-bold text-white">{stats.defense}</div>
                          </div>
                          <div className="bg-slate-800 rounded-lg p-3 text-center">
                            <Heart size={16} className="mx-auto text-green-400 mb-1" />
                            <div className="text-lg font-bold text-white">{stats.healing}</div>
                          </div>
                        </div>
                        
                        {!isActive ? (
                          <button
                            onClick={() => {
                              setActivePet(selectedPet.id);
                              setShowPetModal(false);
                            }}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-3 rounded-lg font-bold transition-all"
                          >
                            Сделать активным
                          </button>
                        ) : (
                          <div className="bg-pink-900/30 border border-pink-600 rounded-lg p-3 text-center">
                            <span className="text-pink-400 font-bold">✓ Активный питомец</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* --- ЗАГЛУШКИ ДЛЯ НОВЫХ РАЗДЕЛОВ --- */}
              {activeTab === 'settings' && (
                <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Settings className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Настройки</h2>
                          <p className="text-slate-400 text-sm">Управление игрой и сохранениями</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Информация о сохранении */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                          <Save size={20} className="text-white" />
                        </div>
                        <span>Сохранение игры</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-400">Последнее сохранение:</span>
                          </div>
                          <span className="text-slate-200 font-bold text-lg">
                            {lastSaveTime 
                              ? new Date(lastSaveTime).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              : 'Нет данных'}
                          </span>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 flex items-center gap-3">
                          <CheckCircle size={20} className="text-green-400" />
                          <div>
                            <div className="text-green-400 font-bold">Автосохранение включено</div>
                            <div className="text-xs text-green-600">Каждые 30 секунд</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (saveGame(player)) {
                              setLastSaveTime(Date.now());
                              addNotification('Игра сохранена вручную', 'success');
                            } else {
                              addNotification('Ошибка сохранения', 'error');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Save size={18} />
                          Сохранить вручную
                        </button>
                      </div>
                    </div>

                    {/* Статистика игрока */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <Trophy size={20} className="text-white" />
                        </div>
                        <span>Статистика</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Уровень</div>
                          <div className="text-2xl font-black text-blue-400">{player.level}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Золото</div>
                          <div className="text-2xl font-black text-yellow-400">{player.gold}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Шагов</div>
                          <div className="text-2xl font-black text-green-400">{player.totalSteps || 0}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Убийств</div>
                          <div className="text-2xl font-black text-red-400">{player.totalKills || 0}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Квестов</div>
                          <div className="text-2xl font-black text-purple-400">{player.questsCompletedCount || 0}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Сундуков</div>
                          <div className="text-2xl font-black text-pink-400">{player.totalChestsOpened || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Экспорт/Импорт */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Download size={20} className="text-white" />
                      </div>
                      <span>Резервное копирование</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                          <Download size={16} className="text-purple-400" />
                          Экспорт
                        </h4>
                        <p className="text-sm text-slate-400 mb-3">
                          Сохраните игру в файл для резервного копирования
                        </p>
                        <button
                          onClick={() => {
                            if (exportSave()) {
                              addNotification('Сохранение экспортировано', 'success');
                            } else {
                              addNotification('Ошибка экспорта', 'error');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/50 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Экспортировать
                        </button>
                      </div>
                      
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                          <Upload size={16} className="text-cyan-400" />
                          Импорт
                        </h4>
                        <p className="text-sm text-slate-400 mb-3">
                          Загрузите сохранение из файла
                        </p>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                importSave(
                                  file,
                                  () => {
                                    addNotification('Сохранение импортировано. Перезагрузка...', 'success');
                                    setTimeout(() => window.location.reload(), 1500);
                                  },
                                  (error) => {
                                    addNotification(error, 'error');
                                  }
                                );
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                            id="import-save-input"
                          />
                          <button
                            onClick={() => document.getElementById('import-save-input').click()}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-cyan-500/50 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            Импортировать
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Быстрые действия */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Zap size={20} className="text-white" />
                      </div>
                      <span>Быстрые действия</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setPlayer(p => ({ ...p, energy: p.maxEnergy }));
                          addNotification('Энергия восстановлена!', 'success');
                        }}
                        className="bg-yellow-900/30 hover:bg-yellow-900/50 border-2 border-yellow-500/50 hover:border-yellow-500 text-yellow-300 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={18} />
                        Восстановить энергию
                      </button>
                      <button
                        onClick={() => {
                          setPlayer(p => ({ ...p, hp: p.maxHp }));
                          addNotification('Здоровье восстановлено!', 'success');
                        }}
                        className="bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/50 hover:border-red-500 text-red-300 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Heart size={18} />
                        Восстановить HP
                      </button>
                      <button
                        onClick={() => {
                          setPlayer(p => ({ ...p, energy: p.maxEnergy, hp: p.maxHp }));
                          addNotification('Полное восстановление!', 'success');
                        }}
                        className="bg-green-900/30 hover:bg-green-900/50 border-2 border-green-500/50 hover:border-green-500 text-green-300 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles size={18} />
                        Полное восстановление
                      </button>
                    </div>
                  </div>

                  {/* Сброс игры */}
                  <div className="bg-gradient-to-br from-red-950/50 to-slate-900 p-6 rounded-xl border-2 border-red-900/50 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                        <RotateCcw size={20} className="text-white" />
                      </div>
                      <span>Опасная зона</span>
                    </h3>
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 mb-4">
                      <div className="flex items-start gap-3">
                        <Ban size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-red-400 font-bold mb-1">Внимание!</div>
                          <p className="text-sm text-red-300">
                            Сброс игры удалит все ваши данные безвозвратно. Это действие нельзя отменить! Рекомендуем сначала экспортировать сохранение.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите сбросить игру? Все данные будут удалены безвозвратно!')) {
                          if (window.confirm('Последнее предупреждение! Это действие нельзя отменить. Продолжить?')) {
                            localStorage.removeItem(SAVE_KEY);
                            addNotification('Игра сброшена. Перезагрузка...', 'info');
                            setTimeout(() => window.location.reload(), 1500);
                          }
                        }
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-red-500/50 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Сбросить игру
                    </button>
                  </div>

                  {/* Информация о версии */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                        <Info size={20} className="text-white" />
                      </div>
                      <span>Информация</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Версия игры</div>
                        <div className="font-bold text-white">2.0.0</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Дата создания</div>
                        <div className="font-bold text-white">{new Date(player.createdAt || Date.now()).toLocaleDateString('ru-RU')}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Класс</div>
                        <div className="font-bold text-white">{player.className}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Время игры</div>
                        <div className="font-bold text-white">
                          {Math.floor(((Date.now() - (player.createdAt || Date.now())) / 1000 / 60))} мин
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: АУКЦИОН --- */}
              {activeTab === 'auction' && (
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-orange-900/30 to-slate-950 rounded-2xl p-8 border-2 border-orange-500/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 mb-2 flex items-center justify-center md:justify-start gap-3">
                            <Package size={40} className="text-orange-400" />
                            Аукцион
                          </h2>
                          <p className="text-slate-300 text-lg">Торговая площадка для игроков</p>
                          <p className="text-orange-400 text-sm mt-2 font-bold">Комиссия аукциона: {(AUCTION_COMMISSION * 100).toFixed(0)}%</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-900/50 to-yellow-900/50 px-8 py-4 rounded-2xl border-2 border-orange-500/50 shadow-xl">
                          <div className="text-center">
                            <div className="text-sm text-orange-300 mb-1 font-bold uppercase tracking-wider">Активных лотов</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                              {auctionListings.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      { id: 'browse', label: 'Обзор', icon: Package },
                      { id: 'my_listings', label: 'Мои лоты', icon: ShoppingBag },
                      { id: 'my_bids', label: 'Мои ставки', icon: Coins },
                      { id: 'history', label: 'История', icon: Scroll }
                    ].map(tab => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setAuctionTab(tab.id)}
                          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                            auctionTab === tab.id
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 text-white shadow-lg scale-105'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <TabIcon size={18} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Browse Tab */}
                  {auctionTab === 'browse' && (
                    <div className="space-y-4">
                      {/* Filters and Create Button */}
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { id: 'all', label: 'Все' },
                            { id: 'weapon', label: 'Оружие' },
                            { id: 'armor', label: 'Броня' },
                            { id: 'consumable', label: 'Расходники' }
                          ].map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => setAuctionFilter(filter.id)}
                              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                auctionFilter === filter.id
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setShowCreateListingModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-white transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                        >
                          <Package size={18} />
                          Создать лот
                        </button>
                      </div>

                      {/* Listings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctionListings
                          .filter(listing => auctionFilter === 'all' || listing.item.type === auctionFilter)
                          .map(listing => {
                            const rarityColors = {
                              common: 'from-slate-700 to-slate-800 border-slate-600',
                              uncommon: 'from-green-900/50 to-slate-900 border-green-600',
                              rare: 'from-blue-900/50 to-slate-900 border-blue-600',
                              epic: 'from-purple-900/50 to-slate-900 border-purple-600',
                              legendary: 'from-orange-900/50 to-slate-900 border-orange-600'
                            };
                            
                            const timeLeftMinutes = Math.floor(listing.timeLeft / 60000);
                            const timeLeftHours = Math.floor(timeLeftMinutes / 60);
                            const timeDisplay = timeLeftHours > 0 
                              ? `${timeLeftHours}ч ${timeLeftMinutes % 60}м`
                              : `${timeLeftMinutes}м`;

                            return (
                              <div
                                key={listing.id}
                                className={`bg-gradient-to-br ${rarityColors[listing.item.rarity]} rounded-xl p-4 border-2 hover:scale-105 transition-all cursor-pointer`}
                                onClick={() => setSelectedAuctionItem(listing)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-bold text-white text-lg">{listing.item.name}</h3>
                                    <p className="text-xs text-slate-400">Продавец: {listing.sellerName}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-slate-400">Осталось</div>
                                    <div className="text-sm font-bold text-orange-400">{timeDisplay}</div>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Текущая ставка:</span>
                                    <span className="font-bold text-yellow-400 flex items-center gap-1">
                                      <Coins size={14} />
                                      {listing.currentBid}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Выкуп:</span>
                                    <span className="font-bold text-green-400 flex items-center gap-1">
                                      <Coins size={14} />
                                      {listing.buyoutPrice}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Ставок:</span>
                                    <span className="font-bold text-blue-400">{listing.bids.length}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAuctionItem(listing);
                                  }}
                                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold text-white transition-all"
                                >
                                  Подробнее
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      {auctionListings.filter(listing => auctionFilter === 'all' || listing.item.type === auctionFilter).length === 0 && (
                        <div className="text-center py-12">
                          <Package size={64} className="mx-auto text-slate-600 mb-4" />
                          <p className="text-slate-400 text-lg">Нет активных лотов</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* My Listings Tab */}
                  {auctionTab === 'my_listings' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctionListings
                          .filter(listing => listing.sellerId === 'player')
                          .map(listing => {
                            const timeLeftMinutes = Math.floor(listing.timeLeft / 60000);
                            const timeLeftHours = Math.floor(timeLeftMinutes / 60);
                            const timeDisplay = timeLeftHours > 0 
                              ? `${timeLeftHours}ч ${timeLeftMinutes % 60}м`
                              : `${timeLeftMinutes}м`;

                            return (
                              <div key={listing.id} className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700">
                                <h3 className="font-bold text-white text-lg mb-2">{listing.item.name}</h3>
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Текущая ставка:</span>
                                    <span className="font-bold text-yellow-400">{listing.currentBid}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Ставок:</span>
                                    <span className="font-bold text-blue-400">{listing.bids.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Осталось:</span>
                                    <span className="font-bold text-orange-400">{timeDisplay}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => cancelListing(listing)}
                                  className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-all"
                                >
                                  Отменить
                                </button>
                              </div>
                            );
                          })}
                      </div>
                      {auctionListings.filter(listing => listing.sellerId === 'player').length === 0 && (
                        <div className="text-center py-12">
                          <ShoppingBag size={64} className="mx-auto text-slate-600 mb-4" />
                          <p className="text-slate-400 text-lg">У вас нет активных лотов</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* My Bids Tab */}
                  {auctionTab === 'my_bids' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctionListings
                          .filter(listing => listing.bids.some(bid => bid.bidderId === 'player'))
                          .map(listing => {
                            const myBid = listing.bids.filter(bid => bid.bidderId === 'player').pop();
                            const isWinning = listing.bids[listing.bids.length - 1]?.bidderId === 'player';
                            const timeLeftMinutes = Math.floor(listing.timeLeft / 60000);
                            const timeLeftHours = Math.floor(timeLeftMinutes / 60);
                            const timeDisplay = timeLeftHours > 0 
                              ? `${timeLeftHours}ч ${timeLeftMinutes % 60}м`
                              : `${timeLeftMinutes}м`;

                            return (
                              <div key={listing.id} className={`bg-slate-800 rounded-xl p-4 border-2 ${isWinning ? 'border-green-500' : 'border-slate-700'}`}>
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-bold text-white text-lg">{listing.item.name}</h3>
                                  {isWinning && (
                                    <span className="text-xs bg-green-600 px-2 py-1 rounded font-bold">ЛИДЕР</span>
                                  )}
                                </div>
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Ваша ставка:</span>
                                    <span className="font-bold text-yellow-400">{myBid.amount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Текущая:</span>
                                    <span className="font-bold text-blue-400">{listing.currentBid}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Осталось:</span>
                                    <span className="font-bold text-orange-400">{timeDisplay}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedAuctionItem(listing)}
                                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold text-white transition-all"
                                >
                                  Повысить ставку
                                </button>
                              </div>
                            );
                          })}
                      </div>
                      {auctionListings.filter(listing => listing.bids.some(bid => bid.bidderId === 'player')).length === 0 && (
                        <div className="text-center py-12">
                          <Coins size={64} className="mx-auto text-slate-600 mb-4" />
                          <p className="text-slate-400 text-lg">Вы не делали ставок</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* History Tab */}
                  {auctionTab === 'history' && (
                    <div className="space-y-4">
                      {auctionHistory.length > 0 ? (
                        <div className="space-y-3">
                          {auctionHistory.map(record => (
                            <div key={record.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-bold text-white">{record.item.name}</h3>
                                  <p className="text-sm text-slate-400">
                                    {record.seller} → {record.buyer}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(record.timestamp).toLocaleString('ru-RU')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-yellow-400 flex items-center gap-1">
                                    <Coins size={16} />
                                    {record.price}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    Комиссия: {record.commission}
                                  </div>
                                  <div className="text-xs text-green-400">
                                    {record.type === 'buyout' ? 'Выкуп' : 'Аукцион'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Scroll size={64} className="mx-auto text-slate-600 mb-4" />
                          <p className="text-slate-400 text-lg">История пуста</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Auction Item Detail Modal */}
              {selectedAuctionItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAuctionItem(null)}>
                  <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-orange-500/50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedAuctionItem.item.name}</h2>
                        <p className="text-slate-400">Продавец: {selectedAuctionItem.sellerName}</p>
                      </div>
                      <button onClick={() => setSelectedAuctionItem(null)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-slate-400 mb-1">Текущая ставка</div>
                            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                              <Coins size={20} />
                              {selectedAuctionItem.currentBid}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400 mb-1">Цена выкупа</div>
                            <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                              <Coins size={20} />
                              {selectedAuctionItem.buyoutPrice}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-2">История ставок ({selectedAuctionItem.bids.length})</h3>
                        {selectedAuctionItem.bids.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {[...selectedAuctionItem.bids].reverse().map((bid, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-300">{bid.bidderName}</span>
                                <span className="font-bold text-yellow-400">{bid.amount}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Ставок пока нет</p>
                        )}
                      </div>

                      {selectedAuctionItem.sellerId !== 'player' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Ваша ставка</label>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={`Минимум: ${selectedAuctionItem.currentBid + 1}`}
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => placeBid(selectedAuctionItem)}
                              className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 rounded-xl font-bold text-white transition-all"
                            >
                              Сделать ставку
                            </button>
                            <button
                              onClick={() => buyoutListing(selectedAuctionItem)}
                              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-white transition-all"
                            >
                              Выкупить за {selectedAuctionItem.buyoutPrice}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Create Listing Modal */}
              {showCreateListingModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateListingModal(false)}>
                  <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-orange-500/50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">Создать лот</h2>
                      <button onClick={() => setShowCreateListingModal(false)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Выберите предмет</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                          {player.inventory.map(item => (
                            <button
                              key={item.uid}
                              onClick={() => setListingItem(item)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                listingItem?.uid === item.uid
                                  ? 'border-orange-500 bg-orange-900/30'
                                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <div className="font-bold text-white text-sm">{item.name}</div>
                              <div className="text-xs text-slate-400">{item.type}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {listingItem && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Начальная цена</label>
                            <input
                              type="number"
                              value={listingStartPrice}
                              onChange={(e) => setListingStartPrice(e.target.value)}
                              placeholder="Минимальная ставка"
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Цена выкупа</label>
                            <input
                              type="number"
                              value={listingBuyoutPrice}
                              onChange={(e) => setListingBuyoutPrice(e.target.value)}
                              placeholder="Цена мгновенного выкупа"
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Длительность</label>
                            <select
                              value={listingDuration}
                              onChange={(e) => setListingDuration(parseInt(e.target.value))}
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                            >
                              <option value={1800000}>30 минут</option>
                              <option value={3600000}>1 час</option>
                              <option value={7200000}>2 часа</option>
                              <option value={14400000}>4 часа</option>
                              <option value={28800000}>8 часов</option>
                              <option value={86400000}>24 часа</option>
                            </select>
                          </div>

                          <div className="bg-slate-800 rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Комиссия аукциона:</span>
                              <span className="text-orange-400 font-bold">{(AUCTION_COMMISSION * 100).toFixed(0)}%</span>
                            </div>
                            {listingBuyoutPrice && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Вы получите (при выкупе):</span>
                                <span className="text-green-400 font-bold">
                                  {Math.floor(parseInt(listingBuyoutPrice) * (1 - AUCTION_COMMISSION))} золота
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={createAuctionListing}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 rounded-xl font-bold text-white transition-all"
                          >
                            Создать лот
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: БИРЖА РЕСУРСОВ --- */}
              {activeTab === 'exchange' && (
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-800 via-green-900/30 to-slate-950 rounded-2xl p-8 border-2 border-green-500/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-2 flex items-center justify-center md:justify-start gap-3">
                            <Coins size={40} className="text-green-400" />
                            Биржа Ресурсов
                          </h2>
                          <p className="text-slate-300 text-lg">Торговая площадка с динамическими ценами</p>
                          <p className="text-green-400 text-sm mt-2 font-bold">Цены обновляются каждые 30 секунд</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 px-8 py-4 rounded-2xl border-2 border-green-500/50 shadow-xl">
                          <div className="text-center">
                            <div className="text-sm text-green-300 mb-1 font-bold uppercase tracking-wider">Ваше золото</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center gap-2">
                              <Coins size={32} className="text-green-400" />
                              {player?.gold || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Список ресурсов */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {RESOURCES.map(resource => {
                      const price = resourcePrices[resource.id];
                      const playerAmount = player.resources[resource.id] || 0;
                      const priceHistory = resourcePriceHistory[resource.id] || [];
                      const basePrice = BASE_RESOURCE_PRICES[resource.id];
                      const priceChange = ((price - basePrice) / basePrice * 100).toFixed(1);
                      const isUp = price > basePrice;

                      const rarityColors = {
                        common: 'from-slate-700 to-slate-800 border-slate-600',
                        uncommon: 'from-green-900/50 to-slate-900 border-green-600',
                        rare: 'from-blue-900/50 to-slate-900 border-blue-600',
                        epic: 'from-purple-900/50 to-slate-900 border-purple-600',
                        legendary: 'from-orange-900/50 to-slate-900 border-orange-600'
                      };

                      return (
                        <div
                          key={resource.id}
                          className={`bg-gradient-to-br ${rarityColors[resource.rarity]} rounded-xl p-4 border-2 hover:scale-105 transition-all cursor-pointer`}
                          onClick={() => setSelectedResource(resource)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-bold text-white">{resource.name}</h5>
                              <p className="text-xs text-slate-400">У вас: {playerAmount}</p>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${
                              isUp ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                            }`}>
                              {isUp ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                              <Coins size={18} />
                              {price}
                            </div>
                            <div className="text-xs text-slate-500">за единицу</div>
                          </div>

                          {/* Мини-график */}
                          <div className="h-12 flex items-end gap-1">
                            {priceHistory.map((histPrice, idx) => {
                              const maxPrice = Math.max(...priceHistory);
                              const height = (histPrice / maxPrice) * 100;
                              return (
                                <div
                                  key={idx}
                                  className={`flex-1 rounded-t ${
                                    histPrice > BASE_RESOURCE_PRICES[resource.id]
                                      ? 'bg-green-500/50'
                                      : 'bg-red-500/50'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              );
                            })}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResource(resource);
                            }}
                            className="w-full mt-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-all text-sm"
                          >
                            Торговать
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- TAB: МАГАЗИН БРИЛЛИАНТОВ --- */}
              {activeTab === 'shop' && (
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                          <Sparkles size={40} className="text-purple-400" />
                          Алмазный магазин
                          <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">ДЕМО</span>
                        </h2>
                        <p className="text-slate-300 text-lg">Улучшите своего персонажа, чтобы получить безграничные возможности.</p>
                        <p className="text-green-400 text-sm mt-2 font-bold">🎮 Тестовый режим: Все покупки бесплатны!</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 px-8 py-4 rounded-xl border border-purple-500/40 shadow-lg">
                        <div className="text-center">
                          <div className="text-sm text-purple-300 mb-1 font-bold uppercase tracking-wider">Ваши бриллианты</div>
                          <div className="text-4xl font-bold text-purple-300 flex items-center justify-center gap-2">
                            <Sparkles size={32} className="text-purple-400" />
                            {player.diamonds || 0}
                          </div>
                          <button
                            onClick={() => buyDiamonds({ amount: 1000, bonus: null })}
                            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg"
                          >
                            + 1000 тестовых 💎
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Пакеты бриллиантов */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles size={24} className="text-purple-400" />
                      Пакеты бриллиантов
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <Zap size={24} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-yellow-400">Премиум-бонус!</h4>
                          <p className="text-sm text-slate-300">При покупке любого пакета снимается ограничение 3 секунд на кнопку "Сделай шаг"</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {DIAMOND_SHOP_ITEMS.filter(item => item.type === 'diamonds').map(item => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={item.id} className={`bg-gradient-to-br ${item.color} p-1 rounded-2xl ${item.popular ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''} relative`}>
                            {item.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                                ⭐ ПОПУЛЯРНО
                              </div>
                            )}
                            <div className="bg-slate-900 rounded-xl p-6 h-full flex flex-col">
                              <div className="flex justify-center mb-4">
                                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                  <ItemIcon size={40} className="text-white" />
                                </div>
                              </div>
                              
                              <h4 className="text-xl font-bold text-white text-center mb-2">{item.name}</h4>
                              
                              <div className="text-center mb-4">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                  {item.amount}
                                </div>
                                <div className="text-xs text-slate-400">бриллиантов</div>
                                {item.bonus && (
                                  <div className="text-sm text-green-400 font-bold mt-1">{item.bonus}</div>
                                )}
                              </div>
                              
                              <div className="mt-auto">
                                <button
                                  onClick={() => buyDiamonds(item)}
                                  className="w-full py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg hover:scale-105"
                                >
                                  {item.realPrice === 0 ? 'Получить бесплатно' : 'Получить (ДЕМО)'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Бусты */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Zap size={24} className="text-yellow-400" />
                      Усилители
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {DIAMOND_SHOP_ITEMS.filter(item => item.type === 'boost').map(item => {
                        const ItemIcon = item.icon;
                        const canAfford = (player.diamonds || 0) >= item.cost;
                        return (
                          <div key={item.id} className={`bg-gradient-to-br ${item.color} p-1 rounded-xl`}>
                            <div className="bg-slate-900 rounded-lg p-4 h-full flex flex-col">
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <ItemIcon size={24} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-sm mb-1">{item.name}</h4>
                                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <button
                                  onClick={() => buyShopItem(item)}
                                  disabled={!canAfford}
                                  className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    canAfford
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Sparkles size={16} />
                                  {item.cost}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Эксклюзивные предметы */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Crown size={24} className="text-yellow-400" />
                      Эксклюзивные предметы
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {DIAMOND_SHOP_ITEMS.filter(item => item.type === 'item').map(item => {
                        const ItemIcon = item.icon;
                        const canAfford = (player.diamonds || 0) >= item.cost;
                        return (
                          <div key={item.id} className={`bg-gradient-to-br ${item.color} p-1 rounded-xl`}>
                            <div className="bg-slate-900 rounded-lg p-4 h-full flex flex-col">
                              <div className="flex justify-center mb-3">
                                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                  <ItemIcon size={32} className="text-white" />
                                </div>
                              </div>
                              
                              <h4 className="font-bold text-white text-center mb-2">{item.name}</h4>
                              <p className="text-xs text-slate-400 text-center mb-4 line-clamp-2">{item.description}</p>
                              
                              <div className="mt-auto">
                                <button
                                  onClick={() => buyShopItem(item)}
                                  disabled={!canAfford}
                                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                                    canAfford
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Sparkles size={18} />
                                  {item.cost}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {['tasks'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 mt-20">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Hammer size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-300">Раздел в разработке</h2>
                  <p>Эта функция будет доступна в будущих обновлениях.</p>
                </div>
              )}

            </>
          )}
        </div>

        {/* Upgrades Modal */}
        {showUpgradesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
              {/* Заголовок */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Hammer size={28} className="text-indigo-400 drop-shadow-glow" />
                  <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Улучшения дома</h2>
                    <p className="text-sm text-slate-400">Улучшайте свой дом для получения бонусов</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradesModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Улучшения */}
              <div className="p-6 space-y-4">
                {/* Расширение хранилища */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-xl p-6 hover:border-blue-400/70 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                        <Package size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Расширение хранилища</h3>
                        <p className="text-xs text-slate-400">Увеличивает вместимость инвентаря</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Уровень</div>
                      <div className="text-xl font-bold text-white">{player.homeUpgrades?.storageExpansion || 0} / 5</div>
                    </div>
                  </div>
                  
                  {(player.homeUpgrades?.storageExpansion || 0) < 5 ? (
                    <>
                      <div className="mb-3">
                        <div className="text-sm text-blue-300 mb-1">
                          {UPGRADES.storageExpansion[player.homeUpgrades?.storageExpansion || 0]?.desc}
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                          <Coins size={16} />
                          {UPGRADES.storageExpansion[player.homeUpgrades?.storageExpansion || 0]?.cost} золота
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgradeHome('storageExpansion')}
                        disabled={player.gold < UPGRADES.storageExpansion[player.homeUpgrades?.storageExpansion || 0]?.cost}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed"
                      >
                        Улучшить
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-green-400 font-bold">
                      ✓ Максимальный уровень
                    </div>
                  )}
                </div>

                {/* Алхимическая лаборатория */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-400/70 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Алхимическая лаборатория</h3>
                        <p className="text-xs text-slate-400">Ускоряет создание зелий</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Уровень</div>
                      <div className="text-xl font-bold text-white">{player.homeUpgrades?.alchemyLab || 0} / 3</div>
                    </div>
                  </div>
                  
                  {(player.homeUpgrades?.alchemyLab || 0) < 3 ? (
                    <>
                      <div className="mb-3">
                        <div className="text-sm text-purple-300 mb-1">
                          {UPGRADES.alchemyLab[player.homeUpgrades?.alchemyLab || 0]?.desc}
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                          <Coins size={16} />
                          {UPGRADES.alchemyLab[player.homeUpgrades?.alchemyLab || 0]?.cost} золота
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgradeHome('alchemyLab')}
                        disabled={player.gold < UPGRADES.alchemyLab[player.homeUpgrades?.alchemyLab || 0]?.cost}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed"
                      >
                        Улучшить
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-green-400 font-bold">
                      ✓ Максимальный уровень
                    </div>
                  )}
                </div>

                {/* Тренировочный манекен */}
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-xl p-6 hover:border-red-400/70 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                        <Sword size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Тренировочный манекен</h3>
                        <p className="text-xs text-slate-400">Увеличивает получаемый опыт</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Уровень</div>
                      <div className="text-xl font-bold text-white">{player.homeUpgrades?.trainingDummy || 0} / 3</div>
                    </div>
                  </div>
                  
                  {(player.homeUpgrades?.trainingDummy || 0) < 3 ? (
                    <>
                      <div className="mb-3">
                        <div className="text-sm text-red-300 mb-1">
                          {UPGRADES.trainingDummy[player.homeUpgrades?.trainingDummy || 0]?.desc}
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                          <Coins size={16} />
                          {UPGRADES.trainingDummy[player.homeUpgrades?.trainingDummy || 0]?.cost} золота
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgradeHome('trainingDummy')}
                        disabled={player.gold < UPGRADES.trainingDummy[player.homeUpgrades?.trainingDummy || 0]?.cost}
                        className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 rounded-lg font-bold transition-all shadow-lg hover:shadow-red-500/50 disabled:cursor-not-allowed"
                      >
                        Улучшить
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-green-400 font-bold">
                      ✓ Максимальный уровень
                    </div>
                  )}
                </div>
              </div>

              {/* Подсказка */}
              <div className="p-6 pt-0">
                <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-200">
                      <p className="font-bold mb-1">Совет</p>
                      <p className="text-indigo-300/80">Улучшения дома дают постоянные бонусы. Расширение хранилища увеличивает лимит инвентаря, лаборатория ускоряет крафт зелий, а манекен повышает получаемый опыт от боев.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* --- ГЛОБАЛЬНЫЙ ЧАТ --- */}
      {gameStage === 'playing' && player && (
        <>
          <ChatPanel 
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            player={player}
          />
          <ChatToggleButton 
            isOpen={isChatOpen}
            onClick={() => setIsChatOpen(!isChatOpen)}
            unreadCount={0}
            hasNewMentions={false}
          />

          {/* МОДАЛЬНОЕ ОКНО ТОРГОВЛИ */}
          {showTradeModal && tradeOffer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl border-2 border-purple-500 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                  <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                      <ShoppingBag size={28} />
                      Торговля с {tradeOffer.targetMember.name}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Выберите предметы для обмена</p>
                  </div>
                  <button
                    onClick={cancelTrade}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Ваши предметы */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Backpack size={20} className="text-blue-400" />
                      Ваши предметы ({player.inventory.length})
                    </h3>
                    
                    {player.inventory.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Package size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">У вас нет предметов для обмена</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {player.inventory.map(item => {
                          const isSelected = selectedTradeItems.find(i => i.uid === item.uid);
                          const rarityClass = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                          const rarityBg = RARITY_BG[item.rarity] || RARITY_BG.common;
                          
                          return (
                            <button
                              key={item.uid}
                              onClick={() => toggleTradeItem(item)}
                              className={`${rarityBg} rounded-lg border-2 ${
                                isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : rarityClass.split(' ')[1]
                              } p-3 hover:scale-105 transition-all relative`}
                            >
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <CheckCircle size={16} className="text-white" />
                                </div>
                              )}
                              
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${rarityBg} border ${rarityClass.split(' ')[1]}`}>
                                  {item.type === 'weapon' ? <Sword size={24} className={rarityClass.split(' ')[0]}/> : 
                                   item.type === 'armor' ? <Shield size={24} className={rarityClass.split(' ')[0]}/> : 
                                   item.type === 'consumable' ? <Heart size={24} className={rarityClass.split(' ')[0]}/> :
                                   <Box size={24} className={rarityClass.split(' ')[0]}/>}
                                </div>
                                <div className="text-center">
                                  <div className={`text-xs font-bold ${rarityClass.split(' ')[0]} line-clamp-2`}>
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    💰 {item.cost}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Выбранные предметы */}
                  {selectedTradeItems.length > 0 && (
                    <div className="bg-purple-900/20 border-2 border-purple-500/50 rounded-xl p-4">
                      <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Package size={18} />
                        Выбрано предметов: {selectedTradeItems.length}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTradeItems.map(item => (
                          <div key={item.uid} className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2">
                            {item.name}
                            <button
                              onClick={() => toggleTradeItem(item)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Общая стоимость:</span>
                          <span className="text-yellow-400 font-bold flex items-center gap-1">
                            <Coins size={16} />
                            {selectedTradeItems.reduce((sum, item) => sum + (item.cost || 0), 0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Предложенная цена:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tradeGoldAmount}
                              onChange={(e) => setTradeGoldAmount(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-24 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                              placeholder="0"
                            />
                            <Coins size={16} className="text-yellow-400" />
                          </div>
                        </div>
                        
                        {tradeGoldAmount === 0 && (
                          <div className="text-xs text-slate-500 text-center">
                            Автоматическая цена: {Math.floor(selectedTradeItems.reduce((sum, item) => sum + (item.cost || 0), 0) * 0.7)} золота (70% от стоимости)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur-sm">
                  <button
                    onClick={cancelTrade}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={sendTradeOffer}
                    disabled={selectedTradeItems.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Отправить предложение
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* --- CRAFTING ANIMATION MODAL --- */}
      {isCrafting && craftingRecipe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full p-8 animate-scaleIn">
            {/* Заголовок */}
            <div className="text-center mb-6">
              <div className="inline-block relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/50">
                  <Hammer size={40} className="text-white animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                Создание предмета
              </h3>
              <p className="text-slate-400 text-sm">
                {craftingRecipe.name}
              </p>
            </div>

            {/* Анимация ингредиентов */}
            <div className="mb-6 space-y-2">
              {craftingRecipe.ingredients.map((ing, idx) => {
                const resource = RESOURCES.find(r => r.id === ing.resourceId);
                const isProcessed = craftingProgress > (idx + 1) * (100 / craftingRecipe.ingredients.length);
                
                return (
                  <div 
                    key={ing.resourceId}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                      isProcessed 
                        ? 'bg-green-900/30 border border-green-500/50' 
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isProcessed ? 'bg-green-600' : 'bg-slate-700'
                      }`}>
                        {isProcessed ? (
                          <CheckCircle size={18} className="text-white" />
                        ) : (
                          <Box size={18} className="text-slate-400" />
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isProcessed ? 'text-green-400' : 'text-slate-300'
                      }`}>
                        {resource?.name || ing.resourceId}
                      </span>
                    </div>
                    <span className={`text-xs font-bold transition-colors ${
                      isProcessed ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {ing.amount}x
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Прогресс бар */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Прогресс</span>
                <span className="text-xs text-purple-400 font-bold">{Math.floor(craftingProgress)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${craftingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Результат (показывается при 100%) */}
            {craftingProgress >= 100 && (
              <div className="text-center animate-fadeIn">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border-2 border-yellow-500/50 mb-3">
                  <div className="text-4xl mb-2 animate-bounce">✨</div>
                  <div className={`font-bold ${RARITY_COLORS[craftingRecipe.result.rarity]?.split(' ')[0] || 'text-white'}`}>
                    {craftingRecipe.result.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    успешно создан!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}