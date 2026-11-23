import { Suspense } from 'react';
import { AlbumsPage } from '@/views/AlbumsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AlbumsPage />
    </Suspense>
  );
}

