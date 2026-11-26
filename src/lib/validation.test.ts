import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterPhotographs,
  getWildlifeCategoryLabel,
  isValidDocumentId,
  isValidUuid,
  normalizeWildlifeCategory,
  toSafeSlug,
  validateEnquiryInput,
} from './validation';
import type { Photograph } from '../types/portfolio';

const SAMPLE_PHOTOS: Photograph[] = [
  {
    id: '431aa573-1e8d-4cb8-853e-d653c0ff8d7b',
    title: 'Dawn on the Tidal Creek',
    description: 'Royal Bengal Tiger in Sundarbans mangrove mist.',
    image: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    category: 'mammals',
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
  },
  {
    id: '919e5b51-d6e9-48b3-b4cd-f42811a4d8ed',
    title: 'Reed Watch',
    description: 'Common Kingfisher above still water.',
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    category: 'birds',
    isFeatured: false,
    isPublished: true,
    sortOrder: 2,
  },
  {
    id: 'd0f45234-bb8c-477a-8c9d-976c26a6a119',
    title: 'Unpublished Study',
    description: 'Draft plate not yet published.',
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    category: 'mammals',
    isFeatured: false,
    isPublished: false,
    sortOrder: 3,
  },
];

test('filterPhotographs excludes unpublished plates by default', () => {
  const visible = filterPhotographs(SAMPLE_PHOTOS, { category: 'all' });
  assert.equal(visible.length, 2);
  assert.equal(visible.some((p) => p.id === 'd0f45234-bb8c-477a-8c9d-976c26a6a119'), false);
});

test('filterPhotographs filters by category and featured flag', () => {
  const birds = filterPhotographs(SAMPLE_PHOTOS, { category: 'birds' });
  assert.equal(birds.length, 1);
  assert.equal(birds[0].title, 'Reed Watch');

  const featured = filterPhotographs(SAMPLE_PHOTOS, { category: 'all', featuredOnly: true });
  assert.equal(featured.length, 1);
  assert.equal(featured[0].category, 'mammals');
});

test('normalizeWildlifeCategory and getWildlifeCategoryLabel map categories accurately', () => {
  assert.equal(normalizeWildlifeCategory('Birds'), 'birds');
  assert.equal(normalizeWildlifeCategory('amphibians'), 'amphibians');
  assert.equal(normalizeWildlifeCategory('Macro World'), 'insects');
  assert.equal(normalizeWildlifeCategory('Sundarbans Mangrove'), 'landscapes');
  assert.equal(normalizeWildlifeCategory(''), 'others');
  assert.equal(normalizeWildlifeCategory('Unclassified wildlife'), 'others');
  assert.equal(getWildlifeCategoryLabel('insects'), 'Insects');
  assert.equal(getWildlifeCategoryLabel('others'), 'Others');
});

test('validateEnquiryInput enforces required fields and length bounds', () => {
  const emptyResult = validateEnquiryInput({
    name: '   ',
    email: 'not-an-email',
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
    subject: 'Sundarbans editorial inquiry',
    message: 'We would like to collaborate on documenting wetland bird populations.',
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});

test('toSafeSlug, isValidUuid, and isValidDocumentId enforce expected patterns', () => {
  const slug = toSafeSlug('Sundarbans Mangrove — Dawn Study #1!');
  assert.equal(slug, 'sundarbans-mangrove-dawn-study-1');
  assert.equal(isValidDocumentId(slug), true);
  assert.equal(isValidDocumentId('../bad/id'), false);
  assert.equal(isValidUuid('431aa573-1e8d-4cb8-853e-d653c0ff8d7b'), true);
  assert.equal(isValidUuid('not-a-uuid'), false);
});
