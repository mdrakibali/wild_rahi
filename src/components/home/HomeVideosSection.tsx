'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VideoCard } from '@/components/videos/VideoCard';
import { VideoModal } from '@/components/videos/VideoModal';
import type { VideoItem } from '@/types/portfolio';

interface HomeVideosSectionProps {
  videos: VideoItem[];
}

export const HomeVideosSection: React.FC<HomeVideosSectionProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const displayVideos = videos.slice(0, 3);

  if (displayVideos.length === 0) return null;

  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-7">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              03 &middot; Field Motion
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-foreground">
              Videos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Moving moments from the wild—quiet encounters in mangroves and wetlands.
            </p>
          </div>

          <Link
            href="/videos"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-secondary px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground transition-colors self-start md:self-auto"
          >
            All Videos
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
          {displayVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={() => setActiveVideo(video)} />
          ))}
        </div>
      </div>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
};
