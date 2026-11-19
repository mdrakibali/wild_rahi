export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok';

export interface ParsedVideoEmbed {
  valid: boolean;
  platform: VideoPlatform | null;
  platformLabel: string;
  originalUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  canEmbed: boolean;
  embedAspect: '16:9' | '9:16';
  fallbackLabel: string;
  limitationNote?: string;
  error?: string;
}

export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

function parseYouTubeId(url: URL): { id: string; isShort: boolean } | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { id, isShort: false };
    return null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { id, isShort: false };
    }
    if (parts[0] === 'shorts' && parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
      return { id: parts[1], isShort: true };
    }
    if (parts[0] === 'embed' && parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
      return { id: parts[1], isShort: false };
    }
    if (parts[0] === 'live' && parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
      return { id: parts[1], isShort: false };
    }
  }
  return null;
}

export function parseVideoUrl(rawInput: string): ParsedVideoEmbed {
  const trimmed = (rawInput || '').trim();
  const invalidBase = (error: string): ParsedVideoEmbed => ({
    valid: false,
    platform: null,
    platformLabel: 'Unsupported',
    originalUrl: trimmed,
    embedUrl: null,
    thumbnailUrl: null,
    canEmbed: false,
    embedAspect: '16:9',
    fallbackLabel: 'Open Video',
    error,
  });

  if (!trimmed) {
    return invalidBase('Please paste a YouTube, Facebook, Instagram, or TikTok video URL.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return invalidBase('Please enter a valid https:// video URL.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return invalidBase('Only http:// and https:// video links are permitted.');
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  // 1. YouTube
  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be' ||
    host === 'youtube-nocookie.com'
  ) {
    const yt = parseYouTubeId(parsed);
    if (!yt) {
      return invalidBase('Could not extract a valid YouTube video ID from this URL.');
    }
    return {
      valid: true,
      platform: 'youtube',
      platformLabel: 'YouTube',
      originalUrl: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt.id}?rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${yt.id}/hqdefault.jpg`,
      canEmbed: true,
      embedAspect: yt.isShort ? '9:16' : '16:9',
      fallbackLabel: 'Watch on YouTube',
    };
  }

  // 2. Facebook
  if (host === 'facebook.com' || host === 'm.facebook.com' || host === 'web.facebook.com' || host === 'fb.watch') {
    const isReel = parsed.pathname.includes('/reel/');
    const isVideoPath =
      host === 'fb.watch' ||
      parsed.pathname.includes('/videos/') ||
      parsed.pathname.includes('/reel/') ||
      parsed.pathname.includes('/watch') ||
      parsed.searchParams.has('v');

    if (!isVideoPath) {
      return invalidBase('Please paste a direct Facebook video, reel, or fb.watch link.');
    }

    return {
      valid: true,
      platform: 'facebook',
      platformLabel: 'Facebook',
      originalUrl: trimmed,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false`,
      thumbnailUrl: null,
      canEmbed: true,
      embedAspect: isReel ? '9:16' : '16:9',
      fallbackLabel: 'Watch on Facebook',
      limitationNote:
        'Facebook may restrict embedded playback on some posts or browsers. Use the direct link if playback is unavailable.',
    };
  }

  // 3. Instagram
  if (host === 'instagram.com' || host === 'm.instagram.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    const kind = parts[0];
    const shortcode = parts[1];
    if ((kind === 'reel' || kind === 'p' || kind === 'tv') && shortcode && /^[a-zA-Z0-9_-]+$/.test(shortcode)) {
      return {
        valid: true,
        platform: 'instagram',
        platformLabel: 'Instagram',
        originalUrl: trimmed,
        embedUrl: `https://www.instagram.com/${kind}/${shortcode}/embed/`,
        thumbnailUrl: null,
        canEmbed: true,
        embedAspect: '9:16',
        fallbackLabel: 'Watch on Instagram',
        limitationNote:
          'Instagram embeds may require viewing directly on Instagram depending on account or browser privacy settings.',
      };
    }
    return invalidBase('Please paste a valid Instagram Reel, Post (/p/), or TV video link.');
  }

  // 4. TikTok
  if (host === 'tiktok.com' || host === 'm.tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    if (match?.[1]) {
      return {
        valid: true,
        platform: 'tiktok',
        platformLabel: 'TikTok',
        originalUrl: trimmed,
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
        thumbnailUrl: null,
        canEmbed: true,
        embedAspect: '9:16',
        fallbackLabel: 'Watch on TikTok',
        limitationNote:
          'If TikTok blocks embedded playback in your region, open the video directly on TikTok.',
      };
    }
    // Short links (vm.tiktok.com) cannot be embedded without server resolution; provide honest fallback
    if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
      return {
        valid: true,
        platform: 'tiktok',
        platformLabel: 'TikTok',
        originalUrl: trimmed,
        embedUrl: null,
        thumbnailUrl: null,
        canEmbed: false,
        embedAspect: '9:16',
        fallbackLabel: 'Watch on TikTok',
        limitationNote:
          'TikTok short links open directly on TikTok. Paste a full tiktok.com/@user/video/ID link for inline playback.',
      };
    }
    return invalidBase('Please paste a valid TikTok video URL (e.g. https://www.tiktok.com/@user/video/...).');
  }

  return invalidBase('Unsupported platform. Only YouTube, Facebook, Instagram, and TikTok links are supported.');
}
