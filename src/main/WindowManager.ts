import { BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  createMainWindow(): BrowserWindow {
    // For Electron Forge + Vite, the preload should be in the same directory as main.js
    const preloadPath = path.join(__dirname, 'preload.js');

    // Enhanced debugging
    console.log('🔧 WindowManager: NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 WindowManager: __dirname:', __dirname);
    console.log('🔧 WindowManager: process.cwd():', process.cwd());
    console.log('🔧 WindowManager: Using preload path:', preloadPath);
    
    // Check if the file exists and its details
    const preloadExists = fs.existsSync(preloadPath);
    console.log('🔧 WindowManager: Preload file exists:', preloadExists);
    
    if (preloadExists) {
      const stats = fs.statSync(preloadPath);
      console.log('🔧 WindowManager: Preload file size:', stats.size, 'bytes');
      
      // Read and log the first 200 characters to verify it's the right file
      try {
        const content = fs.readFileSync(preloadPath, 'utf8');
        console.log('🔧 WindowManager: Preload content preview:', content.substring(0, 200) + '...');
        
        // Check if it contains our expected preload code
        const hasExpectedCode = content.includes('🔧 PRELOAD: Starting preload script execution');
        console.log('🔧 WindowManager: Contains expected preload code:', hasExpectedCode);
      } catch (err) {
        console.error('🔧 WindowManager: Could not read preload file:', err);
      }
    } else {
      // Try to find preload in other possible locations
      const possiblePaths = [
        path.join(__dirname, '..', 'preload.js'),
        path.join(process.cwd(), '.vite', 'build', 'preload.js'),
        path.join(__dirname, '..', '..', 'preload.js'),
      ];
      
      console.log('🔧 WindowManager: Preload not found, checking alternative paths:');
      for (const altPath of possiblePaths) {
        const exists = fs.existsSync(altPath);
        console.log(`  ${altPath}: ${exists}`);
        if (exists) {
          const stats = fs.statSync(altPath);
          console.log(`    Size: ${stats.size} bytes`);
        }
      }
    }

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: preloadPath,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        // Add sandbox: false temporarily for debugging
        sandbox: false,
      },
      titleBarStyle: 'hiddenInset',
      show: false,
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      console.log('🔧 WindowManager: Window is now visible');
    });

    // Security: Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    // Security: Prevent navigation to external URLs
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    });

    // Enable DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    // Enhanced event logging
    this.mainWindow.webContents.on('did-start-loading', () => {
      console.log('🔧 Main: Renderer started loading');
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('🔧 Main: Renderer finished loading');
      
      // Give the preload script time to execute, then check
      setTimeout(() => {
        this.mainWindow?.webContents.executeJavaScript(`
          console.log('🔧 Main->Renderer: Post-load check...');
          console.log('🔧 Main->Renderer: typeof window.electronAPI:', typeof window.electronAPI);
          if (window.electronAPI) {
            console.log('🔧 Main->Renderer: electronAPI keys:', Object.keys(window.electronAPI));
            console.log('🔧 Main->Renderer: ElectronAPI successfully loaded!');
          } else {
            console.error('🔧 Main->Renderer: ElectronAPI is still undefined after load!');
            console.log('🔧 Main->Renderer: Available window props:', Object.getOwnPropertyNames(window).filter(prop => prop.includes('electron') || prop.includes('api')));
          }
        `).catch(err => {
          console.error('🔧 Main: Failed to execute post-load JavaScript:', err);
        });
      }, 1000);
    });

    // Listen for console messages from renderer (including preload)
    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`🔧 Renderer Console [${level}]: ${message} (${sourceId}:${line})`);
    });

    // Listen for preload script errors
    this.mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
      console.error('🔧 Main: Preload script error:', preloadPath, error);
    });

    // Listen for DOM ready
    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🔧 Main: DOM ready event fired');
    });

    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}