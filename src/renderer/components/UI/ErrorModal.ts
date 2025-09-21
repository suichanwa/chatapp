export class ErrorModal {
  private root: HTMLDivElement | null = null;

  show(message: string): void {
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = 'error-modal';
      this.root.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);z-index:100000;';
      this.root.innerHTML = `
        <div style="background:#2b2b2b;color:#fff;border-radius:10px;max-width:420px;width:92vw;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.5)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:18px">⚠️</span>
            <h3 style="margin:0;font-size:16px">Error</h3>
          </div>
          <div id="error-modal-message" style="white-space:pre-wrap;word-break:break-word;margin:12px 0"></div>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button id="error-modal-close" style="border:1px solid #555;background:#444;color:#fff;border-radius:6px;padding:6px 10px;cursor:pointer">OK</button>
          </div>
        </div>
      `;
      this.root.addEventListener('click', (e) => {
        if (e.target === this.root) this.close();
      });
      document.body.appendChild(this.root);
      this.root.querySelector('#error-modal-close')?.addEventListener('click', () => this.close());
    }
    const msgEl = this.root.querySelector('#error-modal-message') as HTMLDivElement | null;
    if (msgEl) msgEl.textContent = message;
    this.root.style.display = 'flex';
  }

  close(): void {
    if (this.root) this.root.style.display = 'none';
  }

  cleanup(): void {
    if (this.root) this.root.remove();
    this.root = null;
  }
}