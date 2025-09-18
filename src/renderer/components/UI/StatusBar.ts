import { EventBus } from '../Utils/EventBus';
import type { UIComponent, InitStatus } from '../../types/components';

export class StatusBar implements UIComponent {
  private eventBus = EventBus.getInstance();
  private initSteps: InitStatus[] = [];

  async initialize(): Promise<void> {
    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    this.eventBus.on('status:updated', (status: InitStatus) => {
      this.updateStatus(status);
    });
  }

  render(): void {
    const container = document.querySelector('.app-status-container');
    if (!container) return;

    container.innerHTML = `
      <span id="app-status" class="app-status">🔄 Starting...</span>
    `;
  }

  private updateStatus(status: InitStatus): void {
    const existingIndex = this.initSteps.findIndex(s => s.step === status.step);
    if (existingIndex !== -1) {
      this.initSteps[existingIndex] = status;
    } else {
      this.initSteps.push(status);
    }

    this.updateStatusDisplay();
  }

  private updateStatusDisplay(): void {
    const statusEl = document.getElementById('app-status');
    if (!statusEl) return;

    const pendingSteps = this.initSteps.filter(s => s.status === 'pending');
    const errorSteps = this.initSteps.filter(s => s.status === 'error');
    const successSteps = this.initSteps.filter(s => s.status === 'success');

    // Check system readiness
    const hasElectronAPI = typeof window.electronAPI !== 'undefined';
    const hasCryptoAPI = typeof window.electronAPI?.crypto !== 'undefined';
    const hasDbAPI = typeof window.electronAPI?.db !== 'undefined';
    const hasTransportAPI = typeof window.electronAPI?.transport !== 'undefined';
    
    // Check if key components are initialized
    const hasCryptoKeys = this.initSteps.some(s => s.step === 'Crypto Initialization' && s.status === 'success');
    const hasNetworking = this.initSteps.some(s => s.step === 'Network Setup' && s.status === 'success');
    const hasUISetup = this.initSteps.some(s => s.step === 'UI Setup' && s.status === 'success');
    const hasAPICheck = this.initSteps.some(s => s.step === 'ElectronAPI Check' && s.status === 'success');

    console.log('🔍 StatusBar Debug:', {
      pendingSteps: pendingSteps.length,
      errorSteps: errorSteps.length,
      successSteps: successSteps.length,
      hasElectronAPI,
      hasCryptoAPI,
      hasDbAPI,
      hasTransportAPI,
      hasCryptoKeys,
      hasNetworking,
      hasUISetup,
      hasAPICheck,
      allSteps: this.initSteps.map(s => `${s.step}: ${s.status}`)
    });

    if (errorSteps.length > 0) {
      statusEl.textContent = '🔴 App is not safe';
      statusEl.className = 'app-status error';
      statusEl.title = `Errors: ${errorSteps.map(s => s.step).join(', ')}`;
    } else if (pendingSteps.length > 0) {
      statusEl.textContent = '🔄 Starting...';
      statusEl.className = 'app-status pending';
      statusEl.title = `Initializing: ${pendingSteps.map(s => s.step).join(', ')}`;
    } else if (
      hasElectronAPI && 
      hasCryptoAPI && 
      hasDbAPI && 
      hasTransportAPI &&
      hasCryptoKeys &&
      hasNetworking &&
      hasUISetup &&
      hasAPICheck
    ) {
      statusEl.textContent = '🟢 App is safe';
      statusEl.className = 'app-status safe';
      statusEl.title = 'All systems operational';
    } else {
      const issues: string[] = [];
      if (!hasElectronAPI) issues.push('No ElectronAPI');
      if (!hasCryptoAPI) issues.push('No Crypto API');
      if (!hasDbAPI) issues.push('No Database API');
      if (!hasTransportAPI) issues.push('No Transport API');
      if (!hasCryptoKeys) issues.push('No Crypto Keys');
      if (!hasNetworking) issues.push('No Network');
      if (!hasUISetup) issues.push('No UI');
      if (!hasAPICheck) issues.push('No API Check');
      
      statusEl.textContent = '🟡 App is not safe';
      statusEl.className = 'app-status warning';
      statusEl.title = `Issues: ${issues.join(', ')}`;
    }
  }

  cleanup(): void {
    this.eventBus.off('status:updated', this.updateStatus.bind(this));
  }
}