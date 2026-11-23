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
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{article.category}</span>
            <Badge variant="outline">
              {article.language === 'bn' ? 'বাংলা' : 'English'}
            </Badge>
          </div>
          <h3 className="text-xl font-serif font-bold tracking-tight text-foreground leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{article.publishedDate} &middot; {article.readTimeMinutes} min read</span>
          <span className="font-sans font-semibold text-foreground hover:underline">Read &rarr;</span>
        </div>
      </div>
    </Link>
  );
};
