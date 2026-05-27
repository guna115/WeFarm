import { API_URL } from '@/lib/config';

/**
 * Convert a data URL (from camera capture) to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload captured images to the backend (which sends to Cloudinary)
 * Returns { urls: string[], publicIds: string[] }
 */
export async function uploadImages(
  dataUrls: string[],
  nurseryName: string,
  token: string
): Promise<{ urls: string[]; publicIds: string[] }> {
  const formData = new FormData();
  formData.append('nursery_name', nurseryName);

  for (let i = 0; i < dataUrls.length; i++) {
    const blob = dataUrlToBlob(dataUrls[i]);
    formData.append('images', blob, `photo_${i + 1}.jpg`);
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Image upload failed');
  }

  const data = await response.json();
  return {
    urls: data.urls || [],
    publicIds: data.publicIds || [],
  };
}
