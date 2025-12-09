import { log, type LogComponent } from './Logger';

/**
 * Quick logging helpers - import these for easy use throughout your app
 * 
 * Usage:
 * ```ts
 * import { logInfo, logError } from '@/shared/LogHelpers';
 * 
 * logInfo('ChatApp', 'User connected');
 * logError('Database', 'Failed to save', error);
 * ```
 */

// Basic logging functions
export const logDebug = (component: LogComponent, message: string, ...data: any[]) => 
  log.debug(component, message, ...data);

export const logInfo = (component: LogComponent, message: string, ...data: any[]) => 
  log.info(component, message, ...data);

export const logWarn = (component: LogComponent, message: string, ...data: any[]) => 
  log.warn(component, message, ...data);

export const logError = (component: LogComponent, message: string, error?: Error | unknown, ...data: any[]) => 
  log.error(component, message, error, ...data);

export const logCritical = (component: LogComponent, message: string, error?: Error | unknown, ...data: any[]) => 
  log.critical(component, message, error, ...data);

// Specialized helpers for common use cases
export const logNetwork = (message: string, ...data: any[]) => 
  log.network(message, ...data);

export const logSecurity = (message: string, ...data: any[]) => 
  log.security(message, ...data);

// Component-specific helpers (optional, for convenience)
export const logRenderer = (message: string, ...data: any[]) => 
  log.info('Renderer', message, ...data);

export const logChatApp = (message: string, ...data: any[]) => 
  log.info('ChatApp', message, ...data);

export const logDatabase = (message: string, ...data: any[]) => 
  log.info('Database', message, ...data);

export const logTransport = (message: string, ...data: any[]) => 
  log.info('TransportManager', message, ...data);

export const logCrypto = (message: string, ...data: any[]) => 
  log.info('Crypto', message, ...data);

export const logUI = (message: string, ...data: any[]) => 
  log.info('UI', message, ...data);

// Export the main logger instance for advanced use
export { log };