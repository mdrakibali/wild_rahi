import type { HeroSlide, SiteProfile } from '../types/portfolio';

export const DEFAULT_PROFILE: SiteProfile = {
  photographerName: 'Razaul Hafiz Rahi',
  brandName: 'Wild Rahi',
  location: 'Bangladesh',
  heroHeadline: 'Through the lens, a voice for the wild.',
  heroSubheadline:
    "Documenting the beauty, diversity, and quiet stories of Bangladesh's wildlife.",
  bioHeadline: 'Razaul Hafiz Rahi',
  bioSummary:
    'Independent wildlife photographer and naturalist based in Bangladesh. Spending quiet mornings in mangroves, freshwater haors, and evergreen hill forests to document native wildlife in natural light.',
  passionNote:
    'Guided by patience and respect for every living creature—capturing fleeting moments across wild Bangladesh without disturbing natural habitats.',
  journeyNote:
    'What began along quiet riverbanks documenting kingfishers and shy wetland mammals grew into multi-week field journeys across the Sundarbans mangroves, Sunamganj haors, and northeastern rainforests.',
  philosophy:
    'The welfare and serenity of the living subject always precedes the photograph. No baiting, no artificial playback calls during nesting, and never disclosing sensitive habitats.',
  portraitUrl: '/assets/images/portrait_photographer_field_1795067902652.jpg',
  contactEmail: 'contact@wildrahi.com',
  facebookUrl: 'https://www.facebook.com/WildRahi',
  instagramUrl: 'https://www.instagram.com/wildrahi',
  youtubeUrl: '',
  tiktokUrl: '',
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'default-hero-1',
    image: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    altText: 'Royal Bengal Tiger at sunset in the Sundarbans mangrove forest',
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 'default-hero-2',
    image: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
    altText: 'Pied Kingfisher hovering mid-air above Tanguar Haor',
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 'default-hero-3',
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    altText: 'Fishing Cat prowling through wetland reeds in Bangladesh',
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 'default-hero-4',
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    altText: 'Common Kingfisher perched in Lawachara rainforest',
    sortOrder: 4,
    isPublished: true,
  },
];
