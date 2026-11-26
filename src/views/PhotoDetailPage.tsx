'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { getWildlifeCategoryLabel } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import type { Photograph } from '@/types/portfolio';

interface PhotoDetailPageProps {
  slug: string;
  photographs: Photograph[];
}

export const PhotoDetailPage: React.FC<PhotoDetailPageProps> = ({ slug, photographs }) => {
  const [copied, setCopied] = useState(false);

  const publishedPhotos = useMemo(() => {
    const pub = photographs.filter((p) => p.isPublished);
    return pub.length > 0 ? pub : photographs;
  }, [photographs]);

  const currentIndex = useMemo(() => {
    return publishedPhotos.findIndex((p) => p.id === slug);
  }, [publishedPhotos, slug]);

  const photo = useMemo(() => {
    if (currentIndex !== -1) return publishedPhotos[currentIndex];
    return publishedPhotos[0];
  }, [publishedPhotos, currentIndex]);

  const prevPhoto = currentIndex > 0 ? publishedPhotos[currentIndex - 1] : null;
  const nextPhoto =
    currentIndex !== -1 && currentIndex < publishedPhotos.length - 1
      ? publishedPhotos[currentIndex + 1]
      : null;

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!photo) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-20 site-container text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold">Photograph Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested photograph could not be found.
        </p>
        <Link href="/gallery">
          <Button variant="primary">Return to Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 flex flex-col justify-between">
      {/* Top Navigation & Action Bar */}
      <div className="site-container py-4 flex items-center justify-between gap-4 border-b border-white/10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <div className="flex items-center gap-3">
          {currentIndex !== -1 && (
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white/80">
              {currentIndex + 1} / {publishedPhotos.length}
            </span>
          )}

          {copied ? (
            <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
              Link copied!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Copy link"
              aria-label="Share Photograph"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="relative site-container py-6 sm:py-8 flex-1 flex items-center justify-center min-h-[50vh] lg:min-h-[62vh]">
        {prevPhoto && (
          <Link
            href={`/gallery/${encodeURIComponent(prevPhoto.id)}`}
            className="absolute left-2 sm:left-6 z-20 p-3 sm:p-3.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        )}

        <div className="relative w-full max-w-5xl h-[55vh] sm:h-[66vh] flex items-center justify-center">
          <PortfolioImage
            src={photo.image}
            alt={photo.title}
            fill
            sizes="90vw"
            priority
            className="object-contain rounded-xl"
          />
        </div>

        {nextPhoto && (
          <Link
            href={`/gallery/${encodeURIComponent(nextPhoto.id)}`}
            className="absolute right-2 sm:right-6 z-20 p-3 sm:p-3.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
            aria-label="Next photograph"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        )}
      </div>

      {/* Bottom Area: Details + Thumbnail Filmstrip */}
      <div className="site-container space-y-6 pt-4 border-t border-white/10">
        <div className="space-y-2 text-left max-w-3xl">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-xl bg-white/15 text-white font-semibold">
            {getWildlifeCategoryLabel(photo.category)}
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            {photo.title}
          </h1>

          {photo.description && (
            <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">
              &ldquo;{photo.description}&rdquo;
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {publishedPhotos.map((p, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <Link
                  key={p.id}
                  href={`/gallery/${encodeURIComponent(p.id)}`}
                  className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-white border-2 border-white scale-105 opacity-100 z-10'
                      : 'opacity-50 hover:opacity-90 border border-white/20'
                  }`}
                  title={p.title}
                >
                  <PortfolioImage
                    src={p.thumbnailUrl || p.image}
                    alt={p.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
