import { Modal } from '../Modal';
import type { Component } from '../../types/components';
// Import the CSS styles
import '../../../styles/newchatmoda.css';

interface NewChatModalCallbacks {
  onConnect?: (address: string, name: string) => Promise<void>;
  onStartServer?: () => Promise<void>;
}

export class NewChatModal implements Component {
  private modal: Modal;
  private callbacks: NewChatModalCallbacks = {};
  private serverInfo: { address: string; port: number } | null = null;

  constructor(callbacks: NewChatModalCallbacks = {}) {
    this.callbacks = callbacks;
    
    this.modal = new Modal(
      'new-chat-modal',
      '🆕 Create New Chat',
      this.getModalContent(),
      'new-chat-modal'
    );
  }

  async initialize(): Promise<void> {
    await this.modal.initialize();
    this.setupEventListeners();
    this.setupTabSwitching();
    
    console.log('✅ NewChatModal initialized');
  }

  private getModalContent(): string {
    return `
      <div class="new-chat-content">
        <div class="modal-tabs">
          <button class="modal-tab active" data-tab="connect">
            <span class="tab-icon">🌐</span>
            <span class="tab-label">Connect to Peer</span>
          </button>
          <button class="modal-tab" data-tab="info">
            <span class="tab-icon">📡</span>
            <span class="tab-label">My Connection Info</span>
          </button>
        </div>
        
        <div class="modal-tab-content active" id="connect-tab">
          <div class="tab-section">
            <h4 class="section-title">Connect to Peer</h4>
            <p class="section-description">Enter the address of a peer to start a secure chat</p>
            
            <div class="form-group">
              <label class="form-label">Peer Address (IP:Port)</label>
              <input type="text" 
                     id="peer-address" 
                     class="form-input" 
                     placeholder="127.0.0.1:8080" 
                     autocomplete="off">
              <small class="form-hint">Example: 192.168.1.100:8080</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">Chat Name</label>
              <input type="text" 
                     id="chat-name" 
                     class="form-input" 
                     placeholder="Chat with friend" 
                     autocomplete="off">
              <small class="form-hint">Optional: Give this chat a custom name</small>
            </div>
            
            <div class="form-actions">
              <button id="connect-btn" class="btn btn-primary">
                <span class="btn-icon">🔗</span>
                <span class="btn-text">Connect</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-tab-content" id="info-tab">
          <div class="tab-section">
            <h4 class="section-title">Your Connection Info</h4>
            <p class="section-description">Share this information with peers to connect to you</p>
            
            <div class="info-group">
              <label class="info-label">Server Status:</label>
              <div class="info-value">
                <span id="modal-server-status" class="status-indicator">Not started</span>
                <button id="start-server-btn" class="btn btn-success btn-small">
                  <span class="btn-icon">🚀</span>
                  <span class="btn-text">Start Server</span>
                </button>
              </div>
            </div>
            
            <div class="info-group">
              <label class="info-label">Your Address:</label>
              <div class="info-value">
                <code id="modal-my-address" class="address-display">Unknown</code>
                <button id="copy-address" class="btn btn-secondary btn-small" title="Copy address">
                  📋
                </button>
              </div>
            </div>
            
            <div class="info-group">
              <label class="info-label">Your Public Key:</label>
              <div class="info-value key-container">
                <textarea id="my-public-key" 
                          class="key-display" 
                          readonly 
                          placeholder="Public key will appear here..."></textarea>
                <button id="copy-key" class="btn btn-secondary btn-small" title="Copy public key">
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private setupTabSwitching(): void {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const tabButtons = modalElement.querySelectorAll('.modal-tab');
    const tabContents = modalElement.querySelectorAll('.modal-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = (button as HTMLElement).dataset.tab;
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
        const targetContent = modalElement.querySelector(`#${targetTab}-tab`);
        targetContent?.classList.add('active');
      });
    });
  }

  private setupEventListeners(): void {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    // Connect button
    const connectBtn = modalElement.querySelector('#connect-btn');
    connectBtn?.addEventListener('click', async () => {
      await this.handleConnect();
    });

    // Start server button
    const startServerBtn = modalElement.querySelector('#start-server-btn');
    startServerBtn?.addEventListener('click', async () => {
      await this.handleStartServer();
    });

    // Copy buttons
    this.setupCopyButtons(modalElement);

    // Enter key support for inputs
    const addressInput = modalElement.querySelector('#peer-address') as HTMLInputElement;
    const nameInput = modalElement.querySelector('#chat-name') as HTMLInputElement;

    [addressInput, nameInput].forEach(input => {
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleConnect();
        }
      });
    });
  }

  private setupCopyButtons(modalElement: Element): void {
    const copyAddressBtn = modalElement.querySelector('#copy-address');
    const copyKeyBtn = modalElement.querySelector('#copy-key');

    copyAddressBtn?.addEventListener('click', async () => {
      const addressElement = modalElement.querySelector('#modal-my-address');
      const address = addressElement?.textContent;
      
      if (address && address !== 'Unknown') {
        try {
          await navigator.clipboard.writeText(address);
          this.showCopySuccess(copyAddressBtn as HTMLElement);
        } catch (error) {
          console.error('Failed to copy address:', error);
          this.showCopyError(copyAddressBtn as HTMLElement);
        }
      }
    });

    copyKeyBtn?.addEventListener('click', async () => {
      const keyTextarea = modalElement.querySelector('#my-public-key') as HTMLTextAreaElement;
      const key = keyTextarea?.value;
      
      if (key) {
        try {
          await navigator.clipboard.writeText(key);
          this.showCopySuccess(copyKeyBtn as HTMLElement);
        } catch (error) {
          console.error('Failed to copy key:', error);
          this.showCopyError(copyKeyBtn as HTMLElement);
        }
      }
    });
  }

  private async handleConnect(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const addressInput = modalElement.querySelector('#peer-address') as HTMLInputElement;
    const nameInput = modalElement.querySelector('#chat-name') as HTMLInputElement;
    const connectBtn = modalElement.querySelector('#connect-btn') as HTMLButtonElement;
    
    const address = addressInput?.value.trim();
    const name = nameInput?.value.trim() || 'Unknown Peer';

    if (!address) {
      this.showError('Please enter a peer address');
      addressInput?.focus();
      return;
    }

    if (!this.callbacks.onConnect) {
      this.showError('Connection handler not available');
      return;
    }

    // Show loading state
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Connecting...</span>';
    connectBtn.classList.add('loading');

    try {
      await this.callbacks.onConnect(address, name);
      
      // Success - close modal and clear inputs
      this.close();
      addressInput.value = '';
      nameInput.value = '';
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.showError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Restore button state
      connectBtn.disabled = false;
      connectBtn.innerHTML = '<span class="btn-icon">🔗</span><span class="btn-text">Connect</span>';
      connectBtn.classList.remove('loading');
    }
  }

  private async handleStartServer(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const startServerBtn = modalElement.querySelector('#start-server-btn') as HTMLButtonElement;
    
    if (!this.callbacks.onStartServer) {
      this.showError('Server start handler not available');
      return;
    }

    // Show loading state
    startServerBtn.disabled = true;
    startServerBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Starting...</span>';
    startServerBtn.classList.add('loading');

    try {
      await this.callbacks.onStartServer();
      // Success state will be handled by updateServerInfo when callback completes
    } catch (error) {
      console.error('Failed to start server:', error);
      this.showError(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Restore button state on error
      startServerBtn.disabled = false;
      startServerBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Start Server</span>';
      startServerBtn.classList.remove('loading');
    }
  }

  private showCopySuccess(button: HTMLElement): void {
    const originalText = button.innerHTML;
    const originalClass = button.className;
    
    button.innerHTML = '✅';
    button.className = originalClass + ' success';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.className = originalClass;
    }, 2000);
  }

  private showCopyError(button: HTMLElement): void {
    const originalText = button.innerHTML;
    const originalClass = button.className;
    
    button.innerHTML = '❌';
    button.className = originalClass + ' error';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.className = originalClass;
    }, 2000);
  }

  private showError(message: string): void {
    // Create or update error message element
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    let errorElement = modalElement.querySelector('.error-message') as HTMLElement;
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      
      // Insert at the beginning of the modal content
      const modalContent = modalElement.querySelector('.new-chat-content');
      modalContent?.insertBefore(errorElement, modalContent.firstChild);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 5000);
  }

  // Public methods
  public open(): void {
    this.modal.open();
    // Update connection info when opening
    this.updateConnectionInfo();
  }

  public close(): void {
    this.modal.close();
  }

  public toggle(): void {
    this.modal.toggle();
    if (this.modal.isOpen()) {
      this.updateConnectionInfo();
    }
  }

  public updateServerInfo(address: string, port: number): void {
    this.serverInfo = { address, port };
    
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const serverStatus = modalElement.querySelector('#modal-server-status');
    const myAddress = modalElement.querySelector('#modal-my-address');
    const startServerBtn = modalElement.querySelector('#start-server-btn') as HTMLButtonElement;

    if (serverStatus) {
      serverStatus.textContent = 'Running';
      serverStatus.className = 'status-indicator status-running';
    }

    if (myAddress) {
      myAddress.textContent = `${address}:${port}`;
    }

    if (startServerBtn) {
      startServerBtn.disabled = true;
      startServerBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Server Running</span>';
      startServerBtn.classList.remove('loading');
    }
  }

  public async updateConnectionInfo(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    // Update public key if crypto API is available
    if (window.electronAPI?.crypto) {
      try {
        const publicKey = await window.electronAPI.crypto.getPublicKey();
        const keyTextarea = modalElement.querySelector('#my-public-key') as HTMLTextAreaElement;
        
        if (keyTextarea && publicKey) {
          keyTextarea.value = publicKey;
        }
      } catch (error) {
        console.error('Failed to get public key:', error);
      }
    }
  }

  public setCallbacks(callbacks: NewChatModalCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  cleanup(): void {
    this.modal?.cleanup();
    console.log('🧹 NewChatModal cleaned up');
  }
}