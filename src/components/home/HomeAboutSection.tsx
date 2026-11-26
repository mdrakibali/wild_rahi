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

const MAX_ABOUT_FRAMES = 5;

const FALLBACK_WILDLIFE_FRAMES = [
  {
    image: '/assets/images/bird_pied_kingfisher_flight_1795067901863.jpg',
    title: 'Pied Kingfisher in Flight, North Bengal',
  },
  {
    image: '/assets/images/bird_kingfisher_sylhet_1795067903243.jpg',
    title: 'Common Kingfisher Perch',
  },
  {
    image: '/assets/images/mammal_fishing_cat_wetland_1795067902865.jpg',
    title: 'Fishing Cat in Wetland Reeds',
  },
  {
    image: '/assets/images/reptile_green_pit_viper_1795067904040.jpg',
    title: 'Green Pit Viper',
  },
  {
    image: '/assets/images/landscape_tanguar_haor_1795067901551.jpg',
    title: 'Winter Mist Over Northern Wetland',
  },
];

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({
  photographs,
  profile,
}) => {
  const { openPhotoModal } = useLightbox();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Build 5-frame 2 - 3 bento collage: prioritize admin-curated aboutImages, then published photographs, then wildlife fallbacks
  const bentoRows = useMemo(() => {
    const items: Array<{ id: string; src: string; alt: string; photo?: Photograph }> = [];
    const used = new Set<string>();
    const photoByImage = new Map<string, Photograph>();

    for (const p of photographs) {
      if (p.image && !photoByImage.has(p.image)) {
        photoByImage.set(p.image, p);
      }
    }

    const customImages = profile.aboutImages ?? [];
    for (let i = 0; i < customImages.length && items.length < MAX_ABOUT_FRAMES; i++) {
      const imgUrl = customImages[i];
      if (!imgUrl || used.has(imgUrl)) continue;
      used.add(imgUrl);
      const matchedPhoto = photoByImage.get(imgUrl);
      items.push({
        id: `about-custom-${i}`,
        src: imgUrl,
        alt: matchedPhoto?.title || `${profile.photographerName} portfolio frame ${i + 1}`,
        photo: matchedPhoto,
      });
    }

    for (const p of photographs) {
      if (items.length >= MAX_ABOUT_FRAMES) break;
      if (!p.image || used.has(p.image)) continue;
      used.add(p.image);
      items.push({ id: p.id, src: p.image, alt: p.title, photo: p });
    }

    for (let i = 0; i < FALLBACK_WILDLIFE_FRAMES.length && items.length < MAX_ABOUT_FRAMES; i++) {
      const fb = FALLBACK_WILDLIFE_FRAMES[i];
      if (used.has(fb.image)) continue;
      used.add(fb.image);
      items.push({ id: `fb-${i}`, src: fb.image, alt: fb.title });
    }

    return splitIntoBentoRows(items.slice(0, MAX_ABOUT_FRAMES));
  }, [photographs, profile.aboutImages, profile.photographerName]);

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
        {/* Left: 2 - 3 Bento Collage Block */}
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
