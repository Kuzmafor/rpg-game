import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import StickerPicker from '../components/Chat/StickerPicker.jsx';
import { STICKERS } from '../constants/chatConstants.js';

describe('StickerPicker Component', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering - Requirements 4.5, 4.6', () => {
    it('renders sticker picker with title', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      expect(screen.getByText('Стикеры')).toBeTruthy();
    });

    it('renders close button', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons[0]).toBeTruthy();
    });

    it('renders "Все" (all) category by default', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      expect(screen.getByText('Все')).toBeTruthy();
    });

    it('displays all stickers when "Все" category is active', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      STICKERS.forEach(sticker => {
        expect(screen.getByText(sticker.emoji)).toBeTruthy();
      });
    });

    it('displays minimum 10 stickers - Requirement 4.5', () => {
      expect(STICKERS.length).toBeGreaterThanOrEqual(10);
    });

    it('each sticker has a title attribute with name', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      STICKERS.forEach(sticker => {
        const stickerButton = screen.getByTitle(sticker.name);
        expect(stickerButton).toBeTruthy();
      });
    });
  });

  describe('Category Filtering', () => {
    it('renders all unique categories', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const uniqueCategories = [...new Set(STICKERS.map(s => s.category))];
      uniqueCategories.forEach(category => {
        expect(screen.getByText(category)).toBeTruthy();
      });
    });

    it('filters stickers by category when category is selected', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const testCategory = STICKERS[0].category;
      const categoryButton = screen.getByText(testCategory);
      fireEvent.click(categoryButton);
      
      const categoryStickers = STICKERS.filter(s => s.category === testCategory);
      categoryStickers.forEach(sticker => {
        expect(screen.getByText(sticker.emoji)).toBeTruthy();
      });
    });

    it('shows all stickers when "Все" category is selected', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const specificCategory = STICKERS[0].category;
      fireEvent.click(screen.getByText(specificCategory));
      
      const allButton = screen.getByText('Все');
      fireEvent.click(allButton);
      
      STICKERS.forEach(sticker => {
        expect(screen.getByText(sticker.emoji)).toBeTruthy();
      });
    });

    it('active category has correct styling', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const allButton = screen.getByText('Все');
      expect(allButton.classList.contains('bg-blue-600')).toBe(true);
      expect(allButton.classList.contains('text-white')).toBe(true);
    });
  });

  describe('Sticker Selection - Requirement 4.6', () => {
    it('calls onSelect when sticker is clicked', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const firstSticker = STICKERS[0];
      const stickerButton = screen.getByTitle(firstSticker.name);
      fireEvent.click(stickerButton);
      expect(mockOnSelect).toHaveBeenCalledWith(firstSticker);
    });

    it('calls onClose after sticker selection', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const firstSticker = STICKERS[0];
      const stickerButton = screen.getByTitle(firstSticker.name);
      fireEvent.click(stickerButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('selects sticker from filtered category', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const specificCategory = STICKERS[0].category;
      fireEvent.click(screen.getByText(specificCategory));
      
      const categorySticker = STICKERS.find(s => s.category === specificCategory);
      const stickerButton = screen.getByTitle(categorySticker.name);
      fireEvent.click(stickerButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith(categorySticker);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons[0];
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onSelect when close button is clicked', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons[0];
      fireEvent.click(closeButton);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Sticker Data Structure', () => {
    it('each sticker has required properties', () => {
      STICKERS.forEach(sticker => {
        expect(sticker).toHaveProperty('id');
        expect(sticker).toHaveProperty('name');
        expect(sticker).toHaveProperty('emoji');
        expect(sticker).toHaveProperty('category');
      });
    });

    it('sticker IDs are unique', () => {
      const ids = STICKERS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('stickers are displayed as emoji (graphical) - Requirement 4.6', () => {
      render(<StickerPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
      STICKERS.forEach(sticker => {
        const stickerElement = screen.getByText(sticker.emoji);
        expect(stickerElement).toBeTruthy();
      });
    });
  });
});
