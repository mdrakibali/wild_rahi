import { NextResponse } from 'next/server';
import { db, photographs } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteStorageFile } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const existing = await db.select().from(photographs).where(eq(photographs.id, id));

    const photoValues = {
      title: body.title || 'Untitled',
      slug: body.slug || `photo-${Date.now()}`,
      description: body.caption || body.description || '',
      imageUrl: body.imageUrl,
      thumbnailUrl: body.thumbnailUrl || body.imageUrl,
      storagePath: body.storagePath || null,
      categoryId: body.collectionId || body.categoryId || null,
      camera: body.camera || '',
      lens: body.lens || '',
      settings: {
        focalLength: body.focalLength || '',
        aperture: body.aperture || '',
        shutterSpeed: body.shutterSpeed || '',
        iso: body.iso || '',
      },
      isFeatured: Boolean(body.featured ?? body.inHorizontalJourney),
      sortOrder: Number(body.sortOrder ?? 10),
      status: body.published === false ? 'draft' : 'published',
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(photographs)
        .set(photoValues)
        .where(eq(photographs.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(photographs)
        .values({ id, ...photoValues })
        .returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, photograph: result });
  } catch (err) {
    console.error('[Admin Photo PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save photograph.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const existing = await db.select().from(photographs).where(eq(photographs.id, id));
    if (existing.length > 0) {
      if (existing[0].storagePath) {
        await deleteStorageFile(existing[0].storagePath);
      }
      await db.delete(photographs).where(eq(photographs.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Photo DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete photograph.' }, { status: 500 });
  }
}

