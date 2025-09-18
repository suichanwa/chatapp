import { session } from 'electron';

export type PermissionType = 
  | 'crypto' 
  | 'storage' 
  | 'network' 
  | 'notifications'
  | 'microphone'
  | 'camera'
  | 'geolocation'
  | 'midi'
  | 'push-messaging'
  | 'background-sync';

interface PermissionRequest {
  webContents: Electron.WebContents;
  permission: string;
  callback: (granted: boolean) => void;
  requestDetails: Electron.PermissionRequestHandlerHandlerDetails;
  timestamp: number;
}

export class PermissionBroker {
  private grantedPermissions: Set<string> = new Set();
  private deniedPermissions: Set<string> = new Set();
  private pendingRequests: Map<string, PermissionRequest> = new Map();
  private trustedOrigins: Set<string> = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://localhost:5173',
    'file://'
  ]);
  private sessionHandlersSetup = false;

  constructor() {
    // Don't setup session handlers in constructor - wait for app to be ready
    console.log('🛡️ PermissionBroker: Instance created, waiting for app ready to setup session handlers');
  }

  // Call this method after app is ready
  public setupSessionHandlers(): void {
    if (this.sessionHandlersSetup) {
      console.log('🛡️ PermissionBroker: Session handlers already setup');
      return;
    }

    try {
      // Set up permission handler for the default session
      session.defaultSession.setPermissionRequestHandler(
        (webContents, permission, callback, details) => {
          this.handlePermissionRequest(webContents, permission, callback, details);
        }
      );

      // Also handle permission check requests (for already granted permissions)
      session.defaultSession.setPermissionCheckHandler(
        (webContents, permission, requestingOrigin, details) => {
          return this.checkPermission(permission, requestingOrigin, details);
        }
      );

      this.sessionHandlersSetup = true;
      console.log('🛡️ PermissionBroker: Session permission handlers configured');
    } catch (error) {
      console.error('🛡️ PermissionBroker: Failed to setup session handlers:', error);
      throw error;
    }
  }

  private handlePermissionRequest(
    webContents: Electron.WebContents,
    permission: string,
    callback: (granted: boolean) => void,
    details: Electron.PermissionRequestHandlerHandlerDetails
  ): void {
    const url = webContents.getURL();
    const requestId = `${permission}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🛡️ PermissionBroker: Permission request for "${permission}" from ${url}`, details);

    try {
      const parsedUrl = new URL(url);
      
      // Automatically deny certain permissions for security
      if (this.shouldDenyPermission(permission, parsedUrl)) {
        console.log(`🛡️ PermissionBroker: Auto-denied permission "${permission}" from ${parsedUrl.origin}`);
        callback(false);
        return;
      }

      // Check if origin is trusted
      if (!this.isTrustedOrigin(parsedUrl.origin)) {
        console.log(`🛡️ PermissionBroker: Denied permission "${permission}" from untrusted origin: ${parsedUrl.origin}`);
        callback(false);
        return;
      }

      // Handle specific permissions
      const granted = this.evaluatePermissionRequest(permission, parsedUrl, details);
      
      if (granted) {
        this.grantedPermissions.add(`${parsedUrl.origin}:${permission}`);
        console.log(`🛡️ PermissionBroker: Granted permission "${permission}" to ${parsedUrl.origin}`);
      } else {
        this.deniedPermissions.add(`${parsedUrl.origin}:${permission}`);
        console.log(`🛡️ PermissionBroker: Denied permission "${permission}" to ${parsedUrl.origin}`);
      }

      callback(granted);

    } catch (error) {
      console.error('🛡️ PermissionBroker: Error parsing URL:', error);
      console.log(`🛡️ PermissionBroker: Denied permission "${permission}" due to URL parse error`);
      callback(false);
    }
  }

  private checkPermission(
    permission: string, 
    requestingOrigin: string, 
    details: Electron.PermissionCheckHandlerHandlerDetails
  ): boolean {
    const permissionKey = `${requestingOrigin}:${permission}`;
    
    // Check if permission was previously granted
    if (this.grantedPermissions.has(permissionKey)) {
      return true;
    }

    // Check if permission was previously denied
    if (this.deniedPermissions.has(permissionKey)) {
      return false;
    }

    // Default to deny for unknown permissions
    console.log(`🛡️ PermissionBroker: Permission check for "${permission}" from ${requestingOrigin} - defaulting to deny`);
    return false;
  }

  private shouldDenyPermission(permission: string, url: URL): boolean {
    // Security rules - always deny these permissions
    const alwaysDenyPermissions = [
      'camera',
      'microphone', 
      'geolocation'
    ];

    if (alwaysDenyPermissions.includes(permission)) {
      return true;
    }

    // Deny all permissions for non-HTTPS origins (except localhost/file)
    if (url.protocol !== 'https:' && url.protocol !== 'http:' && url.protocol !== 'file:') {
      return true;
    }

    // For HTTP, only allow localhost
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      return true;
    }

    return false;
  }

  private isTrustedOrigin(origin: string): boolean {
    return this.trustedOrigins.has(origin) || origin.startsWith('file://');
  }

  private evaluatePermissionRequest(
    permission: string, 
    url: URL, 
    details: Electron.PermissionRequestHandlerHandlerDetails
  ): boolean {
    switch (permission) {
      case 'notifications':
        // Allow notifications for our app
        return this.isTrustedOrigin(url.origin);
      
      case 'storage-access':
        // Allow storage access for trusted origins
        return this.isTrustedOrigin(url.origin);
      
      case 'background-sync':
        // Allow background sync for our app
        return this.isTrustedOrigin(url.origin);
      
      case 'push-messaging':
        // Deny push messaging for now
        return false;
      
      case 'midi':
        // Deny MIDI access
        return false;
      
      default:
        console.log(`🛡️ PermissionBroker: Unknown permission "${permission}" - defaulting to deny`);
        return false;
    }
  }

  // Application-specific permission methods (keep your existing API)
  async request(permission: PermissionType): Promise<boolean> {
    console.log(`🛡️ PermissionBroker: App requesting internal permission: ${permission}`);
    
    switch (permission) {
      case 'crypto':
      case 'storage':
      case 'network':
        this.grantedPermissions.add(`app:${permission}`);
        console.log(`🛡️ PermissionBroker: Granted internal permission: ${permission}`);
        return true;
      
      case 'notifications':
        // For notifications, we might want to check system permissions
        this.grantedPermissions.add(`app:${permission}`);
        return true;
        
      default:
        console.log(`🛡️ PermissionBroker: Denied internal permission: ${permission}`);
        return false;
    }
  }

  hasPermission(permission: PermissionType): boolean {
    return this.grantedPermissions.has(`app:${permission}`);
  }

  // Method to add trusted origins dynamically
  addTrustedOrigin(origin: string): void {
    this.trustedOrigins.add(origin);
    console.log(`🛡️ PermissionBroker: Added trusted origin: ${origin}`);
  }

  // Method to remove trusted origins
  removeTrustedOrigin(origin: string): void {
    this.trustedOrigins.delete(origin);
    console.log(`🛡️ PermissionBroker: Removed trusted origin: ${origin}`);
  }

  // Get permission statistics
  getPermissionStats(): {
    granted: string[];
    denied: string[];
    trusted: string[];
  } {
    return {
      granted: Array.from(this.grantedPermissions),
      denied: Array.from(this.deniedPermissions),
      trusted: Array.from(this.trustedOrigins)
    };
  }

  // Revoke all permissions (useful for reset/logout)
  revokeAllPermissions(): void {
    this.grantedPermissions.clear();
    this.deniedPermissions.clear();
    console.log('🛡️ PermissionBroker: All permissions revoked');
  }
}