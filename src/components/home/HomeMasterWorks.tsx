'use client';

import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Photograph } from '@/types/portfolio';
import { PhotoCard } from '@/components/photography/PhotoCard';

interface HomeMasterWorksProps {
  photographs: Photograph[];
}

export const HomeMasterWorks: React.FC<HomeMasterWorksProps> = ({ photographs }) => {
  const masterPlates = photographs.slice(0, 6);

  if (masterPlates.length === 0) return null;

  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Selected Portfolio
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold tracking-tight text-foreground leading-[1.12]">
              Curated Master Works
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Rare encounters captured through natural light, ethical distance, and quiet field observation across Bangladesh.
            </p>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors self-start md:self-auto shadow-xs"
          >
            Explore Complete Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Column Balanced Masonry Showcase */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6 space-y-5 lg:space-y-6">
          {masterPlates.map((photo) => (
            <div key={photo.id} className="break-inside-avoid">
              <PhotoCard photo={photo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
