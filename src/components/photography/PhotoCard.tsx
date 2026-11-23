import React from 'react';
import { Expand, MapPin } from 'lucide-react';
import type { Photograph } from '../../types/portfolio';
import { formatExifMetadata, getAspectRatioClass } from '../../lib/validation';

interface PhotoCardProps {
  photo: Photograph;
  onInspect: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onInspect }) => {
  const exif = formatExifMetadata(photo);

  return (
    <div className="break-inside-avoid group relative mb-4 sm:mb-6 overflow-hidden rounded-md cursor-pointer block w-full bg-secondary">
      <button
        type="button"
        onClick={onInspect}
        className="block w-full text-left focus:outline-none cursor-pointer relative"
        aria-label={`Inspect ${photo.title} in lightbox`}
      >
        {/* Photo Image Frame */}
        <div
          className={`relative rounded-md overflow-hidden bg-muted w-full ${getAspectRatioClass(
            photo.aspectRatio
          )}`}
        >
          <img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Desktop Hover Overlay - Cinematic & Minimalist */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-5 text-white">
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90 border border-white/20">
                <Expand className="w-3 h-3" />
                Fullscreen
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif font-bold tracking-tight text-white leading-snug">
                {photo.title}
              </h3>
              <p className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                <span>{photo.speciesName}</span>
                {photo.locationName && (
                  <>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-white/70" />
                      {photo.locationName}
                    </span>
                  </>
                )}
                {photo.year && (
                  <>
                    <span>&middot;</span>
                    <span>{photo.year}</span>
                  </>
                )}
              </p>
              {exif && (
                <p className="text-[11px] font-mono text-white/70 pt-0.5 tracking-wide">
                  {exif}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Mobile Caption below image */}
        <div className="sm:hidden pt-2.5 pb-1 px-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-serif font-semibold text-foreground truncate">
              {photo.title}
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">{photo.year}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {photo.speciesName} &middot; {photo.locationName}
          </p>
        </div>
      </button>
    </div>
  );
};
