'use client';

import React, { useEffect, useRef } from 'react';
import { Link } from '@/lib/router-compat';
import gsap from 'gsap';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { Photograph, SiteProfile } from '../../types/portfolio';

interface CinematicHeroProps {
  heroPhoto?: Photograph | null;
  profile: SiteProfile;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ heroPhoto, profile }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.07, opacity: 0.72 },
          { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }
        );
      }

      gsap.fromTo(
        '.hero-stagger',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full bg-obsidian text-white flex flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0">
        {heroPhoto?.imageUrl && (
          <img
            ref={imageRef}
            src={heroPhoto.imageUrl}
            alt={heroPhoto.title}
            fetchPriority="high"
            className="w-full h-full object-cover object-center"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,11,11,0.48) 0%, rgba(11,11,11,0.18) 38%, rgba(11,11,11,0.72) 78%, rgba(11,11,11,0.94) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 site-container pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl space-y-5">
          <p className="hero-stagger text-xs sm:text-sm uppercase tracking-[0.2em] text-white/75 font-medium">
            {profile.brandName} &mdash; {profile.location}
          </p>

          <h1 className="hero-stagger text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-tight leading-[1.06] text-white">
            {profile.heroHeadline || 'Wild Bangladesh, Quietly Witnessed'}
          </h1>

          <p className="hero-stagger text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed font-normal">
            {profile.heroSubheadline}
          </p>

          <div className="hero-stagger pt-3 flex flex-wrap items-center gap-3.5">
            <Link
              to="/photography"
              className="inline-flex items-center gap-2.5 rounded-md bg-card text-obsidian px-7 py-3.5 text-sm sm:text-[15px] font-medium hover:bg-muted transition-colors shadow-sm"
            >
              Explore Photography
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-md border border-white/35 text-white px-7 py-3.5 text-sm sm:text-[15px] font-medium hover:bg-card/10 hover:border-white/70 transition-colors"
            >
              Discover My Story
            </Link>
          </div>
        </div>

        <div className="hero-stagger mt-12 sm:mt-16 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-white/70">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {heroPhoto ? (
              <>
                <span className="text-white font-medium">{heroPhoto.speciesName}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{heroPhoto.locationName}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{heroPhoto.year}</span>
              </>
            ) : (
              <span className="text-white/80">{profile.location || 'Bangladesh'}</span>
            )}
          </div>

          <a
            href="#introduction"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75 hover:text-white transition-colors self-start sm:self-auto"
          >
            Scroll to explore
            <ArrowDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
