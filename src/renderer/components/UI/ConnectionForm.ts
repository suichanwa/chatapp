import type { Component } from '../../../types/components';
import { ErrorModal } from '../UI/ErrorModal';

interface ConnectionCallbacks {
  onConnect?: (address: string, name: string) => Promise<void>;
  onStartServer?: () => Promise<void>;
}

export class ConnectionForm implements Component {
  private errorModal = new ErrorModal();

  async initialize(): Promise<void> {
    await this.errorModal.initialize();
  }

  render(isActive: boolean): string {
    return `
      <div class="tab-content ${isActive ? 'active' : ''}" id="connect-tab" role="tabpanel" aria-labelledby="connect">
        <div class="tab-section">
          <h4 class="section-title">
            <span class="material-icons">connect_without_contact</span>
            Connect to Peer
          </h4>
          <p class="section-description">Enter the address of a peer to start a secure, encrypted chat session</p>

          <div class="form-group">
            <label class="form-label">
              <span class="material-icons" style="color: var(--accent);">wifi_tethering</span>
              Peer Address (IP:Port)
            </label>
            <input type="text" id="peer-address" class="form-input" placeholder="127.0.0.1:8080" autocomplete="off">
            <small class="form-hint">Example: 192.168.1.100:8080 or your-domain.com:8080</small>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="material-icons" style="color: #22c55e;">chat</span>
              Chat Name
            </label>
            <input type="text" id="chat-name" class="form-input" placeholder="Chat with friend" autocomplete="off">
            <small class="form-hint">Optional: Give this chat a custom name for easy identification</small>
          </div>

          <div class="form-actions">
            <button id="connect-btn" class="btn btn-primary">
              <span class="material-icons btn-icon">link</span>
              <span class="btn-text">Connect Securely</span>
            </button>
          </div>

          <div class="form-actions" style="margin-top:12px">
            <button id="start-server-btn-connect" class="btn btn-secondary">
              <span class="material-icons btn-icon">rocket_launch</span>
              <span class="btn-text">Start Server Instead</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async handleClick(e: Event, callbacks: ConnectionCallbacks): Promise<void> {
    const target = e.target as HTMLElement;

    if (target.closest('#connect-btn')) {
      e.preventDefault();
      await this.handleConnect(callbacks);
    } else if (target.closest('#start-server-btn-connect')) {
      e.preventDefault();
      await this.handleStartServer(callbacks);
    }
  }

  handleKeydown(e: KeyboardEvent, callbacks: ConnectionCallbacks): void {
    const target = e.target as HTMLElement;
    if ((target.id === 'peer-address' || target.id === 'chat-name') && e.key === 'Enter') {
      e.preventDefault();
      this.handleConnect(callbacks);
    }
  }

  private async handleConnect(callbacks: ConnectionCallbacks): Promise<void> {
    const addressInput = document.querySelector('#peer-address') as HTMLInputElement | null;
    const nameInput = document.querySelector('#chat-name') as HTMLInputElement | null;
    const connectBtn = document.querySelector('#connect-btn') as HTMLButtonElement | null;

    const address = addressInput?.value.trim();
    const name = nameInput?.value.trim() || 'Unknown Peer';

    if (!address) {
      this.showError('Please enter a peer address');
      addressInput?.focus();
      return;
    }

    if (!callbacks.onConnect) {
      this.showError('Connection handler not available');
      return;
    }

    this.setButtonLoading(connectBtn, true, 'Connecting...');

    try {
      await callbacks.onConnect(address, name);
      // Clear form on success
      if (addressInput) addressInput.value = '';
      if (nameInput) nameInput.value = '';
    } catch (error) {
      this.showError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.setButtonLoading(connectBtn, false);
    }
  }

  private async handleStartServer(callbacks: ConnectionCallbacks): Promise<void> {
    const startServerBtn = document.querySelector('#start-server-btn-connect') as HTMLButtonElement | null;

    if (!callbacks.onStartServer) {
      this.showError('Server start handler not available');
      return;
    }

    this.setButtonLoading(startServerBtn, true, 'Starting...');

    try {
      await callbacks.onStartServer();
    } catch (error) {
      this.showError(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.setButtonLoading(startServerBtn, false);
    }
  }

  private setButtonLoading(button: HTMLButtonElement | null, loading: boolean, text?: string): void {
    if (!button) return;

    if (loading) {
      button.disabled = true;
      const originalContent = button.innerHTML;
      button.dataset.originalContent = originalContent;
      const loadingText = text || 'Loading...';
      button.innerHTML = `<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">${loadingText}</span>`;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
      button.classList.remove('loading');
    }
  }

  private showError(message: string): void {
    this.errorModal.show(message);
  }

  cleanup(): void {
    this.errorModal.cleanup();
  }
}