import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { SiteProfile } from '../../types/portfolio';

interface HomeIntroProps {
  profile: SiteProfile;
}

export const HomeIntro: React.FC<HomeIntroProps> = ({ profile }) => {
  return (
    <section id="introduction" className="bg-card text-foreground py-20 lg:py-28">
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Field Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-[1.12]">
            {profile.introHeading || 'Observing Wild Bangladesh With Patience'}
          </h2>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed font-normal">
            {profile.introBody}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            {profile.philosophy}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-xs"
            >
              Browse the Archive
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/wildlife"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
            >
              Species Field Index
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

