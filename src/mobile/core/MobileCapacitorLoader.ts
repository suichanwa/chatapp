import {
  CameraResultType as FallbackCameraResultType,
  CameraSource as FallbackCameraSource,
  Camera as FallbackCamera
} from '../../types/capacitor';

export interface CameraInterface {
  getPhoto(options: any): Promise<any>;
  requestPermissions(): Promise<any>;
}

export class MobileCapacitorLoader {
  static Camera: CameraInterface = FallbackCamera;
  static CameraResultType: any = FallbackCameraResultType;
  static CameraSource: any = FallbackCameraSource;
  static capacitorLoaded = false;

  static async loadDependencies(): Promise<boolean> {
    try {
      // Check if we're in a Capacitor environment
      const isCapacitor = (window as unknown as { Capacitor?: { isNative: boolean } }).Capacitor?.isNative;
      
      if (isCapacitor) {
        try {
          // Use dynamic import for Capacitor Camera
          const capacitorModule = await import('@capacitor/camera').catch(() => null);
          if (capacitorModule) {
            MobileCapacitorLoader.Camera = capacitorModule.Camera;
            MobileCapacitorLoader.CameraResultType = capacitorModule.CameraResultType;
            MobileCapacitorLoader.CameraSource = capacitorModule.CameraSource;
            console.log('📱 Real Capacitor Camera loaded');
          } else {
            console.log('📱 Capacitor Camera module not available, using fallback');
          }
        } catch (error) {
          console.log('📱 Failed to load real Capacitor Camera, using fallback');
        }
      }
      
      MobileCapacitorLoader.capacitorLoaded = !!isCapacitor;
      console.log('📱 Capacitor dependencies setup complete');
      return MobileCapacitorLoader.capacitorLoaded;
    } catch (error) {
      console.log('📱 Failed to setup Capacitor dependencies, using fallbacks');
      MobileCapacitorLoader.capacitorLoaded = false;
      return false;
    }
  }
}