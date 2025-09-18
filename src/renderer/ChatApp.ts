import { DebugPanel } from './DebugPanel';
import { NewChatModal } from './components/UI/NewChatModal';
import type { Component } from './types/components';
import type { Message, Chat, PeerInfo } from '../types/index';
import type { ChatAppPublic } from './types/public';

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
  protected newChatModal: NewChatModal | null = null;

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize debug panel
    try {
      this.components.set('debug', new DebugPanel());
      console.log('✅ DebugPanel component initialized');
    } catch (error) {
      console.warn('⚠️ DebugPanel not available:', error);
    }
    
    // Initialize new chat modal
    try {
      this.newChatModal = new NewChatModal({
        onConnect: async (address: string, name: string) => {
          await this.handlePeerConnection(address, name);
        },
        onStartServer: async () => {
          await this.handleStartServer();
        }
      });
      this.components.set('newChatModal', this.newChatModal);
      console.log('✅ NewChatModal component initialized');
    } catch (error) {
      console.warn('⚠️ NewChatModal not available:', error);
    }
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
    
    // Update modal and sidebar info
    this.newChatModal?.updateServerInfo(result.address, result.port);
    this.updateServerStatus();
  }

  async initialize(): Promise<void> {
    console.log('🔧 ChatApp: Starting initialization...');
    
    // Wait for preload
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Setup UI first
    await this.setupUI();
    
    // Check ElectronAPI
    await this.checkElectronAPI();

    // Initialize all components
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

  protected showNewChatModal(): void {
    console.log('🔧 showNewChatModal called');
    
    if (this.newChatModal) {
      console.log('🔧 Opening NewChatModal component...');
      this.newChatModal.open();
    } else {
      console.error('🔧 NewChatModal not available');
      this.createSimpleFallbackModal();
    }
  }

  // Fallback modal if NewChatModal component fails
  private createSimpleFallbackModal(): void {
    console.log('🔧 Creating fallback modal...');
    
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
        <p>NewChatModal component failed to load. Using simple fallback.</p>
        <div style="margin: 1rem 0;">
          <input type="text" id="simple-address" placeholder="IP:Port" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; background: #1a1a1a; border: 1px solid #404040; color: white; border-radius: 4px;">
          <button id="simple-connect" style="padding: 0.5rem 1rem; background: #007acc; color: white; border: none; border-radius: 4px; margin-right: 0.5rem;">Connect</button>
          <button id="simple-close" style="padding: 0.5rem 1rem; background: #666; color: white; border: none; border-radius: 4px;">Close</button>
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
    // Cleanup all components
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
    chatApp: ChatAppPublic;
  }
}