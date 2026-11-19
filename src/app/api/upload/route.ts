import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'photographs';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided in request.' }, { status: 400 });
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WebP, AVIF, and TIFF are supported.' },
        { status: 400 }
      );
    }

    // Limit size: 25MB max
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowable limit of 25MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, file.name, file.type, {
      folder,
      generateThumbnail: true,
      maxWidth: 1920,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Upload API] Error:', err);
    const message = err instanceof Error ? err.message : 'Image upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

