'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { EditorialCollections } from '@/components/collections/EditorialCollections';
import { countPhotosByCollection } from '@/lib/validation';

export default function CollectionsPage() {
  const { collections, photographs } = usePortfolio();
  const publishedPhotos = photographs.filter((p) => p.published);
  const counts = countPhotosByCollection(publishedPhotos);

  return (
    <div className="pt-20 pb-32">
      <EditorialCollections collections={collections} countsByCollection={counts} />
    </div>
  );
}

