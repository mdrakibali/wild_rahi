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
          title: 'The Ghost of Sundarbans',
          description: 'A male Royal Bengal Tiger silently surveying the riverbank at sunset.',
          imageUrl: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
          thumbnailUrl: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
          category: 'mammals',
          isFeatured: true,
          isPublished: true,
          sortOrder: 1,
        },
        {
          title: 'Canopy Sentinel: Common Kingfisher',
          description: 'Perched over a freshwater forest brook in Lawachara.',
          imageUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
          thumbnailUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
          category: 'birds',
          isFeatured: true,
          isPublished: true,
          sortOrder: 2,
        },
        {
          title: 'Pied Kingfisher Mid-Air Strike',
          description: 'Hovering over Tanguar Haor right before diving for small fish.',
          imageUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          thumbnailUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
          category: 'birds',
          isFeatured: true,
          isPublished: true,
          sortOrder: 3,
        },
        {
          title: 'Wetland Nocturne: The Fishing Cat',
          description: 'An endangered fishing cat prowling through reeds in Sunamganj.',
          imageUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
          thumbnailUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
          category: 'mammals',
          isFeatured: true,
          isPublished: true,
          sortOrder: 4,
        },
        {
          title: 'Tanguar Haor Waterscape at Dawn',
          description: 'Silent mist over the Ramsar wetland with water lily beds.',
          imageUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
          thumbnailUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
          category: 'landscapes',
          isFeatured: true,
          isPublished: true,
          sortOrder: 5,
        },
        {
          title: 'Emerald Coil: Green Pit Viper',
          description: 'Coiled resting on rainforest fern branches in Lawachara.',
          imageUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
          thumbnailUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
          category: 'reptiles',
          isFeatured: true,
          isPublished: true,
          sortOrder: 6,
        },
        {
          title: 'Swallowtail on Wild Bloom',
          description: 'Common Mormon drinking nectar in the tea estate borders.',
          imageUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
          thumbnailUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
          category: 'insects',
          isFeatured: true,
          isPublished: true,
          sortOrder: 7,
        },
      ];
      await db.insert(photographs).values(seedPhotos);
    }

    console.log('[Seed] 5. Stories...');
    const existingStories = await db.select().from(stories).limit(1);
    if (existingStories.length === 0) {
      await db.insert(stories).values({
        title: 'সুন্দরবনের নিঃশব্দ পদধ্বনি: রয়েল বেঙ্গল টাইগারের সন্ধানে',
        slug: 'sundarbans-royal-bengal-tiger-tracking',
        shortDescription:
          'জোয়ার-ভাটার কাদাজলে বাঘের তাজা পদচিহ্ন আর বাওয়ালিদের ফিসফিসানি—ম্যানগ্রোভের গভীর অরণ্যে এক সপ্তাহের চরম ধৈর্যের গল্প।',
        coverImage: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'ম্যানগ্রোভ অরণ্যে বন্যপ্রাণী ছবি তোলার সবচেয়ে বড় নিয়ম হলো প্রকৃতিকে তাড়াহুড়ো করানো যায় না। কাদা, বিষাক্ত কাঁটাওয়ালা শ্বাসমূল আর জোয়ারের পানির সাথে তাল মিলিয়ে অপেক্ষা করতে হয় ঘণ্টার পর ঘণ্টা।',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'কাদার ওপর তাজা পায়ের ছাপ' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'ভোরের প্রথম আলো যখন কটকার খালের কিনারে এসে পড়ল, তখন কাদায় চোখে পড়ল সদ্য ফেলে যাওয়া বাঘের থাবার দাগ। নিঃশব্দে ট্রাইপড নামিয়ে আমরা দূরপাল্লার লেন্স তাক করে রইলাম।',
                },
              ],
            },
          ],
        },
        images: [
          '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
          '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
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
          title: 'Eye to Eye with the Tiger of Sundarbans',
          description: 'Field recording from the canal banks of Katka during winter mist.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
          isFeatured: true,
          isPublished: true,
          sortOrder: 1,
        },
        {
          title: 'Flight of the Pied Kingfisher',
          description: 'Slow motion hovering sequence captured over Tanguar Haor.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
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
