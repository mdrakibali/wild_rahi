'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Grid, X } from 'lucide-react';
import type { Photograph } from '../../types/portfolio';
import { formatExifMetadata } from '../../lib/validation';

interface LightboxProps {
  photographs: Photograph[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photographs,
  activeIndex,
  onClose,
  onChangeIndex,
}) => {
  const [showThumbnails, setShowThumbnails] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < photographs.length;
  const activePhoto = isOpen ? photographs[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && photographs.length > 1 && activeIndex !== null) {
        onChangeIndex((activeIndex + 1) % photographs.length);
      } else if (e.key === 'ArrowLeft' && photographs.length > 1 && activeIndex !== null) {
        onChangeIndex((activeIndex - 1 + photographs.length) % photographs.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, photographs.length, onClose, onChangeIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex === null || photographs.length < 2) return;
    onChangeIndex((activeIndex - 1 + photographs.length) % photographs.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex === null || photographs.length < 2) return;
    onChangeIndex((activeIndex + 1) % photographs.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) && photographs.length > 1) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && activePhoto && activeIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 bg-obsidian/95 text-white flex flex-col select-none"
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph viewer: ${activePhoto.title}`}
          onClick={onClose}
        >
          {/* Top Bar */}
          <div
            className="shrink-0 px-4 sm:px-8 h-16 flex items-center justify-between border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm text-white/70">
              <span className="font-mono text-white">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(photographs.length).padStart(2, '0')}
              </span>
              <span aria-hidden="true">&middot;</span>
              <span className="truncate max-w-[180px] sm:max-w-md text-white/90 font-medium">
                {activePhoto.title}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {photographs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowThumbnails((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    showThumbnails
                      ? 'border-white/40 bg-card/15 text-white'
                      : 'border-white/20 text-white/75 hover:text-white'
                  }`}
                  aria-pressed={showThumbnails}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filmstrip</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-card hover:text-obsidian transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div
            className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-16 py-4 sm:py-6"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {photographs.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-obsidian/70 text-white hover:bg-card hover:text-obsidian transition-colors absolute left-5 z-10"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <motion.img
              key={activePhoto.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain shadow-none"
            />

            {photographs.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-obsidian/70 text-white hover:bg-card hover:text-obsidian transition-colors absolute right-5 z-10"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Clean Metadata Strip Below Image */}
          <div
            className="shrink-0 border-t border-white/10 bg-obsidian px-4 sm:px-8 py-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-base sm:text-lg font-medium text-white">
                    {activePhoto.title}
                  </h3>
                  <span className="text-xs sm:text-sm text-white/70">
                    {activePhoto.speciesName} &middot; {activePhoto.locationName} &middot;{' '}
                    {activePhoto.year}
                  </span>
                </div>
                {activePhoto.caption && (
                  <p className="text-xs sm:text-sm text-white/65 max-w-3xl leading-relaxed">
                    {activePhoto.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4">
                {formatExifMetadata(activePhoto) && (
                  <p className="text-[11px] font-mono text-white/55">
                    {formatExifMetadata(activePhoto)}
                  </p>
                )}

                {photographs.length > 1 && (
                  <div className="flex sm:hidden items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/25 text-white"
                      aria-label="Previous photograph"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/25 text-white"
                      aria-label="Next photograph"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Toggleable Thumbnail Strip */}
            {showThumbnails && photographs.length > 1 && (
              <div className="max-w-[1280px] mx-auto pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {photographs.map((item, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChangeIndex(idx)}
                      className={`shrink-0 w-16 h-11 overflow-hidden border transition-opacity ${
                        selected
                          ? 'border-white opacity-100'
                          : 'border-transparent opacity-45 hover:opacity-80'
                      }`}
                      aria-label={`View ${item.title}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
