'use client';

import React, { useEffect, useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, Images } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

export const AlbumsPage: React.FC = () => {
  const { collections, photographs } = usePortfolio();

  useEffect(() => {
    document.title = 'Wildlife Albums — Wild Rahi';
  }, []);

  // Compute number of photos in each collection/album
  const albumStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of photographs) {
      if (p.published && p.collectionId) {
        counts[p.collectionId] = (counts[p.collectionId] || 0) + 1;
      }
    }
    return counts;
  }, [photographs]);

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Header */}
      <section className="bg-secondary border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Visual Portfolios
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
            Wildlife Albums
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Thematic photographic albums and long-term expedition field series across Bangladesh.
            Select an album to explore all documented plates in full detail.
          </p>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="site-container py-12 lg:py-20">
        {collections.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-secondary border border-border rounded-xl p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground">No Albums Created Yet</h2>
            <p className="text-sm text-muted-foreground">
              Add new albums from the Admin dashboard to organize your photography into series.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {collections.map((album) => {
              const photoCount = albumStats[album.id] || 0;
              const albumHref = `/albums/${encodeURIComponent(album.slug || album.id)}`;

              return (
                <Link
                  key={album.id}
                  to={albumHref}
                  className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Cover Image Frame */}
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3.5 right-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/95 border border-white/20">
                        <Images className="w-3.5 h-3.5 text-primary" />
                        {photoCount} {photoCount === 1 ? 'Plate' : 'Plates'}
                      </span>
                    </div>

                    <div className="absolute bottom-3.5 left-4 right-4">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug drop-shadow-sm group-hover:text-primary transition-colors">
                        {album.title}
                      </h2>
                    </div>
                  </div>

                  {/* Album Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {album.description || 'Field photographic series and natural habitat study.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary group-hover:text-primary/80 transition-colors border-t border-border/60">
                      <span>Explore Album</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

