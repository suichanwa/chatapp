export class MobilePermissions {
  async request(): Promise<void> {
    console.log('📱 MobilePermissions: Requesting permissions');
    
    await this.requestCameraPermission();
    await this.requestNotificationPermission();
    await this.requestStoragePermission();
  }

  private async requestCameraPermission(): Promise<boolean> {
    try {
      // Check if we're in a Capacitor environment
      const isCapacitor = !!(window as any).Capacitor?.isNative;
      
      if (isCapacitor) {
        // Use Capacitor's camera permission
        try {
          const { Camera } = await import('@capacitor/camera');
          const permissions = await Camera.requestPermissions();
          console.log('📱 Camera permissions:', permissions);
          return permissions.camera === 'granted';
        } catch (error) {
          console.log('📱 Capacitor Camera not available, using web API');
        }
      }
      
      // Fallback to web API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the stream immediately as we just wanted to check permission
        stream.getTracks().forEach(track => track.stop());
        console.log('📱 Camera permission granted (Web API)');
        return true;
      } catch (error) {
        console.log('📱 Camera permission denied:', error);
        return false;
      }
    } catch (error) {
      console.error('📱 Error requesting camera permission:', error);
      return false;
    }
  }

  private async requestNotificationPermission(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('📱 Notification permission:', permission);
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('📱 Error requesting notification permission:', error);
      return false;
    }
  }

  private async requestStoragePermission(): Promise<boolean> {
    try {
      // Check for persistent storage permission
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersistent = await navigator.storage.persist();
        console.log('📱 Storage persistence:', isPersistent);
        return isPersistent;
      }
      return true; // Assume granted if not available
    } catch (error) {
      console.error('📱 Error requesting storage permission:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<{
    camera: boolean;
    notifications: boolean;
    storage: boolean;
  }> {
    const permissions = {
      camera: false,
      notifications: false,
      storage: false
    };

    // Check camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      permissions.camera = true;
    } catch {
      permissions.camera = false;
    }

    // Check notification permission
    if ('Notification' in window) {
      permissions.notifications = Notification.permission === 'granted';
    }

    // Check storage permission
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        permissions.storage = await navigator.storage.persisted();
      } catch {
        permissions.storage = false;
      }
    } else {
      permissions.storage = true; // Assume granted if not available
    }

    return permissions;
  }
}