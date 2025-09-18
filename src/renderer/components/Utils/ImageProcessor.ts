import type { Component } from '../../types/components';
import type { ImageData } from '../../../types/index';

export class ImageProcessor implements Component {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async initialize(): Promise<void> {
    console.log('🖼️ ImageProcessor: Initialized');
  }

  async processImageFile(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Selected file is not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          const img = new Image();
          
          img.onload = async () => {
            try {
              // Resize image if too large
              const maxWidth = 800;
              const maxHeight = 600;
              const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
              
              // Create resized image
              this.canvas.width = width;
              this.canvas.height = height;
              this.ctx.drawImage(img, 0, 0, width, height);
              const resizedData = this.canvas.toDataURL('image/jpeg', 0.8);
              
              // Create thumbnail
              const thumbWidth = 150;
              const thumbHeight = 100;
              const thumbDimensions = this.calculateDimensions(img.width, img.height, thumbWidth, thumbHeight);
              
              this.canvas.width = thumbDimensions.width;
              this.canvas.height = thumbDimensions.height;
              this.ctx.drawImage(img, 0, 0, thumbDimensions.width, thumbDimensions.height);
              const thumbnailData = this.canvas.toDataURL('image/jpeg', 0.6);
              
              const imageData: ImageData = {
                filename: file.name,
                mimeType: file.type,
                size: this.calculateBase64Size(resizedData),
                width,
                height,
                data: resizedData,
                thumbnail: thumbnailData
              };
              
              resolve(imageData);
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = base64Data;
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private calculateDimensions(originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Calculate scaling to fit within bounds while maintaining aspect ratio
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  private calculateBase64Size(base64String: string): number {
    // Remove data URL prefix to get actual base64 data
    const base64Data = base64String.split(',')[1];
    // Calculate approximate byte size (base64 is ~33% larger than binary)
    return Math.round((base64Data.length * 3) / 4);
  }

  async createImagePreview(imageData: ImageData): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'image-preview';
    
    const img = document.createElement('img');
    img.src = imageData.thumbnail || imageData.data;
    img.alt = imageData.filename;
    img.className = 'preview-image';
    
    const info = document.createElement('div');
    info.className = 'image-info';
    info.innerHTML = `
      <div class="filename">${imageData.filename}</div>
      <div class="details">${this.formatFileSize(imageData.size)} • ${imageData.width}×${imageData.height}</div>
    `;
    
    container.appendChild(img);
    container.appendChild(info);
    
    return container;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  cleanup(): void {
    // Clean up canvas and context
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}