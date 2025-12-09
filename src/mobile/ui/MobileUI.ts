import type { Component } from '../../renderer/types/components';

export class MobileUI implements Component {
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
    style.id = 'mobile-safe-area-styles';
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
    if (!document.getElementById(style.id)) {
      document.head.appendChild(style);
    }
  }

  private adaptInputs(): void {
    // Make all inputs mobile-friendly
    document.querySelectorAll('input, textarea').forEach((input) => {
      const element = input as HTMLInputElement | HTMLTextAreaElement;

      // Prevent zoom on iOS
      if ((element as HTMLInputElement).type !== 'range') {
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
    const styleId = 'mobile-ui-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Touch feedback */
      .touch-active {
        background-color: rgba(255, 255, 255, 0.06) !important;
        transform: scale(0.995);
        transition: all 0.08s ease;
      }

      /* Mobile-specific button sizing */
      .mobile-layout button {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }

      /* Mobile scrolling improvements */
      .mobile-layout .messages {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      .mobile-layout .chat-list,
      .mobile-layout .messages {
        -webkit-overflow-scrolling: touch;
      }

      /* Virtual keyboard adjustments */
      .mobile-layout.keyboard-open .message-composer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 999;
      }
    `;
    document.head.appendChild(style);
  }

  private handleVirtualKeyboard(): void {
    // Handle virtual keyboard appearance
    const initialViewportHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      if (heightDifference > 150) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    });

    // Focus/blur handling for better UX
    document.addEventListener('focusin', (e: FocusEvent) => {
      const target = e.target as EventTarget | null;
      if (!target) return;

      // Ensure the target is an input or textarea element before calling scrollIntoView
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        // small delay to let virtual keyboard settle
        setTimeout(() => {
          // Type guard ensures scrollIntoView exists
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  private addMobileToolbar(): void {
    // Add a mobile-specific toolbar if needed
    const toolbarId = 'mobile-toolbar';
    if (document.getElementById(toolbarId)) return;

    const toolbar = document.createElement('div');
    toolbar.id = toolbarId;
    toolbar.className = 'mobile-toolbar';
    toolbar.innerHTML = `
      <button class="mobile-back-btn" style="display: none;">← Back</button>
      <div class="mobile-title" aria-hidden="true"></div>
      <button id="mobile-menu-btn" class="mobile-menu-btn" title="Menu">☰</button>
    `;

    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(toolbar);
    }
  }

  private addMobileStatusIndicators(): void {
    // Add minimal mobile status indicators (if not present)
    const container = document.querySelector('.app-status-container');
    if (!container) return;

    // create mobile-specific indicators only if missing
    if (!document.getElementById('mobile-server-status')) {
      const server = document.createElement('div');
      server.id = 'mobile-server-status';
      server.className = 'mobile-server-status';
      server.textContent = 'Server: Not started';
      // Use instanceof check before setting title
      if (server instanceof HTMLElement) {
        server.title = 'Server connection status';
      }
      container.appendChild(server);
    }

    if (!document.getElementById('mobile-my-address')) {
      const addr = document.createElement('div');
      addr.id = 'mobile-my-address';
      addr.className = 'mobile-my-address';
      addr.textContent = 'Address: Unknown';
      if (addr instanceof HTMLElement) {
        addr.title = 'Your server address';
      }
      container.appendChild(addr);
    }
  }

  private addTouchFeedback(): void {
    // Provide quick visual feedback for touchable elements
    document.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('button') || target.closest('.chat-item') || target.classList.contains('composer-btn')) {
        const el = (target.closest('button') || target.closest('.chat-item') || target) as HTMLElement;
        el.classList.add('touch-active');
        setTimeout(() => el.classList.remove('touch-active'), 150);
      }
    }, { passive: true });
  }

  private updateNetworkStatus(): void {
    // Optional helper to update mobile network info
    const serverEl = document.getElementById('mobile-server-status');
    if (serverEl && serverEl instanceof HTMLElement) {
      serverEl.textContent = 'Server: Ready';
      serverEl.title = 'Server is running';
    }
  }

  // Lifecycle stubs for compatibility with Component
  async initialize(): Promise<void> {
    // nothing async needed now, but keep for consistency
  }

  cleanup(): void {
    // remove any mobile-injected styles or listeners if necessary (no-op for now)
  }
}