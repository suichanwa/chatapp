import { ipcMain, BrowserWindow } from 'electron';
import { createServer, connect, Server, Socket } from 'net';
import crypto from 'node:crypto';
import os from 'node:os';

export interface PeerConnection {
  chatId: string;
  socket: Socket;
  peerInfo: {
    id: string;
    name: string;
    publicKey: string;
    address: string;
  };
  authenticated: boolean;
}

// Security-related constants and config
const PROTOCOL_VERSION = 1;
const MAX_MESSAGE_BYTES = 1 * 1024 * 1024; // 1MB per JSON message
const MAX_CONNECTIONS = 50;
const READ_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 min
const KEEPALIVE_MS = 30_000;

const BIND_HOST = process.env.CHATAPP_BIND_HOST || '0.0.0.0';
// Optional PSK: if set on both peers, handshake must include matching hash
const PSK_HASH = process.env.CHATAPP_PSK
  ? crypto.createHash('sha256').update(process.env.CHATAPP_PSK).digest('hex')
  : null;

function getLocalIPv4(): string | null {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const ni of nets[name] || []) {
      if ((ni as any).family === 'IPv4' && !(ni as any).internal) return (ni as any).address;
    }
  }
  return null;
}

export class TransportManager {
  private server: Server | null = null;
  private connections: Map<string, PeerConnection> = new Map();
  private serverPort = 0;
  private serverAddress = '';
  private serverAdvertisedAddress = '';
  private readBuffers = new WeakMap<Socket, Buffer>(); // per-socket receive buffer

  constructor() {
    this.setupIPC();
  }

  private setupIPC() {
    ipcMain.handle('transport:startServer', async (_e, port?: number) => {
      const defaultPort = Number(process.env.CHATAPP_PORT) || 51750;
      return this.startServer(port ?? defaultPort);
    });

    ipcMain.handle('transport:connect', async (_e, address: string, port: number) => {
      return this.connectToPeer(address, port);
    });

    ipcMain.handle('transport:send', async (_e, chatId: string, data: unknown) => {
      return this.sendMessage(chatId, data);
    });

    ipcMain.handle('transport:signal', async (_e, chatId: string, data: unknown) => {
      return this.sendSignal(chatId, data as any);
    });

    ipcMain.handle('transport:disconnect', async (_e, chatId: string) => {
      return this.disconnectPeer(chatId);
    });
  }

  async startServer(port = 0): Promise<{ port: number; address: string }> {
    return new Promise((resolve, reject) => {
      this.server = createServer();
      this.server.maxConnections = MAX_CONNECTIONS;

      this.server.on('connection', (socket) => {
        this.attachSocketGuards(socket);
        this.handleIncomingConnection(socket);
      });

      this.server.on('error', (error) => {
        console.error('🌐 TransportManager: Server error:', error);
        reject(error);
      });

      this.server.listen(port, BIND_HOST, () => {
        const address = this.server?.address();
        if (address && typeof address === 'object') {
          this.serverPort = address.port;
          this.serverAddress = address.address; // may be 0.0.0.0
          this.serverAdvertisedAddress = getLocalIPv4() || this.serverAddress;
          console.log(
            `🌐 TransportManager: Server listening on ${this.serverAddress}:${this.serverPort} (advertising ${this.serverAdvertisedAddress})`
          );
          resolve({ port: this.serverPort, address: this.serverAdvertisedAddress });
        } else {
          reject(new Error('Failed to get server address'));
        }
      });
    });
  }

  private attachSocketGuards(socket: Socket): void {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, KEEPALIVE_MS);
    socket.setTimeout(READ_IDLE_TIMEOUT_MS, () => {
      console.warn('🌐 TransportManager: Socket idle timeout, destroying');
      socket.destroy();
    });
  }

  private handleIncomingConnection(socket: Socket) {
    console.log('🌐 TransportManager: Incoming connection from', socket.remoteAddress);

    const tempConnection: Partial<PeerConnection> = {
      socket,
      authenticated: false,
    };

    const onMessage = (message: any) => {
      try {
        if (!tempConnection.authenticated) {
          if (this.validateHandshake(message)) {
            const chatId = crypto.randomUUID();
            const peerConnection: PeerConnection = {
              chatId,
              socket,
              peerInfo: {
                id: message.peerId,
                name: message.peerName || 'Unknown',
                publicKey: message.publicKey || '',
                address: socket.remoteAddress || 'unknown',
              },
              authenticated: true,
            };
            this.connections.set(chatId, peerConnection);

            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              chatId,
              success: true,
            });

            this.sendToRenderer('transport:peerConnected', chatId, peerConnection.peerInfo);
            this.setupMessageHandler(peerConnection);
          } else {
            console.warn('🌐 TransportManager: Invalid handshake, closing socket');
            socket.destroy();
          }
          return;
        }

        if (message?.type === 'chat_message' && this.validatePayload(message?.payload)) {
          this.sendToRenderer('transport:message', (tempConnection as PeerConnection).chatId!, message.payload);
        } else if (message?.type === 'signal' && this.validateSignal(message?.payload)) {
          this.sendToRenderer('transport:signal', (tempConnection as PeerConnection).chatId!, message.payload);
        } else {
          console.warn('🌐 TransportManager: Dropping unexpected or oversized message');
        }
      } catch (err) {
        console.error('🌐 TransportManager: Error processing message:', err);
        socket.destroy();
      }
    };

    socket.on('data', (chunk) => this.handleSocketData(socket, chunk, onMessage));

    socket.on('error', (error) => {
      console.error('🌐 TransportManager: Socket error:', error);
    });

    socket.on('close', () => {
      console.log('🌐 TransportManager: Incoming connection closed');
      for (const [connectionChatId, connection] of this.connections.entries()) {
        if (connection.socket === socket) {
          this.connections.delete(connectionChatId);
          this.sendToRenderer('transport:peerDisconnected', connectionChatId);
          break;
        }
      }
    });
  }

  async connectToPeer(address: string, port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const socket = connect(port, address);
      this.attachSocketGuards(socket);

      socket.on('connect', () => {
        console.log(`🌐 TransportManager: Connected to peer at ${address}:${port}`);
        this.writeJSON(socket, {
          type: 'handshake',
          protocol: PROTOCOL_VERSION,
          peerId: crypto.randomUUID(),
          peerName: 'Anonymous User',
          publicKey: 'temp-public-key',
          psk: PSK_HASH,
        });
      });

      const onMessage = (message: any) => {
        try {
          if (message?.type === 'handshake_response' && message?.success === true) {
            const peerConnection: PeerConnection = {
              chatId: message.chatId,
              socket,
              peerInfo: {
                id: crypto.randomUUID(),
                name: 'Remote Peer',
                publicKey: 'temp-public-key',
                address: `${address}:${port}`,
              },
              authenticated: true,
            };

            this.connections.set(message.chatId, peerConnection);
            this.setupMessageHandler(peerConnection);
            this.sendToRenderer('transport:peerConnected', message.chatId, peerConnection.peerInfo);
            resolve(true);
          }
        } catch (error) {
          console.error('🌐 TransportManager: Error handling response:', error);
          socket.destroy();
          reject(error);
        }
      };

      socket.on('data', (chunk) => this.handleSocketData(socket, chunk, onMessage));

      socket.on('error', (error) => {
        console.error('🌐 TransportManager: Connection error:', error);
        reject(error);
      });

      socket.on('close', () => {
        console.log('🌐 TransportManager: Connection closed');
        for (const [connectionChatId, conn] of this.connections.entries()) {
          if (conn.socket === socket) {
            this.connections.delete(connectionChatId);
            this.sendToRenderer('transport:peerDisconnected', connectionChatId);
            break;
          }
        }
      });

      const connectionTimeout = setTimeout(() => {
        socket.destroy(new Error('Connection timeout'));
        reject(new Error('Connection timeout'));
      }, 10_000);

      socket.on('connect', () => clearTimeout(connectionTimeout));
      socket.on('error', () => clearTimeout(connectionTimeout));
    });
  }

  private setupMessageHandler(connection: PeerConnection) {
    const onMessage = (message: any) => {
      try {
        if (message?.type === 'chat_message' && this.validatePayload(message?.payload)) {
          this.sendToRenderer('transport:message', connection.chatId, message.payload);
        } else if (message?.type === 'signal' && this.validateSignal(message?.payload)) {
          this.sendToRenderer('transport:signal', connection.chatId, message.payload);
        } else {
          console.warn(`🌐 TransportManager: Dropping invalid message on chat ${connection.chatId}`);
        }
      } catch (error) {
        console.error('🌐 TransportManager: Error handling message:', error);
        this.connections.delete(connection.chatId);
        this.sendToRenderer('transport:peerDisconnected', connection.chatId);
        connection.socket.destroy();
      }
    };

    connection.socket.removeAllListeners('data');
    connection.socket.on('data', (chunk) => this.handleSocketData(connection.socket, chunk, onMessage));

    connection.socket.on('error', (error) => {
      console.error(`🌐 TransportManager: Connection error for chat ${connection.chatId}:`, error);
      this.connections.delete(connection.chatId);
      this.sendToRenderer('transport:peerDisconnected', connection.chatId);
    });

    connection.socket.on('close', () => {
      console.log(`🌐 TransportManager: Connection closed for chat ${connection.chatId}`);
      this.connections.delete(connection.chatId);
      this.sendToRenderer('transport:peerDisconnected', connection.chatId);
    });
  }

  private validateHandshake(msg: any): boolean {
    if (!msg || msg.type !== 'handshake') return false;
    if (msg.protocol !== PROTOCOL_VERSION) return false;
    if (PSK_HASH && msg.psk !== PSK_HASH) {
      console.warn('🌐 TransportManager: PSK mismatch');
      return false;
    }
    if (typeof msg.peerId !== 'string') return false;
    if (msg.publicKey && typeof msg.publicKey !== 'string') return false;
    return true;
  }

  private validatePayload(payload: any): boolean {
    try {
      const json = JSON.stringify(payload);
      if (Buffer.byteLength(json, 'utf8') > MAX_MESSAGE_BYTES) return false;

      if (payload?.type === 'image' && payload?.imageData?.data) {
        const approxBytes = Math.ceil((payload.imageData.data.length * 3) / 4);
        if (approxBytes > MAX_MESSAGE_BYTES) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private validateSignal(payload: any): boolean {
    if (!payload || typeof payload !== 'object') return false;
    if (payload.action === 'typing' || payload.action === 'stop_typing') return true;
    if (payload.action === 'read' && typeof payload.lastSeenTs === 'number') return true;
    return false;
  }

  private handleSocketData(socket: Socket, chunk: Buffer, onMessage: (msg: any) => void): void {
    let buffer = this.readBuffers.get(socket) || Buffer.alloc(0);
    buffer = Buffer.concat([buffer, chunk]);

    if (buffer.length > MAX_MESSAGE_BYTES * 2) {
      console.warn('🌐 TransportManager: Buffer limit exceeded, destroying socket');
      socket.destroy();
      return;
    }

    let index: number;
    while ((index = buffer.indexOf(0x0a)) !== -1) { // '\n'
      const line = buffer.slice(0, index).toString('utf8').trim();
      buffer = buffer.slice(index + 1);
      if (!line) continue;

      if (Buffer.byteLength(line, 'utf8') > MAX_MESSAGE_BYTES) {
        console.warn('🌐 TransportManager: Message too large, destroying socket');
        socket.destroy();
        return;
      }

      try {
        const msg = JSON.parse(line);
        onMessage(msg);
      } catch {
        console.warn('🌐 TransportManager: Invalid JSON, destroying socket');
        socket.destroy();
        return;
      }
    }

    this.readBuffers.set(socket, buffer);
  }

  private writeJSON(socket: Socket, obj: unknown): void {
    const data = Buffer.from(JSON.stringify(obj) + '\n', 'utf8');
    if (!socket.write(data)) {
      socket.once('drain', () => {
        // backpressure relieved
      });
    }
  }

  async sendMessage(chatId: string, data: unknown): Promise<boolean> {
    const connection = this.connections.get(chatId);
    if (!connection) {
      console.error('🌐 TransportManager: No connection found for chat:', chatId);
      return false;
    }
    if (!connection.authenticated) {
      console.error('🌐 TransportManager: Connection not authenticated for chat:', chatId);
      return false;
    }
    if (!this.validatePayload(data)) {
      console.warn('🌐 TransportManager: Outgoing payload rejected');
      return false;
    }

    try {
      const message = { type: 'chat_message', timestamp: Date.now(), payload: data };
      this.writeJSON(connection.socket, message);
      console.log(`🌐 TransportManager: Message sent to chat ${chatId}`);
      return true;
    } catch (error) {
      console.error('🌐 TransportManager: Error sending message:', error);
      return false;
    }
  }

  async sendSignal(
    chatId: string,
    data: { action: 'typing' | 'stop_typing' | 'read'; lastSeenTs?: number }
  ): Promise<boolean> {
    const connection = this.connections.get(chatId);
    if (!connection) return false;
    if (!this.validateSignal(data)) return false;

    try {
      const envelope = { type: 'signal', timestamp: Date.now(), payload: data };
      this.writeJSON(connection.socket, envelope);
      return true;
    } catch (error) {
      console.error('🌐 TransportManager: Error sending signal:', error);
      return false;
    }
  }

  async disconnectPeer(chatId: string): Promise<void> {
    const connection = this.connections.get(chatId);
    if (connection) {
      console.log(`🌐 TransportManager: Disconnecting peer for chat ${chatId}`);
      connection.socket.destroy();
      this.connections.delete(chatId);
      this.sendToRenderer('transport:peerDisconnected', chatId);
    } else {
      console.warn(`🌐 TransportManager: No connection found to disconnect for chat ${chatId}`);
    }
  }

  private sendToRenderer(channel: string, ...args: unknown[]) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    });
  }

  getConnectedPeers(): Array<{ chatId: string; peerInfo: PeerConnection['peerInfo'] }> {
    return Array.from(this.connections.entries()).map(([chatId, connection]) => ({
      chatId,
      peerInfo: connection.peerInfo,
    }));
  }

  getServerInfo(): { port: number; address: string } | null {
    if (!this.server) return null;
    return { port: this.serverPort, address: this.serverAdvertisedAddress || this.serverAddress };
    }

  isServerRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  async cleanup(): Promise<void> {
    console.log('🌐 TransportManager: Starting cleanup...');
    for (const [chatId, connection] of this.connections.entries()) {
      console.log(`🌐 TransportManager: Closing connection for chat ${chatId}`);
      connection.socket.destroy();
    }
    this.connections.clear();

    if (this.server) {
      await new Promise<void>((resolve) => {
        if (this.server?.listening) {
          this.server.close(() => {
            console.log('🌐 TransportManager: Server closed');
            resolve();
          });
        } else {
          resolve();
        }
      });
      this.server = null;
      this.serverPort = 0;
      this.serverAddress = '';
      this.serverAdvertisedAddress = '';
    }
    console.log('🌐 TransportManager: Cleanup completed');
  }
}