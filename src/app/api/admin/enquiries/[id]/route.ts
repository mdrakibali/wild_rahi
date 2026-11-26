import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, enquiries } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { isValidUuid } from '@/lib/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid enquiry ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const [updated] = await db
      .update(enquiries)
      .set({ status: body.status || 'reviewed' })
      .where(eq(enquiries.id, id))
      .returning();

    return NextResponse.json({ ok: true, enquiry: updated });
  } catch (err) {
    console.error('[Admin Enquiry PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update enquiry.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Invalid enquiry ID.' }, { status: 400 });
  }

  try {
    await db.delete(enquiries).where(eq(enquiries.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Enquiry DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete enquiry.' }, { status: 500 });
  }
}
