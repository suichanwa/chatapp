import { Modal } from '../Modal';
import type { Component } from '../../types/components';
import { ErrorModal } from './ErrorModal';
import { ConnectionForm } from './ConnectionForm';
import { InfoPanel } from './InfoPanel';
import { SecuritySettings } from './SecuritySettings';
import { NewChatModalStyles } from '../../../styles/NewChatModalStyles';

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

  // Sub-components
  private connectionForm: ConnectionForm;
  private infoPanel: InfoPanel;
  private securitySettings: SecuritySettings;
  private styles: NewChatModalStyles;

  constructor(callbacks: NewChatModalCallbacks = {}) {
    this.callbacks = callbacks;
    this.styles = new NewChatModalStyles();
    this.connectionForm = new ConnectionForm();
    this.infoPanel = new InfoPanel();
    this.securitySettings = new SecuritySettings();
    
    this.modal = new Modal(
      'new-chat-modal',
      '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">add_circle</span>Create New Chat',
      this.getModalContent(),
      'new-chat-modal'
    );
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.modal.initialize(),
      this.styles.initialize(),
      this.connectionForm.initialize(),
      this.infoPanel.initialize(),
      this.securitySettings.initialize()
    ]);
    
    this.modal.setContentUpdateCallback(() => {
      this.bindDelegatedHandlers();
    });
    
    this.bindDelegatedHandlers();
  }

  private getModalContent(): string {
    return `
      <div class="new-chat-content">
        ${this.renderTabNavigation()}
        ${this.connectionForm.render(this.currentTab === 'connect')}
        ${this.infoPanel.render(this.currentTab === 'info', this.serverInfo)}
      </div>
    `;
  }

  private renderTabNavigation(): string {
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
    `;
  }

  private bindDelegatedHandlers(): void {
    const root = this.modal.getElement();
    if (!root) return;

    // Remove old handlers
    const oldHandler = (root as any)._newChatHandler;
    if (oldHandler) {
      root.removeEventListener('click', oldHandler);
      root.removeEventListener('change', oldHandler);
    }

    const newClickHandler = async (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Tab switching
      const tabBtn = target.closest('.tab-btn') as HTMLButtonElement | null;
      if (tabBtn && tabBtn.dataset.tab) {
        e.preventDefault();
        e.stopPropagation();
        this.switchTab(tabBtn.dataset.tab as 'connect' | 'info');
        return false;
      }

      // Delegate to sub-components
      if (this.currentTab === 'connect') {
        await this.connectionForm.handleClick(e, this.callbacks);
      } else {
        await this.infoPanel.handleClick(e, this.callbacks);
      }
    };

    const newChangeHandler = (e: Event) => {
      if (this.currentTab === 'info') {
        this.securitySettings.handleChange(e);
      }
    };

    (root as any)._newChatHandler = newClickHandler;
    (root as any)._newChatChangeHandler = newChangeHandler;
    
    root.addEventListener('click', newClickHandler, true);
    root.addEventListener('change', newChangeHandler, true);

    // Enter key handling
    root.addEventListener('keydown', (e) => {
      if (this.currentTab === 'connect') {
        this.connectionForm.handleKeydown(e, this.callbacks);
      }
    });
  }

  private switchTab(tabName: 'connect' | 'info'): void {
    this.currentTab = tabName;
    this.modal.setContent(this.getModalContent());
    this.bindDelegatedHandlers();

    if (tabName === 'info') {
      this.updateConnectionInfo().catch(() => {});
    } else {
      setTimeout(() => {
        const root = this.modal.getElement();
        root?.querySelector<HTMLInputElement>('#peer-address')?.focus();
      }, 100);
    }
  }

  public open(): void {
    this.modal.setContent(this.getModalContent());
    this.bindDelegatedHandlers();
    this.modal.open();

    if (this.currentTab === 'connect') {
      setTimeout(() => {
        const root = this.modal.getElement();
        root?.querySelector<HTMLInputElement>('#peer-address')?.focus();
      }, 100);
    } else {
      this.updateConnectionInfo().catch(() => {});
    }
  }

  public close(): void {
    this.modal.close();
  }

  public updateServerInfo(address: string, port: number): void {
    this.serverInfo = { address, port };
    this.infoPanel.updateServerInfo(address, port);
  }

  public async updateConnectionInfo(): Promise<void> {
    await this.infoPanel.updateConnectionInfo();
  }

  public setCallbacks(callbacks: NewChatModalCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  cleanup(): void {
    this.styles.cleanup();
    this.connectionForm.cleanup();
    this.infoPanel.cleanup();
    this.securitySettings.cleanup();
    this.modal?.cleanup();
  }
}