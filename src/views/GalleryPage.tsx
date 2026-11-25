'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { usePortfolio } from '../context/PortfolioContext';
import { PhotoCard } from '../components/photography/PhotoCard';

const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'All Plates' },
  { id: 'mammals', label: 'Mammals' },
  { id: 'birds', label: 'Birds' },
  { id: 'reptiles', label: 'Reptiles & Amphibians' },
  { id: 'landscapes', label: 'Landscapes & Habitats' },
  { id: 'insects', label: 'Macro & Insects' },
];

export const GalleryPage: React.FC = () => {
  const { photographs } = usePortfolio();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || searchParams.get('collection') || 'all'
  );

  useEffect(() => {
    document.title = 'Wildlife Gallery — Wild Rahi';
  }, []);

  useEffect(() => {
    const c = searchParams.get('category') || searchParams.get('collection');
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  // Subject-based taxonomy filtering
  const filteredPhotos = useMemo(() => {
    const published = photographs.filter((p) => p.published);
    if (selectedCategory === 'all') return published;

    return published.filter((p) => {
      const slug = p.categorySlug?.toLowerCase() || '';
      const name = p.categoryName?.toLowerCase() || '';
      const colId = p.collectionId?.toLowerCase() || '';
      const title = p.title?.toLowerCase() || '';
      const spec = p.speciesName?.toLowerCase() || '';

      if (selectedCategory === 'mammals') {
        return (
          slug === 'mammals' ||
          name.includes('mammal') ||
          colId.includes('mammal') ||
          spec.includes('tiger') ||
          spec.includes('cat') ||
          spec.includes('deer')
        );
      }
      if (selectedCategory === 'birds') {
        return (
          slug === 'birds' ||
          name.includes('bird') ||
          name.includes('avian') ||
          colId.includes('bird') ||
          spec.includes('kingfisher') ||
          spec.includes('bird')
        );
      }
      if (selectedCategory === 'reptiles') {
        return (
          slug === 'reptiles' ||
          name.includes('reptile') ||
          colId.includes('reptile') ||
          spec.includes('viper') ||
          spec.includes('snake')
        );
      }
      if (selectedCategory === 'landscapes') {
        return (
          slug === 'landscapes' ||
          name.includes('landscape') ||
          name.includes('wetland') ||
          colId.includes('landscape') ||
          title.includes('haor') ||
          title.includes('sundarbans')
        );
      }
      if (selectedCategory === 'insects') {
        return (
          slug === 'insects' ||
          name.includes('insect') ||
          name.includes('macro') ||
          colId.includes('insect') ||
          spec.includes('butterfly') ||
          spec.includes('mormon')
        );
      }

      return (
        p.collectionId === selectedCategory ||
        p.categorySlug === selectedCategory ||
        p.albumId === selectedCategory
      );
    });
  }, [photographs, selectedCategory]);

  const updateCategory = (next: string) => {
    setSelectedCategory(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') {
      params.delete('category');
      params.delete('collection');
    } else {
      params.set('category', next);
    }
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
            High-resolution natural-light wildlife plates across Bangladesh. Click any image to view full screen with lens and camera details.
          </p>
        </div>
      </section>

      {/* Clear Universal Category Filter Bar */}
      <section className="bg-card border-b border-border sticky top-20 z-20">
        <div className="site-container py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {SUBJECT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateCategory(cat.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-mono text-muted-foreground">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'plate' : 'plates'}
          </p>
        </div>
      </section>

      {/* Gapless Responsive Column Masonry */}
      <section className="site-container py-10 lg:py-16">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-secondary border border-border rounded-xl p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground">No plates found in this category</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select another category or view all plates.
            </p>
            <button
              type="button"
              onClick={() => updateCategory('all')}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Show All Plates
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6 space-y-5 lg:space-y-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid">
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
