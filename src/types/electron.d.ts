import type { IdentityKeys, EncryptedData, Message, Chat, PeerInfo, DebugLog, ImageData } from './index';

export interface IdentityKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  authTag: string;
  sessionKey?: string;
}

export interface ImageData {
  filename: string;
  mimeType: string;
  size: number;
  data: string; 
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  sender: string;
  encrypted: boolean;
  encryptedData?: EncryptedData;
  imageData?: ImageData;
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  peerAddress?: string; // For P2P connection
  peerPublicKey?: string; // For encryption
}

export interface PeerInfo {
  id: string;
  name: string;
  publicKey: string;
  address: string;
  status?: 'online' | 'offline' | 'connecting';
}

export interface DebugLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: unknown;
}

export interface ElectronAPI {
  crypto: {
    generateIdentity: () => Promise<IdentityKeys>;
    encrypt: (data: string, publicKey: string) => Promise<EncryptedData>;
    decrypt: (encryptedData: EncryptedData) => Promise<string>;
    getPublicKey: () => Promise<string | null>;
  };
  db: {
    saveMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>;
    getMessages: (chatId: string) => Promise<Message[]>;
    saveChat: (chat: Omit<Chat, 'id'>) => Promise<Chat>;
    getChats: () => Promise<Chat[]>;
    updateChat: (chatId: string, updates: Partial<Chat>) => Promise<Chat>;
  };
  permission: {
    request: (permission: string) => Promise<boolean>;
    check: (permission: string) => Promise<boolean>;
    getStats: () => Promise<{granted: string[], denied: string[], trusted: string[]}>;
    addTrustedOrigin: (origin: string) => Promise<boolean>;
    revokeAll: () => Promise<boolean>;
  };
  debug: {
    getLogs: () => Promise<DebugLog[]>;
    clearLogs: () => Promise<void>;
    addLog: (log: Omit<DebugLog, 'timestamp'>) => Promise<void>;
    onNewLog: (callback: (log: DebugLog) => void) => void;
    onLogsCleared: (callback: () => void) => void;
  };
  transport: {
    startServer: (port?: number) => Promise<{ port: number; address: string }>;
    connect: (address: string, port: number) => Promise<boolean>;
    send: (chatId: string, data: unknown) => Promise<boolean>;
    disconnect: (chatId: string) => Promise<void>;
    onMessage: (callback: (chatId: string, data: unknown) => void) => void;
    onPeerConnected: (callback: (chatId: string, peerInfo: PeerInfo) => void) => void;
    onPeerDisconnected: (callback: (chatId: string) => void) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};