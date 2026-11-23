'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, Search } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/lightbox/Lightbox';
import { ALLOWED_CONSERVATION_STATUSES, filterSpeciesArchive } from '../lib/validation';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { SpeciesCard } from '../components/wildlife/SpeciesCard';
import { SpeciesDetailView } from '../components/wildlife/SpeciesDetailView';

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

  // Mode 1: Individual Species Dossier
  if (slug) {
    if (!selectedSpecies) {
      return (
        <div className="bg-background text-foreground pt-36 pb-24 site-container text-center space-y-5">
          <h1 className="text-3xl font-serif font-bold">Species Dossier Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This wildlife record may have been moved or updated.
          </p>
          <Link
            to="/wildlife"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Wildlife Archive
          </Link>
        </div>
      );
    }

    return (
      <>
        <SpeciesDetailView
          species={selectedSpecies}
          relatedPhotos={relatedPhotos}
          onInspectPhoto={(idx) => setLightboxIndex(idx)}
        />
        <Lightbox
          photographs={relatedPhotos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      </>
    );
  }

  // Mode 2: Wildlife Archive Index
  const hasActiveFilters = regionFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setRegionFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Page Header */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="site-container space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Biodiversity Index
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
            Wildlife Archive
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Curated dossiers on native wildlife documented across Bangladesh with IUCN conservation
            statuses, habitat classifications, and field ecology notes.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-card border-b border-border sticky top-20 z-20 shadow-2xs">
        <div className="site-container py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex-1 min-w-[220px] max-w-sm">
              <Input
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search common, scientific, or বাংলা name..."
              />
            </div>

            <div className="w-48">
              <Select
                aria-label="Filter by region"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">All Regions</option>
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-52">
              <Select
                aria-label="Filter by conservation status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {ALLOWED_CONSERVATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
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
                Clear
              </Button>
            )}
          </div>

          <p className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {filteredSpecies.length} {filteredSpecies.length === 1 ? 'species' : 'species'} indexed
          </p>
        </div>
      </section>

      {/* Species Grid */}
      <section className="site-container py-14 lg:py-20">
        {filteredSpecies.length === 0 ? (
          <div className="py-16 text-center bg-secondary border border-border rounded-xl p-8 space-y-4 max-w-xl mx-auto shadow-xs">
            <h2 className="text-2xl font-serif font-bold text-foreground">No species match your query</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Try adjusting your search terms or clearing region and status filters.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpecies.map((sp) => (
              <SpeciesCard key={sp.id} species={sp} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
