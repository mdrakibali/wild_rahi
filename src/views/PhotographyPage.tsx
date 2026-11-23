'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Search } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/lightbox/Lightbox';
import { filterPhotographs } from '../lib/validation';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { PhotoCard } from '../components/photography/PhotoCard';

export const PhotographyPage: React.FC = () => {
  const { photographs, collections, locations } = usePortfolio();
  const [searchParams, setSearchParams] = useSearchParams();

  const [collectionId, setCollectionId] = useState<string>(
    searchParams.get('collection') || 'all'
  );
  const [locationSlug, setLocationSlug] = useState<string>(
    searchParams.get('location') || 'all'
  );
  const [speciesQuery, setSpeciesQuery] = useState<string>(searchParams.get('q') || '');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Photography Gallery — Wild Rahi';
  }, []);

  useEffect(() => {
    const c = searchParams.get('collection');
    const l = searchParams.get('location');
    if (c) setCollectionId(c);
    if (l) setLocationSlug(l);
  }, [searchParams]);

  const filteredPhotos = useMemo(
    () =>
      filterPhotographs(photographs, {
        collectionId,
        locationSlug,
        speciesQuery,
      }),
    [photographs, collectionId, locationSlug, speciesQuery]
  );

  const updateCollection = (next: string) => {
    setCollectionId(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('collection');
    else params.set('collection', next);
    setSearchParams(params, { replace: true });
  };

  const updateLocation = (next: string) => {
    setLocationSlug(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('location');
    else params.set('location', next);
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setCollectionId('all');
    setLocationSlug('all');
    setSpeciesQuery('');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    collectionId !== 'all' || locationSlug !== 'all' || speciesQuery.trim().length > 0;

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Page Header */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="site-container space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Curated Archive
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
            Wildlife Photography
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Natural-light plates documenting Bangladesh&apos;s wildlife across mangroves, riverine chars,
            and tropical rainforests. Select any plate to inspect full frame with EXIF data.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-card border-b border-border sticky top-20 z-20 shadow-2xs">
        <div className="site-container py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateCollection('all')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                collectionId === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              All Categories
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => updateCollection(col.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  collectionId === col.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex-1 min-w-[220px] max-w-sm">
                <Input
                  icon={<Search className="w-4 h-4" />}
                  placeholder="Search species, title, or habitat..."
                  value={speciesQuery}
                  onChange={(e) => setSpeciesQuery(e.target.value)}
                />
              </div>

              <div className="w-48">
                <Select
                  aria-label="Filter by habitat location"
                  value={locationSlug}
                  onChange={(e) => updateLocation(e.target.value)}
                >
                  <option value="all">All Habitats</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <p className="text-xs font-mono text-muted-foreground">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'plate' : 'plates'}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="site-container py-14 lg:py-20">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-secondary border border-border rounded-xl p-8 max-w-xl mx-auto shadow-xs">
            <h2 className="text-2xl font-serif font-bold text-foreground">No matching plates found</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Try clearing your filters or searching another species or habitat.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={resetFilters}
            >
              Show All Plates
            </Button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onInspect={() => setLightboxIndex(index)}
              />
            ))}
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
