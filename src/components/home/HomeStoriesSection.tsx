import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import type { Story } from '@/types/portfolio';

interface HomeStoriesSectionProps {
  stories: Story[];
}

export const HomeStoriesSection: React.FC<HomeStoriesSectionProps> = ({ stories }) => {
  const displayStories = stories.slice(0, 3);

  if (displayStories.length === 0) return null;

  return (
    <section className="bg-secondary text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-7">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              04 &middot; Field Notes &amp; Essays
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-foreground">
              Stories from the Wild
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Visual essays and personal encounters from expeditions across Bangladesh.
            </p>
          </div>

          <Link
            href="/stories"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold text-foreground transition-colors self-start md:self-auto"
          >
            All Stories
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
          {displayStories.map((story) => (
            <article
              key={story.id}
              className="group rounded-xl bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:border-foreground/25 hover:shadow-md"
            >
              <Link
                href={`/stories/${encodeURIComponent(story.slug)}`}
                className="flex flex-col h-full focus:outline-none"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <PortfolioImage
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          ))}
        </div>
      </div>
    </section>
  );
};
