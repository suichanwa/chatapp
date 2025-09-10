import { ChatApp } from '../renderer/ChatApp';

export class MobileChatApp extends ChatApp {
  constructor() {
    super();
    console.log('📱 MobileChatApp initialized');
  }

  async initialize(): Promise<void> {
    console.log('📱 MobileChatApp: Starting mobile initialization...');
    
    // Mobile-specific setup
    this.setupMobileEnvironment();
    
    // Call parent initialization but with mobile adaptations
    await super.initialize();
    
    // Additional mobile setup
    await this.setupMobileFeatures();
  }

  private setupMobileEnvironment(): void {
    // Add mobile-specific classes to body
    document.body.classList.add('mobile-app');
    
    // Prevent zoom on input focus (iOS)
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
    
    // Handle safe areas (iOS notch)
    if (this.hasNotch()) {
      document.body.classList.add('has-notch');
    }
  }

  private async setupMobileFeatures(): Promise<void> {
    // Request mobile permissions
    await this.requestMobilePermissions();
    
    // Setup mobile-specific networking (WebRTC instead of TCP)
    await this.setupMobileNetworking();
    
    // Setup touch handlers
    this.setupTouchHandlers();
    
    // Handle mobile app lifecycle
    this.setupMobileLifecycle();
  }

  private async requestMobilePermissions(): Promise<void> {
    try {
      // Request notification permission
      if ('Notification' in window) {
        await Notification.requestPermission();
      }
      
      // Request wake lock (keep screen on during chat)
      if ('wakeLock' in navigator) {
        try {
          await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.log('Wake lock request failed:', err);
        }
      }
    } catch (error) {
      console.log('Mobile permissions setup failed:', error);
    }
  }

  private async setupMobileNetworking(): Promise<void> {
    // On mobile, we can't use raw TCP sockets
    // We'll need to use WebRTC for P2P or WebSocket for relay
    console.log('📱 Setting up mobile networking (WebRTC mode)');
    
    // For now, we'll use the existing networking but log that it's mobile
    // In a full implementation, you'd switch to WebRTC here
  }

  private setupTouchHandlers(): void {
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const touchDiff = touchStartY - touchY;
      
      // Prevent pull-to-refresh on chat area
      const chatArea = document.querySelector('.messages');
      if (chatArea && touchDiff < 0 && chatArea.scrollTop === 0) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Handle double-tap to zoom prevention
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  private setupMobileLifecycle(): void {
    // Handle app going to background/foreground
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 App went to background');
        // Could pause networking here
      } else {
        console.log('📱 App came to foreground');
        // Could resume networking here
      }
    });
    
    // Handle device orientation changes
    window.addEventListener('orientationchange', () => {
      // Wait for orientation change to complete
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  private handleOrientationChange(): void {
    console.log('📱 Orientation changed');
    
    // Force a re-render of the chat list/messages
    this.renderChatList();
    if (this.currentChatId) {
      this.renderMessages();
    }
  }

  private hasNotch(): boolean {
    // Check for iPhone X and newer (with notch)
    return /iPhone/.test(navigator.userAgent) && 
           window.screen.height >= 812 && 
           window.devicePixelRatio >= 2;
  }

  // Override the setupUI method to include mobile-specific UI
  protected async setupUI(): Promise<void> {
    // Call parent setupUI first
    await super.setupUI();
    
    // Add mobile-specific UI modifications
    this.adaptUIForMobile();
  }

  private adaptUIForMobile(): void {
    // Make buttons more touch-friendly
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
    });
    
    // Adjust input fields for mobile
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      // Prevent zoom on iOS
      input.style.fontSize = '16px';
    });
    
    // Add mobile-specific classes
    const app = document.getElementById('app');
    if (app) {
      app.classList.add('mobile-layout');
    }
  }
}