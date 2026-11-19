import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoUrl } from './videoEmbed';

test('parseVideoUrl parses standard YouTube, youtu.be, and Shorts URLs', () => {
  const watch = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(watch.valid, true);
  assert.equal(watch.platform, 'youtube');
  assert.equal(watch.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0');
  assert.equal(watch.thumbnailUrl, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assert.equal(watch.embedAspect, '16:9');

  const shortLink = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(shortLink.valid, true);
  assert.equal(shortLink.platform, 'youtube');

  const shorts = parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(shorts.valid, true);
  assert.equal(shorts.embedAspect, '9:16');
});

test('parseVideoUrl handles Facebook videos, reels, and fb.watch', () => {
  const fb = parseVideoUrl('https://www.facebook.com/WildRahi/videos/1234567890/');
  assert.equal(fb.valid, true);
  assert.equal(fb.platform, 'facebook');
  assert.equal(fb.canEmbed, true);
  assert.equal(fb.fallbackLabel, 'Watch on Facebook');
  assert.ok(fb.embedUrl?.includes('facebook.com/plugins/video.php'));

  const reel = parseVideoUrl('https://www.facebook.com/reel/987654321');
  assert.equal(reel.valid, true);
  assert.equal(reel.embedAspect, '9:16');
});

test('parseVideoUrl handles Instagram reels and posts', () => {
  const ig = parseVideoUrl('https://www.instagram.com/reel/C8xYzAbCdEf/');
  assert.equal(ig.valid, true);
  assert.equal(ig.platform, 'instagram');
  assert.equal(ig.embedUrl, 'https://www.instagram.com/reel/C8xYzAbCdEf/embed/');
  assert.equal(ig.fallbackLabel, 'Watch on Instagram');
});

test('parseVideoUrl handles full TikTok video URLs and short links honestly', () => {
  const full = parseVideoUrl('https://www.tiktok.com/@wildrahi/video/7345678901234567890');
  assert.equal(full.valid, true);
  assert.equal(full.platform, 'tiktok');
  assert.equal(full.canEmbed, true);
  assert.equal(full.embedUrl, 'https://www.tiktok.com/embed/v2/7345678901234567890');

  const short = parseVideoUrl('https://vm.tiktok.com/ZM6abc123/');
  assert.equal(short.valid, true);
  assert.equal(short.platform, 'tiktok');
  assert.equal(short.canEmbed, false);
  assert.equal(short.embedUrl, null);
});

test('parseVideoUrl rejects unsupported domains and non-http protocols', () => {
  assert.equal(parseVideoUrl('javascript:alert(1)').valid, false);
  assert.equal(parseVideoUrl('https://example.com/video.mp4').valid, false);
  assert.equal(parseVideoUrl('not-a-url').valid, false);
});
