import React from 'react';
import { Link } from '@/lib/router-compat';
import type { Article } from '../../types/portfolio';
import { Badge } from '../ui/Badge';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link
      to={`/articles/${encodeURIComponent(article.slug)}`}
      lang={article.language}
      className="group flex flex-col border border-border bg-card rounded-lg overflow-hidden hover:border-primary/40 transition-all shadow-xs hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={article.coverImageUrl}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
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
  );
};

