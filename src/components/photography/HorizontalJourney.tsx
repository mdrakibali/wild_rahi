'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Expand } from 'lucide-react';
import type { Photograph } from '../../types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalJourneyProps {
  photographs: Photograph[];
  onSelectPhoto: (index: number) => void;
}

export const HorizontalJourney: React.FC<HorizontalJourneyProps> = ({
  photographs,
  onSelectPhoto,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (photographs.length < 2) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
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
          scrub: 0.7,
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
  }, [photographs.length]);

  if (photographs.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="bg-obsidian text-white py-20 lg:py-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center overflow-hidden"
    >
      <div className="site-container mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">
            Featured Visual Sequence
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.12]">
            A Horizontal Journey Through Wild Habitats
          </h2>
        </div>
        <p className="text-sm text-white/65 max-w-sm">
          Select any plate to inspect full-resolution detail, habitat context, and field camera
          notes.
        </p>
      </div>

      <div
        ref={trackRef}
        className="flex gap-6 lg:gap-10 px-5 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 no-scrollbar"
      >
        {photographs.map((photo, index) => (
          <article
            key={photo.id}
            className="shrink-0 w-[84vw] sm:w-[68vw] lg:w-[46vw] xl:w-[40vw] snap-center group"
          >
            <button
              type="button"
              onClick={() => onSelectPhoto(index)}
              className="block w-full text-left focus:outline-none"
              aria-label={`Open ${photo.title} in lightbox`}
            >
              <div className="relative overflow-hidden bg-surface-dark aspect-[16/10] rounded-md">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md"
                />
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-obsidian/80 text-white px-3 py-1 text-xs font-medium opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <Expand className="w-3.5 h-3.5" />
                  View Plate
                </span>
              </div>
              <div className="pt-4 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                    {photo.title}
                  </h3>
                  <p className="text-sm text-white/65 mt-0.5">
                    {photo.speciesName} &middot; {photo.locationName}
                  </p>
                </div>
                <span className="text-xs font-mono text-white/45 shrink-0">
                  {String(index + 1).padStart(2, '0')} / {String(photographs.length).padStart(2, '0')}
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
