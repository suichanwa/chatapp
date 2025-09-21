import { Modal } from '../Modal';
import type { Component } from '../../types/components';

export class ShortcutsModal implements Component {
  private modal: Modal;

  constructor() {
    this.modal = new Modal(
      'shortcuts-modal',
      '⌨️ Keyboard Shortcuts',
      this.getContent(),
      'shortcuts-modal'
    );
  }

  async initialize(): Promise<void> {
    await this.modal.initialize();
  }

  // Static content for now; can be generated dynamically if needed
  private getContent(): string {
    return `
      <style>
        .shortcuts-container {
          padding: 1rem 1.25rem;
        }
        .shortcuts-intro {
          color: #bbb;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .shortcuts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        @media (min-width: 640px) {
          .shortcuts-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #1f1f1f;
          border: 1px solid #363636;
          border-radius: 8px;
          padding: 0.75rem 0.9rem;
        }
        .shortcut-keys {
          display: inline-flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          min-width: 160px;
        }
        kbd {
          background: #2d2d2d;
          border: 1px solid #444;
          border-bottom-color: #333;
          border-radius: 6px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25);
          color: #eee;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
          font-size: 0.8rem;
          padding: 0.2rem 0.45rem;
          display: inline-block;
          line-height: 1.1;
          user-select: none;
        }
        .shortcut-plus {
          color: #888;
          font-weight: 600;
        }
        .shortcut-desc {
          color: #ddd;
        }
        .shortcut-section {
          margin-top: 1rem;
          margin-bottom: 0.25rem;
          color: #9ecbff;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .hint {
          color: #8a8a8a;
          font-size: 0.85rem;
          margin-top: 0.75rem;
        }
      </style>

      <div class="shortcuts-container">
        <div class="shortcuts-intro">
          Quick reference for common actions. Some shortcuts work only when a chat is selected.
        </div>

        <div class="shortcut-section">Chat</div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Enter</kbd>
            </div>
            <div class="shortcut-desc">Send message</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>T</kbd>
            </div>
            <div class="shortcut-desc">Focus the message input</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>O</kbd>
            </div>
            <div class="shortcut-desc">Open image picker</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>C</kbd>
            </div>
            <div class="shortcut-desc">Copy revealed/last message</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-desc">Hide revealed message / Close modals</div>
          </div>
        </div>

        <div class="shortcut-section">Navigation</div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>N</kbd>
            </div>
            <div class="shortcut-desc">Open “New Chat”</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>A</kbd>
            </div>
            <div class="shortcut-desc">Copy my address</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>/</kbd>
            </div>
            <div class="shortcut-desc">Show this shortcuts reference</div>
          </div>
        </div>

        <div class="hint">
          Tip: You can also click the ⌨️ button in the header or press Ctrl+Shift/.
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
    this.modal?.cleanup();
  }
}