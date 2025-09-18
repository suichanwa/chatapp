import type { Component } from '../types/components';

export class ConnectionTab implements Component {
  private container: HTMLElement | null = null;
  private onConnect?: (address: string, name: string) => Promise<void>;

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
      <div class="connection-form">
        <div class="form-header">
          <div class="form-icon">🌐</div>
          <h4>Connect to Peer</h4>
          <p class="form-description">Enter the address of the peer you want to connect to</p>
        </div>
        
        <div class="form-content">
          <div class="form-group">
            <label for="peer-address" class="form-label">
              <span class="label-icon">📡</span>
              Peer Address (IP:Port)
            </label>
            <div class="input-group">
              <input 
                type="text" 
                id="peer-address" 
                class="form-input" 
                placeholder="192.168.1.100:8080"
                pattern="^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}:\\d{1,5}$"
                autocomplete="off"
              />
              <div class="input-hint">Format: IP:PORT (e.g., 192.168.1.100:8080)</div>
            </div>
          </div>

          <div class="form-group">
            <label for="chat-name" class="form-label">
              <span class="label-icon">💬</span>
              Chat Name (Optional)
            </label>
            <div class="input-group">
              <input 
                type="text" 
                id="chat-name" 
                class="form-input" 
                placeholder="Chat with friend"
                maxlength="50"
                autocomplete="off"
              />
              <div class="input-hint">Give this chat a memorable name</div>
            </div>
          </div>

          <div class="connection-status" id="connection-status">
            <div class="status-indicator">
              <div class="status-dot offline"></div>
              <span class="status-text">Ready to connect</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" id="connect-btn" class="btn btn-primary">
            <span class="btn-icon">🔌</span>
            <span class="btn-text">Connect</span>
            <div class="btn-loader">
              <div class="spinner"></div>
            </div>
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    const connectBtn = this.container.querySelector('#connect-btn') as HTMLButtonElement;
    const addressInput = this.container.querySelector('#peer-address') as HTMLInputElement;
    const nameInput = this.container.querySelector('#chat-name') as HTMLInputElement;

    // Form validation
    addressInput?.addEventListener('input', () => {
      this.validateForm();
    });

    // Connect button
    connectBtn?.addEventListener('click', async () => {
      const address = addressInput?.value.trim() || '';
      const name = nameInput?.value.trim() || 'New Chat';
      
      if (!address) {
        this.showError('Please enter a peer address');
        return;
      }

      if (!this.isValidAddress(address)) {
        this.showError('Invalid address format. Use IP:PORT');
        return;
      }

      await this.handleConnect(address, name);
    });

    // Enter key support
    [addressInput, nameInput].forEach(input => {
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !connectBtn?.disabled) {
          connectBtn?.click();
        }
      });
    });
  }

  private async handleConnect(address: string, name: string): Promise<void> {
    try {
      this.setConnecting(true);
      this.updateStatus('connecting', 'Connecting...');
      
      if (this.onConnect) {
        await this.onConnect(address, name);
        this.updateStatus('connected', 'Connected successfully!');
        this.clearForm();
      }
      
    } catch (error) {
      this.updateStatus('error', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.showError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      this.setConnecting(false);
    }
  }

  private setConnecting(connecting: boolean): void {
    const connectBtn = this.container?.querySelector('#connect-btn') as HTMLButtonElement;
    const btnText = connectBtn?.querySelector('.btn-text');
    const btnLoader = connectBtn?.querySelector('.btn-loader');
    
    if (connectBtn) {
      connectBtn.disabled = connecting;
      connectBtn.classList.toggle('loading', connecting);
    }
    
    if (btnText) {
      btnText.textContent = connecting ? 'Connecting...' : 'Connect';
    }
  }

  private validateForm(): boolean {
    const addressInput = this.container?.querySelector('#peer-address') as HTMLInputElement;
    const address = addressInput?.value.trim() || '';
    const isValid = this.isValidAddress(address);
    
    addressInput?.classList.toggle('error', address !== '' && !isValid);
    
    const connectBtn = this.container?.querySelector('#connect-btn') as HTMLButtonElement;
    if (connectBtn) {
      connectBtn.disabled = !isValid;
    }
    
    return isValid;
  }

  private isValidAddress(address: string): boolean {
    const pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
    if (!pattern.test(address)) return false;
    
    const [ip, portStr] = address.split(':');
    const port = parseInt(portStr);
    
    // Validate IP parts
    const ipParts = ip.split('.').map(Number);
    if (ipParts.some(part => part > 255)) return false;
    
    // Validate port
    if (port < 1 || port > 65535) return false;
    
    return true;
  }

  private updateStatus(type: 'offline' | 'connecting' | 'connected' | 'error', message: string): void {
    const statusIndicator = this.container?.querySelector('.status-indicator');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');
    
    if (statusDot) {
      statusDot.className = `status-dot ${type}`;
    }
    
    if (statusText) {
      statusText.textContent = message;
    }
  }

  private showError(message: string): void {
    console.error('Connection Error:', message);
    // You can implement a toast notification system here
    alert(message); // Simple alert for now
  }

  private clearForm(): void {
    const addressInput = this.container?.querySelector('#peer-address') as HTMLInputElement;
    const nameInput = this.container?.querySelector('#chat-name') as HTMLInputElement;
    
    if (addressInput) addressInput.value = '';
    if (nameInput) nameInput.value = '';
  }

  onConnectHandler(handler: (address: string, name: string) => Promise<void>): void {
    this.onConnect = handler;
  }

  cleanup(): void {
    // Cleanup handled by parent
  }
}