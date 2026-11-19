'use client';

import React, { useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const AboutPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = `About ${profile.photographerName} — Wild Rahi`;
  }, [profile.photographerName]);

  return (
    <div className="bg-[#FFFFFF] text-[#171717] pt-20">
      {/* Intro Split */}
      <section className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-[#E7E7E2]">
              {profile.portraitUrl && (
                <img
                  src={profile.portraitUrl}
                  alt={profile.photographerName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
              Photographer &amp; Naturalist &middot; {profile.location}
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              {profile.bioHeadline || profile.photographerName}
            </h1>
            <p className="text-lg text-[#171717]/85 leading-relaxed">{profile.bioSummary}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-7 py-3 text-sm font-medium hover:bg-[#333333] transition-colors"
              >
                Work With Rahi
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 bg-[#FFFFFF] text-[#171717] px-6 py-3 text-sm font-medium hover:bg-[#F0F0EC] transition-colors"
              >
                Facebook Page
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Details */}
      <section className="bg-[#FFFFFF] py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Field Journey
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                How Wild Rahi Began
              </h2>
              <p className="text-base text-[#171717]/85 leading-relaxed">{profile.journeyNote}</p>
            </div>

            <div className="space-y-3 pt-8 border-t border-[#E7E7E2]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Why It Matters
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Biodiversity &amp; Public Awareness
              </h2>
              <p className="text-base text-[#171717]/85 leading-relaxed">
                {profile.whyWildlifeMatters}
              </p>
            </div>

            <div className="space-y-3 pt-8 border-t border-[#E7E7E2]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Approach
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Photographic Philosophy
              </h2>
              <p className="text-base text-[#171717]/85 leading-relaxed">{profile.philosophy}</p>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-7 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
                Field Equipment
              </p>
              <p className="text-sm text-[#171717]/85 leading-relaxed">{profile.equipmentNote}</p>
            </div>

            <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-7 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
                Collaborations &amp; Exhibitions
              </p>
              <p className="text-sm text-[#171717]/85 leading-relaxed">
                {profile.achievementsNote}
              </p>
            </div>

            {profile.printSpecsNote && (
              <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
                  Archival Fine-Art Prints
                </p>
                <p className="text-sm text-[#171717]/85 leading-relaxed">
                  {profile.printSpecsNote}
                </p>
              </div>
            )}

            {profile.licensingNote && (
              <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
                  Editorial &amp; Conservation Licensing
                </p>
                <p className="text-sm text-[#171717]/85 leading-relaxed">
                  {profile.licensingNote}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};
