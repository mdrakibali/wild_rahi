'use client';

import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { AboutHero } from '../components/about/AboutHero';
import { AboutNarrative } from '../components/about/AboutNarrative';
import { AboutSidebar } from '../components/about/AboutSidebar';

export const AboutPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = `About ${profile.photographerName} — Wild Rahi`;
  }, [profile.photographerName]);

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Intro Split Hero */}
      <AboutHero profile={profile} />

      {/* Narrative & Field Notes */}
      <section className="bg-card py-20 lg:py-28">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <AboutNarrative profile={profile} />
          <AboutSidebar profile={profile} />
        </div>
      </section>
    </div>
  );
};
