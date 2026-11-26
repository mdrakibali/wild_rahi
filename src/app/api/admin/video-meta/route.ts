import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { parseVideoUrl } from '@/lib/videoEmbed';

interface OEmbedResponse {
  title?: unknown;
  thumbnail_url?: unknown;
}

/**
 * Resolves safe public oEmbed metadata (thumbnail + optional title) for supported
 * YouTube and full TikTok video links on behalf of an authenticated administrator.
 */
export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { url?: unknown };
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
    const parsed = parseVideoUrl(rawUrl);

    if (!parsed.valid || !parsed.platform) {
      return NextResponse.json({
        platform: null,
        thumbnailUrl: null,
        title: null,
      });
    }

    if (parsed.platform === 'youtube' || (parsed.platform === 'tiktok' && parsed.canEmbed)) {
      const oembedEndpoint =
        parsed.platform === 'youtube'
          ? `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.originalUrl)}&format=json`
          : `https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.originalUrl)}`;

      try {
        const res = await fetch(oembedEndpoint, {
          signal: AbortSignal.timeout(4500),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = (await res.json()) as OEmbedResponse;
          const title = typeof data.title === 'string' ? data.title.trim() : null;
          const fetchedThumb =
            typeof data.thumbnail_url === 'string' && data.thumbnail_url.startsWith('http')
              ? data.thumbnail_url.trim()
              : null;

          return NextResponse.json({
            platform: parsed.platform,
            thumbnailUrl: parsed.thumbnailUrl || fetchedThumb,
            title: title || null,
          });
        }
      } catch {
        // Fall through cleanly with deterministic client-derived metadata
      }
    }

    return NextResponse.json({
      platform: parsed.platform,
      thumbnailUrl: parsed.thumbnailUrl,
      title: null,
    });
  } catch (err) {
    console.error('[Admin Video Meta] Error:', err);
    return NextResponse.json({ error: 'Failed to inspect video metadata.' }, { status: 500 });
  }
}

