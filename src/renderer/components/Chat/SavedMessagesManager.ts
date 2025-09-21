import { EventBus } from '../Utils/EventBus';
import type { Component } from '../../types/components';
import type { Chat, Message } from '../../../types/index';

export class SavedMessagesManager implements Component {
  private eventBus = EventBus.getInstance();
  private savedChatId: string | null = null; // real DB id after init

  async initialize(): Promise<void> {
    await this.ensureSavedChat();
    this.setupEventListeners();
    this.injectStyles();
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById('saved-messages-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'saved-messages-styles';
    style.textContent = `
      /* Save Message Notification */
      .save-notification {
        position: fixed;
        top: 20px;
        right: -300px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 
          0 8px 32px rgba(40, 167, 69, 0.3),
          0 2px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(40, 167, 69, 0.4);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 280px;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform: translateX(0);
      }

      .save-notification::before {
        content: 'bookmark_added';
        font-family: 'Material Icons';
        font-size: 1.3rem;
        flex-shrink: 0;
        animation: pulse 2s ease-in-out infinite;
      }

      .save-notification.show {
        right: 20px;
        transform: translateX(0) scale(1);
      }

      .save-notification.hide {
        right: -300px;
        transform: translateX(20px) scale(0.95);
        opacity: 0;
      }

      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1);
        }
        50% { 
          opacity: 0.8; 
          transform: scale(1.05);
        }
      }

      /* Saved Messages Button Styles */
      .save-message-btn {
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.3);
        color: #28a745;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 32px;
      }

      .save-message-btn::before {
        content: 'bookmark_border';
        font-family: 'Material Icons';
        font-size: 0.9rem;
      }

      .save-message-btn:hover {
        background: rgba(40, 167, 69, 0.2);
        border-color: rgba(40, 167, 69, 0.5);
        color: #20c997;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
      }

      .save-message-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(40, 167, 69, 0.2);
      }

      /* Saved Messages Chat Indicator */
      .chat-item[data-chat-type="saved"] {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.05) 100%);
        border: 1px solid rgba(40, 167, 69, 0.2);
      }

      .chat-item[data-chat-type="saved"] .chat-name::before {
        content: 'bookmark';
        font-family: 'Material Icons';
        font-size: 1.1rem;
        margin-right: 0.5rem;
        color: #28a745;
      }

      .chat-item[data-chat-type="saved"]:hover {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(32, 201, 151, 0.08) 100%);
        border-color: rgba(40, 167, 69, 0.3);
      }

      .chat-item[data-chat-type="saved"].active {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(32, 201, 151, 0.1) 100%);
        border-color: #28a745;
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
      }

      /* Saved Messages Welcome Styles */
      .saved-messages-welcome {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.05) 100%);
        border: 1px solid rgba(40, 167, 69, 0.2);
        border-radius: 12px;
        padding: 2rem;
        margin: 1rem 0;
        text-align: center;
      }

      .saved-messages-welcome h3 {
        color: #28a745;
        font-size: 1.3rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .saved-messages-welcome h3::before {
        content: 'bookmark_added';
        font-family: 'Material Icons';
        font-size: 1.5rem;
      }

      .saved-messages-welcome p {
        color: #ccc;
        line-height: 1.6;
        margin-bottom: 0.75rem;
      }

      .saved-messages-welcome ul {
        text-align: left;
        color: #ddd;
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .saved-messages-welcome li {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .saved-messages-welcome li::before {
        font-family: 'Material Icons';
        font-size: 1rem;
        color: #28a745;
      }

      .saved-messages-welcome li:nth-child(1)::before { content: 'message'; }
      .saved-messages-welcome li:nth-child(2)::before { content: 'image'; }
      .saved-messages-welcome li:nth-child(3)::before { content: 'note'; }

      /* Forwarded Message Indicator */
      .message.forwarded {
        position: relative;
        border-left: 3px solid #28a745;
        padding-left: 1rem;
      }

      .message.forwarded::before {
        content: 'reply';
        font-family: 'Material Icons';
        position: absolute;
        left: -2px;
        top: 0.5rem;
        font-size: 0.8rem;
        color: #28a745;
        background: var(--bg);
        padding: 2px;
        border-radius: 50%;
      }

      .forwarded-prefix {
        color: #28a745;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .forwarded-prefix::before {
        content: 'forward';
        font-family: 'Material Icons';
        font-size: 0.9rem;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .save-notification {
          right: -280px;
          min-width: 260px;
          top: 80px;
        }

        .save-notification.show {
          right: 10px;
        }

        .save-message-btn {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          min-height: 28px;
        }

        .saved-messages-welcome {
          padding: 1.5rem;
          margin: 0.5rem 0;
        }
      }

      /* Dark theme enhancements */
      @media (prefers-color-scheme: dark) {
        .save-notification {
          background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%);
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .save-message-btn {
          border-width: 2px;
        }

        .chat-item[data-chat-type="saved"] {
          border-width: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .save-notification {
          transition: opacity 0.2s ease;
        }

        .save-notification::before {
          animation: none;
        }

        .save-message-btn {
          transition: none;
        }

        .save-message-btn:hover {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    this.eventBus.on('saved-messages:save', (message: Message) => this.saveMessageToSaved(message));
    this.eventBus.on('saved-messages:show', () => this.showSavedMessages());
  }

  // Create or resolve the Saved Messages chat and cache its real id
  private async ensureSavedChat(): Promise<void> {
    try {
      const existingChats = await window.electronAPI.db.getChats();

      // Find existing "saved" chat by type/name
      const existingSaved =
        existingChats.find(c => c.type === 'saved') ||
        existingChats.find(c => c.name.includes('Saved Messages'));

      if (existingSaved) {
        this.savedChatId = existingSaved.id;
        return;
      }

      // Create new Saved Messages chat (DB returns its real id)
      const savedMessagesChat: Omit<Chat, 'id'> = {
        name: 'Saved Messages',
        participants: ['me'],
        type: 'saved'
      };
      const created = await window.electronAPI.db.saveChat(savedMessagesChat);
      this.savedChatId = created.id;

      // Add enhanced welcome message
      const welcomeMessage: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.savedChatId,
        content: this.getWelcomeMessage(),
        sender: 'system',
        type: 'system',
        encrypted: false
      };
      await window.electronAPI.db.saveMessage(welcomeMessage);
    } catch (error) {
      console.error('Failed to ensure Saved Messages chat:', error);
    }
  }

  private getWelcomeMessage(): string {
    return `<div class="saved-messages-welcome">
      <h3>Welcome to Saved Messages!</h3>
      <p>Forward messages here to keep them handy. Perfect for:</p>
      <ul>
        <li>Text messages</li>
        <li>Images and media</li>
        <li>Important notes</li>
      </ul>
      <p><strong>Tip:</strong> Use the bookmark button next to messages to save them here instantly.</p>
    </div>`;
  }

  private async saveMessageToSaved(originalMessage: Message): Promise<void> {
    try {
      if (!this.savedChatId) await this.ensureSavedChat();
      if (!this.savedChatId) return;

      // Create more descriptive forwarded message
      const forwardedContent = this.formatForwardedMessage(originalMessage);

      const savedMessage: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.savedChatId,
        content: forwardedContent,
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
      this.showErrorNotification('Failed to save message');
    }
  }

  private formatForwardedMessage(message: Message): string {
    const timestamp = new Date(message.timestamp).toLocaleString();
    const senderLabel = message.sender === 'me' ? 'You' : 'Peer';
    
    if (message.type === 'image') {
      return `<div class="forwarded-prefix">Forwarded ${message.type} from ${senderLabel} • ${timestamp}</div>${message.content}`;
    }
    
    return `<div class="forwarded-prefix">Forwarded from ${senderLabel} • ${timestamp}</div>${message.content}`;
  }

  private async showSavedMessages(): Promise<void> {
    if (!this.savedChatId) await this.ensureSavedChat();
    if (!this.savedChatId) return;
    this.eventBus.emit('chat:selected', this.savedChatId);
  }

  private showSaveNotification(): void {
    // Remove any existing notifications
    const existing = document.querySelectorAll('.save-notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = 'Saved to Saved Messages';
    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Hide notification
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 3000);
  }

  private showErrorNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'save-notification error';
    notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    notification.innerHTML = `<span class="material-icons">error</span>${message}`;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 4000);
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

  public getSavedChatId(): string | null {
    return this.savedChatId;
  }

  cleanup(): void {
    // Remove injected styles
    const styleEl = document.getElementById('saved-messages-styles');
    if (styleEl) styleEl.remove();

    // Remove any active notifications
    const notifications = document.querySelectorAll('.save-notification');
    notifications.forEach(n => n.remove());

    // Clean up event listeners
    this.eventBus.off('saved-messages:save');
    this.eventBus.off('saved-messages:show');
  }
}