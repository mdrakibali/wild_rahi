'use client';

import React, { useEffect, useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Images } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { PhotoCard } from '@/components/photography/PhotoCard';
import { Button } from '@/components/ui/Button';

interface AlbumDetailPageProps {
  slug: string;
}

export const AlbumDetailPage: React.FC<AlbumDetailPageProps> = ({ slug }) => {
  const { collections, photographs } = usePortfolio();

  const album = useMemo(() => {
    return (
      collections.find((c) => (c.slug || c.id) === slug || c.id === slug) ||
      collections[0]
    );
  }, [collections, slug]);

  const albumPhotos = useMemo(() => {
    if (!album) return [];
    return photographs.filter((p) => p.published && p.collectionId === album.id);
  }, [photographs, album]);

  useEffect(() => {
    if (album) {
      document.title = `${album.title} — Wildlife Album | Wild Rahi`;
    }
  }, [album]);

  if (!album) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-20 site-container text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold">Album Not Found</h1>
        <p className="text-sm text-muted-foreground">The requested photographic album could not be found.</p>
        <Link to="/albums">
          <Button variant="primary">Browse All Albums</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Header */}
      <section className="bg-secondary border-b border-border py-12 lg:py-16">
        <div className="site-container space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Link to="/albums" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Albums
            </Link>
            <span>/</span>
            <span className="text-foreground">{album.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-bold tracking-tight leading-[1.1]">
                {album.title}
              </h1>
              {album.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {album.description}
                </p>
              )}
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 text-xs font-medium text-foreground">
                <Images className="w-3.5 h-3.5 text-primary" />
                {albumPhotos.length} {albumPhotos.length === 1 ? 'Photograph' : 'Photographs'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Album Photos - Tight Mosaic Grid matching Image 2 */}
      <section className="site-container py-10 lg:py-16">
        {albumPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-secondary border border-border rounded-xl p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground">No Photos in this Album</h2>
            <p className="text-sm text-muted-foreground">
              Photographs will appear here once uploaded and categorized under this album in Admin.
            </p>
            <Link to="/gallery">
              <Button variant="primary">Explore Wildlife Gallery</Button>
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6 space-y-5 lg:space-y-6">
            {albumPhotos.map((photo) => (
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

