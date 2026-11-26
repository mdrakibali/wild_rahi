'use client';

import React, { useState } from 'react';
import { VideoModal } from '@/components/videos/VideoModal';
import { VideoCard } from '@/components/videos/VideoCard';
import type { VideoItem } from '@/types/portfolio';

export const VideosPage: React.FC<{ videos: VideoItem[] }> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const publishedVideos = videos
    .filter((v) => v.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="bg-background text-foreground pt-20">
      <section className="bg-background border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Field Motion
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-semibold tracking-tight leading-[1.08]">
            Videos
          </h1>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Wildlife encounters, flight studies, and moments in motion across Bangladesh.
          </p>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        {publishedVideos.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-card border border-border p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-serif font-semibold text-foreground">
              No videos published yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Published field videos will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
            {publishedVideos.map((vid) => (
              <VideoCard key={vid.id} video={vid} onPlay={() => setActiveVideo(vid)} />
            ))}
          </div>
        )}
      </section>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
