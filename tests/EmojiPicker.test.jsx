import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmojiPicker from '../components/Chat/EmojiPicker.jsx';
import { EMOJI_CATEGORIES } from '../constants/chatConstants.js';

describe('EmojiPicker Component', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering - Requirements 4.1, 4.2, 4.3, 4.7', () => {
    it('renders emoji picker with title', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      expect(screen.getByText('Эмодзи')).toBeTruthy();
    });

    it('renders close button', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders all emoji categories', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      Object.values(EMOJI_CATEGORIES).forEach(category => {
        expect(screen.getByText(category.name)).toBeTruthy();
      });
    });

    it('renders emojis from default category (emotions)', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const emotionEmojis = EMOJI_CATEGORIES.emotions.emojis;
      emotionEmojis.forEach(emoji => {
        expect(screen.getByText(emoji)).toBeTruthy();
      });
    });

    it('displays minimum 20 emojis across all categories - Requirement 4.3', () => {
      const totalEmojis = Object.values(EMOJI_CATEGORIES)
        .reduce((sum, cat) => sum + cat.emojis.length, 0);
      expect(totalEmojis).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Category Switching - Requirement 4.7', () => {
    it('switches to actions category when clicked', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const actionsButton = screen.getByText('Действия');
      fireEvent.click(actionsButton);
      
      const actionsEmojis = EMOJI_CATEGORIES.actions.emojis;
      actionsEmojis.forEach(emoji => {
        expect(screen.getByText(emoji)).toBeTruthy();
      });
    });

    it('switches to items category when clicked', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const itemsButton = screen.getByText('Предметы');
      fireEvent.click(itemsButton);
      
      const itemsEmojis = EMOJI_CATEGORIES.items.emojis;
      itemsEmojis.forEach(emoji => {
        expect(screen.getByText(emoji)).toBeTruthy();
      });
    });

    it('active category has correct styling', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const emotionsButton = screen.getByText('Эмоции');
      expect(emotionsButton.classList.contains('bg-blue-600')).toBe(true);
      expect(emotionsButton.classList.contains('text-white')).toBe(true);
    });

    it('inactive categories have correct styling', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const actionsButton = screen.getByText('Действия');
      expect(actionsButton.classList.contains('bg-slate-700')).toBe(true);
      expect(actionsButton.classList.contains('text-slate-400')).toBe(true);
    });
  });

  describe('Emoji Selection - Requirement 4.4', () => {
    it('calls onSelect when emoji is clicked', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const firstEmoji = EMOJI_CATEGORIES.emotions.emojis[0];
      const emojiButton = screen.getByText(firstEmoji);
      fireEvent.click(emojiButton);
      expect(mockOnSelect).toHaveBeenCalledWith(firstEmoji);
    });

    it('calls onClose after emoji selection', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const firstEmoji = EMOJI_CATEGORIES.emotions.emojis[0];
      const emojiButton = screen.getByText(firstEmoji);
      fireEvent.click(emojiButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('selects emoji from different category', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const actionsButton = screen.getByText('Действия');
      fireEvent.click(actionsButton);
      
      const actionEmoji = EMOJI_CATEGORIES.actions.emojis[0];
      const emojiButton = screen.getByText(actionEmoji);
      fireEvent.click(emojiButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith(actionEmoji);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons[0];
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onSelect when close button is clicked', () => {
      render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons[0];
      fireEvent.click(closeButton);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Emoji Grouping by Categories - Requirement 4.7', () => {
    it('emojis are grouped into emotions category', () => {
      expect(EMOJI_CATEGORIES.emotions).toBeDefined();
      expect(EMOJI_CATEGORIES.emotions.emojis.length).toBeGreaterThan(0);
    });

    it('emojis are grouped into actions category', () => {
      expect(EMOJI_CATEGORIES.actions).toBeDefined();
      expect(EMOJI_CATEGORIES.actions.emojis.length).toBeGreaterThan(0);
    });

    it('emojis are grouped into items category', () => {
      expect(EMOJI_CATEGORIES.items).toBeDefined();
      expect(EMOJI_CATEGORIES.items.emojis.length).toBeGreaterThan(0);
    });

    it('each category has a name', () => {
      Object.values(EMOJI_CATEGORIES).forEach(category => {
        expect(category.name).toBeDefined();
        expect(typeof category.name).toBe('string');
      });
    });
  });
});
