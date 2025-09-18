export class MobileToast {
  static show(message: string, duration = 2000): void {
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static showError(message: string): void {
    MobileToast.show(`❌ ${message}`, 3000);
  }

  static showSuccess(message: string): void {
    MobileToast.show(`✅ ${message}`, 2000);
  }

  static showInfo(message: string): void {
    MobileToast.show(`ℹ️ ${message}`, 2000);
  }
}