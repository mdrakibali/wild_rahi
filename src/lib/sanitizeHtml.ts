/**
 * Lightweight, zero-dependency HTML sanitizer tailored for Tiptap editorial article content.
 * Preserves semantic headings, paragraphs, text alignment, lists, blockquotes, links,
 * editorial figure/gallery blocks, and trusted YouTube embeds while stripping scripts and event handlers.
 */

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
];

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
    // Remove script, style, object, embed, form, input, meta, base tags completely
    .replace(/<(script|style|object|embed|applet|form|textarea|select|option|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|object|embed|applet|form|input|meta|base|link)\b[^>]*\/?>/gi, '');

  // Strip all inline event handlers (onClick, onError, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Strip javascript: and vbscript: URIs in href/src
  clean = clean.replace(
    /\s+(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (match, attr: string, dq: string | undefined, sq: string | undefined) => {
      const val = (dq ?? sq ?? '').trim();
      const lowerAttr = attr.toLowerCase();
      if (lowerAttr === 'src') {
        // Defer iframe validation below; allow safe images
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

  // Restrict inline style to text-align only (Tiptap TextAlign extension)
  clean = clean.replace(/\s+style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi, (_m, dq?: string, sq?: string) => {
    const val = (dq ?? sq ?? '').trim();
    const alignMatch = val.match(/text-align\s*:\s*(left|center|right|justify)/i);
    if (alignMatch) {
      return ` style="text-align: ${alignMatch[1].toLowerCase()}"`;
    }
    return '';
  });

  // Validate iframes to allow only trusted video embed origins
  clean = clean.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (full, attrs: string) => {
    const srcMatch = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i);
    if (!srcMatch || !isAllowedIframeSrc(srcMatch[1])) {
      return '';
    }
    return `<iframe src="${srcMatch[1]}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Embedded video"></iframe>`;
  });

  return clean.trim();
}

export function estimateReadingTimeMinutes(htmlOrText: string): number {
  const plain = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain ? plain.split(' ').length : 0;
  return Math.max(1, Math.round(words / 180));
}
