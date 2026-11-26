'use client';

import React, { useMemo } from 'react';
import Marquee from 'react-fast-marquee';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import { useLightbox } from '@/context/LightboxContext';
import { splitIntoBentoRows } from '@/lib/bentoLayout';
import type { Photograph } from '@/types/portfolio';

interface MarqueeFrame {
  id: string;
  src: string;
  caption: string;
  photo?: Photograph;
}

const GEAR_AND_FIELD_FRAMES: Array<{ src: string; caption: string }> = [
  { src: '/assets/gear/sony_a1.jpg', caption: 'Silent Electronic Shutter Body' },
  { src: '/assets/gear/telephoto_lens.jpg', caption: 'Super-Telephoto Optics' },
  { src: '/assets/gear/tripod_gimbal.jpg', caption: 'Carbon Tripod & Fluid Gimbal' },
  { src: '/assets/gear/aerial_drone.jpg', caption: 'Habitat Aerial Documentation' },
  { src: '/assets/images/insect_swallowtail_butterfly_1795067901756.jpg', caption: 'Macro Field Encounter' },
];

export const AboutFieldMarquee: React.FC<{ photographs: Photograph[] }> = ({ photographs }) => {
  const { openPhotoModal } = useLightbox();

  // Build 10-card (or 20-card) blocks using the exact 2 - 3 - 3 - 2 rhythm
  const bentoBlocks = useMemo(() => {
    const publishedPhotos = photographs.filter((p) => p.isPublished && p.image);
    const pool: MarqueeFrame[] = [];
    const used = new Set<string>();

    for (const p of publishedPhotos) {
      if (!used.has(p.image)) {
        used.add(p.image);
        pool.push({ id: `photo-${p.id}`, src: p.image, caption: p.title, photo: p });
      }
    }

    GEAR_AND_FIELD_FRAMES.forEach((g, idx) => {
      if (!used.has(g.src)) {
        used.add(g.src);
        pool.push({ id: `extra-${idx}`, src: g.src, caption: g.caption });
      }
    });

    if (pool.length === 0) return [];

    // Ensure at least one full 10-card 2-3-3-2 block, or multiples of 10
    const targetCount = pool.length <= 10 ? 10 : Math.ceil(pool.length / 10) * 10;
    const filled: MarqueeFrame[] = [];
    for (let i = 0; i < targetCount; i++) {
      const base = pool[i % pool.length];
      filled.push({ ...base, id: `${base.id}-${i}` });
    }

    const blocks: Array<ReturnType<typeof splitIntoBentoRows<MarqueeFrame>>> = [];
    for (let i = 0; i < filled.length; i += 10) {
      blocks.push(splitIntoBentoRows(filled.slice(i, i + 10)));
    }
    return blocks;
  }, [photographs]);

  if (bentoBlocks.length === 0) return null;

  return (
    <section className="bg-background text-foreground py-16 lg:py-24 border-t border-border overflow-hidden">
      <div className="site-container mb-10 space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
          03 &middot; Gear &amp; Field Visuals
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-foreground">
          Field Kit &amp; Moments
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
          Cameras, lenses, and wildlife encounters gliding across the field archive.
        </p>
      </div>

      <Marquee speed={28} pauseOnHover gradient={false} autoFill className="py-2">
        <div className="flex items-start gap-4 sm:gap-5 pr-4 sm:pr-5">
          {bentoBlocks.map((rows, blockIdx) => (
            <div
              key={`marquee-block-${blockIdx}`}
              className="w-[340px] sm:w-[430px] lg:w-[490px] shrink-0 rounded-xl bg-obsidian p-2.5 sm:p-3 border border-border space-y-2 sm:space-y-2.5"
            >
              {rows.map((row, rowIdx) => (
                <div
                  key={`marquee-row-${blockIdx}-${rowIdx}`}
                  className={
                    row.variant === 'two'
                      ? 'grid grid-cols-2 gap-2 sm:gap-2.5'
                      : row.variant === 'three'
                        ? 'grid grid-cols-3 gap-2 sm:gap-2.5'
                        : 'grid grid-cols-1 gap-2 sm:gap-2.5'
                  }
                >
                  {row.items.map((frame) => {
                    const aspectClass =
                      row.variant === 'three' ? 'aspect-[3/4]' : 'aspect-[16/10]';
                    return (
                      <div
                        key={frame.id}
                        onClick={() => {
                          if (frame.photo) openPhotoModal(frame.photo, photographs);
                        }}
                        className={`group relative overflow-hidden rounded-xl bg-surface-dark ${aspectClass} ${
                          frame.photo ? 'cursor-pointer' : ''
                        }`}
                      >
                        <PortfolioImage
                          src={frame.src}
                          alt={frame.caption}
                          fill
                          sizes={row.variant === 'three' ? '160px' : '240px'}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Marquee>
    </section>
  );
};
