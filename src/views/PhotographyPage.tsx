'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Expand, Search, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/lightbox/Lightbox';
import { filterPhotographs, formatExifMetadata, getAspectRatioClass } from '../lib/validation';

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
    <div className="bg-[#FFFFFF] text-[#171717] pt-20">
      {/* Page Header */}
      <section className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
            Curated Archive
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08]">
            Wildlife Photography
          </h1>
          <p className="text-base sm:text-lg text-[#686868] max-w-2xl leading-relaxed">
            Natural-light plates documenting Bangladesh&apos;s birds, mammals, reptiles, insects, and
            wild landscapes. Select any photograph to view full frame with field notes and camera
            settings.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-[#FFFFFF] border-b border-[#E7E7E2] sticky top-20 z-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateCollection('all')}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                collectionId === 'all'
                  ? 'bg-[#171717] text-[#FFFFFF]'
                  : 'bg-[#F7F7F4] text-[#171717] hover:bg-[#F0F0EC]'
              }`}
            >
              All Categories
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => updateCollection(col.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  collectionId === col.id
                    ? 'bg-[#171717] text-[#FFFFFF]'
                    : 'bg-[#F7F7F4] text-[#171717] hover:bg-[#F0F0EC]'
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-[#686868] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={speciesQuery}
                  onChange={(e) => setSpeciesQuery(e.target.value)}
                  placeholder="Search species, title, or habitat..."
                  className="w-full rounded-full border border-[#E7E7E2] bg-[#F7F7F4] pl-10 pr-4 py-2 text-sm text-[#171717] placeholder:text-[#686868] focus:outline-none focus:border-[#171717] focus:bg-[#FFFFFF]"
                />
              </div>

              <select
                aria-label="Filter by habitat location"
                value={locationSlug}
                onChange={(e) => updateLocation(e.target.value)}
                className="rounded-full border border-[#E7E7E2] bg-[#F7F7F4] px-4 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              >
                <option value="all">All Habitats</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E7E7E2] px-4 py-2 text-xs font-medium text-[#686868] hover:text-[#171717] hover:border-[#171717]/40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>

            <p className="text-xs font-mono text-[#686868]">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photograph' : 'photographs'}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#F7F7F4] border border-[#E7E7E2] p-8">
            <h2 className="text-2xl font-semibold">No matching plates found</h2>
            <p className="text-sm text-[#686868]">
              Try clearing your filters or searching another species or habitat.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium"
            >
              Show All Photographs
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredPhotos.map((photo, index) => (
              <article
                key={photo.id}
                className="break-inside-avoid group bg-[#FFFFFF] border-b border-[#E7E7E2] pb-6"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="block w-full text-left focus:outline-none"
                  aria-label={`Inspect ${photo.title} in lightbox`}
                >
                  <div
                    className={`relative overflow-hidden bg-[#F0F0EC] ${getAspectRatioClass(
                      photo.aspectRatio
                    )}`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#0B0B0B]/80 text-[#FFFFFF] px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <Expand className="w-3.5 h-3.5" />
                      Inspect
                    </span>
                  </div>

                  <div className="pt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-lg font-semibold tracking-tight text-[#171717] group-hover:opacity-75 transition-opacity">
                        {photo.title}
                      </h2>
                      <span className="text-xs font-mono text-[#686868] shrink-0">{photo.year}</span>
                    </div>
                    <p className="text-sm text-[#686868]">
                      {photo.speciesName} &middot; {photo.locationName}
                    </p>
                    {formatExifMetadata(photo) && (
                      <p className="text-[11px] font-mono text-[#686868]/80 pt-1">
                        {formatExifMetadata(photo)}
                      </p>
                    )}
                  </div>
                </button>
              </article>
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
