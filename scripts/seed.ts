import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/lib/auth';
import { DEFAULT_HERO_SLIDES, DEFAULT_PROFILE } from '../src/lib/defaults';
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

    console.log('[Seed] 2. Photographer profile...');
    const existingProfile = await db.select().from(siteProfiles).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(siteProfiles).values({
        name: DEFAULT_PROFILE.photographerName,
        biography: DEFAULT_PROFILE.bioSummary,
        profileImage: DEFAULT_PROFILE.portraitUrl,
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
          aboutImages: DEFAULT_PROFILE.aboutImages,
          facebook: DEFAULT_PROFILE.facebookUrl,
          instagram: DEFAULT_PROFILE.instagramUrl,
          youtube: DEFAULT_PROFILE.youtubeUrl,
          tiktok: DEFAULT_PROFILE.tiktokUrl,
        },
      });
    }

    console.log('[Seed] 3. Hero slides...');
    const existingSlides = await db.select().from(heroSlides).limit(1);
    if (existingSlides.length === 0) {
      for (const slide of DEFAULT_HERO_SLIDES) {
        await db.insert(heroSlides).values({
          image: slide.image,
          altText: slide.altText,
          sortOrder: slide.sortOrder,
          isPublished: slide.isPublished,
        });
      }
      console.log(`[Seed] Seeded ${DEFAULT_HERO_SLIDES.length} hero slides`);
    }

    console.log('[Seed] 4. Photographs...');
    const existingPhotos = await db.select().from(photographs).limit(1);
    if (existingPhotos.length === 0) {
      const seedPhotos = [
        {
          title: 'Pied Kingfisher in Flight',
          description: 'Hovering above early morning water along the Atrai River in North Bengal.',
          imageUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          thumbnailUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          category: 'birds',
          isFeatured: true,
          isPublished: true,
          sortOrder: 1,
        },
        {
          title: 'Common Kingfisher Perch',
          description: 'Perched quietly over a shaded stream in Thakurgaon.',
          imageUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
          thumbnailUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
          category: 'birds',
          isFeatured: true,
          isPublished: true,
          sortOrder: 2,
        },
        {
          title: 'Fishing Cat in Wetland Reeds',
          description: 'A fishing cat moving through reedbeds near a northern beel at dusk.',
          imageUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
          thumbnailUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
          category: 'mammals',
          isFeatured: true,
          isPublished: true,
          sortOrder: 3,
        },
        {
          title: 'Winter Mist Over Northern Wetland',
          description: 'Still morning water and water lilies across seasonal beels in North Bengal.',
          imageUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
          thumbnailUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
          category: 'wetlands',
          isFeatured: true,
          isPublished: true,
          sortOrder: 4,
        },
        {
          title: 'Green Pit Viper',
          description: 'Resting among fern leaves near a northern woodland edge.',
          imageUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
          thumbnailUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
          category: 'reptiles',
          isFeatured: true,
          isPublished: true,
          sortOrder: 5,
        },
        {
          title: 'Common Mormon Butterfly',
          description: 'Feeding on wild blooms during warm afternoon light.',
          imageUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
          thumbnailUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
          category: 'insects',
          isFeatured: true,
          isPublished: true,
          sortOrder: 6,
        },
      ];
      await db.insert(photographs).values(seedPhotos);
    }

    console.log('[Seed] 5. Stories...');
    const existingStories = await db.select().from(stories).limit(1);
    if (existingStories.length === 0) {
      await db.insert(stories).values({
        title: 'উত্তরবঙ্গের কুয়াশাচ্ছন্ন বিল ও মাছরাঙার ডাইভ: একটি শীতকালীন মাঠের গল্প',
        slug: 'north-bengal-winter-wetlands-kingfisher-dispatch',
        shortDescription:
          'ঠাকুরগাঁও ও সংলগ্ন বিলের ভোরবেলা—কুয়াশা ভেদ করে শিকার খোঁজা মাছরাঙা আর নিস্তব্ধ জলাভূমির গল্প।',
        coverImage: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
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
        images: [
          '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
        ],
        isPublished: true,
        isFeatured: true,
      });
    }

    console.log('[Seed] 6. Videos...');
    const existingVideos = await db.select().from(videos).limit(1);
    if (existingVideos.length === 0) {
      await db.insert(videos).values([
        {
          title: 'Flight of the Pied Kingfisher',
          description: 'Slow-motion hovering sequence above quiet northern wetland waters.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          isFeatured: true,
          isPublished: true,
          sortOrder: 1,
        },
        {
          title: 'Dawn Mist Over Northern Wetlands',
          description: 'Early morning ambient wildlife scenes from Thakurgaon and nearby beels.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
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
