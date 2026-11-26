import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: 'Wild Rahi — Razaul Hafiz Rahi | Wildlife Photography, Bangladesh',
  description:
    "Documenting the beauty, diversity, and untold stories of Bangladesh's wildlife. Wildlife photography, field videos, and stories by Razaul Hafiz Rahi (Wild Rahi).",
  openGraph: {
    title: 'Wild Rahi — Razaul Hafiz Rahi | Wildlife Photography',
    description:
      "Documenting the beauty, diversity, and untold stories of Bangladesh's wildlife. Wildlife photography, field videos, and stories by Razaul Hafiz Rahi.",
    images: ['/assets/images/hero_sundarbans_tiger_1795067902199.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wild Rahi — Wildlife Photography',
    description: "Documenting the beauty, diversity, and untold stories of Bangladesh's wildlife.",
    images: ['/assets/images/hero_sundarbans_tiger_1795067902199.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile, photographs } = await getCachedPublicPortfolio();

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
        <AppShell profile={profile} photographs={photographs}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
