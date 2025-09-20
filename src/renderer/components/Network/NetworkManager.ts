import { EventBus } from '../Utils/EventBus';
import type { Component, NetworkConfig } from '../../types/components';
import type { PeerInfo } from '../../../types/index';

export class NetworkManager implements Component {
  private eventBus = EventBus.getInstance();
  private serverInfo: { port: number; address: string } | null = null;
  private config: NetworkConfig;
  private bound = false;

  constructor(config: NetworkConfig = { autoStart: true }) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.setupTransportListeners();
    this.setupEventListeners();
    
    if (this.config.autoStart) {
      await this.startServer(this.config.port);
    }
  }

  private setupEventListeners(): void {
    // Listen for modal requests
    this.eventBus.on('network:connect-request', async ({ address, port }: { address: string; port: number; chatName: string }) => {
      try {
        await this.connectToPeer(address, port);
      } catch (error) {
        console.error('Failed to connect to peer:', error);
        this.eventBus.emit('status:updated', {
          step: 'Peer Connection',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to connect to peer',
          timestamp: Date.now()
        });
      }
    });

    this.eventBus.on('network:start-server-request', async () => {
      try {
        await this.startServer();
      } catch (error) {
        console.error('Failed to start server:', error);
        this.eventBus.emit('status:updated', {
          step: 'Server Start',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to start server',
          timestamp: Date.now()
        });
      }
    });

    this.eventBus.on('network:get-server-info', () => {
      if (this.serverInfo) {
        this.eventBus.emit('network:server-started', this.serverInfo);
      }
    });
  }

  private setupTransportListeners(): void {
    if (this.bound) return; // prevent double-binding
    this.bound = true;

    if (!window.electronAPI?.transport) return;

    window.electronAPI.transport.onPeerConnected((chatId: string, peerInfo: PeerInfo) => {
      this.eventBus.emit('peer:connected', chatId, peerInfo);
    });
    window.electronAPI.transport.onPeerDisconnected((chatId: string) => {
      this.eventBus.emit('peer:disconnected', chatId);
    });
    window.electronAPI.transport.onMessage((chatId: string, data: unknown) => {
      // Do NOT save here; just forward once
      this.eventBus.emit('message:received', { chatId, data: data as Record<string, unknown> });
    });
    // Optional signals
    window.electronAPI.transport.onSignal?.((chatId: string, data: any) => {
      this.eventBus.emit('signal:received', chatId, data);
    });
  }

  private async startServer(port?: number): Promise<void> {
    try {
      this.eventBus.emit('status:updated', {
        step: 'Network Setup',
        status: 'pending',
        message: 'Starting server...',
        timestamp: Date.now()
      });

      this.serverInfo = await window.electronAPI.transport.startServer(port);
      
      this.eventBus.emit('status:updated', {
        step: 'Network Setup',
        status: 'success',
        message: `Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`,
        timestamp: Date.now()
      });

      // Notify modal of server info
      this.eventBus.emit('network:server-started', this.serverInfo);

    } catch (error) {
      this.eventBus.emit('status:updated', {
        step: 'Network Setup',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to start server',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  async connectToPeer(address: string, port: number): Promise<boolean> {
    if (!window.electronAPI?.transport) {
      throw new Error('Transport API not available');
    }

    try {
      console.log(`Connecting to ${address}:${port}...`);
      const connected = await window.electronAPI.transport.connect(address, port);
      
      if (connected) {
        console.log('Successfully connected to peer');
      }
      
      return connected;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, data: Record<string, unknown>): Promise<void> {
    if (!window.electronAPI?.transport) {
      throw new Error('Transport API not available');
    }

    try {
      const result = await window.electronAPI.transport.send(chatId, {
        content: data.content,
        timestamp: Date.now(),
        ...data
      });
      
      if (!result) {
        throw new Error('Failed to send message - transport returned false');
      }
    } catch (error) {
      console.error('Failed to send message via transport:', error);
      throw error;
    }
  }

  getServerInfo(): { port: number; address: string } | null {
    return this.serverInfo;
  }

  cleanup(): void {
    // Clean up event listeners with proper bound functions
    this.eventBus.off('network:connect-request', this.handleConnectRequest.bind(this));
    this.eventBus.off('network:start-server-request', this.handleStartServerRequest.bind(this));
    this.eventBus.off('network:get-server-info', this.handleGetServerInfo.bind(this));
  }

  // Separate handler methods for proper cleanup
  private async handleConnectRequest({ address, port }: { address: string; port: number; chatName: string }): Promise<void> {
    try {
      await this.connectToPeer(address, port);
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      this.eventBus.emit('status:updated', {
        step: 'Peer Connection',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to peer',
        timestamp: Date.now()
      });
    }
  }

  private async handleStartServerRequest(): Promise<void> {
    try {
      await this.startServer();
    } catch (error) {
      console.error('Failed to start server:', error);
      this.eventBus.emit('status:updated', {
        step: 'Server Start',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to start server',
        timestamp: Date.now()
      });
    }
  }

  private handleGetServerInfo(): void {
    if (this.serverInfo) {
      this.eventBus.emit('network:server-started', this.serverInfo);
    }
  }
}