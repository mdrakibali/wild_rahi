import { AboutHero } from "@/components/about/AboutHero";
import { AboutNarrative } from "@/components/about/AboutNarrative";
import type { SiteProfile } from "@/types/portfolio";
import React from "react";

interface AboutPageProps {
  profile: SiteProfile;
}

export const AboutPage: React.FC<AboutPageProps> = ({ profile }) => {
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
    </div>
  );
};
