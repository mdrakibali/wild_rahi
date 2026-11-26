import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { GalleryPage } from '@/views/GalleryPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const { photographs } = await getCachedPublicPortfolio();
  const photo = photographs.find((p) => p.id === decoded);

  if (!photo) {
    return { title: 'Gallery — Wild Rahi' };
  }

  return {
    title: `${photo.title} — Wild Rahi`,
    description: photo.description || 'Wildlife photography by Razaul Hafiz Rahi.',
    openGraph: {
      title: `${photo.title} — Wild Rahi`,
      description: photo.description || 'Wildlife photography by Razaul Hafiz Rahi.',
      images: [photo.image],
    },
  };
}

export default async function Page() {
  const { photographs } = await getCachedPublicPortfolio();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryPage photographs={photographs} />
    </Suspense>
  );
}
