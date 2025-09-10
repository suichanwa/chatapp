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
  private serverPort: number = 0;
  private serverAddress: string = '';

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

  async startServer(port: number = 0): Promise<{ port: number; address: string }> {
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
        const address = this.server!.address();
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

    const tempId = crypto.randomUUID();
    let tempConnection: Partial<PeerConnection> = {
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
    });
  }

  async connectToPeer(address: string, port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const socket = connect(port, address);
      const chatId = crypto.randomUUID();

      socket.on('connect', () => {
        console.log(`🌐 TransportManager: Connected to peer at ${address}:${port}`);
        
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
        for (const [chatId, conn] of this.connections.entries()) {
          if (conn.socket === socket) {
            this.connections.delete(chatId);
            this.sendToRenderer('transport:peerDisconnected', chatId);
            break;
          }
        }
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
  }

  async sendMessage(chatId: string, data: unknown): Promise<boolean> {
    const connection = this.connections.get(chatId);
    if (!connection) {
      console.error('🌐 TransportManager: No connection found for chat:', chatId);
      return false;
    }

    try {
      const message = {
        type: 'chat_message',
        timestamp: Date.now(),
        payload: data
      };

      connection.socket.write(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('🌐 TransportManager: Error sending message:', error);
      return false;
    }
  }

  async disconnectPeer(chatId: string): Promise<void> {
    const connection = this.connections.get(chatId);
    if (connection) {
      connection.socket.destroy();
      this.connections.delete(chatId);
      this.sendToRenderer('transport:peerDisconnected', chatId);
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

  async cleanup(): Promise<void> {
    // Close all connections
    for (const connection of this.connections.values()) {
      connection.socket.destroy();
    }
    this.connections.clear();

    // Close server
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}