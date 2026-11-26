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
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Gallery
        </Link>

        <div className="flex items-center gap-2">
          {currentIndex !== -1 && (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              {currentIndex + 1} / {publishedPhotos.length}
            </span>
          )}

          {copied ? (
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Link copied!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors cursor-pointer"
              title="Copy link"
              aria-label="Share Photograph"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="relative site-container py-6 sm:py-8 flex-1 flex items-center justify-center min-h-[50vh] lg:min-h-[62vh]">
        {prevPhoto && (
          <Link
            href={`/gallery/${encodeURIComponent(prevPhoto.id)}`}
            className="absolute left-2 sm:left-6 z-20 w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 backdrop-blur-md transition-colors"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}

        <div className="relative w-full max-w-5xl h-[55vh] sm:h-[66vh] flex items-center justify-center">
          <PortfolioImage
            src={photo.image}
            alt={photo.title}
            fill
            sizes="90vw"
            priority
            className="object-contain rounded-lg"
          />
        </div>

        {nextPhoto && (
          <Link
            href={`/gallery/${encodeURIComponent(nextPhoto.id)}`}
            className="absolute right-2 sm:right-6 z-20 w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 backdrop-blur-md transition-colors"
            aria-label="Next photograph"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Bottom Area: Details + Thumbnail Filmstrip */}
      <div className="site-container space-y-5 pt-4 border-t border-white/10">
        <div className="space-y-1.5 text-left max-w-3xl">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
            {getWildlifeCategoryLabel(photo.category)}
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
            {photo.title}
          </h1>

          {photo.description && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic">
              &ldquo;{photo.description}&rdquo;
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {publishedPhotos.map((p, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <Link
                  key={p.id}
                  href={`/gallery/${encodeURIComponent(p.id)}`}
                  className={`relative shrink-0 w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border border-emerald-400/75 ring-1 ring-emerald-400/35 opacity-100'
                      : 'border border-zinc-800 opacity-50 hover:opacity-85'
                  }`}
                  title={p.title}
                >
                  <PortfolioImage
                    src={p.thumbnailUrl || p.image}
                    alt={p.title}
                    fill
                    sizes="56px"
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
