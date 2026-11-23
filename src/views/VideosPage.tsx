'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoModal } from '../components/videos/VideoModal';
import { PLATFORM_LABELS, parseVideoUrl, type VideoPlatform } from '../lib/videoEmbed';
import { ALLOWED_VIDEO_CATEGORIES } from '../lib/validation';
import type { VideoItem } from '../types/portfolio';
import { Select } from '../components/ui/Select';

const PLATFORM_FILTERS: Array<{ id: 'all' | VideoPlatform; label: string }> = [
  { id: 'all', label: 'All Platforms' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
];

export const VideosPage: React.FC = () => {
  const { videos } = usePortfolio();
  const [platformFilter, setPlatformFilter] = useState<'all' | VideoPlatform>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    document.title = 'Video Showcase — Wild Rahi';
  }, []);

  const publishedVideos = useMemo(
    () => videos.filter((v) => v.published).sort((a, b) => a.sortOrder - b.sortOrder),
    [videos]
  );

  const filteredVideos = useMemo(() => {
    return publishedVideos.filter((v) => {
      if (platformFilter !== 'all' && v.platform !== platformFilter) return false;
      if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
      return true;
    });
  }, [publishedVideos, platformFilter, categoryFilter]);

  return (
    <div className="bg-card text-foreground pt-20">
      {/* Header */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Motion Field Archive
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08]">
            Video Showcase
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Wildlife moments, avian flight studies, mangrove dispatches, and behind-the-lens reels
            published across YouTube, Facebook, Instagram, and TikTok.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {PLATFORM_FILTERS.map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => setPlatformFilter(pf.id)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    platformFilter === pf.id
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-52">
                <Select
                  aria-label="Filter by video category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {ALLOWED_VIDEO_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20">
        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center bg-secondary border border-border p-8 space-y-4">
            <h2 className="text-2xl font-semibold">No videos match these filters</h2>
            <button
              type="button"
              onClick={() => {
                setPlatformFilter('all');
                setCategoryFilter('all');
              }}
              className="inline-flex items-center rounded-full bg-primary text-white px-6 py-2.5 text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((vid) => {
              const parsed = parseVideoUrl(vid.videoUrl);
              return (
                <article
                  key={vid.id}
                  className="group bg-card border border-border hover:border-primary/40 transition-colors flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setActiveVideo(vid)}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian text-left focus:outline-none"
                    aria-label={`Open video player for ${vid.title}`}
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-obsidian/25 group-hover:bg-obsidian/15 transition-colors flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card text-obsidian transition-transform duration-300 group-hover:scale-105">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </span>
                    </div>
                    <span className="absolute top-3.5 left-3.5 rounded-full bg-obsidian/85 text-white px-3 py-1 text-xs font-medium">
                      {PLATFORM_LABELS[vid.platform]}
                    </span>
                  </button>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {vid.category} &middot; {vid.publishedDate}
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
                        {vid.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{vid.description}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveVideo(vid)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Watch Here
                      </button>

                      <a
                        href={vid.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        {parsed.fallbackLabel}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
