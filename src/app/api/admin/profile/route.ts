import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, siteProfiles } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { revalidatePortfolioCache } from '@/lib/cache';
import { deleteMediaAssets, diffRemovedMediaTargets } from '@/lib/storage';
import { sanitizeImageUrlList } from '@/lib/validation';

export async function PUT(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = await db.select().from(siteProfiles).limit(1);
    const existingSocial =
      (existing[0]?.socialLinks as Record<string, unknown> | null | undefined) ?? {};

    const profileValues = {
      name: String(body.photographerName || 'Razaul Hafiz Rahi').trim(),
      biography: String(body.bioSummary || '').trim(),
      profileImage: String(body.portraitUrl || '').trim(),
      email: String(body.contactEmail || 'contact@wildrahi.com').trim(),
      socialLinks: {
        ...existingSocial,
        brandName: String(body.brandName || 'Wild Rahi').trim(),
        location: String(body.location || 'Bangladesh').trim(),
        heroHeadline: String(body.heroHeadline || '').trim(),
        heroSubheadline: String(body.heroSubheadline || '').trim(),
        bioHeadline: String(body.bioHeadline || '').trim(),
        passionNote: String(body.passionNote || '').trim(),
        journeyNote: String(body.journeyNote || '').trim(),
        philosophy: String(body.philosophy || '').trim(),
        aboutImages: sanitizeImageUrlList(body.aboutImages, 24),
        facebook: String(body.facebookUrl || '').trim(),
        instagram: String(body.instagramUrl || '').trim(),
        youtube: String(body.youtubeUrl || '').trim(),
        tiktok: String(body.tiktokUrl || '').trim(),
      },
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const prevAboutImages = sanitizeImageUrlList(existingSocial.aboutImages, 24);
      const removed = diffRemovedMediaTargets(
        [existing[0].profileImage, ...prevAboutImages],
        [profileValues.profileImage, ...profileValues.socialLinks.aboutImages]
      );
      if (removed.length > 0) {
        await deleteMediaAssets(removed);
      }
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

    revalidatePortfolioCache();
    return NextResponse.json({ ok: true, profile: result });
  } catch (err) {
    console.error('[Admin Profile PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 });
  }
}
