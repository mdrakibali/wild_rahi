import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from '../src/lib/auth';
import {
  adminUsers,
  articleCategories,
  articles,
  categories,
  collectionPhotos,
  collections,
  locations,
  photographs,
  siteProfiles,
  siteSettings,
  species,
  videos,
} from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

async function seed() {
  console.log('[Seed] Connecting to PostgreSQL at:', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  try {
    console.log('[Seed] 1. Seeding Admin User...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@wildrahi.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'WildRahi#2026';

    const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail));
    let adminId = existingAdmin[0]?.id;
    if (!adminId) {
      const [inserted] = await db
        .insert(adminUsers)
        .values({
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          name: 'Razaul Hafiz Rahi',
        })
        .returning();
      adminId = inserted.id;
      console.log(`[Seed] Created admin: ${adminEmail} (Initial Password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Admin already exists: ${adminEmail}`);
    }

    console.log('[Seed] 2. Seeding Site Profile...');
    const existingProfile = await db.select().from(siteProfiles).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(siteProfiles).values({
        name: 'Razaul Hafiz Rahi',
        biography:
          'Independent wildlife photographer and conservation storyteller from Bangladesh documenting native biodiversity across mangroves, wetlands, hill forests, and coastal ecosystems.',
        biographyBn:
          'বাংলাদেশের বন্যপ্রাণী আলোকচিত্রী ও সংরক্ষণ কথাকার। সুন্দরবনের বাঘ থেকে শুরু করে হাওর-বিল ও চিরহরিৎ বনের জীববৈচিত্র্য ক্যামেরাবন্দি করাই তার প্রধান ব্রত।',
        profileImage: '/assets/images/portrait_photographer_field_1795067902652.jpg',
        email: 'contact@wildrahi.com',
        socialLinks: {
          facebook: 'https://www.facebook.com/WildRahi',
          instagram: 'https://www.instagram.com/wild_rahi',
          youtube: 'https://www.youtube.com/@WildRahi',
        },
        conservationContent:
          'Wild Rahi is committed to ethical field documentation—never disclosing sensitive coordinates, minimizing human footprint, and fostering conservation awareness.',
      });
      console.log('[Seed] Created default site profile');
    }

    console.log('[Seed] 3. Seeding Categories...');
    const categoryData = [
      { name: 'Mammals of Bangladesh', slug: 'mammals', description: 'Tigers, fishing cats, and mammals' },
      { name: 'Avian Diversity', slug: 'birds', description: 'Resident and migratory birds of Bangladesh' },
      { name: 'Reptiles & Amphibians', slug: 'reptiles', description: 'Vipers, turtles, and amphibians' },
      { name: 'Wetlands & Landscapes', slug: 'landscapes', description: 'Haors, rivers, and rainforests' },
      { name: 'Macro World', slug: 'insects', description: 'Insects and butterflies' },
    ];

    const categoryMap = new Map<string, string>();
    for (const cat of categoryData) {
      const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
      if (existing.length > 0) {
        categoryMap.set(cat.slug, existing[0].id);
      } else {
        const [inserted] = await db.insert(categories).values(cat).returning();
        categoryMap.set(cat.slug, inserted.id);
      }
    }

    console.log('[Seed] 4. Seeding Locations...');
    const locationData = [
      {
        name: 'Sundarbans Mangrove Forest',
        region: 'Khulna Division',
        country: 'Bangladesh',
        description: 'World largest mangrove delta, home to the Royal Bengal Tiger.',
        isSensitive: true,
      },
      {
        name: 'Tanguar Haor Ramsar Site',
        region: 'Sunamganj, Sylhet',
        country: 'Bangladesh',
        description: 'Vast freshwater wetland ecosystem supporting thousands of migratory birds.',
        isSensitive: false,
      },
      {
        name: 'Lawachara National Park',
        region: 'Moulvibazar, Sylhet',
        country: 'Bangladesh',
        description: 'Semi-evergreen rainforest with high canopy and rich reptile diversity.',
        isSensitive: true,
      },
    ];

    const locationMap = new Map<string, string>();
    for (const loc of locationData) {
      const existing = await db.select().from(locations).where(eq(locations.name, loc.name));
      if (existing.length > 0) {
        locationMap.set(loc.name, existing[0].id);
      } else {
        const [inserted] = await db.insert(locations).values(loc).returning();
        locationMap.set(loc.name, inserted.id);
      }
    }

    console.log('[Seed] 5. Seeding Species...');
    const speciesData = [
      {
        commonName: 'Bengal Tiger',
        banglaName: 'রয়েল বেঙ্গল টাইগার',
        scientificName: 'Panthera tigris',
        habitat: 'Mangrove swamps & tidal halophytic forests',
        conservationStatus: 'Endangered',
        iucnStatus: 'Critically Endangered (Bangladesh)',
        description: 'The iconic apex predator of the Sundarbans mangrove ecosystem.',
        coverImage: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
      },
      {
        commonName: 'Common Kingfisher',
        banglaName: 'পাতি মাছরাঙা',
        scientificName: 'Alcedo atthis',
        habitat: 'Clear streams, ponds, and freshwater marshes',
        conservationStatus: 'Least Concern',
        iucnStatus: 'Least Concern',
        description: 'Electric blue river bird known for rapid plunge dives.',
        coverImage: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
      },
      {
        commonName: 'Pied Kingfisher',
        banglaName: 'পাকড়া মাছরাঙা',
        scientificName: 'Ceryle rudis',
        habitat: 'Open waters, rivers, and haors',
        conservationStatus: 'Least Concern',
        iucnStatus: 'Least Concern',
        description: 'Black-and-white hovering kingfisher of open wetland surfaces.',
        coverImage: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
      },
      {
        commonName: 'Fishing Cat',
        banglaName: 'মেছোবাঘ',
        scientificName: 'Prionailurus viverrinus',
        habitat: 'Marshes, reed beds, and haor banks',
        conservationStatus: 'Vulnerable',
        iucnStatus: 'Endangered (Bangladesh)',
        description: 'Wetland feline adapted for aquatic hunting with semi-webbed paws.',
        coverImage: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
      },
      {
        commonName: 'Green Pit Viper',
        banglaName: 'সবুজ বোড়া',
        scientificName: 'Trimeresurus albolabris',
        habitat: 'Dense tropical foliage and tea garden edges',
        conservationStatus: 'Least Concern',
        iucnStatus: 'Least Concern',
        description: 'Arboreal venomous pit viper perfectly camouflaged in rainforest canopies.',
        coverImage: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
      },
      {
        commonName: 'Common Mormon Swallowtail',
        banglaName: 'সোয়ালোটেল প্রজাপতি',
        scientificName: 'Papilio polytes',
        habitat: 'Forest margins and garden blossoms',
        conservationStatus: 'Least Concern',
        iucnStatus: 'Least Concern',
        description: 'Striking black swallowtail butterfly exhibiting fascinating mimicry.',
        coverImage: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
      },
    ];

    const speciesMap = new Map<string, string>();
    for (const spec of speciesData) {
      const existing = await db.select().from(species).where(eq(species.scientificName, spec.scientificName));
      if (existing.length > 0) {
        speciesMap.set(spec.scientificName, existing[0].id);
      } else {
        const [inserted] = await db.insert(species).values(spec).returning();
        speciesMap.set(spec.scientificName, inserted.id);
      }
    }

    console.log('[Seed] 6. Seeding Collections...');
    const collectionData = [
      {
        title: 'Shadows of the Mangrove',
        slug: 'shadows-of-the-mangrove',
        description: 'The elusive apex predators and tidally submerged life of the Sundarbans.',
        coverImage: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        title: 'Haor Dispatches',
        slug: 'haor-dispatches',
        description: 'Documenting the vast freshwater wetlands of Sunamganj and the fishing cats.',
        coverImage: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
        isFeatured: true,
        sortOrder: 2,
      },
      {
        title: 'Avian Jewels of Sylhet',
        slug: 'avian-jewels-of-sylhet',
        description: 'Vibrant plumage and intimate nesting behaviors in the rainforest canopy.',
        coverImage: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
        isFeatured: true,
        sortOrder: 3,
      },
    ];

    const collectionMap = new Map<string, string>();
    for (const col of collectionData) {
      const existing = await db.select().from(collections).where(eq(collections.slug, col.slug));
      if (existing.length > 0) {
        collectionMap.set(col.slug, existing[0].id);
      } else {
        const [inserted] = await db.insert(collections).values(col).returning();
        collectionMap.set(col.slug, inserted.id);
      }
    }

    console.log('[Seed] 7. Seeding Photographs...');
    const photoData = [
      {
        title: 'The Ghost of Sundarbans',
        slug: 'the-ghost-of-sundarbans',
        description: 'A male Royal Bengal Tiger silently surveying the riverbank at sunset.',
        imageUrl: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        thumbnailUrl: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        categoryId: categoryMap.get('mammals'),
        speciesId: speciesMap.get('Panthera tigris'),
        locationId: locationMap.get('Sundarbans Mangrove Forest'),
        camera: 'Sony Alpha 1',
        lens: 'FE 600mm f/4 GM OSS',
        settings: { aperture: 'f/4.0', shutterSpeed: '1/1600s', iso: '800', focalLength: '600mm' },
        isFeatured: true,
        sortOrder: 1,
        status: 'published',
      },
      {
        title: 'Canopy Sentinel: Common Kingfisher',
        slug: 'canopy-sentinel-common-kingfisher',
        description: 'Perched over a freshwater forest brook in Lawachara.',
        imageUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
        thumbnailUrl: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
        categoryId: categoryMap.get('birds'),
        speciesId: speciesMap.get('Alcedo atthis'),
        locationId: locationMap.get('Lawachara National Park'),
        camera: 'Sony Alpha 1',
        lens: 'FE 200-600mm f/5.6-6.3 G',
        settings: { aperture: 'f/6.3', shutterSpeed: '1/2500s', iso: '1250', focalLength: '560mm' },
        isFeatured: true,
        sortOrder: 2,
        status: 'published',
      },
      {
        title: 'Pied Kingfisher Mid-Air Strike',
        slug: 'pied-kingfisher-mid-air-strike',
        description: 'Hovering over Tanguar Haor right before diving for small fish.',
        imageUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
        thumbnailUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
        categoryId: categoryMap.get('birds'),
        speciesId: speciesMap.get('Ceryle rudis'),
        locationId: locationMap.get('Tanguar Haor Ramsar Site'),
        camera: 'Sony Alpha 1',
        lens: 'FE 600mm f/4 GM OSS',
        settings: { aperture: 'f/5.0', shutterSpeed: '1/4000s', iso: '640', focalLength: '600mm' },
        isFeatured: true,
        sortOrder: 3,
        status: 'published',
      },
      {
        title: 'Wetland Nocturne: The Fishing Cat',
        slug: 'wetland-nocturne-the-fishing-cat',
        description: 'An endangered fishing cat prowling through reeds in Sunamganj.',
        imageUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
        thumbnailUrl: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
        categoryId: categoryMap.get('mammals'),
        speciesId: speciesMap.get('Prionailurus viverrinus'),
        locationId: locationMap.get('Tanguar Haor Ramsar Site'),
        camera: 'Sony A7R V',
        lens: 'FE 70-200mm f/2.8 GM OSS II',
        settings: { aperture: 'f/2.8', shutterSpeed: '1/500s', iso: '3200', focalLength: '200mm' },
        isFeatured: true,
        sortOrder: 4,
        status: 'published',
      },
      {
        title: 'Tanguar Haor Waterscape at Dawn',
        slug: 'tanguar-haor-waterscape-at-dawn',
        description: 'Silent mist over the Ramsar wetland with water lily beds.',
        imageUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
        thumbnailUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
        categoryId: categoryMap.get('landscapes'),
        locationId: locationMap.get('Tanguar Haor Ramsar Site'),
        camera: 'Sony A7R V',
        lens: 'FE 24-70mm f/2.8 GM II',
        settings: { aperture: 'f/8.0', shutterSpeed: '1/250s', iso: '100', focalLength: '35mm' },
        isFeatured: true,
        sortOrder: 5,
        status: 'published',
      },
      {
        title: 'Emerald Coil: Green Pit Viper',
        slug: 'emerald-coil-green-pit-viper',
        description: 'Coiled resting on rainforest fern branches in Lawachara.',
        imageUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
        thumbnailUrl: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
        categoryId: categoryMap.get('reptiles'),
        speciesId: speciesMap.get('Trimeresurus albolabris'),
        locationId: locationMap.get('Lawachara National Park'),
        camera: 'Sony A7R V',
        lens: 'FE 90mm f/2.8 Macro G OSS',
        settings: { aperture: 'f/5.6', shutterSpeed: '1/320s', iso: '400', focalLength: '90mm' },
        isFeatured: true,
        sortOrder: 6,
        status: 'published',
      },
      {
        title: 'Swallowtail on Wild Bloom',
        slug: 'swallowtail-on-wild-bloom',
        description: 'Common Mormon drinking nectar in the tea estate borders.',
        imageUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
        thumbnailUrl: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
        categoryId: categoryMap.get('insects'),
        speciesId: speciesMap.get('Papilio polytes'),
        locationId: locationMap.get('Lawachara National Park'),
        camera: 'Sony A7R V',
        lens: 'FE 90mm f/2.8 Macro G OSS',
        settings: { aperture: 'f/4.0', shutterSpeed: '1/1000s', iso: '250', focalLength: '90mm' },
        isFeatured: true,
        sortOrder: 7,
        status: 'published',
      },
    ];

    for (const photo of photoData) {
      const existing = await db.select().from(photographs).where(eq(photographs.slug, photo.slug));
      let photoId = existing[0]?.id;
      if (!photoId) {
        const [inserted] = await db.insert(photographs).values(photo).returning();
        photoId = inserted.id;
      }

      // Link to collections
      if (photo.slug.includes('tiger') && collectionMap.get('shadows-of-the-mangrove')) {
        await db.insert(collectionPhotos).values({
          collectionId: collectionMap.get('shadows-of-the-mangrove')!,
          photographId: photoId,
          sortOrder: 1,
        }).onConflictDoNothing();
      }
      if ((photo.slug.includes('fishing-cat') || photo.slug.includes('tanguar') || photo.slug.includes('pied')) && collectionMap.get('haor-dispatches')) {
        await db.insert(collectionPhotos).values({
          collectionId: collectionMap.get('haor-dispatches')!,
          photographId: photoId,
          sortOrder: 2,
        }).onConflictDoNothing();
      }
      if (photo.slug.includes('kingfisher') && collectionMap.get('avian-jewels-of-sylhet')) {
        await db.insert(collectionPhotos).values({
          collectionId: collectionMap.get('avian-jewels-of-sylhet')!,
          photographId: photoId,
          sortOrder: 3,
        }).onConflictDoNothing();
      }
    }

    console.log('[Seed] 8. Seeding Article Categories & Demo Articles...');
    const artCats = [
      { name: 'Field Notes', slug: 'field-notes', description: 'Real-time observation notes from the wild' },
      { name: 'Conservation', slug: 'conservation', description: 'Monographs on threatened habitats and species' },
      { name: 'Biodiversity', slug: 'biodiversity', description: 'Detailed species analyses' },
      { name: 'Photography Craft', slug: 'craft', description: 'Ethical wildlife photography techniques' },
    ];

    const artCatMap = new Map<string, string>();
    for (const c of artCats) {
      const existing = await db.select().from(articleCategories).where(eq(articleCategories.slug, c.slug));
      if (existing.length > 0) {
        artCatMap.set(c.slug, existing[0].id);
      } else {
        const [inserted] = await db.insert(articleCategories).values(c).returning();
        artCatMap.set(c.slug, inserted.id);
      }
    }

    const demoArticleBn = {
      title: 'সুন্দরবনের নিঃশব্দ পদধ্বনি: রয়েল বেঙ্গল টাইগারের সন্ধানে',
      slug: 'sundarbans-royal-bengal-tiger-tracking',
      excerpt:
        'জোয়ার-ভাটার কাদাজলে বাঘের তাজা পদচিহ্ন আর বাওয়ালিদের ফিসফিসানি—ম্যানগ্রোভের গভীর অরণ্যে এক সপ্তাহের চরম ধৈর্যের গল্প।',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'ম্যানগ্রোভ অরণ্যে বন্যপ্রাণী ছবি তোলার সবচেয়ে বড় নিয়ম হলো প্রকৃতিকে তাড়াহুড়ো করানো যায় না। কাদা, বিষাক্ত কাঁটাওয়ালা শ্বাসমূল (নিউম্যাটোফোর) আর জোয়ারের পানির সাথে তাল মিলিয়ে অপেক্ষা করতে হয় ঘণ্টার পর ঘণ্টা।',
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
                text: 'ভোরের প্রথম আলো যখন কটকার খালের কিনারে এসে পড়ল, তখন কাদায় চোখে পড়ল সদ্য ফেলে যাওয়া বাঘের থাবার দাগ। নদীর মিষ্টি পানির খোঁজে সে খুব কাছেই কোথাও অপেক্ষা করছিল। নিঃশব্দে ট্রাইপড নামিয়ে আমরা দূরপাল্লার লেন্স তাক করে রইলাম।',
              },
            ],
          },
        ],
      },
      contentFormat: 'tiptap_json',
      language: 'bn',
      coverImage: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
      categoryId: artCatMap.get('field-notes'),
      author: 'Razaul Hafiz Rahi',
      publishedAt: new Date(),
      isFeatured: true,
      status: 'published',
      seoTitle: 'সুন্দরবনের বাঘের সন্ধানে — Wild Rahi',
      seoDescription: 'সুন্দরবনের রয়েল বেঙ্গল টাইগারের ছবি তোলার অভিজ্ঞতা ও ফিল্ড নোট।',
    };

    const existingArt = await db.select().from(articles).where(eq(articles.slug, demoArticleBn.slug));
    if (existingArt.length === 0) {
      await db.insert(articles).values(demoArticleBn);
      console.log('[Seed] Created demo Bangla article');
    }

    console.log('[Seed] 9. Seeding Videos...');
    const videoData = [
      {
        title: 'Eye to Eye with the Tiger of Sundarbans',
        description: 'Field recording from the canal banks of Katka during winter mist.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        category: 'Field Dispatches',
        isFeatured: true,
        sortOrder: 1,
        status: 'published',
      },
      {
        title: 'Flight of the Pied Kingfisher',
        description: 'Slow motion hovering sequence captured over the serene waters of Tanguar Haor.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
        category: 'Birds in Motion',
        isFeatured: true,
        sortOrder: 2,
        status: 'published',
      },
    ];

    for (const vid of videoData) {
      const existing = await db.select().from(videos).where(eq(videos.videoUrl, vid.videoUrl));
      if (existing.length === 0) {
        await db.insert(videos).values(vid);
      }
    }

    console.log('[Seed] 10. Seeding Site Settings...');
    const defaultSettings = [
      { key: 'site_title', value: { title: 'Wild Rahi — Razaul Hafiz Rahi | Wildlife Photography' } },
      { key: 'announcement', value: { active: false, message: '' } },
      { key: 'contact_info', value: { email: 'contact@wildrahi.com', phone: '+880 1700-000000', location: 'Dhaka, Bangladesh' } },
    ];

    for (const set of defaultSettings) {
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, set.key));
      if (existing.length === 0) {
        await db.insert(siteSettings).values(set);
      }
    }

    console.log('[Seed] ✓ Database seeding completed successfully!');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});

