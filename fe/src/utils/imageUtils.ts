/**
 * Utility functions for image processing
 */

/**
 * Convert an image file to base64 string
 * @param file - The image file to convert
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert a canvas element to base64 string
 * @param canvas - The canvas element
 * @param mimeType - The mime type of the image (default: 'image/jpeg')
 * @param quality - The quality of the image (0 to 1, default: 0.8)
 * @returns Base64 string
 */
export const canvasToBase64 = (
  canvas: HTMLCanvasElement,
  mimeType: string = 'image/jpeg',
  quality: number = 0.8
): string => {
  return canvas.toDataURL(mimeType, quality);
};

/**
 * Capture image from video element and return as base64
 * @param videoElement - The video element
 * @param mimeType - The mime type of the image (default: 'image/jpeg')
 * @param quality - The quality of the image (0 to 1, default: 0.8)
 * @returns Base64 string
 */
export const captureImageFromVideo = (
  videoElement: HTMLVideoElement,
  mimeType: string = 'image/jpeg',
  quality: number = 0.8
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mimeType, quality);
  }
  throw new Error('Could not get canvas context');
};

/**
 * Capture image from video element as a Blob
 * @param videoElement - The video element
 * @param mimeType - The mime type of the image (default: 'image/jpeg')
 * @param quality - The quality of the image (0 to 1, default: 0.8)
 * @param maxWidth - Maximum width to resize to
 * @param maxHeight - Maximum height to resize to
 * @returns Promise with the image as a Blob
 */
export const captureImageAsBlob = (
  videoElement: HTMLVideoElement,
  mimeType: string = 'image/jpeg',
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      
      // Set initial dimensions from the video
      let width = videoElement.videoWidth;
      let height = videoElement.videoHeight;
      
      // Resize if needed
      if (maxWidth && maxHeight) {
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(videoElement, 0, 0, width, height);
      
      // Convert canvas to Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Convert base64 to Blob
 * @param base64 - The base64 string
 * @returns Blob object
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Resize an image from base64
 * @param base64 - The base64 string
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise with resized base64 string
 */
export const resizeBase64Image = (
  base64: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};