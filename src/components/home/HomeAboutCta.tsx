import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { SiteProfile } from '../../types/portfolio';

interface HomeAboutCtaProps {
  profile: SiteProfile;
}

export const HomeAboutCta: React.FC<HomeAboutCtaProps> = ({ profile }) => {
  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted border border-border shadow-xs">
            {profile.portraitUrl && (
              <img
                src={profile.portraitUrl}
                alt={profile.photographerName}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Photographer &amp; Field Naturalist
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-[1.12]">
              {profile.photographerName} &mdash; {profile.brandName}
            </h2>
          </div>

          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            {profile.bioSummary}
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Available for editorial assignments, conservation documentation, archival fine-art prints, and licensing.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-xs"
            >
              Work With Rahi
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
            >
              Biography &amp; Field Kit
            </Link>
            {profile.facebookUrl && (
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground px-4 py-2.5 text-xs font-medium hover:bg-secondary transition-colors"
              >
                Facebook
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

