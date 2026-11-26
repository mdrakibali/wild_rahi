import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  adminUsers,
  enquiries,
  heroSlides,
  photographs,
  siteProfiles,
  stories,
  videos,
} from '@/lib/db/schema';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const [adminsData, slidesData, photosData, videosData, storiesData, enquiriesData, profilesData] =
      await Promise.all([
        db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name }).from(adminUsers),
        db.select().from(heroSlides),
        db.select().from(photographs),
        db.select().from(videos),
        db.select().from(stories),
        db.select().from(enquiries),
        db.select().from(siteProfiles),
      ]);

    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      source: 'Wild Rahi Supabase PostgreSQL',
      data: {
        adminUsers: adminsData,
        heroSlides: slidesData,
        photographs: photosData,
        videos: videosData,
        stories: storiesData,
        enquiries: enquiriesData,
        siteProfiles: profilesData,
      },
    };

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="wildrahi-database-backup.json"',
      },
    });
  } catch (err) {
    console.error('[Admin Export] Error:', err);
    return NextResponse.json({ error: 'Failed to export database backup.' }, { status: 500 });
  }
}
