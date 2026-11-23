import React from 'react';
import { Expand } from 'lucide-react';
import type { Photograph } from '../../types/portfolio';
import { formatExifMetadata, getAspectRatioClass } from '../../lib/validation';

interface PhotoCardProps {
  photo: Photograph;
  onInspect: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onInspect }) => {
  return (
    <article className="break-inside-avoid group bg-card border border-border rounded-md p-3 sm:p-4 mb-6">
      <button
        type="button"
        onClick={onInspect}
        className="block w-full text-left focus:outline-none cursor-pointer"
        aria-label={`Inspect ${photo.title} in lightbox`}
      >
        <div
          className={`relative rounded-md overflow-hidden bg-muted ${getAspectRatioClass(
            photo.aspectRatio
          )}`}
        >
          <img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            className="w-full h-full object-cover rounded-md"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-obsidian/85 backdrop-blur-xs text-white px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-3.5 h-3.5" />
            Inspect
          </span>
        </div>

        <div className="pt-3.5 space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-serif font-bold tracking-tight text-foreground">
              {photo.title}
            </h3>
            <span className="text-xs font-mono text-muted-foreground shrink-0">{photo.year}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {photo.speciesName} &middot; {photo.locationName}
          </p>
          {formatExifMetadata(photo) && (
            <p className="text-[11px] font-mono text-muted-foreground/80 pt-0.5">
              {formatExifMetadata(photo)}
            </p>
          )}
        </div>
      </button>
    </article>
  );
};
