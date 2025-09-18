// Mock types for Capacitor to avoid import errors during development

declare global {
  interface Window {
    Capacitor?: {
      isNative: boolean;
      platform: string;
    };
  }
}

export interface CameraPhoto {
  dataUrl?: string;
  webPath?: string;
  format: string;
  saved: boolean;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType: CameraResultType;
  source?: CameraSource;
  saveToGallery?: boolean;
  width?: number;
  height?: number;
}

export enum CameraResultType {
  Uri = 'uri',
  Base64 = 'base64',
  DataUrl = 'dataUrl'
}

export enum CameraSource {
  Prompt = 'PROMPT',
  Camera = 'CAMERA',
  Photos = 'PHOTOS'
}

export interface CameraPlugin {
  getPhoto(options: CameraOptions): Promise<CameraPhoto>;
  requestPermissions(): Promise<{ camera: string; photos: string }>;
}

// Mock Camera export for development
export const Camera: CameraPlugin = {
  async getPhoto(options: CameraOptions): Promise<CameraPhoto> {
    // Mock implementation for development
    console.log('Mock Camera.getPhoto called with options:', options);
    throw new Error('Camera not available in development mode');
  },
  
  async requestPermissions() {
    console.log('Mock Camera.requestPermissions called');
    return { camera: 'granted', photos: 'granted' };
  }
};

export {};