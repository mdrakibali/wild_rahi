import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { Article } from '../../types/portfolio';
import { Badge } from '../ui/Badge';

interface HomeArticlesProps {
  articles: Article[];
}

export const HomeArticles: React.FC<HomeArticlesProps> = ({ articles }) => {
  if (articles.length === 0) return null;

  return (
    <section className="bg-card text-foreground py-20 lg:py-28 border-t border-border">
      <div className="site-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Editorial Journal &middot; English &amp; বাংলা
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.12]">
              Articles &amp; Field Notes
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Field observations and conservation writing from across Bangladesh.
            </p>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors self-start md:self-auto"
          >
            Read All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              to={`/articles/${encodeURIComponent(article.slug)}`}
              lang={article.language}
              className="flex flex-col border border-border bg-card rounded-md overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{article.category}</span>
                    <Badge variant="outline">
                      {article.language === 'bn' ? 'বাংলা' : 'English'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-serif font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>{article.publishedDate} &middot; {article.readTimeMinutes} min read</span>
                  <span className="font-sans font-semibold text-primary">Read &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

