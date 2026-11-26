'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import { splitIntoBentoRows } from '@/lib/bentoLayout';
import type { SiteProfile } from '@/types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface HomeAboutSectionProps {
  profile: SiteProfile;
}

const MAX_ABOUT_FRAMES = 8;

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({ profile }) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Render strictly admin-managed personal photographs from the database (zero static fallback photos)
  const bentoRows = useMemo(() => {
    const items: Array<{ id: string; src: string; alt: string }> = [];
    const used = new Set<string>();
    const customImages = (profile.aboutImages ?? []).filter(Boolean);

    for (let i = 0; i < customImages.length && items.length < MAX_ABOUT_FRAMES; i++) {
      const imgUrl = customImages[i];
      if (!imgUrl || used.has(imgUrl)) continue;
      used.add(imgUrl);
      items.push({
        id: `about-personal-${i}`,
        src: imgUrl,
        alt: `${profile.photographerName || 'Wild Rahi'} — frame ${i + 1}`,
      });
    }

    return splitIntoBentoRows(items.slice(0, MAX_ABOUT_FRAMES));
  }, [profile.aboutImages, profile.photographerName]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.about-grid-frame',
          { y: 16, opacity: 0.25 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background text-foreground py-20 lg:py-28 border-t border-border"
    >
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: Compact Bento Collage Block (only shown when personal photos exist in DB) */}
        {bentoRows.length > 0 && (
          <div className="lg:col-span-5">
            <div className="max-w-[440px] mx-auto lg:mx-0 space-y-2">
              {bentoRows.map((row, rowIdx) => (
                <div
                  key={`home-bento-row-${rowIdx}`}
                  className={
                    row.variant === 'two'
                      ? 'grid grid-cols-2 gap-2'
                      : row.variant === 'three'
                        ? 'grid grid-cols-3 gap-2'
                        : 'grid grid-cols-1 gap-2'
                  }
                >
                  {row.items.map((item) => {
                    const aspectClass =
                      row.variant === 'three' ? 'aspect-[4/3]' : 'aspect-[3/2]';
                    return (
                      <div
                        key={item.id}
                        className={`about-grid-frame group relative overflow-hidden rounded-lg bg-muted border border-border ${aspectClass}`}
                      >
                        <PortfolioImage
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes={
                            row.variant === 'three'
                              ? '(max-width: 1024px) 30vw, 150px'
                              : '(max-width: 1024px) 45vw, 220px'
                          }
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right: Editorial Biography */}
        <div
          className={`${
            bentoRows.length > 0 ? 'lg:col-span-7 lg:pl-4' : 'lg:col-span-8 max-w-2xl'
          } space-y-6`}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            01 &middot; About the Photographer
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-semibold tracking-tight leading-[1.1] text-foreground">
            {profile.photographerName}
          </h2>

          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            {profile.bioSummary}
          </p>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed border-l-2 border-border pl-4">
            {profile.passionNote}
          </p>

          <div className="pt-2">
            <Link
              href="/about"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground transition-colors"
            >
              Discover More
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
