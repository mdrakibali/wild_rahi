/**
 * HTML sanitizer and pure-TS Tiptap JSON -> HTML serializer (safe for SSR and Client).
 * Preserves semantic headings, paragraphs, text alignment, lists, blockquotes, links,
 * editorial figure/gallery blocks, and trusted YouTube embeds while stripping scripts and handlers.
 */

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeUrl(raw: string, allowDataImage = false): boolean {
  const value = raw.trim();
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('#')) return true;
  if (allowDataImage && /^data:image\/(webp|png|jpeg|jpg|avif|gif);base64,/i.test(value)) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isAllowedIframeSrc(raw: string): boolean {
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_IFRAME_HOSTS.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function sanitizeArticleHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let clean = html
    .replace(/<(script|style|object|embed|applet|form|textarea|select|option|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|object|embed|applet|form|input|meta|base|link)\b[^>]*\/?>/gi, '');

  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  clean = clean.replace(
    /\s+(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (match, attr: string, dq: string | undefined, sq: string | undefined) => {
      const val = (dq ?? sq ?? '').trim();
      const lowerAttr = attr.toLowerCase();
      if (lowerAttr === 'src') {
        if (isSafeUrl(val, true)) {
          return ` src="${val.replace(/"/g, '&quot;')}"`;
        }
        return '';
      }
      if (lowerAttr === 'href') {
        if (isSafeUrl(val, false)) {
          return ` href="${val.replace(/"/g, '&quot;')}"`;
        }
        return '';
      }
      return match;
    }
  );

  clean = clean.replace(/\s+style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi, (_m, dq?: string, sq?: string) => {
    const val = (dq ?? sq ?? '').trim();
    const alignMatch = val.match(/text-align\s*:\s*(left|center|right|justify)/i);
    if (alignMatch) {
      return ` style="text-align: ${alignMatch[1].toLowerCase()}"`;
    }
    return '';
  });

  clean = clean.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (_full, attrs: string) => {
    const srcMatch = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i);
    if (!srcMatch || !isAllowedIframeSrc(srcMatch[1])) {
      return '';
    }
    return `<iframe src="${srcMatch[1]}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Embedded video"></iframe>`;
  });

  return clean.trim();
}

interface TiptapMark {
  type?: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
}

function renderMarks(text: string, marks?: TiptapMark[]): string {
  let out = escapeHtml(text);
  if (!Array.isArray(marks)) return out;

  for (const mark of marks) {
    if (mark.type === 'bold') out = `<strong>${out}</strong>`;
    else if (mark.type === 'italic') out = `<em>${out}</em>`;
    else if (mark.type === 'underline') out = `<u>${out}</u>`;
    else if (mark.type === 'strike') out = `<s>${out}</s>`;
    else if (mark.type === 'code') out = `<code>${out}</code>`;
    else if (mark.type === 'link') {
      const href = String(mark.attrs?.href || '');
      if (isSafeUrl(href, false)) {
        out = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow">${out}</a>`;
      }
    }
  }
  return out;
}

function renderNode(node: TiptapNode): string {
  if (!node || typeof node !== 'object') return '';

  if (node.type === 'text') {
    return renderMarks(node.text || '', node.marks);
  }

  const children = Array.isArray(node.content) ? node.content.map(renderNode).join('') : '';
  const align = typeof node.attrs?.textAlign === 'string' ? node.attrs.textAlign : '';
  const alignAttr = ['left', 'center', 'right', 'justify'].includes(align)
    ? ` style="text-align: ${align}"`
    : '';

  switch (node.type) {
    case 'doc':
      return children;
    case 'paragraph':
      return `<p${alignAttr}>${children || '<br />'}</p>`;
    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      const tag = level >= 1 && level <= 4 ? `h${level}` : 'h2';
      return `<${tag}${alignAttr}>${children}</${tag}>`;
    }
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList':
      return `<ol>${children}</ol>`;
    case 'listItem':
      return `<li>${children}</li>`;
    case 'horizontalRule':
      return '<hr />';
    case 'hardBreak':
      return '<br />';
    case 'image': {
      const src = String(node.attrs?.src || '');
      if (!isSafeUrl(src, true)) return '';
      const alt = escapeHtml(String(node.attrs?.alt || ''));
      return `<figure><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" /></figure>`;
    }
    case 'editorialFigure': {
      const src = String(node.attrs?.src || '');
      if (!isSafeUrl(src, true)) return '';
      const alt = escapeHtml(String(node.attrs?.alt || ''));
      const caption = String(node.attrs?.caption || '').trim();
      const layout = escapeHtml(String(node.attrs?.layout || 'standard'));
      const capHtml = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '';
      return `<figure data-layout="${layout}"><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" />${capHtml}</figure>`;
    }
    case 'editorialGallery': {
      const items = Array.isArray(node.attrs?.items)
        ? (node.attrs.items as Array<{ src?: string; alt?: string; caption?: string }>)
        : [];
      const figures = items
        .filter((it) => it.src && isSafeUrl(it.src, true))
        .map((it) => {
          const cap = it.caption ? `<figcaption>${escapeHtml(it.caption)}</figcaption>` : '';
          return `<figure><img src="${escapeHtml(it.src!)}" alt="${escapeHtml(it.alt || '')}" loading="lazy" />${cap}</figure>`;
        })
        .join('');
      return figures ? `<div data-gallery="true">${figures}</div>` : '';
    }
    case 'youtube': {
      const src = String(node.attrs?.src || '');
      return src ? `<iframe src="${escapeHtml(src)}"></iframe>` : '';
    }
    default:
      return children;
  }
}

/**
 * Converts stored Tiptap JSON or HTML payload cleanly into sanitized HTML.
 */
export function tiptapContentToHtml(content: unknown, fallbackText = ''): string {
  if (typeof content === 'string') {
    return sanitizeArticleHtml(content);
  }
  if (content && typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    if (typeof obj.html === 'string' && obj.html.trim().length > 0) {
      return sanitizeArticleHtml(obj.html);
    }
    if (obj.type === 'doc' || Array.isArray(obj.content)) {
      const rendered = renderNode(obj as unknown as TiptapNode);
      if (rendered.trim()) {
        return sanitizeArticleHtml(rendered);
      }
    }
  }
  return fallbackText ? `<p>${escapeHtml(fallbackText)}</p>` : '';
}

export function estimateReadingTimeMinutes(htmlOrText: string): number {
  const plain = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain ? plain.split(' ').length : 0;
  return Math.max(1, Math.round(words / 180));
}
