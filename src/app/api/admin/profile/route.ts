import { NextResponse } from 'next/server';
import { db, siteProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function PUT(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = await db.select().from(siteProfiles).limit(1);

    const profileValues = {
      name: body.photographerName || body.name || 'Razaul Hafiz Rahi',
      biography: body.bioSummary || body.biography || '',
      biographyBn: body.bioSummaryBn || body.biographyBn || '',
      profileImage: body.portraitUrl || body.profileImage || '',
      email: body.contactEmail || body.email || 'contact@wildrahi.com',
      socialLinks: {
        facebook: body.facebookUrl || '',
        instagram: body.instagramUrl || '',
        youtube: body.youtubeUrl || '',
      },
      conservationContent: body.conservationStatement || body.conservationContent || '',
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(siteProfiles)
        .set(profileValues)
        .where(eq(siteProfiles.id, existing[0].id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db.insert(siteProfiles).values(profileValues).returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, profile: result });
  } catch (err) {
    console.error('[Admin Profile PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 });
  }
}

