'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { HeroSlide, SiteProfile } from '@/types/portfolio';
import { PortfolioImage } from '@/components/common/PortfolioImage';

interface CinematicHeroProps {
  slides: HeroSlide[];
  profile: SiteProfile;
}

const SLIDE_DURATION_MS = 6000;

export const CinematicHero: React.FC<CinematicHeroProps> = ({ slides, profile }) => {
  const publishedSlides = useMemo(
    () =>
      slides
        .filter((s) => s.isPublished && s.image)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [slides]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = publishedSlides.length > 0 ? activeIndex % publishedSlides.length : 0;

  useEffect(() => {
    if (publishedSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % publishedSlides.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [publishedSlides.length]);

  const activeSlide = publishedSlides[safeIndex];
  const activeHeadline = activeSlide?.headline?.trim() || profile.heroHeadline;
  const activeSubtitle = activeSlide?.subtitle?.trim() || profile.heroSubheadline;

  return (
    <section className="relative min-h-[88vh] lg:min-h-screen w-full bg-obsidian text-white flex flex-col justify-end overflow-hidden">
      {/* Stacked Crossfading Photography Layers */}
      <div className="absolute inset-0 overflow-hidden">
        {publishedSlides.map((slide, index) => {
          const isActive = index === safeIndex;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <PortfolioImage
                src={slide.image}
                alt={slide.altText || profile.brandName || 'Wild Rahi Wildlife Photography'}
                fill
                sizes="100vw"
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
              />
            </div>
          );
        })}

        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(9,9,11,0.52) 0%, rgba(9,9,11,0.12) 40%, rgba(9,9,11,0.68) 78%, rgba(9,9,11,0.94) 100%)',
          }}
        />
      </div>

      {/* Minimal Editorial Foreground Content */}
      <div className="relative z-30 site-container pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl space-y-4 sm:space-y-5">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.24em] text-white/75 font-medium">
            {profile.brandName} &mdash; {profile.location}
          </p>

          <div
            key={activeSlide?.id || 'hero-copy-default'}
            className="space-y-4 sm:space-y-5 hero-copy-fade"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-serif font-semibold tracking-tight leading-[1.05] text-white">
              {activeHeadline}
            </h1>

            {activeSubtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed font-normal">
                {activeSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Subtle Auto Slide Indicators (interactive click to switch slide too) */}
        {publishedSlides.length > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {publishedSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View slide ${idx + 1}${slide.headline ? `: ${slide.headline}` : ''}`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === safeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            {activeSlide?.altText && (
              <p className="text-[11px] font-mono text-white/55 tracking-wide line-clamp-1">
                {activeSlide.altText}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
