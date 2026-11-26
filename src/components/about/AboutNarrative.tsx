import React from 'react';
import type { SiteProfile } from '@/types/portfolio';

interface AboutNarrativeProps {
  profile: SiteProfile;
}

export const AboutNarrative: React.FC<AboutNarrativeProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {profile.journeyNote && (
        <div className="rounded-xl border border-border bg-background p-6 sm:p-8 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            01 &middot; Field Journey
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-foreground">
            In the Wild
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed">
            {profile.journeyNote}
          </p>
        </div>
      )}

      {profile.philosophy && (
        <div className="rounded-xl border border-border bg-background p-6 sm:p-8 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            02 &middot; Approach
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-foreground">
            Field Philosophy
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed">
            {profile.philosophy}
          </p>
        </div>
      )}
    </div>
  );
};
