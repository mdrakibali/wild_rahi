import { NextResponse } from 'next/server';
import { db, locations } from '@/lib/db';
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
    const existing = await db.select().from(locations).where(eq(locations.id, id));

    const locationValues = {
      name: body.name || 'Unnamed Location',
      region: body.region || '',
      country: body.country || 'Bangladesh',
      description: body.description || '',
      latitude: body.latitude ? String(body.latitude) : null,
      longitude: body.longitude ? String(body.longitude) : null,
      isSensitive: Boolean(body.isSensitive),
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(locations)
        .set(locationValues)
        .where(eq(locations.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(locations)
        .values({ id, ...locationValues })
        .returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, location: result });
  } catch (err) {
    console.error('[Admin Location PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save location.' }, { status: 500 });
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
    await db.delete(locations).where(eq(locations.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Location DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete location.' }, { status: 500 });
  }
}

