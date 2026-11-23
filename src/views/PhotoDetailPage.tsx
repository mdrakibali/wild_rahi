'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, ArrowUpRight, Camera, ChevronLeft, ChevronRight, MapPin, Share2 } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatExifMetadata } from '@/lib/validation';
import { Button } from '@/components/ui/Button';

interface PhotoDetailPageProps {
  slug: string;
}

export const PhotoDetailPage: React.FC<PhotoDetailPageProps> = ({ slug }) => {
  const { photographs, collections, profile } = usePortfolio();
  const [copied, setCopied] = useState(false);

  const currentIndex = useMemo(() => {
    return photographs.findIndex((p) => (p.slug || p.id) === slug || p.id === slug);
  }, [photographs, slug]);

  const photo = useMemo(() => {
    if (currentIndex !== -1) return photographs[currentIndex];
    return photographs[0];
  }, [photographs, currentIndex]);

  const category = useMemo(() => {
    if (!photo) return null;
    return collections.find((c) => c.id === photo.collectionId);
  }, [collections, photo]);

  const prevPhoto = useMemo(() => {
    if (currentIndex > 0) return photographs[currentIndex - 1];
    return null;
  }, [photographs, currentIndex]);

  const nextPhoto = useMemo(() => {
    if (currentIndex !== -1 && currentIndex < photographs.length - 1) {
      return photographs[currentIndex + 1];
    }
    return null;
  }, [photographs, currentIndex]);

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
        <h1 className="text-2xl font-serif font-bold">Plate Not Found</h1>
        <p className="text-sm text-muted-foreground">The requested photograph plate could not be found.</p>
        <Link to="/gallery">
          <Button variant="primary">Return to Gallery</Button>
        </Link>
      </div>
    );
  }

  const exif = formatExifMetadata(photo);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 flex flex-col justify-between">
      {/* Top Navigation & Action Bar */}
      <div className="site-container py-4 flex items-center justify-between gap-4 border-b border-white/10">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wildlife Gallery
        </Link>

        <div className="flex items-center gap-3">
          {currentIndex !== -1 && (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80">
              {currentIndex + 1} / {photographs.length}
            </span>
          )}

          {copied ? (
            <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              Link copied!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Copy link"
              aria-label="Share Plate"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Showcase Stage with Center Image & Side Arrows */}
      <div className="relative site-container py-6 sm:py-8 flex-1 flex items-center justify-center min-h-[50vh] lg:min-h-[62vh]">
        {/* Previous Photo Arrow */}
        {prevPhoto && (
          <Link
            to={`/gallery/${encodeURIComponent(prevPhoto.slug || prevPhoto.id)}`}
            className="absolute left-2 sm:left-6 z-20 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
            aria-label="Previous plate"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        )}

        {/* Centered High-Resolution Image */}
        <div className="relative max-w-full max-h-[68vh] flex items-center justify-center">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
          />
        </div>

        {/* Next Photo Arrow */}
        {nextPhoto && (
          <Link
            to={`/gallery/${encodeURIComponent(nextPhoto.slug || nextPhoto.id)}`}
            className="absolute right-2 sm:right-6 z-20 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
            aria-label="Next plate"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        )}
      </div>

      {/* Bottom Area: Bottom-Left Details + Thumbnail Filmstrip */}
      <div className="site-container space-y-6 pt-4 border-t border-white/10">
        {/* Bottom-Left Details Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 text-left max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold">
                {photo.year || 'Field Archive'}
              </span>
              {category && (
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  {category.title}
                </span>
              )}
              {photo.speciesName && (
                <>
                  <span className="text-white/40">&middot;</span>
                  <span className="text-xs text-white/80 font-medium">{photo.speciesName}</span>
                </>
              )}
              {photo.locationName && (
                <>
                  <span className="text-white/40">&middot;</span>
                  <span className="inline-flex items-center gap-1 text-xs text-white/70">
                    <MapPin className="w-3 h-3 text-white/60" />
                    {photo.locationName}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
              {photo.title}
            </h1>

            {photo.caption && (
              <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">
                &ldquo;{photo.caption}&rdquo;
              </p>
            )}

            {(photo.camera || photo.lens || exif) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-white/60">
                <Camera className="w-3.5 h-3.5 text-primary shrink-0" />
                {photo.camera && <span>{photo.camera}</span>}
                {photo.lens && (
                  <>
                    <span>&middot;</span>
                    <span>{photo.lens}</span>
                  </>
                )}
                {exif && (
                  <>
                    <span>&middot;</span>
                    <span className="text-white/85">{exif}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/contact">
              <Button
                variant="primary"
                icon={<ArrowUpRight className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                Enquire Archival Print
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Thumbnails Preview Filmstrip */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">
            Archive Filmstrip Preview
          </p>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {photographs.map((p, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <Link
                  key={p.id}
                  to={`/gallery/${encodeURIComponent(p.slug || p.id)}`}
                  className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-primary border-2 border-primary scale-105 opacity-100 z-10'
                      : 'opacity-50 hover:opacity-90 border border-white/20'
                  }`}
                  title={p.title}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover rounded-md"
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
