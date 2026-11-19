import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  adminUsers,
  articleCategories,
  articles,
  categories,
  collectionPhotos,
  collections,
  enquiries,
  locations,
  photographs,
  siteProfiles,
  siteSettings,
  species,
  videos,
} from '@/lib/db/schema';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const [
      adminsData,
      photosData,
      catsData,
      colsData,
      colPhotosData,
      speciesData,
      locsData,
      artsData,
      artCatsData,
      videosData,
      enquiriesData,
      profilesData,
      settingsData,
    ] = await Promise.all([
      db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name }).from(adminUsers),
      db.select().from(photographs),
      db.select().from(categories),
      db.select().from(collections),
      db.select().from(collectionPhotos),
      db.select().from(species),
      db.select().from(locations),
      db.select().from(articles),
      db.select().from(articleCategories),
      db.select().from(videos),
      db.select().from(enquiries),
      db.select().from(siteProfiles),
      db.select().from(siteSettings),
    ]);

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      source: 'Wild Rahi Supabase PostgreSQL',
      data: {
        adminUsers: adminsData,
        photographs: photosData,
        categories: catsData,
        collections: colsData,
        collectionPhotos: colPhotosData,
        species: speciesData,
        locations: locsData,
        articles: artsData,
        articleCategories: artCatsData,
        videos: videosData,
        enquiries: enquiriesData,
        siteProfiles: profilesData,
        siteSettings: settingsData,
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

