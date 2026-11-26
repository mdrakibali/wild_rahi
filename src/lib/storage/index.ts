import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'wild_rahi';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseStorageClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (supabaseUrl && serviceKey && !supabaseUrl.includes('your-project-ref')) {
    supabaseClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    return supabaseClient;
  }
  return null;
}

export interface UploadResult {
  imageUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
}

export interface UploadOptions {
  folder?: string; // e.g. 'photographs', 'articles/covers', 'articles/inline', 'collections'
  generateThumbnail?: boolean;
  maxWidth?: number;
}

/**
 * Optimizes an image buffer: converts to WebP, limits max width to 1920px (or custom maxWidth),
 * removes GPS/camera metadata if requested.
 */
async function optimizeImage(
  buffer: Buffer,
  maxWidth = 1920,
  quality = 85
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  const pipeline = sharp(buffer)
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { data, info };
}

/**
 * Generates a thumbnail image buffer (~500px WebP)
 */
async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({
      width: 500,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
}

/**
 * Uploads an image file to Supabase Storage or falls back to public/uploads in local development.
 */
export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || 'photographs';
  const maxWidth = options.maxWidth || 1920;
  const needThumbnail = options.generateThumbnail ?? true;

  // Sanitize file name and create a unique WebP name
  const safeName = path
    .basename(fileName, path.extname(fileName))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const mainStoragePath = `${folder}/${safeName}-${uniqueId}.webp`;
  const thumbStoragePath = `${folder}/thumbnails/${safeName}-${uniqueId}-thumb.webp`;

  // 1. Optimize main image
  const { data: mainWebpBuffer } = await optimizeImage(fileBuffer, maxWidth, 85);

  // 2. Generate thumbnail if needed
  let thumbWebpBuffer: Buffer | null = null;
  if (needThumbnail) {
    thumbWebpBuffer = await generateThumbnail(fileBuffer);
  }

  const supabase = getSupabaseStorageClient();

  if (supabase) {
    // Ensure bucket exists or upload directly
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(mainStoragePath, mainWebpBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Supabase Storage] Upload error:', uploadError);
      throw new Error(`Failed to upload to Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(mainStoragePath);

    let thumbnailUrl: string | undefined;
    if (thumbWebpBuffer) {
      const { error: thumbError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(thumbStoragePath, thumbWebpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!thumbError) {
        const { data: thumbPublicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(thumbStoragePath);
        thumbnailUrl = thumbPublicUrlData.publicUrl;
      }
    }

    return {
      imageUrl: publicUrlData.publicUrl,
      storagePath: mainStoragePath,
      thumbnailUrl: thumbnailUrl || publicUrlData.publicUrl,
      thumbnailPath: thumbWebpBuffer ? thumbStoragePath : undefined,
    };
  }

  // Fallback: Local file storage in public/uploads for local development
  const localUploadDir = path.resolve(process.cwd(), 'public', 'uploads', folder);
  const localThumbDir = path.resolve(localUploadDir, 'thumbnails');

  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
  if (needThumbnail && !fs.existsSync(localThumbDir)) {
    fs.mkdirSync(localThumbDir, { recursive: true });
  }

  const localMainFile = path.resolve(process.cwd(), 'public', 'uploads', mainStoragePath);
  const localMainDir = path.dirname(localMainFile);
  if (!fs.existsSync(localMainDir)) {
    fs.mkdirSync(localMainDir, { recursive: true });
  }
  fs.writeFileSync(localMainFile, mainWebpBuffer);

  let localThumbUrl: string | undefined;
  if (thumbWebpBuffer) {
    const localThumbFile = path.resolve(process.cwd(), 'public', 'uploads', thumbStoragePath);
    const localThumbParent = path.dirname(localThumbFile);
    if (!fs.existsSync(localThumbParent)) {
      fs.mkdirSync(localThumbParent, { recursive: true });
    }
    fs.writeFileSync(localThumbFile, thumbWebpBuffer);
    localThumbUrl = `/uploads/${thumbStoragePath}`;
  }

  return {
    imageUrl: `/uploads/${mainStoragePath}`,
    storagePath: mainStoragePath,
    thumbnailUrl: localThumbUrl || `/uploads/${mainStoragePath}`,
    thumbnailPath: thumbWebpBuffer ? thumbStoragePath : undefined,
  };
}

/**
 * Extracts a bucket/upload relative storage path from a URL or stored relative path.
 * Returns null for external URLs or non-upload static paths (/assets/...).
 */
export function extractManagedStoragePath(target?: string | null): string | null {
  if (!target || typeof target !== 'string') return null;
  const trimmed = target.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

  if (trimmed.startsWith('/uploads/')) {
    return trimmed.slice('/uploads/'.length).replace(/^\/+/, '') || null;
  }

  if (trimmed.startsWith('/')) {
    // Non-upload public paths like /assets/... are static repo assets, not mutable storage objects
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const { pathname } = new URL(trimmed);
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const idx = pathname.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(pathname.slice(idx + marker.length)).replace(/^\/+/, '') || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  return trimmed.replace(/^\/+/, '') || null;
}

function deriveThumbnailPath(storagePath: string): string | null {
  const dir = path.posix.dirname(storagePath);
  const base = path.posix.basename(storagePath);
  if (!base || dir.endsWith('/thumbnails') || dir === 'thumbnails' || base.includes('-thumb.')) {
    return null;
  }
  const ext = path.posix.extname(base);
  const stem = ext ? base.slice(0, -ext.length) : base;
  if (!stem) return null;
  const thumbDir = dir === '.' ? 'thumbnails' : `${dir}/thumbnails`;
  return `${thumbDir}/${stem}-thumb.webp`;
}

/**
 * Computes storage assets present in `previousTargets` that were removed or replaced in `nextTargets`.
 */
export function diffRemovedMediaTargets(
  previousTargets: Array<string | null | undefined>,
  nextTargets: Array<string | null | undefined>
): string[] {
  const activePaths = new Set<string>();
  for (const item of nextTargets) {
    const resolved = extractManagedStoragePath(item);
    if (resolved) activePaths.add(resolved);
  }

  const removed: string[] = [];
  for (const item of previousTargets) {
    const resolved = extractManagedStoragePath(item);
    if (resolved && !activePaths.has(resolved)) {
      removed.push(resolved);
    }
  }
  return removed;
}

/**
 * Deletes one or more managed media files (and their companion thumbnails) from
 * Supabase Storage or local public/uploads fallback.
 */
export async function deleteMediaAssets(
  targets: Array<string | null | undefined>
): Promise<boolean> {
  const pathSet = new Set<string>();
  for (const raw of targets) {
    const resolved = extractManagedStoragePath(raw);
    if (!resolved) continue;
    pathSet.add(resolved);
    const thumb = deriveThumbnailPath(resolved);
    if (thumb) pathSet.add(thumb);
  }

  const paths = Array.from(pathSet);
  if (paths.length === 0) return false;

  const supabase = getSupabaseStorageClient();
  if (supabase) {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);
    if (error) {
      console.warn(`[Supabase Storage] Delete error:`, error.message);
      return false;
    }
    return true;
  }

  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  let removedAny = false;
  for (const relPath of paths) {
    try {
      const resolvedFile = path.resolve(uploadsRoot, relPath);
      if (!resolvedFile.startsWith(`${uploadsRoot}${path.sep}`)) continue;
      if (fs.existsSync(resolvedFile)) {
        fs.unlinkSync(resolvedFile);
        removedAny = true;
      }
    } catch (err) {
      console.warn(`[Local Storage] Could not delete ${relPath}:`, err);
    }
  }
  return removedAny;
}

/**
 * Deletes a single file (and companion thumbnail) from Supabase Storage or local uploads fallback.
 */
export async function deleteStorageFile(storagePath: string): Promise<boolean> {
  return deleteMediaAssets([storagePath]);
}

