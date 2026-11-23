import React from 'react';
import type { SiteProfile } from '@/types/portfolio';

interface AboutSidebarProps {
  profile: SiteProfile;
}

export const AboutSidebar: React.FC<AboutSidebarProps> = ({ profile }) => {
  return (
    <aside className="lg:col-span-5 space-y-6">
      {profile.equipmentNote && (
        <div className="bg-secondary border border-border rounded-2xl p-7 space-y-2.5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Field Equipment
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {profile.equipmentNote}
          </p>
        </div>
      )}

      {profile.achievementsNote && (
        <div className="bg-secondary border border-border rounded-2xl p-7 space-y-2.5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Collaborations &amp; Exhibitions
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {profile.achievementsNote}
          </p>
        </div>
      )}

      {profile.printSpecsNote && (
        <div className="bg-secondary border border-border rounded-2xl p-7 space-y-2.5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Archival Fine-Art Prints
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {profile.printSpecsNote}
          </p>
        </div>
      )}

      {profile.licensingNote && (
        <div className="bg-secondary border border-border rounded-2xl p-7 space-y-2.5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Editorial &amp; Conservation Licensing
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {profile.licensingNote}
          </p>
        </div>
      )}
    </aside>
  );
};
