import type { ImageData } from '../../../types/index';

// Shared offscreen canvas for re-encoding (drops EXIF/GPS/metadata)
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('2D canvas context not available');
}

export type SanitizeOptions = {
  maxWidth?: number;
  maxHeight?: number;
  mimeType?: 'image/jpeg' | 'image/png';
  quality?: number; // only used for jpeg
};

export async function sanitizeImageDataURL(
  rawDataUrl: string,
  filename = 'image.jpg',
  opts: SanitizeOptions = {}
): Promise<ImageData> {
  const mimeType: 'image/jpeg' | 'image/png' = opts.mimeType ?? 'image/jpeg';
  const quality = typeof opts.quality === 'number' ? opts.quality : 0.85;
  const maxWidth = opts.maxWidth ?? 1600;
  const maxHeight = opts.maxHeight ?? 1200;

  // Basic allow-list (block SVG or unknown types early)
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(rawDataUrl.slice(0, 64))) {
    throw new Error('Unsupported image type');
  }

  const img = await loadImage(rawDataUrl);
  const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

  // Main re-encode (drops all metadata)
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  const data = canvas.toDataURL(mimeType, quality);

  // Thumbnail
  const thumbDims = calculateDimensions(width, height, 150, 100);
  canvas.width = thumbDims.width;
  canvas.height = thumbDims.height;
  ctx.drawImage(img, 0, 0, thumbDims.width, thumbDims.height);
  const thumbnail = canvas.toDataURL(mimeType, 0.6);

  return {
    filename: sanitizeFileName(filename, mimeType),
    mimeType,
    size: calculateBase64Size(data),
    width,
    height,
    data,
    thumbnail,
  } as ImageData;
}

export async function sanitizeFile(
  file: File,
  opts: SanitizeOptions = {}
): Promise<ImageData> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }
  const targetMime: 'image/jpeg' | 'image/png' =
    opts.mimeType ?? (file.type.includes('png') ? 'image/png' as const : 'image/jpeg' as const);
  const quality = typeof opts.quality === 'number' ? opts.quality : 0.8;
  const maxWidth = opts.maxWidth ?? 800;
  const maxHeight = opts.maxHeight ?? 600;

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

  // Main re-encode (drops all metadata)
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  const reencoded = canvas.toDataURL(targetMime, quality);

  // Thumbnail
  const thumb = calculateDimensions(img.width, img.height, 150, 100);
  canvas.width = thumb.width;
  canvas.height = thumb.height;
  ctx.drawImage(img, 0, 0, thumb.width, thumb.height);
  const thumbnail = canvas.toDataURL(targetMime, 0.6);

  return {
    filename: sanitizeFileName(file.name, targetMime),
    mimeType: targetMime,
    size: calculateBase64Size(reencoded),
    width,
    height,
    data: reencoded,
    thumbnail,
  } as ImageData;
}

export function sanitizeFileName(name: string, mimeType: string): string {
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const base = name.split('/').pop()?.split('\\').pop() || 'image';
  const cleanBase =
    base.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 32) || 'image';
  return `${cleanBase}.${ext}`;
}

export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;
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

export function calculateBase64Size(base64String: string): number {
  const base64Data = base64String.split(',')[1] || '';
  return Math.round((base64Data.length * 3) / 4);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

