import './index.css';
import './styles/components.css';
import { ChatApp } from './renderer/ChatApp';
import type { ChatAppPublic } from './renderer/types/public';

// Remove local interface and global Window declaration; use shared public type

console.log('🔒 Secure Chat App starting...');

// Set to false to use desktop mode
const FORCE_MOBILE = false;

if (FORCE_MOBILE) {
  console.log('📱 FORCING MOBILE MODE FOR TESTING');
  import('./mobile/MobileChatApp')
    .then(({ MobileChatApp }) => {
      const app: ChatAppPublic = new MobileChatApp();
      window.chatApp = app;

      app.initialize().catch((error: unknown) => {
        console.error('Failed to initialize MobileChatApp:', error);
      });
    })
    .catch((error: unknown) => {
      console.error('Failed to load MobileChatApp module:', error);
      // Fallback to desktop mode
      const app: ChatAppPublic = new ChatApp();
      window.chatApp = app;
      app.initialize().catch((err: unknown) => {
        console.error('Failed to initialize ChatApp (fallback):', err);
      });
    });
} else {
  console.log('💻 Running in desktop mode');
  const app: ChatAppPublic = new ChatApp();
  window.chatApp = app;

  app.initialize().catch((error: unknown) => {
    console.error('Failed to initialize ChatApp:', error);
  });
}