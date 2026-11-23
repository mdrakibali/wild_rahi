import { Suspense } from 'react';
import { GalleryPage } from '@/views/GalleryPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryPage />
    </Suspense>
  );
}

