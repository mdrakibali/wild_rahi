'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, Expand, Search } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/lightbox/Lightbox';
import { ALLOWED_CONSERVATION_STATUSES, filterSpeciesArchive } from '../lib/validation';

export const WildlifeArchivePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { species, photographs, locations } = usePortfolio();

  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const selectedSpecies = useMemo(
    () => (slug ? species.find((s) => s.slug === slug || s.id === slug) || null : null),
    [species, slug]
  );

  const relatedPhotos = useMemo(() => {
    if (!selectedSpecies) return [];
    return photographs.filter(
      (p) =>
        p.published &&
        (p.speciesSlug === selectedSpecies.slug ||
          p.speciesName.toLowerCase() === selectedSpecies.commonName.toLowerCase())
    );
  }, [photographs, selectedSpecies]);

  const regions = useMemo(
    () => Array.from(new Set(species.map((s) => s.habitatRegion).filter(Boolean))),
    [species]
  );

  const filteredSpecies = useMemo(
    () =>
      filterSpeciesArchive(species, {
        region: regionFilter,
        status: statusFilter,
        search: searchQuery,
      }),
    [species, regionFilter, statusFilter, searchQuery]
  );

  useEffect(() => {
    if (selectedSpecies) {
      document.title = `${selectedSpecies.commonName} (${selectedSpecies.scientificName}) — Wild Rahi`;
    } else {
      document.title = 'Wildlife Archive & Biodiversity Index — Wild Rahi';
    }
  }, [selectedSpecies]);

  if (slug) {
    if (!selectedSpecies) {
      return (
        <div className="bg-[#FFFFFF] text-[#171717] pt-36 pb-24 px-5 text-center space-y-5">
          <h1 className="text-3xl font-semibold">Species Dossier Not Found</h1>
          <p className="text-sm text-[#686868]">
            This wildlife entry may have been updated or moved.
          </p>
          <Link
            to="/wildlife"
            className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Wildlife Archive
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-[#FFFFFF] text-[#171717] pt-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
          <Link
            to="/wildlife"
            className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] px-4 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F7F4] transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Wildlife Archive
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden bg-[#F0F0EC]">
                <img
                  src={selectedSpecies.coverImageUrl}
                  alt={selectedSpecies.commonName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-[#F0F0EC] px-3.5 py-1 text-xs font-medium text-[#171717]">
                  {selectedSpecies.conservationStatus}
                </span>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
                  {selectedSpecies.commonName}
                </h1>
                <p className="text-lg italic text-[#686868]">{selectedSpecies.scientificName}</p>
                {selectedSpecies.bengaliName && (
                  <p className="text-lg text-[#171717]/80" lang="bn">
                    {selectedSpecies.bengaliName}
                  </p>
                )}
              </div>

              <p className="text-base text-[#171717]/85 leading-relaxed">
                {selectedSpecies.description}
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E7E7E2]">
                <div className="bg-[#F7F7F4] p-4 border border-[#E7E7E2]">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#686868]">
                    Habitat &amp; Region
                  </dt>
                  <dd className="text-sm font-medium mt-1">
                    {selectedSpecies.habitat} ({selectedSpecies.habitatRegion})
                  </dd>
                </div>
                <div className="bg-[#F7F7F4] p-4 border border-[#E7E7E2]">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#686868]">
                    Conservation Reference
                  </dt>
                  <dd className="text-sm font-medium mt-1">{selectedSpecies.conservationSource}</dd>
                </div>
                {selectedSpecies.seasonality && (
                  <div className="bg-[#F7F7F4] p-4 border border-[#E7E7E2]">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[#686868]">
                      Field Seasonality
                    </dt>
                    <dd className="text-sm mt-1 text-[#171717]/85">
                      {selectedSpecies.seasonality}
                    </dd>
                  </div>
                )}
                {selectedSpecies.dietAndBehavior && (
                  <div className="bg-[#F7F7F4] p-4 border border-[#E7E7E2]">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[#686868]">
                      Behavior &amp; Ecology
                    </dt>
                    <dd className="text-sm mt-1 text-[#171717]/85">
                      {selectedSpecies.dietAndBehavior}
                    </dd>
                  </div>
                )}
              </dl>

              {selectedSpecies.keyThreats && (
                <div className="p-5 bg-[#F0F0EC] border border-[#E7E7E2] space-y-1.5">
                  <h2 className="text-xs uppercase tracking-[0.14em] text-[#686868] font-medium">
                    Documented Threats
                  </h2>
                  <p className="text-sm text-[#171717]/85 leading-relaxed">
                    {selectedSpecies.keyThreats}
                  </p>
                </div>
              )}
            </div>
          </div>

          {relatedPhotos.length > 0 && (
            <div className="mt-20 pt-14 border-t border-[#E7E7E2]">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
                Field Photographs of {selectedSpecies.commonName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {relatedPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="group text-left focus:outline-none"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F0F0EC]">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#0B0B0B]/80 text-[#FFFFFF] px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <Expand className="w-3 h-3" />
                        Inspect
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mt-3">{photo.title}</h3>
                    <p className="text-xs text-[#686868]">
                      {photo.locationName} &middot; {photo.year}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Lightbox
          photographs={relatedPhotos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] text-[#171717] pt-20">
      <section className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
            Biodiversity Documentation
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08]">
            Wildlife Archive
          </h1>
          <p className="text-base sm:text-lg text-[#686868] max-w-2xl leading-relaxed">
            Species profiles documented across Bangladesh&apos;s mangroves, wetlands, and forests
            &mdash; including scientific nomenclature, Bangla names, habitat notes, and conservation
            status.
          </p>
        </div>
      </section>

      {/* Filter Controls */}
      <section className="bg-[#FFFFFF] border-b border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-[#686868] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search common, scientific, or বাংলা name..."
                className="w-full rounded-full border border-[#E7E7E2] bg-[#F7F7F4] pl-10 pr-4 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717] focus:bg-[#FFFFFF]"
              />
            </div>

            <select
              aria-label="Filter by region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-full border border-[#E7E7E2] bg-[#F7F7F4] px-4 py-2 text-sm text-[#171717]"
            >
              <option value="all">All Regions</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by conservation status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[#E7E7E2] bg-[#F7F7F4] px-4 py-2 text-sm text-[#171717]"
            >
              <option value="all">All Statuses</option>
              {ALLOWED_CONSERVATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs font-mono text-[#686868]">
            {filteredSpecies.length} documented {filteredSpecies.length === 1 ? 'species' : 'species'}
          </p>
        </div>
      </section>

      {/* Species Grid */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpecies.map((item) => (
            <Link
              key={item.id}
              to={`/wildlife/${encodeURIComponent(item.slug)}`}
              className="group bg-[#FFFFFF] border border-[#E7E7E2] hover:border-[#171717]/40 transition-colors flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#F0F0EC]">
                <img
                  src={item.coverImageUrl}
                  alt={item.commonName}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#686868]">{item.habitatRegion}</span>
                    <span className="rounded-full bg-[#F0F0EC] px-3 py-0.5 text-[11px] font-medium text-[#171717]">
                      {item.conservationStatus}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
                    {item.commonName}
                  </h2>
                  <p className="text-sm italic text-[#686868]">
                    {item.scientificName}
                    {item.bengaliName ? ` · ${item.bengaliName}` : ''}
                  </p>
                  <p className="text-sm text-[#686868] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#171717] group-hover:underline">
                  Open Species Dossier &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Habitats Directory Strip */}
      <section className="bg-[#F0F0EC] border-t border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl space-y-2 mb-10">
            <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
              Field Regions
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">Key Ecosystems of Bangladesh</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-[#FFFFFF] border border-[#E7E7E2] p-6 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#686868]">
                  {loc.region} &middot; {loc.ecosystem}
                </p>
                <h3 className="text-xl font-semibold">{loc.name}</h3>
                <p className="text-sm text-[#686868] leading-relaxed">{loc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
