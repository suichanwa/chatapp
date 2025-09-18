import { EventBus } from '../Utils/EventBus';
import type { Component } from '../../types/components';
import type { IdentityKeys, EncryptedData } from '../../../types/electron';

export class CryptoManager implements Component {
  private eventBus = EventBus.getInstance();
  private identityKeys: IdentityKeys | null = null;

  async initialize(): Promise<void> {
    this.setupEventListeners();
    await this.initializeCrypto();
  }

  private setupEventListeners(): void {
    // Listen for modal requests
    this.eventBus.on('crypto:get-public-key', this.handleGetPublicKey.bind(this));
  }

  private handleGetPublicKey(): void {
    if (this.identityKeys) {
      this.eventBus.emit('crypto:identity-ready', this.identityKeys.publicKey);
    }
  }

  private async initializeCrypto(): Promise<void> {
    try {
      if (typeof window.electronAPI === 'undefined') {
        throw new Error('ElectronAPI not available - preload script may not be loaded');
      }

      if (!window.electronAPI.crypto) {
        throw new Error('Crypto API not available');
      }

      this.eventBus.emit('status:updated', {
        step: 'Crypto Initialization',
        status: 'pending',
        message: 'Generating identity keys...',
        timestamp: Date.now()
      });
      
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Crypto initialization timeout')), 10000)
      );

      const cryptoPromise = window.electronAPI.crypto.generateIdentity();
      
      this.identityKeys = await Promise.race([cryptoPromise, timeout]);
      
      this.eventBus.emit('status:updated', {
        step: 'Crypto Initialization',
        status: 'success',
        message: `Generated ${this.identityKeys.publicKey.length} char public key`,
        timestamp: Date.now()
      });

      // Notify modal that identity is ready
      this.eventBus.emit('crypto:identity-ready', this.identityKeys.publicKey);
      
    } catch (error) {
      console.error('Failed to initialize crypto:', error);
      this.eventBus.emit('status:updated', {
        step: 'Crypto Initialization',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  getIdentityKeys(): IdentityKeys | null {
    return this.identityKeys;
  }

  async encrypt(data: string, publicKey: string): Promise<EncryptedData> {
    if (!window.electronAPI?.crypto) {
      throw new Error('Crypto API not available');
    }
    return await window.electronAPI.crypto.encrypt(data, publicKey);
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!window.electronAPI?.crypto) {
      throw new Error('Crypto API not available');
    }
    return await window.electronAPI.crypto.decrypt(encryptedData);
  }

  cleanup(): void {
    this.eventBus.off('crypto:get-public-key', this.handleGetPublicKey.bind(this));
  }
}