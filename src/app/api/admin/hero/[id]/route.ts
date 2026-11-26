import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, heroSlides } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteStorageFile } from '@/lib/storage';
import { isValidUuid } from '@/lib/validation';
import { revalidatePortfolioCache } from '@/lib/cache';

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
    return NextResponse.json({ error: 'Invalid hero slide ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'Hero slide image URL is required.' }, { status: 400 });
    }

    const slideValues = {
      image: body.image.trim(),
      storagePath: body.storagePath || null,
      altText: typeof body.altText === 'string' ? body.altText.trim() : '',
      sortOrder: Number(body.sortOrder ?? 10),
      isPublished: body.isPublished !== false,
      updatedAt: new Date(),
    };

    const existing = isNew ? [] : await db.select().from(heroSlides).where(eq(heroSlides.id, id));

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(heroSlides)
        .set(slideValues)
        .where(eq(heroSlides.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(heroSlides)
        .values(isNew ? slideValues : { id, ...slideValues })
        .returning();
      result = inserted;
    }

    revalidatePortfolioCache();
    return NextResponse.json({ ok: true, slide: result });
  } catch (err) {
    console.error('[Admin Hero PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save hero slide.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Invalid hero slide ID.' }, { status: 400 });
  }

  try {
    const existing = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    if (existing.length > 0) {
      if (existing[0].storagePath) {
        await deleteStorageFile(existing[0].storagePath);
      }
      await db.delete(heroSlides).where(eq(heroSlides.id, id));
    }
    revalidatePortfolioCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Hero DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete hero slide.' }, { status: 500 });
  }
}

