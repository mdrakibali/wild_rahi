'use client';

import React from 'react';
import { Expand } from 'lucide-react';
import type { Photograph } from '@/types/portfolio';
import { getWildlifeCategoryLabel } from '@/lib/validation';
import { useLightbox } from '@/context/LightboxContext';
import { PortfolioImage } from '@/components/common/PortfolioImage';

interface PhotoCardProps {
  photo: Photograph;
  allPhotos?: Photograph[];
  aspectClass?: string;
  sizes?: string;
  className?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  allPhotos,
  aspectClass = 'aspect-[16/10]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
}) => {
  const { openPhotoModal } = useLightbox();
  const targetHref = `/gallery/${encodeURIComponent(photo.id)}`;
  const categoryLabel = getWildlifeCategoryLabel(photo.category);

  return (
    <article
      className={`group relative rounded-lg overflow-hidden bg-card border border-border shadow-xs hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <a
        href={targetHref}
        onClick={(e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            openPhotoModal(photo, allPhotos);
          }
        }}
        className="block w-full text-left focus:outline-none cursor-pointer relative"
        aria-label={`Inspect ${photo.title} in lightbox`}
      >
        <div className={`relative w-full overflow-hidden bg-muted ${aspectClass}`}>
          <PortfolioImage
            src={photo.image}
            alt={photo.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5 sm:p-4 lg:p-5 text-white">
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white/95 border border-white/15">
                <Expand className="w-3 h-3" />
                <span className="hidden sm:inline">Fullscreen</span>
              </span>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <h3 className="text-xs sm:text-base font-serif font-bold tracking-tight text-white leading-snug drop-shadow-sm line-clamp-1">
                {photo.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-white/80 font-medium line-clamp-1">{categoryLabel}</p>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};
