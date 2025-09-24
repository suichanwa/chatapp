export * from './types'; // <-- This should include IdentityKeys, EncryptedData, ImageData, Message, Chat, PeerInfo, DebugLog, ElectronAPI


export * from './renderer/types/components';
export * from './renderer/types/public';

export * from './styles/NewChatModalStyles';

// Renderer components
export * from './renderer/components/';
export * from './renderer/components/Chat';
export * from './renderer/components/Utils';
export * from './renderer/components/Network';
export * from './renderer/components/Crypto';
export * from './renderer/components/TabSystem';
export * from './renderer/components/ConnectionTab';

// Main process (if you want to expose these)
export * from './main/WindowManager';
export * from './main/DatabaseManager';
export * from './main/KeyStore';
export * from './main/CryptoEngine';
export * from './main/PermissionBroker';
export * from './main/DebugManager';
export * from './main/TransportManager';

// Mobile (if you want to expose these)
export * from './mobile/core/MobileEnvironment';
export * from './mobile/core/MobileCapacitorLoader';
export * from './mobile/core/MobileTouchHandler';
export * from './mobile/features/MobileCamera';
export * from './mobile/features/MobilePermissions';
export * from './mobile/ui/MobileToast';
export * from './mobile/ui/MobileDebugPanel';

// Shared
export * from './shared/EntryPointHandler';

export * from './renderer/components/UI/ErrorModal';
export * from './renderer/components/UI/ShortcutsModal';
export * from './renderer/components/UI/ShortcutsController';
export * from './renderer/components/UI/ImageViewer';
export * from './renderer/components/UI/InfoPanel';
export * from './renderer/components/UI/SecuritySettings';
export * from './renderer/components/UI/StatusBar';
export * from './renderer/components/UI/Modals';