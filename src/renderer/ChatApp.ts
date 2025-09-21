import { DebugPanel } from './DebugPanel';
import { NewChatModal } from './components/UI/NewChatModal';
import { ImageProcessor } from './components/Utils/ImageProcessor';
import { ImageViewer } from './components/UI/ImageViewer';
import { EventBus } from './components/Utils/EventBus';
import type { Component } from './types/components';
import type { Message, Chat, PeerInfo } from '../types/index';
import type { ChatAppPublic } from './types/public';
import { SavedMessagesManager } from './components/Chat/SavedMessagesManager';
import { NetworkManager } from './components/Network/NetworkManager';
import { ShortcutsModal } from './components/UI/ShortcutsModal';
import { MessageList } from './components/Chat/MessageList';
import { ShortcutsController } from './components/UI/ShortcutsController';
import { ErrorModal } from './components/UI/ErrorModal';

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
  protected shortcutsModal: ShortcutsModal | null = null;

  // Image helpers
  private imageProcessor = new ImageProcessor();
  private imageViewer = new ImageViewer();

  // Extracted views/controllers
  private messageList = new MessageList({ imageViewer: this.imageViewer });

  // Typing indicators
  private typingTimers: Map<string, number> = new Map();
  private lastTypingSentAt = 0;

  // Keep recent incoming signatures per chat for 2s
  private recentIncoming: Map<string, Map<string, number>> = new Map();

  // Error modal
  private errorModal = new ErrorModal();

  constructor() {
    // Register components
    this.components.set('debug', new DebugPanel());
    this.components.set('savedMessages', new SavedMessagesManager());
    this.components.set('network', new NetworkManager({ autoStart: false }));

    this.newChatModal = new NewChatModal({
      onConnect: this.handleModalConnect.bind(this),
      onStartServer: this.handleModalStartServer.bind(this),
    });
    this.components.set('newChatModal', this.newChatModal);

    this.shortcutsModal = new ShortcutsModal();
    this.components.set('shortcutsModal', this.shortcutsModal);

    // Register extracted components
    this.components.set('messageList', this.messageList);
    this.components.set('shortcutsController', new ShortcutsController(this));
  }

  async initialize(): Promise<void> {
    await this.setupUI();
    await this.checkElectronAPI();

    for (const [, component] of this.components) {
      if (component.initialize) await component.initialize();
    }

    await this.imageProcessor.initialize();
    // imageViewer is initialized by MessageList

    this.setupEventListeners();
    await this.loadExistingChats();
  }

  // Helper to access transport without TS errors for extra methods (sendSignal/onSignal)
  private transport(): any {
    return (window as any).electronAPI?.transport;
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

    // Handle DB/UI refresh when our own sends are persisted
    this.eventBus.on('message:sent', (message: Message) => {
      if (this.currentChatId === message.chatId) this.refreshMessages();
      this.refreshChatList();
    });

    // Handle incoming messages only via EventBus (from NetworkManager)
    this.eventBus.on('message:received', ({ chatId, data }: { chatId: string; data: Record<string, unknown> }) => {
      this.handleIncomingMessage(chatId, data);
    });

    // Transport peer status (subscribe directly)
    if (window.electronAPI?.transport?.onPeerConnected) {
      window.electronAPI.transport.onPeerConnected((chatId: string, peerInfo: PeerInfo) => {
        this.handlePeerConnected(chatId, peerInfo);
      });
    }
    if (window.electronAPI?.transport?.onPeerDisconnected) {
      window.electronAPI.transport.onPeerDisconnected((chatId: string) => {
        this.handlePeerDisconnected(chatId);
      });
    }

    // Signals (typing/read)
    this.transport()?.onSignal?.((chatId: string, data: any) => {
      this.handleSignal(chatId, data);
    });

    // Saved Messages
    this.eventBus.on('saved-messages:show', () => this.openSavedMessages());
  }

  protected async setupUI(): Promise<void> {
    document.body.innerHTML = `
      <div id="app">
        <header class="app-header">
          <h1>🔒 Secure Chat</h1>
          <div class="app-status-container">
            <span id="app-status" class="app-status">🔄 Starting...</span>
            <button id="shortcuts-btn" class="shortcuts-btn" title="Keyboard Shortcuts (Ctrl+Shift+/)">⌨️</button>
          </div>
        </header>
        
        <main class="app-main">
          <aside class="chat-list">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <div class="chat-list-actions">
                <button id="new-chat-btn">+ New Chat</button>
                <button id="saved-messages-btn" title="Open Saved Messages">💾 Saved</button>
              </div>
            </div>
            <ul id="chat-list"></ul>
            <div class="connection-info">
              <div id="server-status">Server: Not started</div>
              <div class="address-row">
                <div id="my-address">Address: Unknown</div>
                <button id="copy-address-btn" title="Copy my address (Ctrl+Shift+A)">📋</button>
              </div>
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
                <p>💾 Check out "Saved Messages" to save important messages!</p>
              </div>
            </div>
            <div class="message-composer">
              <input type="file" id="image-input" accept="image/*" style="display:none">
              <button id="image-btn" class="image-btn" disabled title="Send Image (Ctrl+O)">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `;

    this.setupBasicEventListeners();
    await this.newChatModal?.initialize();
    this.updateServerStatus();
  }

  protected setupBasicEventListeners(): void {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input') as HTMLInputElement | null;
    const newChatBtn = document.getElementById('new-chat-btn');
    const savedBtn = document.getElementById('saved-messages-btn');
    const copyAddressBtn = document.getElementById('copy-address-btn') as HTMLButtonElement | null;
    const shortcutsBtn = document.getElementById('shortcuts-btn') as HTMLButtonElement | null;

    sendBtn?.addEventListener('click', () => this.sendMessage());
    messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    newChatBtn?.addEventListener('click', () => this.showNewChatModal());
    savedBtn?.addEventListener('click', () => this.openSavedMessages());

    // Shortcuts button
    shortcutsBtn?.addEventListener('click', () => this.openShortcuts());

    // Image select
    const imageBtn = document.getElementById('image-btn') as HTMLButtonElement | null;
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

    // Typing signals (throttled)
    messageInput?.addEventListener('input', () => {
      if (!this.currentChatId) return;
      const now = Date.now();
      if (now - this.lastTypingSentAt > 1200) {
        this.lastTypingSentAt = now;
        this.transport()?.sendSignal?.(this.currentChatId, { action: 'typing' });
        setTimeout(() => {
          if (Date.now() - this.lastTypingSentAt > 1100 && this.currentChatId) {
            this.transport()?.sendSignal?.(this.currentChatId, { action: 'stop_typing' });
          }
        }, 1400);
      }
    });
    messageInput?.addEventListener('blur', () => {
      if (!this.currentChatId) return;
      this.transport()?.sendSignal?.(this.currentChatId, { action: 'stop_typing' });
    });

    // Copy my address button
    copyAddressBtn?.addEventListener('click', async () => {
      const addr = this.getMyAddressString();
      if (!addr) return;
      await this.copyText(addr);
      const serverStatus = document.getElementById('server-status');
      if (serverStatus) {
        const prev = serverStatus.textContent;
        serverStatus.textContent = 'Address copied';
        setTimeout(() => { if (serverStatus.textContent === 'Address copied') serverStatus.textContent = prev || ''; }, 1000);
      }
    });

    // Privacy: hide revealed message on Esc or when window loses focus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.messageList.hideRevealedMessage();
    });
    window.addEventListener('blur', () => this.messageList.hideRevealedMessage());
  }

  // Delegate to MessageList to render messages
  protected async refreshMessages(): Promise<void> {
    if (!this.currentChatId) return;
    await this.messageList.refresh(this.currentChatId);
  }

  // Public helpers used by ShortcutsController
  public getRevealedMessageId(): string | null {
    return this.messageList.getRevealedMessageId();
  }

  public openShortcuts(): void {
    this.shortcutsModal?.open();
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

      const img = (payload.imageData as any)?.data as string | undefined;
      const sig = ['peer', type, (payload as any).encrypted ? '1' : '0', content, img ? img.slice(0, 64) : ''].join('|');
      if (this.isDuplicateIncoming(chatId, sig)) return;

      const message: Omit<Message, 'id' | 'timestamp'> = {
        chatId,
        content,
        sender: 'peer',
        encrypted: Boolean((payload as any).encrypted),
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

  public async copyMessage(messageId: string): Promise<void> {
    try {
      if (!this.currentChatId) return;
      const messages = await window.electronAPI.db.getMessages(this.currentChatId);
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;

      // Decide what to copy
      let text = (msg.content ?? '').trim();
      if (!text) {
        if (msg.type === 'image' && msg.imageData) {
          text = `📷 ${msg.imageData.filename}`;
        } else {
          text = '';
        }
      }

      // Prefer navigator.clipboard, fallback to execCommand
      const write = async (t: string) => {
        try {
          await navigator.clipboard.writeText(t);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = t;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      };

      await write(text);

      // Optional UX hint in chat status
      const chatStatus = document.getElementById('chat-status');
      if (chatStatus) {
        const prev = chatStatus.textContent;
        chatStatus.textContent = 'Copied';
        setTimeout(() => { if (chatStatus.textContent === 'Copied') chatStatus.textContent = prev || ''; }, 1000);
      }
    } catch (err) {
      console.error('Failed to copy message:', err);
      alert('Failed to copy');
    }
  }

  protected showNewChatModal(): void {
    if (this.newChatModal) {
      this.newChatModal.open();
      this.newChatModal.updateConnectionInfo().catch(() => {});
      if (this.serverInfo) {
        this.newChatModal.updateServerInfo(this.serverInfo.address, this.serverInfo.port);
      }
    }
  }

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

    const res = await window.electronAPI.transport.connect(host, portNum);

    // Backward compatible: handle both boolean and structured result
    if (typeof res === 'boolean') {
      if (!res) throw new Error('Failed to connect to peer');
      return;
    }

    if (!res.ok) {
      const msg = this.mapConnectError(res.reason);
      // Use the error modal
      this.errorModal.show(msg);
      throw new Error(msg);
    }
  }

  private mapConnectError(reason?: string): string {
    switch (reason) {
      case 'occupied':
      case 'already_connected':
        return 'The line is already busy.';
      case 'unauthorized':
        return 'Connection rejected: invalid PSK.';
      case 'rate_limited':
        return 'The server is busy. Please try again in a moment.';
      case 'bad_handshake':
        return 'Protocol mismatch or malformed handshake.';
      case 'timeout':
        return 'Connection timed out.';
      default:
        return 'Network error. Please try again.';
    }
  }

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
    } catch (error) {
      console.error('Failed to save new chat:', error);
      // Fallback: create in‑memory chat so the session can proceed
      this.chats.set(chatId, { ...chat, id: chatId });
    }

    this.refreshChatList();
    this.selectChat(chatId);
  }

  private handlePeerDisconnected(chatId: string): void {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.isOnline = false;
      this.refreshChatList();
      if (this.currentChatId === chatId) this.updateChatHeader();
    }
  }

  private handleSignal(chatId: string, data: any): void {
    if (this.currentChatId !== chatId) return;
    const chatStatus = document.getElementById('chat-status');
    if (!chatStatus) return;

    if (data.action === 'typing') {
      chatStatus.textContent = 'Peer is typing…';
      chatStatus.classList.add('typing');
      const prev = this.typingTimers.get(chatId);
      if (prev) window.clearTimeout(prev);
      const timer = window.setTimeout(() => {
        if (chatStatus.textContent === 'Peer is typing…') {
          chatStatus.textContent = '';
          chatStatus.classList.remove('typing');
        }
      }, 3000);
      this.typingTimers.set(chatId, timer);
    } else if (data.action === 'stop_typing') {
      chatStatus.textContent = '';
      chatStatus.classList.remove('typing');
    } else if (data.action === 'read') {
      chatStatus.textContent = 'Seen';
      setTimeout(() => {
        if (chatStatus.textContent === 'Seen') chatStatus.textContent = '';
      }, 2000);
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

    const ordered = Array.from(this.chats.values()).sort((a, b) => {
      if (a.type === 'saved') return -1;
      if (b.type === 'saved') return 1;
      const at = a.lastMessage?.timestamp ?? 0;
      const bt = b.lastMessage?.timestamp ?? 0;
      return bt - at;
    });

    chatListEl.innerHTML = ordered.map(chat => `
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
        chatStatus.textContent =
          chat.type === 'saved'
            ? 'Your saved messages'
            : (chat.isOnline ? `Connected to ${chat.peerAddress}` : 'Offline');
      }
    }
  }

  protected async sendMessage(): Promise<void> {
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

      const isSavedChat = this.chats.get(this.currentChatId)?.type === 'saved';
      if (!isSavedChat) {
        if (window.electronAPI.transport) {
          await window.electronAPI.transport.send(this.currentChatId, {
            content: messageText,
            timestamp: saved.timestamp,
            type: 'text'
          });
        }
      }

      if (input) input.value = '';
      if (this.currentChatId) {
        this.transport()?.sendSignal?.(this.currentChatId, { action: 'stop_typing' });
      }
      await this.refreshMessages();
      this.refreshChatList();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  }

  protected async sendImageMessage(imageFile: File): Promise<void> {
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

    const isSavedChat = this.chats.get(this.currentChatId)?.type === 'saved';
    if (!isSavedChat) {
      if (window.electronAPI.transport) {
        await window.electronAPI.transport.send(this.currentChatId, {
          content: `📷 ${imageData.filename}`,
          timestamp: saved.timestamp,
          type: 'image',
          imageData
        });
      }
    }

    await this.refreshMessages();
    this.refreshChatList();
  }

  protected async openSavedMessages(): Promise<void> {
    try {
      // Try local cache first
      let savedChat = Array.from(this.chats.values()).find(c => c.type === 'saved');
      if (!savedChat) {
        // Ensure in DB
        const existing = await window.electronAPI.db.getChats();
        savedChat = existing.find(c => c.type === 'saved');
        if (!savedChat) {
          const created = await window.electronAPI.db.saveChat({
            name: '💾 Saved Messages',
            participants: ['me'],
            type: 'saved'
          } as Omit<Chat, 'id'>);
          savedChat = created;
        }
        this.chats.set(savedChat.id, savedChat);
        this.refreshChatList();
      }
      await this.selectChat(savedChat.id);
    } catch (err) {
      console.error('Failed to open Saved Messages:', err);
      alert('Failed to open Saved Messages');
    }
  }

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
    this.chats.clear();
    this.currentChatId = null;
    this.serverInfo = null;

    for (const [, timer] of this.typingTimers) window.clearTimeout(timer);
    this.typingTimers.clear();

    // Clear privacy state via MessageList
    this.messageList.hideRevealedMessage();
    this.recentIncoming.clear();
  }

  // De-dup incoming bursts
  private isDuplicateIncoming(chatId: string, sig: string, ttlMs = 2000): boolean {
    const now = Date.now();
    let map = this.recentIncoming.get(chatId);
    if (!map) {
      map = new Map();
      this.recentIncoming.set(chatId, map);
    }
    // purge expired
    for (const [k, ts] of map) {
      if (now - ts > ttlMs) map.delete(k);
    }
    if (map.has(sig)) return true;
    map.set(sig, now);
    return false;
  }

  // Helper: get "ip:port" from serverInfo or the rendered text
  private getMyAddressString(): string | null {
    if (this.serverInfo?.address && this.serverInfo?.port) {
      return `${this.serverInfo.address}:${this.serverInfo.port}`;
    }
    const el = document.getElementById('my-address');
    const text = (el?.textContent || '').trim();
    const prefix = 'Address:';
    if (!text.startsWith(prefix)) return null;
    const value = text.slice(prefix.length).trim();
    if (!value || value.toLowerCase() === 'unknown') return null;
    return value;
  }

  // Helper: copy text to clipboard (used by address + messages)
  private async copyText(t: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }
}

declare global {
  interface Window {
    chatApp: ChatAppPublic;
  }
}