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
    this.injectMessageStyles();
  }

  private injectMessageStyles(): void {
    const existingStyle = document.getElementById('message-list-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'message-list-styles';
    style.textContent = `
      /* Message Actions Styling */
      .message-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding-top: 0.25rem;
      }

      .message-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .message:hover .message-actions {
        opacity: 1;
      }

      /* Copy and Save Button Styling - Much smaller */
      .copy-message-btn,
      .save-message-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #bbb;
        padding: 0.15rem 0.3rem;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 20px;
        min-width: 20px;
        white-space: nowrap;
      }

      /* Material Icons in buttons - MUCH smaller */
      .copy-message-btn .material-icons,
      .save-message-btn .material-icons {
        font-size: 0.6rem !important; /* 9.6px - very small */
        line-height: 1;
        vertical-align: middle;
        margin: 0;
        padding: 0;
        display: block;
        width: 0.6rem;
        height: 0.6rem;
      }

      /* Copy button hover */
      .copy-message-btn:hover {
        background: rgba(0, 122, 204, 0.15);
        border-color: rgba(0, 122, 204, 0.3);
        color: #58a6ff;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 122, 204, 0.15);
      }

      /* Save button styling - green theme */
      .save-message-btn {
        background: rgba(40, 167, 69, 0.08);
        border-color: rgba(40, 167, 69, 0.2);
        color: #28a745;
      }

      .save-message-btn:hover {
        background: rgba(40, 167, 69, 0.15);
        border-color: rgba(40, 167, 69, 0.35);
        color: #34ce57;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(40, 167, 69, 0.15);
      }

      .save-message-btn:active,
      .copy-message-btn:active {
        transform: translateY(0);
      }

      /* Enhanced message time wrapper */
      .message-time-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1.1;
        font-size: 0.75rem;
        color: var(--muted);
        min-height: 1.6em;
        position: relative;
      }

      /* Timestamp hint styling */
      .timestamp-hint {
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 0.65rem;
        color: var(--muted);
        opacity: 0;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        pointer-events: none;
        transition: opacity 120ms ease;
      }

      .message:not(.sensitive) .timestamp-hint { 
        display: none; 
      }

      .message.sensitive:not(.revealed) .timestamp-hint { 
        opacity: 0.25; 
      }

      .message.sensitive:not(.revealed):hover .timestamp-hint { 
        opacity: 0.4; 
      }

      .message.sensitive.revealed .timestamp-hint { 
        opacity: 0; 
      }

      /* System message enhanced styling */
      .message.system {
        align-self: center;
        max-width: 90%;
        margin: 1.5rem auto;
      }

      .message.system .message-content {
        background: linear-gradient(135deg, rgba(0, 122, 204, 0.08) 0%, rgba(0, 122, 204, 0.04) 100%);
        color: #ddd;
        border: 1px solid rgba(0, 122, 204, 0.15);
        text-align: center;
        font-size: 0.9rem;
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        line-height: 1.5;
      }

      /* Forwarded message indicators - also smaller */
      .message.forwarded {
        position: relative;
        border-left: 3px solid #28a745;
        padding-left: 0.75rem;
        margin-left: 0.5rem;
      }

      .message.forwarded::before {
        content: 'reply';
        font-family: 'Material Icons';
        position: absolute;
        left: -6px;
        top: 0.5rem;
        font-size: 0.6rem; /* Much smaller */
        color: #28a745;
        background: var(--bg);
        padding: 1px;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .message-actions {
          opacity: 1; /* Always visible on mobile */
        }

        .copy-message-btn,
        .save-message-btn {
          padding: 0.1rem 0.25rem;
          font-size: 0.6rem;
          min-height: 18px;
          min-width: 18px;
        }

        .copy-message-btn .material-icons,
        .save-message-btn .material-icons {
          font-size: 0.5rem !important; /* Even smaller on mobile */
          width: 0.5rem;
          height: 0.5rem;
        }

        .message-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .message-actions {
          align-self: flex-end;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .copy-message-btn,
        .save-message-btn {
          border-width: 2px;
        }

        .message.forwarded {
          border-left-width: 4px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .copy-message-btn,
        .save-message-btn {
          transition: none;
        }

        .copy-message-btn:hover,
        .save-message-btn:hover {
          transform: none;
        }

        .message-actions {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
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

      messagesEl.innerHTML = messages.map(m => this.renderMessage(m, chatId)).join('');

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

      // Bind privacy handlers
      this.attachPrivacyHandlers(messagesEl);

      // Scroll to bottom
      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Mark last message as read
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        (window as any).electronAPI?.transport?.sendSignal?.(chatId, {
          action: 'read',
          lastSeenTs: lastMessage.timestamp
        });
      }
    } catch (error) {
      console.error('Failed to render messages:', error);
    }
  }

  cleanup(): void {
    this.hideRevealedMessage();
    this.imageViewer?.cleanup();

    // Remove injected styles
    const styleEl = document.getElementById('message-list-styles');
    if (styleEl) styleEl.remove();
  }

  // Internal: render one message
  private renderMessage(message: Message, currentChatId: string): string {
    const timestampHtml = renderTimestamp(message.timestamp);
    const timestampBlock = `
      <div class="message-time-wrapper">
        ${timestampHtml}
        <span class="timestamp-hint">show time</span>
      </div>
    `;

    const copyBtn = `<button class="copy-message-btn" onclick="window.chatApp.copyMessage('${message.id}')" title="Copy Text">
      <span class="material-icons">content_copy</span>
    </button>`;

    // Determine if we should show save button
    const isFromPeer = message.sender !== 'me';
    const isSavedChat = currentChatId === window.chatApp?.components?.get('savedMessages')?.getSavedChatId?.();
    const showSaveBtn = isFromPeer && !isSavedChat;

    const saveBtn = showSaveBtn
      ? `<button class="save-message-btn" onclick="window.chatApp.saveMessage('${message.id}')" title="Save Message">
          <span class="material-icons">bookmark_border</span>
         </button>`
      : '';

    const footer = `
      <div class="message-footer">
        ${timestampBlock}
        <div class="message-actions">
          ${copyBtn}
          ${saveBtn}
        </div>
      </div>
    `;

    const sensitiveClass = message.type !== 'system' ? 'sensitive' : '';
    const forwardedClass = message.replyTo ? 'forwarded' : '';

    if (message.type === 'image' && message.imageData) {
      const safeCaption = this.escapeHtml(message.content);
      const safeAlt = this.escapeHtml(message.imageData.filename);
      return `
        <div class="message ${message.sender === 'me' ? 'sent' : 'received'} ${sensitiveClass} ${forwardedClass}" data-mid="${message.id}">
          <div class="image-message">
            <img src="${message.imageData.data}" alt="${safeAlt}" class="message-image">
            <div class="image-caption">${safeCaption}</div>
          </div>
          ${footer}
        </div>
      `;
    }

    // Handle system messages (like welcome messages with HTML)
    if (message.type === 'system') {
      return `
        <div class="message system" data-mid="${message.id}">
          <div class="message-content">${message.content}</div>
          ${footer}
        </div>
      `;
    }

    const safeText = this.escapeHtml(message.content);
    return `
      <div class="message ${message.sender === 'me' ? 'sent' : 'received'} ${sensitiveClass} ${forwardedClass}" data-mid="${message.id}">
        <div class="message-content">${safeText}</div>
        ${footer}
      </div>
    `;
  }

  private attachPrivacyHandlers(messagesEl: HTMLElement): void {
    messagesEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const messageEl = target.closest('.message.sensitive:not(.revealed)') as HTMLElement;
      
      if (messageEl && !target.closest('button') && !target.closest('img')) {
        e.preventDefault();
        const messageId = messageEl.getAttribute('data-mid');
        if (messageId) this.revealMessage(messageId);
      }
    });
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
    const viewer = document.querySelector('.image-viewer') as HTMLElement | null;
    if (!viewer || !viewer.style.display || viewer.style.display === 'none') return false;
    if (!expectedSrc) return true;
    const viewerImg = viewer.querySelector('img') as HTMLImageElement | null;
    return !!(viewerImg && viewerImg.src === expectedSrc);
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