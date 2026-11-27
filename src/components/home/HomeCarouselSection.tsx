'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const HOME_CAROUSEL_SLIDE_CLASS =
  'shrink-0 w-[84%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3.5rem)/3)] snap-start flex';

interface HomeCarouselSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  viewAllHref: string;
  viewAllLabel?: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  surfaceClass?: string;
  controlClass?: string;
  itemCount: number;
  children: React.ReactNode;
}

/**
 * Shared editorial horizontal card slider section for Home page Videos and Stories,
 * featuring top Previous/Next navigation arrows, View All link, and touch-friendly snap scrolling.
 */
export const HomeCarouselSection: React.FC<HomeCarouselSectionProps> = ({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View All',
  prevAriaLabel,
  nextAriaLabel,
  surfaceClass = 'bg-card',
  controlClass = 'bg-background hover:bg-secondary',
  itemCount,
  children,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const rafId = window.requestAnimationFrame(syncScrollState);
    track.addEventListener('scroll', syncScrollState, { passive: true });
    window.addEventListener('resize', syncScrollState, { passive: true });

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(syncScrollState)
        : null;
    observer?.observe(track);

    return () => {
      window.cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', syncScrollState);
      window.removeEventListener('resize', syncScrollState);
      observer?.disconnect();
    };
  }, [itemCount, syncScrollState]);

  const handleStep = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstSlide = track.firstElementChild as HTMLElement | null;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '24') || 24;
    const step = firstSlide
      ? firstSlide.getBoundingClientRect().width + gap
      : track.clientWidth * 0.85;

    track.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  };

  if (itemCount === 0) return null;

  return (
    <section className={`${surfaceClass} text-foreground py-20 lg:py-28 border-t border-border`}>
      <div className="site-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-7">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              {eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-foreground">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto shrink-0">
            <div className="inline-flex items-center gap-2" role="group" aria-label={`${title} slider navigation`}>
              <button
                type="button"
                onClick={() => handleStep(-1)}
                disabled={!canPrev}
                aria-label={prevAriaLabel}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border ${controlClass} text-foreground transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                disabled={!canNext}
                aria-label={nextAriaLabel}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border ${controlClass} text-foreground transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href={viewAllHref}
              className={`group inline-flex items-center gap-1.5 rounded-lg border border-border ${controlClass} px-3.5 h-9 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground transition-colors whitespace-nowrap`}
            >
              {viewAllLabel}
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 lg:gap-7 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1.5 -my-1.5"
        >
          {children}
        </div>
      </div>
    </section>
  );
};

