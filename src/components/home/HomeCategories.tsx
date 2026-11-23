'use client';

import React, { useRef } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Collection } from '../../types/portfolio';

interface HomeCategoriesProps {
  collections: Collection[];
  countsByCollection: Record<string, number>;
}

export const HomeCategories: React.FC<HomeCategoriesProps> = ({
  collections,
  countsByCollection,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Taxonomic Focus
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12] text-foreground">
              Wildlife Categories
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Mobile Carousel Controls */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-9 h-9 rounded-md border border-border bg-card text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous category"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="w-9 h-9 rounded-md border border-border bg-card text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next category"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/photography"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
            >
              Open Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Responsive Hybrid: Swipeable Carousel on Mobile, Grid on Desktop */}
        <div
          ref={carouselRef}
          className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 no-scrollbar scroll-smooth"
        >
          {collections.map((cat) => {
            const count = countsByCollection[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                to={`/photography?collection=${encodeURIComponent(cat.id)}`}
                className="shrink-0 w-[72vw] sm:w-[45vw] lg:w-auto snap-start group block bg-card border border-border rounded-md overflow-hidden"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  <img
                    src={cat.coverImageUrl}
                    alt={cat.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-obsidian/85 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-0.5 rounded-md">
                    {count} {count === 1 ? 'plate' : 'plates'}
                  </div>
                </div>
                <div className="p-4 space-y-1.5">
                  <h3 className="text-lg font-serif font-bold tracking-tight text-foreground">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
