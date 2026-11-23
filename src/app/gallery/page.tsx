import { Suspense } from 'react';
import { PhotographyPage } from '@/views/PhotographyPage';

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PhotographyPage />
    </Suspense>
  );
}
