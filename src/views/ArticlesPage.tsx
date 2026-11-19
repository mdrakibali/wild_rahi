'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, ArrowRight, Check, Languages, Share2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { sanitizeArticleHtml } from '../lib/sanitizeHtml';
import { ALLOWED_ARTICLE_CATEGORIES } from '../lib/validation';
import type { ArticleLanguage } from '../types/portfolio';

export const ArticlesPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { articles } = usePortfolio();

  const [languageFilter, setLanguageFilter] = useState<'all' | ArticleLanguage>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const publishedArticles = useMemo(
    () =>
      articles
        .filter((a) => a.published)
        .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)),
    [articles]
  );

  const activeArticle = useMemo(() => {
    if (!slug) return null;
    return publishedArticles.find((a) => a.slug === slug || a.id === slug) || null;
  }, [publishedArticles, slug]);

  const translatedCounterpart = useMemo(() => {
    if (!activeArticle?.translationGroupId) return null;
    return (
      publishedArticles.find(
        (a) =>
          a.id !== activeArticle.id &&
          a.translationGroupId === activeArticle.translationGroupId
      ) || null
    );
  }, [publishedArticles, activeArticle]);

  const sanitizedBody = useMemo(
    () => (activeArticle ? sanitizeArticleHtml(activeArticle.contentHtml) : ''),
    [activeArticle]
  );

  const { prevArticle, nextArticle, relatedArticles } = useMemo(() => {
    if (!activeArticle) {
      return { prevArticle: null, nextArticle: null, relatedArticles: [] };
    }
    const idx = publishedArticles.findIndex((a) => a.id === activeArticle.id);
    const prev = idx > 0 ? publishedArticles[idx - 1] : null;
    const next = idx >= 0 && idx < publishedArticles.length - 1 ? publishedArticles[idx + 1] : null;
    const related = publishedArticles
      .filter(
        (a) =>
          a.id !== activeArticle.id &&
          a.id !== translatedCounterpart?.id &&
          (a.category === activeArticle.category || a.language === activeArticle.language)
      )
      .slice(0, 3);
    return { prevArticle: prev, nextArticle: next, relatedArticles: related };
  }, [publishedArticles, activeArticle, translatedCounterpart]);

  const filteredIndexArticles = useMemo(() => {
    return publishedArticles.filter((a) => {
      if (languageFilter !== 'all' && a.language !== languageFilter) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      return true;
    });
  }, [publishedArticles, languageFilter, categoryFilter]);

  // Dynamic SEO Title & Meta Description
  useEffect(() => {
    const defaultTitle = 'Articles & Field Notes — Wild Rahi';
    const defaultDesc =
      'Bilingual wildlife essays, field observations, and conservation notes from Bangladesh in English and Bangla by Razaul Hafiz Rahi.';

    if (activeArticle) {
      document.title = activeArticle.seoTitle || `${activeArticle.title} — Wild Rahi`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', activeArticle.seoDescription || activeArticle.excerpt);
      }
    } else {
      document.title = defaultTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', defaultDesc);
    }
  }, [activeArticle]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      // Ignore clipboard failures in restricted iframes
    }
  };

  if (slug) {
    if (!activeArticle) {
      return (
        <div className="bg-[#FFFFFF] text-[#171717] pt-36 pb-24 px-5 text-center space-y-5">
          <h1 className="text-3xl font-semibold">Article Not Found</h1>
          <p className="text-sm text-[#686868]">
            This essay may be in draft or has moved to a different link.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>
        </div>
      );
    }

    const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

    return (
      <article className="bg-[#FFFFFF] text-[#171717] pt-20" lang={activeArticle.language}>
        {/* Editorial Article Header */}
        <header className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-12 lg:py-20">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] px-4 py-1.5 text-xs font-medium text-[#171717] hover:bg-[#F0F0EC] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Articles
              </Link>

              {translatedCounterpart && (
                <Link
                  to={`/articles/${encodeURIComponent(translatedCounterpart.slug)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-4 py-1.5 text-xs font-medium hover:bg-[#333333] transition-colors"
                >
                  <Languages className="w-3.5 h-3.5" />
                  {translatedCounterpart.language === 'bn' ? 'বাংলায় পড়ুন' : 'Read in English'}
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#686868]">
              <span className="rounded-full bg-[#FFFFFF] border border-[#E7E7E2] px-3 py-1 text-[#171717] font-medium">
                {activeArticle.category}
              </span>
              <span className="rounded-full bg-[#F0F0EC] px-3 py-1 text-[#171717] font-medium">
                {activeArticle.language === 'bn' ? 'বাংলা' : 'English'}
              </span>
              <span>{activeArticle.publishedDate}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{activeArticle.readTimeMinutes} min read</span>
              {activeArticle.locationName && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{activeArticle.locationName}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.15] text-[#171717]">
              {activeArticle.title}
            </h1>

            <p className="text-lg sm:text-xl text-[#686868] leading-relaxed">
              {activeArticle.excerpt}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#E7E7E2]">
              <p className="text-sm font-medium text-[#171717]">
                By {activeArticle.authorName || 'Razaul Hafiz Rahi'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] px-4 py-1.5 text-xs font-medium text-[#171717] hover:bg-[#F0F0EC] transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied' : 'Copy Link'}
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-[#E7E7E2] bg-[#FFFFFF] px-4 py-1.5 text-xs font-medium text-[#171717] hover:bg-[#F0F0EC] transition-colors"
                >
                  Share on Facebook
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Cover Photograph */}
        <figure className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 mt-10 lg:mt-14">
          <div className="aspect-[16/9] overflow-hidden bg-[#F0F0EC]">
            <img
              src={activeArticle.coverImageUrl}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
          {activeArticle.coverCaption && (
            <figcaption className="text-xs sm:text-sm text-[#686868] mt-3">
              {activeArticle.coverCaption}
            </figcaption>
          )}
        </figure>

        {/* Rich Editorial Body */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />

          {/* Tags */}
          {activeArticle.tags && activeArticle.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-[#E7E7E2] flex flex-wrap items-center gap-2">
              {activeArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F7F7F4] border border-[#E7E7E2] px-3.5 py-1 text-xs text-[#686868]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Previous / Next Navigation */}
          {(prevArticle || nextArticle) && (
            <nav
              aria-label="Article navigation"
              className="mt-12 pt-8 border-t border-[#E7E7E2] grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {prevArticle ? (
                <Link
                  to={`/articles/${encodeURIComponent(prevArticle.slug)}`}
                  className="p-5 bg-[#F7F7F4] border border-[#E7E7E2] hover:border-[#171717]/40 transition-colors space-y-1.5"
                >
                  <span className="text-xs text-[#686868] inline-flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Newer Article
                  </span>
                  <p className="text-base font-semibold text-[#171717] line-clamp-2">
                    {prevArticle.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextArticle && (
                <Link
                  to={`/articles/${encodeURIComponent(nextArticle.slug)}`}
                  className="p-5 bg-[#F7F7F4] border border-[#E7E7E2] hover:border-[#171717]/40 transition-colors space-y-1.5 sm:text-right"
                >
                  <span className="text-xs text-[#686868] inline-flex items-center gap-1 sm:justify-end">
                    Older Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-base font-semibold text-[#171717] line-clamp-2">
                    {nextArticle.title}
                  </p>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-[#F7F7F4] border-t border-[#E7E7E2] py-16 lg:py-20">
            <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
                Related Field Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.id}
                    to={`/articles/${encodeURIComponent(item.slug)}`}
                    lang={item.language}
                    className="group bg-[#FFFFFF] border border-[#E7E7E2] hover:border-[#171717]/40 transition-colors flex flex-col"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#F0F0EC]">
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#686868]">
                        <span>{item.category}</span>
                        <span>{item.language === 'bn' ? 'বাংলা' : 'English'}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#171717] leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    );
  }

  return (
    <div className="bg-[#FFFFFF] text-[#171717] pt-20">
      <section className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
            Journal &amp; Essays &middot; English &amp; বাংলা
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08]">
            Articles &amp; Field Notes
          </h1>
          <p className="text-base sm:text-lg text-[#686868] max-w-2xl leading-relaxed">
            In-depth field writing on Bangladesh&apos;s wildlife, ethical photography practice, and
            habitat documentation &mdash; published in English and Bangla.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[#FFFFFF] border-b border-[#E7E7E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Languages' },
                { id: 'en', label: 'English' },
                { id: 'bn', label: 'বাংলা' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguageFilter(lang.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  languageFilter === lang.id
                    ? 'bg-[#171717] text-[#FFFFFF]'
                    : 'bg-[#F7F7F4] text-[#171717] hover:bg-[#F0F0EC]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'border border-[#171717] text-[#171717]'
                  : 'border border-[#E7E7E2] text-[#686868] hover:text-[#171717]'
              }`}
            >
              All Topics
            </button>
            {ALLOWED_ARTICLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'border border-[#171717] text-[#171717]'
                    : 'border border-[#E7E7E2] text-[#686868] hover:text-[#171717]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20">
        {filteredIndexArticles.length === 0 ? (
          <div className="py-16 text-center bg-[#F7F7F4] border border-[#E7E7E2] p-8 space-y-4">
            <h2 className="text-2xl font-semibold">No articles match this filter</h2>
            <button
              type="button"
              onClick={() => {
                setLanguageFilter('all');
                setCategoryFilter('all');
              }}
              className="inline-flex items-center rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium"
            >
              Show All Articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIndexArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${encodeURIComponent(article.slug)}`}
                lang={article.language}
                className="group bg-[#FFFFFF] border border-[#E7E7E2] hover:border-[#171717]/40 transition-colors flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#F0F0EC]">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#686868]">
                      <span>{article.category}</span>
                      <span className="rounded-full bg-[#F0F0EC] text-[#171717] px-2.5 py-0.5 text-[11px] font-medium">
                        {article.language === 'bn' ? 'বাংলা' : 'English'}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#171717] leading-snug group-hover:opacity-75 transition-opacity">
                      {article.title}
                    </h2>
                    <p className="text-sm text-[#686868] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-[#686868]">
                    <span>
                      {article.publishedDate} &middot; {article.readTimeMinutes} min read
                    </span>
                    <span className="font-medium text-[#171717]">Read Article &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
