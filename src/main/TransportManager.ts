import { ipcMain, BrowserWindow } from 'electron';
import { createServer, connect, Server, Socket } from 'net';
import crypto from 'node:crypto';

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

export class TransportManager {
  private server: Server | null = null;
  private connections: Map<string, PeerConnection> = new Map();
  private serverPort = 0; // Fixed: Removed inferrable type annotation
  private serverAddress = ''; // Fixed: Removed inferrable type annotation

  constructor() {
    this.setupIPC();
  }

  private setupIPC() {
    ipcMain.handle('transport:startServer', async (_, port?: number) => {
      return this.startServer(port);
    });

    ipcMain.handle('transport:connect', async (_, address: string, port: number) => {
      return this.connectToPeer(address, port);
    });

    ipcMain.handle('transport:send', async (_, chatId: string, data: unknown) => {
      return this.sendMessage(chatId, data);
    });

    ipcMain.handle('transport:disconnect', async (_, chatId: string) => {
      return this.disconnectPeer(chatId);
    });
  }

  async startServer(port = 0): Promise<{ port: number; address: string }> { // Fixed: Removed inferrable type annotation
    return new Promise((resolve, reject) => {
      this.server = createServer();

      this.server.on('connection', (socket) => {
        this.handleIncomingConnection(socket);
      });

      this.server.on('error', (error) => {
        console.error('🌐 TransportManager: Server error:', error);
        reject(error);
      });

      this.server.listen(port, '127.0.0.1', () => {
        const address = this.server?.address(); // Fixed: Use optional chaining instead of non-null assertion
        if (address && typeof address === 'object') {
          this.serverPort = address.port;
          this.serverAddress = address.address;
          console.log(`🌐 TransportManager: Server listening on ${this.serverAddress}:${this.serverPort}`);
          resolve({ port: this.serverPort, address: this.serverAddress });
        } else {
          reject(new Error('Failed to get server address'));
        }
      });
    });
  }

  private handleIncomingConnection(socket: Socket) {
    console.log('🌐 TransportManager: Incoming connection from', socket.remoteAddress);

    // Fixed: Use const instead of let since it's never reassigned
    const tempConnection: Partial<PeerConnection> = {
      socket,
      authenticated: false
    };

    // Set up message handler for handshake
    socket.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'handshake' && !tempConnection.authenticated) {
          // Handle initial handshake
          const chatId = crypto.randomUUID();
          const peerConnection: PeerConnection = {
            chatId,
            socket,
            peerInfo: {
              id: message.peerId,
              name: message.peerName,
              publicKey: message.publicKey,
              address: socket.remoteAddress || 'unknown'
            },
            authenticated: true
          };

          this.connections.set(chatId, peerConnection);
          
          // Send handshake response
          socket.write(JSON.stringify({
            type: 'handshake_response',
            chatId,
            success: true
          }));

          // Notify renderer
          this.sendToRenderer('transport:peerConnected', chatId, peerConnection.peerInfo);
          
          // Set up message handler for this connection
          this.setupMessageHandler(peerConnection);
        }
      } catch (error) {
        console.error('🌐 TransportManager: Error handling incoming data:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('🌐 TransportManager: Socket error:', error);
    });

    socket.on('close', () => {
      console.log('🌐 TransportManager: Incoming connection closed');
      // Clean up any temporary connections
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
      // Fixed: Store the chatId in a scoped variable to be used later
      let pendingChatId: string | null = null;

      socket.on('connect', () => {
        console.log(`🌐 TransportManager: Connected to peer at ${address}:${port}`);
        
        // Generate a temporary ID for tracking this connection attempt
        pendingChatId = crypto.randomUUID();
        
        // Send handshake
        socket.write(JSON.stringify({
          type: 'handshake',
          peerId: crypto.randomUUID(),
          peerName: 'Anonymous User', // We'll get this from user input later
          publicKey: 'temp-public-key' // We'll get this from crypto engine
        }));
      });

      socket.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'handshake_response' && message.success) {
            const peerConnection: PeerConnection = {
              chatId: message.chatId,
              socket,
              peerInfo: {
                id: crypto.randomUUID(),
                name: 'Remote Peer',
                publicKey: 'temp-public-key',
                address: `${address}:${port}`
              },
              authenticated: true
            };

            this.connections.set(message.chatId, peerConnection);
            this.setupMessageHandler(peerConnection);
            
            // Notify renderer
            this.sendToRenderer('transport:peerConnected', message.chatId, peerConnection.peerInfo);
            
            resolve(true);
          }
        } catch (error) {
          console.error('🌐 TransportManager: Error handling response:', error);
          reject(error);
        }
      });

      socket.on('error', (error) => {
        console.error('🌐 TransportManager: Connection error:', error);
        reject(error);
      });

      socket.on('close', () => {
        console.log('🌐 TransportManager: Connection closed');
        // Clean up connection
        for (const [connectionChatId, conn] of this.connections.entries()) {
          if (conn.socket === socket) {
            this.connections.delete(connectionChatId);
            this.sendToRenderer('transport:peerDisconnected', connectionChatId);
            break;
          }
        }
      });

      // Set a timeout for connection attempts
      const connectionTimeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, 10000); // 10 second timeout

      socket.on('connect', () => {
        clearTimeout(connectionTimeout);
      });

      socket.on('error', () => {
        clearTimeout(connectionTimeout);
      });
    });
  }

  private setupMessageHandler(connection: PeerConnection) {
    connection.socket.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Forward message to renderer
          this.sendToRenderer('transport:message', connection.chatId, message.payload);
        }
      } catch (error) {
        console.error('🌐 TransportManager: Error handling message:', error);
      }
    });

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

    try {
      const message = {
        type: 'chat_message',
        timestamp: Date.now(),
        payload: data
      };

      connection.socket.write(JSON.stringify(message));
      console.log(`🌐 TransportManager: Message sent to chat ${chatId}`);
      return true;
    } catch (error) {
      console.error('🌐 TransportManager: Error sending message:', error);
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
    windows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    });
  }

  getConnectedPeers(): Array<{ chatId: string; peerInfo: PeerConnection['peerInfo'] }> {
    return Array.from(this.connections.entries()).map(([chatId, connection]) => ({
      chatId,
      peerInfo: connection.peerInfo
    }));
  }

  getServerInfo(): { port: number; address: string } | null {
    if (this.server && this.serverPort > 0) {
      return { port: this.serverPort, address: this.serverAddress };
    }
    return null;
  }

  isServerRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  async cleanup(): Promise<void> {
    console.log('🌐 TransportManager: Starting cleanup...');
    
    // Close all connections
    for (const [chatId, connection] of this.connections.entries()) {
      console.log(`🌐 TransportManager: Closing connection for chat ${chatId}`);
      connection.socket.destroy();
    }
    this.connections.clear();

    // Close server
    if (this.server) {
      return new Promise<void>((resolve) => {
        if (this.server?.listening) {
          this.server.close(() => {
            console.log('🌐 TransportManager: Server closed');
            this.server = null;
            this.serverPort = 0;
            this.serverAddress = '';
            resolve();
          });
        } else {
          this.server = null;
          this.serverPort = 0;
          this.serverAddress = '';
          resolve();
        }
      });
    }
    
    console.log('🌐 TransportManager: Cleanup completed');
  }
}