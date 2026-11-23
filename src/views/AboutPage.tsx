'use client';

import React, { useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const AboutPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = `About ${profile.photographerName} — Wild Rahi`;
  }, [profile.photographerName]);

  return (
    <div className="bg-canvas text-foreground pt-20">
      {/* Intro Split */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              {profile.portraitUrl && (
                <img
                  src={profile.portraitUrl}
                  alt={profile.photographerName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Photographer &amp; Naturalist &middot; {profile.location}
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              {profile.bioHeadline || profile.photographerName}
            </h1>
            <p className="text-lg text-foreground/85 leading-relaxed">{profile.bioSummary}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Work With Rahi
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card text-foreground px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Facebook Page
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Details */}
      <section className="bg-card py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Field Journey
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                How Wild Rahi Began
              </h2>
              <p className="text-base text-foreground/85 leading-relaxed">{profile.journeyNote}</p>
            </div>

            <div className="space-y-3 pt-8 border-t border-border">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Why It Matters
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Biodiversity &amp; Public Awareness
              </h2>
              <p className="text-base text-foreground/85 leading-relaxed">
                {profile.whyWildlifeMatters}
              </p>
            </div>

            <div className="space-y-3 pt-8 border-t border-border">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Approach
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Photographic Philosophy
              </h2>
              <p className="text-base text-foreground/85 leading-relaxed">{profile.philosophy}</p>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-secondary border border-border p-7 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Field Equipment
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">{profile.equipmentNote}</p>
            </div>

            <div className="bg-secondary border border-border p-7 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Collaborations &amp; Exhibitions
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {profile.achievementsNote}
              </p>
            </div>

            {profile.printSpecsNote && (
              <div className="bg-secondary border border-border p-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Archival Fine-Art Prints
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {profile.printSpecsNote}
                </p>
              </div>
            )}

            {profile.licensingNote && (
              <div className="bg-secondary border border-border p-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Editorial &amp; Conservation Licensing
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {profile.licensingNote}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};
