/**
 * Reads and compresses an uploaded image File into a browser-ready WebP/JPEG data URL
 * so photographs and inline article figures store cleanly without oversized payloads.
 */
export async function readImageFileAsDataUrl(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (JPEG, PNG, or WebP).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  // Load into an Image element to resize when larger than maxDimension
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Selected image could not be decoded.'));
    image.src = rawDataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return rawDataUrl;

  ctx.drawImage(img, 0, 0, width, height);

  try {
    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
  } catch {
    // Fallback to JPEG below
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Uploads an image File to Supabase Storage via /api/upload.
 */
export async function uploadImageFileToServer(
  file: File,
  folder = 'photographs'
): Promise<{ imageUrl: string; storagePath: string; thumbnailUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload image file to storage.');
  }

  const data = await res.json();
  return {
    imageUrl: data.imageUrl,
    storagePath: data.storagePath,
    thumbnailUrl: data.thumbnailUrl,
  };
}

