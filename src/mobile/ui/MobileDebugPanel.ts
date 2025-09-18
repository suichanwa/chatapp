import { MobileToast } from './MobileToast';

export class MobileDebugPanel {
  private isOpen = false;
  private debugPanel: any = null;

  constructor() {
    console.log('📱 MobileDebugPanel: Initialized');
  }

  initialize(debugPanelComponent: any): void {
    this.debugPanel = debugPanelComponent;
    this.createMobileDebugButton();
    console.log('📱 MobileDebugPanel: Setup complete');
  }

  private createMobileDebugButton(): void {
    // Remove any existing debug toggles first
    this.removeExistingDebugToggles();

    console.log('📱 Creating mobile debug button');
    
    const header = document.querySelector('.app-header');
    if (!header) {
      console.error('📱 Header not found');
      return;
    }

    // Create debug button container
    const debugContainer = document.createElement('div');
    debugContainer.className = 'mobile-debug-container';
    
    const debugBtn = document.createElement('button');
    debugBtn.id = 'mobile-debug-btn';
    debugBtn.className = 'mobile-debug-btn';
    debugBtn.innerHTML = '☰';
    debugBtn.title = 'Debug Menu';

    debugContainer.appendChild(debugBtn);

    // Insert at the beginning of header (before title)
    header.insertBefore(debugContainer, header.firstChild);

    // Add styles
    this.injectDebugStyles();

    // Add event listeners
    this.attachEventListeners(debugBtn);
    
    console.log('📱 Mobile debug button created successfully');
  }

  private removeExistingDebugToggles(): void {
    // Remove desktop debug toggle
    const desktopToggle = document.getElementById('debug-toggle');
    if (desktopToggle) {
      console.log('📱 Removing desktop debug toggle');
      desktopToggle.remove();
    }

    // Remove any existing mobile debug buttons
    const existingMobileBtn = document.getElementById('mobile-debug-btn');
    if (existingMobileBtn) {
      console.log('📱 Removing existing mobile debug button');
      existingMobileBtn.parentElement?.remove();
    }
  }

  private attachEventListeners(debugBtn: HTMLButtonElement): void {
    // Main click handler
    debugBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDebugPanel();
    });

    // Touch feedback
    debugBtn.addEventListener('touchstart', () => {
      debugBtn.classList.add('touch-active');
    }, { passive: true });
    
    debugBtn.addEventListener('touchend', () => {
      setTimeout(() => {
        debugBtn.classList.remove('touch-active');
      }, 150);
    }, { passive: true });
  }

  private toggleDebugPanel(): void {
    console.log('📱 Mobile debug button clicked');
    
    if (this.debugPanel && typeof this.debugPanel.toggle === 'function') {
      this.debugPanel.toggle();
      this.isOpen = !this.isOpen;
      
      // Update button state
      const debugBtn = document.getElementById('mobile-debug-btn');
      if (debugBtn) {
        debugBtn.classList.toggle('active', this.isOpen);
      }
      
      console.log('📱 Debug panel toggled:', this.isOpen ? 'opened' : 'closed');
    } else {
      console.error('📱 Debug panel not available');
      MobileToast.showError('Debug panel not available');
    }
  }

  private injectDebugStyles(): void {
    if (document.getElementById('mobile-debug-panel-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'mobile-debug-panel-styles';
    style.textContent = `
      /* Mobile Debug Container */
      .mobile-debug-container {
        margin-right: 15px;
      }
      
      .mobile-debug-btn {
        background: transparent;
        border: 2px solid #007acc;
        color: #007acc;
        width: 44px;
        height: 44px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .mobile-debug-btn:hover,
      .mobile-debug-btn.touch-active {
        background: #007acc;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
      }
      
      .mobile-debug-btn.active {
        background: #ff4444;
        border-color: #ff4444;
        color: white;
      }

      .mobile-debug-btn.active:hover,
      .mobile-debug-btn.active.touch-active {
        background: #cc3333;
        border-color: #cc3333;
      }
      
      /* Ensure proper header layout */
      .app-header {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 1rem !important;
        gap: 0 !important;
      }
      
      .app-header h1 {
        margin: 0 !important;
        flex: 1 !important;
      }

      .app-status-container {
        margin-left: auto !important;
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .mobile-debug-btn {
          width: 40px;
          height: 40px;
          font-size: 16px;
        }
        
        .app-header {
          padding: 0.75rem !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    console.log('📱 Mobile debug panel styles injected');
  }

  // Method to handle triple-tap gesture as backup
  handleTripleTap(): void {
    console.log('📱 Triple-tap detected - toggling debug panel');
    this.toggleDebugPanel();
  }

  // Cleanup method
  cleanup(): void {
    const debugBtn = document.getElementById('mobile-debug-btn');
    if (debugBtn) {
      debugBtn.parentElement?.remove();
    }
    
    const styles = document.getElementById('mobile-debug-panel-styles');
    if (styles) {
      styles.remove();
    }
    
    console.log('📱 MobileDebugPanel: Cleaned up');
  }
}