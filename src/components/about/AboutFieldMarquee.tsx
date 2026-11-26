'use client';

import React, { useMemo } from 'react';
import Marquee from 'react-fast-marquee';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import { useLightbox } from '@/context/LightboxContext';
import type { Photograph } from '@/types/portfolio';

interface MarqueeFrame {
  id: string;
  src: string;
  label: string;
  caption?: string;
  photo?: Photograph;
}

const GEAR_FRAMES: MarqueeFrame[] = [
  {
    id: 'gear-camera',
    src: '/assets/gear/sony_a1.jpg',
    label: 'Field Body',
    caption: 'Silent Electronic Shutter System',
  },
  {
    id: 'gear-telephoto',
    src: '/assets/gear/telephoto_lens.jpg',
    label: 'Super-Telephoto',
    caption: 'Long-Range Wildlife Optics',
  },
  {
    id: 'gear-gimbal',
    src: '/assets/gear/tripod_gimbal.jpg',
    label: 'Stability Rig',
    caption: 'Carbon Tripod & Fluid Gimbal',
  },
  {
    id: 'gear-aerial',
    src: '/assets/gear/aerial_drone.jpg',
    label: 'Habitat Mapping',
    caption: 'Wetland & Mangrove Perspective',
  },
];

export const AboutFieldMarquee: React.FC<{ photographs: Photograph[] }> = ({ photographs }) => {
  const { openPhotoModal } = useLightbox();

  // Interleave camera/gear kit images and wildlife plates into structured 3-frame (col/row) clusters
  const clusters = useMemo(() => {
    const publishedPhotos = photographs.filter((p) => p.isPublished && p.image);
    const mixed: MarqueeFrame[] = [];
    const maxLen = Math.max(GEAR_FRAMES.length, publishedPhotos.length);

    for (let i = 0; i < maxLen; i++) {
      const p = publishedPhotos[i % publishedPhotos.length];
      if (p) {
        mixed.push({
          id: `photo-${p.id}-${i}`,
          src: p.image,
          label: 'Wildlife Plate',
          caption: p.title,
          photo: p,
        });
      }
      const g = GEAR_FRAMES[i % GEAR_FRAMES.length];
      if (g) {
        mixed.push({
          ...g,
          id: `${g.id}-${i}`,
        });
      }
    }

    // Pad slightly so total slides divide nicely into groups of 3 (2-col, 2-row visual rhythm)
    while (mixed.length > 0 && mixed.length % 3 !== 0) {
      mixed.push({ ...mixed[mixed.length % mixed.length], id: `pad-${mixed.length}` });
    }

    const grouped: Array<[MarqueeFrame, MarqueeFrame, MarqueeFrame]> = [];
    for (let i = 0; i + 2 < mixed.length; i += 3) {
      grouped.push([mixed[i], mixed[i + 1], mixed[i + 2]]);
    }
    return grouped;
  }, [photographs]);

  if (clusters.length === 0) return null;

  const renderTile = (frame: MarqueeFrame, ratioClass: string, sizes: string) => {
    return (
      <div
        key={frame.id}
        onClick={() => {
          if (frame.photo) openPhotoModal(frame.photo, photographs);
        }}
        className={`group relative overflow-hidden rounded-xl border border-border bg-muted ${ratioClass} ${
          frame.photo ? 'cursor-pointer' : ''
        }`}
      >
        <PortfolioImage
          src={frame.src}
          alt={frame.caption || frame.label}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/70 font-medium">
            {frame.label}
          </span>
          {frame.caption && (
            <p className="text-sm font-serif font-medium text-white leading-snug line-clamp-1">
              {frame.caption}
            </p>
          )}
        </div>
      </div>
    );
  };

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
          Cameras, optics, and natural-light encounters from years across Bangladesh&apos;s wetlands and forests.
        </p>
      </div>

      <Marquee speed={32} pauseOnHover gradient={false} autoFill className="py-2">
        <div className="flex items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5">
          {clusters.map(([tall, topWide, bottomWide], idx) => (
            <div
              key={`cluster-${idx}`}
              className="grid grid-cols-12 gap-4 sm:gap-5 w-[440px] sm:w-[560px] lg:w-[640px] shrink-0"
            >
              {/* Left Tall Column */}
              <div className="col-span-5">
                {renderTile(tall, 'h-full min-h-[290px] sm:min-h-[340px]', '280px')}
              </div>

              {/* Right 2-Row Stack */}
              <div className="col-span-7 grid grid-rows-2 gap-4 sm:gap-5">
                {renderTile(topWide, 'aspect-[16/10] w-full', '360px')}
                {renderTile(bottomWide, 'aspect-[16/10] w-full', '360px')}
              </div>
            </div>
          ))}
        </div>
      </Marquee>
    </section>
  );
};
