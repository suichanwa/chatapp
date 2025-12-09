import type { Component } from '../../renderer/types/components';
import type { ChatApp } from '../../renderer/ChatApp';

export class ShortcutsController implements Component {
  private app: ChatApp;
  private onKeyDown?: (e: KeyboardEvent) => void;

  constructor(app: ChatApp) {
    this.app = app;
  }

  async initialize(): Promise<void> {
    this.onKeyDown = async (e: KeyboardEvent) => {
      const currentChatId = (this.app as any).currentChatId as string | null;

      // Ctrl+T: focus composer
      if (e.ctrlKey && !e.shiftKey && (e.key === 't' || e.key === 'T')) {
        const input = document.getElementById('message-input') as HTMLInputElement | null;
        if (!currentChatId || !input || input.disabled) return;
        e.preventDefault(); e.stopPropagation();
        input.focus();
        const len = input.value.length;
        input.selectionStart = input.selectionEnd = len;
        return;
      }

      // Ctrl+O: open image picker
      if (e.ctrlKey && !e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        if (!currentChatId) return;
        const imageBtn = document.getElementById('image-btn') as HTMLButtonElement | null;
        const imageInput = document.getElementById('image-input') as HTMLInputElement | null;
        if (imageBtn?.disabled) return;
        e.preventDefault(); e.stopPropagation();
        imageInput?.click();
        return;
      }

      // Ctrl+Shift+/: open shortcuts
      if (e.ctrlKey && e.shiftKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault(); e.stopPropagation();
        this.app.openShortcuts();
        return;
      }

      // Ctrl+Shift+C: copy revealed or last message
      if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        if (!currentChatId) return;
        e.preventDefault(); e.stopPropagation();
        let targetMessageId = this.app.getRevealedMessageId();
        if (!targetMessageId) {
          const all = await window.electronAPI.db.getMessages(currentChatId);
          targetMessageId = all[all.length - 1]?.id ?? null;
        }
        if (targetMessageId) await (this.app as any).copyMessage(targetMessageId);
        return;
      }

      // Ctrl+N: new chat
      if (e.ctrlKey && !e.shiftKey && !e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault(); e.stopPropagation();
        (this.app as any).showNewChatModal();
        return;
      }

      // Ctrl+Shift+A: copy my address
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        const el = document.getElementById('my-address');
        const text = (el?.textContent || '').trim();
        const prefix = 'Address:';
        let value: string | null = null;
        if (text.startsWith(prefix)) {
          const v = text.slice(prefix.length).trim();
          if (v && v.toLowerCase() !== 'unknown') value = v;
        }
        if (!value) return;
        e.preventDefault(); e.stopPropagation();
        await navigator.clipboard.writeText(value);
        const serverStatus = document.getElementById('server-status');
        if (serverStatus) {
          const prev = serverStatus.textContent;
          serverStatus.textContent = 'Address copied';
          setTimeout(() => { if (serverStatus.textContent === 'Address copied') serverStatus.textContent = prev || ''; }, 1000);
        }
        return;
      }
    };

    document.addEventListener('keydown', this.onKeyDown, { capture: false });
  }

  cleanup(): void {
    if (this.onKeyDown) {
      document.removeEventListener('keydown', this.onKeyDown as any);
      this.onKeyDown = undefined;
    }
  }
}