import './tailwind-output.css';
import './styles/components.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { ChatAppPublic } from './renderer/types/public';
import { getPreferredTarget, setPreferredTarget } from './shared/EntryPointHandler';
import { UnfocusedOverlay } from './mobile/ui/UnfocusedOverlay';
import { logInfo, logError } from './shared/LogHelpers';

logInfo('Renderer', 'Secure Chat App starting');

// Small helper to let you switch entry target from DevTools:
//   window.setEntryTarget('mobile' | 'desktop')
(Object.assign(window as any, {
  setEntryTarget: (target: 'mobile' | 'desktop') => setPreferredTarget(target),
}) as any);

// Initialize the unfocused overlay
const initializeOverlay = (isElectron: boolean) => {
  const init = () => {
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'unfocused-overlay-root';
    overlayContainer.style.position = 'fixed';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.pointerEvents = 'none'; // Allow clicks through when not visible
    overlayContainer.style.zIndex = '999999';
    
    document.body.appendChild(overlayContainer);

    const root = createRoot(overlayContainer);
    root.render(React.createElement(UnfocusedOverlay, { isElectron }));
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
};

const target = getPreferredTarget();

if (target === 'mobile') {
  logInfo('Renderer', 'Loading MobileChatApp');
  
  // Initialize mobile overlay (not Electron)
  initializeOverlay(false);
  
  import('./mobile/MobileChatApp')
    .then(({ MobileChatApp }) => {
      const app: ChatAppPublic = new MobileChatApp();
      window.chatApp = app;
      app.initialize().catch((error: unknown) => {
        logError('Renderer', 'Failed to initialize MobileChatApp', error);
      });
    })
    .catch((error: unknown) => {
      logError('Renderer', 'Failed to load MobileChatApp module', error);
      // Fallback to regular version
      import('./renderer/ChatApp').then(({ ChatApp }) => {
        const app: ChatAppPublic = new ChatApp();
        window.chatApp = app;
        app.initialize().catch((err: unknown) => logError('Renderer', 'Failed to initialize ChatApp (fallback)', err));
      });
    });
} else {
  logInfo('Renderer', 'Loading ChatApp');
  
  // Initialize desktop overlay (is Electron)
  initializeOverlay(true);
  
  import('./renderer/ChatApp')
    .then(({ ChatApp }) => {
      const app: ChatAppPublic = new ChatApp();
      window.chatApp = app;
      app.initialize().catch((error: unknown) => logError('Renderer', 'Failed to initialize ChatApp', error));
    })
    .catch((error: unknown) => {
      logError('Renderer', 'Failed to load ChatApp module', error);
    });
}