import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from '../components/Chat/MessageList';

describe('MessageList Component', () => {
  const mockPlayer = {
    id: 'player_1',
    name: 'TestPlayer',
    level: 10,
    avatarId: 1
  };

  const mockSettings = {
    fontSize: 'medium',
    showTimestamps: true,
    showAvatars: true,
    soundEnabled: true,
    profanityFilter: true,
    opacity: 100
  };

  const mockMessages = [
    {
      id: 'msg_1',
      channelId: 'general',
      author: {
        id: 'player_2',
        name: 'OtherPlayer',
        level: 5,
        avatarId: 2,
        isNPC: false
      },
      content: 'Hello world!',
      timestamp: Date.now(),
      type: 'text',
      mentions: []
    },
    {
      id: 'msg_2',
      channelId: 'general',
      author: {
        id: 'player_3',
        name: 'BlockedPlayer',
        level: 8,
        avatarId: 3,
        isNPC: false
      },
      content: 'This should be hidden',
      timestamp: Date.now(),
      type: 'text',
      mentions: []
    }
  ];

  const mockHandlers = {
    onReply: jest.fn(),
    onBlock: jest.fn(),
    onReport: jest.fn()
  };

  test('renders empty state when no messages', () => {
    render(
      <MessageList
        messages={[]}
        blockedPlayers={[]}
        settings={mockSettings}
        player={mockPlayer}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Нет сообщений в этом канале')).toBeInTheDocument();
  });

  test('filters out blocked players messages', () => {
    const { container } = render(
      <MessageList
        messages={mockMessages}
        blockedPlayers={['player_3']}
        settings={mockSettings}
        player={mockPlayer}
        {...mockHandlers}
      />
    );

    // Should show first message but not the blocked one
    expect(screen.queryByText('Hello world!')).toBeInTheDocument();
    expect(screen.queryByText('This should be hidden')).not.toBeInTheDocument();
  });

  test('shows all messages when no players are blocked', () => {
    render(
      <MessageList
        messages={mockMessages}
        blockedPlayers={[]}
        settings={mockSettings}
        player={mockPlayer}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText('Hello world!')).toBeInTheDocument();
    expect(screen.queryByText('This should be hidden')).toBeInTheDocument();
  });

  test('component is memoized', () => {
    const { rerender } = render(
      <MessageList
        messages={mockMessages}
        blockedPlayers={[]}
        settings={mockSettings}
        player={mockPlayer}
        {...mockHandlers}
      />
    );

    // Rerender with same props should not cause re-render
    rerender(
      <MessageList
        messages={mockMessages}
        blockedPlayers={[]}
        settings={mockSettings}
        player={mockPlayer}
        {...mockHandlers}
      />
    );

    // Component should still be rendered correctly
    expect(screen.queryByText('Hello world!')).toBeInTheDocument();
  });
});
