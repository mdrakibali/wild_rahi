import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countPhotosByCollection,
  filterPhotographs,
  filterSpeciesArchive,
  formatExifMetadata,
  isValidDocumentId,
  toSafeSlug,
  validateEnquiryInput,
} from './validation';
import type { Photograph, Species } from '../types/portfolio';

const SAMPLE_PHOTOS: Photograph[] = [
  {
    id: 'photo-1',
    title: 'Dawn on the Tidal Creek',
    caption: 'Royal Bengal Tiger in Sundarbans mangrove mist.',
    imageUrl: '/src/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    aspectRatio: '16:9',
    collectionId: 'mammals',
    speciesSlug: 'bengal-tiger',
    speciesName: 'Royal Bengal Tiger',
    locationSlug: 'sundarbans',
    locationName: 'Sundarbans',
    camera: 'Full-frame DSLR',
    lens: '500mm f/4',
    focalLength: '500mm',
    aperture: 'f/4',
    shutterSpeed: '1/1000s',
    iso: '800',
    year: '2025',
    featured: true,
    inHorizontalJourney: true,
    published: true,
    isPlaceholder: true,
    sortOrder: 1,
  },
  {
    id: 'photo-2',
    title: 'Reed Watch',
    caption: 'White-throated Kingfisher above still water.',
    imageUrl: '/src/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    aspectRatio: '3:4',
    collectionId: 'birds',
    speciesSlug: 'white-throated-kingfisher',
    speciesName: 'White-throated Kingfisher',
    locationSlug: 'sylhet-wetlands',
    locationName: 'Sylhet Wetlands',
    camera: 'Mirrorless Body',
    lens: '600mm f/4',
    focalLength: '600mm',
    aperture: 'f/4.5',
    shutterSpeed: '1/1600s',
    iso: '640',
    year: '2025',
    featured: true,
    inHorizontalJourney: true,
    published: true,
    isPlaceholder: true,
    sortOrder: 2,
  },
  {
    id: 'photo-3-draft',
    title: 'Unpublished Study',
    caption: 'Draft plate not yet published.',
    imageUrl: '/src/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    aspectRatio: '4:3',
    collectionId: 'mammals',
    speciesSlug: 'fishing-cat',
    speciesName: 'Fishing Cat',
    locationSlug: 'tanguar-haor',
    locationName: 'Tanguar Haor',
    camera: '',
    lens: '',
    focalLength: '',
    aperture: '',
    shutterSpeed: '',
    iso: '',
    year: '2025',
    featured: false,
    inHorizontalJourney: false,
    published: false,
    isPlaceholder: true,
    sortOrder: 3,
  },
];

const SAMPLE_SPECIES: Species[] = [
  {
    id: 'bengal-tiger',
    slug: 'bengal-tiger',
    commonName: 'Royal Bengal Tiger',
    scientificName: 'Panthera tigris',
    bengaliName: 'রয়েল বেঙ্গল টাইগার',
    habitat: 'Tidal mangrove forests',
    habitatRegion: 'Sundarbans',
    description: 'Apex predator of the Sundarbans mangrove ecosystem.',
    conservationStatus: 'Endangered',
    conservationSource: 'IUCN Red List of Threatened Species',
    coverImageUrl: '/src/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    isPlaceholder: true,
  },
  {
    id: 'white-throated-kingfisher',
    slug: 'white-throated-kingfisher',
    commonName: 'White-throated Kingfisher',
    scientificName: 'Halcyon smyrnensis',
    bengaliName: 'ধলাগলা মাছরাঙা',
    habitat: 'Freshwater wetlands, rivers, and agricultural edges',
    habitatRegion: 'Sylhet Wetlands',
    description: 'Widespread resident kingfisher across Bangladesh wetlands.',
    conservationStatus: 'Least Concern',
    conservationSource: 'IUCN Red List of Threatened Species',
    coverImageUrl: '/src/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    isPlaceholder: true,
  },
];

test('filterPhotographs excludes unpublished plates by default', () => {
  const visible = filterPhotographs(SAMPLE_PHOTOS, {
    collectionId: 'all',
    locationSlug: 'all',
    speciesQuery: '',
  });
  assert.equal(visible.length, 2);
  assert.equal(visible.some((p) => p.id === 'photo-3-draft'), false);
});

test('filterPhotographs filters by collection, location, and species search', () => {
  const byCollection = filterPhotographs(SAMPLE_PHOTOS, {
    collectionId: 'birds',
    locationSlug: 'all',
    speciesQuery: '',
  });
  assert.equal(byCollection.length, 1);
  assert.equal(byCollection[0].id, 'photo-2');

  const bySpecies = filterPhotographs(SAMPLE_PHOTOS, {
    collectionId: 'all',
    locationSlug: 'all',
    speciesQuery: 'kingfisher',
  });
  assert.equal(bySpecies.length, 1);
  assert.equal(bySpecies[0].speciesSlug, 'white-throated-kingfisher');

  const byLocation = filterPhotographs(SAMPLE_PHOTOS, {
    collectionId: 'all',
    locationSlug: 'sundarbans',
    speciesQuery: '',
  });
  assert.equal(byLocation.length, 1);
  assert.equal(byLocation[0].id, 'photo-1');
});

test('countPhotosByCollection counts only published photographs', () => {
  const counts = countPhotosByCollection(SAMPLE_PHOTOS);
  assert.equal(counts.mammals, 1);
  assert.equal(counts.birds, 1);
});

test('filterSpeciesArchive matches Bengali, scientific, and common names', () => {
  const byScientific = filterSpeciesArchive(SAMPLE_SPECIES, { search: 'halcyon' });
  assert.equal(byScientific.length, 1);
  assert.equal(byScientific[0].id, 'white-throated-kingfisher');

  const byStatus = filterSpeciesArchive(SAMPLE_SPECIES, { status: 'Endangered' });
  assert.equal(byStatus.length, 1);
  assert.equal(byStatus[0].id, 'bengal-tiger');
});

test('validateEnquiryInput enforces required fields and blueprint length bounds', () => {
  const emptyResult = validateEnquiryInput({
    name: '   ',
    email: 'not-an-email',
    organization: '',
    enquiryType: 'Image Licensing',
    subject: '',
    message: 'Too short',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.subject);
  assert.ok(emptyResult.errors.message);

  const validResult = validateEnquiryInput({
    name: 'Anika Rahman',
    email: 'anika@conservation-bd.org',
    organization: 'Bengal Wetland Trust',
    enquiryType: 'Conservation Collaboration',
    subject: 'Sundarbans editorial monograph',
    message: 'We would like to discuss licensing and documenting wetland bird populations.',
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});

test('toSafeSlug and isValidDocumentId enforce Firestore rule patterns', () => {
  const slug = toSafeSlug('Sundarbans Mangrove — Dawn Study #1!');
  assert.equal(slug, 'sundarbans-mangrove-dawn-study-1');
  assert.equal(isValidDocumentId(slug), true);
  assert.equal(isValidDocumentId('../bad/id'), false);
  assert.equal(isValidDocumentId('a'.repeat(129)), false);
});

test('formatExifMetadata omits blank fields and formats ISO cleanly', () => {
  const formatted = formatExifMetadata({
    camera: 'Body A',
    lens: '',
    focalLength: '500mm',
    aperture: 'f/4',
    shutterSpeed: '1/1000s',
    iso: '800',
  });
  assert.equal(formatted, 'Body A · 500mm · f/4 · 1/1000s · ISO 800');
});
