import './index.css';
import './styles/mobile.css';

console.log('📱 Secure Chat Mobile App starting...');

// Remove loading screen after app loads
const removeLoadingScreen = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 300);
  }
};

// Error handler
const handleError = (error: Error) => {
  console.error('📱 Mobile app error:', error);
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div style="text-align: center; color: #ff4444;">
        <h2>❌ Failed to Load App</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #007acc; color: white; border: none; border-radius: 5px;">
          Retry
        </button>
      </div>
    `;
  }
};

// Mobile-specific adaptations
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isCapacitor = !!(window as any).Capacitor;

if (isMobile || isCapacitor) {
  console.log('📱 Running in mobile mode');
  
  // Import and initialize mobile chat app
  import('./mobile/MobileChatApp').then(({ MobileChatApp }) => {
    const app = new MobileChatApp();
    
    // Expose app globally for debugging
    (window as any).mobileApp = app;
    
    app.initialize()
      .then(() => {
        console.log('📱 Mobile app initialized successfully');
        removeLoadingScreen();
      })
      .catch(handleError);
  }).catch(handleError);
} else {
  console.log('💻 Running in desktop fallback mode');
  
  // Fallback to regular version
  import('./renderer/ChatApp').then(({ ChatApp }) => {
    const app = new ChatApp();
    
    // Expose app globally for debugging
    (window as any).chatApp = app;
    
    app.initialize()
      .then(() => {
        console.log('💻 Desktop fallback app initialized');
        removeLoadingScreen();
      })
      .catch(handleError);
  }).catch(handleError);
}