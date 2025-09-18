import { EventBus } from '../Utils/EventBus';
import { ImageProcessor } from '../Utils/ImageProcessor';
import type { Component } from '../../types/components';
import type { Message, ImageData } from '../../../types/index';

export class MessageHandler implements Component {
  private eventBus = EventBus.getInstance();
  private imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async initialize(): Promise<void> {
    await this.imageProcessor.initialize();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for incoming messages
    this.eventBus.on('message:received', (data: { chatId: string; data: Record<string, unknown> }) => {
      this.handleIncomingMessage(data.chatId, data.data);
    });
  }

  private handleIncomingMessage(chatId: string, data: Record<string, unknown>): void {
    console.log('📨 Handling incoming message:', { chatId, data });
    
    // Process the message and emit it for UI components
    const processedMessage: Partial<Message> = {
      chatId,
      content: String(data.content || data.message || 'Empty message'),
      sender: 'peer',
      encrypted: Boolean(data.encrypted),
      timestamp: Number(data.timestamp) || Date.now(),
      type: String(data.type || 'text') as 'text' | 'image',
      imageData: data.imageData as ImageData
    };

    this.eventBus.emit('message:processed', processedMessage);
  }

  async sendTextMessage(chatId: string, content: string): Promise<void> {
    try {
      // Save message to database
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content,
        sender: 'me',
        encrypted: false,
        type: 'text'
      };

      const savedMessage = await window.electronAPI.db.saveMessage(message);
      
      // Emit that message was sent
      this.eventBus.emit('message:sent', savedMessage);
      
      // Send via network
      this.eventBus.emit('network:send', chatId, {
        content,
        timestamp: savedMessage.timestamp,
        type: 'text'
      });
      
    } catch (error) {
      console.error('Failed to send text message:', error);
      throw error;
    }
  }

  async sendImageMessage(chatId: string, imageFile: File): Promise<void> {
    try {
      // Process the image
      const imageData = await this.imageProcessor.processImageFile(imageFile);
      
      // Save message to database
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content: `📷 ${imageData.filename}`,
        sender: 'me',
        encrypted: false,
        type: 'image',
        imageData
      };

      const savedMessage = await window.electronAPI.db.saveMessage(message);
      
      // Emit that message was sent
      this.eventBus.emit('message:sent', savedMessage);
      
      // Send via network (send thumbnail for faster transmission)
      this.eventBus.emit('network:send', chatId, {
        content: `📷 ${imageData.filename}`,
        timestamp: savedMessage.timestamp,
        type: 'image',
        imageData: {
          ...imageData,
          data: imageData.thumbnail // Send thumbnail first, full image on request
        }
      });
      
    } catch (error) {
      console.error('Failed to send image message:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    return this.sendTextMessage(chatId, content);
  }

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      return await window.electronAPI.db.getMessages(chatId);
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  async forwardMessage(messageId: string, targetChatId: string): Promise<void> {
    try {
      // This would require getting the original message first
      // For now, we'll emit an event for the UI to handle
      this.eventBus.emit('message:forward-request', { messageId, targetChatId });
    } catch (error) {
      console.error('Failed to forward message:', error);
      throw error;
    }
  }

  cleanup(): void {
    // Clean up event listeners
    this.eventBus.off('message:received', this.handleIncomingMessage.bind(this));
    this.imageProcessor.cleanup();
  }
}