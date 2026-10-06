/**
 * LUXURY HOMESTYLING - IMAGEKIT.IO CLIENT UTILITIES
 */

export const IMAGEKIT_CONFIG = {
  publicKey: "public_+UakMhQEG9oqkCM3AEsiXKW7SZM=",
  urlEndpoint: "https://ik.imagekit.io/luxuryhome/"
};

/**
 * Upload an image file through Node.js Express backend directly to ImageKit
 */
export async function uploadToImageKit(file, customName, tags = ['luxury', 'kerala']) {
  const formData = new FormData();
  formData.append('image', file);
  if (customName) formData.append('fileName', customName);
  if (tags) formData.append('tags', tags.join(','));

  const response = await fetch('/api/imagekit/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to upload image to ImageKit');
  }

  return await response.json();
}

/**
 * Formats an image URL with ImageKit CDN transformations
 */
export function formatImageKitUrl(url, options = { width: 1000, quality: 85 }) {
  if (!url) return '/assets/images/hero.jpg';
  if (url.startsWith('assets/') || url.startsWith('/assets/')) return url;
  
  if (url.includes('imagekit.io')) {
    if (!url.includes('tr=')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}tr=w-${options.width},q-${options.quality},f-auto`;
    }
    return url;
  }
  return url;
}
