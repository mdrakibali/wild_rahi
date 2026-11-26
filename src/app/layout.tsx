import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { AppShell } from '@/components/layout/AppShell';

export async function generateMetadata(): Promise<Metadata> {
  const { profile, heroSlides } = await getCachedPublicPortfolio();
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const primaryImage =
    heroSlides.find((s) => s.isPublished && s.image)?.image ||
    '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg';
  const siteTitle = `${profile.brandName} — ${profile.photographerName} | Wildlife Photography`;
  const siteDescription =
    profile.heroSubheadline ||
    `Documenting birds, mammals, wetlands, and wild flora across ${profile.location || 'North Bengal, Bangladesh'}.`;

  return {
    metadataBase: new URL(baseUrl),
    title: siteTitle,
    description: siteDescription,
    icons: {
      icon: '/icon.png',
      shortcut: '/favicon.png',
      apple: '/apple-icon.png',
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      images: [primaryImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [primaryImage],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile, photographs } = await getCachedPublicPortfolio();
  const baseUrl = process.env.APP_URL || 'https://wildrahi.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.photographerName,
    alternateName: profile.brandName,
    description: profile.bioSummary,
    url: baseUrl,
    homeLocation: {
      '@type': 'Place',
      name: profile.location || 'Thakurgaon, Rangpur, North Bengal',
    },
    sameAs: [profile.facebookUrl, profile.instagramUrl, profile.youtubeUrl, profile.tiktokUrl].filter(
      Boolean
    ),
  };

  return (
    <html lang="en" className="bg-background text-foreground">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Hind+Siliguri:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppShell profile={profile} photographs={photographs}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
