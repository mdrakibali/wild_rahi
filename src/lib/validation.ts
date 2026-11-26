import type { Photograph } from '../types/portfolio';
import {
  ALLOWED_WILDLIFE_CATEGORIES,
  WILDLIFE_CATEGORIES,
  type WildlifeCategory,
} from './categories';

export { ALLOWED_WILDLIFE_CATEGORIES, WILDLIFE_CATEGORIES };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidDocumentId(id: string): boolean {
  return ID_PATTERN.test(id);
}

export function normalizeWildlifeCategory(input?: string | null): WildlifeCategory {
  const val = (input || '').trim().toLowerCase();
  if (!val) return 'others';
  if (ALLOWED_WILDLIFE_CATEGORIES.includes(val as WildlifeCategory)) {
    return val as WildlifeCategory;
  }
  if (val.includes('mammal') || val.includes('tiger') || val.includes('bengal') || val.includes('cat')) {
    return 'mammals';
  }
  if (val.includes('bird') || val.includes('avian') || val.includes('waterfowl') || val.includes('kingfisher')) {
    return 'birds';
  }
  if (val.includes('reptile') || val.includes('snake') || val.includes('viper')) {
    return 'reptiles';
  }
  if (val.includes('amphib') || val.includes('frog')) {
    return 'amphibians';
  }
  if (val.includes('insect') || val.includes('macro') || val.includes('butterfl')) {
    return 'insects';
  }
  if (
    val.includes('wetland') ||
    val.includes('beel') ||
    val.includes('char') ||
    val.includes('river') ||
    val.includes('haor')
  ) {
    return 'wetlands';
  }
  if (val.includes('flora') || val.includes('flower') || val.includes('plant') || val.includes('bloom')) {
    return 'flora';
  }
  if (
    val.includes('landscape') ||
    val.includes('habitat') ||
    val.includes('forest') ||
    val.includes('sundarban') ||
    val.includes('mangrove')
  ) {
    return 'landscapes';
  }
  return 'others';
}

export function getWildlifeCategoryLabel(category: WildlifeCategory): string {
  return WILDLIFE_CATEGORIES.find((c) => c.id === category)?.label || 'Others';
}

export function toSafeSlug(input: string, maxLength = 72): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength);
  return cleaned || `story-${Date.now()}`;
}

export function filterPhotographs(
  photographs: readonly Photograph[],
  options: { category?: string; includeUnpublished?: boolean; featuredOnly?: boolean }
): Photograph[] {
  return photographs
    .filter((photo) => {
      if (!options.includeUnpublished && !photo.isPublished) {
        return false;
      }
      if (options.featuredOnly && !photo.isFeatured) {
        return false;
      }
      if (
        options.category &&
        options.category !== 'all' &&
        photo.category !== options.category
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export interface EnquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EnquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof EnquiryInput, string>>;
  sanitized: EnquiryInput;
}

export function sanitizeImageUrlList(input: unknown, maxItems = 24): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const entry of input) {
    if (typeof entry !== 'string') continue;
    const url = entry.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    cleaned.push(url);
    if (cleaned.length >= maxItems) break;
  }

  return cleaned;
}

export function validateEnquiryInput(input: EnquiryInput): EnquiryValidationResult {
  const sanitized: EnquiryInput = {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 160),
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
