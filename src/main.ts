import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Core modules
import { WindowManager } from './main/WindowManager';
import { CryptoEngine } from './main/CryptoEngine';
import { DatabaseManager } from './main/DatabaseManager';
import { KeyStore } from './main/KeyStore';
import { PermissionBroker } from './main/PermissionBroker';
import { DebugManager } from './main/DebugManager';
import { TransportManager } from './main/TransportManager';
import { secureClipboard } from './main/SecureClipboard';

if (started) {
  app.quit();
}

class ChatApp {
  private windowManager: WindowManager;
  private cryptoEngine: CryptoEngine;
  private databaseManager: DatabaseManager;
  private keyStore: KeyStore;
  private permissionBroker: PermissionBroker;
  private debugManager: DebugManager;
  private transportManager: TransportManager;

  constructor() {
    this.debugManager = new DebugManager();
    this.keyStore = new KeyStore();
    this.cryptoEngine = new CryptoEngine(this.keyStore);
    this.databaseManager = new DatabaseManager();
    this.permissionBroker = new PermissionBroker();
    this.windowManager = new WindowManager();
    this.transportManager = new TransportManager();
  }

  async initialize() {
    this.debugManager.info('ChatApp', 'Starting initialization...');
    
    try {
      await this.keyStore.initialize();
      this.debugManager.info('KeyStore', 'Initialized successfully');
      
      await this.databaseManager.initialize();
      this.debugManager.info('DatabaseManager', 'Initialized successfully');
      
      await this.cryptoEngine.initialize();
      this.debugManager.info('CryptoEngine', 'Initialized successfully');
      
      this.setupIPC();
      this.debugManager.info('ChatApp', 'IPC handlers registered');
      
      this.debugManager.info('ChatApp', 'Initialization completed successfully');
    } catch (error) {
      this.debugManager.error('ChatApp', 'Initialization failed', error);
      throw error;
    }
  }

  private setupIPC() {
    // Crypto IPC handlers
    ipcMain.handle('crypto:generateIdentity', async () => {
      this.debugManager.info('CryptoEngine', 'Generating identity keys...');
      try {
        const identity = await this.cryptoEngine.generateIdentity();
        this.debugManager.info('CryptoEngine', 'Identity keys generated successfully');
        return identity;
      } catch (error) {
        this.debugManager.error('CryptoEngine', 'Failed to generate identity', error);
        throw error;
      }
    });

    ipcMain.handle('crypto:encrypt', (_, data, publicKey) => 
      this.cryptoEngine.encrypt(data, publicKey));
    ipcMain.handle('crypto:decrypt', (_, encryptedData) => 
      this.cryptoEngine.decrypt(encryptedData));
    ipcMain.handle('crypto:getPublicKey', () => 
      this.cryptoEngine.getPublicKey());

    // Database IPC handlers
    ipcMain.handle('db:saveMessage', (_, message) => 
      this.databaseManager.saveMessage(message));
    ipcMain.handle('db:getMessages', (_, chatId) => 
      this.databaseManager.getMessages(chatId));
    ipcMain.handle('db:saveChat', (_, chat) => 
      this.databaseManager.saveChat(chat));
    ipcMain.handle('db:getChats', () => 
      this.databaseManager.getChats());
    ipcMain.handle('db:updateChat', (_, chatId, updates) => 
      this.databaseManager.updateChat(chatId, updates));

    // Permission IPC handlers
    ipcMain.handle('permission:request', (_, permission) => 
      this.permissionBroker.request(permission));

    // Clipboard (system)
    ipcMain.handle('clipboard:writeText', (_e, text: string) => {
      clipboard.writeText(text ?? '');
      return true;
    });
    ipcMain.handle('clipboard:readText', () => clipboard.readText());

    // Secure clipboard (in-app only)
    ipcMain.handle('secureClipboard:write', (_e, text: string, ttlMs?: number) => {
      secureClipboard.write(text ?? '', typeof ttlMs === 'number' ? ttlMs : 120_000);
      return true;
    });
    ipcMain.handle('secureClipboard:read', () => secureClipboard.read());
    ipcMain.handle('secureClipboard:clear', () => {
      secureClipboard.clear();
      return true;
    });
  }

  createWindow() {
    this.debugManager.info('WindowManager', 'Creating main window...');
    // Fix: Call the correct method name
    return this.windowManager.createWindow();
  }

  async cleanup() {
    this.debugManager.info('ChatApp', 'Starting cleanup...');
    await this.databaseManager.cleanup();
    await this.keyStore.cleanup();
    await this.transportManager.cleanup();
    this.debugManager.info('ChatApp', 'Cleanup completed');
  }
}

const chatApp = new ChatApp();

app.on('ready', async () => {
  await chatApp.initialize();
  chatApp.createWindow();
});

app.on('window-all-closed', async () => {
  await chatApp.cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    chatApp.createWindow();
  }
});

app.on('before-quit', async () => {
  await chatApp.cleanup();
});