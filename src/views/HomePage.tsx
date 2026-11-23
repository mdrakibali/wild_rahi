"use client";

import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { countPhotosByCollection } from "../lib/validation";
import type { VideoItem } from "../types/portfolio";

// High-impact visual sections for the streamlined homepage
import { CinematicHero } from "../components/hero/CinematicHero";
import { HomeCategories } from "../components/home/HomeCategories";
import { HomeVideos } from "../components/home/HomeVideos";
import { Lightbox } from "../components/lightbox/Lightbox";
import { HorizontalJourney } from "../components/photography/HorizontalJourney";
import { VideoModal } from "../components/videos/VideoModal";

export const HomePage: React.FC = () => {
  const { photographs, collections, videos, profile } = usePortfolio();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
      {/* 1. Cinematic Hero */}
      <CinematicHero heroPhoto={heroPhoto} profile={profile} />

      {/* 2. Wildlife Categories */}
      <HomeCategories
        collections={collections}
        countsByCollection={countsByCollection}
      />

      {/* 3. Panoramic Field Journey */}
      <HorizontalJourney
        photographs={journeyPhotos}
        onSelectPhoto={(index) => setLightboxIndex(index)}
      />

      {/* 4. Field Video Footage */}
      <HomeVideos
        videos={featuredVideos}
        onSelectVideo={(vid) => setActiveVideo(vid)}
      />

      {/* 5. Pure Photography Portfolio Teaser & Gallery CTA */}
      <section className="bg-secondary border-t border-border py-16 lg:py-24">
        <div className="site-container flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Wildlife Portfolio Archive
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
              Witness the Untamed Wilderness of Bangladesh
            </h2>
            <p className="text-base text-foreground/85 leading-relaxed">
              Explore natural-light plates captured through patient field work across rivers, wetlands, and rainforests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Browse Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
            >
              About the Photographer
            </Link>
          </div>
        </div>
      </section>

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
