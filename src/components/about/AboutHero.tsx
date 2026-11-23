import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight, Award, Calendar, Camera, Compass, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon } from '../common/SocialIcons';

interface AboutHeroProps {
  profile: SiteProfile;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ profile }) => {
  return (
    <section className="bg-secondary border-b border-border py-16 lg:py-24">
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-muted border border-border rounded-md relative shadow-sm">
            {profile.portraitUrl ? (
              <img
                src={profile.portraitUrl}
                alt={profile.photographerName}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted text-center text-muted-foreground">
                <Camera className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/60" />
                <p className="text-sm font-serif font-bold text-foreground">{profile.photographerName}</p>
                <p className="text-xs text-muted-foreground mt-1">Field Naturalist &amp; Wildlife Documentarian</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Wildlife Photographer &amp; Naturalist
            </span>
            {profile.born && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded bg-card border border-border text-foreground">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {profile.born}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] text-foreground">
            {profile.bioHeadline || profile.photographerName}
          </h1>

          <p className="text-lg sm:text-xl text-foreground/85 leading-relaxed font-normal">
            {profile.bioSummary}
          </p>

          {/* Quick Vital Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-card border border-border rounded-md p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Field Base
              </p>
              <p className="text-xs font-semibold text-foreground mt-1 truncate">
                {profile.location || 'Bangladesh'}
              </p>
            </div>
            {profile.fieldExperienceYears && (
              <div className="bg-card border border-border rounded-md p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Field Practice
                </p>
                <p className="text-xs font-semibold text-foreground mt-1 truncate">
                  {profile.fieldExperienceYears}
                </p>
              </div>
            )}
            <div className="bg-card border border-border rounded-md p-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" /> Ethics Standard
              </p>
              <p className="text-xs font-semibold text-foreground mt-1 truncate">
                Zero-Intrusion Wildlife
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/contact">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Work With Rahi
              </Button>
            </Link>
            {profile.facebookUrl && (
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={<FacebookIcon className="w-4 h-4" />}
                >
                  Facebook
                </Button>
              </a>
            )}
            {profile.instagramUrl && (
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={<InstagramIcon className="w-4 h-4" />}
                >
                  Instagram
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
