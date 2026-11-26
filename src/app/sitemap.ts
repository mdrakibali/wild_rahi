import type { MetadataRoute } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://wildrahi.com';
  const staticRoutes = ['', '/gallery', '/videos', '/stories', '/contact', '/about'];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const { photographs, stories } = await getCachedPublicPortfolio();
    for (const photo of photographs) {
      if (!photo.isPublished) continue;
      entries.push({
        url: `${baseUrl}/gallery/${encodeURIComponent(photo.id)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
    for (const story of stories) {
      if (!story.isPublished || !story.slug) continue;
      entries.push({
        url: `${baseUrl}/stories/${encodeURIComponent(story.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  } catch {
    // Keep static sitemap routes available even if DB is offline during build
  }

  return entries;
}
