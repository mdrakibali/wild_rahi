import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/lib/auth';
import { DEFAULT_PROFILE } from '../src/lib/defaults';
import { uploadImage, deleteMediaAssets, type UploadResult } from '../src/lib/storage';
import {
  adminUsers,
  heroSlides,
  photographs,
  siteProfiles,
  stories,
  videos,
} from '../src/lib/db/schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const isResetMode = process.argv.includes('--reset');

async function seedAsset(fileName: string, folder: string): Promise<UploadResult> {
  const filePath = path.resolve(process.cwd(), 'public', 'assets', 'images', fileName);
  const buffer = fs.readFileSync(filePath);
  return uploadImage(buffer, fileName, 'image/jpeg', {
    folder,
    generateThumbnail: true,
    maxWidth: 1920,
  });
}

async function seed() {
  console.log('[Seed] Connecting to PostgreSQL:', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  try {
    console.log('[Seed] 1. Admin user...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@wildrahi.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'WildRahi#2026';

    const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail));
    if (existingAdmin.length === 0) {
      await db.insert(adminUsers).values({
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        name: 'Razaul Hafiz Rahi',
      });
      console.log(`[Seed] Created admin: ${adminEmail}`);
    }

    if (isResetMode) {
      console.log('[Seed --reset] Cleaning existing sample media and resetting seeded tables...');
      const [oldSlides, oldPhotos, oldVideos, oldStories, oldProfiles] = await Promise.all([
        db.select().from(heroSlides),
        db.select().from(photographs),
        db.select().from(videos),
        db.select().from(stories),
        db.select().from(siteProfiles),
      ]);

      const oldTargets: Array<string | null | undefined> = [];
      for (const s of oldSlides) oldTargets.push(s.storagePath, s.image);
      for (const p of oldPhotos) oldTargets.push(p.storagePath, p.imageUrl, p.thumbnailUrl);
      for (const v of oldVideos) oldTargets.push(v.thumbnailPath, v.thumbnail);
      for (const st of oldStories) {
        oldTargets.push(st.coverImagePath, st.coverImage, ...(Array.isArray(st.images) ? st.images : []));
      }
      for (const pr of oldProfiles) {
        const social = (pr.socialLinks as Record<string, unknown>) || {};
        const aboutImgs = Array.isArray(social.aboutImages) ? (social.aboutImages as string[]) : [];
        oldTargets.push(pr.profileImage, ...aboutImgs);
      }
      await deleteMediaAssets(oldTargets);

      await db.delete(heroSlides);
      await db.delete(photographs);
      await db.delete(videos);
      await db.delete(stories);
    }

    console.log('[Seed] 2. Photographer profile, portrait & personal About images...');
    const existingProfile = await db.select().from(siteProfiles).limit(1);
    if (existingProfile.length === 0 || isResetMode) {
      const portraitUpload = await seedAsset('portrait_photographer_field_1795067902652.jpg', 'profile');
      const aboutSources = [
        'portrait_photographer_field_1795067902652.jpg',
        'landscape_tanguar_haor_1795067901551.jpg',
        'bird_pied_kingfisher_flight_1795067901863.jpg',
        'bird_kingfisher_sylhet_1795067903243.jpg',
        'mammal_fishing_cat_wetland_1795067902865.jpg',
        'reptile_green_pit_viper_1795067904040.jpg',
        'insect_swallowtail_butterfly_1795067901756.jpg',
      ];
      const aboutUploads = await Promise.all(
        aboutSources.map((file) => seedAsset(file, 'profile/about'))
      );
      const aboutUrls = aboutUploads.map((u) => u.imageUrl);

      const profileData = {
        name: DEFAULT_PROFILE.photographerName,
        biography: DEFAULT_PROFILE.bioSummary,
        profileImage: portraitUpload.imageUrl,
        email: DEFAULT_PROFILE.contactEmail,
        socialLinks: {
          brandName: DEFAULT_PROFILE.brandName,
          location: DEFAULT_PROFILE.location,
          heroHeadline: DEFAULT_PROFILE.heroHeadline,
          heroSubheadline: DEFAULT_PROFILE.heroSubheadline,
          bioHeadline: DEFAULT_PROFILE.bioHeadline,
          passionNote: DEFAULT_PROFILE.passionNote,
          journeyNote: DEFAULT_PROFILE.journeyNote,
          philosophy: DEFAULT_PROFILE.philosophy,
          aboutImages: aboutUrls,
          facebook: DEFAULT_PROFILE.facebookUrl,
          instagram: DEFAULT_PROFILE.instagramUrl,
          youtube: DEFAULT_PROFILE.youtubeUrl,
          tiktok: DEFAULT_PROFILE.tiktokUrl,
        },
        updatedAt: new Date(),
      };

      if (existingProfile.length > 0) {
        await db
          .update(siteProfiles)
          .set(profileData)
          .where(eq(siteProfiles.id, existingProfile[0].id));
      } else {
        await db.insert(siteProfiles).values(profileData);
      }
      console.log(`[Seed] Seeded profile portrait + ${aboutUrls.length} About collage frames`);
    }

    console.log('[Seed] 3. Hero slides...');
    const existingSlides = await db.select().from(heroSlides).limit(1);
    if (existingSlides.length === 0) {
      const slideDefs = [
        {
          file: 'bird_pied_kingfisher_flight_1795067901863.jpg',
          headline: 'Wildlife of North Bengal.',
          subtitle: 'Birds, mammals, wetlands, and flora photographed in natural light by Razaul Hafiz Rahi.',
          altText: 'Pied Kingfisher hovering in morning light over northern river waters',
          sortOrder: 1,
        },
        {
          file: 'mammal_fishing_cat_wetland_1795067902865.jpg',
          headline: 'Along Northern Wetlands.',
          subtitle: 'Shy wetland mammals documented quietly at dusk among seasonal reeds.',
          altText: 'Fishing Cat moving along northern wetland reeds',
          sortOrder: 2,
        },
        {
          file: 'bird_kingfisher_sylhet_1795067903243.jpg',
          headline: 'Rivers & Woodland Edges.',
          subtitle: 'Resident birds photographed along shaded rural streams in Thakurgaon and nearby districts.',
          altText: 'Common Kingfisher perched over a shaded northern brook',
          sortOrder: 3,
        },
        {
          file: 'landscape_tanguar_haor_1795067901551.jpg',
          headline: 'Dawn Over Still Water.',
          subtitle: 'Winter mist, water lilies, and quiet wetland habitats across northern plains.',
          altText: 'Morning mist over northern wetlands and water lilies',
          sortOrder: 4,
        },
      ];

      for (const s of slideDefs) {
        const uploaded = await seedAsset(s.file, 'hero');
        await db.insert(heroSlides).values({
          image: uploaded.imageUrl,
          storagePath: uploaded.storagePath,
          headline: s.headline,
          subtitle: s.subtitle,
          altText: s.altText,
          sortOrder: s.sortOrder,
          isPublished: true,
        });
      }
      console.log(`[Seed] Seeded ${slideDefs.length} hero slides`);
    }

    console.log('[Seed] 4. Photographs...');
    const existingPhotos = await db.select().from(photographs).limit(1);
    if (existingPhotos.length === 0) {
      const photoDefs = [
        {
          file: 'bird_pied_kingfisher_flight_1795067901863.jpg',
          title: 'Pied Kingfisher in Flight',
          description: 'Hovering above early morning water along the Atrai River in North Bengal.',
          category: 'birds',
          sortOrder: 1,
        },
        {
          file: 'bird_kingfisher_sylhet_1795067903243.jpg',
          title: 'Common Kingfisher Perch',
          description: 'Perched over a shaded stream in Thakurgaon.',
          category: 'birds',
          sortOrder: 2,
        },
        {
          file: 'mammal_fishing_cat_wetland_1795067902865.jpg',
          title: 'Fishing Cat in Wetland Reeds',
          description: 'A fishing cat moving through reedbeds near a northern beel at dusk.',
          category: 'mammals',
          sortOrder: 3,
        },
        {
          file: 'landscape_tanguar_haor_1795067901551.jpg',
          title: 'Winter Mist Over Northern Wetland',
          description: 'Still morning water and water lilies across seasonal beels in North Bengal.',
          category: 'wetlands',
          sortOrder: 4,
        },
        {
          file: 'reptile_green_pit_viper_1795067904040.jpg',
          title: 'Green Pit Viper',
          description: 'Resting among fern leaves near a northern woodland edge.',
          category: 'reptiles',
          sortOrder: 5,
        },
        {
          file: 'insect_swallowtail_butterfly_1795067901756.jpg',
          title: 'Common Mormon Butterfly',
          description: 'Feeding on wild blooms during warm afternoon light.',
          category: 'insects',
          sortOrder: 6,
        },
      ];

      for (const p of photoDefs) {
        const uploaded = await seedAsset(p.file, 'photographs');
        await db.insert(photographs).values({
          title: p.title,
          description: p.description,
          imageUrl: uploaded.imageUrl,
          thumbnailUrl: uploaded.thumbnailUrl || uploaded.imageUrl,
          storagePath: uploaded.storagePath,
          category: p.category,
          isFeatured: true,
          isPublished: true,
          sortOrder: p.sortOrder,
        });
      }
      console.log(`[Seed] Seeded ${photoDefs.length} photographs`);
    }

    console.log('[Seed] 5. Stories...');
    const existingStories = await db.select().from(stories).limit(1);
    if (existingStories.length === 0) {
      const coverUpload = await seedAsset('landscape_tanguar_haor_1795067901551.jpg', 'stories');
      const inline1 = await seedAsset('bird_pied_kingfisher_flight_1795067901863.jpg', 'stories/gallery');
      const inline2 = await seedAsset('mammal_fishing_cat_wetland_1795067902865.jpg', 'stories/gallery');

      await db.insert(stories).values({
        title: 'উত্তরবঙ্গের কুয়াশাচ্ছন্ন বিল ও মাছরাঙার ডাইভ: একটি শীতকালীন মাঠের গল্প',
        slug: 'north-bengal-winter-wetlands-kingfisher-dispatch',
        shortDescription:
          'ঠাকুরগাঁও ও সংলগ্ন বিলের ভোরবেলা—কুয়াশা ভেদ করে শিকার খোঁজা মাছরাঙা আর নিস্তব্ধ জলাভূমির গল্প।',
        coverImage: coverUpload.imageUrl,
        coverImagePath: coverUpload.storagePath,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'উত্তরবঙ্গের গ্রামীণ নদী ও মৌসুমি বিলের পাড়ে বন্যপ্রাণীর ছবি তোলার সবচেয়ে বড় নিয়ম হলো প্রকৃতিকে তার মতো থাকতে দেওয়া। ভোরের কুয়াশা কাটার আগেই জলের ধারে নিঃশব্দে বসে থাকতে হয় দীর্ঘ সময়।',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'জলের আয়নায় প্রথম আলো' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'সকালের প্রথম নরম আলো যখন নলখাগড়ার ফাঁক দিয়ে পানিতে পড়ে, তখনই আকাশে স্থির হয়ে ভেসে থাকতে দেখা যায় পাকড়া মাছরাঙাকে। কোনো কৃত্রিম প্রলোভন ছাড়াই প্রাকৃতিক আলোয় ধরা থাকে এই মুহূর্তগুলো।',
                },
              ],
            },
          ],
        },
        images: [inline1.imageUrl, inline2.imageUrl],
        isPublished: true,
        isFeatured: true,
      });
    }

    console.log('[Seed] 6. Videos...');
    const existingVideos = await db.select().from(videos).limit(1);
    if (existingVideos.length === 0) {
      const thumb1 = await seedAsset('bird_pied_kingfisher_flight_1795067901863.jpg', 'videos');
      const thumb2 = await seedAsset('landscape_tanguar_haor_1795067901551.jpg', 'videos');

      await db.insert(videos).values([
        {
          title: 'Flight of the Pied Kingfisher',
          description: 'Slow-motion hovering sequence above northern wetland waters.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: thumb1.imageUrl,
          thumbnailPath: thumb1.storagePath,
          isFeatured: true,
          isPublished: true,
          sortOrder: 1,
        },
        {
          title: 'Morning Mist Over Northern Wetlands',
          description: 'Early morning wildlife scenes from Thakurgaon and nearby beels.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: thumb2.imageUrl,
          thumbnailPath: thumb2.storagePath,
          isFeatured: true,
          isPublished: true,
          sortOrder: 2,
        },
      ]);
    }

    console.log('[Seed] Done.');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
