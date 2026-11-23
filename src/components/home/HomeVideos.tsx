'use client';

import React, { useRef } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { PLATFORM_LABELS } from '../../lib/videoEmbed';
import type { VideoItem } from '../../types/portfolio';

interface HomeVideosProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const HomeVideos: React.FC<HomeVideosProps> = ({ videos, onSelectVideo }) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  if (videos.length === 0) return null;

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-secondary text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Field Motion &amp; Dispatches
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12] text-foreground">
              Video Showcase
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Short wildlife dispatches and behind-the-lens behavior reels.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Carousel Navigation Buttons */}
            {videos.length > 2 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="w-9 h-9 rounded-md border border-border bg-card text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="w-9 h-9 rounded-md border border-border bg-card text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next video"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              to="/videos"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
            >
              All Videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Slider with White Cards & Black Text */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth"
        >
          {videos.map((vid) => (
            <article
              key={vid.id}
              className="shrink-0 w-[85vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[23.5vw] snap-start bg-card border border-border rounded-md overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => onSelectVideo(vid)}
                className="relative aspect-[16/10] w-full overflow-hidden bg-muted text-left focus:outline-none cursor-pointer"
                aria-label={`Play video: ${vid.title}`}
              >
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-obsidian/25 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-white text-obsidian">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </span>
                </div>
                <span className="absolute top-2.5 left-2.5 rounded-md bg-obsidian/85 backdrop-blur-xs text-white px-2.5 py-0.5 text-[10px] font-mono tracking-wider">
                  {PLATFORM_LABELS[vid.platform]}
                </span>
              </button>

              <div className="p-5 flex-1 flex flex-col justify-between gap-3 text-foreground">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {vid.category}
                  </p>
                  <h3 className="text-base font-serif font-bold text-foreground leading-snug line-clamp-2">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
