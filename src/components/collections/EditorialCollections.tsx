'use client';

import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '../../types/portfolio';

interface EditorialCollectionsProps {
 collections: Collection[];
 countsByCollection: Record<string, number>;
}

export const EditorialCollections: React.FC<EditorialCollectionsProps> = ({
 collections,
 countsByCollection,
}) => {
 const featured = collections.slice(0, 4);

 return (
 <section className="bg-card text-foreground py-24 lg:py-32 border-t border-border">
 <div className="site-container">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
 <div className="max-w-2xl space-y-3">
 <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
 Curated Portfolios
 </p>
 <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.14]">
 Featured Photography Collections
 </h2>
 <p className="text-base text-muted-foreground leading-relaxed">
 Long-term visual series organized by ecological group and landscape rhythm across
 Bangladesh.
 </p>
 </div>
 <Link
 to="/albums"
 className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-primary hover:text-white transition-colors self-start md:self-auto"
 >
 View All Albums
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
 {featured.map((collection, idx) => {
 const count = countsByCollection[collection.id] ?? 0;
 const isWide = idx === 0 || idx === 3;
 return (
 <Link
 key={collection.id}
 to={`/albums/${encodeURIComponent(collection.slug || collection.id)}`}
 className={`group block ${isWide ? 'md:col-span-7' : 'md:col-span-5'}`}
 >
 <div
 className={`overflow-hidden bg-muted ${
 isWide ? 'aspect-[16/10]' : 'aspect-[4/3]'
 }`}
 >
 <img
 src={collection.coverImageUrl}
 alt={collection.title}
 loading="lazy"
 className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
 />
 </div>
 <div className="pt-5 flex items-start justify-between gap-4">
 <div className="space-y-1.5">
 <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground group-hover:opacity-75 transition-opacity">
 {collection.title}
 </h3>
 <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
 {collection.description}
 </p>
 </div>
 <span className="shrink-0 text-xs font-mono text-muted-foreground pt-1.5">
 {count} {count === 1 ? 'plate' : 'plates'}
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 );
};
