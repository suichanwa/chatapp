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

  // Enhanced Permission system
  permission: {
    request: (permission: string): Promise<boolean> => 
      ipcRenderer.invoke('permission:request', permission),
    check: (permission: string): Promise<boolean> =>
      ipcRenderer.invoke('permission:check', permission),
    getStats: (): Promise<{granted: string[], denied: string[], trusted: string[]}> =>
      ipcRenderer.invoke('permission:getStats'),
    addTrustedOrigin: (origin: string): Promise<boolean> =>
      ipcRenderer.invoke('permission:addTrustedOrigin', origin),
    revokeAll: (): Promise<boolean> =>
      ipcRenderer.invoke('permission:revokeAll'),
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
    onMessage: (cb: (chatId: string, data: any) => void) => {
      ipcRenderer.on('transport:message', (_e, chatId, data) => cb(chatId, data));
    },

    // ADD: peer connection events so ChatApp.setupEventListeners works
    onPeerConnected: (cb: (chatId: string, peerInfo: any) => void) => {
      ipcRenderer.on('transport:peerConnected', (_e, chatId, peerInfo) => cb(chatId, peerInfo));
    },
    onPeerDisconnected: (cb: (chatId: string) => void) => {
      ipcRenderer.on('transport:peerDisconnected', (_e, chatId) => cb(chatId));
    },

    // Signals (typing/read)
    sendSignal: (chatId: string, data: { action: 'typing' | 'stop_typing' | 'read'; lastSeenTs?: number }): Promise<boolean> =>
      ipcRenderer.invoke('transport:signal', chatId, data),
    onSignal: (cb: (chatId: string, data: any) => void) => {
      ipcRenderer.on('transport:signal', (_e, chatId, data) => cb(chatId, data));
    },
  },

  clipboard: {
    writeText: (text: string): Promise<boolean> =>
      ipcRenderer.invoke('clipboard:writeText', text),
    readText: (): Promise<string> =>
      ipcRenderer.invoke('clipboard:readText'),
  },

  secureClipboard: {
    writeText: (text: string, opts?: { ttlMs?: number }): Promise<boolean> =>
      ipcRenderer.invoke('secureClipboard:write', text, opts?.ttlMs),
    readText: (): Promise<string> =>
      ipcRenderer.invoke('secureClipboard:read'),
    clear: (): Promise<boolean> =>
      ipcRenderer.invoke('secureClipboard:clear'),
  },
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