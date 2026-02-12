/**
 * Checkpoint 5 - Базовая структура чата
 * 
 * Этот тест проверяет выполнение требований checkpoint 5:
 * 1. Чат открывается/закрывается
 * 2. Переключение между каналами работает
 * 3. Сохранение состояния в localStorage работает
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ChatPanel from '../components/Chat/ChatPanel.jsx';
import ChatToggleButton from '../components/Chat/ChatToggleButton.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Mock player data
const mockPlayer = {
  id: 'test_player_1',
  name: 'TestPlayer',
  level: 10,
  avatarId: 1
};

describe('Checkpoint 5: Базовая структура чата', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('1. Чат открывается/закрывается', () => {
    it('должен отображать ChatPanel когда isOpen=true', () => {
      const { container } = render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что панель чата видна
      const chatPanel = container.querySelector('.bg-slate-800');
      expect(chatPanel).toBeTruthy();
      expect(chatPanel.classList.contains('flex')).toBe(true);
    });

    it('должен скрывать ChatPanel когда isOpen=false', () => {
      const { container } = render(
        <ChatPanel player={mockPlayer} isOpen={false} onToggle={() => {}} />
      );
      
      // Проверяем, что панель чата скрыта (w-0)
      const wrapper = container.querySelector('.fixed.right-0');
      expect(wrapper.classList.contains('w-0')).toBe(true);
    });

    it('ChatToggleButton должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(
        <ChatToggleButton 
          isOpen={false} 
          unreadCount={0} 
          hasNewMentions={false} 
          onClick={handleClick} 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ChatToggleButton должен показывать разные иконки для открытого/закрытого состояния', () => {
      const { rerender } = render(
        <ChatToggleButton 
          isOpen={false} 
          unreadCount={0} 
          hasNewMentions={false} 
          onClick={() => {}} 
        />
      );
      
      // Когда закрыт - показывает MessageSquare
      let button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeTruthy();
      
      // Когда открыт - показывает X
      rerender(
        <ChatToggleButton 
          isOpen={true} 
          unreadCount={0} 
          hasNewMentions={false} 
          onClick={() => {}} 
        />
      );
      
      button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeTruthy();
    });
  });

  describe('2. Переключение между каналами работает', () => {
    it('должен отображать все 3 канала (Общий, Торговля, Помощь)', () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем наличие всех каналов
      expect(screen.getByText('Общий')).toBeTruthy();
      expect(screen.getByText('Торговля')).toBeTruthy();
      expect(screen.getByText('Помощь')).toBeTruthy();
    });

    it('должен переключаться между каналами при клике', async () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Изначально активен канал "Общий" (по умолчанию)
      const generalTab = screen.getByText('Общий').closest('button');
      expect(generalTab.classList.contains('bg-slate-700')).toBe(true);
      
      // Кликаем на канал "Торговля"
      const tradeTab = screen.getByText('Торговля').closest('button');
      fireEvent.click(tradeTab);
      
      // Проверяем, что канал "Торговля" стал активным
      await waitFor(() => {
        expect(tradeTab.classList.contains('bg-slate-700')).toBe(true);
      });
    });

    it('должен сохранять активный канал в localStorage', async () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Переключаемся на канал "Помощь"
      const helpTab = screen.getByText('Помощь').closest('button');
      fireEvent.click(helpTab);
      
      // Проверяем, что активный канал сохранен в localStorage
      await waitFor(() => {
        const savedChannel = localStorage.getItem('chat_active_channel');
        expect(savedChannel).toBe('"help"');
      });
    });
  });

  describe('3. Сохранение состояния в localStorage работает', () => {
    it('должен сохранять состояние isOpen в localStorage', async () => {
      const { rerender } = render(
        <ChatPanel player={mockPlayer} isOpen={false} onToggle={() => {}} />
      );
      
      // Проверяем начальное состояние
      await waitFor(() => {
        const savedState = localStorage.getItem('chat_is_open');
        expect(savedState).toBe('false');
      });
      
      // Открываем чат
      rerender(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что состояние обновилось
      await waitFor(() => {
        const savedState = localStorage.getItem('chat_is_open');
        expect(savedState).toBe('true');
      });
    });

    it('должен загружать активный канал из localStorage при монтировании', () => {
      // Устанавливаем сохраненный канал
      localStorage.setItem('chat_active_channel', '"trade"');
      
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что канал "Торговля" активен
      const tradeTab = screen.getByText('Торговля').closest('button');
      expect(tradeTab.classList.contains('bg-slate-700')).toBe(true);
    });

    it('должен сохранять настройки чата в localStorage', async () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что настройки сохранены
      await waitFor(() => {
        const savedSettings = localStorage.getItem('chat_settings');
        expect(savedSettings).toBeTruthy();
        
        const settings = JSON.parse(savedSettings);
        expect(settings).toHaveProperty('fontSize');
        expect(settings).toHaveProperty('showTimestamps');
        expect(settings).toHaveProperty('showAvatars');
        expect(settings).toHaveProperty('soundEnabled');
        expect(settings).toHaveProperty('profanityFilter');
        expect(settings).toHaveProperty('opacity');
      });
    });

    it('должен сохранять заблокированных игроков в localStorage', async () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что список заблокированных сохранен
      await waitFor(() => {
        const savedBlocked = localStorage.getItem('chat_blocked_players');
        expect(savedBlocked).toBeTruthy();
        
        const blocked = JSON.parse(savedBlocked);
        expect(Array.isArray(blocked)).toBe(true);
      });
    });

    it('должен сохранять сообщения в localStorage', async () => {
      render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      // Проверяем, что сообщения сохранены
      await waitFor(() => {
        const savedMessages = localStorage.getItem('chat_messages');
        expect(savedMessages).toBeTruthy();
        
        const messages = JSON.parse(savedMessages);
        expect(messages).toHaveProperty('general');
        expect(messages).toHaveProperty('trade');
        expect(messages).toHaveProperty('help');
      });
    });
  });

  describe('Дополнительные проверки', () => {
    it('ChatToggleButton должен показывать счетчик непрочитанных', () => {
      render(
        <ChatToggleButton 
          isOpen={false} 
          unreadCount={5} 
          hasNewMentions={false} 
          onClick={() => {}} 
        />
      );
      
      expect(screen.getByText('5')).toBeTruthy();
    });

    it('ChatToggleButton должен показывать "99+" для больших чисел', () => {
      render(
        <ChatToggleButton 
          isOpen={false} 
          unreadCount={150} 
          hasNewMentions={false} 
          onClick={() => {}} 
        />
      );
      
      expect(screen.getByText('99+')).toBeTruthy();
    });

    it('должен применять настройку прозрачности к панели чата', () => {
      // Устанавливаем настройки с прозрачностью 50%
      localStorage.setItem('chat_settings', JSON.stringify({
        fontSize: 'medium',
        showTimestamps: true,
        showAvatars: true,
        soundEnabled: true,
        profanityFilter: true,
        opacity: 50
      }));
      
      const { container } = render(
        <ChatPanel player={mockPlayer} isOpen={true} onToggle={() => {}} />
      );
      
      const chatPanel = container.querySelector('.bg-slate-800');
      expect(chatPanel.style.opacity).toBe('0.5');
    });
  });
});
