import type { Component, ServerInfo } from '../types/components';

export class ConnectionInfoTab implements Component {
  private container: HTMLElement | null = null;
  private serverInfo: ServerInfo = { isRunning: false };
  private publicKey = '';
  private onStartServer?: () => Promise<void>;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
  }

  async initialize(): Promise<void> {
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="connection-info">
        <div class="info-header">
          <div class="info-icon">📡</div>
          <h4>Your Connection Information</h4>
          <p class="info-description">Share this information with others to let them connect to you</p>
        </div>

        <div class="info-sections">
          <!-- Server Status Section -->
          <div class="info-section">
            <div class="section-header">
              <h5>
                <span class="section-icon">🖥️</span>
                Server Status
              </h5>
            </div>
            <div class="section-content">
              <div class="server-status">
                <div class="status-card ${this.serverInfo.isRunning ? 'running' : 'stopped'}">
                  <div class="status-indicator">
                    <div class="status-dot ${this.serverInfo.isRunning ? 'online' : 'offline'}"></div>
                    <span class="status-text" id="server-status-text">
                      ${this.serverInfo.isRunning ? 'Running' : 'Not Started'}
                    </span>
                  </div>
                  <button type="button" id="server-toggle" class="btn ${this.serverInfo.isRunning ? 'btn-secondary' : 'btn-primary'}">
                    <span class="btn-icon">${this.serverInfo.isRunning ? '⏹️' : '▶️'}</span>
                    <span class="btn-text">${this.serverInfo.isRunning ? 'Stop Server' : 'Start Server'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <div class="info-section">
            <div class="section-header">
              <h5>
                <span class="section-icon">🌐</span>
                Your Address
              </h5>
            </div>
            <div class="section-content">
              <div class="address-info">
                <div class="address-display">
                  <div class="address-value" id="server-address">
                    ${this.getAddressDisplay()}
                  </div>
                  <button type="button" id="copy-address" class="btn btn-outline copy-btn" ${!this.serverInfo.isRunning ? 'disabled' : ''}>
                    <span class="btn-icon">📋</span>
                    <span class="btn-text">Copy</span>
                  </button>
                </div>
                <div class="address-hint">
                  ${this.serverInfo.isRunning ? 'Share this address with peers' : 'Start the server to see your address'}
                </div>
              </div>
            </div>
          </div>

          <!-- Public Key Section -->
          <div class="info-section">
            <div class="section-header">
              <h5>
                <span class="section-icon">🔑</span>
                Public Key
              </h5>
            </div>
            <div class="section-content">
              <div class="key-info">
                <div class="key-display">
                  <textarea 
                    id="public-key-display" 
                    class="key-textarea" 
                    readonly
                    placeholder="Generating public key..."
                  >${this.publicKey}</textarea>
                  <button type="button" id="copy-key" class="btn btn-outline copy-btn" ${!this.publicKey ? 'disabled' : ''}>
                    <span class="btn-icon">📋</span>
                    <span class="btn-text">Copy</span>
                  </button>
                </div>
                <div class="key-hint">
                  This key is used for secure communication
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    // Server toggle
    const serverToggle = this.container.querySelector('#server-toggle');
    serverToggle?.addEventListener('click', () => {
      this.handleServerToggle();
    });

    // Copy buttons
    const copyAddress = this.container.querySelector('#copy-address');
    const copyKey = this.container.querySelector('#copy-key');

    copyAddress?.addEventListener('click', () => {
      this.copyToClipboard('address');
    });

    copyKey?.addEventListener('click', () => {
      this.copyToClipboard('key');
    });
  }

  private async handleServerToggle(): Promise<void> {
    try {
      if (this.serverInfo.isRunning) {
        // Stop server functionality
        console.log('Stop server functionality not implemented yet');
      } else {
        if (this.onStartServer) {
          await this.onStartServer();
        }
      }
    } catch (error) {
      console.error('Server toggle error:', error);
    }
  }

  private async copyToClipboard(type: 'address' | 'key'): Promise<void> {
    let textToCopy = '';
    let buttonId = '';

    if (type === 'address') {
      textToCopy = this.getAddressText();
      buttonId = 'copy-address';
    } else {
      textToCopy = this.publicKey;
      buttonId = 'copy-key';
    }

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.showCopySuccess(buttonId);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  private showCopySuccess(buttonId: string): void {
    const button = this.container?.querySelector(`#${buttonId}`) as HTMLButtonElement;
    const btnText = button?.querySelector('.btn-text');
    const btnIcon = button?.querySelector('.btn-icon');
    
    if (button && btnText && btnIcon) {
      const originalText = btnText.textContent;
      const originalIcon = btnIcon.textContent;
      
      btnText.textContent = 'Copied!';
      btnIcon.textContent = '✅';
      button.classList.add('success');
      
      setTimeout(() => {
        btnText.textContent = originalText;
        btnIcon.textContent = originalIcon;
        button.classList.remove('success');
      }, 2000);
    }
  }

  private getAddressDisplay(): string {
    if (!this.serverInfo.isRunning) {
      return 'Server not running';
    }
    return `${this.serverInfo.address}:${this.serverInfo.port}`;
  }

  private getAddressText(): string {
    if (!this.serverInfo.isRunning) return '';
    return `${this.serverInfo.address}:${this.serverInfo.port}`;
  }

  updateServerInfo(serverInfo: ServerInfo): void {
    this.serverInfo = serverInfo;
    this.updateDisplay();
  }

  updatePublicKey(publicKey: string): void {
    this.publicKey = publicKey;
    const textarea = this.container?.querySelector('#public-key-display') as HTMLTextAreaElement;
    const copyBtn = this.container?.querySelector('#copy-key') as HTMLButtonElement;
    
    if (textarea) {
      textarea.value = publicKey;
    }
    
    if (copyBtn) {
      copyBtn.disabled = !publicKey;
    }
  }

  private updateDisplay(): void {
    // Update server status
    const statusCard = this.container?.querySelector('.status-card');
    const statusDot = this.container?.querySelector('.status-dot');
    const statusText = this.container?.querySelector('#server-status-text');
    const serverToggle = this.container?.querySelector('#server-toggle') as HTMLButtonElement;
    const serverAddress = this.container?.querySelector('#server-address');
    const copyAddressBtn = this.container?.querySelector('#copy-address') as HTMLButtonElement;

    if (statusCard) {
      statusCard.className = `status-card ${this.serverInfo.isRunning ? 'running' : 'stopped'}`;
    }

    if (statusDot) {
      statusDot.className = `status-dot ${this.serverInfo.isRunning ? 'online' : 'offline'}`;
    }

    if (statusText) {
      statusText.textContent = this.serverInfo.isRunning ? 'Running' : 'Not Started';
    }

    if (serverToggle) {
      const btnIcon = serverToggle.querySelector('.btn-icon');
      const btnText = serverToggle.querySelector('.btn-text');
      
      serverToggle.className = `btn ${this.serverInfo.isRunning ? 'btn-secondary' : 'btn-primary'}`;
      
      if (btnIcon) btnIcon.textContent = this.serverInfo.isRunning ? '⏹️' : '▶️';
      if (btnText) btnText.textContent = this.serverInfo.isRunning ? 'Stop Server' : 'Start Server';
    }

    if (serverAddress) {
      serverAddress.textContent = this.getAddressDisplay();
    }

    if (copyAddressBtn) {
      copyAddressBtn.disabled = !this.serverInfo.isRunning;
    }
  }

  onStartServerHandler(handler: () => Promise<void>): void {
    this.onStartServer = handler;
  }

  cleanup(): void {
    // Cleanup handled by parent
  }
}