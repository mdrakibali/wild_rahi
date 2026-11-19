import { NextResponse } from 'next/server';
import { db, species } from '@/lib/db';
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
    const existing = await db.select().from(species).where(eq(species.id, id));

    const speciesValues = {
      commonName: body.commonName || 'Unknown Species',
      scientificName: body.scientificName || 'Unknown',
      banglaName: body.bengaliName || body.banglaName || '',
      description: body.description || '',
      habitat: body.habitat || '',
      conservationStatus: body.conservationStatus || 'Least Concern',
      iucnStatus: body.iucnStatus || body.conservationStatus || 'Least Concern',
      coverImage: body.coverImageUrl || body.coverImage || '',
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(species)
        .set(speciesValues)
        .where(eq(species.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(species)
        .values({ id, ...speciesValues })
        .returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, species: result });
  } catch (err) {
    console.error('[Admin Species PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save species.' }, { status: 500 });
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
    await db.delete(species).where(eq(species.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Species DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete species.' }, { status: 500 });
  }
}

