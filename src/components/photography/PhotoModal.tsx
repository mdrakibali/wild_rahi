'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, ChevronLeft, ChevronRight, MapPin, Share2, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatExifMetadata } from '@/lib/validation';

export const PhotoModal: React.FC = () => {
  const { activeModalPhoto, photographs, closePhotoModal, navigateModalPhoto, openPhotoModal } =
    usePortfolio();
  const [copied, setCopied] = useState(false);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Active photo index in archive
  const activeIndex = useMemo(() => {
    if (!activeModalPhoto) return -1;
    return photographs.findIndex((p) => p.id === activeModalPhoto.id);
  }, [photographs, activeModalPhoto]);

  // Scroll active thumbnail into view in the bottom filmstrip
  useEffect(() => {
    if (activeIndex !== -1 && filmstripRef.current) {
      const activeThumb = filmstripRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation: Escape to close, Left/Right arrows
  useEffect(() => {
    if (!activeModalPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') navigateModalPhoto(-1);
      if (e.key === 'ArrowRight') navigateModalPhoto(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalPhoto, closePhotoModal, navigateModalPhoto]);

  // Lock background body scroll when open
  useEffect(() => {
    if (activeModalPhoto) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [activeModalPhoto]);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeModalPhoto) return null;

  const exif = formatExifMetadata(activeModalPhoto);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl select-none"
        onClick={closePhotoModal}
      >
        {/* Top Header Bar */}
        <div
          className="relative z-50 flex items-center justify-between p-4 sm:px-8 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            {activeIndex !== -1 && (
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
                {activeIndex + 1} / {photographs.length}
              </span>
            )}
            <span className="hidden sm:inline-block text-xs font-medium text-white/60">
              Press Esc or click outside to close
            </span>
          </div>

          <div className="flex items-center gap-3">
            {copied ? (
              <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                Link copied!
              </span>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
                title="Copy shareable plate link"
                aria-label="Share Photo"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closePhotoModal}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Stage: Image and Left/Right Navigation */}
        <div
          className="relative flex-1 flex items-center justify-center p-2 sm:p-6 min-h-0 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Previous Arrow Button */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => navigateModalPhoto(-1)}
              className="absolute left-3 sm:left-6 z-40 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Centered High-Res Photograph */}
          <motion.div
            key={activeModalPhoto.id}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center max-w-[90vw] max-h-[64vh] sm:max-h-[68vh]"
          >
            <img
              src={activeModalPhoto.imageUrl}
              alt={activeModalPhoto.title}
              className="max-h-[64vh] sm:max-h-[68vh] w-auto max-w-full object-contain rounded-md shadow-2xl border border-white/10"
            />
          </motion.div>

          {/* Next Arrow Button */}
          {activeIndex < photographs.length - 1 && (
            <button
              type="button"
              onClick={() => navigateModalPhoto(1)}
              className="absolute right-3 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Bottom Area: Left Info Box + Horizontal Thumbnail Filmstrip */}
        <div
          className="relative z-50 flex flex-col gap-3 px-4 sm:px-8 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottom-Left Details Block */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
            <div className="space-y-1.5 text-white text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold">
                  {activeModalPhoto.year || 'Field Archive'}
                </span>
                <span className="text-xs text-white/70 font-medium">
                  {activeModalPhoto.speciesName || 'Wildlife'}
                </span>
                {activeModalPhoto.locationName && (
                  <>
                    <span className="text-white/40">&middot;</span>
                    <span className="inline-flex items-center gap-0.5 text-xs text-white/70">
                      <MapPin className="w-3 h-3 text-white/60" />
                      {activeModalPhoto.locationName}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug">
                {activeModalPhoto.title}
              </h2>

              {activeModalPhoto.caption && (
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic max-w-2xl line-clamp-2">
                  &ldquo;{activeModalPhoto.caption}&rdquo;
                </p>
              )}

              {(activeModalPhoto.camera || activeModalPhoto.lens || exif) && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono text-white/60">
                  <Camera className="w-3.5 h-3.5 text-primary shrink-0" />
                  {activeModalPhoto.camera && <span>{activeModalPhoto.camera}</span>}
                  {activeModalPhoto.lens && (
                    <>
                      <span>&middot;</span>
                      <span>{activeModalPhoto.lens}</span>
                    </>
                  )}
                  {exif && (
                    <>
                      <span>&middot;</span>
                      <span className="text-white/80">{exif}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Filmstrip of Thumbnails (Small previews of previous & next images) */}
          <div className="pt-2 border-t border-white/10">
            <div
              ref={filmstripRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
            >
              {photographs.map((p, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openPhotoModal(p)}
                    className={`relative shrink-0 w-14 h-11 sm:w-16 sm:h-12 rounded-md overflow-hidden transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-primary border-2 border-primary scale-105 opacity-100 z-10'
                        : 'opacity-50 hover:opacity-90 border border-white/20'
                    }`}
                    title={p.title}
                    aria-label={`View ${p.title}`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
