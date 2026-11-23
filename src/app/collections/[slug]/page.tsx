import { Suspense } from 'react';
import { GalleryPage } from '@/views/GalleryPage';

export default function CollectionDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <GalleryPage />
    </Suspense>
  );
}
