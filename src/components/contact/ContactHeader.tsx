import React from 'react';

export const ContactHeader: React.FC = () => {
  return (
    <section className="bg-secondary border-b border-border py-16 lg:py-24">
      <div className="site-container space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Commissions, Licensing &amp; Conservation
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.08] text-foreground">
          Get in Touch
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Write directly for wildlife photography commissions, editorial licensing, archival
          prints, or biodiversity documentation collaborations across Bangladesh.
        </p>
      </div>
    </section>
  );
};

