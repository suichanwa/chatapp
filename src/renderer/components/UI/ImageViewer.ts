import type { Component } from '../../types/components';

export class ImageViewer implements Component {
  private overlay: HTMLDivElement | null = null;
  private imgEl: HTMLImageElement | null = null;
  private captionEl: HTMLDivElement | null = null;
  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.overlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'image-viewer';
    overlay.className = 'image-viewer';

    // Strong z-index and full-screen overlay
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'none'; // toggled in open/close
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100000'; // ensure above everything
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.backdropFilter = 'blur(2px)';

    overlay.innerHTML = `
      <div class="image-viewer-content" style="
        position: relative;
        max-width: 92vw;
        max-height: 92vh;
      ">
        <button class="image-viewer-close" aria-label="Close" style="
          position: absolute;
          top: -14px;
          right: -14px;
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: none;
          background: rgba(0,0,0,0.65);
          color: #fff;
          cursor: pointer;
          font-size: 18px;
          line-height: 36px;
          text-align: center;
          box-shadow: 0 4px 18px rgba(0,0,0,0.4);
        ">✕</button>
        <img class="image-viewer-img" alt="" style="
          display: block;
          max-width: 92vw;
          max-height: 82vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        ">
        <div class="image-viewer-caption" style="
          margin-top: 0.5rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
          max-width: 92vw;
          word-break: break-word;
        "></div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.imgEl = overlay.querySelector('.image-viewer-img') as HTMLImageElement;
    this.captionEl = overlay.querySelector('.image-viewer-caption') as HTMLDivElement;

    // Close button
    const closeBtn = overlay.querySelector('.image-viewer-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.close());

    // Click outside content closes
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Escape to close
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
  }

  open(src: string, alt = 'Image', caption = ''): void {
    // Lazy init if not yet ready
    if (!this.overlay || !this.imgEl || !this.captionEl) {
      this.initialize().then(() => this.open(src, alt, caption)).catch(console.error);
      return;
    }

    // Bring overlay to front in DOM each time
    document.body.appendChild(this.overlay);

    // Reset previous state
    this.imgEl.src = '';
    this.imgEl.alt = alt || 'Image';
    this.captionEl.textContent = caption || '';

    // Show overlay immediately; image appears when ready
    this.overlay.style.display = 'flex';
    document.body.classList.add('lightbox-open');
    if (this.onKeyDown) document.addEventListener('keydown', this.onKeyDown);

    // Robust load handling
    const onLoad = () => cleanup(true);
    const onError = () => {
      this.captionEl!.textContent = caption ? `${caption} (failed to load)` : 'Image failed to load';
      cleanup(true);
    };
    const cleanup = (keepOpen: boolean) => {
      this.imgEl!.removeEventListener('load', onLoad);
      this.imgEl!.removeEventListener('error', onError);
      // keepOpen true: overlay stays visible
      if (!keepOpen) this.close();
    };

    // Attach before setting src (covers data: URLs)
    this.imgEl.addEventListener('load', onLoad, { once: true });
    this.imgEl.addEventListener('error', onError, { once: true });

    // Trigger load
    this.imgEl.src = src;

    // Fallback: if nothing fired in 100ms but src is set, just keep it open
    window.setTimeout(() => {
      if (this.overlay && this.overlay.style.display === 'flex' && this.imgEl!.src === src) {
        // no-op; image will pop in when ready
      }
    }, 100);
  }

  close(): void {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
    document.body.classList.remove('lightbox-open');
    if (this.onKeyDown) {
      document.removeEventListener('keydown', this.onKeyDown);
    }
  }

  cleanup(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.imgEl = null;
      this.captionEl = null;
    }
  }
}