import { desc, eq } from 'drizzle-orm';
import { db } from './index';
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
  species,
  videos,
} from './schema';
import { DEFAULT_PROFILE } from '../defaults';
import type {
  Article,
  Collection,
  Enquiry,
  HabitatLocation,
  Photograph,
  SiteProfile,
  Species as SpeciesType,
  VideoItem,
} from '../../types/portfolio';

export class DatabaseRepository {
  // --- Public Portfolio Data ---
  async getPublicPortfolio() {
    try {
      const [
        photosList,
        colsList,
        speciesList,
        locsList,
        articlesList,
        videosList,
        profilesList,
      ] = await Promise.all([
        db.select().from(photographs).orderBy(photographs.sortOrder),
        db.select().from(collections).orderBy(collections.sortOrder),
        db.select().from(species),
        db.select().from(locations).orderBy(locations.sortOrder),
        db.select().from(articles).orderBy(desc(articles.publishedAt)),
        db.select().from(videos).orderBy(videos.sortOrder),
        db.select().from(siteProfiles).limit(1),
      ]);

      // Map to frontend types
      const mappedPhotos: Photograph[] = photosList.map((p) => ({
        id: p.id,
        title: p.title,
        caption: p.description || '',
        imageUrl: p.imageUrl,
        aspectRatio: '4:3',
        collectionId: p.categoryId || '',
        speciesSlug: '',
        speciesName: '',
        locationSlug: '',
        locationName: '',
        camera: p.camera || '',
        lens: p.lens || '',
        focalLength: (p.settings as Record<string, string>)?.focalLength || '',
        aperture: (p.settings as Record<string, string>)?.aperture || '',
        shutterSpeed: (p.settings as Record<string, string>)?.shutterSpeed || '',
        iso: (p.settings as Record<string, string>)?.iso || '',
        year: p.photographedAt
          ? `${new Date(p.photographedAt).toLocaleString('en-US', { month: 'short' })} ${new Date(p.photographedAt).getFullYear()}`
          : 'Feb 2026',
        month: p.photographedAt
          ? new Date(p.photographedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })
          : 'February 2026',
        createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
        featured: p.isFeatured,
        inHorizontalJourney: p.isFeatured,
        published: p.status === 'published',
        isPlaceholder: false,
        sortOrder: p.sortOrder,
      }));

      const mappedCollections: Collection[] = colsList.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description || '',
        coverImageUrl: c.coverImage,
        sortOrder: c.sortOrder,
      }));

      const mappedSpecies: SpeciesType[] = speciesList.map((s) => ({
        id: s.id,
        slug: s.scientificName.toLowerCase().replace(/\s+/g, '-'),
        commonName: s.commonName,
        scientificName: s.scientificName,
        bengaliName: s.banglaName || '',
        habitat: s.habitat || '',
        habitatRegion: '',
        description: s.description || '',
        conservationStatus: (s.conservationStatus as SpeciesType['conservationStatus']) || 'Least Concern',
        conservationSource: 'IUCN Red List of Threatened Species',
        coverImageUrl: s.coverImage || '',
        isPlaceholder: false,
      }));

      const mappedLocations: HabitatLocation[] = locsList.map((l) => ({
        id: l.id,
        slug: l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: l.name,
        region: l.region || '',
        ecosystem: l.description || '',
        description: l.description || '',
        coverImageUrl: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
        isPlaceholder: false,
        sortOrder: 10,
      }));

      const mappedArticles: Article[] = articlesList.map((a) => {
        let contentHtml = '';
        if (typeof a.content === 'object' && a.content !== null) {
          // If Tiptap JSON, extract basic paragraphs for text-view
          const doc = a.content as { content?: Array<{ content?: Array<{ text?: string }> }> };
          if (Array.isArray(doc.content)) {
            contentHtml = doc.content
              .map((node) => node.content?.map((c) => c.text || '').join('') || '')
              .filter(Boolean)
              .map((p) => `<p>${p}</p>`)
              .join('');
          }
        }
        return {
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt || '',
          contentHtml: contentHtml || `<p>${a.excerpt || ''}</p>`,
          coverImageUrl: a.coverImage,
          coverCaption: '',
          category: 'Field Notes',
          tags: [],
          language: a.language === 'bn' ? 'bn' : 'en',
          authorName: a.author,
          locationName: '',
          published: a.status === 'published',
          publishedDate: a.publishedAt ? new Date(a.publishedAt).toISOString().split('T')[0] : '2025-01-01',
          readTimeMinutes: 4,
          featured: a.isFeatured,
          seoTitle: a.seoTitle || undefined,
          seoDescription: a.seoDescription || undefined,
        };
      });

      const mappedVideos: VideoItem[] = videosList.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description || '',
        videoUrl: v.videoUrl,
        platform: (v.platform as VideoItem['platform']) || 'youtube',
        category: (v.category as VideoItem['category']) || 'Field Dispatches',
        thumbnailUrl: v.thumbnailUrl || '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
        publishedDate: v.createdAt ? v.createdAt.toISOString().slice(0, 10) : '2025-01-01',
        featured: v.isFeatured,
        published: v.status === 'published',
        sortOrder: v.sortOrder,
      }));

      const profile = profilesList[0];
      const social = (profile?.socialLinks as Record<string, string>) || {};
      const mappedProfile: SiteProfile = profile
        ? {
            ...DEFAULT_PROFILE,
            photographerName: profile.name,
            bioSummary: profile.biography || DEFAULT_PROFILE.bioSummary,
            portraitUrl: profile.profileImage || DEFAULT_PROFILE.portraitUrl,
            contactEmail: profile.email || DEFAULT_PROFILE.contactEmail,
            facebookUrl: social.facebook || DEFAULT_PROFILE.facebookUrl,
            instagramUrl: social.instagram || '',
            youtubeUrl: social.youtube || '',
            tiktokUrl: social.tiktok || '',
            bioHeadline: social.bioHeadline || DEFAULT_PROFILE.bioHeadline,
            location: social.location || DEFAULT_PROFILE.location,
            equipmentNote: social.equipmentNote || DEFAULT_PROFILE.equipmentNote,
            journeyNote: social.journeyNote || DEFAULT_PROFILE.journeyNote,
            whyWildlifeMatters: social.whyWildlifeMatters || DEFAULT_PROFILE.whyWildlifeMatters,
            philosophy: social.philosophy || DEFAULT_PROFILE.philosophy,
            achievementsNote: social.achievementsNote || DEFAULT_PROFILE.achievementsNote,
            printSpecsNote: social.printSpecsNote || DEFAULT_PROFILE.printSpecsNote,
            licensingNote: social.licensingNote || DEFAULT_PROFILE.licensingNote,
            heroHeadline: social.heroHeadline || DEFAULT_PROFILE.heroHeadline,
            heroSubheadline: social.heroSubheadline || DEFAULT_PROFILE.heroSubheadline,
            introBody: social.introBody || DEFAULT_PROFILE.introBody,
            conservationStatement: profile.conservationContent || DEFAULT_PROFILE.conservationStatement,
          }
        : DEFAULT_PROFILE;

      return {
        photographs: mappedPhotos,
        collections: mappedCollections,
        species: mappedSpecies,
        locations: mappedLocations,
        articles: mappedArticles,
        videos: mappedVideos,
        profile: mappedProfile,
        databaseInfo: {
          mode: 'supabase-postgresql',
          dbName: 'Supabase PostgreSQL (Drizzle ORM)',
          storage: `Supabase Storage (${process.env.SUPABASE_STORAGE_BUCKET || 'wild_rakib'})`,
        },
      };
    } catch (err) {
      console.warn('[DatabaseRepository] Failed to fetch from database, returning defaults:', err);
      return {
        photographs: [],
        collections: [],
        species: [],
        locations: [],
        articles: [],
        videos: [],
        profile: DEFAULT_PROFILE,
        databaseInfo: {
          mode: 'local-fallback',
          dbName: 'Unconnected (Configure .env.local)',
          storage: 'Local uploads',
        },
      };
    }
  }

  // --- Enquiries ---
  async createEnquiry(data: { name: string; email: string; subject: string; message: string }) {
    const [inserted] = await db
      .insert(enquiries)
      .values({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'new',
      })
      .returning();
    return inserted;
  }

  async getEnquiries(): Promise<Enquiry[]> {
    try {
      const records = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
      return records.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        subject: e.subject,
        message: e.message,
        organization: '',
        enquiryType: 'General',
        status: (e.status as Enquiry['status']) || 'new',
        adminNotes: '',
        createdAt: e.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async updateEnquiryStatus(id: string, status: string) {
    const [updated] = await db
      .update(enquiries)
      .set({ status })
      .where(eq(enquiries.id, id))
      .returning();
    return updated;
  }

  async deleteEnquiry(id: string) {
    await db.delete(enquiries).where(eq(enquiries.id, id));
    return true;
  }
}

export const repository = new DatabaseRepository();
