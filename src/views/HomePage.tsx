import React from 'react';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { FeaturedVisualSequence } from '@/components/home/FeaturedVisualSequence';
import { HomeAboutSection } from '@/components/home/HomeAboutSection';
import { HomeStoriesSection } from '@/components/home/HomeStoriesSection';
import { HomeVideosSection } from '@/components/home/HomeVideosSection';
import { HomeHabitatsCta } from '@/components/home/HomeHabitatsCta';
import type { HeroSlide, Photograph, SiteProfile, Story, VideoItem } from '@/types/portfolio';

interface HomePageProps {
  heroSlides: HeroSlide[];
  photographs: Photograph[];
  videos: VideoItem[];
  stories: Story[];
  profile: SiteProfile;
}

export const HomePage: React.FC<HomePageProps> = ({
  heroSlides,
  photographs,
  videos,
  stories,
  profile,
}) => {
  const publishedPhotos = photographs
    .filter((p) => p.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const pubVideos = videos
    .filter((v) => v.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const featVideos = pubVideos.filter((v) => v.isFeatured);
  const displayVideos = (featVideos.length >= 2 ? featVideos : pubVideos).slice(0, 3);

  const pubStories = stories.filter((s) => s.isPublished);
  const featStories = pubStories.filter((s) => s.isFeatured);
  const displayStories = (featStories.length >= 2 ? featStories : pubStories).slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      {/* 1. Cinematic Multi-Image Auto-Sliding Hero */}
      <CinematicHero slides={heroSlides} profile={profile} />

      {/* 2. Editorial Asymmetric About Section (2 - 3 - 1 Grid) */}
      <HomeAboutSection photographs={publishedPhotos} profile={profile} />

      {/* 3. Featured Visual Sequence (Horizontal Journey) */}
      <FeaturedVisualSequence photographs={publishedPhotos} />

      {/* 4. Featured Videos (3-Card Grid) */}
      <HomeVideosSection videos={displayVideos} />

      {/* 5. Featured Stories (3-Card Grid) */}
      <HomeStoriesSection stories={displayStories} />

      {/* 6. North Bengal Habitats & Collaboration CTA */}
      <HomeHabitatsCta profile={profile} />
    </div>
  );
};
