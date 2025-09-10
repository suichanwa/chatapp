import { BrowserWindow, app } from 'electron';
import path from 'node:path';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    console.log('🖼️ WindowManager: NODE_ENV:', process.env.NODE_ENV);
    console.log('🖼️ WindowManager: __dirname:', __dirname);
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
      show: false, // Don't show until ready
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
      
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools();
    } else {
      // Production mode - load from built files
      console.log('🖼️ WindowManager: Loading production content from built files');
      
      // In production, the files are in the app.asar or extracted app directory
      const indexPath = this.getProductionIndexPath();
      console.log('🖼️ WindowManager: Loading file:', indexPath);
      
      this.mainWindow.loadFile(indexPath);
    }
  }

  private getProductionIndexPath(): string {
    // In production, we need to load from the renderer build output
    if (app.isPackaged) {
      // When packaged, files are in the app.asar or extracted directory
      // The renderer files should be in the same directory as the main process
      const rendererPath = path.join(__dirname, '..', 'renderer', 'index.html');
      console.log('🖼️ WindowManager: Packaged app - trying renderer path:', rendererPath);
      
      // Check if the file exists, if not try alternative paths
      const fs = require('fs');
      if (fs.existsSync(rendererPath)) {
        return rendererPath;
      }
      
      // Alternative path - directly in the same directory
      const alternatePath = path.join(__dirname, 'index.html');
      console.log('🖼️ WindowManager: Alternative path:', alternatePath);
      if (fs.existsSync(alternatePath)) {
        return alternatePath;
      }
      
      // Final fallback - look in dist-renderer
      const distPath = path.join(__dirname, '..', '..', 'dist-renderer', 'index.html');
      console.log('🖼️ WindowManager: Dist fallback path:', distPath);
      return distPath;
    } else {
      // Development or unpackaged build
      return path.join(__dirname, '..', '..', 'dist-renderer', 'index.html');
    }
  }

  private getPreloadPath(): string {
    if (process.env.NODE_ENV === 'development') {
      // Development mode
      const preloadPath = path.join(__dirname, '..', '..', '.vite', 'build', 'preload.js');
      console.log('🖼️ WindowManager: Using development preload path:', preloadPath);
      return preloadPath;
    } else {
      // Production mode
      if (app.isPackaged) {
        // When packaged, preload is in the same directory as main
        const preloadPath = path.join(__dirname, 'preload.js');
        console.log('🖼️ WindowManager: Using packaged preload path:', preloadPath);
        return preloadPath;
      } else {
        // Unpackaged production build
        const preloadPath = path.join(__dirname, '..', '..', '.vite', 'build', 'preload.js');
        console.log('🖼️ WindowManager: Using unpackaged preload path:', preloadPath);
        return preloadPath;
      }
    }
  }

  private getIconPath(): string | undefined {
    // Add an icon if you have one
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

    // Handle console messages from renderer
    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`🖼️ Renderer Console [${level}]:`, message, sourceId ? `(${sourceId}:${line})` : '');
    });

    // Handle page errors
    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('🖼️ Renderer process crashed:', details);
    });

    // Handle navigation
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      console.log('🖼️ Navigation attempt to:', navigationUrl);
      // Block navigation to external sites for security
      const url = new URL(navigationUrl);
      if (url.origin !== 'http://localhost:5173' && url.protocol !== 'file:') {
        event.preventDefault();
        console.log('🖼️ Navigation blocked for security');
      }
    });

    // Handle DOM ready
    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🖼️ Main: DOM ready event fired');
    });

    // Handle page finish loading
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('🖼️ Main: Renderer finished loading');
      
      // Inject some debug info
      this.mainWindow?.webContents.executeJavaScript(`
        console.log('🖼️ Main->Renderer: Post-load check...');
        console.log('🖼️ Main->Renderer: typeof window.electronAPI:', typeof window.electronAPI);
        if (window.electronAPI) {
          console.log('🖼️ Main->Renderer: electronAPI keys:', Object.keys(window.electronAPI));
          console.log('🖼️ Main->Renderer: ElectronAPI successfully loaded!');
        }
      `);
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