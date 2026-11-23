import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, Play } from 'lucide-react';
import { PLATFORM_LABELS } from '../../lib/videoEmbed';
import type { VideoItem } from '../../types/portfolio';

interface HomeVideosProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const HomeVideos: React.FC<HomeVideosProps> = ({ videos, onSelectVideo }) => {
  if (videos.length === 0) return null;

  return (
    <section className="bg-obsidian text-white py-20 lg:py-28 border-t border-white/10">
      <div className="site-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60 font-semibold">
              Field Motion &amp; Dispatches
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12]">
              Video Showcase
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Short wildlife dispatches and behind-the-lens behavior reels.
            </p>
          </div>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-obsidian transition-colors self-start md:self-auto"
          >
            All Field Videos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.slice(0, 4).map((vid) => (
            <article key={vid.id} className="group flex flex-col">
              <button
                type="button"
                onClick={() => onSelectVideo(vid)}
                className="text-left focus:outline-none flex-1 flex flex-col cursor-pointer"
                aria-label={`Play video: ${vid.title}`}
              >
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-surface-dark border border-white/10">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-obsidian/30 group-hover:bg-obsidian/10 transition-colors flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white text-obsidian transition-transform duration-300 group-hover:scale-105 shadow-md">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </span>
                  </div>
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-obsidian/85 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-mono tracking-wider">
                    {PLATFORM_LABELS[vid.platform]}
                  </span>
                </div>
                <div className="pt-3.5 space-y-1">
                  <p className="text-[11px] text-white/50 font-mono">
                    {vid.category}
                  </p>
                  <h3 className="text-base font-serif font-bold text-white leading-snug group-hover:text-white/80 transition-opacity line-clamp-1">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

