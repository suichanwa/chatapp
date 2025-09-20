import './index.css';
import './styles/components.css';
import type { ChatAppPublic } from './renderer/types/public';
import { getPreferredTarget, setPreferredTarget } from './shared/EntryPointHandler';

console.log('🔒 Secure Chat App starting...');

// Small helper to let you switch entry target from DevTools:
//   window.setEntryTarget('mobile' | 'desktop')
(Object.assign(window as any, {
  setEntryTarget: (target: 'mobile' | 'desktop') => setPreferredTarget(target),
}) as any);

const target = getPreferredTarget();

if (target === 'mobile') {
  console.log('📱 Loading MobileChatApp (entry handler)');
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
      import('./renderer/ChatApp').then(({ ChatApp }) => {
        const app: ChatAppPublic = new ChatApp();
        window.chatApp = app;
        app.initialize().catch((err: unknown) => console.error('Failed to initialize ChatApp (fallback):', err));
      });
    });
} else {
  console.log('💻 Loading ChatApp (entry handler)');
  import('./renderer/ChatApp')
    .then(({ ChatApp }) => {
      const app: ChatAppPublic = new ChatApp();
      window.chatApp = app;
      app.initialize().catch((error: unknown) => console.error('Failed to initialize ChatApp:', error));
    })
    .catch((error: unknown) => {
      console.error('Failed to load ChatApp module:', error);
    });
}