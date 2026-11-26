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

    console.log('[Seed] 5. Stories (Tiptap-compatible rich docs)...');
    const existingStories = await db.select().from(stories).limit(1);
    if (existingStories.length === 0) {
      const p = (parts: Array<{ text: string; bold?: boolean; italic?: boolean }>) => ({
        type: 'paragraph',
        content: parts.map((part) => ({
          type: 'text',
          text: part.text,
          ...(part.bold || part.italic
            ? {
                marks: [
                  ...(part.bold ? [{ type: 'bold' }] : []),
                  ...(part.italic ? [{ type: 'italic' }] : []),
                ],
              }
            : {}),
        })),
      });

      const h2 = (text: string) => ({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text }],
      });

      const quote = (text: string) => ({
        type: 'blockquote',
        content: [p([{ text }])],
      });

      const bullets = (items: string[]) => ({
        type: 'bulletList',
        content: items.map((item) => ({
          type: 'listItem',
          content: [p([{ text: item }])],
        })),
      });

      const figure = (src: string, alt: string, caption: string) => ({
        type: 'editorialFigure',
        attrs: { src, alt, caption, layout: 'wide' },
      });

      // Story 1: Kanchenjunga from Panchagarh / Tetulia & North Bengal winter morning
      const kCover = await seedAsset('landscape_tanguar_haor_1795067901551.jpg', 'stories');
      const kInline = await seedAsset('bird_pied_kingfisher_flight_1795067901863.jpg', 'stories/gallery');
      const kExtra = await seedAsset('bird_kingfisher_sylhet_1795067903243.jpg', 'stories/gallery');

      // Story 2: Extreme winter cold & dense morning fog over Thakurgaon wetlands
      const coldCover = await seedAsset('bird_pied_kingfisher_flight_1795067901863.jpg', 'stories');
      const coldInline = await seedAsset('landscape_tanguar_haor_1795067901551.jpg', 'stories/gallery');
      const coldExtra = await seedAsset('bird_kingfisher_sylhet_1795067903243.jpg', 'stories/gallery');

      // Story 3: Nocturnal Fishing Cat in northern reeds & wetlands
      const catCover = await seedAsset('mammal_fishing_cat_wetland_1795067902865.jpg', 'stories');
      const catInline = await seedAsset('reptile_green_pit_viper_1795067904040.jpg', 'stories/gallery');
      const catExtra = await seedAsset('landscape_tanguar_haor_1795067901551.jpg', 'stories/gallery');

      // Story 4: Butterflies & woodland insects in soft northern sun
      const macroCover = await seedAsset('insect_swallowtail_butterfly_1795067901756.jpg', 'stories');
      const macroInline = await seedAsset('reptile_green_pit_viper_1795067904040.jpg', 'stories/gallery');

      await db.insert(stories).values([
        {
          title: 'তেঁতুলিয়ার ভোরে কাঞ্চনজঙ্ঘা ও উত্তরের মাঠের পাখি',
          slug: 'tetulia-dawn-kanchenjunga-north-bengal',
          shortDescription:
            'শরৎ ও হেমন্তের পরিষ্কার আকাশে পঞ্চগড়–ঠাকুরগাঁওয়ের দিগন্তে কাঞ্চনজঙ্ঘার দৃশ্য আর ভোরের পাখিদের গল্প।',
          coverImage: kCover.imageUrl,
          coverImagePath: kCover.storagePath,
          content: {
            type: 'doc',
            content: [
              p([
                {
                  text: 'অক্টোবর-নভেম্বরের দিকে উত্তরবঙ্গের আকাশ যখন বৃষ্টি ধুয়ে ঝকঝকে হয়ে ওঠে, তখন ঠাকুরগাঁও ও তেঁতুলিয়ার খোলা মাঠের উত্তর দিগন্তে ভেসে ওঠে ',
                },
                { text: 'কাঞ্চনজঙ্ঘার বরফে ঢাকা চূড়া', bold: true },
                {
                  text: '। সূর্য ওঠার ঠিক আগের সেই হালকা গোলাপি আলো বেশিক্ষণ স্থায়ী হয় না, কিন্তু পুরো উত্তরের প্রান্তর তখন অদ্ভুত সুন্দর হয়ে ওঠে।',
                },
              ]),
              h2('ভোরের পরিষ্কার আকাশ ও মাঠের প্রাণ'),
              p([
                {
                  text: 'কাঞ্চনজঙ্ঘা স্পষ্ট দেখা যায় সাধারণত সকাল ৬টা থেকে ৮টার মধ্যে। এই একই সময়ে খালের পাড়, চা বাগানের কিনারা আর ধানের ক্ষেতের আইল ধরে খাবারের খোঁজে নেমে আসে মাছরাঙা, ফিঙে আর নানান ছোট পাখি।',
                },
              ]),
              figure(
                kInline.imageUrl,
                'উত্তরের নদীতে ভোরবেলা মাছরাঙা',
                'সকালের নরম আলোয় জলের ওপর পাকড়া মাছরাঙার উড়াল।'
              ),
              quote(
                'দূরের পাহাড় আর কাছের গ্রামীণ জলাভূমি—একই সকালের আলোয় দুটো ভিন্ন পৃথিবী ফ্রেমে বাঁধা যায় কেবল উত্তরবঙ্গেই।'
              ),
              h2('মাঠের কিছু জরুরি নোট'),
              bullets([
                'সূর্যোদয়ের অন্তত ২০ মিনিট আগে খোলা উত্তরমুখী মাঠে অবস্থান নেওয়া ভালো।',
                'ভোরের কুয়াশা বা ধোঁয়াশা কাটার আগেই মেঘমুক্ত আকাশে চূড়ার ডিটেইল পাওয়া যায়।',
                'প্রকৃতির কোনো ক্ষতি বা পাখির বাসার কাছাকাছি না গিয়ে দূরপাল্লার লেন্স ব্যবহার করা জরুরি।',
              ]),
            ],
          },
          images: [kInline.imageUrl, kExtra.imageUrl],
          isPublished: true,
          isFeatured: true,
        },
        {
          title: 'হাড়কাঁপানো শীত আর ঘন কুয়াশায় বিলের পাড়ে ভোর',
          slug: 'north-bengal-extreme-winter-cold-fog',
          shortDescription:
            'উত্তরবঙ্গের প্রচণ্ড শীতে জমে যাওয়া সকালে কুয়াশা ভেদ করে শিকার খোঁজা মাছরাঙা ও বিলের পাখির অভিজ্ঞতা।',
          coverImage: coldCover.imageUrl,
          coverImagePath: coldCover.storagePath,
          content: {
            type: 'doc',
            content: [
              p([
                {
                  text: 'পৌষ-মাঘ মাসে উত্তরবঙ্গে যে ',
                },
                { text: 'হাড়কাঁপানো শীত', bold: true },
                {
                  text: ' পড়ে, তার প্রকৃত চেহারা বোঝা যায় ভোর ৫টার দিকে বিলের পাড়ে দাঁড়ালে। তাপমাত্রা নেমে যায় ৮–১০ ডিগ্রির ঘরে, ঘাসের ডগায় জমে থাকে বরফের মতো শিশির, আর চারদিক ঢেকে থাকে ঘন সাদা কুয়াশায়।',
                },
              ]),
              h2('ঠান্ডায় জমে আসা আঙুল ও ক্যামেরার অপেক্ষা'),
              p([
                {
                  text: 'হাতমোজা পরে ক্যামেরার শাটার বাটন বা ফোকাস রিং ঠিকমতো ধরাও কঠিন হয়ে পড়ে। ট্রাইপডের ধাতব পা ধরলে হাতে রীতিমতো ছ্যাঁকা লাগে। কিন্তু এমন কনকনে শীতেই বিলের পানির ওপর হালকা বাষ্প উঠতে থাকে, যা ছবিতে দারুণ এক পরিবেশ তৈরি করে।',
                },
              ]),
              figure(
                coldInline.imageUrl,
                'শীতের সকালে উত্তরবঙ্গের কুয়াশাচ্ছন্ন বিল',
                'বেলা বাড়ার সাথে সাথে কুয়াশা সরে গিয়ে জলের ওপর রোদের রেখা পড়তে শুরু করে।'
              ),
              p([
                {
                  text: 'সকাল ৯টার আগে রোদের দেখা মেলা ভার। তবুও নলখাগড়ার ডালে চুপচাপ বসে থাকে ছোট ও পাকড়া মাছরাঙা—হালকা আলো ফুটলেই ডুব দিয়ে মাছ ধরে ফেরে নিজের ডালে। শীত যত তীব্র হয়, প্রাণীদের টিকে থাকার সেই মুহূর্তগুলো ততই স্পষ্ট হয়ে ওঠে।',
                },
              ]),
              quote('শীতের ভোর মানেই দীর্ঘ ধৈর্য; ঠান্ডা যত বাড়ে, সকালের প্রথম রোদের মূল্যও তত বেড়ে যায়।'),
            ],
          },
          images: [coldInline.imageUrl, coldExtra.imageUrl],
          isPublished: true,
          isFeatured: true,
        },
        {
          title: 'নলখাগড়ার ঝোপে মেছো বিড়াল ও রাতের জলাভূমি',
          slug: 'fishing-cat-northern-wetlands',
          shortDescription:
            'গোধূলি ও শেষ রাতের আবছা আলোয় উত্তরবঙ্গের গ্রামীণ বিল ও ঝোপঝাড়ে লাজুক মেছো বিড়াল দেখার গল্প।',
          coverImage: catCover.imageUrl,
          coverImagePath: catCover.storagePath,
          content: {
            type: 'doc',
            content: [
              p([
                {
                  text: 'গ্রামের মানুষের কাছে যে প্রাণীটি প্রায়ই "বাঘডাশ" নামে ভুল পরিচিতি পায়, সেটিই বাংলাদেশের দুর্লভ ',
                },
                { text: 'মেছো বিড়াল (Fishing Cat)', bold: true },
                {
                  text: '। উত্তরবঙ্গের পুরনো বিল, কচুরিপানায় ভরা পুকুর আর নদীর পাড়ের নলখাগড়ার ঝোপে এখনো এদের বিচরণ দেখা যায়, মূলত সূর্য ডোবার পর থেকে ভোর পর্যন্ত।',
                },
              ]),
              h2('আবছা আলোয় নিঃশব্দ চলাচল'),
              p([
                {
                  text: 'দিনের বেলা মানুষের কোলাহলে এরা ঘন ঝোপের ভেতর লুকিয়ে থাকে। সন্ধ্যা নামলেই জলের কিনারায় এসে চুপচাপ অপেক্ষা করে ছোট মাছ বা ব্যাঙ ধরার জন্য। এদের চোখে খুব সামান্য আলোও প্রতিফলিত হয়, যা দেখে ঝোপের ভেতর এদের অবস্থান বোঝা যায়।',
                },
              ]),
              figure(
                catInline.imageUrl,
                'উত্তরের ঝোপঝাড় ও বনাঞ্চলের নীরব প্রাণ',
                'জলাভূমি ও তার পাশের ঝোপঝাড় টিকে থাকলে বেঁচে থাকে ছোট-বড় নানা প্রজাতির প্রাণী।'
              ),
              bullets([
                'কখনো কৃত্রিম আলো বা তীব্র ফ্ল্যাশ চোখে মেরে প্রাণীকে ভয় দেখানো উচিত নয়।',
                'জলাভূমি ভরাট না করে প্রাকৃতিক ঝোপ রক্ষা করাই মেছো বিড়াল বাঁচানোর প্রধান উপায়।',
              ]),
            ],
          },
          images: [catInline.imageUrl, catExtra.imageUrl],
          isPublished: true,
          isFeatured: true,
        },
        {
          title: 'শিশিরভেজা ঘাসফুলে প্রজাপতি ও ঝোপঝাড়ের ক্ষুদ্র প্রাণ',
          slug: 'morning-dew-butterflies-rural-hedgerows',
          shortDescription:
            'উত্তরবঙ্গের গ্রামীণ রাস্তার ধার, শালবন ও বুনো ফুলে রোদ পোহানো প্রজাপতি আর ম্যাক্রো ফটোগ্রাফির নোট।',
          coverImage: macroCover.imageUrl,
          coverImagePath: macroCover.storagePath,
          content: {
            type: 'doc',
            content: [
              p([
                {
                  text: 'সবসময় বড় প্রাণী বা দূরের বিলে না গিয়েও নিজের আশপাশের ঝোপঝাড়ে অসাধারণ সব ছবির বিষয় খুঁজে পাওয়া যায়। সকালবেলা যখন রোদ কেবল পাতার ওপর এসে পড়ে, তখন ডানায় জমে থাকা শিশির শুকাতে চুপচাপ বসে থাকে নানা রঙের প্রজাপতি।',
                },
              ]),
              h2('কেন ভোরের সময়টা ম্যাক্রো ছবির জন্য সেরা'),
              p([
                {
                  text: 'রাতে ঠান্ডার কারণে পতঙ্গদের চলাচল খুব ধীর থাকে। সকাল ৭টা থেকে ৮টার মধ্যে রোদ একটু গরম হতে শুরু করলে তারা ডানা মেলে রোদ পোহায়—তখন খুব কাছে না গিয়েও পরিষ্কার ছবি তোলা যায়।',
                },
              ]),
              figure(
                macroInline.imageUrl,
                'সবুজ পাতার আড়ালে গ্রামীণ বনের বাসিন্দা',
                'গ্রামীণ ঝোপ ও শালবনের প্রান্তে থাকা প্রাকৃতিক ভারসাম্যের অংশ।'
              ),
              p([
                {
                  text: 'রাস্তার পাশের বুনো লতাগুল্ম আর ছোট জলাশয়গুলো অক্ষত থাকলে হাজারো প্রজাপতি, ফড়িং ও ছোট সরীসৃপ নির্বিঘ্নে টিকে থাকে।',
                },
              ]),
            ],
          },
          images: [macroInline.imageUrl],
          isPublished: true,
          isFeatured: false,
        },
      ]);
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
