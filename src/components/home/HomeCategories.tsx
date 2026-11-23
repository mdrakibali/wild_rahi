import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '../../types/portfolio';

interface HomeCategoriesProps {
  collections: Collection[];
  countsByCollection: Record<string, number>;
}

export const HomeCategories: React.FC<HomeCategoriesProps> = ({
  collections,
  countsByCollection,
}) => {
  return (
    <section className="bg-secondary text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Taxonomic Focus
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12]">
              Wildlife Categories
            </h2>
          </div>
          <Link
            to="/photography"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors self-start md:self-auto"
          >
            Open Full Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.slice(0, 4).map((cat) => {
            const count = countsByCollection[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                to={`/photography?collection=${encodeURIComponent(cat.id)}`}
                className="group block bg-card border border-border rounded-md overflow-hidden"
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
