import type { VideoPlatform } from '../lib/videoEmbed';

export type AspectRatio = '16:9' | '4:3' | '3:4' | '1:1';

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Data Deficient';

export type ArticleLanguage = 'en' | 'bn';

export type ArticleCategory =
  | 'Field Notes'
  | 'Biodiversity'
  | 'Conservation'
  | 'Photography Craft'
  | 'Habitat Documentation';

// Backward-compatible alias
export type StoryCategory = ArticleCategory;

export type VideoCategory =
  | 'Field Dispatches'
  | 'Birds in Motion'
  | 'Behind the Lens'
  | 'Conservation Reels'
  | 'Habitats of Bangladesh';

export type EnquiryType =
  | 'Professional Photography'
  | 'Image Licensing'
  | 'Conservation Collaboration'
  | 'Print Enquiry'
  | 'General';

export type EnquiryStatus = 'new' | 'reviewed' | 'replied' | 'archived';

export interface Photograph {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  aspectRatio: AspectRatio;
  collectionId: string;
  speciesSlug: string;
  speciesName: string;
  locationSlug: string;
  locationName: string;
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  year: string;
  featured: boolean;
  inHorizontalJourney: boolean;
  published: boolean;
  isPlaceholder: boolean;
  sortOrder: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  sortOrder: number;
}

export interface Species {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  bengaliName: string;
  habitat: string;
  habitatRegion: string;
  description: string;
  seasonality?: string;
  dietAndBehavior?: string;
  keyThreats?: string;
  conservationStatus: ConservationStatus;
  conservationSource: string;
  coverImageUrl: string;
  isPlaceholder: boolean;
}

export interface HabitatLocation {
  id: string;
  slug: string;
  name: string;
  region: string;
  ecosystem: string;
  description: string;
  coverImageUrl: string;
  isPlaceholder: boolean;
  sortOrder: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string;
  coverCaption?: string;
  category: ArticleCategory;
  tags: string[];
  language: ArticleLanguage;
  translationGroupId?: string;
  authorName: string;
  locationName: string;
  publishedDate: string;
  readTimeMinutes: number;
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
}

// Backward-compatible alias
export type FieldStory = Article;

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  platform: VideoPlatform;
  category: VideoCategory;
  thumbnailUrl: string;
  publishedDate: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  updatedAt?: string;
}

export interface SiteProfile {
  photographerName: string;
  brandName: string;
  location: string;
  locationBase?: string;
  fieldExperienceYears?: string;
  heroHeadline: string;
  heroSubheadline: string;
  introHeading: string;
  introBody: string;
  bioHeadline: string;
  bioSummary: string;
  journeyNote: string;
  whyWildlifeMatters: string;
  philosophy: string;
  equipmentNote: string;
  achievementsNote: string;
  printSpecsNote?: string;
  licensingNote?: string;
  portraitUrl: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  conservationHeadline: string;
  conservationStatement: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  organization: string;
  enquiryType: EnquiryType;
  subject: string;
  message: string;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface DatabaseInfo {
  engine: 'mongodb' | 'local-store';
  databaseName: string;
  connected: boolean;
  usingDefaultCredentials: boolean;
  collections: {
    photographs: number;
    collections: number;
    species: number;
    locations: number;
    articles: number;
    videos: number;
    enquiries: number;
  };
}

export interface GalleryFilterState {
  collectionId: string;
  locationSlug: string;
  speciesQuery: string;
  includeUnpublished?: boolean;
}
