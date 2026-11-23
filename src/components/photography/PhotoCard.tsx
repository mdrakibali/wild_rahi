'use client';

import React from 'react';
import { Expand } from 'lucide-react';
import type { Photograph } from '../../types/portfolio';
import { formatExifMetadata } from '../../lib/validation';
import { usePortfolio } from '../../context/PortfolioContext';

interface PhotoCardProps {
  photo: Photograph;
  onInspect?: () => void;
  className?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onInspect, className = '' }) => {
  const { openPhotoModal } = usePortfolio();
  const exif = formatExifMetadata(photo);
  const targetHref = `/gallery/${encodeURIComponent(photo.slug || photo.id)}`;

  return (
    <div
      className={`group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer block w-full h-full bg-muted shadow-xs hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <a
        href={targetHref}
        onClick={(e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            if (onInspect) onInspect();
            openPhotoModal(photo);
          }
        }}
        className="block w-full h-full text-left focus:outline-none cursor-pointer relative"
        aria-label={`Inspect ${photo.title} in lightbox`}
      >
        {/* Photo Image Frame filling entire grid cell */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted w-full h-full">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Hover Overlay - Clean Cinematic & Minimalist */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-5 text-white">
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90 border border-white/20">
                <Expand className="w-3 h-3" />
                Fullscreen
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base lg:text-lg font-serif font-bold tracking-tight text-white leading-snug drop-shadow-sm">
                {photo.title}
              </h3>
              <p className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                <span>{photo.speciesName || 'Wildlife'}</span>
                {photo.year && (
                  <>
                    <span>&middot;</span>
                    <span>{photo.year}</span>
                  </>
                )}
              </p>
              {exif && (
                <p className="text-[11px] font-mono text-white/70 pt-0.5 tracking-wide truncate">
                  {exif}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
