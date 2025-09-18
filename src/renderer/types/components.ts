import type { IdentityKeys, Message, Chat, PeerInfo } from '../../types/electron';

export interface InitStatus {
  step: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp: number;
}

export interface AppState {
  identityKeys: IdentityKeys | null;
  serverInfo: { port: number; address: string } | null;
  currentChatId: string | null;
  chats: Map<string, Chat>;
  initSteps: InitStatus[];
}

export interface Component {
  initialize?(): Promise<void>;
  cleanup?(): void;
}

export interface UIComponent extends Component {
  render(): void;
}

export interface NetworkConfig {
  autoStart: boolean;
  port?: number;
}

export interface ChatEvents {
  'chat:selected': (chatId: string) => void;
  'chat:created': (chat: Chat) => void;
  'chat:updated': (chatId: string) => void;
  'message:sent': (message: Message) => void;
  'message:received': (data: { chatId: string; data: Record<string, unknown> }) => void;
  'message:processed': (message: Partial<Message>) => void;
  'peer:connected': (chatId: string, peerInfo: PeerInfo) => void;
  'peer:disconnected': (chatId: string) => void;
  'status:updated': (status: InitStatus) => void;
  'modal:show': (modalType: string) => void;
  'modal:hide': (modalType: string) => void;
  
  // Network events
  'network:connect-request': (params: { address: string; port: number; chatName: string }) => void;
  'network:start-server-request': () => void;
  'network:get-server-info': () => void;
  'network:server-started': (serverInfo: { address: string; port: number }) => void;
  'network:send': (chatId: string, data: Record<string, unknown>) => void;
  
  // Crypto events
  'crypto:get-public-key': () => void;
  'crypto:identity-ready': (publicKey: string) => void;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: string;
  active?: boolean;
}

export interface ServerInfo {
  isRunning: boolean;
  address?: string;
  port?: number;
}