'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { VideoModal } from '../components/videos/VideoModal';
import { ALLOWED_VIDEO_CATEGORIES } from '../lib/validation';
import type { VideoItem } from '../types/portfolio';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { VideoCard } from '../components/videos/VideoCard';

type VideoPlatformFilter = 'all' | 'youtube' | 'facebook' | 'instagram' | 'tiktok';

const PLATFORM_FILTERS: Array<{ id: VideoPlatformFilter; label: string }> = [
  { id: 'all', label: 'All Platforms' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
];

export const VideosPage: React.FC = () => {
  const { videos } = usePortfolio();
  const [platformFilter, setPlatformFilter] = useState<VideoPlatformFilter>('all');
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
    <div className="bg-background text-foreground pt-20">
      {/* Header */}
      <section className="bg-secondary border-b border-border py-16 lg:py-24">
        <div className="site-container space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Motion Field Archive
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
            Video Showcase
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Wildlife moments, avian flight studies, mangrove dispatches, and behind-the-lens field reels
            from across Bangladesh.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card border-b border-border sticky top-20 z-20 shadow-2xs">
        <div className="site-container py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {PLATFORM_FILTERS.map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => setPlatformFilter(pf.id)}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                    platformFilter === pf.id
                      ? 'bg-primary text-white shadow-xs'
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
                {filteredVideos.length} {filteredVideos.length === 1 ? 'dispatch' : 'dispatches'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="site-container py-14 lg:py-20">
        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center bg-secondary border border-border rounded-xl p-8 space-y-4 max-w-xl mx-auto shadow-xs">
            <h2 className="text-2xl font-serif font-bold text-foreground">No videos match these filters</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Try selecting another platform or category.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setPlatformFilter('all');
                setCategoryFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onPlay={() => setActiveVideo(vid)}
              />
            ))}
          </div>
        )}
      </section>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
