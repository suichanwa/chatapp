export class MobileUI {
  adapt(): void {
    console.log('📱 MobileUI: UI adaptations applied');
    
    // Add mobile-specific classes
    document.body.classList.add('mobile-layout');
    
    // Adjust for safe areas
    this.setupSafeAreas();
    
    // Make inputs mobile-friendly
    this.adaptInputs();
    
    // Setup mobile-specific styles
    this.injectMobileStyles();
    
    // Handle virtual keyboard
    this.handleVirtualKeyboard();
  }

  addMobileElements(): void {
    console.log('📱 MobileUI: Mobile elements added');
    
    // Add mobile-specific UI elements
    this.addMobileToolbar();
    this.addMobileStatusIndicators();
    this.addTouchFeedback();
  }

  private setupSafeAreas(): void {
    // Handle iOS safe areas and Android status bar
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0);
        --safe-area-inset-right: env(safe-area-inset-right, 0);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
        --safe-area-inset-left: env(safe-area-inset-left, 0);
      }
      
      .mobile-layout .app-header {
        padding-top: max(1rem, var(--safe-area-inset-top));
      }
      
      .mobile-layout .message-composer {
        padding-bottom: max(1rem, var(--safe-area-inset-bottom));
      }
    `;
    document.head.appendChild(style);
  }

  private adaptInputs(): void {
    // Make all inputs mobile-friendly
    document.querySelectorAll('input, textarea').forEach(input => {
      const element = input as HTMLInputElement;
      
      // Prevent zoom on iOS
      if (element.type !== 'range') {
        element.style.fontSize = '16px';
      }
      
      // Add mobile-specific attributes
      element.setAttribute('autocomplete', 'off');
      element.setAttribute('autocorrect', 'off');
      element.setAttribute('autocapitalize', 'off');
      element.setAttribute('spellcheck', 'false');
    });
  }

  private injectMobileStyles(): void {
    const style = document.createElement('style');
    style.id = 'mobile-ui-styles';
    style.textContent = `
      /* Touch feedback */
      .touch-active {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: scale(0.98);
        transition: all 0.1s ease;
      }
      
      /* Mobile-specific button sizing */
      .mobile-layout button {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }
      
      /* Mobile scrolling */
      .mobile-layout .messages {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      
      /* Mobile chat list */
      .mobile-layout .chat-list {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Virtual keyboard adjustments */
      .mobile-layout.keyboard-open .message-composer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }
      
      /* Offline indicator */
      .offline-mode::before {
        content: '📵 Offline';
        position: fixed;
        top: var(--safe-area-inset-top);
        left: 0;
        right: 0;
        background: #ff4444;
        color: white;
        text-align: center;
        padding: 0.5rem;
        font-size: 0.8rem;
        z-index: 9999;
      }
      
      /* Orientation-specific styles */
      .landscape .chat-list {
        width: 300px !important;
        height: auto !important;
      }
      
      .portrait .chat-list {
        width: 100% !important;
        height: 200px !important;
      }
    `;
    document.head.appendChild(style);
  }

  private handleVirtualKeyboard(): void {
    // Handle virtual keyboard appearance
    let initialViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150) { // Keyboard is likely open
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    });

    // Focus/blur handling for better UX
    document.addEventListener('focusin', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  private addMobileToolbar(): void {
    // Add a mobile-specific toolbar if needed
    const toolbar = document.createElement('div');
    toolbar.className = 'mobile-toolbar';
    toolbar.innerHTML = `
      <button class="mobile-back-btn" style="display: none;">← Back</button>
      <div class="mobile-title"></div>
      <button class="mobile-menu-btn">☰</button>
    `;
    
    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(toolbar);
    }
  }

  private addMobileStatusIndicators(): void {
    // Add mobile-specific status indicators
    const indicators = document.createElement('div');
    indicators.className = 'mobile-status-indicators';
    indicators.innerHTML = `
      <div class="network-status">📶</div>
      <div class="battery-status" style="display: none;">🔋</div>
    `;
    
    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(indicators);
    }

    // Update network status
    this.updateNetworkStatus();
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());
  }

  private addTouchFeedback(): void {
    // Add haptic feedback for supported devices
    const addHapticFeedback = (element: Element, intensity = 'medium') => {
      element.addEventListener('touchstart', () => {
        if ('vibrate' in navigator) {
          const patterns = {
            light: [5],
            medium: [10],
            heavy: [20]
          };
          navigator.vibrate(patterns[intensity as keyof typeof patterns] || patterns.medium);
        }
      });
    };

    // Add feedback to buttons and interactive elements
    document.querySelectorAll('button, .chat-item, .tab-btn').forEach(el => {
      addHapticFeedback(el);
    });
  }

  private updateNetworkStatus(): void {
    const networkStatus = document.querySelector('.network-status');
    if (networkStatus) {
      if (navigator.onLine) {
        networkStatus.textContent = '📶';
        networkStatus.title = 'Online';
      } else {
        networkStatus.textContent = '📵';
        networkStatus.title = 'Offline';
      }
    }
  }
}