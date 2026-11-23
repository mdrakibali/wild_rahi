'use client';

import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ConservationHero } from '../components/conservation/ConservationHero';
import { ConservationStats } from '../components/conservation/ConservationStats';
import { EthicalCharterCard, ETHICAL_PRINCIPLES } from '../components/conservation/EthicalCharterCard';
import { ConservationCta } from '../components/conservation/ConservationCta';

export const ConservationPage: React.FC = () => {
  const { profile, locations, species } = usePortfolio();

  useEffect(() => {
    document.title = 'Conservation & Field Ethics — Wild Rahi';
  }, []);

  const threatenedCount = species.filter(
    (s) =>
      s.conservationStatus === 'Vulnerable' ||
      s.conservationStatus === 'Endangered' ||
      s.conservationStatus === 'Critically Endangered'
  ).length;

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Editorial Header */}
      <ConservationHero />

      {/* Dark Cinematic Statement Band with Real-time Counters */}
      <ConservationStats
        headline={profile.conservationHeadline}
        statement={profile.conservationStatement}
        ecosystemCount={locations.length}
        speciesCount={species.length}
        threatenedCount={threatenedCount}
      />

      {/* Ethical Field Charter */}
      <section className="bg-card py-20 lg:py-28">
        <div className="site-container">
          <div className="max-w-2xl space-y-3 mb-14">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Code of Conduct
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
              Ethical Wildlife Photography Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ETHICAL_PRINCIPLES.map((item) => (
              <EthicalCharterCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration CTA */}
      <ConservationCta />
    </div>
  );
};
