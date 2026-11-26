'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { getWildlifeCategoryLabel } from '@/lib/validation';
import { PortfolioImage } from '@/components/common/PortfolioImage';

export const PhotoModal: React.FC = () => {
  const { activeModalPhoto, photographs, closePhotoModal, navigateModalPhoto, openPhotoModal } =
    useLightbox();
  const [copied, setCopied] = useState(false);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  const displayList = useMemo(() => {
    const pub = photographs.filter((p) => p.isPublished);
    return pub.length > 0 ? pub : photographs;
  }, [photographs]);

  const activeIndex = useMemo(() => {
    if (!activeModalPhoto) return -1;
    return displayList.findIndex((p) => p.id === activeModalPhoto.id);
  }, [displayList, activeModalPhoto]);

  const isOpen = Boolean(activeModalPhoto);

  useEffect(() => {
    if (isOpen && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeModalPhoto && imgWrapRef.current) {
      gsap.fromTo(
        imgWrapRef.current,
        { scale: 0.98, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [activeModalPhoto?.id]);

  useEffect(() => {
    if (activeIndex !== -1 && filmstripRef.current) {
      const activeThumb = filmstripRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

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

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl select-none"
      onClick={closePhotoModal}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph lightbox: ${activeModalPhoto.title}`}
    >
      {/* Top Header Bar */}
      <div
        className="relative z-50 flex items-center justify-between p-4 sm:px-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {activeIndex !== -1 && (
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
              {activeIndex + 1} / {displayList.length}
            </span>
          )}
          <span className="hidden sm:inline-block text-xs font-medium text-white/60">
            Press Esc or click outside to close
          </span>
        </div>

        <div className="flex items-center gap-3">
          {copied ? (
            <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
              Link copied!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Copy shareable link"
              aria-label="Share Photo"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={closePhotoModal}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
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
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => navigateModalPhoto(-1)}
            className="absolute left-3 sm:left-6 z-40 p-3 sm:p-3.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        <div
          ref={imgWrapRef}
          key={activeModalPhoto.id}
          className="relative w-full max-w-[90vw] h-[60vh] sm:h-[68vh] flex items-center justify-center"
        >
          <PortfolioImage
            src={activeModalPhoto.image}
            alt={activeModalPhoto.title}
            fill
            sizes="90vw"
            priority
            className="object-contain rounded-xl"
          />
        </div>

        {activeIndex !== -1 && activeIndex < displayList.length - 1 && (
          <button
            type="button"
            onClick={() => navigateModalPhoto(1)}
            className="absolute right-3 sm:right-6 z-40 p-3 sm:p-3.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {/* Bottom Area: Info Block + Horizontal Thumbnail Filmstrip */}
      <div
        className="relative z-50 flex flex-col gap-3 px-4 sm:px-8 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
          <div className="space-y-1.5 text-white text-left">
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-xl bg-white/15 text-white font-semibold">
              {getWildlifeCategoryLabel(activeModalPhoto.category)}
            </span>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug">
              {activeModalPhoto.title}
            </h2>

            {activeModalPhoto.description && (
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic max-w-2xl line-clamp-2">
                &ldquo;{activeModalPhoto.description}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Bottom Filmstrip of Thumbnails */}
        <div className="pt-2 border-t border-white/10">
          <div
            ref={filmstripRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {displayList.map((p, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openPhotoModal(p)}
                  className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-white border-2 border-white scale-105 opacity-100 z-10'
                      : 'opacity-50 hover:opacity-90 border border-white/20'
                  }`}
                  title={p.title}
                  aria-label={`View ${p.title}`}
                >
                  <PortfolioImage
                    src={p.thumbnailUrl || p.image}
                    alt={p.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
