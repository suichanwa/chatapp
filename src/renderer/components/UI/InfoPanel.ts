import type { Component } from '../../types/components';
import { SecuritySettings } from './SecuritySettings';

export class InfoPanel implements Component {
  private securitySettings = new SecuritySettings();
  private serverInfo: { address: string; port: number } | null = null;

  async initialize(): Promise<void> {
    await this.securitySettings.initialize();
  }

  render(isActive: boolean, serverInfo: { address: string; port: number } | null): string {
    this.serverInfo = serverInfo;
    
    return `
      <div class="tab-content ${isActive ? 'active' : ''}" id="info-tab" role="tabpanel" aria-labelledby="info">
        <div class="tab-section">
          <div class="info-section">
            ${this.renderConnectionInfo()}
            ${this.securitySettings.render()}
            ${this.renderServerActions()}
          </div>
        </div>
      </div>
    `;
  }

  private renderConnectionInfo(): string {
    const status = this.serverInfo ? 'Running' : 'Not started';
    const statusClass = this.serverInfo ? 'status-running' : '';
    const address = this.serverInfo ? `${this.serverInfo.address}:${this.serverInfo.port}` : 'Unknown';
    
    return `
      <h4>
        <span class="material-icons">router</span>
        Your Connection Info
      </h4>
      <div class="info-item">
        <label>Server Status:</label>
        <span id="modal-server-status" class="status-indicator ${statusClass}">${status}</span>
      </div>
      <div class="info-item">
        <label>Your Address:</label>
        <span id="modal-my-address">${address}</span>
        <button id="copy-address" class="copy-btn" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
          <span class="material-icons">content_copy</span>
        </button>
      </div>
      <div class="info-item">
        <label>Your Public Key:</label>
        <div class="flex-1 flex flex-col gap-2">
          <textarea id="my-public-key" class="key-textarea" readonly placeholder="Loading your public key..."></textarea>
          <button id="copy-key" class="copy-btn self-end" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
            <span class="material-icons">content_copy</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderServerActions(): string {
    const isRunning = !!this.serverInfo;
    const buttonText = isRunning ? 'Server Running' : 'Start Server';
    const buttonIcon = isRunning ? 'check_circle' : 'rocket_launch';
    const buttonDisabled = isRunning ? 'disabled' : '';
    
    return `
      <div class="form-actions" style="margin-top:24px">
        <button id="start-server-btn" class="btn btn-primary" ${buttonDisabled}>
          <span class="material-icons btn-icon">${buttonIcon}</span>
          <span class="btn-text">${buttonText}</span>
        </button>
      </div>
    `;
  }

  async handleClick(e: Event, callbacks: any): Promise<void> {
    const target = e.target as HTMLElement;

    if (target.closest('#copy-address')) {
      e.preventDefault();
      await this.copyAddress();
    } else if (target.closest('#copy-key')) {
      e.preventDefault();
      await this.copyKey();
    } else if (target.closest('#start-server-btn')) {
      e.preventDefault();
      await this.handleStartServer(callbacks);
    } else {
      await this.securitySettings.handleClick(e);
    }
  }

  private async copyAddress(): Promise<void> {
    const addressElement = document.querySelector('#modal-my-address');
    const address = addressElement?.textContent?.trim();

    try {
      if (address && address !== 'Unknown') {
        await this.copyToClipboard(address);
      }
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }

  private async copyKey(): Promise<void> {
    const keyTextarea = document.querySelector('#my-public-key') as HTMLTextAreaElement | null;
    const key = keyTextarea?.value?.trim();

    try {
      if (key) {
        await this.copyToClipboard(key);
      }
    } catch (err) {
      console.error('Failed to copy key:', err);
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    const kbd = (window.event as KeyboardEvent | undefined);
    const useSystem = !!(kbd && (kbd.shiftKey || kbd.ctrlKey || kbd.metaKey));
    
    if (!useSystem && window.electronAPI?.secureClipboard) {
      await window.electronAPI.secureClipboard.writeText(text, { ttlMs: 120_000 });
    } else if (window.electronAPI?.clipboard) {
      await window.electronAPI.clipboard.writeText(text);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('No clipboard API available');
    }
  }

  private async handleStartServer(callbacks: any): Promise<void> {
    const startServerBtn = document.querySelector('#start-server-btn') as HTMLButtonElement | null;

    if (!callbacks.onStartServer) {
      console.error('Server start handler not available');
      return;
    }

    if (startServerBtn) {
      startServerBtn.disabled = true;
      startServerBtn.innerHTML = '<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">Starting...</span>';
      startServerBtn.classList.add('loading');
    }

    try {
      await callbacks.onStartServer();
    } catch (error) {
      console.error('Failed to start server:', error);
      if (startServerBtn) {
        startServerBtn.disabled = false;
        startServerBtn.innerHTML = '<span class="material-icons btn-icon">rocket_launch</span><span class="btn-text">Start Server</span>';
        startServerBtn.classList.remove('loading');
      }
    }
  }

  updateServerInfo(address: string, port: number): void {
    this.serverInfo = { address, port };

    const serverStatus = document.querySelector('#modal-server-status');
    const myAddress = document.querySelector('#modal-my-address');
    const startServerBtn = document.querySelector('#start-server-btn') as HTMLButtonElement | null;

    if (serverStatus) {
      serverStatus.textContent = 'Running';
      (serverStatus as HTMLElement).className = 'status-indicator status-running';
    }

    if (myAddress) {
      myAddress.textContent = `${address}:${port}`;
    }

    if (startServerBtn) {
      startServerBtn.disabled = true;
      startServerBtn.innerHTML = '<span class="material-icons btn-icon">check_circle</span><span class="btn-text">Server Running</span>';
      startServerBtn.classList.remove('loading');
    }
  }

  async updateConnectionInfo(): Promise<void> {
    if (window.electronAPI?.crypto) {
      try {
        const publicKey = await window.electronAPI.crypto.getPublicKey();
        const keyTextarea = document.querySelector('#my-public-key') as HTMLTextAreaElement | null;
        if (keyTextarea && publicKey) {
          keyTextarea.value = publicKey;
        }
      } catch (error) {
        console.error('Failed to get public key:', error);
      }
    }

    if (this.serverInfo) {
      this.updateServerInfo(this.serverInfo.address, this.serverInfo.port);
    }
  }

  cleanup(): void {
    this.securitySettings.cleanup();
  }
}