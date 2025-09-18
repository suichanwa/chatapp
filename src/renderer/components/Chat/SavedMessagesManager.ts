import { EventBus } from '../Utils/EventBus';
import type { Component } from '../../types/components';
import type { Chat, Message } from '../../../types/index';

export class SavedMessagesManager implements Component {
  private eventBus = EventBus.getInstance();
  private savedChatId = 'saved-messages';

  async initialize(): Promise<void> {
    await this.createSavedMessagesChat();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for save message requests
    this.eventBus.on('saved-messages:save', (message: Message) => {
      this.saveMessageToSaved(message);
    });

    // Listen for saved messages requests
    this.eventBus.on('saved-messages:show', () => {
      this.showSavedMessages();
    });
  }

  private async createSavedMessagesChat(): Promise<void> {
    try {
      const existingChats = await window.electronAPI.db.getChats();
      const savedChat = existingChats.find(chat => chat.id === this.savedChatId);
      
      if (!savedChat) {
        const savedMessagesChat: Omit<Chat, 'id'> = {
          name: '💾 Saved Messages',
          participants: ['me'],
          type: 'saved'
        };
        
        await window.electronAPI.db.saveChat({ 
          ...savedMessagesChat, 
          id: this.savedChatId 
        } as any);
        
        // Add welcome message
        const welcomeMessage: Omit<Message, 'id' | 'timestamp'> = {
          chatId: this.savedChatId,
          content: '👋 Welcome to Saved Messages!\n\nForward messages here to keep them handy. You can save:\n• Text messages\n• Images\n• Important notes\n\nNote: Saved messages are cleared when the app is restarted.',
          sender: 'system',
          type: 'system',
          encrypted: false
        };
        
        await window.electronAPI.db.saveMessage(welcomeMessage);
        
        console.log('💾 Created Saved Messages chat');
      }
    } catch (error) {
      console.error('Failed to create Saved Messages chat:', error);
    }
  }

  private async saveMessageToSaved(originalMessage: Message): Promise<void> {
    try {
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
      
      // Show notification
      this.showSaveNotification();
      
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  private showSavedMessages(): void {
    this.eventBus.emit('chat:selected', this.savedChatId);
  }

  private showSaveNotification(): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = '💾 Saved to Saved Messages';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  async getSavedMessages(): Promise<Message[]> {
    try {
      return await window.electronAPI.db.getMessages(this.savedChatId);
    } catch (error) {
      console.error('Failed to get saved messages:', error);
      return [];
    }
  }

  cleanup(): void {
    this.eventBus.off('saved-messages:save', this.saveMessageToSaved.bind(this));
    this.eventBus.off('saved-messages:show', this.showSavedMessages.bind(this));
  }
}