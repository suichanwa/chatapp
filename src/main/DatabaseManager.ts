import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  sender: string;
  encrypted: boolean;
  encryptedData?: {
    data: string;
    iv: string;
    authTag: string;
    sessionKey?: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  peerAddress?: string;
  peerPublicKey?: string;
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
      
      this.data.messages = new Map(Object.entries(parsed.messages || {}));
      this.data.chats = new Map(Object.entries(parsed.chats || {}));
    } catch {
      this.data = {
        messages: new Map(),
        chats: new Map()
      };
    }
  }

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const fullMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const chatMessages = this.data.messages.get(message.chatId) || [];
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
    return this.data.messages.get(chatId) || [];
  }

  async saveChat(chat: Omit<Chat, 'id'>): Promise<Chat> {
    const fullChat: Chat = {
      ...chat,
      id: crypto.randomUUID()
    };

    this.data.chats.set(fullChat.id, fullChat);
    await this.persist();
    return fullChat;
  }

  async getChats(): Promise<Chat[]> {
    return Array.from(this.data.chats.values());
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    const existingChat = this.data.chats.get(chatId);
    if (!existingChat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }

    const updatedChat = { ...existingChat, ...updates };
    this.data.chats.set(chatId, updatedChat);
    await this.persist();
    return updatedChat;
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
    const dataObject = {
      messages: Object.fromEntries(this.data.messages),
      chats: Object.fromEntries(this.data.chats)
    };
    await fs.writeFile(this.dbPath, JSON.stringify(dataObject, null, 2));
  }
}