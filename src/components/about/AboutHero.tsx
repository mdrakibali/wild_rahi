import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SiteProfile } from '@/types/portfolio';

interface AboutHeroProps {
  profile: SiteProfile;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ profile }) => {
  return (
    <section className="bg-secondary border-b border-border py-16 lg:py-24">
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-muted border border-border rounded-md">
            {profile.portraitUrl && (
              <img
                src={profile.portraitUrl}
                alt={profile.photographerName}
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Photographer &amp; Naturalist &middot; {profile.location}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] text-foreground">
            {profile.bioHeadline || profile.photographerName}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/85 leading-relaxed font-normal">
            {profile.bioSummary}
          </p>
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
                  icon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Facebook Page
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
