import type { HeroSlide, SiteProfile } from '../types/portfolio';

export const DEFAULT_PROFILE: SiteProfile = {
  photographerName: 'Razaul Hafiz Rahi',
  brandName: 'Wild Rahi',
  location: 'Thakurgaon, Rangpur, North Bengal',
  heroHeadline: 'Through the lens, a voice for the wild.',
  heroSubheadline:
    "Documenting the birds, elusive mammals, and untamed riverine landscapes of North Bengal and Bangladesh.",
  bioHeadline: 'Razaul Hafiz Rahi',
  bioSummary:
    'Wildlife photographer and naturalist based in Thakurgaon, North Bengal. Spending quiet mornings along northern rivers, seasonal wetlands, sal groves, and river charlands to document wild species in natural light.',
  passionNote:
    'Guided by patience and deep respect for every living creature—capturing fleeting encounters across North Bengal without disturbing natural habitats.',
  journeyNote:
    'What began along quiet riverbanks in North Bengal photographing kingfishers and shy wetland mammals grew into dedicated field documentation across Chalan Beel wetlands, Padma–Jamuna charlands, and northern sal forests.',
  philosophy:
    'The welfare and serenity of the living subject always precedes the photograph. No baiting, no artificial playback calls during nesting seasons, and never disclosing sensitive breeding sites.',
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
