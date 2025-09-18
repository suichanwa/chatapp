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

  createWindow(): BrowserWindow {
    console.log('🖼️ WindowManager: Creating main window...');
    
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      minHeight: 600,
      minWidth: 800,
      webPreferences: {
        preload: this.getPreloadPath(),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        sandbox: false, // Required for preload script to work properly
        experimentalFeatures: false
      },
      icon: this.getIconPath(),
      titleBarStyle: 'default',
      show: false, // Don't show until ready
      autoHideMenuBar: true, // Hide menu bar by default (can be toggled with Alt)
    });

    this.loadContent();
    this.setupWindowEvents();

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      console.log('🖼️ WindowManager: Window ready to show');
      this.mainWindow?.show();
      
      // Focus the window
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.focus();
      }
    });

    return this.mainWindow;
  }

  private loadContent(): void {
    if (!this.mainWindow) return;

    console.log('🖼️ WindowManager: Loading content...');
    
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      console.log('🖼️ WindowManager: Loading dev server:', MAIN_WINDOW_VITE_DEV_SERVER_URL);
      this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      const rendererPath = this.getProductionRendererPath();
      console.log('🖼️ WindowManager: Loading production build:', rendererPath);
      this.mainWindow.loadFile(rendererPath);
    }
  }

  private getProductionRendererPath(): string {
    return path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html');
  }

  private getPreloadPath(): string {
    return path.join(__dirname, 'preload.js');
  }

  private getIconPath(): string {
    // Look for icon in multiple possible locations
    const possibleIconPaths = [
      path.join(__dirname, '..', '..', 'assets', 'icon.png'),
      path.join(__dirname, '..', 'assets', 'icon.png'),
      path.join(process.cwd(), 'assets', 'icon.png'),
      path.join(process.cwd(), 'src', 'assets', 'icon.png')
    ];
    
    console.log('🖼️ WindowManager: Searching for icon in paths:', possibleIconPaths);
    
    // For now, return the first path - in production you might want to check if file exists
    const iconPath = possibleIconPaths[0];
    console.log('🖼️ WindowManager: Using icon path:', iconPath);
    return iconPath;
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    // Debug logging for renderer events
    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levelName = ['verbose', 'info', 'warning', 'error'][level] || 'info';
      console.log(`🖼️ Renderer Console [${levelName}]:`, message, sourceId ? `(${sourceId}:${line})` : '');
    });

    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('🖼️ Renderer process crashed:', details);
    });

    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      console.log('🖼️ Navigation attempt to:', navigationUrl);
      
      try {
        const url = new URL(navigationUrl);
        // Allow localhost in development and file protocol for production
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
        const allowedProtocols = ['file:', 'https:'];
        
        if (!allowedOrigins.includes(url.origin) && !allowedProtocols.includes(url.protocol)) {
          event.preventDefault();
          console.log('🖼️ Navigation blocked for security:', url.origin, url.protocol);
        }
      } catch (error) {
        console.error('🖼️ Error parsing navigation URL:', error);
        event.preventDefault();
      }
    });

    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🖼️ Main: DOM ready event fired');
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('🖼️ Main: Renderer finished loading');
      
      // Execute JavaScript in renderer to check API availability
      this.mainWindow?.webContents.executeJavaScript(`
        console.log('🖼️ Main->Renderer: Post-load check...');
        console.log('🖼️ Main->Renderer: typeof window.electronAPI:', typeof window.electronAPI);
        if (window.electronAPI) {
          console.log('🖼️ Main->Renderer: electronAPI keys:', Object.keys(window.electronAPI));
          console.log('🖼️ Main->Renderer: ElectronAPI successfully loaded!');
        } else {
          console.error('🖼️ Main->Renderer: ElectronAPI not found! Preload script may have failed.');
        }
      `).catch(error => {
        console.error('🖼️ Error executing post-load JavaScript:', error);
      });
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('🖼️ Failed to load renderer:', {
        errorCode,
        errorDescription,
        validatedURL,
        isNetworkError: errorCode <= -100 && errorCode >= -199,
        isHttpError: errorCode <= -300 && errorCode >= -399
      });
    });

    // Handle window ready state
    this.mainWindow.webContents.once('did-finish-load', () => {
      console.log('🖼️ WindowManager: Initial load complete');
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      console.log('🖼️ WindowManager: Main window closed');
      this.mainWindow = null;
    });

    // Handle window focus/blur for better UX
    this.mainWindow.on('focus', () => {
      console.log('🖼️ WindowManager: Window focused');
    });

    this.mainWindow.on('blur', () => {
      console.log('🖼️ WindowManager: Window blurred');
    });

    // Handle window minimize/maximize
    this.mainWindow.on('minimize', () => {
      console.log('🖼️ WindowManager: Window minimized');
    });

    this.mainWindow.on('maximize', () => {
      console.log('🖼️ WindowManager: Window maximized');
    });

    this.mainWindow.on('unmaximize', () => {
      console.log('🖼️ WindowManager: Window unmaximized');
    });

    // Handle window resize for responsive UI
    this.mainWindow.on('resize', () => {
      const [width, height] = this.mainWindow!.getSize();
      console.log(`🖼️ WindowManager: Window resized to ${width}x${height}`);
    });

    // Security: Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      console.log('🖼️ WindowManager: Blocked new window creation for:', url);
      return { action: 'deny' };
    });

    // Handle certificate errors in development
    this.mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
      if (process.env.NODE_ENV === 'development') {
        // In development, ignore certificate errors for localhost
        if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
          event.preventDefault();
          callback(true);
          return;
        }
      }
      
      console.error('🖼️ Certificate error:', { url, error });
      callback(false);
    });
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  closeWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('🖼️ WindowManager: Closing window...');
      this.mainWindow.close();
    }
  }

  isWindowVisible(): boolean {
    return this.mainWindow ? this.mainWindow.isVisible() : false;
  }

  showWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  hideWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide();
    }
  }

  toggleWindow(): void {
    if (this.isWindowVisible()) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }

  // Method to reload the renderer (useful for development)
  reloadRenderer(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('🖼️ WindowManager: Reloading renderer...');
      this.mainWindow.webContents.reload();
    }
  }

  // Method to open developer tools
  openDevTools(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('🖼️ WindowManager: Opening DevTools...');
      this.mainWindow.webContents.openDevTools();
    }
  }

  // Method to close developer tools
  closeDevTools(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('🖼️ WindowManager: Closing DevTools...');
      this.mainWindow.webContents.closeDevTools();
    }
  }
}