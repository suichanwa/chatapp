import type { Component, TabConfig } from '../types/components';

export class TabSystem implements Component {
  private container: HTMLElement | null = null;
  private activeTab: string;
  private tabs: Map<string, TabConfig> = new Map();
  private onClick?: (e: Event) => void;
  private onKeydown?: (e: KeyboardEvent) => void;

  constructor(
    private containerId: string,
    private tabConfigs: TabConfig[]
  ) {
    this.activeTab = tabConfigs.find(t => t.active)?.id || tabConfigs[0]?.id || '';
    tabConfigs.forEach(tab => this.tabs.set(tab.id, tab));
  }

  async initialize(): Promise<void> {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Tab container with id "${this.containerId}" not found`);
    }

    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    if (!this.container) return;

    const tabConfigs = Array.from(this.tabs.values());

    this.container.innerHTML = `
      <div class="tab-system">
        <div class="tab-nav" role="tablist" aria-label="New Chat Tabs">
          ${tabConfigs.map((tab, idx) => {
            const isActive = tab.id === this.activeTab;
            const btnId = `tab-${tab.id}`;
            const panelId = `panel-${tab.id}`;
            return `
            <button 
              id="${btnId}"
              class="tab-button ${isActive ? 'active' : ''}" 
              data-tab="${tab.id}"
              type="button"
              role="tab"
              aria-selected="${isActive}"
              aria-controls="${panelId}"
              tabindex="${isActive ? '0' : '-1'}"
            >
              ${tab.icon ? `<span class="tab-icon" aria-hidden="true">${tab.icon}</span>` : ''}
              <span class="tab-label">${tab.label}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="tab-content">
          ${tabConfigs.map(tab => {
            const isActive = tab.id === this.activeTab;
            const btnId = `tab-${tab.id}`;
            const panelId = `panel-${tab.id}`;
            return `
            <div 
              id="${panelId}"
              class="tab-panel ${isActive ? 'active' : ''}" 
              data-panel="${tab.id}"
              role="tabpanel"
              aria-labelledby="${btnId}"
            >
              ${tab.content}
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    // Click delegation
    this.onClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const tabButton = target.closest('[data-tab]') as HTMLElement | null;

      if (tabButton) {
        const tabId = tabButton.dataset.tab;
        if (tabId) this.switchTab(tabId);
      }
    };
    this.container.addEventListener('click', this.onClick);

    // Keyboard navigation on tablist
    this.onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tab-nav')) return;

      const buttons = Array.from(this.container!.querySelectorAll<HTMLButtonElement>('.tab-button'));
      const currentIndex = buttons.findIndex(b => b.getAttribute('data-tab') === this.activeTab);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % buttons.length;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          e.preventDefault();
          break;
        case 'Home':
          nextIndex = 0;
          e.preventDefault();
          break;
        case 'End':
          nextIndex = buttons.length - 1;
          e.preventDefault();
          break;
        default:
          return;
      }
      const nextTabId = buttons[nextIndex].dataset.tab!;
      this.switchTab(nextTabId);
      buttons[nextIndex].focus();
    };
    this.container.addEventListener('keydown', this.onKeydown);
  }

  switchTab(tabId: string): void {
    if (!this.container || !this.tabs.has(tabId)) return;

    this.activeTab = tabId;

    // Update tab buttons
    this.container.querySelectorAll<HTMLButtonElement>('.tab-button').forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });

    // Update tab panels
    this.container.querySelectorAll<HTMLElement>('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === tabId);
    });

    // Emit tab change event with full TabConfig
    const detail = { tabId, tab: this.tabs.get(tabId)! };
    this.container.dispatchEvent(new CustomEvent('tab:changed', { detail }));
  }

  getActiveTab(): string {
    return this.activeTab;
  }

  setTabs(tabConfigs: TabConfig[], activeId?: string): void {
    this.tabs.clear();
    tabConfigs.forEach(t => this.tabs.set(t.id, t));
    if (activeId && this.tabs.has(activeId)) {
      this.activeTab = activeId;
    } else {
      this.activeTab = tabConfigs.find(t => t.active)?.id || tabConfigs[0]?.id || '';
    }
    this.render();
  }

  updateTab(tabId: string, content: string): void {
    const tab = this.tabs.get(tabId);
    if (tab) {
      tab.content = content;
      const panel = this.container?.querySelector<HTMLElement>(`[data-panel="${tabId}"]`);
      if (panel) {
        panel.innerHTML = content;
      }
    }
  }

  cleanup(): void {
    if (!this.container) return;
    if (this.onClick) this.container.removeEventListener('click', this.onClick);
    if (this.onKeydown) this.container.removeEventListener('keydown', this.onKeydown);
    this.onClick = undefined;
    this.onKeydown = undefined;
  }
}