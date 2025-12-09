import './tailwind-output.css'; // Use compiled Tailwind CSS
import './styles/components.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { ChatAppPublic } from './renderer/types/public';
import { getPreferredTarget, setPreferredTarget } from './shared/EntryPointHandler';
import { UnfocusedOverlay } from './mobile/ui/UnfocusedOverlay';

console.log('🔒 Secure Chat App starting...');

// Small helper to let you switch entry target from DevTools:
//   window.setEntryTarget('mobile' | 'desktop')
(Object.assign(window as any, {
  setEntryTarget: (target: 'mobile' | 'desktop') => setPreferredTarget(target),
}) as any);

// Initialize the unfocused overlay
const initializeOverlay = (isElectron: boolean) => {
  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'unfocused-overlay-root';
  document.body.appendChild(overlayContainer);

  const root = createRoot(overlayContainer);
  root.render(React.createElement(UnfocusedOverlay, { isElectron }));
};

const target = getPreferredTarget();

if (target === 'mobile') {
  console.log('📱 Loading MobileChatApp (entry handler)');
  
  // Initialize mobile overlay (not Electron)
  initializeOverlay(false);
  
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
      // Fallback to regular version
      import('./renderer/ChatApp').then(({ ChatApp }) => {
        const app: ChatAppPublic = new ChatApp();
        window.chatApp = app;
        app.initialize().catch((err: unknown) => console.error('Failed to initialize ChatApp (fallback):', err));
      });
    });
} else {
  console.log('💻 Loading ChatApp (entry handler)');
  
  // Initialize desktop overlay (is Electron)
  initializeOverlay(true);
  
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