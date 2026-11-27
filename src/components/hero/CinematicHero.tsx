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
    <section className="relative min-h-svh w-full bg-obsidian text-white flex flex-col justify-end overflow-hidden">
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
              {/* Mobile (< lg): soft ambient backdrop fills 100svh while sharp frame shows unzoomed full image */}
              <div className="lg:hidden absolute inset-0 overflow-hidden">
                <PortfolioImage
                  src={slide.image}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  hideLoader
                  className="object-cover object-center scale-110 blur-2xl opacity-45 brightness-75"
                />
                <div className="absolute inset-x-0 top-16 bottom-44 sm:top-20 sm:bottom-48">
                  <PortfolioImage
                    src={slide.image}
                    alt={slide.altText || profile.brandName || 'Wild Rahi Wildlife Photography'}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    hideLoader
                    className="object-contain object-center"
                  />
                </div>
              </div>

              {/* Desktop (>= lg): crisp full-bleed viewport frame */}
              <div className="hidden lg:block absolute inset-0">
                <PortfolioImage
                  src={slide.image}
                  alt={slide.altText || profile.brandName || 'Wild Rahi Wildlife Photography'}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  hideLoader
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.06) 38%, rgba(9,9,11,0.68) 76%, rgba(9,9,11,0.95) 100%)',
          }}
        />
      </div>

      {/* Editorial Foreground Content */}
      <div className="relative z-30 site-container pt-28 pb-10 sm:pt-32 sm:pb-14 lg:pb-20">
        <div className="max-w-3xl space-y-3 sm:space-y-4 lg:space-y-5">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.24em] text-white/75 font-medium">
            {profile.brandName} &mdash; {profile.location}
          </p>

          <div
            key={activeSlide?.id || 'hero-copy-default'}
            className="space-y-3 sm:space-y-4 lg:space-y-5 hero-copy-fade"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-serif font-semibold tracking-tight leading-[1.06] text-white">
              {activeHeadline}
            </h1>

            {activeSubtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed font-normal">
                {activeSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Interactive Slide Indicators */}
        {publishedSlides.length > 1 && (
          <div className="mt-6 sm:mt-8 flex items-center justify-between gap-4">
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
