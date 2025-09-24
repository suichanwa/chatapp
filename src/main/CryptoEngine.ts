import crypto from 'node:crypto';
import { KeyStore } from './KeyStore';
import type { IdentityKeys, EncryptedData } from '../types'; // Import from main types

export class CryptoEngine {
  private keyStore: KeyStore;
  private identityKeys: IdentityKeys | null = null;

  constructor(keyStore: KeyStore) {
    this.keyStore = keyStore;
  }

  async initialize(): Promise<void> {
    // Load existing identity or generate new one
    this.identityKeys = await this.keyStore.getIdentityKeys() || await this.generateIdentity();
  }

  async generateIdentity(): Promise<IdentityKeys> {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    const identityKeys = { publicKey, privateKey };
    await this.keyStore.saveIdentityKeys(identityKeys);
    this.identityKeys = identityKeys;
    
    return identityKeys;
  }

  async encrypt(data: string, recipientPublicKey: string): Promise<EncryptedData> {
    if (!this.identityKeys) {
      throw new Error('Identity keys not initialized');
    }

    // Generate session key for AES encryption
    const sessionKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16); // 128 bits for AES
    const algorithm = 'aes-256-cbc';
    
    // Use modern createCipheriv method
    const cipher = crypto.createCipheriv(algorithm, sessionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Encrypt session key with recipient's public key
    const encryptedSessionKey = crypto.publicEncrypt(
      recipientPublicKey,
      sessionKey
    );

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: '', // Not used with CBC mode
      sessionKey: encryptedSessionKey.toString('base64')
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.identityKeys) {
      throw new Error('Identity keys not initialized');
    }

    if (!encryptedData.sessionKey) {
      throw new Error('Session key missing from encrypted data');
    }

    // Decrypt session key with our private key
    const sessionKey = crypto.privateDecrypt(
      this.identityKeys.privateKey,
      Buffer.from(encryptedData.sessionKey, 'base64')
    );

    // Decrypt data with AES using modern createDecipheriv
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, sessionKey, iv);
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async getPublicKey(): Promise<string | null> {
    if (!this.identityKeys) {
      await this.initialize();
    }
    return this.identityKeys?.publicKey || null;
  }
}