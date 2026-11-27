import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import {
  HOME_CAROUSEL_SLIDE_CLASS,
  HomeCarouselSection,
} from '@/components/home/HomeCarouselSection';
import { HOME_SECTION_LIMIT } from '@/lib/validation';
import type { Story } from '@/types/portfolio';

interface HomeStoriesSectionProps {
  stories: Story[];
}

export const HomeStoriesSection: React.FC<HomeStoriesSectionProps> = ({ stories }) => {
  const displayStories = stories.slice(0, HOME_SECTION_LIMIT);

  return (
    <HomeCarouselSection
      eyebrow="04 · Field Notes"
      title="Field Stories"
      description="Notes and photo essays written from time spent outdoors."
      viewAllHref="/stories"
      prevAriaLabel="Previous stories"
      nextAriaLabel="Next stories"
      surfaceClass="bg-secondary"
      controlClass="bg-card hover:bg-muted"
      itemCount={displayStories.length}
    >
      {displayStories.map((story) => (
        <div key={story.id} className={HOME_CAROUSEL_SLIDE_CLASS}>
          <article className="w-full h-full group rounded-lg bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:border-foreground/25 hover:shadow-md">
            <Link
              href={`/stories/${encodeURIComponent(story.slug)}`}
              className="flex flex-col h-full focus:outline-none"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <PortfolioImage
                  src={story.coverImage}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">
                    {story.title}
                  </h3>
                  {story.shortDescription && (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {story.shortDescription}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 pt-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground">
                  Read Story
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </article>
        </div>
      ))}
    </HomeCarouselSection>
  );
};
