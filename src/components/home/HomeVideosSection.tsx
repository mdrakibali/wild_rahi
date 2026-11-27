'use client';

import React, { useState } from 'react';
import {
  HOME_CAROUSEL_SLIDE_CLASS,
  HomeCarouselSection,
} from '@/components/home/HomeCarouselSection';
import { VideoCard } from '@/components/videos/VideoCard';
import { VideoModal } from '@/components/videos/VideoModal';
import { HOME_SECTION_LIMIT } from '@/lib/validation';
import type { VideoItem } from '@/types/portfolio';

interface HomeVideosSectionProps {
  videos: VideoItem[];
}

export const HomeVideosSection: React.FC<HomeVideosSectionProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const displayVideos = videos.slice(0, HOME_SECTION_LIMIT);

  return (
    <>
      <HomeCarouselSection
        eyebrow="03 · Field Motion"
        title="Videos"
        description="Short wildlife clips filmed along rivers, wetlands, and rural trees."
        prevAriaLabel="Previous videos"
        nextAriaLabel="Next videos"
        surfaceClass="bg-card"
        controlClass="bg-background hover:bg-secondary"
        itemCount={displayVideos.length}
      >
        {displayVideos.map((video) => (
          <div key={video.id} className={HOME_CAROUSEL_SLIDE_CLASS}>
            <VideoCard video={video} onPlay={() => setActiveVideo(video)} />
          </div>
        ))}
      </HomeCarouselSection>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </>
  );
};
