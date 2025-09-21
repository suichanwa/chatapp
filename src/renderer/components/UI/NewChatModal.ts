import { Modal } from '../Modal';
import type { Component } from '../../types/components';
import '../../../styles/newchatmoda.css';
import { ErrorModal } from './ErrorModal';

interface NewChatModalCallbacks {
  onConnect?: (address: string, name: string) => Promise<void>;
  onStartServer?: () => Promise<void>;
}

export class NewChatModal implements Component {
  private modal: Modal;
  private callbacks: NewChatModalCallbacks = {};
  private serverInfo: { address: string; port: number } | null = null;
  private errorModal = new ErrorModal();
  private currentTab: 'connect' | 'info' = 'connect';

  constructor(callbacks: NewChatModalCallbacks = {}) {
    this.callbacks = callbacks;
    this.modal = new Modal(
      'new-chat-modal',
      'Create New Chat',
      this.getModalContent(),
      'new-chat-modal'
    );
  }

  async initialize(): Promise<void> {
    await this.modal.initialize();
    
    // Set callback to rebind handlers when content changes
    this.modal.setContentUpdateCallback(() => {
      this.bindDelegatedHandlers();
    });
    
    this.bindDelegatedHandlers();
  }

  // Template: full modal content with tabs
  private getModalContent(): string {
    return `
      <div class="connection-tabs" role="tablist" aria-label="New Chat Tabs">
        <button class="tab-btn ${this.currentTab === 'connect' ? 'active' : ''}" data-tab="connect" role="tab" aria-selected="${this.currentTab === 'connect'}" aria-controls="connect-tab">
          <span class="material-icons tab-icon">connect_without_contact</span>
          <span class="tab-label">Connect to Peer</span>
        </button>
        <button class="tab-btn ${this.currentTab === 'info' ? 'active' : ''}" data-tab="info" role="tab" aria-selected="${this.currentTab === 'info'}" aria-controls="info-tab">
          <span class="material-icons tab-icon">info</span>
          <span class="tab-label">My Connection Info</span>
        </button>
      </div>

      <div class="tab-content ${this.currentTab === 'connect' ? 'active' : ''}" id="connect-tab" role="tabpanel" aria-labelledby="connect">
        <div class="tab-section">
          <h4 class="section-title">
            <span class="material-icons">connect_without_contact</span>
            Connect to Peer
          </h4>
          <p class="section-description">Enter the address of a peer to start a secure chat</p>

          <div class="form-group">
            <label class="form-label">Peer Address (IP:Port)</label>
            <input type="text" id="peer-address" class="form-input" placeholder="127.0.0.1:8080" autocomplete="off">
            <small class="form-hint">Example: 192.168.1.100:8080</small>
          </div>

          <div class="form-group">
            <label class="form-label">Chat Name</label>
            <input type="text" id="chat-name" class="form-input" placeholder="Chat with friend" autocomplete="off">
            <small class="form-hint">Optional: Give this chat a custom name</small>
          </div>

          <div class="form-actions">
            <button id="connect-btn" class="btn btn-primary">
              <span class="material-icons btn-icon">link</span>
              <span class="btn-text">Connect</span>
            </button>
          </div>

          <div class="form-actions" style="margin-top:12px">
            <button id="start-server-btn-connect" class="btn btn-secondary">
              <span class="material-icons btn-icon">rocket_launch</span>
              <span class="btn-text">Start Server</span>
            </button>
          </div>
        </div>
      </div>

      <div class="tab-content ${this.currentTab === 'info' ? 'active' : ''}" id="info-tab" role="tabpanel" aria-labelledby="info">
        <div class="info-section">
          <h4><span class="material-icons">wifi_tethering</span> Your Connection Info</h4>
          <div class="info-item">
            <label>Server Status:</label>
            <span id="modal-server-status">Not started</span>
          </div>
          <div class="info-item">
            <label>Your Address:</label>
            <span id="modal-my-address">Unknown</span>
            <button id="copy-address" class="copy-btn" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
              <span class="material-icons">content_copy</span>
            </button>
          </div>
          <div class="info-item">
            <label>Your Public Key:</label>
            <textarea id="my-public-key" class="key-textarea" readonly></textarea>
            <button id="copy-key" class="copy-btn" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
              <span class="material-icons">content_copy</span>
            </button>
          </div>

          <div class="security-section" style="margin-top:12px">
            <h4><span class="material-icons">security</span> Security</h4>
            <div class="form-group">
              <label class="form-label">Pre‑Shared Key (PSK)</label>
              <input type="password" id="psk-input" class="form-input" placeholder="Optional">
              <small class="form-hint">When set on both peers, connections require a matching PSK</small>
            </div>
            <div class="form-group">
              <label class="form-label">Allow Only This IP</label>
              <input type="text" id="allow-ip-input" class="form-input" placeholder="Optional (e.g., 203.0.113.5)">
              <small class="form-hint">Leave empty to accept any IP (subject to PSK/rate limits)</small>
            </div>
            <div class="form-group">
              <label class="form-label">Public Host Mode</label>
              <div class="toggle" id="public-mode-toggle">
                <input type="checkbox" id="public-mode" class="toggle-input" aria-label="Public Host Mode (allow multiple peers)">
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">Allow multiple peers</span>
              </div>
              <small class="form-hint">Uncheck to keep a single private line; check to host multiple peers</small>
            </div>
            <div class="form-actions">
              <button id="save-security-btn" class="btn btn-secondary">
                <span class="material-icons btn-icon">save</span>
                Save Security Settings
              </button>
            </div>
          </div>

          <div class="form-actions" style="margin-top:12px">
            <button id="start-server-btn" class="btn btn-primary">
              <span class="material-icons btn-icon">rocket_launch</span>
              <span class="btn-text">Start Server</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Bind event handlers with proper event capture
  private bindDelegatedHandlers(): void {
    const root = this.modal.getElement();
    if (!root) return;

    // Remove old listeners first
    const oldHandler = (root as any)._newChatHandler;
    if (oldHandler) {
      root.removeEventListener('click', oldHandler);
      root.removeEventListener('change', oldHandler);
    }

    // Create new click handler
    const newClickHandler = async (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Tab switching - most important fix
      const tabBtn = target.closest('.tab-btn') as HTMLButtonElement | null;
      if (tabBtn && tabBtn.dataset.tab) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('Tab clicked:', tabBtn.dataset.tab);
        this.switchTab(tabBtn.dataset.tab as 'connect' | 'info');
        return false;
      }

      // Toggle handling - handle clicks on toggle container or label
      const toggleContainer = target.closest('#public-mode-toggle');
      if (toggleContainer) {
        const checkbox = toggleContainer.querySelector('#public-mode') as HTMLInputElement;
        if (checkbox && target !== checkbox) {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          // Trigger change event manually
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          return false;
        }
      }

      // Connect button
      if (target.closest('#connect-btn')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleConnect();
        return false;
      }

      // Start server buttons
      if (target.closest('#start-server-btn') || target.closest('#start-server-btn-connect')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleStartServer();
        return false;
      }

      // Save security button
      if (target.closest('#save-security-btn')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.saveSecurity();
        return false;
      }

      // Copy buttons
      if (target.closest('#copy-address')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.copyModalAddress();
        return false;
      }
      
      if (target.closest('#copy-key')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.copyModalKey();
        return false;
      }
    };

    // Create change handler for form inputs
    const newChangeHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Handle checkbox changes (including the public mode toggle)
      if (target.matches('#public-mode')) {
        const checkbox = target as HTMLInputElement;
        const toggleContainer = checkbox.closest('.toggle');
        if (toggleContainer) {
          toggleContainer.classList.toggle('checked', checkbox.checked);
        }
        console.log('Public mode toggled:', checkbox.checked);
        // Don't preventDefault here - let the change bubble normally
      }
    };

    // Store references and bind
    (root as any)._newChatHandler = newClickHandler;
    (root as any)._newChatChangeHandler = newChangeHandler;
    
    root.addEventListener('click', newClickHandler, true); // Use capture phase
    root.addEventListener('change', newChangeHandler, true); // Handle form changes

    // Enter key handling
    root.addEventListener('keydown', (e) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if ((el.id === 'peer-address' || el.id === 'chat-name') && e.key === 'Enter') {
        e.preventDefault();
        this.handleConnect();
      }
    });

    console.log('NewChatModal event handlers bound');
  }

  private switchTab(tabName: 'connect' | 'info'): void {
    console.log('Switching to tab:', tabName);
    this.currentTab = tabName;

    const modalRoot = this.modal.getElement();
    if (!modalRoot) {
      console.error('Modal root not found');
      return;
    }

    // Update tab buttons
    modalRoot.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      console.log(`Tab button ${btn.dataset.tab}: active=${isActive}`);
    });

    // Update tab content panels
    modalRoot.querySelectorAll<HTMLElement>('.tab-content').forEach((panel) => {
      panel.classList.remove('active');
    });
    
    const activePanel = modalRoot.querySelector<HTMLElement>(`#${tabName}-tab`);
    if (activePanel) {
      activePanel.classList.add('active');
      console.log(`Activated panel: ${tabName}-tab`);
    } else {
      console.error(`Panel not found: ${tabName}-tab`);
    }

    // When switching to info, refresh values
    if (tabName === 'info') {
      this.updateConnectionInfo().catch(() => {});
    } else {
      // Focus address for convenience
      setTimeout(() => {
        modalRoot.querySelector<HTMLInputElement>('#peer-address')?.focus();
      }, 100);
    }
  }

  private async saveSecurity(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const psk = (modalElement.querySelector('#psk-input') as HTMLInputElement)?.value.trim() || null;
    const ip = (modalElement.querySelector('#allow-ip-input') as HTMLInputElement)?.value.trim() || null;
    const publicMode = (modalElement.querySelector('#public-mode') as HTMLInputElement)?.checked || false;

    const btn = modalElement.querySelector('#save-security-btn') as HTMLButtonElement | null;
    try {
      // Call the APIs
      await window.electronAPI?.transport?.setPSK(psk && psk.length ? psk : null);
      await window.electronAPI?.transport?.allowOnly(ip && ip.length ? ip : null);
      await window.electronAPI?.transport?.setPublicMode?.(publicMode);

      console.log('Security settings saved:', { psk: !!psk, ip, publicMode });

      if (btn) {
        const old = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons btn-icon">check</span>Saved';
        btn.classList.add('success');
        setTimeout(() => { btn.innerHTML = old; btn.classList.remove('success'); }, 1500);
      }
    } catch (e) {
      console.error('Failed to save security settings:', e);
      if (btn) {
        const old = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons btn-icon">error</span>Failed';
        btn.classList.add('error');
        setTimeout(() => { btn.innerHTML = old; btn.classList.remove('error'); }, 1500);
      }
    }
  }

  private async copyModalAddress(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const copyBtn = modalElement.querySelector('#copy-address') as HTMLElement | null;
    const addressElement = modalElement.querySelector('#modal-my-address');
    const address = addressElement?.textContent?.trim();

    try {
      if (address && address !== 'Unknown') {
        const kbd = (window.event as KeyboardEvent | undefined);
        const useSystem = !!(kbd && (kbd.shiftKey || kbd.ctrlKey || kbd.metaKey));
        if (!useSystem && window.electronAPI?.secureClipboard) {
          await window.electronAPI.secureClipboard.writeText(address, { ttlMs: 120_000 });
        } else if (window.electronAPI?.clipboard) {
          await window.electronAPI.clipboard.writeText(address);
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(address);
        } else {
          throw new Error('No clipboard API available');
        }
        if (copyBtn) this.showCopySuccess(copyBtn);
      }
    } catch (err) {
      console.error('Failed to copy address:', err);
      if (copyBtn) this.showCopyError(copyBtn);
    }
  }

  private async copyModalKey(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const copyBtn = modalElement.querySelector('#copy-key') as HTMLElement | null;
    const keyTextarea = modalElement.querySelector('#my-public-key') as HTMLTextAreaElement | null;
    const key = keyTextarea?.value?.trim();

    try {
      if (key) {
        const kbd = (window.event as KeyboardEvent | undefined);
        const useSystem = !!(kbd && (kbd.shiftKey || kbd.ctrlKey || kbd.metaKey));
        if (!useSystem && window.electronAPI?.secureClipboard) {
          await window.electronAPI.secureClipboard.writeText(key, { ttlMs: 120_000 });
        } else if (window.electronAPI?.clipboard) {
          await window.electronAPI.clipboard.writeText(key);
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(key);
        } else {
          throw new Error('No clipboard API available');
        }
        if (copyBtn) this.showCopySuccess(copyBtn);
      }
    } catch (err) {
      console.error('Failed to copy key:', err);
      if (copyBtn) this.showCopyError(copyBtn);
    }
  }

  private showCopySuccess(button: HTMLElement): void {
    const originalContent = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '<span class="material-icons">check</span>';
    button.className = originalClass + ' success';

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.className = originalClass;
    }, 2000);
  }

  private showCopyError(button: HTMLElement): void {
    const originalContent = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '<span class="material-icons">error</span>';
    button.className = originalClass + ' error';

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.className = originalClass;
    }, 2000);
  }

  private showError(message: string): void {
    // Inline banner for quick feedback
    const modalElement = this.modal.getElement();
    if (modalElement) {
      let errorElement = modalElement.querySelector('.error-message') as HTMLElement | null;
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        const modalBody = modalElement.querySelector('.modal-body');
        modalBody?.insertBefore(errorElement, modalBody.firstChild);
      }
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        if (errorElement) errorElement.style.display = 'none';
      }, 5000);
    }
    // Dedicated modal for clarity
    this.errorModal.show(message);
  }

  private async handleConnect(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const addressInput = modalElement.querySelector('#peer-address') as HTMLInputElement | null;
    const nameInput = modalElement.querySelector('#chat-name') as HTMLInputElement | null;
    const connectBtn = modalElement.querySelector('#connect-btn') as HTMLButtonElement | null;

    const address = addressInput?.value.trim();
    const name = nameInput?.value.trim() || 'Unknown Peer';

    if (!address) {
      this.showError('Please enter a peer address');
      addressInput?.focus();
      return;
    }

    if (!this.callbacks.onConnect) {
      this.showError('Connection handler not available');
      return;
    }

    if (connectBtn) {
      connectBtn.disabled = true;
      connectBtn.innerHTML = '<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">Connecting...</span>';
      connectBtn.classList.add('loading');
    }

    try {
      await this.callbacks.onConnect(address, name);
      this.close();
      if (addressInput) addressInput.value = '';
      if (nameInput) nameInput.value = '';
    } catch (error) {
      console.error('Connection failed:', error);
      this.showError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.innerHTML = '<span class="material-icons btn-icon">link</span><span class="btn-text">Connect</span>';
        connectBtn.classList.remove('loading');
      }
    }
  }

  private async handleStartServer(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const startServerBtn =
      (modalElement.querySelector('#start-server-btn') as HTMLButtonElement | null) ||
      (modalElement.querySelector('#start-server-btn-connect') as HTMLButtonElement | null);

    if (!this.callbacks.onStartServer) {
      this.showError('Server start handler not available');
      return;
    }

    if (startServerBtn) {
      startServerBtn.disabled = true;
      startServerBtn.innerHTML = '<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">Starting...</span>';
      startServerBtn.classList.add('loading');
    }

    try {
      await this.callbacks.onStartServer();
      // updateServerInfo will be called by ChatApp
    } catch (error) {
      console.error('Failed to start server:', error);
      this.showError(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (startServerBtn) {
        startServerBtn.disabled = false;
        startServerBtn.innerHTML = '<span class="material-icons btn-icon">rocket_launch</span><span class="btn-text">Start Server</span>';
        startServerBtn.classList.remove('loading');
      }
    }
  }

  public open(): void {
    // Always regenerate content to reflect current tab state
    this.modal.setContent(this.getModalContent());
    this.bindDelegatedHandlers();
    this.modal.open();

    // Focus address field when opening Connect tab
    if (this.currentTab === 'connect') {
      setTimeout(() => {
        const root = this.modal.getElement();
        root?.querySelector<HTMLInputElement>('#peer-address')?.focus();
      }, 100);
    }

    // If Info tab is active, refresh values
    if (this.currentTab === 'info') {
      this.updateConnectionInfo().catch(() => {});
    }
  }

  public close(): void {
    this.modal.close();
  }

  public toggle(): void {
    if (this.modal.getIsOpen()) this.modal.close();
    else this.open();
  }

  public updateServerInfo(address: string, port: number): void {
    this.serverInfo = { address, port };

    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    const serverStatus = modalElement.querySelector('#modal-server-status');
    const myAddress = modalElement.querySelector('#modal-my-address');
    const startServerBtnInfo = modalElement.querySelector('#start-server-btn') as HTMLButtonElement | null;
    const startServerBtnConnect = modalElement.querySelector('#start-server-btn-connect') as HTMLButtonElement | null;

    if (serverStatus) {
      serverStatus.textContent = 'Running';
      (serverStatus as HTMLElement).className = 'status-indicator status-running';
    }

    if (myAddress) {
      myAddress.textContent = `${address}:${port}`;
    }

    [startServerBtnInfo, startServerBtnConnect].forEach((btn) => {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons btn-icon">check_circle</span><span class="btn-text">Server Running</span>';
        btn.classList.remove('loading');
      }
    });
  }

  public async updateConnectionInfo(): Promise<void> {
    const modalElement = this.modal.getElement();
    if (!modalElement) return;

    if (window.electronAPI?.crypto) {
      try {
        const publicKey = await window.electronAPI.crypto.getPublicKey();
        const keyTextarea = modalElement.querySelector('#my-public-key') as HTMLTextAreaElement | null;
        if (keyTextarea && publicKey) {
          keyTextarea.value = publicKey;
        }
      } catch (error) {
        console.error('Failed to get public key:', error);
      }
    }

    // If server info known, reflect it
    if (this.serverInfo) {
      this.updateServerInfo(this.serverInfo.address, this.serverInfo.port);
    }
  }

  public setCallbacks(callbacks: NewChatModalCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  cleanup(): void {
    this.modal?.cleanup();
  }
}