'use client';

import React, { useMemo, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { countPhotosByCollection } from '../lib/validation';
import type { VideoItem } from '../types/portfolio';

// Modular Home Subcomponents
import { CinematicHero } from '../components/hero/CinematicHero';
import { HomeIntro } from '../components/home/HomeIntro';
import { HorizontalJourney } from '../components/photography/HorizontalJourney';
import { HomeCategories } from '../components/home/HomeCategories';
import { HomeEcosystems } from '../components/home/HomeEcosystems';
import { HomeVideos } from '../components/home/HomeVideos';
import { HomeArticles } from '../components/home/HomeArticles';
import { HomeConservation } from '../components/home/HomeConservation';
import { HomeAboutCta } from '../components/home/HomeAboutCta';
import { Lightbox } from '../components/lightbox/Lightbox';
import { VideoModal } from '../components/videos/VideoModal';

export const HomePage: React.FC = () => {
  const { photographs, collections, locations, articles, videos, profile } = usePortfolio();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const publishedPhotos = useMemo(
    () =>
      photographs
        .filter((p) => p.published)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [photographs]
  );

  const heroPhoto = useMemo(
    () => publishedPhotos.find((p) => p.featured) || publishedPhotos[0],
    [publishedPhotos]
  );

  const journeyPhotos = useMemo(() => {
    const selected = publishedPhotos.filter((p) => p.inHorizontalJourney);
    return selected.length >= 3 ? selected : publishedPhotos.slice(0, 6);
  }, [publishedPhotos]);

  const countsByCollection = useMemo(
    () => countPhotosByCollection(publishedPhotos),
    [publishedPhotos]
  );

  const featuredVideos = useMemo(() => {
    const pub = videos
      .filter((v) => v.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const feat = pub.filter((v) => v.featured);
    return (feat.length >= 3 ? feat : pub).slice(0, 4);
  }, [videos]);

  const latestArticles = useMemo(() => {
    return articles
      .filter((a) => a.published)
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
      .slice(0, 3);
  }, [articles]);

  return (
    <div className="bg-background text-foreground">
      {/* 1. Cinematic Hero */}
      <CinematicHero heroPhoto={heroPhoto} profile={profile} />

      {/* 2. Introduction & Field Philosophy */}
      <HomeIntro profile={profile} />

      {/* 3. Horizontal Photography Journey */}
      <HorizontalJourney
        photographs={journeyPhotos}
        onSelectPhoto={(index) => setLightboxIndex(index)}
      />

      {/* 4. Curated Wildlife Categories */}
      <HomeCategories
        collections={collections}
        countsByCollection={countsByCollection}
      />

      {/* 5. Documented Habitats & Ecosystems */}
      <HomeEcosystems locations={locations} />

      {/* 6. Video Showcase & Field Dispatches */}
      <HomeVideos
        videos={featuredVideos}
        onSelectVideo={(vid) => setActiveVideo(vid)}
      />

      {/* 7. Latest Articles & Field Notes */}
      <HomeArticles articles={latestArticles} />

      {/* 8. Conservation Ethos */}
      <HomeConservation profile={profile} />

      {/* 9. About Rahi & Collaboration */}
      <HomeAboutCta profile={profile} />

      {/* Modals */}
      <Lightbox
        photographs={journeyPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
