import type { HeroSlide, SiteProfile } from '../types/portfolio';

export const DEFAULT_PROFILE: SiteProfile = {
  photographerName: 'Razaul Hafiz Rahi',
  brandName: 'Wild Rahi',
  location: 'Thakurgaon, Rangpur, North Bengal',
  heroHeadline: 'Wildlife of North Bengal.',
  heroSubheadline:
    'Birds, mammals, wetlands, and flora photographed in natural light by Razaul Hafiz Rahi.',
  bioHeadline: 'Razaul Hafiz Rahi',
  bioSummary:
    'Wildlife photographer based in Thakurgaon, North Bengal. Documenting birds, mammals, wetlands, and rural landscapes in natural light.',
  passionNote:
    'Working quietly along northern rivers, wetlands, and woodlands to photograph species in their natural habitat without disturbing them.',
  journeyNote:
    'What started along local riverbanks in Thakurgaon photographing kingfishers and shy wetland mammals grew into ongoing documentation across North Bengal.',
  philosophy:
    'The safety and calm of the animal always come before getting a shot—no baiting, no nesting disturbance, and keeping sensitive sites private.',
  portraitUrl: '/assets/images/portrait_photographer_field_1795067902652.jpg',
  aboutImages: [],
  contactEmail: 'contact@wildrahi.com',
  facebookUrl: 'https://www.facebook.com/WildRahi',
  instagramUrl: 'https://www.instagram.com/wildrahi',
  youtubeUrl: '',
  tiktokUrl: '',
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'default-hero-1',
    image: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
    altText: 'Pied Kingfisher hovering in early morning light over northern river waters',
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 'default-hero-2',
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    altText: 'Fishing Cat moving quietly through northern wetland reeds',
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 'default-hero-3',
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    altText: 'Common Kingfisher perched above a quiet woodland stream',
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 'default-hero-4',
    image: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
    altText: 'Misty dawn across seasonal wetlands and reedbeds of North Bengal',
    sortOrder: 4,
    isPublished: true,
  },
];
