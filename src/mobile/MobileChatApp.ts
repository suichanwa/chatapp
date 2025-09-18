import { ChatApp } from '../renderer/ChatApp';
import { MobileStatusBar } from './core/MobileStatusBar';
import { MobileTouchHandler } from './core/MobileTouchHandler';
import { MobileKeyboardHandler } from './core/MobileKeyboardHandler';
import type { Component } from '../renderer/types/components';
import type { Message, Chat, PeerInfo } from '../types/index';

export class MobileChatApp extends ChatApp {
  // Mobile-specific components
  private mobileStatusBar: MobileStatusBar;
  private touchHandler: MobileTouchHandler;
  private keyboardHandler: MobileKeyboardHandler;
  
  // Mobile state
  private isKeyboardVisible = false;
  private currentOrientation: 'portrait' | 'landscape' = 'portrait';
  private chatListVisible = true;

  constructor() {
    super();
    console.log('📱 MobileChatApp: Initializing mobile components...');
    
    // Initialize mobile-specific components
    this.mobileStatusBar = new MobileStatusBar(this);
    this.touchHandler = new MobileTouchHandler(this);
    this.keyboardHandler = new MobileKeyboardHandler(this);
    
    // Add mobile components to the main components map
    this.components.set('mobileStatusBar', this.mobileStatusBar);
    this.components.set('touchHandler', this.touchHandler);
    this.components.set('keyboardHandler', this.keyboardHandler);
  }

  async initialize(): Promise<void> {
    console.log('📱 MobileChatApp: Starting mobile initialization...');
    
    // Setup mobile-specific event listeners first
    this.setupMobileEventListeners();
    
    // Setup mobile viewport and orientation handling
    this.setupMobileViewport();
    
    // Call parent initialization
    await super.initialize();
    
    // Apply mobile-specific UI adaptations
    this.applyMobileAdaptations();
    
    // Setup mobile gesture handling
    this.setupMobileGestures();
    
    console.log('📱 MobileChatApp: Mobile initialization complete');
  }

  protected async setupUI(): Promise<void> {
    // Mobile-optimized UI structure
    document.body.innerHTML = `
      <div id="app" class="mobile-app">
        <!-- Mobile Status Bar -->
        <div id="mobile-status-bar" class="mobile-status-bar">
          <div class="status-left">
            <span id="connection-status" class="connection-status">🔄</span>
            <span id="app-title">Secure Chat</span>
          </div>
          <div class="status-right">
            <button id="mobile-menu-btn" class="mobile-menu-btn">☰</button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav id="mobile-nav" class="mobile-nav hidden">
          <div class="nav-item" data-action="new-chat">
            <span class="nav-icon">➕</span>
            <span class="nav-label">New Chat</span>
          </div>
          <div class="nav-item" data-action="settings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </div>
          <div class="nav-item" data-action="debug">
            <span class="nav-icon">🔧</span>
            <span class="nav-label">Debug</span>
          </div>
        </nav>

        <!-- Mobile Main Content -->
        <main class="mobile-main">
          <!-- Chat List Panel -->
          <aside id="chat-list-panel" class="chat-list-panel ${this.chatListVisible ? 'visible' : 'hidden'}">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <button id="new-chat-btn" class="new-chat-btn">➕</button>
            </div>
            <div class="search-container">
              <input type="text" id="chat-search" class="chat-search" placeholder="Search chats...">
            </div>
            <ul id="chat-list" class="chat-list"></ul>
            
            <!-- Mobile Connection Info -->
            <div class="mobile-connection-info">
              <div class="connection-item">
                <span class="connection-label">Server:</span>
                <span id="mobile-server-status" class="connection-value">Not started</span>
              </div>
              <div class="connection-item">
                <span class="connection-label">Address:</span>
                <span id="mobile-my-address" class="connection-value">Unknown</span>
              </div>
            </div>
          </aside>
          
          <!-- Chat View Panel -->
          <section id="chat-view-panel" class="chat-view-panel ${this.currentChatId ? 'visible' : 'hidden'}">
            <!-- Mobile Chat Header -->
            <header class="mobile-chat-header">
              <button id="back-to-chats" class="back-btn">‹</button>
              <div class="chat-info">
                <h3 id="chat-title">Select a chat</h3>
                <div id="chat-status" class="chat-status"></div>
              </div>
              <div class="chat-actions">
                <button id="chat-menu-btn" class="chat-menu-btn">⋮</button>
              </div>
            </header>

            <!-- Messages Container -->
            <div id="messages" class="mobile-messages">
              <div class="welcome-message">
                <h3>🔒 Welcome to Secure Chat Mobile</h3>
                <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
                <p>Tap "➕" to connect to a peer or start your first conversation.</p>
                <p>💾 Long press messages to save them!</p>
              </div>
            </div>

            <!-- Mobile Message Composer -->
            <div id="message-composer" class="mobile-message-composer">
              <div class="composer-controls">
                <button id="image-btn" class="composer-btn" disabled title="Send Image">📷</button>
                <button id="voice-btn" class="composer-btn" disabled title="Voice Message">🎤</button>
              </div>
              <div class="composer-input-container">
                <input type="text" 
                       id="message-input" 
                       class="mobile-message-input" 
                       placeholder="Type a secure message..." 
                       disabled
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="sentences">
                <button id="send-btn" class="mobile-send-btn" disabled>➤</button>
              </div>
              <input type="file" id="image-input" accept="image/*" style="display: none;">
            </div>
          </section>
        </main>

        <!-- Mobile Overlay for modals -->
        <div id="mobile-overlay" class="mobile-overlay hidden"></div>
      </div>
    `;

    // Setup mobile-specific event listeners
    this.setupMobileEventListeners();
  }

  private setupMobileEventListeners(): void {
    // Mobile menu toggle
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.id === 'mobile-menu-btn') {
        this.toggleMobileMenu();
      } else if (target.id === 'back-to-chats') {
        this.showChatList();
      } else if (target.closest('.nav-item')) {
        const action = target.closest('.nav-item')?.getAttribute('data-action');
        this.handleNavAction(action);
      }
    });

    // Chat search functionality
    const chatSearch = document.getElementById('chat-search');
    chatSearch?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterChats(query);
    });

    // Orientation change handling
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleOrientationChange(), 100);
    });

    // Keyboard visibility handling
    window.addEventListener('resize', () => {
      this.handleKeyboardVisibility();
    });

    // Touch events for swipe gestures
    this.setupSwipeGestures();

    // Prevent zoom on double tap (mobile specific)
    document.addEventListener('touchend', (e) => {
      if (e.touches.length > 1) return;
      
      const now = Date.now();
      const timeSince = now - this.lastTapTime;
      
      if (timeSince < 300 && timeSince > 0) {
        e.preventDefault();
      }
      
      this.lastTapTime = now;
    });
  }

  private lastTapTime = 0;

  private setupMobileViewport(): void {
    // Set mobile viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    // Handle safe area insets for devices with notches
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');

    // Set initial orientation
    this.updateOrientation();
  }

  private applyMobileAdaptations(): void {
    // Add mobile class to body
    document.body.classList.add('mobile-device');
    
    // Apply mobile-specific CSS
    const style = document.createElement('style');
    style.textContent = this.getMobileCSSOverrides();
    document.head.appendChild(style);

    // Disable context menu on long press for iOS
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handle iOS safe area
    if (this.isIOS()) {
      document.body.classList.add('ios-device');
    }

    // Handle Android specific adaptations
    if (this.isAndroid()) {
      document.body.classList.add('android-device');
    }
  }

  private setupMobileGestures(): void {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    const chatListPanel = document.getElementById('chat-list-panel');
    const chatViewPanel = document.getElementById('chat-view-panel');

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', () => {
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // Only handle horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - show chat view (hide chat list)
          if (this.currentChatId) {
            this.showChatView();
          }
        } else {
          // Swipe right - show chat list
          this.showChatList();
        }
      }
    });
  }

  private setupSwipeGestures(): void {
    // Enhanced swipe gesture handling for better mobile UX
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;

      // Only process swipes that are:
      // - Primarily horizontal
      // - Fast enough (< 500ms)
      // - Long enough (> 50px)
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > 50 && 
          deltaTime < 500) {
        
        if (deltaX > 0) {
          // Right swipe - go back to chat list
          this.showChatList();
        } else {
          // Left swipe - show current chat (if any)
          if (this.currentChatId) {
            this.showChatView();
          }
        }
      }
    });
  }

  private toggleMobileMenu(): void {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-overlay');
    
    if (nav && overlay) {
      nav.classList.toggle('hidden');
      overlay.classList.toggle('hidden');
      
      if (!nav.classList.contains('hidden')) {
        // Close menu when clicking overlay
        overlay.addEventListener('click', () => {
          nav.classList.add('hidden');
          overlay.classList.add('hidden');
        }, { once: true });
      }
    }
  }

  private handleNavAction(action: string | null): void {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-overlay');
    
    // Close menu
    nav?.classList.add('hidden');
    overlay?.classList.add('hidden');
    
    switch (action) {
      case 'new-chat':
        this.showNewChatModal();
        break;
      case 'settings':
        this.showMobileSettings();
        break;
      case 'debug':
        this.toggleMobileDebug();
        break;
    }
  }

  private showChatList(): void {
    this.chatListVisible = true;
    const chatListPanel = document.getElementById('chat-list-panel');
    const chatViewPanel = document.getElementById('chat-view-panel');
    
    chatListPanel?.classList.add('visible');
    chatListPanel?.classList.remove('hidden');
    
    if (window.innerWidth <= 768) {
      // On mobile, hide chat view when showing chat list
      chatViewPanel?.classList.add('hidden');
      chatViewPanel?.classList.remove('visible');
    }
  }

  private showChatView(): void {
    if (!this.currentChatId) return;
    
    const chatListPanel = document.getElementById('chat-list-panel');
    const chatViewPanel = document.getElementById('chat-view-panel');
    
    chatViewPanel?.classList.add('visible');
    chatViewPanel?.classList.remove('hidden');
    
    if (window.innerWidth <= 768) {
      // On mobile, hide chat list when showing chat view
      this.chatListVisible = false;
      chatListPanel?.classList.add('hidden');
      chatListPanel?.classList.remove('visible');
    }
  }

  private filterChats(query: string): void {
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
      const chatName = item.querySelector('.chat-name')?.textContent?.toLowerCase() || '';
      const chatPreview = item.querySelector('.chat-preview')?.textContent?.toLowerCase() || '';
      
      if (chatName.includes(query) || chatPreview.includes(query) || query === '') {
        (item as HTMLElement).style.display = '';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  }

  private handleOrientationChange(): void {
    this.updateOrientation();
    this.adjustUIForOrientation();
  }

  private updateOrientation(): void {
    if (window.innerHeight > window.innerWidth) {
      this.currentOrientation = 'portrait';
      document.body.classList.add('portrait');
      document.body.classList.remove('landscape');
    } else {
      this.currentOrientation = 'landscape';
      document.body.classList.add('landscape');
      document.body.classList.remove('portrait');
    }
  }

  private adjustUIForOrientation(): void {
    if (this.currentOrientation === 'landscape') {
      // In landscape, show both panels side by side if possible
      const chatListPanel = document.getElementById('chat-list-panel');
      const chatViewPanel = document.getElementById('chat-view-panel');
      
      if (window.innerWidth >= 768) {
        chatListPanel?.classList.add('visible');
        chatListPanel?.classList.remove('hidden');
        chatViewPanel?.classList.add('visible');
        chatViewPanel?.classList.remove('hidden');
      }
    }
  }

  private handleKeyboardVisibility(): void {
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const isKeyboardVisible = windowHeight < screen.height * 0.75;
    
    if (isKeyboardVisible !== this.isKeyboardVisible) {
      this.isKeyboardVisible = isKeyboardVisible;
      
      if (isKeyboardVisible) {
        document.body.classList.add('keyboard-visible');
        // Scroll to bottom of messages when keyboard opens
        this.scrollToBottomOfMessages();
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    }
  }

  private scrollToBottomOfMessages(): void {
    setTimeout(() => {
      const messages = document.getElementById('messages');
      if (messages) {
        messages.scrollTop = messages.scrollHeight;
      }
    }, 100);
  }

  // Override parent methods for mobile-specific behavior
  protected async selectChat(chatId: string): Promise<void> {
    await super.selectChat(chatId);
    
    // Mobile-specific: automatically show chat view when chat is selected
    this.showChatView();
    
    // Update mobile chat header
    this.updateMobileChatHeader();
  }

  private updateMobileChatHeader(): void {
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
        if (chat.type === 'saved') {
          chatStatusEl.textContent = 'Your saved messages';
        } else {
          chatStatusEl.textContent = chat.isOnline ? 
            `Connected • ${chat.peerAddress}` : 
            'Offline';
        }
      }
    }
  }

  // Override refresh methods for mobile UI updates
  protected refreshChatList(): void {
    super.refreshChatList();
    this.updateMobileConnectionInfo();
  }

  private updateMobileConnectionInfo(): void {
    // Update mobile status bar connection indicator
    const connectionStatus = document.getElementById('connection-status');
    const mobileServerStatus = document.getElementById('mobile-server-status');
    const mobileMyAddress = document.getElementById('mobile-my-address');
    
    // Simple connection status indicator
    if (connectionStatus) {
      const hasConnectedChats = Array.from(this.chats.values()).some(chat => chat.isOnline);
      connectionStatus.textContent = hasConnectedChats ? '🟢' : '🔄';
    }
  }

  // Mobile-specific modal handling
  protected showNewChatModal(): void {
    console.log('📱 MobileChatApp: Opening mobile new chat modal...');
    
    if (this.newChatModal) {
      // Add mobile class for mobile-specific styling
      setTimeout(() => {
        const modal = document.getElementById('new-chat-modal');
        modal?.classList.add('mobile-modal');
      }, 10);
      
      this.newChatModal.open();
    } else {
      console.error('📱 NewChatModal not available');
      this.createMobileFallbackModal();
    }
  }

  private createMobileFallbackModal(): void {
    // Mobile-optimized fallback modal
    const modal = document.createElement('div');
    modal.id = 'mobile-new-chat-modal';
    modal.className = 'mobile-modal-overlay';
    modal.innerHTML = `
      <div class="mobile-modal">
        <div class="mobile-modal-header">
          <h3>🆕 New Chat</h3>
          <button class="mobile-modal-close">✕</button>
        </div>
        <div class="mobile-modal-body">
          <div class="mobile-form-group">
            <label>Peer Address (IP:Port)</label>
            <input type="text" id="mobile-peer-address" placeholder="127.0.0.1:8080">
          </div>
          <div class="mobile-form-group">
            <label>Chat Name</label>
            <input type="text" id="mobile-chat-name" placeholder="Chat with friend">
          </div>
          <button id="mobile-connect-btn" class="mobile-primary-btn">Connect</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mobile modal event handlers
    modal.querySelector('.mobile-modal-close')?.addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  private showMobileSettings(): void {
    console.log('📱 MobileChatApp: Mobile settings not implemented yet');
    // TODO: Implement mobile settings
  }

  private toggleMobileDebug(): void {
    // Get debug component and toggle it
    const debug = this.components.get('debug');
    if (debug && 'toggle' in debug) {
      (debug as any).toggle();
    }
  }

  // Utility methods
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  private getMobileCSSOverrides(): string {
    return `
      /* Mobile-specific CSS overrides */
      .mobile-device {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .mobile-app {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      
      .mobile-status-bar {
        height: 44px;
        padding-top: var(--safe-area-inset-top, 0);
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: var(--safe-area-inset-left, 16px);
        padding-right: var(--safe-area-inset-right, 16px);
        border-bottom: 1px solid #333;
      }
      
      .mobile-main {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      @media (max-width: 768px) {
        .chat-list-panel {
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
        }
        
        .chat-view-panel {
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
        }
        
        .hidden {
          transform: translateX(-100%);
        }
        
        .visible {
          transform: translateX(0);
        }
      }
      
      .keyboard-visible .mobile-message-composer {
        padding-bottom: var(--safe-area-inset-bottom, 0);
      }
    `;
  }

  cleanup(): void {
    console.log('📱 MobileChatApp: Starting mobile cleanup...');
    
    // Remove mobile event listeners
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleKeyboardVisibility);
    
    // Call parent cleanup
    super.cleanup();
    
    console.log('📱 MobileChatApp: Mobile cleanup complete');
  }
}