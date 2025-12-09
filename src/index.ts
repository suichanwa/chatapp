// Types (single source of truth)
export * from './types';

// Renderer-only types
export * from './renderer/types/components';
export * from './renderer/types/public';

// Styles
export * from './styles/NewChatModalStyles';

// Renderer components (explicit sub-barrels)
export * from './renderer/components/Chat';
export * from './renderer/components/Utils';
export * from './renderer/components/Network';
export * from './renderer/components/Crypto';
export * from './renderer/components/TabSystem';
export * from './renderer/components/ConnectionTab';

// UI components (explicit files to avoid duplicate re-exports)
// Keep desktop UI components exported from renderer paths
export { ErrorModal } from './renderer/components/UI/ErrorModal';
export { ShortcutsModal } from './renderer/components/UI/ShortcutsModal';
export { ShortcutsController } from './renderer/components/UI/ShortcutsController';
export { ImageViewer } from './renderer/components/UI/ImageViewer';
export { InfoPanel } from './renderer/components/UI/InfoPanel';
export { SecuritySettings } from './renderer/components/UI/SecuritySettings';
export { StatusBar } from './renderer/components/UI/StatusBar';
// Export modal files directly
export * from './renderer/components/UI/Modals';

// Main process (explicit)
export * from './main/WindowManager';
export * from './main/DatabaseManager';
export * from './main/KeyStore';
export * from './main/CryptoEngine';
export * from './main/PermissionBroker';
export * from './main/DebugManager';
export * from './main/TransportManager';

// Mobile (explicit — do not export mobile ShortcutsController at top-level if name collides)
export * from './mobile/core/MobileEnvironment';
export * from './mobile/core/MobileCapacitorLoader';
export * from './mobile/core/MobileTouchHandler';
export * from './mobile/features/MobileCamera';
export * from './mobile/features/MobilePermissions';
export * from './mobile/ui/MobileToast';
export * from './mobile/ui/MobileDebugPanel';
export { UnfocusedOverlay } from './mobile/ui/UnfocusedOverlay';

// Shared
export * from './shared/EntryPointHandler';
export * from './mobile/ui/DecoyNotesApp/DecoyNotesApp';