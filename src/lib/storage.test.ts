import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUCKET_NAME,
  diffRemovedMediaTargets,
  extractManagedStoragePath,
} from './storage';

test('extractManagedStoragePath parses Supabase public bucket URLs, /uploads paths, and skips static /assets', () => {
  assert.equal(extractManagedStoragePath('/assets/images/sample.jpg'), null);
  assert.equal(extractManagedStoragePath('https://example.com/photo.jpg'), null);
  assert.equal(extractManagedStoragePath(''), null);

  assert.equal(
    extractManagedStoragePath('/uploads/photographs/kingfisher-123.webp'),
    'photographs/kingfisher-123.webp'
  );

  assert.equal(
    extractManagedStoragePath(
      `https://demo.supabase.co/storage/v1/object/public/${BUCKET_NAME}/profile/about/frame-1.webp`
    ),
    'profile/about/frame-1.webp'
  );

  assert.equal(
    extractManagedStoragePath('hero/slide-1.webp'),
    'hero/slide-1.webp'
  );
});

test('diffRemovedMediaTargets returns only removed or replaced managed assets', () => {
  const prev = [
    `https://demo.supabase.co/storage/v1/object/public/${BUCKET_NAME}/profile/old.webp`,
    `https://demo.supabase.co/storage/v1/object/public/${BUCKET_NAME}/profile/about/keep.webp`,
    '/assets/images/static-ignored.jpg',
  ];
  const next = [
    `https://demo.supabase.co/storage/v1/object/public/${BUCKET_NAME}/profile/about/keep.webp`,
    `https://demo.supabase.co/storage/v1/object/public/${BUCKET_NAME}/profile/new.webp`,
  ];

  assert.deepEqual(diffRemovedMediaTargets(prev, next), ['profile/old.webp']);
});

