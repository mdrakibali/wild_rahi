import React from 'react';
import type { SiteProfile } from '@/types/portfolio';

interface AboutNarrativeProps {
  profile: SiteProfile;
}

export const AboutNarrative: React.FC<AboutNarrativeProps> = ({ profile }) => {
  return (
    <div className="lg:col-span-7 space-y-10">
      {profile.journeyNote && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Field Journey
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            How Wild Rahi Began
          </h2>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            {profile.journeyNote}
          </p>
        </div>
      )}

      {profile.whyWildlifeMatters && (
        <div className="space-y-3 pt-8 border-t border-border">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Why It Matters
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            Biodiversity &amp; Public Awareness
          </h2>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            {profile.whyWildlifeMatters}
          </p>
        </div>
      )}

      {profile.philosophy && (
        <div className="space-y-3 pt-8 border-t border-border">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Approach
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
            Photographic Philosophy
          </h2>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            {profile.philosophy}
          </p>
        </div>
      )}
    </div>
  );
};

