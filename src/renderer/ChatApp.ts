import { DebugPanel } from './DebugPanel';
import { NewChatModal } from './components/UI/NewChatModal';
import { ImageProcessor } from './components/Utils/ImageProcessor';
import { ImageViewer } from './components/UI/ImageViewer';
import { EventBus } from './components/Utils/EventBus';
import type { Component } from './types/components';
import type { Message, Chat, PeerInfo } from '../types/index';
import type { ChatAppPublic } from './types/public';

export class ChatApp implements Component {
  private eventBus = EventBus.getInstance();
  protected components: Map<string, Component> = new Map();

  // UI State
  protected currentChatId: string | null = null;
  protected chats: Map<string, Chat> = new Map();

  // Server state for network info
  private serverInfo: { address: string; port: number } | null = null;

  // Modal components
  protected newChatModal: NewChatModal | null = null;

  // Image helpers
  private imageProcessor = new ImageProcessor();
  private imageViewer = new ImageViewer();

  constructor() {
    // Register components
    this.components.set('debug', new DebugPanel());
    this.newChatModal = new NewChatModal({
      onConnect: this.handleModalConnect.bind(this),
      onStartServer: this.handleModalStartServer.bind(this),
    });
    this.components.set('newChatModal', this.newChatModal);
  }

  async initialize(): Promise<void> {
    // Setup UI
    await this.setupUI();

    // Check API availability
    await this.checkElectronAPI();

    // Initialize registered components
    for (const [, component] of this.components) {
      if (component.initialize) await component.initialize();
    }

    // Initialize helpers
    await this.imageProcessor.initialize();
    await this.imageViewer.initialize();

    // Wire events
    this.setupEventListeners();

    // Load chats
    await this.loadExistingChats();
  }

  private async checkElectronAPI(): Promise<void> {
    try {
      const ok = typeof window.electronAPI !== 'undefined';
      const statusEl = document.getElementById('app-status');
      if (statusEl) {
        if (ok) {
          statusEl.textContent = '🟢 Ready';
          statusEl.classList.remove('pending', 'warning', 'error');
          statusEl.classList.add('safe');
        } else {
          statusEl.textContent = '⚠️ Preload not loaded';
          statusEl.classList.remove('pending', 'safe');
          statusEl.classList.add('warning');
        }
      }
    } catch (error) {
      console.error('ElectronAPI check failed:', error);
    }
  }

  protected setupEventListeners(): void {
    // EventBus listeners
    this.eventBus.on('chat:selected', (chatId: string) => this.selectChat(chatId));
    this.eventBus.on('chat:updated', () => this.refreshChatList());
    this.eventBus.on('message:sent', (message: Message) => {
      if (this.currentChatId === message.chatId) this.refreshMessages();
      this.refreshChatList();
    });
    this.eventBus.on('message:received', (message: Message) => {
      if (this.currentChatId === message.chatId) this.refreshMessages();
      this.refreshChatList();
    });

    // Transport listeners
    if (window.electronAPI?.transport) {
      window.electronAPI.transport.onPeerConnected((chatId: string, peerInfo: PeerInfo) => {
        this.handlePeerConnected(chatId, peerInfo);
      });
      window.electronAPI.transport.onPeerDisconnected((chatId: string) => {
        this.handlePeerDisconnected(chatId);
      });
      window.electronAPI.transport.onMessage((chatId: string, data: unknown) => {
        this.handleIncomingMessage(chatId, data);
      });
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
              <input type="file" id="image-input" accept="image/*" style="display:none">
              <button id="image-btn" class="image-btn" disabled title="Send Image">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `;

    this.setupBasicEventListeners();

    // Initialize modal after DOM
    await this.newChatModal?.initialize();

    this.updateServerStatus();
  }

  protected setupBasicEventListeners(): void {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input') as HTMLInputElement | null;
    const newChatBtn = document.getElementById('new-chat-btn');

    sendBtn?.addEventListener('click', () => this.sendMessage());
    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    newChatBtn?.addEventListener('click', () => this.showNewChatModal());

    // Image select
    const imageBtn = document.getElementById('image-btn');
    const imageInput = document.getElementById('image-input') as HTMLInputElement | null;

    imageBtn?.addEventListener('click', () => imageInput?.click());
    imageInput?.addEventListener('change', async (e: Event) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (file && this.currentChatId) {
        try {
          await this.sendImageMessage(file);
          (e.target as HTMLInputElement).value = '';
        } catch (err) {
          console.error('Failed to send image:', err);
          alert(`Failed to send image: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    });
  }

  protected showNewChatModal(): void {
    if (this.newChatModal) {
      this.newChatModal.open();
      this.newChatModal.updateConnectionInfo().catch(() => {});
      if (this.serverInfo) {
        this.newChatModal.updateServerInfo(this.serverInfo.address, this.serverInfo.port);
      }
    } else {
      this.createSimpleFallbackModal();
    }
  }

  // Modal callbacks
  private async handleModalStartServer(): Promise<void> {
    if (!window.electronAPI?.transport) throw new Error('Transport API not available');
    const info = await window.electronAPI.transport.startServer();
    this.serverInfo = info;
    this.updateServerStatus();
    this.newChatModal?.updateServerInfo(info.address, info.port);
  }

  private async handleModalConnect(address: string, name: string): Promise<void> {
    if (!window.electronAPI?.transport) throw new Error('Transport API not available');

    let host = address;
    let portNum: number | null = null;

    if (address.includes(':')) {
      const [ip, port] = address.split(':');
      host = ip;
      portNum = Number.parseInt(port, 10);
    }

    if (!host || !portNum || Number.isNaN(portNum)) {
      throw new Error('Invalid address format. Use IP:PORT');
    }

    const ok = await window.electronAPI.transport.connect(host, portNum);
    if (!ok) throw new Error('Failed to connect to peer');
    // onPeerConnected will create the chat
  }

  // Networking hooks
  private updateServerStatus(): void {
    const serverStatus = document.getElementById('server-status');
    const myAddress = document.getElementById('my-address');
    if (serverStatus) {
      serverStatus.textContent = this.serverInfo ? 'Server: Running' : 'Server: Not started';
    }
    if (myAddress) {
      myAddress.textContent = this.serverInfo
        ? `Address: ${this.serverInfo.address}:${this.serverInfo.port}`
        : 'Address: Unknown';
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
      this.chats.set(chatId, { ...savedChat, id: chatId });
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
      if (this.currentChatId === chatId) this.updateChatHeader();
    }
  }

  private async handleIncomingMessage(chatId: string, data: unknown): Promise<void> {
    try {
      const payload = (data ?? {}) as Record<string, unknown>;
      const content =
        typeof payload.content === 'string'
          ? payload.content
          : typeof payload.message === 'string'
            ? payload.message
            : String(data);
      const type = (typeof payload.type === 'string' ? payload.type : 'text') as Message['type'];

      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content,
        sender: 'peer',
        encrypted: Boolean(payload.encrypted),
        type,
        imageData: payload.imageData as Message['imageData']
      };

      await window.electronAPI.db.saveMessage(message);

      if (this.currentChatId === chatId) await this.refreshMessages();
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  protected async loadExistingChats(): Promise<void> {
    try {
      const chats = await window.electronAPI.db.getChats();
      this.chats.clear();
      for (const chat of chats) this.chats.set(chat.id, chat);
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to load chats:', error);
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
      <li class="chat-item ${this.currentChatId === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
        <div class="chat-name">${chat.name}</div>
        <div class="chat-preview">
          ${chat.lastMessage
            ? (chat.lastMessage.type === 'image' ? '📷 Photo' : (chat.lastMessage.content ?? '').substring(0, 50) + ((chat.lastMessage.content ?? '').length > 50 ? '...' : ''))
            : 'No messages yet'}
        </div>
        <div class="chat-time">
          ${chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </li>
    `).join('');

    chatListEl.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = (item as HTMLElement).dataset.chatId!;
        this.selectChat(id);
      });
    });
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

      messagesEl.innerHTML = messages.map(message => {
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const footer = `
          <div class="message-footer">
            <div class="message-time">${time}</div>
            ${message.sender !== 'me' && this.currentChatId !== 'saved-messages'
              ? `<button class="save-message-btn" onclick="window.chatApp.saveMessage('${message.id}')" title="Save Message">💾</button>`
              : ''}
          </div>
        `;

        if (message.type === 'image' && message.imageData) {
          return `
            <div class="message ${message.sender === 'me' ? 'sent' : 'received'}">
              <div class="image-message">
                <img src="${message.imageData.data}" alt="${message.imageData.filename}" class="message-image">
                <div class="image-caption">${message.content}</div>
              </div>
              ${footer}
            </div>
          `;
        }

        return `
          <div class="message ${message.sender === 'me' ? 'sent' : 'received'}">
            <div class="message-content">${message.content}</div>
            ${footer}
          </div>
        `;
      }).join('');

      // Attach image viewer handlers with robust fallback
      const imgs = messagesEl.querySelectorAll<HTMLImageElement>('.message-image');
      imgs.forEach(img => {
        const caption = (img.closest('.image-message')?.querySelector('.image-caption') as HTMLElement | null)?.textContent || '';
        img.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.openImageWithFallback(img, caption);
        });
      });

      messagesEl.scrollTop = messagesEl.scrollHeight;
    } catch (error) {
      console.error('Failed to render messages:', error);
    }
  }

  // Prefer ImageViewer; if it doesn't actually show, fall back to inline expanded image
  private openImageWithFallback(img: HTMLImageElement, caption: string): void {
    try {
      this.imageViewer.open(img.src, img.alt || 'Image', caption);
    } catch {
      // ignore error here; we'll fallback below
    }

    // Verify after a tick whether the viewer is actually visible with the right image
    setTimeout(() => {
      if (!this.isViewerShowing(img.src)) {
        this.toggleInlineLightbox(img);
      }
    }, 50);
  }

  private isViewerShowing(expectedSrc?: string): boolean {
    const overlay = document.getElementById('image-viewer') as HTMLDivElement | null;
    if (!overlay) return false;

    const display = overlay.style.display || getComputedStyle(overlay).display;
    if (display === 'none') return false;

    if (expectedSrc) {
      const img = overlay.querySelector('img') as HTMLImageElement | null;
      if (!img) return false;
      // Some browsers may normalize data URLs; loose check by startsWith
      const actual = img.getAttribute('src') || '';
      if (!(actual === expectedSrc || actual.startsWith(expectedSrc.slice(0, 32)))) return false;
    }

    return true;
    }

  private toggleInlineLightbox(img: HTMLImageElement): void {
    const expanded = img.classList.toggle('expanded');
    document.body.classList.toggle('lightbox-open', expanded);
    if (expanded) {
      const onKey = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
          img.classList.remove('expanded');
          document.body.classList.remove('lightbox-open');
          document.removeEventListener('keydown', onKey);
        }
      };
      document.addEventListener('keydown', onKey, { once: true });
    }
  }

  protected async selectChat(chatId: string): Promise<void> {
    this.currentChatId = chatId;
    this.refreshChatList();
    this.updateChatHeader();
    await this.refreshMessages();

    const input = document.getElementById('message-input') as HTMLInputElement | null;
    const send = document.getElementById('send-btn') as HTMLButtonElement | null;
    const imageBtn = document.getElementById('image-btn') as HTMLButtonElement | null;
    if (input) input.disabled = false;
    if (send) send.disabled = false;
    if (imageBtn) imageBtn.disabled = false;
  }

  private updateChatHeader(): void {
    const chatTitle = document.getElementById('chat-title');
    const chatStatus = document.getElementById('chat-status');

    if (!this.currentChatId) {
      if (chatTitle) chatTitle.textContent = 'Select a chat';
      if (chatStatus) chatStatus.textContent = '';
      return;
    }

    const chat = this.chats.get(this.currentChatId);
    if (chat) {
      if (chatTitle) chatTitle.textContent = chat.name;
      if (chatStatus) {
        chatStatus.textContent = chat.type === 'saved'
          ? 'Your saved messages'
          : (chat.isOnline ? `Connected to ${chat.peerAddress}` : 'Offline');
      }
    }
  }

  private async sendMessage(): Promise<void> {
    const input = document.getElementById('message-input') as HTMLInputElement | null;
    const messageText = input?.value.trim() || '';
    if (!messageText || !this.currentChatId) return;

    try {
      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId: this.currentChatId,
        content: messageText,
        sender: 'me',
        encrypted: false,
        type: 'text'
      };

      const saved = await window.electronAPI.db.saveMessage(message);

      if (window.electronAPI.transport) {
        await window.electronAPI.transport.send(this.currentChatId, {
          content: messageText,
          timestamp: saved.timestamp,
          type: 'text'
        });
      }

      if (input) input.value = '';
      await this.refreshMessages();
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  }

  private async sendImageMessage(imageFile: File): Promise<void> {
    if (!this.currentChatId) return;

    const imageData = await this.imageProcessor.processImageFile(imageFile);

    const message: Omit<Message, 'id' | 'timestamp'> = {
      chatId: this.currentChatId,
      content: `📷 ${imageData.filename}`,
      sender: 'me',
      encrypted: false,
      type: 'image',
      imageData
    };
    const saved = await window.electronAPI.db.saveMessage(message);

    if (window.electronAPI.transport) {
      await window.electronAPI.transport.send(this.currentChatId, {
        content: `📷 ${imageData.filename}`,
        timestamp: saved.timestamp,
        type: 'image',
        imageData
      });
    }

    await this.refreshMessages();
    this.refreshChatList();
  }

  // Expose method for saving messages (called from HTML)
  public async saveMessage(messageId: string): Promise<void> {
    try {
      if (!this.currentChatId) return;
      const messages = await window.electronAPI.db.getMessages(this.currentChatId);
      const messageToSave = messages.find(m => m.id === messageId);
      if (messageToSave) this.eventBus.emit('saved-messages:save', messageToSave);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  cleanup(): void {
    for (const [, component] of this.components) {
      if (component.cleanup) component.cleanup();
    }
    this.imageProcessor.cleanup();
    this.imageViewer.cleanup();
  }

  // Fallback minimal modal if UI modal missing
  private createSimpleFallbackModal(): void {
    const existing = document.getElementById('new-chat-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'new-chat-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 10000;
    `;
    modal.innerHTML = `
      <div style="background:#2d2d2d; padding: 2rem; border-radius: 8px; color: white; max-width: 400px;">
        <h3>🆕 New Chat (Fallback)</h3>
        <div style="margin:1rem 0;">
          <input type="text" id="simple-address" placeholder="IP:Port"
            style="width:100%; padding:0.5rem; margin-bottom:1rem; background:#1a1a1a; border:1px solid #404040; color:white; border-radius:4px;">
          <button id="simple-connect" style="padding:0.5rem 1rem; background:#007acc; color:white; border:none; border-radius:4px; margin-right:0.5rem;">
            Connect
          </button>
          <button id="simple-close" style="padding:0.5rem 1rem; background:#666; color:white; border:none; border-radius:4px;">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#simple-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#simple-connect')?.addEventListener('click', async () => {
      const input = modal.querySelector('#simple-address') as HTMLInputElement;
      const address = input?.value.trim();
      if (address) {
        try {
          await this.handleModalConnect(address, 'Peer');
          modal.remove();
        } catch (error) {
          alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        alert('Please enter an address');
      }
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }
}

declare global {
  interface Window {
    chatApp: ChatAppPublic;
    electronAPI: import('../types/index').ElectronAPI;
  }
}