import type { Component, TabConfig } from '../types/components';

export class TabSystem implements Component {
  private container: HTMLElement | null = null;
  private activeTab: string;
  private tabs: Map<string, TabConfig> = new Map();

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
        <div class="tab-nav">
          ${tabConfigs.map(tab => `
            <button 
              class="tab-button ${tab.id === this.activeTab ? 'active' : ''}" 
              data-tab="${tab.id}"
              type="button"
            >
              ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
              <span class="tab-label">${tab.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="tab-content">
          ${tabConfigs.map(tab => `
            <div 
              class="tab-panel ${tab.id === this.activeTab ? 'active' : ''}" 
              data-panel="${tab.id}"
            >
              ${tab.content}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tabButton = target.closest('[data-tab]') as HTMLElement;
      
      if (tabButton) {
        const tabId = tabButton.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      }
    });
  }

  switchTab(tabId: string): void {
    if (!this.container || !this.tabs.has(tabId)) return;

    this.activeTab = tabId;

    // Update tab buttons
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab panels
    this.container.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === tabId);
    });

    // Emit tab change event
    this.container.dispatchEvent(new CustomEvent('tab:changed', { 
      detail: { tabId, tab: this.tabs.get(tabId) }
    }));
  }

  updateTab(tabId: string, content: string): void {
    const tab = this.tabs.get(tabId);
    if (tab) {
      tab.content = content;
      const panel = this.container?.querySelector(`[data-panel="${tabId}"]`);
      if (panel) {
        panel.innerHTML = content;
      }
    }
  }

  cleanup(): void {
    // Cleanup handled by parent
  }
}