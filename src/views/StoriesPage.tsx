'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Share2, X } from 'lucide-react';
import { estimateReadingTimeMinutes, sanitizeArticleHtml } from '@/lib/sanitizeHtml';
import { PortfolioImage } from '@/components/common/PortfolioImage';
import type { Story } from '@/types/portfolio';

interface StoriesPageProps {
  stories: Story[];
  slug?: string;
}

export const StoriesPage: React.FC<StoriesPageProps> = ({ stories, slug }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const publishedStories = useMemo(
    () => stories.filter((s) => s.isPublished),
    [stories]
  );

  const activeStory = useMemo(() => {
    if (!slug) return null;
    return publishedStories.find((s) => s.slug === slug || s.id === slug) || null;
  }, [publishedStories, slug]);

  const sanitizedBody = useMemo(
    () => (activeStory ? sanitizeArticleHtml(activeStory.contentHtml) : ''),
    [activeStory]
  );

  const { prevStory, nextStory } = useMemo(() => {
    if (!activeStory) return { prevStory: null, nextStory: null };
    const idx = publishedStories.findIndex((s) => s.id === activeStory.id);
    return {
      prevStory: idx > 0 ? publishedStories[idx - 1] : null,
      nextStory: idx >= 0 && idx < publishedStories.length - 1 ? publishedStories[idx + 1] : null,
    };
  }, [publishedStories, activeStory]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Ignore clipboard failures
    }
  };

  // Story Detail View
  if (slug) {
    if (!activeStory) {
      return (
        <div className="bg-background text-foreground pt-36 pb-24 site-container text-center space-y-5">
          <h1 className="text-3xl font-serif font-semibold">Story Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This story may have been moved or is not currently published.
          </p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            All Stories
          </Link>
        </div>
      );
    }

    const readMinutes = estimateReadingTimeMinutes(sanitizedBody);
    const storyImages = activeStory.images || [];

    return (
      <article className="bg-background text-foreground pt-20">
        {/* Clean Editorial Header */}
        <header className="bg-background border-b border-border py-12 lg:py-20">
          <div className="site-container max-w-4xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Stories
              </Link>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Share'}
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight leading-[1.12] text-foreground">
              {activeStory.title}
            </h1>

            {activeStory.shortDescription && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {activeStory.shortDescription}
              </p>
            )}

            <p className="text-xs font-mono text-muted-foreground pt-2">
              {readMinutes} min read
              {activeStory.createdAt
                ? ` · ${new Date(activeStory.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}`
                : ''}
            </p>
          </div>
        </header>

        {/* Cover Photograph */}
        <figure className="site-container max-w-5xl mt-10 lg:mt-14">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
            <PortfolioImage
              src={activeStory.coverImage}
              alt={activeStory.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover"
            />
          </div>
        </figure>

        {/* Tiptap Editorial Body + Natural Story Photographs */}
        <div className="site-container max-w-3xl py-12 lg:py-16 space-y-12">
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />

          {storyImages.length > 0 && (
            <section aria-label="Story photographs" className="space-y-6 pt-4 border-t border-border">
              <div
                className={`grid gap-4 sm:gap-6 ${
                  storyImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {storyImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setZoomImage(imgUrl)}
                    className={`group relative rounded-xl overflow-hidden bg-muted border border-border text-left focus:outline-none cursor-pointer ${
                      storyImages.length > 2 && idx === 0
                        ? 'sm:col-span-2 aspect-[16/10]'
                        : 'aspect-[4/3]'
                    }`}
                    aria-label={`Inspect story photograph ${idx + 1}`}
                  >
                    <PortfolioImage
                      src={imgUrl}
                      alt={`${activeStory.title} — Photograph ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 720px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {(prevStory || nextStory) && (
            <nav
              aria-label="Story navigation"
              className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {prevStory ? (
                <Link
                  href={`/stories/${encodeURIComponent(prevStory.slug)}`}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/40 transition-colors text-left"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Story
                  </p>
                  <h4 className="text-lg font-serif font-semibold text-foreground mt-1.5 line-clamp-1 group-hover:opacity-75">
                    {prevStory.title}
                  </h4>
                </Link>
              ) : (
                <div />
              )}

              {nextStory && (
                <Link
                  href={`/stories/${encodeURIComponent(nextStory.slug)}`}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/40 transition-colors text-right"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex items-center justify-end gap-1.5">
                    Next Story
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                  <h4 className="text-lg font-serif font-semibold text-foreground mt-1.5 line-clamp-1 group-hover:opacity-75">
                    {nextStory.title}
                  </h4>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Simple Inline Zoom Lightbox */}
        {zoomImage && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setZoomImage(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-5 right-5 z-10 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Close photograph"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              className="relative w-full max-w-[90vw] h-[82vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <PortfolioImage
                src={zoomImage}
                alt={activeStory.title}
                fill
                sizes="90vw"
                priority
                className="object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </article>
    );
  }

  // Stories Listing View
  return (
    <div className="bg-background text-foreground pt-20">
      <section className="bg-background border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Field Notes &amp; Photo Essays
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-semibold tracking-tight leading-[1.08]">
            Stories
          </h1>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Personal dispatches and photo stories from wild habitats across Bangladesh.
          </p>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        {publishedStories.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-card border border-border p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-serif font-semibold text-foreground">
              No stories published yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Field stories published from the dashboard will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
            {publishedStories.map((story) => (
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
                      <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight text-foreground leading-snug group-hover:opacity-80 transition-opacity">
                        {story.title}
                      </h2>
                      {story.shortDescription && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
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
        )}
      </section>
    </div>
  );
};
