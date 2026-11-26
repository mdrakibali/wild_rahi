import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, photographs } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteStorageFile } from '@/lib/storage';
import { isValidUuid, normalizeWildlifeCategory } from '@/lib/validation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const isNew = id === 'new';
  if (!isNew && !isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid photograph ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const imageUrl = String(body.image || body.imageUrl || '').trim();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Photograph image URL is required.' }, { status: 400 });
    }

    const photoValues = {
      title: String(body.title || 'Untitled').trim(),
      description: String(body.description || '').trim(),
      imageUrl,
      thumbnailUrl: String(body.thumbnailUrl || imageUrl).trim(),
      storagePath: body.storagePath || null,
      category: normalizeWildlifeCategory(body.category),
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 10),
      isPublished: body.isPublished !== false,
      updatedAt: new Date(),
    };

    const existing = isNew ? [] : await db.select().from(photographs).where(eq(photographs.id, id));

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
        .values(isNew ? photoValues : { id, ...photoValues })
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
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid photograph ID.' }, { status: 400 });
  }

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
