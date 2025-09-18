import type { MobileChatApp } from '../MobileChatApp';

export class MobileStatusBar {
  async initialize(): Promise<void> {
    this.render();
  }

  render(): void {
    const container = document.querySelector('.app-status-container');
    if (!container) return;

    container.innerHTML = `
      <span id="app-status" class="app-status">🔄 Starting...</span>
    `;
  }

  updateStatus(app: MobileChatApp): void {
    const statusEl = document.getElementById('app-status');
    if (!statusEl) return;

    // Mobile-specific status checks
    const hasWebCrypto = !!(crypto && crypto.subtle);
    const hasCapacitor = (window as unknown as { Capacitor?: { isNative: boolean } }).Capacitor?.isNative;
    const hasCameraAPI = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

    // Check mobile initialization steps
    const mobileInitSteps = (app as any).initSteps || [];
    const errorSteps = mobileInitSteps.filter((s: any) => s.status === 'error');
    const pendingSteps = mobileInitSteps.filter((s: any) => s.status === 'pending');
    const successSteps = mobileInitSteps.filter((s: any) => s.status === 'success');

    const hasUISetup = successSteps.some((s: any) => s.step === 'UI Setup');
    const hasMobileAPIs = successSteps.some((s: any) => s.step === 'Mobile APIs Check');
    const hasMobileCrypto = successSteps.some((s: any) => s.step === 'Mobile Crypto');
    const hasMobileNetwork = successSteps.some((s: any) => s.step === 'Mobile Network');
    const hasMobileStorage = successSteps.some((s: any) => s.step === 'Mobile Storage');

    console.log('📱 Mobile StatusBar Debug:', {
      hasWebCrypto,
      hasCapacitor,
      hasCameraAPI,
      errorSteps: errorSteps.length,
      pendingSteps: pendingSteps.length,
      successSteps: successSteps.length,
      hasUISetup,
      hasMobileAPIs,
      hasMobileCrypto,
      hasMobileNetwork,
      hasMobileStorage,
      mobileInitialized: (app as any).mobileInitialized,
      identityKeys: !!(app as any).identityKeys
    });

    if (errorSteps.length > 0) {
      statusEl.textContent = '🔴 Mobile app has errors';
      statusEl.className = 'app-status error';
      statusEl.title = `Errors: ${errorSteps.map((s: any) => s.step).join(', ')}`;
    } else if (pendingSteps.length > 0) {
      statusEl.textContent = '🔄 Starting mobile app...';
      statusEl.className = 'app-status pending';
      statusEl.title = `Initializing: ${pendingSteps.map((s: any) => s.step).join(', ')}`;
    } else if (
      hasWebCrypto && 
      hasUISetup &&
      hasMobileAPIs &&
      hasMobileCrypto &&
      hasMobileNetwork &&
      hasMobileStorage &&
      (app as any).mobileInitialized &&
      successSteps.length >= 5
    ) {
      statusEl.textContent = '🟢 Mobile app is safe';
      statusEl.className = 'app-status safe';
      statusEl.title = 'All mobile systems operational';
    } else {
      const issues: string[] = [];
      if (!hasWebCrypto) issues.push('No Web Crypto');
      if (!hasUISetup) issues.push('UI not ready');
      if (!hasMobileAPIs) issues.push('APIs not checked');
      if (!hasMobileCrypto) issues.push('Crypto not ready');
      if (!hasMobileNetwork) issues.push('Network not ready');
      if (!hasMobileStorage) issues.push('Storage not ready');
      if (!(app as any).mobileInitialized) issues.push('Mobile not initialized');
      
      statusEl.textContent = '🟡 Mobile app initializing...';
      statusEl.className = 'app-status warning';
      statusEl.title = `Working on: ${issues.join(', ')}`;
    }
  }

  cleanup(): void {
    // Mobile cleanup
  }
}