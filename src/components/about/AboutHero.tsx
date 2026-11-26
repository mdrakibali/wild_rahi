import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../common/SocialIcons';

interface AboutHeroProps {
  profile: SiteProfile;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ profile }) => {
  return (
    <section className="bg-background border-b border-border py-14 lg:py-24">
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={
                profile.portraitUrl ||
                '/assets/images/portrait_photographer_field_1795067902652.jpg'
              }
              alt={profile.photographerName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Wildlife Photographer &mdash; {profile.location}
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-semibold tracking-tight leading-[1.08] text-foreground">
            {profile.bioHeadline || profile.photographerName}
          </h1>

          <p className="text-lg sm:text-xl text-foreground/85 leading-relaxed">
            {profile.bioSummary}
          </p>

          {profile.passionNote && (
            <p className="text-base text-muted-foreground leading-relaxed border-l border-border pl-4">
              {profile.passionNote}
            </p>
          )}

          <div className="pt-3 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[0.14em] font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {profile.facebookUrl && (
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3.5 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                Facebook
              </a>
            )}
            {profile.instagramUrl && (
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3.5 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                Instagram
              </a>
            )}
            {profile.youtubeUrl && (
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3.5 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
