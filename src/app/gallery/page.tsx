import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { GalleryPage } from '@/views/GalleryPage';

export const metadata: Metadata = {
  title: 'Gallery — Wild Rahi',
  description: 'Wild birds, mammals, reptiles, amphibians, and landscapes across Bangladesh.',
};

export default async function Page() {
  const { photographs } = await getCachedPublicPortfolio();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryPage photographs={photographs} />
    </Suspense>
  );
}
