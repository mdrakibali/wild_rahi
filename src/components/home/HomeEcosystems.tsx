import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { HabitatLocation } from '../../types/portfolio';

interface HomeEcosystemsProps {
  locations: HabitatLocation[];
}

export const HomeEcosystems: React.FC<HomeEcosystemsProps> = ({ locations }) => {
  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Documented Ecosystems
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12]">
              Habitats of Bangladesh
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              From tidal mangrove creeks of the Sundarbans to monsoon wetlands and northeastern evergreen forests.
            </p>
          </div>
          <Link
            to="/wildlife"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-primary hover:text-white transition-colors self-start md:self-auto shadow-2xs"
          >
            Explore Habitats
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.slice(0, 3).map((loc) => (
            <Link
              key={loc.id}
              to={`/photography?location=${encodeURIComponent(loc.slug)}`}
              className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-foreground/40 transition-all shadow-xs hover:shadow-md"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted rounded-2xl m-3 mb-0">
                <img
                  src={loc.coverImageUrl}
                  alt={loc.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                    {loc.region} &middot; {loc.ecosystem}
                  </p>
                  <h3 className="text-xl font-serif font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {loc.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline">
                  View habitat plates
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
