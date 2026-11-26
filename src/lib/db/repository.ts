import { desc, eq } from 'drizzle-orm';
import { db } from './index';
import {
  enquiries,
  heroSlides,
  photographs,
  siteProfiles,
  stories,
  videos,
} from './schema';
import { DEFAULT_HERO_SLIDES, DEFAULT_PROFILE } from '../defaults';
import { tiptapContentToHtml } from '../sanitizeHtml';
import { normalizeWildlifeCategory, sanitizeImageUrlList } from '../validation';
import { parseVideoUrl } from '../videoEmbed';
import type {
  Enquiry,
  HeroSlide,
  Photograph,
  SiteProfile,
  Story,
  VideoItem,
} from '../../types/portfolio';

export class DatabaseRepository {
  async getPublicPortfolio() {
    try {
      const [
        slidesList,
        photosList,
        videosList,
        storiesList,
        profilesList,
      ] = await Promise.all([
        db.select().from(heroSlides).orderBy(heroSlides.sortOrder, heroSlides.createdAt),
        db.select().from(photographs).orderBy(photographs.sortOrder, photographs.createdAt),
        db.select().from(videos).orderBy(videos.sortOrder, videos.createdAt),
        db.select().from(stories).orderBy(desc(stories.createdAt)),
        db.select().from(siteProfiles).limit(1),
      ]);

      const mappedSlides: HeroSlide[] = slidesList.map((s) => ({
        id: s.id,
        image: s.image,
        storagePath: s.storagePath || undefined,
        altText: s.altText || 'Wildlife of Bangladesh',
        sortOrder: s.sortOrder,
        isPublished: s.isPublished,
        createdAt: s.createdAt?.toISOString(),
        updatedAt: s.updatedAt?.toISOString(),
      }));

      const mappedPhotos: Photograph[] = photosList.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        image: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl || p.imageUrl,
        storagePath: p.storagePath || undefined,
        category: normalizeWildlifeCategory(p.category),
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
      }));

      const mappedVideos: VideoItem[] = videosList.map((v) => {
        const parsed = parseVideoUrl(v.videoUrl);
        return {
          id: v.id,
          title: v.title,
          description: v.description || '',
          videoUrl: v.videoUrl,
          thumbnail: v.thumbnail || parsed.thumbnailUrl || '',
          thumbnailPath: v.thumbnailPath || undefined,
          platform: parsed.platform || 'youtube',
          embedUrl: parsed.embedUrl,
          isFeatured: v.isFeatured,
          isPublished: v.isPublished,
          sortOrder: v.sortOrder,
          createdAt: v.createdAt?.toISOString(),
          updatedAt: v.updatedAt?.toISOString(),
        };
      });

      const mappedStories: Story[] = storiesList.map((st) => ({
        id: st.id,
        title: st.title,
        slug: st.slug,
        shortDescription: st.shortDescription || '',
        coverImage: st.coverImage,
        coverImagePath: st.coverImagePath || undefined,
        content: (st.content as Record<string, unknown>) || {},
        contentHtml: tiptapContentToHtml(st.content, st.shortDescription || ''),
        images: Array.isArray(st.images) ? st.images.filter((u) => typeof u === 'string' && u.length > 0) : [],
        isPublished: st.isPublished,
        isFeatured: st.isFeatured,
        createdAt: st.createdAt?.toISOString(),
        updatedAt: st.updatedAt?.toISOString(),
      }));

      const profile = profilesList[0];
      const social = (profile?.socialLinks as Record<string, unknown>) || {};
      const asText = (value: unknown): string => (typeof value === 'string' ? value : '');
      const mappedProfile: SiteProfile = profile
        ? {
            photographerName: profile.name || DEFAULT_PROFILE.photographerName,
            brandName: asText(social.brandName) || DEFAULT_PROFILE.brandName,
            location: asText(social.location) || DEFAULT_PROFILE.location,
            heroHeadline: asText(social.heroHeadline) || DEFAULT_PROFILE.heroHeadline,
            heroSubheadline: asText(social.heroSubheadline) || DEFAULT_PROFILE.heroSubheadline,
            bioHeadline: asText(social.bioHeadline) || profile.name || DEFAULT_PROFILE.bioHeadline,
            bioSummary: profile.biography || DEFAULT_PROFILE.bioSummary,
            passionNote:
              asText(social.passionNote) || asText(social.introBody) || DEFAULT_PROFILE.passionNote,
            journeyNote: asText(social.journeyNote) || DEFAULT_PROFILE.journeyNote,
            philosophy: asText(social.philosophy) || DEFAULT_PROFILE.philosophy,
            portraitUrl: profile.profileImage || '',
            aboutImages: sanitizeImageUrlList(social.aboutImages, 24),
            contactEmail: profile.email || DEFAULT_PROFILE.contactEmail,
            facebookUrl: asText(social.facebook) || DEFAULT_PROFILE.facebookUrl,
            instagramUrl: asText(social.instagram),
            youtubeUrl: asText(social.youtube),
            tiktokUrl: asText(social.tiktok),
          }
        : DEFAULT_PROFILE;

      return {
        heroSlides: mappedSlides,
        photographs: mappedPhotos,
        videos: mappedVideos,
        stories: mappedStories,
        profile: mappedProfile,
        databaseInfo: {
          mode: 'supabase-postgresql',
          dbName: 'Supabase PostgreSQL (Drizzle ORM)',
          storage: `Supabase Storage (${process.env.SUPABASE_STORAGE_BUCKET || 'wild_rahi'})`,
        },
      };
    } catch (err) {
      console.warn('[DatabaseRepository] Failed to fetch from database, returning defaults:', err);
      return {
        heroSlides: DEFAULT_HERO_SLIDES,
        photographs: [],
        videos: [],
        stories: [],
        profile: DEFAULT_PROFILE,
        databaseInfo: {
          mode: 'local-fallback',
          dbName: 'Unconnected (Configure .env.local)',
          storage: 'Local uploads',
        },
      };
    }
  }

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
        status: (e.status as Enquiry['status']) || 'new',
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
