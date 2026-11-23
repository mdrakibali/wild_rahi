import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { SiteProfile } from '../../types/portfolio';

interface HomeConservationProps {
  profile: SiteProfile;
}

export const HomeConservation: React.FC<HomeConservationProps> = ({ profile }) => {
  return (
    <section className="bg-obsidian text-white py-20 lg:py-28 border-t border-white/10">
      <div className="site-container text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55 font-semibold">
          Conservation Commitment
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.12] max-w-3xl mx-auto">
          {profile.conservationHeadline || 'Every Photograph Is a Record of What Must Endure'}
        </h2>
        <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
          {profile.conservationStatement}
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/conservation"
            className="inline-flex items-center gap-2 rounded-md bg-white text-obsidian px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
          >
            Read Ethical Guidelines
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:border-white/50 transition-colors"
          >
            Conservation Partnerships
          </Link>
        </div>
      </div>
    </section>
  );
};

