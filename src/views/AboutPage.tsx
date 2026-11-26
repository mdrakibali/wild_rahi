'use client';

import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { AboutHero } from '../components/about/AboutHero';
import { AboutNarrative } from '../components/about/AboutNarrative';

export const AboutPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = `About ${profile.photographerName} — Wild Rahi`;
  }, [profile.photographerName]);

  return (
    <div className="bg-background text-foreground pt-20">
      <AboutHero profile={profile} />

      <section className="bg-card py-16 lg:py-24">
        <div className="site-container">
          <AboutNarrative profile={profile} />
        </div>
      </section>
    </div>
  );
};
