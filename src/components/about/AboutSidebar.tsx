import React from 'react';
import { Award, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';

interface AboutSidebarProps {
  profile: SiteProfile;
}

const PRIMARY_GEAR_CARDS = [
  {
    name: 'Sony Alpha 1 Flagship Body',
    category: 'Primary Camera',
    role: '50.1MP Full-Frame & 30fps Tracking',
    image: '/assets/gear/sony_a1.jpg',
  },
  {
    name: 'Sony FE 600mm f/4 GM OSS',
    category: 'Apex Telephoto',
    role: 'Extreme Reach & Natural Light Prime',
    image: '/assets/gear/telephoto_lens.jpg',
  },
  {
    name: 'DJI Mavic 3 Pro Cine',
    category: 'Ecological Aerial',
    role: 'Hasselblad Tri-Camera Survey System',
    image: '/assets/gear/aerial_drone.jpg',
  },
  {
    name: 'Gitzo Carbon + Wimberley Gimbal',
    category: 'Fluid Support',
    role: 'Systematic 5X Tripod & WH-200 Head',
    image: '/assets/gear/tripod_gimbal.jpg',
  },
];

export const AboutSidebar: React.FC<AboutSidebarProps> = ({ profile }) => {
  return (
    <aside className="lg:col-span-5 space-y-8">
      {/* Visual Camera & Field Optics Showcase */}
      <div className="bg-secondary border border-border rounded-md p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
              Field Camera &amp; Optics Gear
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">Sony &amp; Gitzo</span>
        </div>

        {/* 2x2 Visual Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRIMARY_GEAR_CARDS.map((gear, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-md overflow-hidden flex flex-col group hover:border-primary/50 transition-colors"
            >
              <div className="h-28 w-full bg-muted overflow-hidden relative">
                <img
                  src={gear.image}
                  alt={gear.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white font-medium border border-white/10">
                  {gear.category}
                </span>
              </div>
              <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-semibold text-foreground leading-snug">
                  {gear.name}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {gear.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Gear Notes Breakdown */}
        {profile.equipmentNote && (
          <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line font-mono text-xs bg-card/60 p-3.5 rounded border border-border/80">
            {profile.equipmentNote}
          </div>
        )}
      </div>

      {/* Awards & Recognitions */}
      {profile.achievementsNote && (
        <div className="bg-secondary border border-border rounded-md p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <p className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
              Awards, Exhibitions &amp; Honors
            </p>
          </div>
          <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line space-y-2.5">
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
