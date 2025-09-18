import type { Component } from '../types/components';

export class Modal implements Component {
  private _modal: HTMLElement | null = null;
  private isOpen = false;
  private eventListeners: Map<string, Function[]> = new Map();

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
      this.createModal();
      this.attachEventListeners();
      console.log(`✅ Modal "${this.id}" initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize modal "${this.id}":`, error);
      throw error;
    }
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
    
    this._modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="${this.id}-title">${this.title}</h3>
            <button class="modal-close" data-action="close" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            ${this.content}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this._modal);
  }

  private attachEventListeners(): void {
    if (!this._modal) return;

    // Close button
    const closeBtn = this._modal.querySelector('[data-action="close"]');
    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    // Click outside to close
    const overlay = this._modal.querySelector('.modal-overlay');
    overlay?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    // Prevent clicking inside modal content from closing
    const modalContent = this._modal.querySelector('.modal-content');
    modalContent?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Store escape handler for cleanup
    this.eventListeners.set('escape', [handleEscape]);
  }

  // Event system for external listeners
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event)!;
    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      listeners.length = 0;
    }
  }

  private emit(event: string, ...args: any[]): void {
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

  open(): void {
    if (!this._modal) {
      console.error('Cannot open modal: modal not initialized');
      return;
    }
    
    if (this.isOpen) {
      console.warn('Modal is already open');
      return;
    }

    this._modal.classList.add('show');
    this.isOpen = true;
    
    // Focus management
    const firstFocusable = this._modal.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    if (firstFocusable) {
      // Small delay to ensure modal is visible
      setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
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
    
    this._modal.classList.remove('show');
    this.isOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to trigger element if available
    const triggerElement = document.querySelector('[data-modal-trigger="' + this.id + '"]') as HTMLElement;
    triggerElement?.focus();
    
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

  setContent(content: string): void {
    if (!this._modal) {
      console.error('Cannot set content: modal not initialized');
      return;
    }
    
    const body = this._modal.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
      console.log(`Modal "${this.id}" content updated`);
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
      titleEl.textContent = title;
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
    
    // Remove modal from DOM
    if (this._modal) {
      this._modal.remove();
      this._modal = null;
    }
    
    // Reset state
    this.isOpen = false;
    
    // Restore body scroll if it was affected
    document.body.style.overflow = '';
  }
}