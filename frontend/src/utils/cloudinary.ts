/**
 * Cloudinary Upload Utility
 *
 * This utility provides functions to upload media (images/videos) to Cloudinary
 * and return the public URL for use in violation evidence.
 */

export interface CloudinaryUploadOptions {
  file: File | Blob;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Upload a file to Cloudinary
 *
 * @param options - Upload options including the file and optional settings
 * @returns Promise with the Cloudinary response containing the URL
 */
export async function uploadToCloudinary(
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResponse> {
  const {
    file,
    folder = 'traffic_violations',
    resourceType = 'auto',
    publicId,
  } = options;

  // Get Cloudinary credentials from environment variables
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary credentials not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables.'
    );
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  if (publicId) {
    formData.append('public_id', publicId);
  }

  // Add timestamp for unique uploads
  formData.append('timestamp', Date.now().toString());

  // Upload to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const result: CloudinaryUploadResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate a unique filename for video recordings
 *
 * @param cameraId - Optional camera ID to include in filename
 * @returns A unique filename
 */
export function generateVideoFilename(cameraId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const camera = cameraId ? `cam_${cameraId}_` : '';
  return `${camera}violation_${timestamp}_${random}`;
}

/**
 * Convert a data URL to a Blob
 *
 * @param dataUrl - The data URL to convert
 * @returns A Blob object
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}
