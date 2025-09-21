import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export interface ImageData {
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  data: string; // Base64 encoded
  thumbnail?: string; // Base64 encoded thumbnail
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  sender: string;
  encrypted: boolean;
  type: 'text' | 'image' | 'system'; // Add message type
  encryptedData?: {
    data: string;
    iv: string;
    authTag: string;
    sessionKey?: string;
  };
  imageData?: ImageData;
  replyTo?: string; // For replies
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  peerAddress?: string;
  peerPublicKey?: string;
  type: 'direct' | 'saved'; // Add chat type
  isOnline?: boolean;
}

export class DatabaseManager {
  private dbPath: string;
  private data: {
    messages: Map<string, Message[]>;
    chats: Map<string, Chat>;
  } = {
    messages: new Map(),
    chats: new Map()
  };

  constructor() {
    this.dbPath = path.join(os.tmpdir(), 'secure-chat-db.json');
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Convert plain objects back to Maps with proper data structure
      if (parsed.messages) {
        for (const [chatId, messages] of Object.entries(parsed.messages)) {
          if (Array.isArray(messages)) {
            // Ensure all messages have the required type field
            const typedMessages = (messages as any[]).map(msg => ({
              ...msg,
              type: msg.type || 'text' // Default to 'text' if missing
            }));
            this.data.messages.set(chatId, typedMessages);
          }
        }
      }
      
      if (parsed.chats) {
        for (const [chatId, chat] of Object.entries(parsed.chats)) {
          // Ensure all chats have the required type field
          const typedChat = {
            ...chat as Chat,
            type: (chat as any).type || 'direct' // Default to 'direct' if missing
          };
          this.data.chats.set(chatId, typedChat);
        }
      }
    } catch (error) {
      console.warn('Failed to load database, starting fresh:', error);
      this.data = {
        messages: new Map(),
        chats: new Map()
      };
    }
  }

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    // De-dup consecutive identical messages within a short window
    const now = Date.now();
    const chatMessages = this.data.messages.get(message.chatId) || [];
    const last = chatMessages[chatMessages.length - 1];

    const isSameImage =
      (!!last?.imageData?.data === !!message.imageData?.data) &&
      (!last?.imageData?.data ||
        (last.imageData!.data === message.imageData!.data &&
         (last.imageData!.mimeType === message.imageData!.mimeType)));

    const isDuplicate =
      !!last &&
      last.sender === message.sender &&
      (last.type || 'text') === (message.type || 'text') &&
      (last.content || '') === (message.content || '') &&
      isSameImage &&
      Math.abs(now - (last.timestamp || now)) <= 1500;

    if (isDuplicate) {
      // Skip persisting duplicate; return the last message to keep API stable
      return { ...last, type: last.type || 'text' };
    }

    const fullMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: now,
      type: message.type || 'text', // Ensure type is set with default
    };

    chatMessages.push(fullMessage);
    this.data.messages.set(message.chatId, chatMessages);

    // Update chat's last message
    const chat = this.data.chats.get(message.chatId);
    if (chat) {
      chat.lastMessage = fullMessage;
      this.data.chats.set(message.chatId, chat);
    }

    await this.persist();
    return fullMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const messages = this.data.messages.get(chatId) || [];
    
    // Ensure all messages have the type field
    return messages.map(message => ({
      ...message,
      type: message.type || 'text'
    }));
  }

  async saveChat(chat: Omit<Chat, 'id'>): Promise<Chat> {
    const fullChat: Chat = {
      ...chat,
      id: crypto.randomUUID(),
      type: chat.type || 'direct', // Ensure type is set with default
    };

    this.data.chats.set(fullChat.id, fullChat);
    await this.persist();
    return fullChat;
  }

  async getChats(): Promise<Chat[]> {
    const chats = Array.from(this.data.chats.values());
    
    // Ensure all chats have the type field
    return chats.map(chat => ({
      ...chat,
      type: chat.type || 'direct'
    }));
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    const existingChat = this.data.chats.get(chatId);
    if (!existingChat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }

    const updatedChat: Chat = { 
      ...existingChat, 
      ...updates,
      type: updates.type || existingChat.type || 'direct' // Preserve or set type
    };
    
    this.data.chats.set(chatId, updatedChat);
    await this.persist();
    return updatedChat;
  }

  // New method to get message by ID
  async getMessageById(messageId: string): Promise<Message | null> {
    for (const messages of this.data.messages.values()) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        return {
          ...message,
          type: message.type || 'text'
        };
      }
    }
    return null;
  }

  // New method to delete a message
  async deleteMessage(messageId: string): Promise<boolean> {
    for (const [chatId, messages] of this.data.messages.entries()) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        this.data.messages.set(chatId, messages);
        
        // Update chat's last message if this was the last message
        const chat = this.data.chats.get(chatId);
        if (chat && chat.lastMessage?.id === messageId) {
          chat.lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          this.data.chats.set(chatId, chat);
        }
        
        await this.persist();
        return true;
      }
    }
    return false;
  }

  // New method to delete a chat and all its messages
  async deleteChat(chatId: string): Promise<boolean> {
    const chatExists = this.data.chats.has(chatId);
    if (chatExists) {
      this.data.chats.delete(chatId);
      this.data.messages.delete(chatId);
      await this.persist();
      return true;
    }
    return false;
  }

  // New method to search messages
  async searchMessages(query: string, chatId?: string): Promise<Message[]> {
    const results: Message[] = [];
    const searchTerm = query.toLowerCase();
    
    const messagesToSearch = chatId 
      ? [this.data.messages.get(chatId) || []]
      : Array.from(this.data.messages.values());
    
    for (const messages of messagesToSearch) {
      for (const message of messages) {
        if (message.content.toLowerCase().includes(searchTerm)) {
          results.push({
            ...message,
            type: message.type || 'text'
          });
        }
      }
    }
    
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  // New method to get chat statistics
  async getChatStats(chatId: string): Promise<{
    totalMessages: number;
    messagesByType: Record<string, number>;
    lastActivity: number;
  } | null> {
    const messages = this.data.messages.get(chatId);
    if (!messages) return null;
    
    const messagesByType: Record<string, number> = {};
    let lastActivity = 0;
    
    for (const message of messages) {
      const type = message.type || 'text';
      messagesByType[type] = (messagesByType[type] || 0) + 1;
      lastActivity = Math.max(lastActivity, message.timestamp);
    }
    
    return {
      totalMessages: messages.length,
      messagesByType,
      lastActivity
    };
  }

  async cleanup(): Promise<void> {
    this.data.messages.clear();
    this.data.chats.clear();
    
    try {
      await fs.unlink(this.dbPath);
    } catch {
      // Ignore cleanup errors
    }
  }

  private async persist(): Promise<void> {
    try {
      // Ensure target directory exists
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

      const dataObject = {
        messages: Object.fromEntries(this.data.messages),
        chats: Object.fromEntries(this.data.chats),
        version: '1.0.0',
        lastUpdated: Date.now()
      };
      const json = JSON.stringify(dataObject, null, 2);

      // Unique temp file to avoid rename races on Windows
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const tempPath = `${this.dbPath}.${unique}.tmp`;

      await fs.writeFile(tempPath, json);

      try {
        // Try atomic rename
        await fs.rename(tempPath, this.dbPath);
      } catch (err: any) {
        // Fallback for ENOENT/EACCES/EPERM cases
        if (err?.code === 'ENOENT' || err?.code === 'EACCES' || err?.code === 'EPERM') {
          await fs.writeFile(this.dbPath, json);
        } else {
          throw err;
        }
      } finally {
        try { await fs.unlink(tempPath); } catch {}
      }
    } catch (error) {
      console.error('Failed to persist database:', error);
      throw error;
    }
  }
}