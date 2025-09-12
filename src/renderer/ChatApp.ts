import { DebugPanel } from './DebugPanel';
import type { IdentityKeys, Message, Chat, PeerInfo } from '../types/electron';

interface InitStatus {
  step: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp: number;
}

export class ChatApp {
  private identityKeys: IdentityKeys | null = null;
  private initSteps: InitStatus[] = [];
  private debugPanel: DebugPanel;
  private currentChatId: string | null = null;
  private chats: Map<string, Chat> = new Map();
  private serverInfo: { port: number; address: string } | null = null;

  constructor() {
    this.debugPanel = new DebugPanel();
  }

  async initialize(): Promise<void> {
    console.log('🔧 ChatApp: Starting initialization...');
    
    // Wait a bit for preload to fully load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize debug panel first
    console.log('🔧 ChatApp: Initializing debug panel...');
    this.debugPanel.initialize();
    console.log('🔧 ChatApp: Debug panel initialized');
    
    this.addInitStep('UI Setup', 'pending');
    await this.setupUI();
    this.addInitStep('UI Setup', 'success');

    this.addInitStep('ElectronAPI Check', 'pending');
    await this.checkElectronAPI();

    this.addInitStep('Crypto Initialization', 'pending');
    await this.initializeCrypto();

    this.addInitStep('Network Setup', 'pending');
    await this.setupNetworking();

    this.addInitStep('Chat Loading', 'pending');
    await this.loadExistingChats();

    console.log('🔧 ChatApp: Initialization complete');
  }

  private addInitStep(step: string, status: 'pending' | 'success' | 'error', message?: string): void {
    const newStep: InitStatus = {
      step,
      status,
      message,
      timestamp: Date.now()
    };

    const existingIndex = this.initSteps.findIndex(s => s.step === step);
    if (existingIndex !== -1) {
      this.initSteps[existingIndex] = newStep;
    } else {
      this.initSteps.push(newStep);
    }

    // Log to debug system
    if (window.electronAPI?.debug) {
      const logLevel = status === 'error' ? 'error' : 'info';
      window.electronAPI.debug.addLog({
        level: logLevel,
        component: 'ChatApp',
        message: `${step}: ${status}`,
        data: message ? { message } : undefined
      });
    }

    this.updateInitStatus();
  }

  private async checkElectronAPI(): Promise<void> {
    try {
      console.log('🔧 Checking ElectronAPI availability...');
      
      if (typeof window.electronAPI === 'undefined') {
        throw new Error('window.electronAPI is undefined - preload script not loaded');
      }

      console.log('🔧 ElectronAPI found:', Object.keys(window.electronAPI));

      const apis: (keyof typeof window.electronAPI)[] = ['crypto', 'db', 'permission', 'debug', 'transport'];
      const missingApis: string[] = [];

      for (const api of apis) {
        if (!window.electronAPI[api]) {
          missingApis.push(api);
        }
      }

      if (missingApis.length > 0) {
        throw new Error(`Missing APIs: ${missingApis.join(', ')}`);
      }

      this.addInitStep('ElectronAPI Check', 'success', 'All APIs available');
      
    } catch (error) {
      console.error('🔧 ElectronAPI check failed:', error);
      this.addInitStep('ElectronAPI Check', 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async setupUI(): Promise<void> {
    document.body.innerHTML = `
      <div id="app">
        <header class="app-header">
          <h1>🔒 Secure Chat</h1>
          <div class="app-status-container">
            <span id="app-status" class="app-status">🔄 Starting...</span>
          </div>
        </header>
        
        <main class="app-main">
          <aside class="chat-list">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <button id="new-chat-btn">+ New Chat</button>
            </div>
            <ul id="chat-list"></ul>
            <div class="connection-info">
              <div id="server-status">Server: Not started</div>
              <div id="my-address">Address: Unknown</div>
            </div>
          </aside>
          
          <section class="chat-view">
            <div class="chat-header">
              <h3 id="chat-title">Select a chat</h3>
              <div id="chat-status"></div>
            </div>
            <div class="messages" id="messages">
              <div class="welcome-message">
                <h3>🔒 Welcome to Secure Chat</h3>
                <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
                <p>Click "New Chat" to connect to a peer or start your first conversation.</p>
              </div>
            </div>
            <div class="message-composer">
              <input type="file" id="image-input" accept="image/*" style="display: none;">
              <button id="image-btn" class="image-btn" disabled title="Send Image">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>

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

      <!-- Image Preview Modal -->
      <div id="image-preview-modal" class="modal">
        <div class="modal-content image-modal">
          <div class="modal-header">
            <h3>📷 Image Preview</h3>
            <button class="modal-close" id="image-preview-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="image-preview-container">
              <img id="preview-image" alt="Image preview" />
              <div class="image-info">
                <p id="image-filename">filename.jpg</p>
                <p id="image-size">Size: 0 KB</p>
              </div>
            </div>
            <div class="image-actions">
              <button id="send-image-btn" class="primary-btn">📤 Send Image</button>
              <button id="cancel-image-btn" class="secondary-btn">❌ Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    
    const debugToggle = document.getElementById('debug-toggle');
    console.log('🔧 Debug toggle found:', debugToggle ? 'YES' : 'NO');
    
    if (!debugToggle) {
      console.error('🔧 Debug toggle not found! Re-initializing debug panel...');
      setTimeout(() => {
        this.debugPanel.initialize();
      }, 1000);
    }
  }

  private setupEventListeners(): void {
    // Message sending
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const newChatBtn = document.getElementById('new-chat-btn');

    // Image handling
    const imageBtn = document.getElementById('image-btn');
    const imageInput = document.getElementById('image-input') as HTMLInputElement;
    const sendImageBtn = document.getElementById('send-image-btn');
    const cancelImageBtn = document.getElementById('cancel-image-btn');
    const imagePreviewClose = document.getElementById('image-preview-close');
    const imagePreviewModal = document.getElementById('image-preview-modal');

    sendBtn?.addEventListener('click', () => this.sendMessage());
    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    newChatBtn?.addEventListener('click', () => this.showNewChatModal());

    // Image upload handlers
    imageBtn?.addEventListener('click', () => {
      if (!imageInput.disabled) {
        imageInput.click();
      }
    });

    imageInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.showImagePreview(file);
      }
    });

    sendImageBtn?.addEventListener('click', () => this.sendImage());
    cancelImageBtn?.addEventListener('click', () => this.hideImagePreview());
    imagePreviewClose?.addEventListener('click', () => this.hideImagePreview());
    imagePreviewModal?.addEventListener('click', (e) => {
      if (e.target === imagePreviewModal) this.hideImagePreview();
    });

    // Modal controls
    const modalClose = document.getElementById('modal-close');
    const modal = document.getElementById('new-chat-modal');
    
    modalClose?.addEventListener('click', () => this.hideNewChatModal());
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.hideNewChatModal();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
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

    // Transport event listeners
    if (window.electronAPI?.transport) {
      window.electronAPI.transport.onPeerConnected((chatId, peerInfo) => {
        console.log('🔗 Peer connected:', chatId, peerInfo);
        this.handlePeerConnected(chatId, peerInfo);
      });

      window.electronAPI.transport.onPeerDisconnected((chatId) => {
        console.log('🔗 Peer disconnected:', chatId);
        this.handlePeerDisconnected(chatId);
      });

      window.electronAPI.transport.onMessage((chatId, data) => {
        console.log('📨 Message received:', chatId, data);
        this.handleIncomingMessage(chatId, data);
      });
    }
  }

  private async setupNetworking(): Promise<void> {
    try {
      // Start the server automatically on a random port
      this.serverInfo = await window.electronAPI.transport.startServer();
      this.addInitStep('Network Setup', 'success', 
        `Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`);
      this.updateServerStatus();
    } catch (error) {
      this.addInitStep('Network Setup', 'error', 
        error instanceof Error ? error.message : 'Failed to start server');
    }
  }

  private async loadExistingChats(): Promise<void> {
    try {
      const chats = await window.electronAPI.db.getChats();
      this.chats.clear();
      
      for (const chat of chats) {
        this.chats.set(chat.id, chat);
      }
      
      this.renderChatList();
      this.addInitStep('Chat Loading', 'success', `Loaded ${chats.length} chats`);
    } catch (error) {
      this.addInitStep('Chat Loading', 'error', 
        error instanceof Error ? error.message : 'Failed to load chats');
    }
  }

  private updateInitStatus(): void {
    const statusEl = document.getElementById('app-status');
    if (!statusEl) return;

    const pendingSteps = this.initSteps.filter(s => s.status === 'pending');
    const errorSteps = this.initSteps.filter(s => s.status === 'error');
    const successSteps = this.initSteps.filter(s => s.status === 'success');

    const hasElectronAPI = typeof window.electronAPI !== 'undefined';
    const hasCryptoAPI = typeof window.electronAPI?.crypto !== 'undefined';
    const hasDbAPI = typeof window.electronAPI?.db !== 'undefined';
    const hasIdentityKeys = this.identityKeys !== null;
    const hasNetworking = this.serverInfo !== null;

    if (errorSteps.length > 0) {
      statusEl.textContent = '🔴 App is not safe';
      statusEl.className = 'app-status error';
    } else if (pendingSteps.length > 0) {
      statusEl.textContent = '🔄 Starting...';
      statusEl.className = 'app-status pending';
    } else if (
      successSteps.length >= 4 && 
      hasElectronAPI && 
      hasCryptoAPI && 
      hasDbAPI && 
      hasIdentityKeys &&
      hasNetworking
    ) {
      statusEl.textContent = '🟢 App is safe';
      statusEl.className = 'app-status safe';
    } else {
      const issues: string[] = [];
      if (!hasElectronAPI) issues.push('No ElectronAPI');
      if (!hasCryptoAPI) issues.push('No Crypto');
      if (!hasDbAPI) issues.push('No Database');
      if (!hasIdentityKeys) issues.push('No Identity');
      if (!hasNetworking) issues.push('No Network');
      
      statusEl.textContent = '🟡 App is not safe';
      statusEl.className = 'app-status warning';
      statusEl.title = `Issues: ${issues.join(', ')}`;
    }
  }

  private async initializeCrypto(): Promise<void> {
    try {
      if (typeof window.electronAPI === 'undefined') {
        throw new Error('ElectronAPI not available - preload script may not be loaded');
      }

      if (!window.electronAPI.crypto) {
        throw new Error('Crypto API not available');
      }

      this.addInitStep('Crypto Initialization', 'pending', 'Generating identity keys...');
      
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Crypto initialization timeout')), 10000)
      );

      const cryptoPromise = window.electronAPI.crypto.generateIdentity();
      
      this.identityKeys = await Promise.race([cryptoPromise, timeout]);
      
      this.addInitStep('Crypto Initialization', 'success', 
        `Generated ${this.identityKeys.publicKey.length} char public key`);
      
    } catch (error) {
      console.error('Failed to initialize crypto:', error);
      this.addInitStep('Crypto Initialization', 'error', 
        `${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Chat UI Management
  private showNewChatModal(): void {
    const modal = document.getElementById('new-chat-modal');
    const app = document.getElementById('app');
    if (modal) {
      modal.classList.add('show');
      this.updateModalInfo();
      if (app) {
        app.classList.add('blurred');
        app.classList.add('modal-animate-in');
        setTimeout(() => app.classList.remove('modal-animate-in'), 400);
      }
    }
  }

  private hideNewChatModal(): void {
    const modal = document.getElementById('new-chat-modal');
    const app = document.getElementById('app');
    if (modal) {
      modal.classList.remove('show');
      if (app) {
        app.classList.remove('blurred');
        app.classList.add('modal-animate-out');
        setTimeout(() => app.classList.remove('modal-animate-out'), 400);
      }
    }
  }

  private switchTab(tabName: string): void {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
  }

  private async updateModalInfo(): Promise<void> {
    const serverStatusEl = document.getElementById('modal-server-status');
    const myAddressEl = document.getElementById('modal-my-address');
    const myPublicKeyEl = document.getElementById('my-public-key') as HTMLTextAreaElement;

    if (serverStatusEl) {
      serverStatusEl.textContent = this.serverInfo ? 'Running' : 'Not started';
    }

    if (myAddressEl && this.serverInfo) {
      myAddressEl.textContent = `${this.serverInfo.address}:${this.serverInfo.port}`;
    }

    if (myPublicKeyEl && this.identityKeys) {
      myPublicKeyEl.value = this.identityKeys.publicKey;
    }
  }

  private async startServer(): Promise<void> {
    try {
      this.serverInfo = await window.electronAPI.transport.startServer();
      this.updateServerStatus();
      this.updateModalInfo();
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  }

  private updateServerStatus(): void {
    const serverStatusEl = document.getElementById('server-status');
    const myAddressEl = document.getElementById('my-address');

    if (serverStatusEl) {
      serverStatusEl.textContent = this.serverInfo ? 
        'Server: Running' : 'Server: Not started';
    }

    if (myAddressEl && this.serverInfo) {
      myAddressEl.textContent = `Address: ${this.serverInfo.address}:${this.serverInfo.port}`;
    }
  }

  // Chat functionality
  private async connectToPeer(): Promise<void> {
    const addressInput = document.getElementById('peer-address') as HTMLInputElement;
    const nameInput = document.getElementById('chat-name') as HTMLInputElement;
    
    const addressText = addressInput.value.trim();
    const chatName = nameInput.value.trim() || 'New Chat';

    if (!addressText) {
      alert('Please enter a peer address');
      return;
    }

    try {
      const [address, portStr] = addressText.split(':');
      const port = parseInt(portStr);

      if (!address || !port) {
        throw new Error('Invalid address format. Use IP:PORT');
      }

      console.log(`Connecting to ${address}:${port}...`);
      const connected = await window.electronAPI.transport.connect(address, port);
      
      if (connected) {
        console.log('Successfully connected to peer');
        this.hideNewChatModal();
        
        // Clear the form
        addressInput.value = '';
        nameInput.value = '';
      } else {
        alert('Failed to connect to peer');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handlePeerConnected(chatId: string, peerInfo: PeerInfo): Promise<void> {
    // Create a new chat
    const chat: Omit<Chat, 'id'> = {
      name: `Chat with ${peerInfo.name}`,
      participants: ['me', peerInfo.id],
      peerAddress: peerInfo.address,
      peerPublicKey: peerInfo.publicKey
    };

    try {
      const savedChat = await window.electronAPI.db.saveChat(chat);
      this.chats.set(savedChat.id, { ...savedChat, id: chatId }); // Use transport chatId
      this.renderChatList();
      
      // Auto-select this chat
      this.selectChat(chatId);
    } catch (error) {
      console.error('Failed to save new chat:', error);
    }
  }

  private handlePeerDisconnected(chatId: string): void {
    const chat = this.chats.get(chatId);
    if (chat) {
      // Update chat status or remove it
      this.renderChatList();
      
      if (this.currentChatId === chatId) {
        this.currentChatId = null;
        this.renderMessages();
        this.updateChatHeader();
      }
    }
  }

  private async handleIncomingMessage(chatId: string, data: any): Promise<void> {
    try {
      // Save the incoming message
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content: data.content || data.message || String(data),
        sender: 'peer',
        encrypted: false // We'll handle encryption later
      };

      await window.electronAPI.db.saveMessage(message);
      
      // If this chat is currently active, refresh the messages
      if (this.currentChatId === chatId) {
        this.renderMessages();
      }
      
      // Update chat list to show new message
      this.renderChatList();
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  private renderChatList(): void {
    const chatListEl = document.getElementById('chat-list');
    if (!chatListEl) return;

    if (this.chats.size === 0) {
      chatListEl.innerHTML = '<li class="no-chats">No chats yet. Create one!</li>';
      return;
    }

    chatListEl.innerHTML = Array.from(this.chats.values()).map(chat => `
      <li class="chat-item ${this.currentChatId === chat.id ? 'active' : ''}" 
          data-chat-id="${chat.id}">
        <div class="chat-name">${chat.name}</div>
        <div class="chat-preview">
          ${chat.lastMessage ? chat.lastMessage.content.substring(0, 50) + '...' : 'No messages yet'}
        </div>
        <div class="chat-time">
          ${chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString() : ''}
        </div>
      </li>
    `).join('');

    // Add click listeners
    chatListEl.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = (item as HTMLElement).dataset.chatId;
        if (chatId) this.selectChat(chatId);
      });
    });
  }

  private async selectChat(chatId: string): Promise<void> {
    this.currentChatId = chatId;
    this.renderChatList(); // Update active state
    this.updateChatHeader();
    await this.renderMessages();
    
    // Enable message input
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
    
    if (messageInput) messageInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
  }

  private updateChatHeader(): void {
    const chatTitleEl = document.getElementById('chat-title');
    const chatStatusEl = document.getElementById('chat-status');
    
    if (!this.currentChatId) {
      if (chatTitleEl) chatTitleEl.textContent = 'Select a chat';
      if (chatStatusEl) chatStatusEl.textContent = '';
      return;
    }

    const chat = this.chats.get(this.currentChatId);
    if (chat) {
      if (chatTitleEl) chatTitleEl.textContent = chat.name;
      if (chatStatusEl) chatStatusEl.textContent = `Connected to ${chat.peerAddress}`;
    }
  }

  private async renderMessages(): Promise<void> {
    const messagesEl = document.getElementById('messages');
    if (!messagesEl || !this.currentChatId) {
      if (messagesEl) {
        messagesEl.innerHTML = `
          <div class="welcome-message">
            <h3>🔒 Welcome to Secure Chat</h3>
            <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
            <p>Click "New Chat" to connect to a peer or start your first conversation.</p>
          </div>
        `;
      }
      return;
    }

    try {
      const messages = await window.electronAPI.db.getMessages(this.currentChatId);
      
      if (messages.length === 0) {
        messagesEl.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
        return;
      }

      messagesEl.innerHTML = messages.map(message => `
        <div class="message ${message.sender === 'me' ? 'sent' : 'received'}">
          <div class="message-content">${message.content}</div>
          <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
          <div class="message-sender">${message.sender}</div>
        </div>
      `).join('');

      // Scroll to bottom
      messagesEl.scrollTop = messagesEl.scrollHeight;
    } catch (error) {
      console.error('Failed to render messages:', error);
    }
  }

  private async sendMessage(): Promise<void> {
    const input = document.getElementById('message-input') as HTMLInputElement;
    const messageText = input.value.trim();
    
    if (!messageText || !this.currentChatId) return;

    try {
      // Save the message locally
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.currentChatId,
        content: messageText,
        sender: 'me',
        encrypted: false
      };

      await window.electronAPI.db.saveMessage(message);
      
      // Send the message to the peer
      await window.electronAPI.transport.send(this.currentChatId, {
        content: messageText,
        timestamp: Date.now()
      });

      // Clear input and refresh messages
      input.value = '';
      await this.renderMessages();
      this.renderChatList(); // Update last message
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  }

  private async copyToClipboard(type: 'address' | 'key'): Promise<void> {
    try {
      let textToCopy = '';
      
      if (type === 'address' && this.serverInfo) {
        textToCopy = `${this.serverInfo.address}:${this.serverInfo.port}`;
      } else if (type === 'key' && this.identityKeys) {
        textToCopy = this.identityKeys.publicKey;
      }

      await navigator.clipboard.writeText(textToCopy);
      
      // Visual feedback
      const button = document.getElementById(type === 'address' ? 'copy-address' : 'copy-key');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}