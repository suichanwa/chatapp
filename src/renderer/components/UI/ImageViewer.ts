import type { Component } from '../../types/components';

export class ImageViewer implements Component {
  private overlay: HTMLDivElement | null = null;
  private imgEl: HTMLImageElement | null = null;
  private captionEl: HTMLDivElement | null = null;
  private toolbarEl: HTMLDivElement | null = null;
  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;

  // Interaction state
  private scale = 1;
  private rotation = 0; // degrees
  private translateX = 0;
  private translateY = 0;
  private minScale = 0.5;
  private maxScale = 5;

  // Pointer/pan state
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private startTranslateX = 0;
  private startTranslateY = 0;

  // Pinch state
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  private pinchCenter = { x: 0, y: 0 };

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
          user-select: none;
          touch-action: none; /* enable pinch-zoom via pointer events */
          cursor: grab;
        ">
        <div class="image-viewer-caption" style="
          margin-top: 0.5rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
          max-width: 92vw;
          word-break: break-word;
        "></div>

        <!-- Toolbar -->
        <div class="image-viewer-toolbar" style="
          position: absolute;
          left: 50%;
          bottom: -44px;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 6px 8px;
          backdrop-filter: blur(4px);
        ">
          <button data-action="zoom-out" title="Zoom Out (-)" style="${toolBtn()}">➖</button>
          <button data-action="zoom-in" title="Zoom In (+)" style="${toolBtn()}">➕</button>
          <button data-action="reset" title="Reset (0)" style="${toolBtn()}">⟲</button>
          <button data-action="rotate-left" title="Rotate Left (L)" style="${toolBtn()}">⟲90°</button>
          <button data-action="rotate-right" title="Rotate Right (R)" style="${toolBtn()}">⟳90°</button>
          <button data-action="download" title="Download" style="${toolBtn()}">⬇</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.imgEl = overlay.querySelector('.image-viewer-img') as HTMLImageElement;
    this.captionEl = overlay.querySelector('.image-viewer-caption') as HTMLDivElement;
    this.toolbarEl = overlay.querySelector('.image-viewer-toolbar') as HTMLDivElement;

    // Ensure transforms originate from top-left for stable zoom math
    this.imgEl.style.transformOrigin = '0 0';

    // Close button
    const closeBtn = overlay.querySelector('.image-viewer-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.close());

    // Click outside content closes
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Keyboard shortcuts
    this.onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': this.close(); break;
        case '+':
        case '=': this.zoomAtViewport(1.2); break;
        case '-':
        case '_': this.zoomAtViewport(1 / 1.2); break;
        case '0': this.resetTransform(); break;
        case 'r':
        case 'R': this.rotate(90); break;
        case 'l':
        case 'L': this.rotate(-90); break;
        case 'ArrowLeft': this.panBy(40, 0); break;
        case 'ArrowRight': this.panBy(-40, 0); break;
        case 'ArrowUp': this.panBy(0, 40); break;
        case 'ArrowDown': this.panBy(0, -40); break;
      }
    };

    // Toolbar actions
    this.toolbarEl?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.getAttribute('data-action');
      if (!action) return;
      if (action === 'zoom-in') this.zoomAtViewport(1.2);
      if (action === 'zoom-out') this.zoomAtViewport(1 / 1.2);
      if (action === 'reset') this.resetTransform();
      if (action === 'rotate-left') this.rotate(-90);
      if (action === 'rotate-right') this.rotate(90);
      if (action === 'download') this.downloadCurrent();
    });

    // Zoom with wheel (at cursor position)
    this.imgEl.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.zoomAtPoint(k, e.clientX, e.clientY);
    }, { passive: false });

    // Double-click to toggle zoom
    this.imgEl.addEventListener('dblclick', (e) => {
      e.preventDefault();
      const targetScale = this.scale < 1.25 ? 2 : 1;
      this.zoomAtPoint(targetScale / this.scale, e.clientX, e.clientY);
    });

    // Pointer events for pan + pinch
    this.imgEl.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp, { passive: true });
    window.addEventListener('pointercancel', this.onPointerUp, { passive: true });
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

    // Reset transforms for new image
    this.resetTransform();

    // Show overlay immediately; image appears when ready
    this.overlay.style.display = 'flex';
    document.body.classList.add('lightbox-open');
    if (this.onKeyDown) document.addEventListener('keydown', this.onKeyDown);

    // Robust load handling
    const onLoad = () => cleanup(true);
    const onError = () => {
      if (this.captionEl) this.captionEl.textContent = caption ? `${caption} (failed to load)` : 'Image failed to load';
      cleanup(true);
    };
    const cleanup = (keepOpen: boolean) => {
      this.imgEl?.removeEventListener('load', onLoad);
      this.imgEl?.removeEventListener('error', onError);
      if (!keepOpen) this.close();
    };

    // Attach before setting src (covers data: URLs)
    this.imgEl.addEventListener('load', onLoad, { once: true });
    this.imgEl.addEventListener('error', onError, { once: true });

    // Trigger load
    this.imgEl.src = src;

    // Fallback: if nothing fired in 100ms but src is set, just keep it open
    window.setTimeout(() => {
      if (this.overlay && this.overlay.style.display === 'flex' && this.imgEl && this.imgEl.src === src) {
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
    this.endPan();
    this.activePointers.clear();
  }

  cleanup(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.imgEl = null;
      this.captionEl = null;
      this.toolbarEl = null;
    }
    this.onKeyDown = null;
    this.activePointers.clear();
  }

  // ===== Interaction helpers =====
  private applyTransform(): void {
    if (!this.imgEl) return;
    // Compose translate → rotate → scale for intuitive behavior
    this.imgEl.style.transform = `translate(${this.translateX}px, ${this.translateY}px) rotate(${this.rotation}deg) scale(${this.scale})`;
    this.imgEl.style.cursor = this.scale > 1 ? (this.isPanning ? 'grabbing' : 'grab') : 'auto';
  }

  private resetTransform(): void {
    this.scale = 1;
    this.rotation = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  private rotate(deltaDeg: number): void {
    this.rotation = (this.rotation + deltaDeg) % 360;
    this.applyTransform();
  }

  private panBy(dx: number, dy: number): void {
    this.translateX += dx;
    this.translateY += dy;
    this.applyTransform();
  }

  private zoomAtViewport(factor: number): void {
    // Zoom around center of viewport
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.zoomAtPoint(factor, cx, cy);
  }

  private zoomAtPoint(factor: number, clientX: number, clientY: number): void {
    if (!this.overlay || !this.imgEl) return;

    const newScale = this.clamp(this.scale * factor, this.minScale, this.maxScale);
    const k = newScale / this.scale;
    if (k === 1) return;

    // Use overlay top-left as origin (transform-origin 0 0 on image)
    const rect = this.overlay.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    // Keep focal point stable: translate' = (1 - k)*p + k*translate
    this.translateX = (1 - k) * px + k * this.translateX;
    this.translateY = (1 - k) * py + k * this.translateY;

    this.scale = newScale;
    this.applyTransform();
  }

  private clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
  }

  // ===== Pointer handlers (pan + pinch zoom) =====
  private onPointerDown = (e: PointerEvent) => {
    if (!this.imgEl) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 1) {
      // Begin pan
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.startTranslateX = this.translateX;
      this.startTranslateY = this.translateY;
      this.applyTransform();
    } else if (this.activePointers.size === 2) {
      // Begin pinch
      const pts = Array.from(this.activePointers.values());
      this.pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      this.pinchStartScale = this.scale;
      this.pinchCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.overlay || !this.imgEl) return;
    const tracked = this.activePointers.get(e.pointerId);
    if (!tracked) return;

    // Prevent scrolling while interacting
    if (this.isPanning || this.activePointers.size >= 2) e.preventDefault();

    // Update tracked pointer
    tracked.x = e.clientX;
    tracked.y = e.clientY;

    if (this.activePointers.size === 1 && this.isPanning) {
      // Pan
      const dx = e.clientX - this.panStartX;
      const dy = e.clientY - this.panStartY;
      this.translateX = this.startTranslateX + dx;
      this.translateY = this.startTranslateY + dy;
      this.applyTransform();
    } else if (this.activePointers.size === 2) {
      // Pinch zoom
      const pts = Array.from(this.activePointers.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const factor = this.clamp((dist / this.pinchStartDist) * (this.pinchStartScale / this.scale), 0.2, 5);
      this.zoomAtPoint(factor, this.pinchCenter.x, this.pinchCenter.y);
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size <= 1) this.endPan();
  };

  private endPan(): void {
    this.isPanning = false;
    this.applyTransform();
  }

  // ===== Utilities =====
  private downloadCurrent(): void {
    if (!this.imgEl || !this.imgEl.src) return;
    const a = document.createElement('a');
    a.href = this.imgEl.src;
    a.download = 'image';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

function toolBtn(): string {
  return [
    'border: 1px solid rgba(255,255,255,0.15)',
    'background: rgba(0,0,0,0.35)',
    'color: #fff',
    'border-radius: 6px',
    'padding: 6px 8px',
    'cursor: pointer',
    'font-size: 14px',
    'line-height: 1',
  ].join(';');
}