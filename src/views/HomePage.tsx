"use client";

import { Link } from "@/lib/router-compat";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import React, { useMemo, useState } from "react";
import { EditorialCollections } from "../components/collections/EditorialCollections";
import { CinematicHero } from "../components/hero/CinematicHero";
import { Lightbox } from "../components/lightbox/Lightbox";
import { HorizontalJourney } from "../components/photography/HorizontalJourney";
import { VideoModal } from "../components/videos/VideoModal";
import { usePortfolio } from "../context/PortfolioContext";
import { countPhotosByCollection } from "../lib/validation";
import { PLATFORM_LABELS } from "../lib/videoEmbed";
import type { VideoItem } from "../types/portfolio";

export const HomePage: React.FC = () => {
  const { photographs, collections, locations, articles, videos, profile } =
    usePortfolio();
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

  const latestArticles = useMemo(() => {
    return articles
      .filter((a) => a.published)
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
      .slice(0, 3);
  }, [articles]);

  return (
    <div className="bg-[#FFFFFF] text-[#171717]">
      {/* 1. Cinematic Hero (Dark #0B0B0B) */}
      <CinematicHero heroPhoto={heroPhoto} profile={profile} />

      {/* 2. Short Introduction (#FFFFFF) */}
      <section
        id="introduction"
        className="bg-[#FFFFFF] text-[#171717] py-24 lg:py-32"
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
              Field Philosophy
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.14]">
              {profile.introHeading ||
                "Observing Wild Bangladesh With Patience"}
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <p className="text-lg sm:text-xl text-[#171717]/90 leading-relaxed font-normal">
              {profile.introBody}
            </p>
            <p className="text-base text-[#686868] leading-relaxed max-w-3xl">
              {profile.philosophy}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/photography"
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-3 text-sm font-medium hover:bg-[#333333] transition-colors"
              >
                Browse the Archive
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wildlife"
                className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 text-[#171717] px-6 py-3 text-sm font-medium hover:bg-[#F7F7F4] transition-colors"
              >
                Species Field Index
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Horizontal Photography Journey (Dark #0B0B0B) */}
      <HorizontalJourney
        photographs={journeyPhotos}
        onSelectPhoto={(index) => setLightboxIndex(index)}
      />

      {/* 4. Wildlife Photography Categories (#F7F7F4) */}
      <section className="bg-[#F7F7F4] text-[#171717] py-24 lg:py-32 border-t border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Taxonomic Focus
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.14]">
                Wildlife Photography Categories
              </h2>
            </div>
            <Link
              to="/photography"
              className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 px-6 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#171717] hover:text-[#FFFFFF] transition-colors self-start md:self-auto"
            >
              Open Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.slice(0, 5).map((cat) => {
              const count = countsByCollection[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  to={`/photography?collection=${encodeURIComponent(cat.id)}`}
                  className="group block bg-[#FFFFFF] border border-[#E7E7E2] transition-colors hover:border-[#171717]/35"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#F0F0EC]">
                    <img
                      src={cat.coverImageUrl}
                      alt={cat.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4 sm:p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-[#171717]">
                        {cat.title}
                      </h3>
                      <span className="text-xs font-mono text-[#686868]">
                        {count}
                      </span>
                    </div>
                    <p className="text-xs text-[#686868] leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Featured Photography Collections (#FFFFFF) */}
      <EditorialCollections
        collections={collections}
        countsByCollection={countsByCollection}
      />

      {/* 6. Bangladesh Through My Lens (#F0F0EC) */}
      <section className="bg-[#F0F0EC] text-[#171717] py-24 lg:py-32 border-t border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Documented Ecosystems
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.14]">
                Bangladesh Through My Lens
              </h2>
              <p className="text-base text-[#686868] leading-relaxed">
                From tidal mangrove creeks to monsoon haor basins and
                northeastern semi-evergreen hills &mdash; each landscape shapes
                the behavior of the species living within it.
              </p>
            </div>
            <Link
              to="/wildlife"
              className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 px-6 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#171717] hover:text-[#FFFFFF] transition-colors self-start md:self-auto"
            >
              Explore Habitats &amp; Species
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {locations.slice(0, 6).map((loc) => (
              <Link
                key={loc.id}
                to={`/photography?location=${encodeURIComponent(loc.slug)}`}
                className="group bg-[#FFFFFF] border border-[#E7E7E2] flex flex-col hover:border-[#171717]/35 transition-colors"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#E7E7E2]">
                  <img
                    src={loc.coverImageUrl}
                    alt={loc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#686868]">
                      {loc.region} &middot; {loc.ecosystem}
                    </p>
                    <h3 className="text-xl font-semibold tracking-tight text-[#171717]">
                      {loc.name}
                    </h3>
                    <p className="text-sm text-[#686868] leading-relaxed">
                      {loc.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#171717] group-hover:underline">
                    View habitat plates
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Video Showcase (Dark #0B0B0B) */}
      <section className="bg-[#0B0B0B] text-[#FFFFFF] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#FFFFFF]/60 font-medium">
                Field Motion &amp; Dispatches
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.14]">
                Video Showcase
              </h2>
              <p className="text-base text-[#FFFFFF]/70 leading-relaxed">
                Short wildlife dispatches, bird behavior studies, and habitat
                reels published across YouTube, Facebook, Instagram, and TikTok.
              </p>
            </div>
            <Link
              to="/videos"
              className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/30 px-6 py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0B0B0B] transition-colors self-start md:self-auto"
            >
              All Field Videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {featuredVideos.map((vid) => (
              <article key={vid.id} className="group flex flex-col">
                <button
                  type="button"
                  onClick={() => setActiveVideo(vid)}
                  className="text-left focus:outline-none flex-1 flex flex-col"
                  aria-label={`Play video: ${vid.title}`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#171717]">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[#0B0B0B]/25 group-hover:bg-[#0B0B0B]/10 transition-colors flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFFFF] text-[#0B0B0B] transition-transform duration-300 group-hover:scale-105">
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </span>
                    </div>
                    <span className="absolute top-3 left-3 rounded-full bg-[#0B0B0B]/80 text-[#FFFFFF] px-3 py-1 text-[11px] font-medium tracking-wide">
                      {PLATFORM_LABELS[vid.platform]}
                    </span>
                  </div>
                  <div className="pt-4 space-y-1.5">
                    <p className="text-xs text-[#FFFFFF]/55">
                      {vid.category} &middot; {vid.publishedDate}
                    </p>
                    <h3 className="text-lg font-medium text-[#FFFFFF] leading-snug group-hover:opacity-80 transition-opacity">
                      {vid.title}
                    </h3>
                    <p className="text-sm text-[#FFFFFF]/65 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Latest Articles & Blogs (#FFFFFF — English & Bangla) */}
      <section className="bg-[#FFFFFF] text-[#171717] py-24 lg:py-32 border-t border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
                Editorial Journal &middot; English &amp; বাংলা
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.14]">
                Latest Articles &amp; Field Notes
              </h2>
              <p className="text-base text-[#686868] leading-relaxed">
                Long-form field essays, biodiversity observations, and ethical
                photography notes written in English and Bangla.
              </p>
            </div>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 px-6 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#171717] hover:text-[#FFFFFF] transition-colors self-start md:self-auto"
            >
              Read All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${encodeURIComponent(article.slug)}`}
                lang={article.language}
                className="group flex flex-col border border-[#E7E7E2] bg-[#FFFFFF] hover:border-[#171717]/35 transition-colors"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#F0F0EC]">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#686868]">
                      <span>{article.category}</span>
                      <span className="rounded-full bg-[#F0F0EC] text-[#171717] px-2.5 py-0.5 text-[11px] font-medium">
                        {article.language === "bn" ? "বাংলা" : "English"}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#171717] leading-snug group-hover:opacity-75 transition-opacity">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#686868] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-[#686868]">
                    <span>
                      {article.publishedDate} &middot; {article.readTimeMinutes}{" "}
                      min read
                    </span>
                    <span className="font-medium text-[#171717]">
                      Read &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Conservation Statement (Dark #0B0B0B) */}
      <section className="bg-[#0B0B0B] text-[#FFFFFF] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FFFFFF]/55 font-medium">
            Conservation Commitment
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.12]">
            {profile.conservationHeadline ||
              "Every Photograph Is a Record of What Must Endure"}
          </h2>
          <p className="text-base sm:text-lg text-[#FFFFFF]/75 max-w-2xl mx-auto leading-relaxed">
            {profile.conservationStatement}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/conservation"
              className="inline-flex items-center gap-2 rounded-full bg-[#FFFFFF] text-[#0B0B0B] px-7 py-3 text-sm font-medium hover:bg-[#F0F0EC] transition-colors"
            >
              Read Ethical Field Guidelines
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/30 text-[#FFFFFF] px-7 py-3 text-sm font-medium hover:bg-[#FFFFFF]/10 transition-colors"
            >
              Conservation Partnerships
            </Link>
          </div>
        </div>
      </section>

      {/* 10. About Preview (#F7F7F4) */}
      <section className="bg-[#F7F7F4] text-[#171717] py-24 lg:py-32 border-t border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-[#E7E7E2]">
              {profile.portraitUrl && (
                <img
                  src={profile.portraitUrl}
                  alt={profile.photographerName}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
              About the Photographer
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.14]">
              {profile.photographerName} &mdash; {profile.brandName}
            </h2>
            <p className="text-base sm:text-lg text-[#171717]/85 leading-relaxed">
              {profile.bioSummary}
            </p>
            <p className="text-sm sm:text-base text-[#686868] leading-relaxed">
              {profile.journeyNote}
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-7 py-3 text-sm font-medium hover:bg-[#333333] transition-colors"
              >
                Full Biography &amp; Field Kit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 text-[#171717] px-6 py-3 text-sm font-medium hover:bg-[#FFFFFF] transition-colors"
              >
                Follow Wild Rahi on Facebook
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Contact & Collaboration CTA (#FFFFFF) */}
      <section className="bg-[#FFFFFF] text-[#171717] py-24 lg:py-28 border-t border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
              Assignments, Prints &amp; Biodiversity Projects
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">
              Collaborate With Wild Rahi
            </h2>
            <p className="text-base text-[#686868] leading-relaxed">
              Available for editorial photography commissions, conservation
              documentation, fine-art archival prints, and wildlife licensing
              across Bangladesh and South Asia.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-8 py-3.5 text-sm font-medium hover:bg-[#333333] transition-colors"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 text-[#171717] px-7 py-3.5 text-sm font-medium hover:bg-[#F7F7F4] transition-colors"
            >
              Read Field Journal
            </Link>
          </div>
        </div>
      </section>

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
