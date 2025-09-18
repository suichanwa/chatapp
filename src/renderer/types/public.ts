// Public surface for exposing the app instance on window without leaking internals
export interface ChatAppPublic {
  initialize(): Promise<void>;
  cleanup(): void;
  saveMessage(messageId: string): Promise<void>;
}

declare global {
  interface Window {
    chatApp: ChatAppPublic;
  }
}

export {};