import React, { useState, useEffect } from 'react';
import './../../styles/UnfocusedOverlay.css';

interface UnfocusedOverlayProps {
  isElectron?: boolean;
}

export const UnfocusedOverlay: React.FC<UnfocusedOverlayProps> = ({ isElectron = false }) => {
  const [isUnfocused, setIsUnfocused] = useState(false);

  useEffect(() => {
    if (isElectron) {
      // Desktop: Listen to Electron window focus events
      const handleFocus = () => setIsUnfocused(false);
      const handleBlur = () => setIsUnfocused(true);

      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      };
    } else {
      // Mobile: Use Capacitor App State
      const setupMobileListener = async () => {
        try {
          const { App } = await import('@capacitor/app');
          
          const listener = await App.addListener('appStateChange', ({ isActive }) => {
            setIsUnfocused(!isActive);
          });

          return () => {
            listener.remove();
          };
        } catch (error) {
          console.warn('Capacitor App plugin not available, using fallback');
          
          // Fallback to visibilitychange API
          const handleVisibilityChange = () => {
            setIsUnfocused(document.hidden);
          };

          document.addEventListener('visibilitychange', handleVisibilityChange);
          return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          };
        }
      };

      let cleanup: (() => void) | undefined;
      setupMobileListener().then(fn => { cleanup = fn; });

      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [isElectron]);

  if (!isUnfocused) return null;

  return (
    <div className="unfocused-overlay">
      <div className="unfocused-content">
        <div className="lock-icon">🔒</div>
        <p>App is locked</p>
        <p className="hint">Focus window to continue</p>
      </div>
    </div>
  );
};