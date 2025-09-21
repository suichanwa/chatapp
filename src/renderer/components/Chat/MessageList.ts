import type { Component } from '../../types/components';
import type { Message } from '../../../types/index';
import { renderTimestamp } from '../UI/MessageTimestamp';
import { ImageViewer } from '../UI/ImageViewer';

export class MessageList implements Component {
  private imageViewer: ImageViewer;
  private revealedMessageId: string | null = null;
  private revealTimer: number | null = null;
  private privacyMode = true;

  constructor(opts?: { imageViewer?: ImageViewer }) {
    this.imageViewer = opts?.imageViewer ?? new ImageViewer();
  }

  async initialize(): Promise<void> {
    await this.imageViewer.initialize();
  }

  // Public API used by ChatApp
  public getRevealedMessageId(): string | null {
    return this.revealedMessageId;
  }

  public hideRevealedMessage(): void {
    if (!this.revealedMessageId) return;
    const el = document.querySelector<HTMLElement>(`.message[data-mid="${this.revealedMessageId}"]`);
    el?.classList.remove('revealed');
    this.revealedMessageId = null;
    if (this.revealTimer) {
      window.clearTimeout(this.revealTimer);
      this.revealTimer = null;
    }
  }

  // Main render
  public async refresh(chatId: string): Promise<void> {
    const messagesEl = document.getElementById('messages');
    if (!messagesEl) return;

    try {
      const messages = await window.electronAPI.db.getMessages(chatId);

      if (!messages.length) {
        messagesEl.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
        return;
      }

      messagesEl.innerHTML = messages.map(m => this.renderMessage(m)).join('');

      // Bind image viewers
      const imgs = messagesEl.querySelectorAll<HTMLImageElement>('.message-image');
      imgs.forEach(img => {
        const caption = (img.closest('.image-message')?.querySelector('.image-caption') as HTMLElement | null)?.textContent || '';
        img.addEventListener('click', (ev) => {
          ev.preventDefault();
          const container = img.closest('.message');
          if (container && container.classList.contains('sensitive') && !container.classList.contains('revealed')) {
            this.revealMessage(container.getAttribute('data-mid') || '');
            return;
          }
          this.openImageWithFallback(img, caption);
        });
      });

      // Privacy handlers
      this.attachPrivacyHandlers(messagesEl);

      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Send read receipt
      const last = messages[messages.length - 1];
      if (last) {
        (window as any).electronAPI?.transport?.sendSignal?.(chatId, {
          action: 'read',
          lastSeenTs: last.timestamp
        });
      }
    } catch (error) {
      console.error('MessageList: failed to render messages:', error);
    }
  }

  cleanup(): void {
    this.hideRevealedMessage();
  }

  // Internal: render one message
  private renderMessage(message: Message): string {
    const timestampHtml = renderTimestamp(message.timestamp);
    const timestampBlock = `
      <div class="message-time-wrapper">
        ${timestampHtml}
        <span class="timestamp-hint">show time</span>
      </div>
    `;

    const copyBtn = `<button class="copy-message-btn" onclick="window.chatApp.copyMessage('${message.id}')" title="Copy Text (Ctrl+Shift+C)">📋</button>`;
    const saveBtn =
      message.sender !== 'me'
        ? `<button class="save-message-btn" onclick="window.chatApp.saveMessage('${message.id}')" title="Save Message">💾</button>`
        : '';

    const footer = `
      <div class="message-footer">
        ${timestampBlock}
        ${copyBtn}
        ${saveBtn}
      </div>
    `;

    const sensitiveClass = message.type !== 'system' ? 'sensitive' : '';

    if (message.type === 'image' && message.imageData) {
      const safeCaption = this.escapeHtml(message.content);
      const safeAlt = this.escapeHtml(message.imageData.filename);
      return `
        <div class="message ${message.sender === 'me' ? 'sent' : 'received'} ${sensitiveClass}" data-mid="${message.id}">
          <div class="image-message">
            <img src="${message.imageData.data}" alt="${safeAlt}" class="message-image">
            <div class="image-caption">${safeCaption}</div>
          </div>
          ${footer}
        </div>
      `;
    }

    const safeText = this.escapeHtml(message.content);
    return `
      <div class="message ${message.sender === 'me' ? 'sent' : 'received'} ${sensitiveClass}" data-mid="${message.id}">
        <div class="message-content">${safeText}</div>
        ${footer}
      </div>
    `;
  }

  private attachPrivacyHandlers(messagesEl: HTMLElement): void {
    if (!this.privacyMode) return;

    messagesEl.querySelectorAll<HTMLElement>('.message.sensitive').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        const id = el.getAttribute('data-mid') || '';
        if (!id) return;
        this.revealMessage(id);
      }, { passive: true });
    });

    const outsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.message.revealed')) this.hideRevealedMessage();
    };
    messagesEl.removeEventListener('click', outsideClick as any);
    messagesEl.addEventListener('click', outsideClick);
  }

  private revealMessage(messageId: string): void {
    if (!messageId) return;

    if (this.revealedMessageId && this.revealedMessageId !== messageId) {
      const prev = document.querySelector<HTMLElement>(`.message[data-mid="${this.revealedMessageId}"]`);
      prev?.classList.remove('revealed');
    }

    const curr = document.querySelector<HTMLElement>(`.message[data-mid="${messageId}"]`);
    if (!curr) return;
    curr.classList.add('revealed');
    this.revealedMessageId = messageId;

    if (this.revealTimer) window.clearTimeout(this.revealTimer);
    this.revealTimer = window.setTimeout(() => this.hideRevealedMessage(), 10_000);
  }

  private openImageWithFallback(img: HTMLImageElement, caption: string): void {
    try {
      this.imageViewer.open(img.src, img.alt || 'Image', caption);
    } catch {
      // ignore
    }
    setTimeout(() => {
      if (!this.isViewerShowing(img.src)) {
        this.toggleInlineLightbox(img);
      }
    }, 50);
  }

  private isViewerShowing(expectedSrc?: string): boolean {
    const overlay = document.getElementById('image-viewer') as HTMLDivElement | null;
    if (!overlay) return false;

    const display = overlay.style.display || getComputedStyle(overlay).display;
    if (display === 'none') return false;

    if (expectedSrc) {
      const img = overlay.querySelector('img') as HTMLImageElement | null;
      if (!img) return false;
      const actual = img.getAttribute('src') || '';
      if (!(actual === expectedSrc || actual.startsWith(expectedSrc.slice(0, 32)))) return false;
    }
    return true;
  }

  private toggleInlineLightbox(img: HTMLImageElement): void {
    const expanded = img.classList.toggle('expanded');
    document.body.classList.toggle('lightbox-open', expanded);
    if (expanded) {
      const onKey = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
          img.classList.remove('expanded');
          document.body.classList.remove('lightbox-open');
          document.removeEventListener('keydown', onKey);
        }
      };
      document.addEventListener('keydown', onKey, { once: true });
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(text ?? '').replace(/[&<>"']/g, (ch) => map[ch]);
  }
}