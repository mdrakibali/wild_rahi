import type { SiteProfile } from '../types/portfolio';

/**
 * Minimal brand identity fallback used only before API hydration or on a fresh empty database.
 * All portfolio photographs, collections, species, habitats, articles, and videos load from the database.
 */
export const DEFAULT_PROFILE: SiteProfile = {
  photographerName: 'Razaul Hafiz Rahi',
  brandName: 'Wild Rahi',
  born: '1996 · Khulna, Bangladesh',
  location: 'Khulna & Dhaka, Bangladesh',
  locationBase: 'Bangladesh (Sundarbans & Haor Basin)',
  fieldExperienceYears: '10+ Years Field Observation',
  heroHeadline: 'Through the lens, a voice for the wild.',
  heroSubheadline:
    "Documenting the beauty, diversity and untold stories of Bangladesh's wildlife.",
  introHeading: 'Every frame holds a story.',
  introBody:
    'Wild Rahi is the independent wildlife photography practice of Razaul Hafiz Rahi in Bangladesh, rooted in patient field observation, natural light, and ethical wildlife documentation.',
  bioHeadline: 'Razaul Hafiz Rahi — Wildlife Photographer & Naturalist',
  bioSummary:
    'Independent wildlife photographer and naturalist based in Bangladesh. Born in Khulna adjacent to the Sundarbans mangrove delta, Rahi has spent more than a decade documenting the elusive mammals, migratory avifauna, and endangered amphibians of Bangladesh in pristine natural light.',
  journeyNote:
    'Growing up at the edge of the world’s largest mangrove forest, the rhythm of tidal waters and bird calls became a lifelong passion. What began with a basic telephoto zoom documenting kingfishers and spotted deer along the Rupsha and Passur rivers evolved into dedicated, multi-week expeditions tracking Royal Bengal Tigers in the Sundarbans, Masked Finfoots in remote wetlands, and Hoolock Gibbons in the northeastern rainforests.',
  whyWildlifeMatters:
    'Bangladesh is one of the most densely populated nations on earth, yet it harbors extraordinary biodiversity—from apex predators like the Bengal tiger to over 700 species of birds. Visual documentation serves as critical evidence that these species exist, thrive, and deserve urgent public stewardship.',
  philosophy:
    'The welfare and serenity of the living subject always precedes the photograph. No baiting, no artificial playback calls during nesting seasons, and never disclosing sensitive breeding coordinates.',
  equipmentNote:
    'Primary Cameras:\n• Sony Alpha 1 (50.1MP Flagship, 30fps Real-Time Tracking AF)\n• Sony Alpha 7 IV (33MP Full-Frame Field Backup)\n\nOptics & Telephotos:\n• Sony FE 600mm f/4 GM OSS (Primary Wildlife Prime)\n• Sony FE 200-600mm f/5.6-6.3 G OSS (Versatile Field Zoom)\n• Sony FE 100-400mm f/4.5-5.6 GM OSS (Handheld Forest Tracking)\n• Sony FE 90mm f/2.8 Macro G OSS (Herpetology & Entomology)\n\nAerial, Support & Field Gear:\n• DJI Mavic 3 Pro Cine (Licensed Ecological Aerial Surveys)\n• Gitzo Systematic Series 5 Carbon Fiber Tripod\n• Wimberley WH-200 Version II Gimbal Head\n• Custom Floating Camouflage Hide for Haor Wetlands',
  achievementsNote:
    '• National Wildlife Photographer Recognition — Bangladesh Biodiversity Conservation Board (2023)\n• Nature in Focus Asia Finalist — Mammals & Conservation Category (2022)\n• IUCN Bangladesh Citation of Merit for field documentation of threatened riverine bird species\n• Solo Exhibition: "Shadows of the Sundarbans" — Drik Gallery, Dhaka & Shilpakala Academy\n• Contributor to Global Birdfair Conservation Outreach & Asian Waterbird Census',
  printSpecsNote:
    'Limited edition museum-grade fine art prints on Hahnemühle Photo Rag 308gsm archival cotton paper with pigment inks rated for 100+ years lightfastness.',
  licensingNote:
    'Available for editorial, scientific publication, conservation NGO licensing, and commissioned natural history expeditions.',
  portraitUrl: '',
  contactEmail: 'contact@wildrahi.com',
  facebookUrl: 'https://www.facebook.com/WildRahi',
  instagramUrl: 'https://www.instagram.com/wildrahi',
  youtubeUrl: '',
  tiktokUrl: '',
  conservationHeadline: 'Photography can give nature a voice.',
  conservationStatement:
    'Wild Rahi is committed to ethical field documentation—never disclosing sensitive coordinates, minimizing human footprint, and fostering conservation awareness.',
};
