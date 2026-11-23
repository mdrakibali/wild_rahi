import React from 'react';
import { Award, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';

interface AboutSidebarProps {
  profile: SiteProfile;
}

export const AboutSidebar: React.FC<AboutSidebarProps> = ({ profile }) => {
  return (
    <aside className="lg:col-span-5 space-y-6">
      {/* Field Equipment & Devices */}
      {profile.equipmentNote && (
        <div className="bg-secondary border border-border rounded-md p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
              Field Cameras &amp; Optical Devices
            </p>
          </div>
          <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line font-mono text-xs bg-card/60 p-3.5 rounded border border-border/80">
            {profile.equipmentNote}
          </div>
        </div>
      )}

      {/* Awards & Recognitions */}
      {profile.achievementsNote && (
        <div className="bg-secondary border border-border rounded-md p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <p className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
              Awards, Exhibitions &amp; Honors
            </p>
          </div>
          <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line space-y-2">
            {profile.achievementsNote.split('\n').map((line, idx) => {
              const cleanLine = line.trim();
              if (!cleanLine) return null;
              return (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{cleanLine.replace(/^[•\-\*]\s*/, '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Archival Prints */}
      {profile.printSpecsNote && (
        <div className="bg-secondary border border-border rounded-md p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Archival Fine-Art Prints
          </p>
          <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
            {profile.printSpecsNote}
          </p>
        </div>
      )}

      {/* Licensing & Field Standards */}
      {profile.licensingNote && (
        <div className="bg-secondary border border-border rounded-md p-6 space-y-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Editorial &amp; Conservation Licensing
            </p>
          </div>
          <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
            {profile.licensingNote}
          </p>
        </div>
      )}
    </aside>
  );
};
