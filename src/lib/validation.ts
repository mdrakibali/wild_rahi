import type {
  AspectRatio,
  ConservationStatus,
  EnquiryType,
  GalleryFilterState,
  Photograph,
  Species,
  StoryCategory,
} from '../types/portfolio';

export const ALLOWED_ASPECT_RATIOS: readonly AspectRatio[] = ['16:9', '4:3', '3:4', '1:1'];

export const ALLOWED_CONSERVATION_STATUSES: readonly ConservationStatus[] = [
  'Least Concern',
  'Near Threatened',
  'Vulnerable',
  'Endangered',
  'Critically Endangered',
  'Data Deficient',
];

export const ALLOWED_ARTICLE_CATEGORIES: readonly StoryCategory[] = [
  'Field Notes',
  'Biodiversity',
  'Conservation',
  'Photography Craft',
  'Habitat Documentation',
];

export const ALLOWED_STORY_CATEGORIES = ALLOWED_ARTICLE_CATEGORIES;

export const ALLOWED_VIDEO_CATEGORIES = [
  'Field Dispatches',
  'Birds in Motion',
  'Behind the Lens',
  'Conservation Reels',
  'Habitats of Bangladesh',
] as const;

export const ALLOWED_ENQUIRY_TYPES: readonly EnquiryType[] = [
  'Professional Photography',
  'Image Licensing',
  'Conservation Collaboration',
  'Print Enquiry',
  'General',
];

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Generates a URL-safe, Firestore-ID-compliant slug matching ^[a-z0-9-]+$.
 */
export function toSafeSlug(input: string, maxLength = 64): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength);
  return cleaned || `entry-${Date.now()}`;
}

export function isValidDocumentId(id: string): boolean {
  return ID_PATTERN.test(id);
}

/**
 * Filters photographs deterministically by published flag, collection, location, and species/title search.
 */
export function filterPhotographs(
  photographs: readonly Photograph[],
  filters: GalleryFilterState
): Photograph[] {
  const query = filters.speciesQuery.trim().toLowerCase();

  return photographs
    .filter((photo) => {
      if (!filters.includeUnpublished && !photo.published) {
        return false;
      }
      if (filters.collectionId && filters.collectionId !== 'all' && photo.collectionId !== filters.collectionId) {
        return false;
      }
      if (filters.locationSlug && filters.locationSlug !== 'all' && photo.locationSlug !== filters.locationSlug) {
        return false;
      }
      if (query) {
        const haystack = [
          photo.speciesName,
          photo.title,
          photo.locationName,
          photo.caption,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Counts published photographs per collection ID.
 */
export function countPhotosByCollection(photographs: readonly Photograph[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const photo of photographs) {
    if (!photo.published) continue;
    counts[photo.collectionId] = (counts[photo.collectionId] ?? 0) + 1;
  }
  return counts;
}

/**
 * Filters species records by habitat region, conservation status, or search term.
 */
export function filterSpeciesArchive(
  speciesList: readonly Species[],
  options: { region?: string; status?: string; search?: string }
): Species[] {
  const q = (options.search ?? '').trim().toLowerCase();
  return speciesList.filter((item) => {
    if (options.region && options.region !== 'all' && item.habitatRegion !== options.region) {
      return false;
    }
    if (options.status && options.status !== 'all' && item.conservationStatus !== options.status) {
      return false;
    }
    if (q) {
      const text = [
        item.commonName,
        item.scientificName,
        item.bengaliName,
        item.habitat,
        item.habitatRegion,
      ]
        .join(' ')
        .toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Formats EXIF technical camera metadata cleanly without empty tokens.
 */
export function formatExifMetadata(photo: Pick<Photograph, 'camera' | 'lens' | 'focalLength' | 'aperture' | 'shutterSpeed' | 'iso'>): string {
  const parts = [
    photo.camera,
    photo.lens,
    photo.focalLength,
    photo.aperture,
    photo.shutterSpeed,
    photo.iso ? (photo.iso.toUpperCase().startsWith('ISO') ? photo.iso : `ISO ${photo.iso}`) : '',
  ]
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.join(' · ');
}

export interface EnquiryInput {
  name: string;
  email: string;
  organization: string;
  enquiryType: EnquiryType;
  subject: string;
  message: string;
}

export interface EnquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof EnquiryInput, string>>;
  sanitized: EnquiryInput;
}

/**
 * Validates and sanitizes enquiry submissions in strict sync with firebase-blueprint.json bounds.
 */
export function validateEnquiryInput(input: EnquiryInput): EnquiryValidationResult {
  const sanitized: EnquiryInput = {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 160),
    organization: input.organization.trim().slice(0, 160),
    enquiryType: ALLOWED_ENQUIRY_TYPES.includes(input.enquiryType)
      ? input.enquiryType
      : 'General',
    subject: input.subject.trim().slice(0, 200),
    message: input.message.trim().slice(0, 4000),
  };

  const errors: Partial<Record<keyof EnquiryInput, string>> = {};

  if (sanitized.name.length < 1) {
    errors.name = 'Please enter your name.';
  }
  if (!EMAIL_PATTERN.test(sanitized.email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if (sanitized.subject.length < 1) {
    errors.subject = 'Please add a short subject line.';
  }
  if (sanitized.message.length < 10) {
    errors.message = 'Please share at least 10 characters describing your enquiry.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

/**
 * Returns Tailwind aspect-ratio class corresponding to natural photo ratio.
 */
export function getAspectRatioClass(ratio: AspectRatio): string {
  switch (ratio) {
    case '16:9':
      return 'aspect-[16/9]';
    case '3:4':
      return 'aspect-[3/4]';
    case '1:1':
      return 'aspect-square';
    case '4:3':
    default:
      return 'aspect-[4/3]';
  }
}
