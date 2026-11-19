import { Suspense } from 'react';
import { PhotographyPage } from '@/views/PhotographyPage';

export default function CollectionDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PhotographyPage />
    </Suspense>
  );
}
