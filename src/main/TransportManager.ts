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

// Per‑IP handshake rate limit
const RATE_WINDOW_MS = 60_000;            // 1 minute window
const MAX_HANDSHAKES_PER_WINDOW = 20;     // max unauthenticated handshakes per IP / minute

const BIND_HOST = process.env.CHATAPP_BIND_HOST || '127.0.0.1'; // Changed to localhost for security
// Optional PSK: if set on both peers, handshake must include matching hash
const PSK_HASH = process.env.CHATAPP_PSK
  ? crypto.createHash('sha256').update(process.env.CHATAPP_PSK).digest('hex')
  : null;

// Default port range for dynamic/private ports
const DEFAULT_PORT_RANGE = {
  min: 49152, // Start of dynamic/private port range
  max: 65535  // End of dynamic/private port range
};

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

  // Enforce single active peer
  private singlePeerMode = true;
  private allowedPeerAddress: string | null = null;

  // NEW: runtime PSK (defaults to env value)
  private pskHash: string | null = PSK_HASH;

  // NEW: simple per‑IP handshake counters
  private handshakeCounters: Map<string, { count: number; windowStart: number }> = new Map();

  // NEW: prevent concurrent starts
  private startingPromise: Promise<{ port: number; address: string }> | null = null;

  constructor() {
    this.setupIPC();
  }

  private setupIPC() {
    ipcMain.handle('transport:startServer', async (_e, port?: number) => {
      // Don't use default port anymore - always use random if not specified
      return this.startServer(port);
    });

    // Return a structured result instead of throwing
    ipcMain.handle('transport:connect', async (_e, address: string, port: number) => {
      try {
        return await this.connectToPeer(address, port);
      } catch (err) {
        return { ok: false, reason: 'network' as const };
      }
    });

    // NEW: toggle public mode (allow multiple peers)
    ipcMain.handle('transport:setPublicMode', async (_e, enabled: boolean) => {
      this.singlePeerMode = !enabled;
      if (this.server) {
        this.server.maxConnections = this.singlePeerMode ? 1 : MAX_CONNECTIONS;
      }
      if (!this.singlePeerMode) {
        // Clear any sticky allowlist when switching to public mode
        this.allowedPeerAddress = null;
      }
      return true;
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

    // NEW: runtime security controls
    ipcMain.handle('transport:setPSK', async (_e, psk: string | null) => {
      if (psk && psk.length > 0) {
        this.pskHash = crypto.createHash('sha256').update(psk).digest('hex');
      } else {
        this.pskHash = null;
      }
      return true;
    });
    ipcMain.handle('transport:allowOnly', async (_e, address: string | null) => {
      this.allowedPeerAddress = address && address.length ? address : null;
      return true;
    });
  }

  async startServer(port?: number): Promise<{ port: number; address: string }> {
    // If already starting, await same promise
    if (this.startingPromise) return this.startingPromise;

    // If already running, return current info
    if (this.server && this.server.listening) {
      return { port: this.serverPort, address: this.serverAdvertisedAddress || this.serverAddress };
    }

    // Use random port by default for better security and testing
    let preferred: number;
    if (typeof port === 'number' && port > 0) {
      preferred = port;
    } else {
      const envPort = Number(process.env.CHATAPP_PORT);
      if (envPort > 0) {
        preferred = envPort;
      } else {
        // Generate random port in safe range by default
        preferred = this.getRandomPort();
      }
    }

    console.log(`🌐 TransportManager: Attempting to start server on port ${preferred}...`);

    const listenOnce = (p: number): Promise<{ port: number; address: string }> =>
      new Promise((resolve, reject) => {
        const server = createServer();
        server.maxConnections = this.singlePeerMode ? 1 : MAX_CONNECTIONS;

        server.on('connection', (socket) => {
          this.attachSocketGuards(socket);
          this.handleIncomingConnection(socket);
        });

        server.on('error', (err: any) => {
          if (err?.code === 'EADDRINUSE') {
            // Always try random ports on conflict
            console.warn(`🌐 TransportManager: Port ${p} in use, trying random port...`);
            server.close(() => {
              const randomPort = this.getRandomPort();
              listenOnce(randomPort).then(resolve).catch(reject);
            });
            return;
          }
          console.error('🌐 TransportManager: Server error:', err);
          reject(err);
        });

        server.listen(p, BIND_HOST, () => {
          const addressInfo = server.address();
          if (!addressInfo || typeof addressInfo !== 'object') {
            reject(new Error('Failed to get server address'));
            return;
          }
          this.server = server;
          this.serverPort = addressInfo.port;
          this.serverAddress = addressInfo.address;
          this.serverAdvertisedAddress = getLocalIPv4() || this.serverAddress;

          // Reset single-peer lock (fix sticky allowlist from previous sessions)
          this.allowedPeerAddress = null;

          console.log(
            `🌐 TransportManager: Server listening on ${this.serverAddress}:${this.serverPort} (advertising ${this.serverAdvertisedAddress})`
          );
          resolve({ port: this.serverPort, address: this.serverAdvertisedAddress });
        });
      });

    this.startingPromise = listenOnce(preferred).finally(() => {
      this.startingPromise = null;
    });

    return this.startingPromise;
  }

  private attachSocketGuards(socket: Socket): void {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, KEEPALIVE_MS);
    socket.setTimeout(READ_IDLE_TIMEOUT_MS, () => {
      console.warn('🌐 TransportManager: Socket idle timeout, destroying');
      socket.destroy();
    });
  }

  // NEW: constant-time PSK check (supports env PSK or runtime PSK)
  private checkPSK(psk: unknown): boolean {
    const expected = this.pskHash || PSK_HASH;
    if (!expected) return true; // PSK not enforced
    if (typeof psk !== 'string' || typeof expected !== 'string') return false;

    try {
      const a = Buffer.from(psk, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  // NEW: simple per‑IP handshake rate limiter
  private allowHandshake(ip: string | undefined | null): boolean {
    const key = ip || 'unknown';
    const now = Date.now();
    const entry = this.handshakeCounters.get(key);
    if (!entry) {
      this.handshakeCounters.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (now - entry.windowStart > RATE_WINDOW_MS) {
      entry.count = 1;
      entry.windowStart = now;
      return true;
    }
    entry.count += 1;
    if (entry.count > MAX_HANDSHAKES_PER_WINDOW) {
      return false;
    }
    return true;
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
          // Rate limit unauthenticated handshakes per IP
          if (!this.allowHandshake(socket.remoteAddress)) {
            console.warn('🚫 Handshake rate limit exceeded for', socket.remoteAddress);
            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              success: false,
              error: 'rate_limited',
            });
            socket.destroy();
            return;
          }

          // 1) Validate handshake
          if (!this.validateHandshake(message)) {
            console.warn('🚫 Invalid handshake from', socket.remoteAddress);
            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              success: false,
              error: 'bad_handshake',
            });
            socket.destroy();
            return;
          }

          // 2) PSK enforcement (constant-time compare)
          if (!this.checkPSK((message as any)?.psk)) {
            console.warn('🚫 Handshake rejected: invalid PSK from', socket.remoteAddress);
            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              success: false,
              error: 'unauthorized',
            });
            socket.destroy();
            return;
          }

          // 3) Optional allowlist (pre-locked address)
          if (this.allowedPeerAddress && socket.remoteAddress !== this.allowedPeerAddress) {
            console.warn(`🚫 Rejecting connection from ${socket.remoteAddress}: allowlist set to ${this.allowedPeerAddress}`);
            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              success: false,
              error: 'occupied',
            });
            socket.destroy();
            return;
          }

          // 4) Single‑peer lock
          if (this.singlePeerMode && this.connections.size > 0) {
            if (!this.allowedPeerAddress) {
              const firstConn = Array.from(this.connections.values())[0];
              this.allowedPeerAddress = firstConn?.peerInfo?.address || socket.remoteAddress || null;
            }
            const remote = socket.remoteAddress || 'unknown';
            if (remote !== this.allowedPeerAddress) {
              console.warn(`🚫 Rejecting connection from ${remote}: room occupied by ${this.allowedPeerAddress}`);
              this.writeJSON(socket, {
                type: 'handshake_response',
                protocol: PROTOCOL_VERSION,
                success: false,
                error: 'occupied',
              });
              socket.destroy();
              return;
            }
            console.warn(`🚫 Rejecting duplicate connection from ${remote}: already connected`);
            this.writeJSON(socket, {
              type: 'handshake_response',
              protocol: PROTOCOL_VERSION,
              success: false,
              error: 'already_connected',
            });
            socket.destroy();
            return;
          }

          // Success path
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

          if (this.singlePeerMode && !this.allowedPeerAddress) {
            this.allowedPeerAddress = peerConnection.peerInfo.address;
          }

          this.connections.set(chatId, peerConnection);

          this.writeJSON(socket, {
            type: 'handshake_response',
            protocol: PROTOCOL_VERSION,
            chatId,
            success: true,
          });

          // Notify renderer and set up handlers
          this.sendToRenderer('transport:peerConnected', chatId, peerConnection.peerInfo);
          this.setupMessageHandler(peerConnection);
        } else {
          if (message?.type === 'chat_message' && this.validatePayload(message?.payload)) {
            this.sendToRenderer('transport:message', (tempConnection as PeerConnection).chatId!, message.payload);
          } else if (message?.type === 'signal' && this.validateSignal(message?.payload)) {
            this.sendToRenderer('transport:signal', (tempConnection as PeerConnection).chatId!, message.payload);
          } else {
            console.warn('🌐 TransportManager: Dropping invalid post-handshake message');
          }
        }
      } catch (error) {
        console.error('❌ Error handling incoming message:', error);
        socket.destroy();
      }
    };

    // FIX: actually read data from this socket
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

  // Return a structured result with a reason on failure
  async connectToPeer(address: string, port: number): Promise<{ ok: true } | { ok: false; reason: 'occupied' | 'already_connected' | 'unauthorized' | 'rate_limited' | 'bad_handshake' | 'timeout' | 'network' }> {
    if (this.singlePeerMode && this.connections.size > 0) {
      console.warn(`🚫 Outgoing connect blocked: already connected to ${this.allowedPeerAddress}`);
      return { ok: false, reason: 'already_connected' };
    }

    return new Promise((resolve) => {
      const socket = connect(port, address);
      this.attachSocketGuards(socket);

      let done = false;

      const finish = (result: { ok: true } | { ok: false; reason: any }) => {
        if (done) return;
        done = true;
        try { socket.removeListener('data', onData); } catch {}
        try { socket.destroy(); } catch {}
        clearTimeout(connectTimer);
        clearTimeout(handshakeTimer);
        resolve(result);
      };

      const onMessage = (message: any) => {
        try {
          if (message?.type === 'handshake_response') {
            clearTimeout(handshakeTimer);
            if (message?.success === true) {
              const chatId = message.chatId;
              const peerConnection: PeerConnection = {
                chatId,
                socket,
                peerInfo: {
                  id: crypto.randomUUID(),
                  name: 'Remote Peer',
                  publicKey: 'temp-public-key',
                  address,
                },
                authenticated: true,
              };
              if (this.singlePeerMode) this.allowedPeerAddress = address;
              this.connections.set(chatId, peerConnection);
              this.sendToRenderer('transport:peerConnected', chatId, peerConnection.peerInfo);
              this.setupMessageHandler(peerConnection);
              // Ownership of socket transferred to setupMessageHandler
              done = true;
              resolve({ ok: true });
            } else {
              const reason = (message?.error as any) || 'network';
              console.warn('🚫 Handshake rejected by remote:', reason);
              finish({ ok: false, reason });
            }
          }
        } catch (err) {
          console.error('❌ Error during connect handshake:', err);
          finish({ ok: false, reason: 'network' });
        }
      };

      const onData = (chunk: Buffer) => this.handleSocketData(socket, chunk, onMessage);
      socket.on('data', onData);

      socket.on('connect', () => {
        console.log(`🌐 TransportManager: Connected to peer at ${address}:${port}`);
        this.writeJSON(socket, {
          type: 'handshake',
          protocol: PROTOCOL_VERSION,
          peerId: crypto.randomUUID(),
          peerName: 'Anonymous User',
          publicKey: 'temp-public-key',
          psk: this.pskHash || undefined,
        });
        // FIX: handshake response timeout (in case server never replies)
        handshakeTimer = setTimeout(() => {
          if (!done) {
            console.warn('🚫 Transport handshake timeout');
            finish({ ok: false, reason: 'timeout' });
          }
        }, 5_000);
      });

      socket.on('error', (err) => {
        if (!done) console.warn('🚫 Transport connect error (pre-handshake):', err?.message || err);
        finish({ ok: false, reason: 'network' });
      });

      socket.on('close', () => {
        if (!done) console.warn('🚫 Transport connect closed before handshake');
        finish({ ok: false, reason: 'network' });
      });

      // Connection timeout safety (to reach server)
      const connectTimer = setTimeout(() => {
        if (!done) console.warn('🚫 Transport connect timeout');
        finish({ ok: false, reason: 'timeout' });
      }, 10_000);

      // timers cleared in finish(); also clear connectTimer on connect/error/close
      socket.once('connect', () => clearTimeout(connectTimer));
      socket.once('error', () => clearTimeout(connectTimer));
      socket.once('close', () => clearTimeout(connectTimer));

      // declare after usage for TS, actual binding above
      let handshakeTimer: ReturnType<typeof setTimeout>;
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

  // Harden handshake and message parsing path: enforce max JSON size and robust framing
  private handleSocketData(socket: Socket, chunk: Buffer | null, onMessage: (msg: any) => void): void {
    try {
      const prev = this.readBuffers.get(socket) || Buffer.alloc(0);
      const next = chunk ? Buffer.concat([prev, chunk]) : prev;

      // Guard: drop connection if buffer exceeds MAX_MESSAGE_BYTES
      if (next.length > MAX_MESSAGE_BYTES) {
        console.warn('🌐 TransportManager: Incoming buffer exceeded limit, destroying socket');
        this.readBuffers.delete(socket);
        socket.destroy();
        return;
      }

      // Attempt to split by newline-delimited JSON (or fallback to full buffer as one message)
      let buf = next;
      let idx: number;
      while ((idx = buf.indexOf(0x0a)) !== -1) { // '\n'
        const line = buf.subarray(0, idx).toString('utf8').trim();
        buf = buf.subarray(idx + 1);

        if (!line) continue;
        let obj: any;
        try {
          obj = JSON.parse(line);
        } catch {
          console.warn('🌐 TransportManager: Invalid JSON line, dropping');
          continue;
        }
        onMessage(obj);
      }

      // Keep remaining partial data
      this.readBuffers.set(socket, buf);
    } catch (e) {
      console.error('🌐 TransportManager: Error in handleSocketData:', e);
      this.readBuffers.delete(socket);
      try { socket.destroy(); } catch {}
    }
  }

  // Tighten handshake validation
  private validateHandshake(msg: any): boolean {
    if (!msg || msg.type !== 'handshake') return false;
    if (msg.protocol !== PROTOCOL_VERSION) return false;
    if (typeof msg.peerId !== 'string' || msg.peerId.length > 128) return false;
    if (msg.publicKey && typeof msg.publicKey !== 'string') return false;
    if (msg.peerName && typeof msg.peerName !== 'string') return false;
    // PSK is checked with constant-time comparator in checkPSK()
    return true;
  }

  // Tighten payload validation
  private validatePayload(payload: any): boolean {
    if (!payload || typeof payload !== 'object') return false;
    const t = String(payload.type ?? 'text');
    if (!['text', 'image', 'system'].includes(t)) return false;

    const content = typeof payload.content === 'string' ? payload.content : '';
    if (content.length > 10_000) return false; // cap content length

    if (payload.imageData) {
      const img = payload.imageData as { data?: string; filename?: string };
      if (img?.data && typeof img.data === 'string') {
        // base64 length sanity (approximate < 1MB)
        if (img.data.length > 1_400_000) return false;
      }
      if (img?.filename && typeof img.filename !== 'string') return false;
    }

    if (payload.timestamp && typeof payload.timestamp !== 'number') return false;
    if (payload.encrypted && typeof payload.encrypted !== 'boolean') return false;
    return true;
  }

  private validateSignal(payload: any): boolean {
    if (!payload || typeof payload !== 'object') return false;
    const action = String(payload.action ?? '');
    if (!['typing', 'stop_typing', 'read'].includes(action)) return false;
    if (action === 'read' && payload.lastSeenTs && typeof payload.lastSeenTs !== 'number') return false;
    return true;
  }

  private writeJSON(socket: Socket, obj: unknown): void {
    try {
      const line = JSON.stringify(obj) + '\n';
      if (Buffer.byteLength(line, 'utf8') > MAX_MESSAGE_BYTES) {
        console.warn('🌐 TransportManager: Outgoing message too large, not sending');
        return;
      }
      socket.write(line);
    } catch (e) {
      console.error('🌐 TransportManager: Failed to write JSON:', e);
      try { socket.destroy(); } catch {}
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
      const addr = connection.peerInfo?.address || null;
      connection.socket.destroy();
      this.connections.delete(chatId);
      this.sendToRenderer('transport:peerDisconnected', chatId);

      // Unlock the server if the locked peer disconnected
      if (this.singlePeerMode && addr && this.allowedPeerAddress === addr && this.connections.size === 0) {
        this.allowedPeerAddress = null;
      }
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

  // Helper method for generating random ports
  private getRandomPort(min: number = DEFAULT_PORT_RANGE.min, max: number = DEFAULT_PORT_RANGE.max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Enhanced method with retry logic for finding available ports
  private async findAvailablePort(preferredPort?: number, maxRetries: number = 5): Promise<number> {
    const testPort = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const testServer = createServer();
        testServer.listen(port, '127.0.0.1', () => {
          testServer.close(() => resolve(true));
        });
        testServer.on('error', () => resolve(false));
      });
    };

    // Try preferred port first
    if (preferredPort && await testPort(preferredPort)) {
      return preferredPort;
    }

    // Try random ports
    for (let i = 0; i < maxRetries; i++) {
      const randomPort = this.getRandomPort();
      if (await testPort(randomPort)) {
        return randomPort;
      }
    }

    // Fallback to system-assigned port
    return 0;
  }
}