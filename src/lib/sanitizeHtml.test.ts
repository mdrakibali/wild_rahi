import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateReadingTimeMinutes, sanitizeArticleHtml } from './sanitizeHtml';

test('sanitizeArticleHtml strips scripts, inline handlers, and javascript URLs', () => {
  const dirty =
    '<p>Hello</p><script>alert(1)</script><img src="/src/assets/images/test.jpg" onerror="alert(2)" /><a href="javascript:alert(3)">bad</a>';
  const clean = sanitizeArticleHtml(dirty);
  assert.ok(clean.includes('<p>Hello</p>'));
  assert.ok(!clean.includes('<script'));
  assert.ok(!clean.includes('onerror'));
  assert.ok(!clean.includes('javascript:'));
  assert.ok(clean.includes('src="/src/assets/images/test.jpg"'));
});

test('sanitizeArticleHtml preserves text-align and trusted YouTube iframes, strips untrusted iframes', () => {
  const input =
    '<h2 style="text-align: center; color: red;">Title</h2><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe><iframe src="https://evil.example/phish"></iframe>';
  const clean = sanitizeArticleHtml(input);
  assert.ok(clean.includes('style="text-align: center"'));
  assert.ok(!clean.includes('color: red'));
  assert.ok(clean.includes('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
  assert.ok(!clean.includes('evil.example'));
});

test('estimateReadingTimeMinutes computes reading time cleanly for Bangla and English HTML', () => {
  const words = Array.from({ length: 360 }, () => 'wildlife').join(' ');
  assert.equal(estimateReadingTimeMinutes(`<p>${words}</p>`), 2);
  assert.equal(estimateReadingTimeMinutes('<p>Short note</p>'), 1);
});
