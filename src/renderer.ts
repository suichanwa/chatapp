import './index.css';
import { ChatApp } from './renderer/ChatApp';

console.log('🔒 Secure Chat App starting...');

// Set to false to use desktop mode
const FORCE_MOBILE = false;

let chatApp: ChatApp;

if (FORCE_MOBILE) {
  console.log('📱 FORCING MOBILE MODE FOR TESTING');
  // Import mobile version only when needed
  import('./mobile/MobileChatApp').then(({ MobileChatApp }) => {
    chatApp = new MobileChatApp();
    (window as any).chatApp = chatApp;
    chatApp.initialize().catch(error => {
      console.error('Failed to initialize MobileChatApp:', error);
    });
  });
} else {
  console.log('💻 Running in desktop mode');
  chatApp = new ChatApp();
  // Expose ChatApp globally for HTML onclick handlers
  (window as any).chatApp = chatApp;
  
  chatApp.initialize().catch(error => {
    console.error('Failed to initialize ChatApp:', error);
  });
}