import type { Component } from '../types/components';

// Define proper function types instead of generic Function
type EventListener = (...args: unknown[]) => void;
type ContentUpdateCallback = () => void;

export class Modal implements Component {
  private _modal: HTMLElement | null = null;
  private isOpen = false;
  private eventListeners: Map<string, EventListener[]> = new Map();
  private contentUpdateCallback?: ContentUpdateCallback;

  // Public getter for external access
  public get modal(): HTMLElement | null {
    return this._modal;
  }

  constructor(
    private id: string,
    private title: string,
    private content: string = '',
    private className: string = ''
  ) {}

  async initialize(): Promise<void> {
    try {
      this.injectModalStyles();
      this.createModal();
      this.attachEventListeners();
      console.log(`✅ Modal "${this.id}" initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize modal "${this.id}":`, error);
      throw error;
    }
  }

  private injectModalStyles(): void {
    const existingStyle = document.getElementById('modal-base-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'modal-base-styles';
    style.textContent = `
      /* Modal Base Styles - Matching Your Design System */
      .modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: none;
        pointer-events: none;
      }

      .modal.show {
        display: flex;
        pointer-events: auto;
      }

      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .modal.show .modal-overlay {
        opacity: 1;
      }

      .modal-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 2rem;
        z-index: 10001;
      }

      .modal-content {
        background: var(--bg-2, #2d2d2d);
        border: 1px solid var(--border, #404040);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 600px;
        max-height: 85vh;
        overflow: hidden;
        transform: translateY(30px) scale(0.9);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .modal.show .modal-content {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--border, #404040);
        background: var(--panel, #252525);
      }

      .modal-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text, #ffffff);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .modal-title .material-icons {
        font-size: 1.4rem;
        color: var(--accent, #007acc);
      }

      .modal-close {
        background: transparent;
        border: none;
        color: var(--muted, #888);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.5rem;
        line-height: 1;
      }

      .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text, #ffffff);
      }

      .modal-close:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 2px var(--accent, #007acc);
      }

      .modal-close svg {
        width: 1.25rem;
        height: 1.25rem;
      }

      .modal-body {
        padding: 0;
        overflow-y: auto;
        max-height: calc(85vh - 100px);
        background: var(--bg-2, #2d2d2d);
      }

      /* Custom scrollbar to match your design */
      .modal-body::-webkit-scrollbar {
        width: 6px;
      }

      .modal-body::-webkit-scrollbar-track {
        background: var(--bg, #1a1a1a);
      }

      .modal-body::-webkit-scrollbar-thumb {
        background: var(--border, #404040);
        border-radius: 3px;
      }

      .modal-body::-webkit-scrollbar-thumb:hover {
        background: var(--muted, #888);
      }

      /* Focus trap styles - invisible */
      .modal-focus-trap {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .modal-container {
          padding: 1rem;
        }

        .modal-content {
          max-width: 100%;
          max-height: 90vh;
          border-radius: 8px;
        }

        .modal-header {
          padding: 1rem 1.5rem;
        }

        .modal-title {
          font-size: 1.1rem;
        }

        .modal-close {
          width: 2rem;
          height: 2rem;
          font-size: 1.25rem;
        }

        .modal-close svg {
          width: 1rem;
          height: 1rem;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .modal-content {
          border: 2px solid var(--text, #ffffff);
        }

        .modal-close:focus {
          outline: 2px solid var(--text, #ffffff);
          outline-offset: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .modal-overlay,
        .modal-content {
          transition: none;
        }

        .modal.show .modal-content {
          transform: none;
        }
      }

      /* Print styles */
      @media print {
        .modal {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private createModal(): void {
    // Remove existing modal if any
    const existingModal = document.getElementById(this.id);
    if (existingModal) {
      existingModal.remove();
    }

    this._modal = document.createElement('div');
    this._modal.id = this.id;
    this._modal.className = `modal ${this.className}`;
    this._modal.setAttribute('role', 'dialog');
    this._modal.setAttribute('aria-modal', 'true');
    this._modal.setAttribute('aria-labelledby', `${this.id}-title`);
    this._modal.setAttribute('aria-hidden', 'true');
    
    this._modal.innerHTML = `
      <div class="modal-overlay" aria-hidden="true"></div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-focus-trap" tabindex="0"></div>
          <div class="modal-header">
            <h3 class="modal-title" id="${this.id}-title">${this.title}</h3>
            <button class="modal-close" data-action="close" aria-label="Close modal" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="modal-body" role="document">
            ${this.content}
          </div>
          <div class="modal-focus-trap" tabindex="0"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this._modal);
  }

  private attachEventListeners(): void {
    if (!this._modal) return;

    // Close button
    const closeBtn = this._modal.querySelector('[data-action="close"]');
    const closeHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    };
    closeBtn?.addEventListener('click', closeHandler);

    // Click outside to close
    const overlay = this._modal.querySelector('.modal-overlay');
    const overlayHandler = (e: Event) => {
      if (e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    };
    overlay?.addEventListener('click', overlayHandler);

    // Prevent clicking inside modal content from closing
    const modalContent = this._modal.querySelector('.modal-content');
    const contentHandler = (e: Event) => {
      e.stopPropagation();
    };
    modalContent?.addEventListener('click', contentHandler);

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Focus trap
    this.setupFocusTrap();

    // Store handlers for cleanup
    this.eventListeners.set('escape', [handleEscape]);
    this.eventListeners.set('close', [closeHandler]);
    this.eventListeners.set('overlay', [overlayHandler]);
    this.eventListeners.set('content', [contentHandler]);
  }

  private setupFocusTrap(): void {
    if (!this._modal) return;

    const focusTraps = this._modal.querySelectorAll('.modal-focus-trap');
    const firstTrap = focusTraps[0] as HTMLElement;
    const lastTrap = focusTraps[1] as HTMLElement;

    if (firstTrap && lastTrap) {
      firstTrap.addEventListener('focus', () => {
        const lastFocusable = this.getLastFocusableElement();
        if (lastFocusable) lastFocusable.focus();
      });

      lastTrap.addEventListener('focus', () => {
        const firstFocusable = this.getFirstFocusableElement();
        if (firstFocusable) firstFocusable.focus();
      });
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this._modal) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const elements = this._modal.querySelectorAll(focusableSelectors);
    return Array.from(elements).filter(el => {
      const element = el as HTMLElement;
      return !element.classList.contains('modal-focus-trap') && 
             element.offsetWidth > 0 && 
             element.offsetHeight > 0;
    }) as HTMLElement[];
  }

  private getFirstFocusableElement(): HTMLElement | null {
    const elements = this.getFocusableElements();
    return elements[0] || null;
  }

  private getLastFocusableElement(): HTMLElement | null {
    const elements = this.getFocusableElements();
    return elements[elements.length - 1] || null;
  }

  // Event system for external listeners
  on(event: string, callback: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(callback);
    }
  }

  off(event: string, callback?: EventListener): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      listeners.length = 0;
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in modal event listener for "${event}":`, error);
        }
      });
    }

    // Also dispatch DOM event
    if (this._modal) {
      this._modal.dispatchEvent(new CustomEvent(`modal:${event}`, { 
        detail: { modal: this, args } 
      }));
    }
  }

  // Animation duration (ms)
  private static ANIM_MS = 300;

  open(): void {
    if (!this._modal) {
      console.error('Cannot open modal: modal not initialized');
      return;
    }
    if (this.isOpen) {
      console.warn('Modal is already open');
      return;
    }

    // Show modal
    this._modal.classList.add('show');
    this._modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Store currently focused element
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this._modal.setAttribute('data-previous-focus', activeElement.id || '');
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first focusable element after animation
    setTimeout(() => {
      const firstFocusable = this.getFirstFocusableElement();
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 150);

    // Emit events
    this.emit('opened');
    console.log(`Modal "${this.id}" opened`);
  }

  close(): void {
    if (!this._modal) {
      console.error('Cannot close modal: modal not initialized');
      return;
    }
    if (!this.isOpen) {
      console.warn('Modal is already closed');
      return;
    }

    // Hide modal
    this._modal.classList.remove('show');
    this._modal.setAttribute('aria-hidden', 'true');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus to previous element
    const previousFocusId = this._modal.getAttribute('data-previous-focus');
    if (previousFocusId) {
      const previousElement = document.getElementById(previousFocusId);
      if (previousElement) {
        setTimeout(() => previousElement.focus(), 100);
      }
    }

    // Emit events
    this.emit('closed');
    console.log(`Modal "${this.id}" closed`);
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // Set a callback to be called after content is updated
  setContentUpdateCallback(callback: ContentUpdateCallback): void {
    this.contentUpdateCallback = callback;
  }

  setContent(content: string): void {
    if (!this._modal) {
      console.error('Cannot set content: modal not initialized');
      return;
    }
    
    const body = this._modal.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
      console.log(`Modal "${this.id}" content updated`);
      
      // Emit content update event for external listeners
      this.emit('content-updated');
      
      // Call registered callback if any (for NewChatModal to rebind handlers)
      if (this.contentUpdateCallback) {
        setTimeout(() => {
          if (this.contentUpdateCallback) {
            this.contentUpdateCallback();
          }
        }, 0);
      }
    }
  }

  setTitle(title: string): void {
    if (!this._modal) {
      console.error('Cannot set title: modal not initialized');
      return;
    }
    
    this.title = title;
    const titleEl = this._modal.querySelector('.modal-title');
    if (titleEl) {
      titleEl.innerHTML = title; // Use innerHTML to support HTML in titles (like Material Icons)
    }
  }

  // Check if modal is currently open
  getIsOpen(): boolean {
    return this.isOpen;
  }

  // Get modal element (alternative to getter)
  getElement(): HTMLElement | null {
    return this._modal;
  }

  // Add CSS class to modal
  addClass(className: string): void {
    this._modal?.classList.add(className);
  }

  // Remove CSS class from modal
  removeClass(className: string): void {
    this._modal?.classList.remove(className);
  }

  // Check if modal has CSS class
  hasClass(className: string): boolean {
    return this._modal?.classList.contains(className) ?? false;
  }

  cleanup(): void {
    console.log(`🧹 Cleaning up modal "${this.id}"`);
    
    // Remove event listeners
    const escapeHandlers = this.eventListeners.get('escape');
    if (escapeHandlers) {
      escapeHandlers.forEach(handler => {
        document.removeEventListener('keydown', handler as EventListener);
      });
    }
    
    // Clear all event listeners
    this.eventListeners.clear();
    
    // Reset callback
    this.contentUpdateCallback = undefined;
    
    // Remove modal from DOM
    if (this._modal) {
      this._modal.remove();
      this._modal = null;
    }
    
    // Reset state
    this.isOpen = false;
    
    // Restore body scroll if it was affected
    document.body.style.overflow = '';

    // Remove injected styles if this is the last modal
    if (!document.querySelector('.modal')) {
      const styleEl = document.getElementById('modal-base-styles');
      if (styleEl) styleEl.remove();
    }
  }
}