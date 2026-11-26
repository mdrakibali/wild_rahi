'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import type { Photograph, SiteProfile } from '@/types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface HomeAboutSectionProps {
  photographs: Photograph[];
  profile: SiteProfile;
}

const FALLBACK_WILDLIFE_FRAMES = [
  {
    image: '/assets/images/hero_sundarbans_tiger_1795067902199.jpg',
    title: 'Royal Bengal Tiger, Sundarbans',
  },
  {
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    title: 'Common Kingfisher, Lawachara',
  },
  {
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    title: 'Fishing Cat, Tanguar Haor',
  },
  {
    image: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
    title: 'Pied Kingfisher in Flight',
  },
  {
    image: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
    title: 'Green Pit Viper, Rainforest Canopy',
  },
  {
    image: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
    title: 'Tanguar Haor Dawn Mist',
  },
];

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({
  photographs,
  profile,
}) => {
  const { openPhotoModal } = useLightbox();
  const sectionRef = useRef<HTMLElement | null>(null);

  const gridItems = useMemo(() => {
    const items: Array<{ src: string; alt: string; photo?: Photograph }> = [];
    const used = new Set<string>();

    for (const p of photographs) {
      if (items.length >= 6) break;
      if (!p.image || used.has(p.image)) continue;
      used.add(p.image);
      items.push({ src: p.image, alt: p.title, photo: p });
    }

    for (const fb of FALLBACK_WILDLIFE_FRAMES) {
      if (items.length >= 6) break;
      if (used.has(fb.image)) continue;
      used.add(fb.image);
      items.push({ src: fb.image, alt: fb.title });
    }

    return items;
  }, [photographs]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.about-grid-frame',
          { y: 18, opacity: 0.25 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.07,
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

  const renderFrame = (
    item: { src: string; alt: string; photo?: Photograph } | undefined,
    extraClass: string,
    sizes: string
  ) => {
    if (!item) return null;
    return (
      <div
        className={`about-grid-frame group relative overflow-hidden rounded-xl bg-muted border border-border ${extraClass} ${
          item.photo ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (item.photo) openPhotoModal(item.photo, photographs);
        }}
      >
        <PortfolioImage
          src={item.src}
          alt={item.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="bg-background text-foreground py-20 lg:py-32 border-t border-border"
    >
      <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Asymmetric 2 - 3 - 1 Photography Grid */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-end">
            {renderFrame(gridItems[0], 'col-span-7 aspect-[16/10]', '(max-width: 1024px) 60vw, 35vw')}
            {renderFrame(gridItems[1], 'col-span-5 aspect-[4/5]', '(max-width: 1024px) 40vw, 24vw')}
          </div>

          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start">
            {renderFrame(gridItems[2], 'col-span-4 aspect-[4/5]', '(max-width: 1024px) 33vw, 20vw')}
            {renderFrame(
              gridItems[3],
              'col-span-4 aspect-square sm:translate-y-4',
              '(max-width: 1024px) 33vw, 20vw'
            )}
            {renderFrame(gridItems[4], 'col-span-4 aspect-[4/5]', '(max-width: 1024px) 33vw, 20vw')}
          </div>

          <div className="grid grid-cols-12 gap-3 sm:gap-4 pt-1 sm:pt-3">
            {renderFrame(
              gridItems[5],
              'col-span-10 col-start-2 sm:col-span-9 sm:col-start-3 aspect-[16/9]',
              '(max-width: 1024px) 80vw, 45vw'
            )}
          </div>
        </div>

        {/* Right: Editorial Biography */}
        <div className="lg:col-span-5 space-y-6 lg:pl-4">
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
              className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-card hover:bg-secondary px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold text-foreground transition-colors"
            >
              Discover More
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
