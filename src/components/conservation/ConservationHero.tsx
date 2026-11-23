import React from 'react';

export const ConservationHero: React.FC = () => {
  return (
    <section className="bg-secondary border-b border-border py-16 lg:py-24">
      <div className="site-container space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Conservation &amp; Responsibility
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.08] max-w-4xl text-foreground">
          Documentation Before Disappearance
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Bangladesh holds extraordinary ecological density &mdash; mangroves, seasonally flooded
          haors, hill forests, and riverine chars &mdash; all facing rapid climate and habitat
          pressure.
        </p>
      </div>
    </section>
  );
};

