export class MobileEnvironment {
  static setup(): void {
    // Add mobile-specific classes to body
    document.body.classList.add('mobile-app');
    
    // Prevent zoom on input focus (iOS)
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
    
    // Handle safe areas (iOS notch)
    if (MobileEnvironment.hasNotch()) {
      document.body.classList.add('has-notch');
    }

    // Add status bar color for mobile
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.name = 'theme-color';
    statusBarMeta.content = '#1a1a1a';
    document.head.appendChild(statusBarMeta);
  }

  static hasNotch(): boolean {
    // Check for iPhone X and newer (with notch)
    return /iPhone/.test(navigator.userAgent) && 
           window.screen.height >= 812 && 
           window.devicePixelRatio >= 2;
  }

  static isCapacitorEnvironment(): boolean {
    return !!(window as unknown as { Capacitor?: { isNative: boolean } }).Capacitor?.isNative;
  }

  static isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}