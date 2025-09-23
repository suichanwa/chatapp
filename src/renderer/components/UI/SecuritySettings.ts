import type { Component } from '../../types/components';

export class SecuritySettings implements Component {
  async initialize(): Promise<void> {
    console.log('🔒 SecuritySettings initialized');
  }

  render(): string {
    return `
      <div class="security-section">
        <h4>
          <span class="material-icons">security</span>
          Security Settings
        </h4>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #f59e0b;">vpn_key</span>
            Pre‑Shared Key (PSK)
          </label>
          <input type="password" id="psk-input" class="form-input" placeholder="Optional - Leave empty for default security">
          <small class="form-hint">When set on both peers, connections require a matching PSK for extra security</small>
        </div>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #ef4444;">block</span>
            Allow Only This IP
          </label>
          <input type="text" id="allow-ip-input" class="form-input" placeholder="Optional (e.g., 203.0.113.5)">
          <small class="form-hint">Leave empty to accept any IP (subject to PSK/rate limits)</small>
        </div>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #8b5cf6;">public</span>
            Public Host Mode
          </label>
          <div class="toggle" id="public-mode-toggle">
            <input type="checkbox" id="public-mode" class="toggle-input" aria-label="Public Host Mode (allow multiple peers)">
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">Allow multiple peers to connect simultaneously</span>
          </div>
          <small class="form-hint">Uncheck to keep a single private line; check to host multiple peers</small>
        </div>
        <div class="form-actions">
          <button id="save-security-btn" class="btn btn-secondary">
            <span class="material-icons btn-icon">save</span>
            <span class="btn-text">Save Security Settings</span>
          </button>
        </div>
      </div>
    `;
  }

  async handleClick(e: Event): Promise<void> {
    const target = e.target as HTMLElement;

    if (target.closest('#save-security-btn')) {
      e.preventDefault();
      await this.saveSecuritySettings();
    }

    // Toggle handling
    const toggleContainer = target.closest('#public-mode-toggle');
    if (toggleContainer) {
      const checkbox = toggleContainer.querySelector('#public-mode') as HTMLInputElement;
      if (checkbox && target !== checkbox) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  handleChange(e: Event): void {
    const target = e.target as HTMLElement;
    
    if (target.matches('#public-mode')) {
      const checkbox = target as HTMLInputElement;
      const toggleContainer = checkbox.closest('.toggle');
      if (toggleContainer) {
        toggleContainer.classList.toggle('checked', checkbox.checked);
      }
    }
  }

  private async saveSecuritySettings(): Promise<void> {
    const pskInput = document.querySelector('#psk-input') as HTMLInputElement;
    const ipInput = document.querySelector('#allow-ip-input') as HTMLInputElement;
    const publicModeCheckbox = document.querySelector('#public-mode') as HTMLInputElement;
    const saveBtn = document.querySelector('#save-security-btn') as HTMLButtonElement;

    const psk = pskInput?.value.trim() || null;
    const ip = ipInput?.value.trim() || null;
    const publicMode = publicModeCheckbox?.checked || false;

    this.setButtonLoading(saveBtn, true, 'Saving...');

    try {
      await Promise.all([
        window.electronAPI?.transport?.setPSK(psk && psk.length ? psk : null),
        window.electronAPI?.transport?.allowOnly(ip && ip.length ? ip : null),
        window.electronAPI?.transport?.setPublicMode?.(publicMode)
      ]);

      this.setButtonSuccess(saveBtn, 'Saved!');
    } catch (error) {
      console.error('Failed to save security settings:', error);
      this.setButtonError(saveBtn, 'Failed');
    }
  }

  private setButtonLoading(button: HTMLButtonElement | null, loading: boolean, text?: string): void {
    if (!button) return;

    if (loading) {
      const originalContent = button.innerHTML;
      button.dataset.originalContent = originalContent;
      button.innerHTML = `<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">${text || 'Loading...'}</span>`;
      button.disabled = true;
    } else {
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
      button.disabled = false;
    }
  }

  private setButtonSuccess(button: HTMLButtonElement | null, text: string): void {
    if (!button) return;

    button.innerHTML = `<span class="material-icons btn-icon">check</span><span class="btn-text">${text}</span>`;
    button.classList.add('success');
    
    setTimeout(() => {
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
      button.classList.remove('success');
    }, 1500);
  }

  private setButtonError(button: HTMLButtonElement | null, text: string): void {
    if (!button) return;

    button.innerHTML = `<span class="material-icons btn-icon">error</span><span class="btn-text">${text}</span>`;
    button.classList.add('error');
    
    setTimeout(() => {
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
      button.classList.remove('error');
    }, 1500);
  }

  cleanup(): void {
    // Security cleanup
  }
}