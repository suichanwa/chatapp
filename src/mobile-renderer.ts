import './index.css';
import './styles/mobile.css';

console.log('📱 Secure Chat Mobile App starting...');

// Remove loading screen
const loading = document.getElementById('loading');
if (loading) {
  loading.remove();
}

// Mobile-specific adaptations
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isCapacitor = !!(window as any).Capacitor;

if (isMobile || isCapacitor) {
  console.log('📱 Running in mobile mode');
  
  // Import and initialize mobile chat app
  import('./mobile/MobileChatApp').then(({ MobileChatApp }) => {
    const app = new MobileChatApp();
    app.initialize();
  });
} else {
  console.log('💻 Running in desktop fallback mode');
  
  // Fallback to regular version
  import('./renderer/ChatApp').then(({ ChatApp }) => {
    const app = new ChatApp();
    app.initialize();
  });
}