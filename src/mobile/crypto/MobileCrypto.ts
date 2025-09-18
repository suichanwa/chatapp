export class MobileCrypto {
  async generateKeys(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      // Use Web Crypto API for mobile
      if (!crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }

      // Generate RSA key pair using Web Crypto API
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Export keys
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      // Convert to base64 strings
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
      const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

      return {
        publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`
      };
    } catch (error) {
      console.error('MobileCrypto: Failed to generate keys:', error);
      throw error;
    }
  }
}