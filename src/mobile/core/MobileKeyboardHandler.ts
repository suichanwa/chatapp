import type { Component } from '../../renderer/types/components';

export class MobileKeyboardHandler implements Component {
  private handlers: Array<{ target: EventTarget; type: string; fn: EventListenerOrEventListenerObject }> = [];

  async initialize(): Promise<void> {
    // Minimal keyboard visibility hooks; your MobileChatApp reacts to resize/orientation
    const onResize = () => {
      // Let MobileChatApp handle via its own listeners
    };
    window.addEventListener('resize', onResize);
    this.handlers.push({ target: window, type: 'resize', fn: onResize });
  }

  cleanup(): void {
    for (const h of this.handlers) h.target.removeEventListener(h.type, h.fn);
    this.handlers = [];
  }
}