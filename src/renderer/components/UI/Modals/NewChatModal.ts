import { EventBus } from '../../Utils/EventBus';
import type { UIComponent } from '../../../types/components';

export class NewChatModal implements UIComponent {
  private eventBus = EventBus.getInstance();
  private isVisible = false;
  private currentTab: 'connect' | 'info' = 'connect';

  async initialize(): Promise<void> {
    this.render();
    this.setupEventListeners();
  }

  render(): void {
    // Create the modal HTML
    const modalHTML = `
      <!-- New Chat Modal -->
      <div id="new-chat-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>🆕 Create New Chat</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="connection-tabs">
              <button class="tab-btn active" data-tab="connect">Connect to Peer</button>
              <button class="tab-btn" data-tab="info">My Connection Info</button>
            </div>
            
            <div class="tab-content active" id="connect-tab">
              <div class="form-group">
                <label>Peer Address (IP:Port)</label>
                <input type="text" id="peer-address" placeholder="127.0.0.1:8080" />
              </div>
              <div class="form-group">
                <label>Chat Name</label>
                <input type="text" id="chat-name" placeholder="Chat with friend" />
              </div>
              <button id="connect-btn" class="primary-btn">Connect</button>
            </div>
            
            <div class="tab-content" id="info-tab">
              <div class="info-section">
                <h4>📡 Your Connection Info</h4>
                <div class="info-item">
                  <label>Server Status:</label>
                  <span id="modal-server-status">Not started</span>
                </div>
                <div class="info-item">
                  <label>Your Address:</label>
                  <span id="modal-my-address">Unknown</span>
                  <button id="copy-address" class="copy-btn">📋</button>
                </div>
                <div class="info-item">
                  <label>Your Public Key:</label>
                  <textarea id="my-public-key" readonly></textarea>
                  <button id="copy-key" class="copy-btn">📋</button>
                </div>
              </div>
              <button id="start-server-btn" class="primary-btn">Start Server</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append to body if not already there
    if (!document.getElementById('new-chat-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  private setupEventListeners(): void {
    // Modal close handlers
    const modalClose = document.getElementById('modal-close');
    const modal = document.getElementById('new-chat-modal');
    
    modalClose?.addEventListener('click', () => this.hide());
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab as 'connect' | 'info';
        if (tabName) this.switchTab(tabName);
      });
    });

    // Connection actions
    const connectBtn = document.getElementById('connect-btn');
    const startServerBtn = document.getElementById('start-server-btn');
    const copyAddressBtn = document.getElementById('copy-address');
    const copyKeyBtn = document.getElementById('copy-key');

    connectBtn?.addEventListener('click', () => this.connectToPeer());
    startServerBtn?.addEventListener('click', () => this.startServer());
    copyAddressBtn?.addEventListener('click', () => this.copyToClipboard('address'));
    copyKeyBtn?.addEventListener('click', () => this.copyToClipboard('key'));

    // Listen for external events to update modal info
    this.eventBus.on('network:server-started', (serverInfo: { address: string; port: number }) => {
      this.updateServerInfo(serverInfo);
    });

    this.eventBus.on('crypto:identity-ready', (publicKey: string) => {
      this.updatePublicKey(publicKey);
    });
  }

  show(): void {
    const modal = document.getElementById('new-chat-modal');
    const app = document.getElementById('app');
    
    if (modal) {
      modal.classList.add('show');
      this.isVisible = true;
      
      // Add blur effect to background
      if (app) {
        app.classList.add('blurred');
        app.classList.add('modal-animate-in');
        setTimeout(() => app.classList.remove('modal-animate-in'), 400);
      }
      
      // Update modal info when shown
      this.updateModalInfo();
    }
  }

  hide(): void {
    const modal = document.getElementById('new-chat-modal');
    const app = document.getElementById('app');
    
    if (modal) {
      modal.classList.remove('show');
      this.isVisible = false;
      
      // Remove blur effect from background
      if (app) {
        app.classList.remove('blurred');
        app.classList.add('modal-animate-out');
        setTimeout(() => app.classList.remove('modal-animate-out'), 400);
      }
    }
  }

  private switchTab(tabName: 'connect' | 'info'): void {
    this.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    targetBtn?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const targetContent = document.getElementById(`${tabName}-tab`);
    targetContent?.classList.add('active');
  }

  private async connectToPeer(): Promise<void> {
    const peerAddressInput = document.getElementById('peer-address') as HTMLInputElement;
    const chatNameInput = document.getElementById('chat-name') as HTMLInputElement;
    
    const peerAddress = peerAddressInput.value.trim();
    const chatName = chatNameInput.value.trim();
    
    if (!peerAddress) {
      alert('Please enter a peer address');
      return;
    }
    
    try {
      const [ip, port] = peerAddress.split(':');
      const portNum = parseInt(port);
      
      if (!ip || !portNum) {
        throw new Error('Invalid address format. Use IP:PORT');
      }
      
      console.log(`Connecting to ${ip}:${portNum}...`);
      
      // Emit connection request via EventBus
      this.eventBus.emit('network:connect-request', {
        address: ip,
        port: portNum,
        chatName: chatName || `Chat with ${ip}:${portNum}`
      });
      
      // Clear inputs and hide modal
      peerAddressInput.value = '';
      chatNameInput.value = '';
      this.hide();
      
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async startServer(): Promise<void> {
    try {
      // Emit server start request via EventBus
      this.eventBus.emit('network:start-server-request');
      
    } catch (error) {
      console.error('Failed to start server:', error);
      alert('Failed to start server');
    }
  }

  private async copyToClipboard(type: 'address' | 'key'): Promise<void> {
    try {
      let textToCopy = '';
      
      if (type === 'address') {
        const addressEl = document.getElementById('modal-my-address');
        textToCopy = addressEl?.textContent || '';
      } else if (type === 'key') {
        const keyEl = document.getElementById('my-public-key') as HTMLTextAreaElement;
        textToCopy = keyEl?.value || '';
      }
      
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        
        // Show feedback
        const button = document.getElementById(type === 'address' ? 'copy-address' : 'copy-key');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✅';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  }

  private updateModalInfo(): void {
    // Request fresh info from components
    this.eventBus.emit('network:get-server-info');
    this.eventBus.emit('crypto:get-public-key');
  }

  private updateServerInfo(serverInfo: { address: string; port: number }): void {
    const serverStatusEl = document.getElementById('modal-server-status');
    const myAddressEl = document.getElementById('modal-my-address');
    
    if (serverStatusEl) {
      serverStatusEl.textContent = 'Running';
    }
    
    if (myAddressEl) {
      myAddressEl.textContent = `${serverInfo.address}:${serverInfo.port}`;
    }
  }

  private updatePublicKey(publicKey: string): void {
    const publicKeyEl = document.getElementById('my-public-key') as HTMLTextAreaElement;
    if (publicKeyEl) {
      publicKeyEl.value = publicKey;
    }
  }

  isOpen(): boolean {
    return this.isVisible;
  }

  cleanup(): void {
    // Remove event listeners
    this.eventBus.off('network:server-started', this.updateServerInfo.bind(this));
    this.eventBus.off('crypto:identity-ready', this.updatePublicKey.bind(this));
    
    // Remove modal from DOM
    const modal = document.getElementById('new-chat-modal');
    if (modal) {
      modal.remove();
    }
  }
}