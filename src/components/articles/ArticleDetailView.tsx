import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, ArrowRight, Check, Languages, Share2 } from 'lucide-react';
import type { Article } from '../../types/portfolio';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ArticleDetailViewProps {
 article: Article;
 sanitizedBody: string;
 translatedCounterpart: Article | null;
 prevArticle: Article | null;
 nextArticle: Article | null;
 relatedArticles: Article[];
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
 article,
 sanitizedBody,
 translatedCounterpart,
 prevArticle,
 nextArticle,
 relatedArticles,
}) => {
 const [copiedLink, setCopiedLink] = useState(false);

 const handleCopyShareLink = async () => {
 try {
 await navigator.clipboard.writeText(window.location.href);
 setCopiedLink(true);
 setTimeout(() => setCopiedLink(false), 2400);
 } catch {
 // Ignore clipboard restrictions
 }
 };

 const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

 return (
 <article className="bg-background text-foreground pt-20" lang={article.language}>
 {/* Editorial Article Header */}
 <header className="bg-secondary border-b border-border py-12 lg:py-20">
 <div className="site-container space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <Link
 to="/articles"
 className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors "
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 All Articles
 </Link>

 {translatedCounterpart && (
 <Link
 to={`/articles/${encodeURIComponent(translatedCounterpart.slug)}`}
 className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors "
 >
 <Languages className="w-3.5 h-3.5" />
 {translatedCounterpart.language === 'bn' ? 'বাংলায় পড়ুন' : 'Read in English'}
 </Link>
 )}
 </div>

 <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground font-mono">
 <Badge variant="outline">{article.category}</Badge>
 <Badge variant="secondary">
 {article.language === 'bn' ? 'বাংলা' : 'English'}
 </Badge>
 <span>{article.publishedDate}</span>
 <span aria-hidden="true">&middot;</span>
 <span>{article.readTimeMinutes} min read</span>
 {article.locationName && (
 <>
 <span aria-hidden="true">&middot;</span>
 <span>{article.locationName}</span>
 </>
 )}
 </div>

 <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-[1.12] text-foreground">
 {article.title}
 </h1>

 <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
 {article.excerpt}
 </p>

 <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border">
 <p className="text-sm font-medium text-foreground">
 By {article.authorName || 'Razaul Hafiz Rahi'}
 </p>

 <div className="flex items-center gap-2">
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleCopyShareLink}
 icon={copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
 >
 {copiedLink ? 'Link Copied' : 'Share'}
 </Button>
 <a
 href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
 >
 Facebook
 </a>
 </div>
 </div>
 </div>
 </header>

 {/* Featured Cover Photograph */}
 <figure className="site-container mt-10 lg:mt-14">
 <div className="aspect-[16/9] rounded-md overflow-hidden bg-muted border border-border ">
 <img
 src={article.coverImageUrl}
 alt={article.title}
 className="w-full h-full object-cover"
 />
 </div>
 {article.coverCaption && (
 <figcaption className="text-xs sm:text-sm text-muted-foreground mt-3 italic text-center">
 {article.coverCaption}
 </figcaption>
 )}
 </figure>

 {/* Rich Editorial Body */}
 <div className="site-container py-12 lg:py-16 max-w-4xl">
 <div
 className="article-prose"
 dangerouslySetInnerHTML={{ __html: sanitizedBody }}
 />

 {/* Tags */}
 {article.tags && article.tags.length > 0 && (
 <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
 {article.tags.map((tag) => (
 <span
 key={tag}
 className="rounded-md bg-secondary border border-border px-3 py-1 text-xs font-mono text-muted-foreground"
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
 className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6"
 >
 {prevArticle ? (
 <Link
 to={`/articles/${encodeURIComponent(prevArticle.slug)}`}
 className="group p-5 bg-card border border-border rounded-md hover:border-primary/40 transition-colors text-left"
 >
 <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
 <ArrowLeft className="w-3.5 h-3.5" /> Previous Note
 </p>
 <h4 className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-1.5 line-clamp-1">
 {prevArticle.title}
 </h4>
 </Link>
 ) : <div />}

 {nextArticle && (
 <Link
 to={`/articles/${encodeURIComponent(nextArticle.slug)}`}
 className="group p-5 bg-card border border-border rounded-md hover:border-primary/40 transition-colors text-right"
 >
 <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-end gap-1.5">
 Next Note <ArrowRight className="w-3.5 h-3.5" />
 </p>
 <h4 className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-1.5 line-clamp-1">
 {nextArticle.title}
 </h4>
 </Link>
 )}
 </nav>
 )}
 </div>

 {/* Related Articles */}
 {relatedArticles.length > 0 && (
 <section className="bg-secondary border-t border-border py-16 lg:py-24">
 <div className="site-container space-y-10">
 <div>
 <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
 Keep Reading
 </p>
 <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1">
 Related Field Dispatches
 </h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
 {relatedArticles.map((rel) => (
 <Link
 key={rel.id}
 to={`/articles/${encodeURIComponent(rel.slug)}`}
 className="group bg-card border border-border rounded-md overflow-hidden flex flex-col hover:border-primary/40 transition-all "
 >
 <div className="aspect-[16/10] overflow-hidden bg-muted">
 <img
 src={rel.coverImageUrl}
 alt={rel.title}
 loading="lazy"
 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
 />
 </div>
 <div className="p-5 space-y-2">
 <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
 <span>{rel.category}</span>
 <span>{rel.language === 'bn' ? 'বাংলা' : 'English'}</span>
 </div>
 <h3 className="text-lg font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
 {rel.title}
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
};

