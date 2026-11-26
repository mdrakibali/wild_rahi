import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateReadingTimeMinutes,
  sanitizeArticleHtml,
  tiptapContentToHtml,
} from './sanitizeHtml';

test('sanitizeArticleHtml strips scripts, inline handlers, and javascript URLs', () => {
  const dirty =
    '<p>Hello</p><script>alert(1)</script><img src="/assets/images/test.jpg" onerror="alert(2)" /><a href="javascript:alert(3)">bad</a>';
  const clean = sanitizeArticleHtml(dirty);
  assert.ok(clean.includes('<p>Hello</p>'));
  assert.ok(!clean.includes('<script'));
  assert.ok(!clean.includes('onerror'));
  assert.ok(!clean.includes('javascript:'));
  assert.ok(clean.includes('src="/assets/images/test.jpg"'));
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

test('tiptapContentToHtml converts Tiptap JSON formatting and figures without DOM', () => {
  const json = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Sundarbans Dawn' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Quiet ', marks: [{ type: 'italic' }] },
          { type: 'text', text: 'observation', marks: [{ type: 'bold' }] },
        ],
      },
      {
        type: 'editorialFigure',
        attrs: {
          src: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
          alt: 'Tiger',
          caption: 'Katka riverbank',
        },
      },
    ],
  };

  const html = tiptapContentToHtml(json);
  assert.ok(html.includes('<h2>Sundarbans Dawn</h2>'));
  assert.ok(html.includes('<em>Quiet </em>'));
  assert.ok(html.includes('<strong>observation</strong>'));
  assert.ok(html.includes('src="/assets/images/hero_sundarbans_tiger_1795067902199.jpg"'));
  assert.ok(html.includes('<figcaption>Katka riverbank</figcaption>'));
});

test('estimateReadingTimeMinutes computes reading time cleanly', () => {
  const words = Array.from({ length: 360 }, () => 'wildlife').join(' ');
  assert.equal(estimateReadingTimeMinutes(`<p>${words}</p>`), 2);
  assert.equal(estimateReadingTimeMinutes('<p>Short note</p>'), 1);
});
