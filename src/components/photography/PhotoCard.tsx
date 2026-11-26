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
  className?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, allPhotos, className = '' }) => {
  const { openPhotoModal } = useLightbox();
  const targetHref = `/gallery/${encodeURIComponent(photo.id)}`;
  const categoryLabel = getWildlifeCategoryLabel(photo.category);

  return (
    <article
      className={`group relative rounded-xl overflow-hidden bg-card border border-border shadow-xs hover:shadow-xl transition-all duration-300 ${className}`}
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
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <PortfolioImage
            src={photo.image}
            alt={photo.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/95 border border-white/20">
                <Expand className="w-3 h-3" />
                Fullscreen
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold tracking-tight text-white leading-snug drop-shadow-sm line-clamp-1">
                {photo.title}
              </h3>
              <p className="text-xs text-white/80 font-medium">{categoryLabel}</p>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};
