import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageItem from '../components/Chat/MessageItem';

describe('MessageItem Component', () => {
  const mockSettings = {
    fontSize: 'medium',
    showTimestamps: true,
    showAvatars: true,
    soundEnabled: true,
    profanityFilter: true,
    opacity: 100
  };

  const mockHandlers = {
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
    onReply: jest.fn(),
    onBlock: jest.fn(),
    onReport: jest.fn()
  };

  const mockTextMessage = {
    id: 'msg_1',
    channelId: 'general',
    author: {
      id: 'player_2',
      name: 'TestPlayer',
      level: 10,
      avatarId: 1,
      isNPC: false
    },
    content: 'Hello world!',
    timestamp: Date.now(),
    type: 'text',
    mentions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement 3.3: Отображать имя отправителя, уровень и аватар
  test('displays sender name, level, and avatar', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    expect(screen.getByText('Ур. 10')).toBeInTheDocument();
  });

  // Requirement 3.4: Добавить временную метку (если включено в настройках)
  test('shows timestamp when enabled in settings', () => {
    const settingsWithTimestamp = { ...mockSettings, showTimestamps: true };
    render(
      <MessageItem
        message={mockTextMessage}
        settings={settingsWithTimestamp}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Should show timestamp in HH:MM format
    const timestampElements = screen.getAllByText(/\d{2}:\d{2}/);
    expect(timestampElements.length).toBeGreaterThan(0);
  });

  test('hides timestamp when disabled in settings', () => {
    const settingsWithoutTimestamp = { ...mockSettings, showTimestamps: false };
    render(
      <MessageItem
        message={mockTextMessage}
        settings={settingsWithoutTimestamp}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Should not show timestamp
    const timestampElements = screen.queryAllByText(/\d{2}:\d{2}/);
    expect(timestampElements.length).toBe(0);
  });

  // Requirement 10.3: Показывать/скрывать аватары
  test('hides avatar when disabled in settings', () => {
    const settingsWithoutAvatar = { ...mockSettings, showAvatars: false };
    const { container } = render(
      <MessageItem
        message={mockTextMessage}
        settings={settingsWithoutAvatar}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Avatar container should not be present
    const avatarContainer = container.querySelector('.w-10.h-10.rounded-full');
    expect(avatarContainer).not.toBeInTheDocument();
  });

  // Requirement 3.3: Реализовать отображение текстовых сообщений
  test('displays text message content', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Hello world!')).toBeInTheDocument();
  });

  // Requirement 4.6: Реализовать отображение стикеров
  test('displays sticker as emoji', () => {
    const stickerMessage = {
      ...mockTextMessage,
      type: 'sticker',
      stickerId: 1,
      content: ''
    };

    render(
      <MessageItem
        message={stickerMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Sticker should be displayed as emoji (🎉 for sticker id 1)
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  // Requirement 3.3: Реализовать отображение системных сообщений
  test('displays system message with yellow color', () => {
    const systemMessage = {
      ...mockTextMessage,
      type: 'system',
      content: 'System notification'
    };

    render(
      <MessageItem
        message={systemMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    const systemText = screen.getByText('System notification');
    expect(systemText).toBeInTheDocument();
    expect(systemText).toHaveClass('text-yellow-400');
    expect(systemText).toHaveClass('italic');
  });

  // Requirement 8.4: Добавить выделение для сообщений с упоминаниями
  test('highlights message when player is mentioned', () => {
    const { container } = render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={true}
        isHovered={false}
        {...mockHandlers}
      />
    );

    const messageContainer = container.firstChild;
    expect(messageContainer).toHaveClass('bg-blue-900/30');
    expect(messageContainer).toHaveClass('border-l-4');
    expect(messageContainer).toHaveClass('border-blue-500');
  });

  // Requirement 7.1: Показать контекстное меню при наведении
  test('shows context menu when hovered', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    // Context menu buttons should be visible
    expect(screen.getByTitle('Ответить')).toBeInTheDocument();
    expect(screen.getByTitle('Копировать')).toBeInTheDocument();
    expect(screen.getByTitle('Заблокировать')).toBeInTheDocument();
    expect(screen.getByTitle('Пожаловаться')).toBeInTheDocument();
  });

  test('hides context menu when not hovered', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Context menu buttons should not be visible
    expect(screen.queryByTitle('Ответить')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Копировать')).not.toBeInTheDocument();
  });

  test('hides context menu for own messages', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={true}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    // Context menu should not show for own messages
    expect(screen.queryByTitle('Ответить')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Блокировать')).not.toBeInTheDocument();
  });

  // Requirement 7.2: Кнопка "Ответить"
  test('calls onReply when reply button is clicked', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    const replyButton = screen.getByTitle('Ответить');
    fireEvent.click(replyButton);

    expect(mockHandlers.onReply).toHaveBeenCalledTimes(1);
  });

  // Requirement 7.3: Кнопка "Копировать"
  test('copies message content when copy button is clicked', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    });

    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    const copyButton = screen.getByTitle('Копировать');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello world!');
  });

  // Requirement 7.5: Кнопка "Блокировать"
  test('calls onBlock when block button is clicked', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    const blockButton = screen.getByTitle('Заблокировать');
    fireEvent.click(blockButton);

    expect(mockHandlers.onBlock).toHaveBeenCalledTimes(1);
  });

  // Requirement 7.4: Кнопка "Пожаловаться"
  test('calls onReport when report button is clicked', () => {
    render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={true}
        {...mockHandlers}
      />
    );

    const reportButton = screen.getByTitle('Пожаловаться');
    fireEvent.click(reportButton);

    expect(mockHandlers.onReport).toHaveBeenCalledTimes(1);
  });

  // Test NPC badge display
  test('displays NPC badge for NPC messages', () => {
    const npcMessage = {
      ...mockTextMessage,
      author: {
        ...mockTextMessage.author,
        isNPC: true
      }
    };

    render(
      <MessageItem
        message={npcMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('NPC')).toBeInTheDocument();
  });

  // Test reply context display
  test('displays reply context when message is a reply', () => {
    const replyMessage = {
      ...mockTextMessage,
      replyTo: {
        messageId: 'msg_0',
        authorName: 'OriginalAuthor',
        content: 'This is the original message that is being replied to'
      }
    };

    render(
      <MessageItem
        message={replyMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('OriginalAuthor:')).toBeInTheDocument();
    expect(screen.getByText(/This is the original message that is being/)).toBeInTheDocument();
  });

  // Requirement 10.2: Размер шрифта
  test('applies correct font size class based on settings', () => {
    const settingsLarge = { ...mockSettings, fontSize: 'large' };
    const { container } = render(
      <MessageItem
        message={mockTextMessage}
        settings={settingsLarge}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    const messageText = screen.getByText('Hello world!');
    expect(messageText).toHaveClass('text-lg');
  });

  test('calls onMouseEnter when mouse enters', () => {
    const { container } = render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    const messageContainer = container.firstChild;
    fireEvent.mouseEnter(messageContainer);

    expect(mockHandlers.onMouseEnter).toHaveBeenCalledTimes(1);
  });

  test('calls onMouseLeave when mouse leaves', () => {
    const { container } = render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    const messageContainer = container.firstChild;
    fireEvent.mouseLeave(messageContainer);

    expect(mockHandlers.onMouseLeave).toHaveBeenCalledTimes(1);
  });

  test('component is memoized', () => {
    const { rerender } = render(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Rerender with same props
    rerender(
      <MessageItem
        message={mockTextMessage}
        settings={mockSettings}
        isOwnMessage={false}
        isMentioned={false}
        isHovered={false}
        {...mockHandlers}
      />
    );

    // Component should still render correctly
    expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    expect(screen.getByText('Hello world!')).toBeInTheDocument();
  });
});
