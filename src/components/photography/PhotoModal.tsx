'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { getWildlifeCategoryLabel } from '@/lib/validation';
import { useScrollLock } from '@/lib/useScrollLock';
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
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeModalPhoto && imgWrapRef.current) {
      gsap.fromTo(
        imgWrapRef.current,
        { scale: 0.985, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }
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
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl select-none overscroll-none overflow-hidden"
      onClick={closePhotoModal}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph lightbox: ${activeModalPhoto.title}`}
    >
      {/* Top Header Bar */}
      <div
        className="relative z-50 flex items-center justify-between px-4 py-3 sm:px-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          {activeIndex !== -1 && (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-zinc-900/90 border border-zinc-700/70 text-zinc-200">
              {activeIndex + 1} / {displayList.length}
            </span>
          )}
          <span className="hidden sm:inline-block text-[11px] text-zinc-400">
            Press Esc or click outside to close
          </span>
        </div>

        <div className="flex items-center gap-2">
          {copied ? (
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Link copied!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 transition-colors cursor-pointer"
              title="Copy shareable link"
              aria-label="Share Photo"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={closePhotoModal}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 transition-colors cursor-pointer"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Stage: Image and Left/Right Navigation */}
      <div
        className="relative flex-1 flex items-center justify-center px-3 py-2 sm:px-14 min-h-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => navigateModalPhoto(-1)}
            className="absolute left-3 sm:left-5 z-40 w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={imgWrapRef}
          key={activeModalPhoto.id}
          className="relative w-full max-w-[88vw] h-[58vh] sm:h-[66vh] flex items-center justify-center"
        >
          <PortfolioImage
            src={activeModalPhoto.image}
            alt={activeModalPhoto.title}
            fill
            sizes="90vw"
            priority
            className="object-contain rounded-lg"
          />
        </div>

        {activeIndex !== -1 && activeIndex < displayList.length - 1 && (
          <button
            type="button"
            onClick={() => navigateModalPhoto(1)}
            className="absolute right-3 sm:right-5 z-40 w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Area: Info Block + Compact Horizontal Thumbnail Filmstrip */}
      <div
        className="relative z-50 flex flex-col gap-2.5 px-4 sm:px-6 pb-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 text-white text-left max-w-4xl">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-800/90 border border-zinc-700/70 text-zinc-300 font-medium">
            {getWildlifeCategoryLabel(activeModalPhoto.category)}
          </span>

          <h2 className="text-lg sm:text-xl font-serif font-semibold text-white tracking-tight leading-snug">
            {activeModalPhoto.title}
          </h2>

          {activeModalPhoto.description && (
            <p className="text-xs text-zinc-400 leading-relaxed italic max-w-2xl line-clamp-1 sm:line-clamp-2">
              &ldquo;{activeModalPhoto.description}&rdquo;
            </p>
          )}
        </div>

        {/* Bottom Filmstrip of Thumbnails */}
        <div className="pt-2 border-t border-white/10">
          <div
            ref={filmstripRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 overscroll-x-contain"
          >
            {displayList.map((p, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openPhotoModal(p)}
                  className={`relative shrink-0 w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border border-emerald-400/75 ring-1 ring-emerald-400/35 opacity-100'
                      : 'border border-zinc-800 opacity-50 hover:opacity-85'
                  }`}
                  title={p.title}
                  aria-label={`View ${p.title}`}
                >
                  <PortfolioImage
                    src={p.thumbnailUrl || p.image}
                    alt={p.title}
                    fill
                    sizes="56px"
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
