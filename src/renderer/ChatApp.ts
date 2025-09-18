import { DebugPanel } from './DebugPanel';
import { Modal } from './components/Modal';
import { TabSystem } from './components/TabSystem';
import { ConnectionTab } from './components/ConnectionTab';
import { ConnectionInfoTab } from './components/ConnectionInfoTab';
import type { Component } from './types/components';
import type { Message, Chat, PeerInfo } from '../types/index';

// Simple EventBus implementation
class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): EventBus {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args));
    }
  }
}

export class ChatApp implements Component {
  protected eventBus = EventBus.getInstance();
  protected components: Map<string, Component> = new Map();
  
  // UI State
  protected currentChatId: string | null = null;
  protected chats: Map<string, Chat> = new Map();
  
  // Modal components
  private newChatModal: Modal | null = null;
  private tabSystem: TabSystem | null = null;
  private connectionTab: ConnectionTab | null = null;
  private connectionInfoTab: ConnectionInfoTab | null = null;

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Only initialize components that exist
    try {
      this.components.set('debug', new DebugPanel());
      console.log('✅ DebugPanel component initialized');
    } catch (error) {
      console.warn('⚠️ DebugPanel not available:', error);
    }
    
    console.log('🔧 Initializing modal components...');
  }

  private async initializeNewChatModal(): Promise<void> {
    try {
      console.log('🔧 Creating basic modal without complex components...');
      
      // Create a simple modal without TabSystem dependencies first
      this.newChatModal = new Modal(
        'new-chat-modal',
        '🆕 Create New Chat',
        `
          <div style="padding: 2rem;">
            <div class="simple-tabs" style="display: flex; margin-bottom: 2rem; border-bottom: 1px solid #404040;">
              <button class="simple-tab active" data-tab="connect" style="flex: 1; padding: 1rem; background: #2d2d2d; color: white; border: none; cursor: pointer;">
                🌐 Connect to Peer
              </button>
              <button class="simple-tab" data-tab="info" style="flex: 1; padding: 1rem; background: #1a1a1a; color: #888; border: none; cursor: pointer;">
                📡 My Connection Info
              </button>
            </div>
            
            <div class="simple-tab-content active" id="connect-content">
              <h4>Connect to Peer</h4>
              <div style="margin: 1rem 0;">
                <label style="display: block; margin-bottom: 0.5rem;">Peer Address (IP:Port)</label>
                <input type="text" id="simple-peer-address" placeholder="127.0.0.1:8080" style="width: 100%; padding: 0.75rem; background: #1a1a1a; border: 1px solid #404040; color: white; border-radius: 4px;">
              </div>
              <div style="margin: 1rem 0;">
                <label style="display: block; margin-bottom: 0.5rem;">Chat Name</label>
                <input type="text" id="simple-chat-name" placeholder="Chat with friend" style="width: 100%; padding: 0.75rem; background: #1a1a1a; border: 1px solid #404040; color: white; border-radius: 4px;">
              </div>
              <button id="simple-connect-btn" style="padding: 0.75rem 1.5rem; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                Connect
              </button>
            </div>
            
            <div class="simple-tab-content" id="info-content" style="display: none;">
              <h4>📡 Your Connection Info</h4>
              <div style="margin: 1rem 0;">
                <label style="display: block; margin-bottom: 0.5rem;">Server Status:</label>
                <span id="modal-server-status" style="color: #888;">Not started</span>
              </div>
              <div style="margin: 1rem 0;">
                <label style="display: block; margin-bottom: 0.5rem;">Your Address:</label>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span id="modal-my-address" style="color: #888;">Unknown</span>
                  <button id="copy-address" style="padding: 0.25rem 0.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">📋</button>
                </div>
              </div>
              <div style="margin: 1rem 0;">
                <label style="display: block; margin-bottom: 0.5rem;">Your Public Key:</label>
                <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                  <textarea id="my-public-key" readonly style="flex: 1; min-height: 100px; padding: 0.5rem; background: #1a1a1a; border: 1px solid #404040; color: white; border-radius: 4px; font-family: monospace; font-size: 0.8rem;"></textarea>
                  <button id="copy-key" style="padding: 0.25rem 0.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">📋</button>
                </div>
              </div>
              <button id="start-server-btn" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                Start Server
              </button>
            </div>
          </div>
        `,
        'new-chat-modal'
      );

      await this.newChatModal.initialize();
      
      // Add simple tab switching
      this.setupSimpleTabSwitching();
      
      // Add simple event listeners
      this.setupSimpleModalEventListeners();

      console.log('✅ Simple modal created successfully');

    } catch (error) {
      console.error('❌ Failed to create modal:', error);
      throw error;
    }
  }

  private setupSimpleTabSwitching(): void {
    const modal = this.newChatModal?.modal;
    if (!modal) return;

    const tabButtons = modal.querySelectorAll('.simple-tab');
    const tabContents = modal.querySelectorAll('.simple-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = (button as HTMLElement).dataset.tab;
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          (btn as HTMLElement).style.background = '#1a1a1a';
          (btn as HTMLElement).style.color = '#888';
        });
        
        tabContents.forEach(content => {
          content.classList.remove('active');
          (content as HTMLElement).style.display = 'none';
        });
        
        // Add active class to clicked tab
        button.classList.add('active');
        (button as HTMLElement).style.background = '#2d2d2d';
        (button as HTMLElement).style.color = 'white';
        
        // Show corresponding content
        const targetContent = modal.querySelector(`#${targetTab}-content`);
        if (targetContent) {
          targetContent.classList.add('active');
          (targetContent as HTMLElement).style.display = 'block';
        }
      });
    });
  }

  private setupSimpleModalEventListeners(): void {
    const modal = this.newChatModal?.modal;
    if (!modal) return;

    // Connect button
    const connectBtn = modal.querySelector('#simple-connect-btn');
    connectBtn?.addEventListener('click', async () => {
      const addressInput = modal.querySelector('#simple-peer-address') as HTMLInputElement;
      const nameInput = modal.querySelector('#simple-chat-name') as HTMLInputElement;
      
      const address = addressInput?.value.trim();
      const name = nameInput?.value.trim() || 'Unknown';

      if (!address) {
        alert('Please enter a peer address');
        return;
      }

      try {
        await this.handlePeerConnection(address, name);
        this.newChatModal?.close();
        // Clear inputs
        if (addressInput) addressInput.value = '';
        if (nameInput) nameInput.value = '';
      } catch (error) {
        console.error('Connection failed:', error);
        alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Start server button
    const startServerBtn = modal.querySelector('#start-server-btn');
    startServerBtn?.addEventListener('click', async () => {
      try {
        await this.handleStartServer();
      } catch (error) {
        console.error('Failed to start server:', error);
        alert(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Copy buttons
    const copyAddressBtn = modal.querySelector('#copy-address');
    const copyKeyBtn = modal.querySelector('#copy-key');

    copyAddressBtn?.addEventListener('click', async () => {
      const addressSpan = modal.querySelector('#modal-my-address');
      const address = addressSpan?.textContent;
      if (address && address !== 'Unknown') {
        try {
          await navigator.clipboard.writeText(address);
          const btn = copyAddressBtn as HTMLElement;
          const originalText = btn.textContent;
          btn.textContent = '✅';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        } catch (error) {
          console.error('Failed to copy address:', error);
        }
      }
    });

    copyKeyBtn?.addEventListener('click', async () => {
      const keyTextarea = modal.querySelector('#my-public-key') as HTMLTextAreaElement;
      const key = keyTextarea?.value;
      if (key) {
        try {
          await navigator.clipboard.writeText(key);
          const btn = copyKeyBtn as HTMLElement;
          const originalText = btn.textContent;
          btn.textContent = '✅';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        } catch (error) {
          console.error('Failed to copy key:', error);
        }
      }
    });
  }

  private async handlePeerConnection(address: string, name: string): Promise<void> {
    const [ip, portStr] = address.split(':');
    const port = parseInt(portStr);
    
    if (!ip || !port) {
      throw new Error('Invalid address format. Use IP:PORT');
    }
    
    if (!window.electronAPI?.transport) {
      throw new Error('Transport API not available');
    }

    console.log(`Connecting to ${ip}:${port}...`);
    const success = await window.electronAPI.transport.connect(ip, port);
    
    if (success) {
      console.log('Successfully connected to peer');
      return;
    } else {
      throw new Error('Failed to connect to peer');
    }
  }

  private async handleStartServer(): Promise<void> {
    if (!window.electronAPI?.transport) {
      throw new Error('Transport API not available');
    }

    console.log('Starting server...');
    const result = await window.electronAPI.transport.startServer();
    
    console.log(`Server started on ${result.address}:${result.port}`);
    
    // Update modal info
    this.updateModalServerInfo(result.address, result.port);
    
    // Update sidebar status
    this.updateServerStatus();
  }

  private updateModalServerInfo(address: string, port: number): void {
    const modal = this.newChatModal?.modal;
    if (!modal) return;

    const serverStatus = modal.querySelector('#modal-server-status');
    const myAddress = modal.querySelector('#modal-my-address');

    if (serverStatus) {
      (serverStatus as HTMLElement).textContent = 'Running';
      (serverStatus as HTMLElement).style.color = '#28a745';
    }

    if (myAddress) {
      (myAddress as HTMLElement).textContent = `${address}:${port}`;
      (myAddress as HTMLElement).style.color = '#fff';
    }
  }

  private async updateConnectionInfo(): Promise<void> {
    const modal = this.newChatModal?.modal;
    if (!modal) return;

    // Update public key
    if (window.electronAPI?.crypto) {
      try {
        const publicKey = await window.electronAPI.crypto.getPublicKey();
        const keyTextarea = modal.querySelector('#my-public-key') as HTMLTextAreaElement;
        if (keyTextarea && publicKey) {
          keyTextarea.value = publicKey;
        }
      } catch (error) {
        console.error('Failed to get public key:', error);
      }
    }
  }

  async initialize(): Promise<void> {
    console.log('🔧 ChatApp: Starting initialization...');
    
    // Wait for preload
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Setup UI first
    await this.setupUI();
    
    // Check ElectronAPI
    await this.checkElectronAPI();

    // Initialize available components only
    for (const [name, component] of this.components) {
      try {
        console.log(`🔧 Initializing ${name}...`);
        if (component.initialize) {
          await component.initialize();
        }
        console.log(`✅ ${name} initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${name}:`, error);
      }
    }

    // Try to initialize modal components
    try {
      console.log('🔧 Initializing modal components...');
      await this.initializeNewChatModal();
      console.log('✅ Modal components initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize modal components:', error);
      console.log('🔧 Creating simple fallback modal...');
      this.createSimpleFallbackModal();
    }

    // Setup event listeners after components are initialized
    this.setupEventListeners();

    // Load existing chats
    await this.loadExistingChats();

    console.log('🔧 ChatApp: Initialization complete');
  }

  protected setupEventListeners(): void {
    // Chat events
    this.eventBus.on('chat:selected', (chatId: string) => {
      this.selectChat(chatId);
    });

    this.eventBus.on('chat:updated', (chatId: string) => {
      console.log('Chat updated:', chatId);
      this.refreshChatList();
    });

    this.eventBus.on('message:sent', (message: Message) => {
      if (this.currentChatId === message.chatId) {
        this.refreshMessages();
      }
      this.refreshChatList();
    });

    this.eventBus.on('message:received', (message: Message) => {
      if (this.currentChatId === message.chatId) {
        this.refreshMessages();
      }
      this.refreshChatList();
    });

    // Transport events - setup listeners if transport is available
    if (window.electronAPI?.transport) {
      window.electronAPI.transport.onPeerConnected((chatId: string, peerInfo: PeerInfo) => {
        this.handlePeerConnected(chatId, peerInfo);
      });

      window.electronAPI.transport.onPeerDisconnected((chatId: string) => {
        this.handlePeerDisconnected(chatId);
      });

      window.electronAPI.transport.onMessage((chatId: string, data: any) => {
        this.handleIncomingMessage(chatId, data);
      });
    }
  }

  protected async checkElectronAPI(): Promise<void> {
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

      console.log('✅ All APIs are available');
      
    } catch (error) {
      console.error('🔧 ElectronAPI check failed:', error);
      // Don't throw - continue with limited functionality
    }
  }

  protected async setupUI(): Promise<void> {
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
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `;

    this.setupBasicEventListeners();
  }

  protected setupBasicEventListeners(): void {
    // Message sending
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const newChatBtn = document.getElementById('new-chat-btn');

    sendBtn?.addEventListener('click', () => this.sendMessage());
    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    newChatBtn?.addEventListener('click', () => this.showNewChatModal());
  }

  private showNewChatModal(): void {
    console.log('🔧 showNewChatModal called');
    
    if (this.newChatModal) {
      console.log('🔧 Modal exists, opening...');
      this.newChatModal.open();
      this.updateConnectionInfo();
      
      // Debug: Check if modal is in DOM and has correct classes
      setTimeout(() => {
        const modalElement = document.getElementById('new-chat-modal');
        console.log('🔧 Modal in DOM:', !!modalElement);
        console.log('🔧 Modal classes:', modalElement?.className);
        console.log('🔧 Modal style.display:', modalElement?.style.display);
        console.log('🔧 Modal computed styles:', window.getComputedStyle(modalElement || document.body).display);
      }, 100);
    } else {
      console.error('🔧 Modal does not exist! Creating fallback...');
      this.createSimpleFallbackModal();
    }
  }

  // Add this method for debugging
  private createSimpleFallbackModal(): void {
    // Remove any existing modal
    const existing = document.getElementById('new-chat-modal');
    if (existing) existing.remove();
    
    // Create a very simple modal for testing
    const modal = document.createElement('div');
    modal.id = 'new-chat-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: #2d2d2d; padding: 2rem; border-radius: 8px; color: white; max-width: 400px;">
        <h3>🆕 New Chat (Fallback)</h3>
        <p>This is a simple fallback modal to test if the issue is with the Modal component or CSS.</p>
        <div style="margin: 1rem 0;">
          <input type="text" id="simple-address" placeholder="IP:Port" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem;">
          <button id="simple-connect" style="padding: 0.5rem 1rem; background: #007acc; color: white; border: none; border-radius: 4px;">Connect</button>
          <button id="simple-close" style="padding: 0.5rem 1rem; background: #666; color: white; border: none; border-radius: 4px; margin-left: 0.5rem;">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('#simple-close')?.addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('#simple-connect')?.addEventListener('click', async () => {
      const input = modal.querySelector('#simple-address') as HTMLInputElement;
      const address = input?.value.trim();
      
      if (address) {
        try {
          await this.handlePeerConnection(address, 'Test Chat');
          modal.remove();
        } catch (error) {
          alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        alert('Please enter an address');
      }
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    console.log('🔧 Fallback modal created and should be visible');
  }

  private hideNewChatModal(): void {
    this.newChatModal?.close();
  }

  private updateServerStatus(): void {
    const serverStatus = document.getElementById('server-status');
    if (serverStatus) {
      serverStatus.textContent = 'Server: Running';
    }
  }

  private async handlePeerConnected(chatId: string, peerInfo: PeerInfo): Promise<void> {
    const chat: Omit<Chat, 'id'> = {
      name: `Chat with ${peerInfo.name}`,
      participants: ['me', peerInfo.id],
      peerAddress: peerInfo.address,
      peerPublicKey: peerInfo.publicKey,
      type: 'direct',
      isOnline: true
    };

    try {
      const savedChat = await window.electronAPI.db.saveChat(chat);
      this.chats.set(savedChat.id, { ...savedChat, id: chatId });
      this.refreshChatList();
      this.selectChat(chatId);
    } catch (error) {
      console.error('Failed to save new chat:', error);
    }
  }

  private handlePeerDisconnected(chatId: string): void {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.isOnline = false;
      this.refreshChatList();
      
      if (this.currentChatId === chatId) {
        this.updateChatHeader();
      }
    }
  }

  private async handleIncomingMessage(chatId: string, data: any): Promise<void> {
    try {
      const message = {
        chatId,
        content: data.content || data.message || String(data),
        sender: 'peer' as const,
        encrypted: false
      };

      await window.electronAPI.db.saveMessage(message);
      
      if (this.currentChatId === chatId) {
        this.refreshMessages();
      }
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  protected async loadExistingChats(): Promise<void> {
    try {
      const chats = await window.electronAPI.db.getChats();
      this.chats.clear();
      
      for (const chat of chats) {
        this.chats.set(chat.id, chat);
      }
      
      this.refreshChatList();
      console.log(`✅ Loaded ${chats.length} chats`);
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
    }
  }

  protected refreshChatList(): void {
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

  protected async selectChat(chatId: string): Promise<void> {
    this.currentChatId = chatId;
    this.refreshChatList();
    this.updateChatHeader();
    await this.refreshMessages();
    
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
      if (chatStatusEl) {
        chatStatusEl.textContent = chat.isOnline ? 
          `Connected to ${chat.peerAddress}` : 
          'Offline';
      }
    }
  }

  protected async refreshMessages(): Promise<void> {
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
      // Direct database save for now (until MessageHandler is implemented)
      const message = {
        chatId: this.currentChatId,
        content: messageText,
        sender: 'me' as const,
        encrypted: false
      };

      await window.electronAPI.db.saveMessage(message);
      
      // Try to send via transport if available
      if (window.electronAPI.transport) {
        await window.electronAPI.transport.send(this.currentChatId, {
          content: messageText,
          timestamp: Date.now()
        });
      }
      
      input.value = '';
      await this.refreshMessages();
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  }

  // Expose method for saving messages (called from HTML)
  public async saveMessage(messageId: string): Promise<void> {
    try {
      if (!this.currentChatId) return;
      
      const messages = await window.electronAPI.db.getMessages(this.currentChatId);
      const messageToSave = messages.find(m => m.id === messageId);
      
      if (messageToSave) {
        console.log('Saving message:', messageToSave);
        // Implement saved messages functionality when component is available
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  cleanup(): void {
    // Cleanup modal components
    this.connectionTab?.cleanup();
    this.connectionInfoTab?.cleanup();
    this.tabSystem?.cleanup();
    this.newChatModal?.cleanup();
    
    // Cleanup all other components
    for (const [name, component] of this.components) {
      if (component.cleanup) {
        console.log(`🧹 Cleaning up ${name}...`);
        component.cleanup();
      }
    }
  }
}

declare global {
  interface Window {
    chatApp: ChatApp;
  }
}