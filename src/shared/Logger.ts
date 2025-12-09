import { LogLayer, ConsoleTransport } from 'loglayer';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Component names for better filtering
export type LogComponent = 
  | 'Renderer'
  | 'ChatApp'
  | 'MobileChatApp'
  | 'TransportManager'
  | 'Database'
  | 'Crypto'
  | 'KeyStore'
  | 'WindowManager'
  | 'PermissionBroker'
  | 'DebugManager'
  | 'Modal'
  | 'UnfocusedOverlay'
  | 'DecoyNotesApp'
  | 'PasscodeScreen'
  | 'Network'
  | 'Security'
  | 'UI';

// Icons for different log levels
const LEVEL_ICONS = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

// Component icons
const COMPONENT_ICONS: Record<LogComponent, string> = {
  Renderer: '🖼️',
  ChatApp: '💬',
  MobileChatApp: '📱',
  TransportManager: '🌐',
  Database: '💾',
  Crypto: '🔐',
  KeyStore: '🔑',
  WindowManager: '🪟',
  PermissionBroker: '🛡️',
  DebugManager: '🔧',
  Modal: '📋',
  UnfocusedOverlay: '🔒',
  DecoyNotesApp: '📝',
  PasscodeScreen: '🔢',
  Network: '🌐',
  Security: '🔒',
  UI: '🎨',
};

class AppLogger {
  private logLayer: LogLayer;
  private enabledComponents: Set<LogComponent> = new Set();
  private minLevel: LogLevel = 'info';

  constructor() {
    this.logLayer = new LogLayer({
      transport: new ConsoleTransport({
        logger: console,
      }),
    });

    // Enable important components by default (disable noisy ones)
    this.enabledComponents.add('Renderer');
    this.enabledComponents.add('ChatApp');
    this.enabledComponents.add('MobileChatApp');
    this.enabledComponents.add('TransportManager');
    this.enabledComponents.add('Database');
    this.enabledComponents.add('Crypto');
    this.enabledComponents.add('Network');
    this.enabledComponents.add('Security');
    
    // Explicitly disable noisy components
    // this.enabledComponents.add('Modal');  // Disabled - too noisy
    // this.enabledComponents.add('UnfocusedOverlay');  // Disabled - too noisy
  }

  // Configuration methods
  enableAll() {
    Object.keys(COMPONENT_ICONS).forEach(component => {
      this.enabledComponents.add(component as LogComponent);
    });
  }

  disableAll() {
    this.enabledComponents.clear();
  }

  enable(...components: LogComponent[]) {
    components.forEach(c => this.enabledComponents.add(c));
  }

  disable(...components: LogComponent[]) {
    components.forEach(c => this.enabledComponents.delete(c));
  }

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private shouldLog(component: LogComponent, level: LogLevel): boolean {
    // Check if component is enabled
    if (!this.enabledComponents.has(component)) {
      return false;
    }

    // Check log level
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(component: LogComponent, level: LogLevel, message: string): string {
    const icon = COMPONENT_ICONS[component] || '📦';
    const levelIcon = LEVEL_ICONS[level];
    return `${levelIcon} ${icon} [${component}] ${message}`;
  }

  // Easy-to-use logging methods
  debug(component: LogComponent, message: string, ...data: any[]) {
    if (this.shouldLog(component, 'debug')) {
      this.logLayer
        .withMetadata(data.length > 0 ? { data } : {})
        .info(this.formatMessage(component, 'debug', message));
    }
  }

  info(component: LogComponent, message: string, ...data: any[]) {
    if (this.shouldLog(component, 'info')) {
      this.logLayer
        .withMetadata(data.length > 0 ? { data } : {})
        .info(this.formatMessage(component, 'info', message));
    }
  }

  warn(component: LogComponent, message: string, ...data: any[]) {
    if (this.shouldLog(component, 'warn')) {
      this.logLayer
        .withMetadata(data.length > 0 ? { data } : {})
        .warn(this.formatMessage(component, 'warn', message));
    }
  }

  error(component: LogComponent, message: string, error?: Error | unknown, ...data: any[]) {
    if (this.shouldLog(component, 'error')) {
      const metadata: any = {};
      if (data.length > 0) metadata.data = data;
      
      let logBuilder = this.logLayer.withMetadata(metadata);
      
      if (error instanceof Error) {
        logBuilder = logBuilder.withError(error);
      } else if (error) {
        metadata.error = error;
      }
      
      logBuilder.error(this.formatMessage(component, 'error', message));
    }
  }

  // Critical errors (always logged)
  critical(component: LogComponent, message: string, error?: Error | unknown, ...data: any[]) {
    const metadata: any = {};
    if (data.length > 0) metadata.data = data;
    
    let logBuilder = this.logLayer.withMetadata(metadata);
    
    if (error instanceof Error) {
      logBuilder = logBuilder.withError(error);
    } else if (error) {
      metadata.error = error;
    }
    
    logBuilder.error(`🚨 ${COMPONENT_ICONS[component]} [${component}] CRITICAL: ${message}`);
  }

  // Network-specific logging
  network(message: string, ...data: any[]) {
    this.info('Network', message, ...data);
  }

  // Security-specific logging
  security(message: string, ...data: any[]) {
    this.warn('Security', message, ...data);
  }
}

// Create singleton instance
export const log = new AppLogger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).log = log;
}