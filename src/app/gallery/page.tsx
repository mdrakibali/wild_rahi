import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { GalleryPage } from '@/views/GalleryPage';

export const metadata: Metadata = {
  title: 'Gallery — Wild Rahi',
  description:
    'Birds, mammals, reptiles, amphibians, insects, wetlands, landscapes, and wild flora across North Bengal and Bangladesh.',
};

export default async function Page() {
  const { photographs } = await getCachedPublicPortfolio();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryPage photographs={photographs} />
    </Suspense>
  );
}
