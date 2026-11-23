'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { sanitizeArticleHtml } from '../lib/sanitizeHtml';
import { ALLOWED_ARTICLE_CATEGORIES } from '../lib/validation';
import type { ArticleLanguage } from '../types/portfolio';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ArticleCard } from '../components/articles/ArticleCard';
import { ArticleDetailView } from '../components/articles/ArticleDetailView';

export const ArticlesPage: React.FC = () => {
 const { slug } = useParams<{ slug?: string }>();
 const { articles } = usePortfolio();

 const [languageFilter, setLanguageFilter] = useState<'all' | ArticleLanguage>('all');
 const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

 // Mode 1: Individual Article Reading View
 if (slug) {
 if (!activeArticle) {
 return (
 <div className="bg-background text-foreground pt-36 pb-24 site-container text-center space-y-5">
 <h1 className="text-3xl font-serif font-bold">Article Not Found</h1>
 <p className="text-sm text-muted-foreground">
 This field note may have been updated or moved.
 </p>
 <Link
 to="/articles"
 className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
 >
 <ArrowLeft className="w-4 h-4" />
 All Articles
 </Link>
 </div>
 );
 }

 return (
 <ArticleDetailView
 article={activeArticle}
 sanitizedBody={sanitizedBody}
 translatedCounterpart={translatedCounterpart}
 prevArticle={prevArticle}
 nextArticle={nextArticle}
 relatedArticles={relatedArticles}
 />
 );
 }

 // Mode 2: Articles Index View
 return (
 <div className="bg-background text-foreground pt-20">
 <section className="bg-secondary border-b border-border py-16 lg:py-24">
 <div className="site-container space-y-4">
 <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
 Journal &amp; Essays &middot; English &amp; বাংলা
 </p>
 <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold tracking-tight leading-[1.08]">
 Articles &amp; Field Notes
 </h1>
 <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
 In-depth field writing on Bangladesh&apos;s biodiversity, conservation challenges, and
 ethical wildlife documentation.
 </p>
 </div>
 </section>

 {/* Filters */}
 <section className="bg-card border-b border-border sticky top-20 z-20 ">
 <div className="site-container py-4 flex flex-wrap items-center justify-between gap-4">
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
 className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
 languageFilter === lang.id
 ? 'bg-primary text-white '
 : 'bg-secondary text-foreground hover:bg-muted'
 }`}
 >
 {lang.label}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-3">
 <div className="w-56">
 <Select
 aria-label="Filter by article category"
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 >
 <option value="all">All Categories</option>
 {ALLOWED_ARTICLE_CATEGORIES.map((cat) => (
 <option key={cat} value={cat}>
 {cat}
 </option>
 ))}
 </Select>
 </div>
 <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
 {filteredIndexArticles.length}{' '}
 {filteredIndexArticles.length === 1 ? 'article' : 'articles'}
 </span>
 </div>
 </div>
 </section>

 {/* Articles Grid */}
 <section className="site-container py-14 lg:py-20">
 {filteredIndexArticles.length === 0 ? (
 <div className="py-16 text-center bg-secondary border border-border rounded-md p-8 space-y-4 max-w-xl mx-auto ">
 <h2 className="text-2xl font-serif font-bold text-foreground">No articles match these filters</h2>
 <p className="text-xs sm:text-sm text-muted-foreground">
 Try selecting another language or category.
 </p>
 <Button
 type="button"
 variant="primary"
 onClick={() => {
 setLanguageFilter('all');
 setCategoryFilter('all');
 }}
 >
 Reset Filters
 </Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {filteredIndexArticles.map((article) => (
 <ArticleCard key={article.id} article={article} />
 ))}
 </div>
 )}
 </section>
 </div>
 );
};
