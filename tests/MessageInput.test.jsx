import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageInput from '../components/Chat/MessageInput.jsx';
import { MAX_MESSAGE_LENGTH } from '../constants/chatConstants.js';

describe('MessageInput Component', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnOpenEmoji = jest.fn();
  const mockOnOpenSticker = jest.fn();
  const mockOnCommand = jest.fn();
  const mockOnCancelReply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders input field with placeholder', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      expect(input).toBeInTheDocument();
    });

    test('renders emoji and sticker buttons', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const emojiButton = screen.getByTitle('Эмодзи');
      const stickerButton = screen.getByTitle('Стикеры');
      
      expect(emojiButton).toBeInTheDocument();
      expect(stickerButton).toBeInTheDocument();
    });

    test('renders send button', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const sendButton = screen.getByTitle('Отправить');
      expect(sendButton).toBeInTheDocument();
    });

    test('renders character counter', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      expect(screen.getByText(`0/${MAX_MESSAGE_LENGTH}`)).toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    test('updates character counter when typing', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(screen.getByText(`5/${MAX_MESSAGE_LENGTH}`)).toBeInTheDocument();
    });

    test('allows input up to MAX_MESSAGE_LENGTH characters', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const maxLengthMessage = 'a'.repeat(MAX_MESSAGE_LENGTH);
      
      fireEvent.change(input, { target: { value: maxLengthMessage } });

      expect(input.value).toBe(maxLengthMessage);
      expect(screen.getByText(`${MAX_MESSAGE_LENGTH}/${MAX_MESSAGE_LENGTH}`)).toBeInTheDocument();
    });

    test('prevents input beyond MAX_MESSAGE_LENGTH characters', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const tooLongMessage = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
      
      fireEvent.change(input, { target: { value: tooLongMessage } });

      // Should only accept MAX_MESSAGE_LENGTH characters
      expect(input.value.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    });
  });

  describe('Message Sending', () => {
    test('sends message when send button is clicked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const sendButton = screen.getByTitle('Отправить');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
      expect(input.value).toBe(''); // Input should be cleared
    });

    test('sends message when Enter key is pressed', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
      expect(input.value).toBe('');
    });

    test('does not send message when Shift+Enter is pressed', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    test('does not send empty message', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const sendButton = screen.getByTitle('Отправить');
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    test('does not send message with only whitespace', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const sendButton = screen.getByTitle('Отправить');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    test('send button is disabled when input is empty', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const sendButton = screen.getByTitle('Отправить');
      expect(sendButton).toBeDisabled();
    });

    test('send button is enabled when input has text', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const sendButton = screen.getByTitle('Отправить');

      fireEvent.change(input, { target: { value: 'Test' } });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Cooldown', () => {
    test('displays cooldown time in placeholder', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      expect(screen.getByPlaceholderText('Подождите 3с...')).toBeInTheDocument();
    });

    test('displays cooldown time on send button', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={2}
        />
      );

      expect(screen.getByText('2s')).toBeInTheDocument();
    });

    test('disables input during cooldown', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      const input = screen.getByPlaceholderText('Подождите 3с...');
      expect(input).toBeDisabled();
    });

    test('disables send button during cooldown', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      const sendButton = screen.getByTitle('Кулдаун: 3с');
      expect(sendButton).toBeDisabled();
    });

    test('does not send message during cooldown', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      const sendButton = screen.getByTitle('Кулдаун: 3с');
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Spam Block', () => {
    test('displays spam block message in placeholder', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          spamBlocked={true}
        />
      );

      expect(screen.getByPlaceholderText('Заблокировано за спам...')).toBeInTheDocument();
    });

    test('disables input when spam blocked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          spamBlocked={true}
        />
      );

      const input = screen.getByPlaceholderText('Заблокировано за спам...');
      expect(input).toBeDisabled();
    });

    test('disables send button when spam blocked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          spamBlocked={true}
        />
      );

      const sendButton = screen.getByTitle('Отправить');
      expect(sendButton).toBeDisabled();
    });

    test('does not send message when spam blocked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          spamBlocked={true}
        />
      );

      const sendButton = screen.getByTitle('Отправить');
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Reply Functionality', () => {
    const mockReplyTo = {
      messageId: 'msg123',
      authorName: 'TestUser',
      content: 'Original message'
    };

    test('displays reply indicator when replyTo is set', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          replyTo={mockReplyTo}
          onCancelReply={mockOnCancelReply}
        />
      );

      expect(screen.getByText('Ответ на:')).toBeInTheDocument();
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('Original message')).toBeInTheDocument();
    });

    test('calls onCancelReply when cancel button is clicked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          replyTo={mockReplyTo}
          onCancelReply={mockOnCancelReply}
        />
      );

      const cancelButton = screen.getByTitle('Отменить ответ');
      fireEvent.click(cancelButton);

      expect(mockOnCancelReply).toHaveBeenCalled();
    });

    test('sends message with replyTo when replying', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          replyTo={mockReplyTo}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const sendButton = screen.getByTitle('Отправить');

      fireEvent.change(input, { target: { value: 'Reply message' } });
      fireEvent.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith('Reply message', mockReplyTo);
    });
  });

  describe('Command Autocomplete', () => {
    test('shows command suggestions when typing /', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: '/h' } });

      expect(screen.getByText('/help')).toBeInTheDocument();
    });

    test('filters commands based on input', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: '/help' } });

      expect(screen.getByText('/help')).toBeInTheDocument();
      expect(screen.queryByText('/clear')).not.toBeInTheDocument();
    });

    test('selects command when clicked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: '/h' } });

      const helpCommand = screen.getByText('/help');
      fireEvent.click(helpCommand);

      expect(input.value).toBe('/help');
    });

    test('hides suggestions when not typing command', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: 'regular message' } });

      expect(screen.queryByText('/help')).not.toBeInTheDocument();
    });

    test('calls onCommand when sending a command', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          onCommand={mockOnCommand}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      const sendButton = screen.getByTitle('Отправить');

      fireEvent.change(input, { target: { value: '/help' } });
      fireEvent.click(sendButton);

      expect(mockOnCommand).toHaveBeenCalledWith('/help');
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Button Interactions', () => {
    test('calls onOpenEmoji when emoji button is clicked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const emojiButton = screen.getByTitle('Эмодзи');
      fireEvent.click(emojiButton);

      expect(mockOnOpenEmoji).toHaveBeenCalled();
    });

    test('calls onOpenSticker when sticker button is clicked', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const stickerButton = screen.getByTitle('Стикеры');
      fireEvent.click(stickerButton);

      expect(mockOnOpenSticker).toHaveBeenCalled();
    });

    test('disables emoji button during cooldown', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      const emojiButton = screen.getByTitle('Эмодзи');
      expect(emojiButton).toBeDisabled();
    });

    test('disables sticker button during cooldown', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
          cooldownRemaining={3}
        />
      );

      const stickerButton = screen.getByTitle('Стикеры');
      expect(stickerButton).toBeDisabled();
    });
  });

  describe('Character Counter Color', () => {
    test('shows normal color when under 90% of limit', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: 'a'.repeat(400) } });

      const counter = screen.getByText(`400/${MAX_MESSAGE_LENGTH}`);
      expect(counter).toHaveClass('text-slate-500');
    });

    test('shows warning color when at 90-99% of limit', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: 'a'.repeat(450) } });

      const counter = screen.getByText(`450/${MAX_MESSAGE_LENGTH}`);
      expect(counter).toHaveClass('text-yellow-500');
    });

    test('shows error color when at 100% of limit', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onOpenEmoji={mockOnOpenEmoji}
          onOpenSticker={mockOnOpenSticker}
        />
      );

      const input = screen.getByPlaceholderText('Введите сообщение...');
      fireEvent.change(input, { target: { value: 'a'.repeat(MAX_MESSAGE_LENGTH) } });

      const counter = screen.getByText(`${MAX_MESSAGE_LENGTH}/${MAX_MESSAGE_LENGTH}`);
      expect(counter).toHaveClass('text-red-500');
    });
  });
});
