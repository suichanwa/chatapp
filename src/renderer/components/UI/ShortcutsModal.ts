import { Modal } from '../Modal';
import type { Component } from '../../types/components';

export class ShortcutsModal implements Component {
  private modal: Modal;

  constructor() {
    this.modal = new Modal(
      'shortcuts-modal',
      '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">keyboard</span>Keyboard Shortcuts',
      this.getContent(),
      'shortcuts-modal'
    );
  }

  async initialize(): Promise<void> {
    await this.modal.initialize();
    this.injectStyles();
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById('shortcuts-modal-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'shortcuts-modal-styles';
    style.textContent = `
      /* ShortcutsModal - Matching Your Design System */
      .shortcuts-container {
        padding: 2rem;
        max-height: 70vh;
        overflow-y: auto;
        background: var(--bg-2);
      }

      .shortcuts-intro {
        color: var(--muted);
        font-size: 0.9rem;
        margin-bottom: 2rem;
        text-align: center;
        padding: 1rem;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
      }

      .shortcuts-intro .material-icons {
        color: var(--accent);
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        display: block;
      }

      .shortcut-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 2rem 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.5rem;
      }

      .shortcut-section .material-icons {
        color: var(--accent);
        font-size: 1.2rem;
      }

      .shortcuts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      @media (min-width: 768px) {
        .shortcuts-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .shortcut-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        min-width: 140px;
        flex-shrink: 0;
      }

      .shortcut-item kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        height: 1.75rem;
        padding: 0 0.5rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.15s ease;
      }

      .shortcut-item:hover kbd {
        background: var(--panel);
        border-color: var(--accent);
        color: var(--accent);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .shortcut-plus {
        color: var(--muted);
        font-weight: 500;
        font-size: 0.8rem;
        margin: 0 0.25rem;
      }

      .shortcut-desc {
        color: var(--text);
        font-size: 0.9rem;
        flex: 1;
      }

      .shortcut-item:hover .shortcut-desc {
        color: var(--text);
      }

      .shortcuts-hint {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(0, 122, 204, 0.1);
        border: 1px solid rgba(0, 122, 204, 0.2);
        border-radius: 8px;
        color: var(--accent);
        font-size: 0.9rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .shortcuts-hint::before {
        content: 'lightbulb';
        font-family: 'Material Icons';
        font-size: 1.1rem;
      }

      /* Scrollbar styling */
      .shortcuts-container::-webkit-scrollbar {
        width: 6px;
      }

      .shortcuts-container::-webkit-scrollbar-track {
        background: var(--bg);
      }

      .shortcuts-container::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
      }

      .shortcuts-container::-webkit-scrollbar-thumb:hover {
        background: var(--muted);
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .shortcuts-container {
          padding: 1.5rem;
        }

        .shortcut-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
        }

        .shortcut-keys {
          min-width: 100%;
          justify-content: flex-start;
        }

        .shortcut-desc {
          font-size: 0.8rem;
        }

        .shortcuts-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
      }

      /* High contrast support */
      @media (prefers-contrast: high) {
        .shortcut-item {
          border: 2px solid var(--border);
        }

        .shortcut-item kbd {
          border: 2px solid var(--text);
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .shortcut-item {
          transition: none;
          transform: none;
        }

        .shortcut-item:hover {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Content with proper structure
  private getContent(): string {
    return `
      <div class="shortcuts-container">
        <div class="shortcuts-intro">
          <span class="material-icons">info</span>
          Quick reference for keyboard shortcuts. Some shortcuts work only when a chat is selected.
        </div>

        <div class="shortcut-section">
          <span class="material-icons">chat</span>
          Chat Actions
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Enter</kbd>
            </div>
            <div class="shortcut-desc">Send message to current chat</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>T</kbd>
            </div>
            <div class="shortcut-desc">Focus the message input field</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>O</kbd>
            </div>
            <div class="shortcut-desc">Open image picker to send photos</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>C</kbd>
            </div>
            <div class="shortcut-desc">Copy revealed message or last message</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">navigation</span>
          Navigation
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>N</kbd>
            </div>
            <div class="shortcut-desc">Open "New Chat" modal</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-desc">Hide revealed message or close modals</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>/</kbd>
            </div>
            <div class="shortcut-desc">Show this shortcuts reference</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">content_copy</span>
          Quick Copy
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>A</kbd>
            </div>
            <div class="shortcut-desc">Copy my server address to clipboard</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">privacy_tip</span>
          Privacy
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Click</kbd>
            </div>
            <div class="shortcut-desc">Click any message to reveal timestamp</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-desc">Hide revealed timestamp for privacy</div>
          </div>
        </div>

        <div class="shortcuts-hint">
          <span>Tip: You can also click the keyboard icon in the header to access these shortcuts anytime!</span>
        </div>
      </div>
    `;
  }

  open(): void {
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }

  toggle(): void {
    this.modal.toggle();
  }

  cleanup(): void {
    // Remove injected styles
    const styleEl = document.getElementById('shortcuts-modal-styles');
    if (styleEl) styleEl.remove();

    this.modal?.cleanup();
  }
}