import React, { useState, useEffect } from 'react';
import { logDebug, logWarn } from '../../shared/LogHelpers';
import './../../styles/UnfocusedOverlay.css';

interface UnfocusedOverlayProps {
  isElectron?: boolean;
}

export const UnfocusedOverlay: React.FC<UnfocusedOverlayProps> = ({ isElectron = false }) => {
  const [isUnfocused, setIsUnfocused] = useState(false);

  useEffect(() => {
    logDebug('UnfocusedOverlay', 'Initializing', { isElectron });

    if (isElectron) {
      const handleFocus = () => setIsUnfocused(false);
      const handleBlur = () => setIsUnfocused(true);
      const handleVisibilityChange = () => setIsUnfocused(document.hidden);

      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('focus', handleFocus, true);
      document.addEventListener('blur', handleBlur, true);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('focus', handleFocus, true);
        document.removeEventListener('blur', handleBlur, true);
      };
    } else {
      const setupMobileListener = async () => {
        try {
          const { App } = await import('@capacitor/app');
          const listener = await App.addListener('appStateChange', ({ isActive }) => {
            setIsUnfocused(!isActive);
          });
          logDebug('UnfocusedOverlay', 'Capacitor listener attached');
          return () => listener.remove();
        } catch (error) {
          logWarn('UnfocusedOverlay', 'Using fallback visibility API', error);
          const handleVisibilityChange = () => setIsUnfocused(document.hidden);
          document.addEventListener('visibilitychange', handleVisibilityChange);
          return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };

      let cleanup: (() => void) | undefined;
      setupMobileListener().then(fn => { cleanup = fn; });
      return () => { if (cleanup) cleanup(); };
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