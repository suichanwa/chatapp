import { MobileCapacitorLoader } from '../core/MobileCapacitorLoader';
import { MobileToast } from '../ui/MobileToast';
import type { MessageHandler } from '../../renderer/components/Chat/MessageHandler';

export class MobileCamera {
  private currentChatId: string | null = null;
  private components: Map<string, any> = new Map();

  constructor(currentChatId: string | null, components: Map<string, any>) {
    this.currentChatId = currentChatId;
    this.components = components;
  }

  setup(): void {
    console.log('📱 MobileCamera: Setup complete');
    
    // Override the image button click to use native camera
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'image-btn' || target.closest('#image-btn')) {
        e.preventDefault();
        await this.showCameraOptions();
      }
    });
  }

  private async showCameraOptions(): Promise<void> {
    if (!MobileCapacitorLoader.capacitorLoaded) {
      // Fallback to regular file input for web
      const imageInput = document.getElementById('image-input') as HTMLInputElement;
      imageInput?.click();
      return;
    }

    // Show native camera options
    const options = document.createElement('div');
    options.className = 'mobile-camera-options';
    options.innerHTML = `
      <div class="mobile-menu-backdrop"></div>
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">Add Photo</div>
        <button class="mobile-menu-item" data-action="camera">📷 Take Photo</button>
        <button class="mobile-menu-item" data-action="gallery">🖼️ Choose from Gallery</button>
        <button class="mobile-menu-item cancel">❌ Cancel</button>
      </div>
    `;

    // Add styles for camera options
    this.injectCameraStyles();

    document.body.appendChild(options);
    options.classList.add('show');

    options.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;

      if (action === 'camera') {
        await this.takeCameraPhoto();
      } else if (action === 'gallery') {
        await this.chooseFromGallery();
      }

      options.remove();
    });
  }

  private async takeCameraPhoto(): Promise<void> {
    try {
      const image = await MobileCapacitorLoader.Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: MobileCapacitorLoader.CameraResultType.DataUrl,
        source: MobileCapacitorLoader.CameraSource.Camera
      });

      if (image.dataUrl) {
        await this.processAndSendImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Camera error:', error);
      MobileToast.show('❌ Camera access failed');
    }
  }

  private async chooseFromGallery(): Promise<void> {
    try {
      const image = await MobileCapacitorLoader.Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: MobileCapacitorLoader.CameraResultType.DataUrl,
        source: MobileCapacitorLoader.CameraSource.Photos
      });

      if (image.dataUrl) {
        await this.processAndSendImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      MobileToast.show('❌ Gallery access failed');
    }
  }

  private async processAndSendImage(dataUrl: string): Promise<void> {
    if (!this.currentChatId) {
      MobileToast.show('❌ No chat selected');
      return;
    }

    try {
      // Convert data URL to File object
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'mobile-photo.jpg', { type: 'image/jpeg' });

      const messageHandler = this.components.get('messages') as MessageHandler;
      await messageHandler.sendImageMessage(this.currentChatId, file);
      
      MobileToast.show('📷 Photo sent!');
    } catch (error) {
      console.error('Failed to send image:', error);
      MobileToast.show('❌ Failed to send photo');
    }
  }

  private injectCameraStyles(): void {
    const existingStyles = document.getElementById('mobile-camera-styles');
    if (existingStyles) return;

    const style = document.createElement('style');
    style.id = 'mobile-camera-styles';
    style.textContent = `
      .mobile-camera-options {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .mobile-camera-options.show {
        opacity: 1;
      }
      
      .mobile-menu-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }
      
      .mobile-menu-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: #2d2d2d;
        border-radius: 12px 12px 0 0;
        padding: 1rem;
        transform: translateY(100%);
        animation: slideUp 0.3s ease forwards;
      }
      
      @keyframes slideUp {
        to {
          transform: translateY(0);
        }
      }
      
      .mobile-menu-header {
        text-align: center;
        font-weight: 600;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #404040;
      }
      
      .mobile-menu-item {
        display: block;
        width: 100%;
        background: none;
        border: none;
        color: white;
        padding: 1rem;
        text-align: left;
        font-size: 1rem;
        cursor: pointer;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        transition: background-color 0.2s;
      }
      
      .mobile-menu-item:hover {
        background: #404040;
      }
      
      .mobile-menu-item.cancel {
        color: #ff4444;
        border-top: 1px solid #404040;
        margin-top: 0.5rem;
        padding-top: 1rem;
      }
    `;
    document.head.appendChild(style);
  }
}