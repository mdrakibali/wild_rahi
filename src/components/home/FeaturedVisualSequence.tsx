'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Expand } from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { getWildlifeCategoryLabel } from '@/lib/validation';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import type { Photograph } from '@/types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedVisualSequenceProps {
  photographs: Photograph[];
}

export const FeaturedVisualSequence: React.FC<FeaturedVisualSequenceProps> = ({
  photographs,
}) => {
  const { openPhotoModal } = useLightbox();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const featuredPlates = useMemo(() => {
    const pub = photographs.filter((p) => p.isPublished);
    const feat = pub.filter((p) => p.isFeatured);
    return (feat.length >= 3 ? feat : pub).slice(0, 8);
  }, [photographs]);

  useEffect(() => {
    if (featuredPlates.length < 2) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          anticipatePin: 1,
          scrub: 0.75,
          start: 'top top',
          end: () => `+=${Math.max(getScrollAmount(), 480)}`,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [featuredPlates.length]);

  if (featuredPlates.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="bg-obsidian text-white py-20 lg:py-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center overflow-hidden border-t border-white/10"
    >
      <div className="site-container mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55 font-medium">
            02 &middot; Featured Visual Sequence
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-white">
            Featured Visual Sequence
          </h2>
          <p className="text-sm sm:text-base text-white/70">
            A Visual Journey Across Wild Bangladesh
          </p>
        </div>

        <Link
          href="/gallery"
          className="group inline-flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/8 hover:bg-white text-white hover:text-obsidian px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-300 self-start sm:self-auto shrink-0"
        >
          Explore Full Gallery
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div
        ref={trackRef}
        className="flex gap-6 lg:gap-10 px-5 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 no-scrollbar"
      >
        {featuredPlates.map((photo, index) => (
          <article
            key={photo.id}
            className="shrink-0 w-[84vw] sm:w-[68vw] lg:w-[46vw] xl:w-[40vw] snap-center group"
          >
            <a
              href={`/gallery/${encodeURIComponent(photo.id)}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  openPhotoModal(photo, featuredPlates);
                }
              }}
              className="block w-full text-left focus:outline-none cursor-pointer"
              aria-label={`Open ${photo.title} in lightbox`}
            >
              <div className="relative overflow-hidden bg-surface-dark aspect-[16/10] rounded-xl border border-white/10">
                <PortfolioImage
                  src={photo.image}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 84vw, (max-width: 1024px) 68vw, 42vw"
                  className="object-cover rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white px-3 py-1.5 text-xs font-medium opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity border border-white/20">
                  <Expand className="w-3.5 h-3.5" />
                  View Plate
                </span>
              </div>

              <div className="pt-4 flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-serif font-medium text-white tracking-tight truncate">
                    {photo.title}
                  </h3>
                  <p className="text-sm text-white/65 mt-0.5 truncate">
                    {getWildlifeCategoryLabel(photo.category)}
                    {photo.description ? ` · ${photo.description}` : ''}
                  </p>
                </div>
                <span className="text-xs font-mono text-white/45 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
