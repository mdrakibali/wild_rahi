import React from 'react';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutNarrative } from '@/components/about/AboutNarrative';
import { AboutFieldMarquee } from '@/components/about/AboutFieldMarquee';
import type { Photograph, SiteProfile } from '@/types/portfolio';

interface AboutPageProps {
  profile: SiteProfile;
  photographs: Photograph[];
}

export const AboutPage: React.FC<AboutPageProps> = ({ profile, photographs }) => {
  return (
    <div className="bg-background text-foreground pt-20">
      {/* First Section: Info Left + Portrait Right */}
      <AboutHero profile={profile} />

      {/* Middle Narrative Cards */}
      <section className="bg-card py-16 lg:py-24">
        <div className="site-container">
          <AboutNarrative profile={profile} />
        </div>
      </section>

      {/* Lower Auto-Scrolling Camera & Wildlife Collage */}
      <AboutFieldMarquee photographs={photographs} />
    </div>
  );
};
