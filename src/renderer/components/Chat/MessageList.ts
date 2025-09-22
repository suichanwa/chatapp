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
      /* Message Actions Styling with Tailwind-like approach */
      .message-footer {
        @apply flex items-end justify-between gap-2 mt-2 pt-1;
      }

      .message-actions {
        @apply flex items-center gap-1 opacity-0 transition-opacity duration-200;
      }

      .message:hover .message-actions {
        @apply opacity-100;
      }

      /* TINY Copy and Save Button Styling - Much smaller icons */
      .copy-message-btn,
      .save-message-btn {
        @apply inline-flex items-center justify-center;
        @apply bg-white/[0.08] border border-white/[0.12] text-gray-400;
        @apply px-1 py-0.5 rounded text-[0.65rem] font-medium cursor-pointer;
        @apply transition-all duration-200 min-h-[18px] min-w-[18px] whitespace-nowrap;
        @apply hover:transform hover:-translate-y-px;
      }

      /* CRITICAL: Material Icons in buttons - VERY TINY */
      .copy-message-btn .material-icons,
      .save-message-btn .material-icons {
        font-size: 8px !important; /* 8px - ultra small */
        line-height: 1 !important;
        width: 8px !important;
        height: 8px !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        vertical-align: middle !important;
      }

      /* Copy button hover */
      .copy-message-btn:hover {
        @apply bg-blue-500/15 border-blue-500/30 text-blue-400;
        @apply shadow-lg shadow-blue-500/15;
      }

      /* Save button styling - green theme */
      .save-message-btn {
        @apply bg-green-500/[0.08] border-green-500/20 text-green-500;
      }

      .save-message-btn:hover {
        @apply bg-green-500/15 border-green-500/35 text-green-400;
        @apply shadow-lg shadow-green-500/15;
      }

      .save-message-btn:active,
      .copy-message-btn:active {
        @apply translate-y-0;
      }

      /* Enhanced message time wrapper */
      .message-time-wrapper {
        @apply flex flex-col items-end leading-tight text-xs text-gray-500 min-h-[1.6em] relative;
      }

      /* Timestamp hint styling */
      .timestamp-hint {
        @apply absolute right-0 bottom-0 text-[0.65rem] text-gray-500 opacity-0;
        @apply tracking-wider uppercase pointer-events-none transition-opacity duration-150;
      }

      .message:not(.sensitive) .timestamp-hint { 
        @apply hidden; 
      }

      .message.sensitive:not(.revealed) .timestamp-hint { 
        @apply opacity-25; 
      }

      .message.sensitive:not(.revealed):hover .timestamp-hint { 
        @apply opacity-40; 
      }

      .message.sensitive.revealed .timestamp-hint { 
        @apply opacity-0; 
      }

      /* System message enhanced styling */
      .message.system {
        @apply self-center max-w-[90%] mx-auto my-6;
      }

      .message.system .message-content {
        @apply text-center text-sm py-5 px-6 rounded-xl leading-relaxed;
        background: linear-gradient(135deg, rgba(0, 122, 204, 0.08) 0%, rgba(0, 122, 204, 0.04) 100%);
        color: #ddd;
        border: 1px solid rgba(0, 122, 204, 0.15);
      }

      /* Forwarded message indicators - also smaller */
      .message.forwarded {
        @apply relative border-l-2 border-green-500 pl-3 ml-2;
      }

      .message.forwarded::before {
        content: 'reply';
        font-family: 'Material Icons';
        @apply absolute -left-1.5 top-2 text-[8px] text-green-500;
        @apply w-3 h-3 flex items-center justify-center rounded-full;
        background: var(--bg);
        padding: 1px;
      }

      /* No messages state */
      .no-messages {
        @apply text-center py-12 px-8 text-gray-400 italic;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .message-actions {
          @apply opacity-100; /* Always visible on mobile */
        }

        .copy-message-btn,
        .save-message-btn {
          @apply px-0.5 py-0.5 text-[0.6rem] min-h-[16px] min-w-[16px];
        }

        /* Even tinier on mobile */
        .copy-message-btn .material-icons,
        .save-message-btn .material-icons {
          font-size: 6px !important; /* 6px - extremely small on mobile */
          width: 6px !important;
          height: 6px !important;
        }

        .message-footer {
          @apply flex-col items-start gap-1;
        }

        .message-actions {
          @apply self-end;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .copy-message-btn,
        .save-message-btn {
          @apply border-2;
        }

        .message.forwarded {
          @apply border-l-4;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .copy-message-btn,
        .save-message-btn {
          @apply transition-none;
        }

        .copy-message-btn:hover,
        .save-message-btn:hover {
          @apply transform-none;
        }

        .message-actions {
          @apply transition-none;
        }
      }

      /* Image message lightbox styles */
      .message-image.expanded {
        @apply fixed inset-0 z-50 max-w-none max-h-none w-screen h-screen object-contain;
        @apply bg-black/90 cursor-pointer;
      }

      body.lightbox-open {
        @apply overflow-hidden;
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

    // TINY Material Icons - using specific tiny class
    const copyBtn = `<button class="copy-message-btn" onclick="window.chatApp.copyMessage('${message.id}')" title="Copy Text">
      <span class="material-icons tiny">content_copy</span>
    </button>`;

    // Determine if we should show save button
    const isFromPeer = message.sender !== 'me';
    const isSavedChat = currentChatId === window.chatApp?.components?.get('savedMessages')?.getSavedChatId?.();
    const showSaveBtn = isFromPeer && !isSavedChat;

    const saveBtn = showSaveBtn
      ? `<button class="save-message-btn" onclick="window.chatApp.saveMessage('${message.id}')" title="Save Message">
          <span class="material-icons tiny">bookmark_border</span>
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
          <div class="image-message max-w-sm rounded-xl overflow-hidden bg-gray-800">
            <img src="${message.imageData.data}" alt="${safeAlt}" class="message-image w-full h-auto block cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
            <div class="image-caption px-3 py-3 text-sm text-white bg-black/30">${safeCaption}</div>
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