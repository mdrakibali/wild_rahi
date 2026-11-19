import { NextResponse } from 'next/server';
import { db, collections } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest } from '@/lib/auth';

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
    const existing = await db.select().from(collections).where(eq(collections.id, id));

    const colValues = {
      title: body.title || 'Untitled Collection',
      slug: body.slug || `collection-${Date.now()}`,
      description: body.description || '',
      coverImage: body.coverImageUrl || body.coverImage || '',
      sortOrder: Number(body.sortOrder ?? 10),
      isFeatured: Boolean(body.featured ?? true),
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(collections)
        .set(colValues)
        .where(eq(collections.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(collections)
        .values({ id, ...colValues })
        .returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, collection: result });
  } catch (err) {
    console.error('[Admin Collection PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save collection.' }, { status: 500 });
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
    await db.delete(collections).where(eq(collections.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Collection DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete collection.' }, { status: 500 });
  }
}

