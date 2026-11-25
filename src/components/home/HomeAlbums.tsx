'use client';

import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, Images } from 'lucide-react';
import type { Collection } from '@/types/portfolio';

interface HomeAlbumsProps {
  collections: Collection[];
  countsByCollection: Record<string, number>;
}

export const HomeAlbums: React.FC<HomeAlbumsProps> = ({
  collections,
  countsByCollection,
}) => {
  const featuredAlbums = collections.slice(0, 3);

  if (featuredAlbums.length === 0) return null;

  return (
    <section className="bg-secondary text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Thematic Series &amp; Expeditions
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold tracking-tight text-foreground leading-[1.12]">
              Featured Field Albums
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Long-term photographic series documenting specific ecosystems, seasonal migrations, and endangered species.
            </p>
          </div>

          <Link
            to="/albums"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors self-start md:self-auto"
          >
            View All Albums
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredAlbums.map((album) => {
            const count = countsByCollection[album.id] ?? 0;
            const albumHref = `/albums/${encodeURIComponent(album.slug || album.id)}`;

            return (
              <Link
                key={album.id}
                to={albumHref}
                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={album.coverImageUrl}
                    alt={album.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  <div className="absolute top-3.5 right-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/95 border border-white/20">
                      <Images className="w-3.5 h-3.5 text-primary" />
                      {count} {count === 1 ? 'Plate' : 'Plates'}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-4 right-4">
                    <h3 className="text-xl font-serif font-bold text-white tracking-tight leading-snug drop-shadow-sm group-hover:text-primary transition-colors">
                      {album.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {album.description || 'Field photographic series and natural habitat study.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary group-hover:text-primary/80 transition-colors border-t border-border/60">
                    <span>Explore Series</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
