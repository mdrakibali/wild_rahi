import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://wildrahi.com';

  const routes = [
    '',
    '/gallery',
    '/albums',
    '/collections',
    '/wildlife',
    '/videos',
    '/articles',
    '/about',
    '/conservation',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

