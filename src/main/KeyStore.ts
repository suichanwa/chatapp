import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface IdentityKeys {
  publicKey: string;
  privateKey: string;
}

export class KeyStore {
  private memoryKeys: Map<string, any> = new Map();
  private keyDir: string;

  constructor() {
    this.keyDir = path.join(os.tmpdir(), 'secure-chat-keys');
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(this.keyDir);
    } catch {
      await fs.mkdir(this.keyDir, { recursive: true });
    }
  }

  async saveIdentityKeys(keys: IdentityKeys): Promise<void> {
    // Store in memory for this session
    this.memoryKeys.set('identity', keys);
    
    // Optionally save encrypted to temp directory
    const encrypted = this.encryptForStorage(JSON.stringify(keys));
    const keyPath = path.join(this.keyDir, 'identity.key');
    await fs.writeFile(keyPath, encrypted);
  }

  async getIdentityKeys(): Promise<IdentityKeys | null> {
    // First check memory
    const memoryKeys = this.memoryKeys.get('identity');
    if (memoryKeys) {
      return memoryKeys;
    }

    // Try to load from temp storage
    try {
      const keyPath = path.join(this.keyDir, 'identity.key');
      const encrypted = await fs.readFile(keyPath, 'utf8');
      const decrypted = this.decryptFromStorage(encrypted);
      const keys = JSON.parse(decrypted);
      this.memoryKeys.set('identity', keys);
      return keys;
    } catch {
      return null;
    }
  }

  async cleanup(): Promise<void> {
    // Clear memory
    this.memoryKeys.clear();
    
    // Remove temp files
    try {
      await fs.rm(this.keyDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }

  private encryptForStorage(data: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16);  // 128 bits for AES
    
    // Use the modern createCipheriv method
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return key:iv:encrypted format
    return `${key.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
  }

  private decryptFromStorage(encryptedData: string): string {
    const [keyHex, ivHex, encrypted] = encryptedData.split(':');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    
    // Use the modern createDecipheriv method
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}