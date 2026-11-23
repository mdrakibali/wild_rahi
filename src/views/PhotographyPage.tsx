'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/lightbox/Lightbox';
import { PhotoCard } from '../components/photography/PhotoCard';

export const PhotographyPage: React.FC = () => {
  const { photographs, collections } = usePortfolio();
  const [searchParams, setSearchParams] = useSearchParams();

  const [collectionId, setCollectionId] = useState<string>(
    searchParams.get('collection') || 'all'
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Wildlife Gallery — Wild Rahi';
  }, []);

  useEffect(() => {
    const c = searchParams.get('collection');
    if (c) setCollectionId(c);
  }, [searchParams]);

  // Pure category-based filtering (no search or location required)
  const filteredPhotos = useMemo(() => {
    const published = photographs.filter((p) => p.published);
    if (collectionId === 'all') return published;
    return published.filter((p) => p.collectionId === collectionId);
  }, [photographs, collectionId]);

  const updateCollection = (next: string) => {
    setCollectionId(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('collection');
    else params.set('collection', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Page Header */}
      <section className="bg-secondary border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Fine Art Portfolio
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
            Wildlife Gallery
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            High-resolution natural-light wildlife plates. Click any image to view full screen with lens and camera details.
          </p>
        </div>
      </section>

      {/* Category Filter Bar Only */}
      <section className="bg-card border-b border-border sticky top-20 z-20">
        <div className="site-container py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateCollection('all')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                collectionId === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              All Plates
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => updateCollection(col.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  collectionId === col.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>

          <p className="text-xs font-mono text-muted-foreground">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'plate' : 'plates'}
          </p>
        </div>
      </section>

      {/* 4-Column Dynamic CSS Grid (Col 4, Row 1 Bento Style) */}
      <section className="site-container py-10 lg:py-16">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-secondary border border-border rounded-md p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground">No plates found in this category</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select another category or view all plates.
            </p>
            <button
              type="button"
              onClick={() => updateCollection('all')}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Show All Plates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[280px] sm:auto-rows-[320px]">
            {filteredPhotos.map((photo, index) => {
              // Asymmetric / Editorial 4-column span pattern:
              // Featured photos or every 5th item spans 2 columns in row 1
              const isWide = photo.featured || index % 5 === 0;
              const spanClass = isWide
                ? 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1'
                : 'col-span-1 row-span-1';

              return (
                <div key={photo.id} className={spanClass}>
                  <PhotoCard
                    photo={photo}
                    onInspect={() => setLightboxIndex(index)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Lightbox
        photographs={filteredPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
};
