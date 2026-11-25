'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { countPhotosByCollection } from '../lib/validation';
import type { VideoItem } from '../types/portfolio';

// High-impact visual sections for the world-class homepage
import { CinematicHero } from '../components/hero/CinematicHero';
import { HomeMasterWorks } from '../components/home/HomeMasterWorks';
import { HomeAlbums } from '../components/home/HomeAlbums';
import { HomeVideos } from '../components/home/HomeVideos';
import { HorizontalJourney } from '../components/photography/HorizontalJourney';
import { VideoModal } from '../components/videos/VideoModal';

export const HomePage: React.FC = () => {
  const { photographs, collections, videos, profile } = usePortfolio();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const publishedPhotos = useMemo(
    () =>
      photographs
        .filter((p) => p.published)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [photographs],
  );

  const heroPhoto = useMemo(
    () => publishedPhotos.find((p) => p.featured) || publishedPhotos[0],
    [publishedPhotos],
  );

  const journeyPhotos = useMemo(() => {
    const selected = publishedPhotos.filter((p) => p.inHorizontalJourney);
    return selected.length >= 3 ? selected : publishedPhotos.slice(0, 6);
  }, [publishedPhotos]);

  const countsByCollection = useMemo(
    () => countPhotosByCollection(publishedPhotos),
    [publishedPhotos],
  );

  const featuredVideos = useMemo(() => {
    const pub = videos
      .filter((v) => v.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const feat = pub.filter((v) => v.featured);
    return (feat.length >= 3 ? feat : pub).slice(0, 4);
  }, [videos]);

  return (
    <div className="bg-background text-foreground">
      {/* 1. Full-Bleed Cinematic Hero */}
      <CinematicHero heroPhoto={heroPhoto} profile={profile} />

      {/* 2. Curated Master Works (Top selected photographs with instant lightbox) */}
      <HomeMasterWorks photographs={publishedPhotos} />

      {/* 3. Thematic Expeditions & Albums Showcase */}
      <HomeAlbums
        collections={collections}
        countsByCollection={countsByCollection}
      />

      {/* 4. Panoramic Field Journey */}
      <HorizontalJourney photographs={journeyPhotos} />

      {/* 5. Field Video Footage & Behind the Lens */}
      <HomeVideos
        videos={featuredVideos}
        onSelectVideo={(vid) => setActiveVideo(vid)}
      />

      {/* 6. Meet Rahi & Field Ethics Banner */}
      <section className="bg-card text-foreground border-t border-border py-20 lg:py-28">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted shadow-xl border border-border">
              <img
                src={profile.portraitUrl || '/assets/images/portrait_photographer_field_1795067902652.jpg'}
                alt={profile.photographerName || 'Razaul Hafiz Rahi'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Field Ethos &amp; Philosophy
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold tracking-tight text-foreground leading-[1.12]">
              {profile.photographerName || 'Razaul Hafiz Rahi'}
            </h2>

            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed font-serif italic">
              &ldquo;{profile.philosophy || 'The welfare and serenity of the living subject always precedes the photograph. Zero live baiting, no artificial playback calls during nesting seasons, and never disclosing sensitive breeding coordinates.'}&rdquo;
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {profile.bioSummary ||
                'Independent wildlife photographer and naturalist based in Bangladesh, dedicated to documenting rare and endangered biodiversity in natural light across mangroves, wetlands, and hill forests.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
              >
                Read Biography &amp; Gear
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
              >
                Enquire Archival Prints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
