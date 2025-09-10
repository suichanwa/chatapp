import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, DebugLog, IdentityKeys, EncryptedData, Message, Chat, PeerInfo } from './types/electron';

console.log('🔧 PRELOAD: Starting preload script execution...');
console.log('🔧 PRELOAD: contextBridge available:', !!contextBridge);
console.log('🔧 PRELOAD: ipcRenderer available:', !!ipcRenderer);

// Define the API that will be exposed to the renderer
const electronAPI: ElectronAPI = {
  // Crypto operations
  crypto: {
    generateIdentity: (): Promise<IdentityKeys> => {
      console.log('🔧 PRELOAD: crypto.generateIdentity called');
      return ipcRenderer.invoke('crypto:generateIdentity');
    },
    encrypt: (data: string, publicKey: string): Promise<EncryptedData> => 
      ipcRenderer.invoke('crypto:encrypt', data, publicKey),
    decrypt: (encryptedData: EncryptedData): Promise<string> => 
      ipcRenderer.invoke('crypto:decrypt', encryptedData),
    getPublicKey: (): Promise<string | null> =>
      ipcRenderer.invoke('crypto:getPublicKey'),
  },
  
  // Database operations
  db: {
    saveMessage: (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => 
      ipcRenderer.invoke('db:saveMessage', message),
    getMessages: (chatId: string): Promise<Message[]> => 
      ipcRenderer.invoke('db:getMessages', chatId),
    saveChat: (chat: Omit<Chat, 'id'>): Promise<Chat> =>
      ipcRenderer.invoke('db:saveChat', chat),
    getChats: (): Promise<Chat[]> =>
      ipcRenderer.invoke('db:getChats'),
    updateChat: (chatId: string, updates: Partial<Chat>): Promise<Chat> =>
      ipcRenderer.invoke('db:updateChat', chatId, updates),
  },

  // Permission requests
  permission: {
    request: (permission: string): Promise<boolean> => 
      ipcRenderer.invoke('permission:request', permission),
  },

  // Debug operations
  debug: {
    getLogs: (): Promise<DebugLog[]> => 
      ipcRenderer.invoke('debug:getLogs'),
    clearLogs: (): Promise<void> => 
      ipcRenderer.invoke('debug:clearLogs'),
    addLog: (log: Omit<DebugLog, 'timestamp'>): Promise<void> => 
      ipcRenderer.invoke('debug:addLog', log),
    onNewLog: (callback: (log: DebugLog) => void): void => {
      ipcRenderer.on('debug:newLog', (_, log: DebugLog) => callback(log));
    },
    onLogsCleared: (callback: () => void): void => {
      ipcRenderer.on('debug:logsCleared', () => callback());
    },
  },

  // Transport layer
  transport: {
    startServer: (port?: number): Promise<{ port: number; address: string }> =>
      ipcRenderer.invoke('transport:startServer', port),
    connect: (address: string, port: number): Promise<boolean> => 
      ipcRenderer.invoke('transport:connect', address, port),
    send: (chatId: string, data: unknown): Promise<boolean> => 
      ipcRenderer.invoke('transport:send', chatId, data),
    disconnect: (chatId: string): Promise<void> =>
      ipcRenderer.invoke('transport:disconnect', chatId),
    onMessage: (callback: (chatId: string, data: unknown) => void): void => {
      ipcRenderer.on('transport:message', (_, chatId: string, data: unknown) => callback(chatId, data));
    },
    onPeerConnected: (callback: (chatId: string, peerInfo: PeerInfo) => void): void => {
      ipcRenderer.on('transport:peerConnected', (_, chatId: string, peerInfo: PeerInfo) => callback(chatId, peerInfo));
    },
    onPeerDisconnected: (callback: (chatId: string) => void): void => {
      ipcRenderer.on('transport:peerDisconnected', (_, chatId: string) => callback(chatId));
    },
  }
};

console.log('🔧 PRELOAD: electronAPI object created:', !!electronAPI);
console.log('🔧 PRELOAD: electronAPI keys:', Object.keys(electronAPI));

try {
  // Expose the API to the renderer process
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('🔧 PRELOAD: contextBridge.exposeInMainWorld completed successfully');
} catch (error) {
  console.error('🔧 PRELOAD: Failed to expose electronAPI:', error);
}

console.log('🔧 PRELOAD: Preload script completed execution');

// Test that the API was actually exposed
setTimeout(() => {
  console.log('🔧 PRELOAD: Testing API exposure...');
  try {
    // This should work in the preload context
    console.log('🔧 PRELOAD: electronAPI still accessible:', !!electronAPI);
  } catch (error) {
    console.error('🔧 PRELOAD: Error testing API:', error);
  }
}, 100);