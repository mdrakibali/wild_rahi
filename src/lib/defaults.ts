import type { SiteProfile } from '../types/portfolio';

/**
 * Minimal brand identity fallback used only before API hydration or on a fresh empty database.
 * All portfolio photographs, collections, species, habitats, articles, and videos load from the database.
 */
export const DEFAULT_PROFILE: SiteProfile = {
  photographerName: 'Razaul Hafiz Rahi',
  brandName: 'Wild Rahi',
  location: 'Bangladesh',
  locationBase: 'Bangladesh',
  fieldExperienceYears: '',
  heroHeadline: 'Through the lens, a voice for the wild.',
  heroSubheadline:
    "Documenting the beauty, diversity and untold stories of Bangladesh's wildlife.",
  introHeading: 'Every frame holds a story.',
  introBody:
    'Wild Rahi is the independent wildlife photography practice of Razaul Hafiz Rahi in Bangladesh, rooted in patient field observation, natural light, and ethical wildlife documentation.',
  bioHeadline: 'Razaul Hafiz Rahi — Wild Rahi',
  bioSummary:
    'Independent wildlife photographer and conservation storyteller from Bangladesh documenting native biodiversity across mangroves, wetlands, hill forests, and coastal ecosystems.',
  journeyNote: '',
  whyWildlifeMatters: '',
  philosophy:
    'The welfare of the living subject always precedes the photograph. Sensitive coordinates of wildlife and breeding habitats are never disclosed.',
  equipmentNote: '',
  achievementsNote: '',
  printSpecsNote: '',
  licensingNote: '',
  portraitUrl: '',
  contactEmail: 'contact@wildrahi.com',
  facebookUrl: 'https://www.facebook.com/WildRahi',
  instagramUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  conservationHeadline: 'Photography can give nature a voice.',
  conservationStatement:
    'Wild Rahi is committed to ethical field documentation—never disclosing sensitive coordinates, minimizing human footprint, and fostering conservation awareness.',
};
