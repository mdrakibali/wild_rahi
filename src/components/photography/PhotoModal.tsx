'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Camera, ChevronLeft, ChevronRight, Expand, MapPin, Share2, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatExifMetadata } from '@/lib/validation';

interface PhotoModalProps {
  slug: string;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ slug }) => {
  const router = useRouter();
  const { photographs } = usePortfolio();
  const [copied, setCopied] = useState(false);

  // Find active photo index
  const activeIndex = useMemo(() => {
    return photographs.findIndex((p) => (p.slug || p.id) === slug || p.id === slug);
  }, [photographs, slug]);

  const photo = photographs[activeIndex] || photographs[0];

  const handleClose = () => {
    router.back();
  };

  const handleNavigate = (nextIdx: number) => {
    if (nextIdx >= 0 && nextIdx < photographs.length) {
      const nextPhoto = photographs[nextIdx];
      router.replace(`/photography/${encodeURIComponent(nextPhoto.slug || nextPhoto.id)}`, {
        scroll: false,
      });
    }
  };

  // Keyboard navigation: Escape to close, Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft' && activeIndex > 0) handleNavigate(activeIndex - 1);
      if (e.key === 'ArrowRight' && activeIndex < photographs.length - 1) handleNavigate(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, photographs.length]);

  // Lock background body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!photo) return null;

  const exif = formatExifMetadata(photo);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-6"
        onClick={handleClose}
      >
        {/* Top Floating Controls */}
        <div
          className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between text-white pointer-events-none"
        >
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
              {activeIndex + 1} / {photographs.length}
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-white/70">
              Press Esc or click outside to close
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Copy shareable link"
              aria-label="Share Photo"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate(activeIndex - 1);
            }}
            className="hidden sm:flex absolute left-4 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {activeIndex < photographs.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate(activeIndex + 1);
            }}
            className="hidden sm:flex absolute right-4 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main Content Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-6xl w-full max-h-[90vh] bg-card/95 border border-white/15 rounded-md overflow-hidden flex flex-col lg:flex-row shadow-2xl"
        >
          {/* High-Res Photo Frame */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] lg:min-h-[580px] overflow-hidden">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="max-h-[82vh] w-auto max-w-full object-contain select-none"
            />
          </div>

          {/* Details Sidebar / Drawer */}
          <div className="w-full lg:w-96 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[40vh] lg:max-h-[85vh] bg-card border-t lg:border-t-0 lg:border-l border-border space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
                  {photo.year || 'Field Archive'}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground leading-snug">
                  {photo.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span>{photo.speciesName || 'Wildlife'}</span>
                  {photo.locationName && (
                    <>
                      <span>&middot;</span>
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {photo.locationName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {photo.caption && (
                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic border-l-2 border-primary/40 pl-3">
                  &ldquo;{photo.caption}&rdquo;
                </p>
              )}

              {/* Camera & EXIF Specs */}
              <div className="bg-secondary/70 border border-border rounded-md p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-primary" /> Camera &amp; Optics Data
                </p>
                <div className="space-y-1.5 text-xs">
                  {photo.camera && (
                    <p className="text-foreground">
                      <span className="text-muted-foreground font-mono">Body:</span> {photo.camera}
                    </p>
                  )}
                  {photo.lens && (
                    <p className="text-foreground">
                      <span className="text-muted-foreground font-mono">Optics:</span> {photo.lens}
                    </p>
                  )}
                  {exif && (
                    <p className="font-mono text-[11px] text-muted-foreground pt-1">
                      {exif}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
              {copied ? (
                <span className="text-emerald-500 font-medium">Link copied to clipboard!</span>
              ) : (
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share direct plate link
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-border px-3.5 py-1.5 hover:bg-secondary font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
