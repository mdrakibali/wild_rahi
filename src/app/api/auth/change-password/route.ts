import { NextResponse } from 'next/server';
import { db, adminUsers } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest, hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const records = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, session.sub))
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json({ error: 'Admin account not found in database.' }, { status: 404 });
    }

    const admin = records[0];
    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    await db
      .update(adminUsers)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(adminUsers.id, session.sub));

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[Change Password] Error:', err);
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}

