import { EventBus } from '../Utils/EventBus';
import type { Component } from '../../types/components';
import type { Chat, Message } from '../../../types/index';

export class SavedMessagesManager implements Component {
  private eventBus = EventBus.getInstance();
  private savedChatId: string | null = null; // real DB id after init

  async initialize(): Promise<void> {
    await this.ensureSavedChat();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.on('saved-messages:save', (message: Message) => this.saveMessageToSaved(message));
    this.eventBus.on('saved-messages:show', () => this.showSavedMessages());
  }

  // Create or resolve the Saved Messages chat and cache its real id
  private async ensureSavedChat(): Promise<void> {
    try {
      const existingChats = await window.electronAPI.db.getChats();

      // Find existing “saved” chat by type/name
      const existingSaved =
        existingChats.find(c => c.type === 'saved') ||
        existingChats.find(c => c.name === '💾 Saved Messages');

      if (existingSaved) {
        this.savedChatId = existingSaved.id;
        return;
      }

      // Create new Saved Messages chat (DB returns its real id)
      const savedMessagesChat: Omit<Chat, 'id'> = {
        name: '💾 Saved Messages',
        participants: ['me'],
        type: 'saved'
      };
      const created = await window.electronAPI.db.saveChat(savedMessagesChat);
      this.savedChatId = created.id;

      // Add welcome message
      const welcomeMessage: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.savedChatId,
        content:
          '👋 Welcome to Saved Messages!\n\nForward messages here to keep them handy. You can save:\n• Text messages\n• Images\n• Important notes\n\nNote: Saved messages are cleared when the app is restarted.',
        sender: 'system',
        type: 'system',
        encrypted: false
      };
      await window.electronAPI.db.saveMessage(welcomeMessage);
    } catch (error) {
      console.error('Failed to ensure Saved Messages chat:', error);
    }
  }

  private async saveMessageToSaved(originalMessage: Message): Promise<void> {
    try {
      if (!this.savedChatId) await this.ensureSavedChat();
      if (!this.savedChatId) return;

      const savedMessage: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.savedChatId,
        content: `📝 Forwarded: ${originalMessage.content}`,
        sender: 'me',
        type: originalMessage.type,
        encrypted: false,
        imageData: originalMessage.imageData,
        replyTo: originalMessage.id
      };

      const saved = await window.electronAPI.db.saveMessage(savedMessage);
      this.eventBus.emit('message:sent', saved);
      this.eventBus.emit('chat:updated', this.savedChatId);
      this.showSaveNotification();
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  private async showSavedMessages(): Promise<void> {
    if (!this.savedChatId) await this.ensureSavedChat();
    if (!this.savedChatId) return;
    this.eventBus.emit('chat:selected', this.savedChatId);
  }

  private showSaveNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = '💾 Saved to Saved Messages';
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  async getSavedMessages(): Promise<Message[]> {
    try {
      if (!this.savedChatId) await this.ensureSavedChat();
      if (!this.savedChatId) return [];
      return await window.electronAPI.db.getMessages(this.savedChatId);
    } catch (error) {
      console.error('Failed to get saved messages:', error);
      return [];
    }
  }

  cleanup(): void {
    // Optional: remove listeners if your EventBus supports .off with the same refs
  }
}