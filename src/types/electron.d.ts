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

export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  sender: string;
  encrypted: boolean;
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
  };
  db: {
    saveMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>;
    getMessages: (chatId: string) => Promise<Message[]>;
  };
  permission: {
    request: (permission: string) => Promise<boolean>;
  };
  debug: {
    getLogs: () => Promise<DebugLog[]>;
    clearLogs: () => Promise<void>;
    addLog: (log: Omit<DebugLog, 'timestamp'>) => Promise<void>;
    onNewLog: (callback: (log: DebugLog) => void) => void;
    onLogsCleared: (callback: () => void) => void;
  };
  transport: {
    connect: (address: string) => Promise<unknown>;
    send: (data: unknown) => Promise<unknown>;
    onMessage: (callback: (data: unknown) => void) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}