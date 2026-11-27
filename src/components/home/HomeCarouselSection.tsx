'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HOME_CAROUSEL_SLIDE_CLASS =
  'shrink-0 w-[84%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3.5rem)/3)] snap-start flex';

interface SlideMetrics {
  canPrev: boolean;
  canNext: boolean;
  totalStops: number;
  activeIndex: number;
  step: number;
  maxScrollLeft: number;
}

function getSlideMetrics(track: HTMLDivElement): SlideMetrics {
  const { scrollLeft, scrollWidth, clientWidth } = track;
  const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
  const firstSlide = track.firstElementChild as HTMLElement | null;
  const styles = window.getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap || '24') || 24;
  const step = firstSlide
    ? firstSlide.getBoundingClientRect().width + gap
    : Math.max(1, clientWidth * 0.85);

  const totalStops =
    maxScrollLeft > 4 ? Math.max(2, Math.round(maxScrollLeft / step) + 1) : 1;

  let activeIndex = 0;
  if (totalStops > 1) {
    activeIndex =
      scrollLeft >= maxScrollLeft - 4
        ? totalStops - 1
        : Math.min(totalStops - 1, Math.max(0, Math.round(scrollLeft / step)));
  }

  return {
    canPrev: scrollLeft > 4,
    canNext: scrollLeft < maxScrollLeft - 4,
    totalStops,
    activeIndex,
    step,
    maxScrollLeft,
  };
}

interface HomeCarouselSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  surfaceClass?: string;
  controlClass?: string;
  itemCount: number;
  children: React.ReactNode;
}

/**
 * Shared horizontal card slider for Home Videos and Stories with top Previous/Next arrows,
 * interactive bottom pagination dots, and touch-friendly snap scrolling.
 */
export const HomeCarouselSection: React.FC<HomeCarouselSectionProps> = ({
  eyebrow,
  title,
  description,
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
  const [totalStops, setTotalStops] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const metrics = getSlideMetrics(track);
    setCanPrev(metrics.canPrev);
    setCanNext(metrics.canNext);
    setTotalStops(metrics.totalStops);
    setActiveIndex(metrics.activeIndex);
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
    const { step } = getSlideMetrics(track);
    track.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  };

  const handleGoToStop = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const { step, totalStops: stops, maxScrollLeft } = getSlideMetrics(track);
    const targetLeft =
      index >= stops - 1 ? maxScrollLeft : Math.max(0, index * step);
    track.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });
  };

  if (itemCount === 0) return null;

  return (
    <section className={`${surfaceClass} text-foreground py-20 lg:py-28 border-t border-border`}>
      <div className="site-container space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-7">
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

          <div
            className="inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
            role="group"
            aria-label={`${title} slider controls`}
          >
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
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 lg:gap-7 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1.5 -my-1.5"
        >
          {children}
        </div>

        {totalStops > 1 && (
          <div
            className="flex items-center justify-center gap-2 pt-1"
            role="tablist"
            aria-label={`${title} slide indicators`}
          >
            {Array.from({ length: totalStops }, (_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1} of ${totalStops}`}
                  onClick={() => handleGoToStop(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-8 bg-foreground'
                      : 'w-2.5 bg-foreground/20 hover:bg-foreground/45'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
