'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ExternalLink, X } from 'lucide-react';
import type { VideoItem } from '../../types/portfolio';
import { parseVideoUrl } from '../../lib/videoEmbed';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const parsed = video ? parseVideoUrl(video.videoUrl) : null;
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!video) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (backdropRef.current && dialogRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
      );
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [video, onClose]);

  if (!video || !parsed) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-obsidian/92 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${video.title}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-4xl rounded-xl bg-obsidian text-white border border-white/15 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 sm:px-7 py-4 border-b border-white/12 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">
              {parsed.platformLabel}
            </p>
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-white truncate mt-0.5">
              {video.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/25 px-4 py-1.5 text-xs font-medium text-white hover:bg-card hover:text-obsidian transition-colors cursor-pointer"
            aria-label="Close video modal"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        <div className="bg-black flex items-center justify-center overflow-hidden">
          {parsed.canEmbed && parsed.embedUrl ? (
            <div
              className={
                parsed.embedAspect === '9:16'
                  ? 'w-full max-w-[360px] aspect-[9/16] max-h-[60vh]'
                  : 'w-full aspect-video max-h-[62vh]'
              }
            >
              <iframe
                src={parsed.embedUrl}
                title={video.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="p-10 text-center space-y-4 max-w-lg">
              <p className="text-sm text-white/80 leading-relaxed">
                {parsed.limitationNote ||
                  'This platform link opens directly on the source platform for playback.'}
              </p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-card text-obsidian px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                {parsed.fallbackLabel}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 py-5 border-t border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            {video.description && (
              <p className="text-sm text-white/75 leading-relaxed">{video.description}</p>
            )}
            {parsed.limitationNote && parsed.canEmbed && (
              <p className="text-xs text-white/50">{parsed.limitationNote}</p>
            )}
          </div>

          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-card hover:text-obsidian transition-colors self-start sm:self-center"
          >
            {parsed.fallbackLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
