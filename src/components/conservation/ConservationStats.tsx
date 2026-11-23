import React from 'react';

interface ConservationStatsProps {
  headline: string;
  statement: string;
  ecosystemCount: number;
  speciesCount: number;
  threatenedCount: number;
}

export const ConservationStats: React.FC<ConservationStatsProps> = ({
  headline,
  statement,
  ecosystemCount,
  speciesCount,
  threatenedCount,
}) => {
  return (
    <section className="bg-obsidian text-white py-20 lg:py-28">
      <div className="site-container space-y-7">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55 font-semibold">
          Core Ethos
        </p>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-[1.14]">
          {headline}
        </h2>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl font-normal">
          {statement}
        </p>
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-white/15">
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-accent">{ecosystemCount}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
              Priority Ecosystems Documented
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-accent">{speciesCount}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
              Catalogued Species Profiles
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-accent">{threatenedCount}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-white/60 mt-1">
              IUCN Threatened Taxa Tracked
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

