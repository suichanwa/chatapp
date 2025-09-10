import type { DebugLog } from '../types/electron';

export class DebugPanel {
  private isOpen = false;
  private currentTab = 'system';
  private logs: DebugLog[] = [];
  private logFilter = 'all';

  constructor() {
    this.setupEventListeners();
    this.loadLogs();
  }

  private setupEventListeners(): void {
    // Listen for new logs from main process
    if (window.electronAPI) {
      window.electronAPI.debug?.onNewLog?.((log: DebugLog) => {
        this.logs.unshift(log);
        this.updateLogsDisplay();
      });

      window.electronAPI.debug?.onLogsCleared?.(() => {
        this.logs = [];
        this.updateLogsDisplay();
      });
    }
  }

  private async loadLogs(): Promise<void> {
    try {
      if (window.electronAPI?.debug?.getLogs) {
        this.logs = await window.electronAPI.debug.getLogs();
        this.updateLogsDisplay();
      }
    } catch (error) {
      console.error('Failed to load debug logs:', error);
    }
  }

  createDebugOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = 'debug-overlay';
    overlay.id = 'debug-overlay';
    
    overlay.innerHTML = `
      <div class="debug-header">
        <h3>🔧 Debug Panel</h3>
        <div class="debug-controls">
          <button class="debug-btn clear" id="debug-clear">Clear Logs</button>
          <button class="debug-btn close" id="debug-close">×</button>
        </div>
      </div>
      
      <div class="debug-content">
        <div class="debug-tabs">
          <button class="debug-tab active" data-tab="system">System</button>
          <button class="debug-tab" data-tab="api">API</button>
          <button class="debug-tab" data-tab="logs">Logs</button>
        </div>
        
        <div class="debug-panel active" id="debug-system">
          <div class="system-info-grid">
            <div class="system-info-label">User Agent:</div>
            <div class="system-info-value">${navigator.userAgent}</div>
            <div class="system-info-label">Platform:</div>
            <div class="system-info-value">${navigator.platform}</div>
            <div class="system-info-label">Language:</div>
            <div class="system-info-value">${navigator.language}</div>
            <div class="system-info-label">Online:</div>
            <div class="system-info-value">${navigator.onLine ? 'Yes' : 'No'}</div>
            <div class="system-info-label">Screen:</div>
            <div class="system-info-value">${screen.width}x${screen.height}</div>
            <div class="system-info-label">Viewport:</div>
            <div class="system-info-value">${window.innerWidth}x${window.innerHeight}</div>
          </div>
        </div>
        
        <div class="debug-panel" id="debug-api">
          <ul class="api-status-list">
            <li class="api-status-item">
              <span class="api-status-name">ElectronAPI</span>
              <span class="api-status-indicator ${typeof window.electronAPI !== 'undefined' ? 'available' : 'unavailable'}">
                ${typeof window.electronAPI !== 'undefined' ? '✅' : '❌'}
              </span>
            </li>
            <li class="api-status-item">
              <span class="api-status-name">Crypto API</span>
              <span class="api-status-indicator ${typeof window.electronAPI?.crypto !== 'undefined' ? 'available' : 'unavailable'}">
                ${typeof window.electronAPI?.crypto !== 'undefined' ? '✅' : '❌'}
              </span>
            </li>
            <li class="api-status-item">
              <span class="api-status-name">Database API</span>
              <span class="api-status-indicator ${typeof window.electronAPI?.db !== 'undefined' ? 'available' : 'unavailable'}">
                ${typeof window.electronAPI?.db !== 'undefined' ? '✅' : '❌'}
              </span>
            </li>
            <li class="api-status-item">
              <span class="api-status-name">Permission API</span>
              <span class="api-status-indicator ${typeof window.electronAPI?.permission !== 'undefined' ? 'available' : 'unavailable'}">
                ${typeof window.electronAPI?.permission !== 'undefined' ? '✅' : '❌'}
              </span>
            </li>
          </ul>
        </div>
        
        <div class="debug-panel" id="debug-logs">
          <div class="debug-log-controls">
            <select class="debug-filter" id="debug-log-filter">
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
            </select>
            <select class="debug-filter" id="debug-component-filter">
              <option value="all">All Components</option>
            </select>
          </div>
          <div class="debug-logs" id="debug-logs-container">
            <!-- Logs will be populated here -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.attachEventListeners();
    this.updateComponentFilter();
    this.updateLogsDisplay();
  }

  createDebugToggle(): void {
    const toggle = document.createElement('button');
    toggle.className = 'debug-toggle';
    toggle.id = 'debug-toggle';
    toggle.innerHTML = '🔧';
    toggle.title = 'Toggle Debug Panel';
    
    toggle.addEventListener('click', () => this.toggle());
    document.body.appendChild(toggle);
  }

  private attachEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });

    // Close button
    document.getElementById('debug-close')?.addEventListener('click', () => this.close());

    // Clear logs button
    document.getElementById('debug-clear')?.addEventListener('click', () => this.clearLogs());

    // Log filters
    document.getElementById('debug-log-filter')?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.logFilter = target.value;
      this.updateLogsDisplay();
    });

    document.getElementById('debug-component-filter')?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.logFilter = target.value;
      this.updateLogsDisplay();
    });
  }

  private switchTab(tabName: string): void {
    this.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.debug-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`debug-${tabName}`)?.classList.add('active');
  }

  private updateComponentFilter(): void {
    const componentFilter = document.getElementById('debug-component-filter') as HTMLSelectElement;
    if (!componentFilter) return;

    const components = new Set(this.logs.map(log => log.component));
    
    componentFilter.innerHTML = '<option value="all">All Components</option>';
    components.forEach(component => {
      const option = document.createElement('option');
      option.value = component;
      option.textContent = component;
      componentFilter.appendChild(option);
    });
  }

  private updateLogsDisplay(): void {
    const container = document.getElementById('debug-logs-container');
    if (!container) return;

    let filteredLogs = this.logs;
    
    // Filter by level
    if (this.logFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === this.logFilter);
    }

    container.innerHTML = filteredLogs.map(log => `
      <div class="debug-log-entry ${log.level}">
        <div class="debug-log-header">
          <span class="debug-log-component">${log.component}</span>
          <span class="debug-log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="debug-log-message">${log.message}</div>
        ${log.data ? `<div class="debug-log-data">${JSON.stringify(log.data, null, 2)}</div>` : ''}
      </div>
    `).join('');

    this.updateComponentFilter();
  }

  private async clearLogs(): Promise<void> {
    try {
      if (window.electronAPI?.debug?.clearLogs) {
        await window.electronAPI.debug.clearLogs();
      }
      this.logs = [];
      this.updateLogsDisplay();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen = true;
    const overlay = document.getElementById('debug-overlay');
    const toggle = document.getElementById('debug-toggle');
    
    if (overlay) {
      overlay.classList.add('open');
    }
    if (toggle) {
      toggle.classList.add('active');
    }
  }

  close(): void {
    this.isOpen = false;
    const overlay = document.getElementById('debug-overlay');
    const toggle = document.getElementById('debug-toggle');
    
    if (overlay) {
      overlay.classList.remove('open');
    }
    if (toggle) {
      toggle.classList.remove('active');
    }
  }

  initialize(): void {
    console.log('🔧 DebugPanel: Starting initialization...');
    
    // Inject debug styles directly instead of trying to load external CSS
    this.injectDebugStyles();

    // Create debug elements
    this.createDebugToggle();
    this.createDebugOverlay();
    
    console.log('🔧 DebugPanel: Initialization complete');
  }

  private injectDebugStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Debug Menu Styles */
      .debug-overlay {
        position: fixed;
        top: 0;
        right: 0;
        width: 450px;
        height: 100vh;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border-left: 1px solid #404040;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        display: flex;
        flex-direction: column;
      }

      .debug-overlay.open {
        transform: translateX(0);
      }

      .debug-header {
        background: #2d2d2d;
        padding: 1rem;
        border-bottom: 1px solid #404040;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .debug-header h3 {
        font-size: 1rem;
        margin: 0;
        color: #ffffff;
      }

      .debug-controls {
        display: flex;
        gap: 0.5rem;
      }

      .debug-btn {
        background: #404040;
        border: none;
        color: #ffffff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background-color 0.2s;
      }

      .debug-btn:hover {
        background: #555555;
      }

      .debug-btn.clear {
        background: #dc3545;
      }

      .debug-btn.clear:hover {
        background: #c82333;
      }

      .debug-btn.close {
        background: none;
        color: #888;
        font-size: 1.2rem;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .debug-btn.close:hover {
        color: #fff;
        background: #404040;
      }

      .debug-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .debug-tabs {
        display: flex;
        background: #1a1a1a;
        border-bottom: 1px solid #404040;
      }

      .debug-tab {
        flex: 1;
        padding: 0.75rem;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      }

      .debug-tab.active {
        color: #ffffff;
        background: #2d2d2d;
        border-bottom: 2px solid #007acc;
      }

      .debug-tab:hover:not(.active) {
        background: #333;
        color: #ccc;
      }

      .debug-panel {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: none;
      }

      .debug-panel.active {
        display: block;
      }

      /* System Info Panel */
      .system-info-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-family: monospace;
      }

      .system-info-label {
        color: #888;
        font-weight: 500;
      }

      .system-info-value {
        color: #ffffff;
        word-break: break-all;
      }

      /* API Status Panel */
      .api-status-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .api-status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #333;
        font-size: 0.8rem;
      }

      .api-status-item:last-child {
        border-bottom: none;
      }

      .api-status-name {
        color: #ccc;
      }

      .api-status-indicator {
        font-size: 1rem;
      }

      .api-status-indicator.available {
        color: #00ff00;
      }

      .api-status-indicator.unavailable {
        color: #ff4444;
      }

      /* Logs Panel */
      .debug-log-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .debug-filter {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }

      .debug-logs {
        flex: 1;
        overflow-y: auto;
      }

      .debug-log-entry {
        padding: 0.5rem;
        border-bottom: 1px solid #333;
        font-size: 0.8rem;
        font-family: monospace;
      }

      .debug-log-entry:last-child {
        border-bottom: none;
      }

      .debug-log-entry.info {
        border-left: 3px solid #17a2b8;
      }

      .debug-log-entry.warn {
        border-left: 3px solid #ffc107;
      }

      .debug-log-entry.error {
        border-left: 3px solid #dc3545;
      }

      .debug-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
      }

      .debug-log-component {
        color: #007acc;
        font-weight: 500;
      }

      .debug-log-time {
        color: #888;
        font-size: 0.7rem;
      }

      .debug-log-message {
        color: #ffffff;
        margin-bottom: 0.25rem;
      }

      .debug-log-data {
        color: #ccc;
        background: #1a1a1a;
        padding: 0.25rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.7rem;
      }

      /* Toggle Button - POSITIONED NEXT TO STATUS */
      .debug-toggle {
        position: absolute;
        top: 50%;
        right: -45px;
        transform: translateY(-50%);
        background: rgba(0, 122, 204, 0.8);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1rem;
        z-index: 9999;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .debug-toggle:hover {
        background: rgba(0, 122, 204, 1);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
      }

      .debug-toggle.active {
        background: rgba(220, 53, 69, 0.8);
      }

      .debug-toggle.active:hover {
        background: rgba(220, 53, 69, 1);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }

      /* Responsive adjustments */
      @media (max-width: 1200px) {
        .debug-overlay {
          width: 100vw;
        }
        
        .debug-toggle {
          right: 1rem;
          width: 28px;
          height: 28px;
          font-size: 0.9rem;
        }
      }
    `;
    document.head.appendChild(style);
  }
}