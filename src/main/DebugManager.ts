import { ipcMain, BrowserWindow } from 'electron';

export interface DebugInfo {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: any;
}

export class DebugManager {
  private logs: DebugInfo[] = [];
  private maxLogs = 1000;

  constructor() {
    this.setupIPC();
  }

  private setupIPC() {
    ipcMain.handle('debug:getLogs', () => this.getLogs());
    ipcMain.handle('debug:clearLogs', () => this.clearLogs());
    ipcMain.handle('debug:addLog', (_, log: Omit<DebugInfo, 'timestamp'>) => this.addLog(log));
  }

  addLog(log: Omit<DebugInfo, 'timestamp'>) {
    const fullLog: DebugInfo = {
      ...log,
      timestamp: Date.now()
    };

    this.logs.unshift(fullLog);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Send to renderer if window exists
    this.sendToRenderer('debug:newLog', fullLog);
    
    // Also log to console for development
    console.log(`[${log.component}] ${log.message}`, log.data || '');
  }

  getLogs(): DebugInfo[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.sendToRenderer('debug:logsCleared');
  }

  private sendToRenderer(channel: string, data?: any) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    });
  }

  // Helper methods for different log levels
  info(component: string, message: string, data?: any) {
    this.addLog({ level: 'info', component, message, data });
  }

  warn(component: string, message: string, data?: any) {
    this.addLog({ level: 'warn', component, message, data });
  }

  error(component: string, message: string, data?: any) {
    this.addLog({ level: 'error', component, message, data });
  }
}