'use client';

import React, { useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const ETHICAL_PRINCIPLES = [
  {
    title: 'Zero Disturbance, Zero Baiting',
    body: 'No live bait, audio call playback during nesting season, or flash photography on nocturnal reptiles and owls. Every frame waits on natural behavior.',
  },
  {
    title: 'Geolocation Protection',
    body: 'Exact GPS coordinates of threatened species, nesting colonies, and fishing cat corridors are stripped from EXIF headers and never published publicly.',
  },
  {
    title: 'Habitat-First Storytelling',
    body: 'Showing an animal within its wider forest, wetland, or tidal channel communicates why ecosystem protection matters more than isolated trophy portraits.',
  },
  {
    title: 'Local Community Respect',
    body: 'Field work relies on local boatmen, forest guides, and wetland fishermen whose livelihoods and knowledge are essential to long-term conservation.',
  },
];

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
    <div className="bg-card text-foreground pt-20">
      {/* Light Header */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Conservation &amp; Responsibility
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08] max-w-4xl">
            Documentation Before Disappearance
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Bangladesh holds extraordinary ecological density &mdash; mangroves, seasonally flooded
            haors, hill forests, and riverine chars &mdash; all facing rapid climate and habitat
            pressure.
          </p>
        </div>
      </section>

      {/* Dark Cinematic Statement Band */}
      <section className="bg-obsidian text-white py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55 font-medium">
            Core Ethos
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.14]">
            {profile.conservationHeadline}
          </h2>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl">
            {profile.conservationStatement}
          </p>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/15">
            <div>
              <p className="text-3xl font-semibold">{locations.length}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
                Priority Ecosystems Documented
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{species.length}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
                Catalogued Species Profiles
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{threatenedCount}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
                IUCN Threatened Taxa Tracked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Field Charter */}
      <section className="bg-card py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl space-y-3 mb-14">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Code of Conduct
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Ethical Wildlife Photography Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ETHICAL_PRINCIPLES.map((item) => (
              <div key={item.title} className="bg-secondary border border-border p-8 space-y-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration CTA */}
      <section className="bg-muted border-t border-border py-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-2.5">
            <h2 className="text-3xl font-semibold tracking-tight">
              Partner With Wild Rahi on Conservation Media
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Non-profits, researchers, universities, and conservation publications can request
              visual documentation, species reference images, or awareness talks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Discuss a Collaboration
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/wildlife"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card text-foreground px-6 py-3.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Browse Species Archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
