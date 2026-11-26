import type { VideoPlatform } from '../lib/videoEmbed';
import type { WildlifeCategory } from '../lib/categories';

export type { WildlifeCategory };

export type EnquiryStatus = 'new' | 'reviewed' | 'replied' | 'archived';

export interface HeroSlide {
  id: string;
  image: string;
  storagePath?: string;
  altText: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Photograph {
  id: string;
  title: string;
  description: string;
  image: string;
  thumbnailUrl?: string;
  storagePath?: string;
  category: WildlifeCategory;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  thumbnailPath?: string;
  platform: VideoPlatform;
  embedUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  coverImagePath?: string;
  content: Record<string, unknown>;
  contentHtml: string;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteProfile {
  photographerName: string;
  brandName: string;
  location: string;
  heroHeadline: string;
  heroSubheadline: string;
  bioHeadline: string;
  bioSummary: string;
  passionNote: string;
  journeyNote: string;
  philosophy: string;
  portraitUrl: string;
  aboutImages: string[];
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface DatabaseInfo {
  mode: string;
  dbName: string;
  storage: string;
  usingDefaultCredentials?: boolean;
}
