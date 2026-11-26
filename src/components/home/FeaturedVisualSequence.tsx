'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Expand } from 'lucide-react';
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
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const featuredPlates = useMemo(() => {
    const pub = photographs.filter((p) => p.isPublished);
    const feat = pub.filter((p) => p.isFeatured);
    return (feat.length >= 3 ? feat : pub).slice(0, 8);
  }, [photographs]);

  useEffect(() => {
    if (featuredPlates.length < 2) return;

    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const wrapper = wrapperRef.current;
      const sticky = stickyRef.current;
      const track = trackRef.current;
      if (!wrapper || !sticky || !track) return;

      let lastDist = -1;
      let lastStickyH = -1;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - sticky.clientWidth);

      const syncHeight = () => {
        const dist = getDistance();
        const stickyH = sticky.offsetHeight;
        lastDist = dist;
        lastStickyH = stickyH;
        wrapper.style.height = dist > 0 ? `${stickyH + dist}px` : 'auto';
      };

      syncHeight();

      // Use native CSS position:sticky + pure transform scrub (zero pin-spacer DOM flicker)
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80px',
          end: () => `+=${Math.max(1, getDistance())}`,
          scrub: 0.45,
          invalidateOnRefresh: true,
          onRefreshInit: syncHeight,
        },
      });

      const ro = new ResizeObserver(() => {
        const dist = getDistance();
        const stickyH = sticky.offsetHeight;
        if (Math.abs(dist - lastDist) > 1 || Math.abs(stickyH - lastStickyH) > 1) {
          syncHeight();
          ScrollTrigger.refresh();
        }
      });
      ro.observe(sticky);
      ro.observe(track);

      return () => {
        ro.disconnect();
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
        wrapper.style.height = 'auto';
      };
    });

    return () => mm.revert();
  }, [featuredPlates.length]);

  if (featuredPlates.length === 0) return null;

  return (
    <section
      ref={wrapperRef}
      className="relative bg-obsidian text-white border-t border-white/10"
    >
      <div
        ref={stickyRef}
        className="lg:sticky lg:top-20 py-10 lg:py-12 overflow-hidden"
      >
        <div className="site-container mb-7 lg:mb-8 space-y-2 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55 font-medium">
            02 &middot; Selected Photographs
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-white">
            Featured Frames
          </h2>
          <p className="text-sm sm:text-base text-white/70">
            Recent wildlife photographs from North Bengal and across Bangladesh.
          </p>
        </div>

        <div
          ref={trackRef}
          className="flex gap-5 lg:gap-7 pl-5 sm:pl-8 lg:pl-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 lg:pb-0 no-scrollbar will-change-transform"
        >
          {featuredPlates.map((photo, index) => (
            <article
              key={photo.id}
              className="shrink-0 w-[82vw] sm:w-[62vw] lg:w-[44vw] xl:w-[38vw] snap-start group"
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
                <div className="relative overflow-hidden bg-surface-dark aspect-[16/10] rounded-lg border border-white/10">
                  <PortfolioImage
                    src={photo.image}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 62vw, 38vw"
                    className="object-cover rounded-lg transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white px-3 py-1.5 text-xs font-medium opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity border border-white/20">
                    <Expand className="w-3.5 h-3.5" />
                    View Plate
                  </span>
                </div>

                <div className="pt-3.5 flex items-baseline justify-between gap-4">
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
          <div
            className="shrink-0 w-1 sm:w-4 lg:w-[max(0.5rem,calc((100vw-1280px)/2+0.5rem))]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};
