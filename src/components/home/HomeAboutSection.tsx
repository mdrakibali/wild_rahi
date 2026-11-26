'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import { splitIntoBentoRows } from '@/lib/bentoLayout';
import type { Photograph, SiteProfile } from '@/types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface HomeAboutSectionProps {
  photographs: Photograph[];
  profile: SiteProfile;
}

const FALLBACK_WILDLIFE_FRAMES = [
  {
    image: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
    title: 'Pied Kingfisher in Flight, North Bengal',
  },
  {
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    title: 'Common Kingfisher by Woodland Stream',
  },
  {
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    title: 'Fishing Cat, Northern Wetlands',
  },
  {
    image: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
    title: 'Green Pit Viper in Woodland Canopy',
  },
  {
    image: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
    title: 'Dawn Mist Over Seasonal Wetlands',
  },
  {
    image: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg',
    title: 'Common Mormon Butterfly, Forest Edge',
  },
  {
    image: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    title: 'Wild Felid Portrait in Golden Light',
  },
  {
    image: '/assets/gear/sony_a1.jpg',
    title: 'Silent Field Camera System',
  },
  {
    image: '/assets/gear/telephoto_lens.jpg',
    title: 'Super-Telephoto Field Optics',
  },
  {
    image: '/assets/gear/aerial_drone.jpg',
    title: 'Wetland & Riverine Perspective',
  },
];

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({
  photographs,
  profile,
}) => {
  const { openPhotoModal } = useLightbox();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Build 10-frame 2 - 3 - 3 - 2 bento collage strictly from published/project wildlife frames
  const bentoRows = useMemo(() => {
    const items: Array<{ id: string; src: string; alt: string; photo?: Photograph }> = [];
    const used = new Set<string>();

    for (const p of photographs) {
      if (items.length >= 10) break;
      if (!p.image || used.has(p.image)) continue;
      used.add(p.image);
      items.push({ id: p.id, src: p.image, alt: p.title, photo: p });
    }

    for (let i = 0; i < FALLBACK_WILDLIFE_FRAMES.length && items.length < 10; i++) {
      const fb = FALLBACK_WILDLIFE_FRAMES[i];
      if (used.has(fb.image)) continue;
      used.add(fb.image);
      items.push({ id: `fb-${i}`, src: fb.image, alt: fb.title });
    }

    let padIdx = 0;
    while (items.length > 0 && items.length < 10) {
      const base = items[padIdx % items.length];
      items.push({ ...base, id: `${base.id}-pad-${padIdx}` });
      padIdx += 1;
    }

    return splitIntoBentoRows(items.slice(0, 10));
  }, [photographs]);

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
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left: 2 - 3 - 3 - 2 Bento Collage Block */}
        <div className="lg:col-span-7">
          <div className="space-y-2.5 sm:space-y-3">
            {bentoRows.map((row, rowIdx) => (
              <div
                key={`home-bento-row-${rowIdx}`}
                className={
                  row.variant === 'two'
                    ? 'grid grid-cols-2 gap-2.5 sm:gap-3'
                    : row.variant === 'three'
                      ? 'grid grid-cols-3 gap-2.5 sm:gap-3'
                      : 'grid grid-cols-1 gap-2.5 sm:gap-3'
                }
              >
                {row.items.map((item) => {
                  const aspectClass =
                    row.variant === 'three' ? 'aspect-[3/4]' : 'aspect-[16/10]';
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.photo) openPhotoModal(item.photo, photographs);
                      }}
                      className={`about-grid-frame group relative overflow-hidden rounded-lg bg-muted border border-border ${aspectClass} ${
                        item.photo ? 'cursor-pointer' : ''
                      }`}
                    >
                      <PortfolioImage
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes={
                          row.variant === 'three'
                            ? '(max-width: 1024px) 32vw, 18vw'
                            : '(max-width: 1024px) 48vw, 27vw'
                        }
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editorial Biography */}
        <div className="lg:col-span-5 space-y-6 lg:pl-2">
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
