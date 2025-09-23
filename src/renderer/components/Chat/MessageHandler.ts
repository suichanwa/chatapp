import { EventBus } from '../Utils/EventBus';
import { ImageProcessor } from '../Utils/ImageProcessor';
import type { Component } from '../../types/components';
import type { Message, ImageData } from '../../../types/index';

export class MessageHandler implements Component {
  private eventBus = EventBus.getInstance();
  private imageProcessor: ImageProcessor;
  private bound = false;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async initialize(): Promise<void> {
    await this.imageProcessor.initialize();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.bound) return;
    this.bound = true;
    this.eventBus.on('message:received', this.handleIncomingMessage);
  }

  private handleIncomingMessage = (data: { chatId: string; data: Record<string, unknown> }): void => {
    const { chatId, data: msg } = data;
    try {
      // Validate and sanitize
      const content = this.sanitizeText(
        typeof msg.content === 'string'
          ? msg.content
          : typeof msg.message === 'string'
            ? msg.message
            : ''
      );
      const type = this.validateType(msg.type);
      const timestamp = this.validateTimestamp(msg.timestamp);
      const encrypted = Boolean(msg.encrypted);
      const imageData = this.validateImageData(msg.imageData);

      if (!chatId || !content) return;

      const processedMessage: Partial<Message> = {
        chatId,
        content,
        sender: 'peer',
        encrypted,
        timestamp,
        type,
        imageData
      };

      this.eventBus.emit('message:processed', processedMessage);
    } catch (error) {
      // Do not leak message content in logs
      console.error('MessageHandler: Failed to process incoming message', error);
    }
  };

  async sendTextMessage(chatId: string, content: string): Promise<void> {
    if (!chatId || !content || typeof content !== 'string') throw new Error('Invalid message');
    const safeContent = this.sanitizeText(content);
    const message: Omit<Message, 'id' | 'timestamp'> = {
      chatId,
      content: safeContent,
      sender: 'me',
      encrypted: false,
      type: 'text'
    };
    try {
      const savedMessage = await window.electronAPI.db.saveMessage(message);
      this.eventBus.emit('message:sent', savedMessage);
      this.eventBus.emit('network:send', chatId, {
        content: safeContent,
        timestamp: savedMessage.timestamp,
        type: 'text'
      });
    } catch (error) {
      console.error('MessageHandler: Failed to send text message', error);
      throw error;
    }
  }

  async sendImageMessage(chatId: string, imageFile: File): Promise<void> {
    if (!chatId || !imageFile) throw new Error('Invalid image message');
    try {
      const imageData = await this.imageProcessor.processImageFile(imageFile);
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content: `📷 ${this.sanitizeText(imageData.filename)}`,
        sender: 'me',
        encrypted: false,
        type: 'image',
        imageData
      };
      const savedMessage = await window.electronAPI.db.saveMessage(message);
      this.eventBus.emit('message:sent', savedMessage);
      this.eventBus.emit('network:send', chatId, {
        content: `📷 ${this.sanitizeText(imageData.filename)}`,
        timestamp: savedMessage.timestamp,
        type: 'image',
        imageData: {
          ...imageData,
          data: imageData.thumbnail // Send thumbnail first
        }
      });
    } catch (error) {
      console.error('MessageHandler: Failed to send image message', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    return this.sendTextMessage(chatId, content);
  }

  async getMessages(chatId: string): Promise<Message[]> {
    if (!chatId) return [];
    try {
      const messages = await window.electronAPI.db.getMessages(chatId);
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      console.error('MessageHandler: Failed to get messages', error);
      return [];
    }
  }

  async forwardMessage(messageId: string, targetChatId: string): Promise<void> {
    if (!messageId || !targetChatId) throw new Error('Invalid forward');
    try {
      this.eventBus.emit('message:forward-request', { messageId, targetChatId });
    } catch (error) {
      console.error('MessageHandler: Failed to forward message', error);
      throw error;
    }
  }

  cleanup(): void {
    this.eventBus.off('message:received', this.handleIncomingMessage);
    this.imageProcessor.cleanup();
    this.bound = false;
  }

  // --- Security helpers ---

  private sanitizeText(text: string): string {
    // Basic HTML escaping
    return String(text ?? '')
      .replace(/[&<>"']/g, (ch) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch)
      )
      .slice(0, 10000); // Limit length
  }

  private validateType(type: unknown): Message['type'] {
    if (type === 'image') return 'image';
    if (type === 'system') return 'system';
    return 'text';
  }

  private validateTimestamp(ts: unknown): number {
    const n = Number(ts);
    if (Number.isFinite(n) && n > 0 && n < Date.now() + 24 * 3600 * 1000) return n;
    return Date.now();
  }

  private validateImageData(data: unknown): ImageData | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const d = data as Partial<ImageData>;
    if (
      typeof d.filename === 'string' &&
      typeof d.mimeType === 'string' &&
      typeof d.data === 'string' &&
      d.data.length < 2_000_000 // 2MB max
    ) {
      return {
        filename: this.sanitizeText(d.filename),
        mimeType: d.mimeType,
        size: typeof d.size === 'number' ? d.size : 0,
        width: typeof d.width === 'number' ? d.width : undefined,
        height: typeof d.height === 'number' ? d.height : undefined,
        data: d.data,
        thumbnail: typeof d.thumbnail === 'string' ? d.thumbnail : undefined
      };
    }
    return undefined;
  }
}