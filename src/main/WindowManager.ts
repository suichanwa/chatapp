import { BrowserWindow, app } from 'electron';
import path from 'node:path';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    console.log('🖼️ WindowManager: NODE_ENV:', process.env.NODE_ENV);
    console.log('🖼️ WindowManager: __dirname:', __dirname);
    console.log('🖼️ WindowManager: app.isPackaged:', app.isPackaged);
    console.log('🖼️ WindowManager: process.cwd():', process.cwd());
  }

  createWindow(): void {
    console.log('🖼️ WindowManager: Creating main window...');

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.getPreloadPath(),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      titleBarStyle: 'default',
      show: false,
      icon: this.getIconPath()
    });

    // Load the appropriate content
    this.loadContent();

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      console.log('🖼️ WindowManager: Window is now visible');
      this.mainWindow?.show();
    });

    // Handle window events
    this.setupWindowEvents();
  }

  private loadContent(): void {
    if (!this.mainWindow) return;

    if (process.env.NODE_ENV === 'development') {
      // Development mode - load from Vite dev server
      console.log('🖼️ WindowManager: Loading development content from Vite server');
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      // Production mode - Electron Forge handles the renderer build
      console.log('🖼️ WindowManager: Loading production content from Electron Forge build');
      
      // In production with Electron Forge, the renderer is served via a special URL
      // This is handled by the VitePlugin in forge.config.ts
      const rendererPath = this.getProductionRendererPath();
      console.log('🖼️ WindowManager: Loading renderer from:', rendererPath);
      
      if (rendererPath.startsWith('http')) {
        this.mainWindow.loadURL(rendererPath);
      } else {
        this.mainWindow.loadFile(rendererPath);
      }
    }
  }

  private getProductionRendererPath(): string {
    // With Electron Forge + VitePlugin, the renderer is typically served 
    // from a special renderer URL or built into the app directory
    
    if (app.isPackaged) {
      // When packaged, check if there's a renderer directory in the app
      const possiblePaths = [
        // Try the main_window renderer (from forge config)
        path.join(__dirname, '..', 'renderer', 'main_window', 'index.html'),
        // Try direct renderer path
        path.join(__dirname, 'renderer', 'index.html'),
        // Try relative to main process
        path.join(__dirname, '..', 'index.html'),
        // Try same directory as main
        path.join(__dirname, 'index.html')
      ];

      const fs = require('fs');
      
      for (const testPath of possiblePaths) {
        console.log('🖼️ WindowManager: Testing path:', testPath);
        if (fs.existsSync(testPath)) {
          console.log('🖼️ WindowManager: Found renderer at:', testPath);
          return testPath;
        }
      }
      
      // If no file found, try the dist-renderer as last resort
      const fallbackPath = path.join(process.resourcesPath, 'app', 'dist-renderer', 'index.html');
      console.log('🖼️ WindowManager: Using fallback path:', fallbackPath);
      return fallbackPath;
    } else {
      // Development or unpackaged build
      return path.join(__dirname, '..', '..', 'dist-renderer', 'index.html');
    }
  }

  private getPreloadPath(): string {
    if (app.isPackaged) {
      // In packaged app, preload is built by Electron Forge
      return path.join(__dirname, 'preload.js');
    } else if (process.env.NODE_ENV === 'development') {
      // Development mode
      return path.join(__dirname, '..', '..', '.vite', 'build', 'preload.js');
    } else {
      // Build mode but not packaged
      return path.join(__dirname, 'preload.js');
    }
  }

  private getIconPath(): string | undefined {
    if (process.platform === 'win32') {
      return path.join(__dirname, '..', '..', 'assets', 'icon.ico');
    } else if (process.platform === 'darwin') {
      return path.join(__dirname, '..', '..', 'assets', 'icon.icns');
    } else {
      return path.join(__dirname, '..', '..', 'assets', 'icon.png');
    }
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`🖼️ Renderer Console [${level}]:`, message, sourceId ? `(${sourceId}:${line})` : '');
    });

    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('🖼️ Renderer process crashed:', details);
    });

    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      console.log('🖼️ Navigation attempt to:', navigationUrl);
      const url = new URL(navigationUrl);
      if (url.origin !== 'http://localhost:5173' && url.protocol !== 'file:') {
        event.preventDefault();
        console.log('🖼️ Navigation blocked for security');
      }
    });

    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🖼️ Main: DOM ready event fired');
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('🖼️ Main: Renderer finished loading');
      
      this.mainWindow?.webContents.executeJavaScript(`
        console.log('🖼️ Main->Renderer: Post-load check...');
        console.log('🖼️ Main->Renderer: typeof window.electronAPI:', typeof window.electronAPI);
        if (window.electronAPI) {
          console.log('🖼️ Main->Renderer: electronAPI keys:', Object.keys(window.electronAPI));
          console.log('🖼️ Main->Renderer: ElectronAPI successfully loaded!');
        }
      `);
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('🖼️ Failed to load renderer:', {
        errorCode,
        errorDescription,
        validatedURL
      });
    });
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  closeWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }
}