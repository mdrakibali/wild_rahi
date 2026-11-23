import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Expand } from 'lucide-react';
import type { Photograph, Species } from '../../types/portfolio';
import { Badge } from '../ui/Badge';
import { getAspectRatioClass } from '../../lib/validation';

interface SpeciesDetailViewProps {
 species: Species;
 relatedPhotos: Photograph[];
 onInspectPhoto: (index: number) => void;
}

export const SpeciesDetailView: React.FC<SpeciesDetailViewProps> = ({
 species,
 relatedPhotos,
 onInspectPhoto,
}) => {
 return (
 <div className="bg-background text-foreground pt-20">
 <div className="site-container py-12 lg:py-16">
 <Link
 to="/wildlife"
 className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors mb-10 "
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Back to Wildlife Archive
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
 <div className="lg:col-span-6">
 <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted border border-border ">
 <img
 src={species.coverImageUrl}
 alt={species.commonName}
 className="w-full h-full object-cover"
 />
 </div>
 </div>

 <div className="lg:col-span-6 space-y-6">
 <div className="space-y-2">
 <Badge variant="conservation" status={species.conservationStatus}>
 {species.conservationStatus}
 </Badge>
 <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight leading-[1.08]">
 {species.commonName}
 </h1>
 <p className="text-lg italic text-muted-foreground">{species.scientificName}</p>
 {species.bengaliName && (
 <p className="text-xl font-serif font-semibold text-primary" lang="bn">
 {species.bengaliName}
 </p>
 )}
 </div>

 <p className="text-base text-foreground/85 leading-relaxed">
 {species.description}
 </p>

 <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
 <div className="bg-card p-4 rounded-md border border-border">
 <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
 Location &amp; Region
 </dt>
 <dd className="text-sm font-medium mt-1 text-foreground">
 {species.habitat} ({species.habitatRegion})
 </dd>
 </div>
 <div className="bg-card p-4 rounded-md border border-border">
 <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
 Conservation Source
 </dt>
 <dd className="text-sm font-medium mt-1 text-foreground">{species.conservationSource}</dd>
 </div>
 {species.seasonality && (
 <div className="bg-card p-4 rounded-md border border-border">
 <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
 Field Seasonality
 </dt>
 <dd className="text-sm mt-1 text-foreground/85">
 {species.seasonality}
 </dd>
 </div>
 )}
 {species.dietAndBehavior && (
 <div className="bg-card p-4 rounded-md border border-border">
 <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
 Behavior &amp; Ecology
 </dt>
 <dd className="text-sm mt-1 text-foreground/85">
 {species.dietAndBehavior}
 </dd>
 </div>
 )}
 </dl>

 {species.keyThreats && (
 <div className="p-5 bg-secondary border border-border rounded-md space-y-1.5">
 <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
 Documented Threats &amp; Pressures
 </h3>
 <p className="text-sm text-foreground/85 leading-relaxed">
 {species.keyThreats}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Related Field Plates */}
 {relatedPhotos.length > 0 && (
 <div className="mt-20 pt-16 border-t border-border space-y-8">
 <div>
 <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
 Curated Plates
 </p>
 <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1">
 Documented Field Sightings
 </h2>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {relatedPhotos.map((photo, idx) => (
 <button
 key={photo.id}
 type="button"
 onClick={() => onInspectPhoto(idx)}
 className="group text-left block w-full focus:outline-none cursor-pointer"
 aria-label={`Inspect ${photo.title}`}
 >
 <div
 className={`relative rounded-md overflow-hidden bg-muted ${getAspectRatioClass(
 photo.aspectRatio
 )}`}
 >
 <img
 src={photo.imageUrl}
 alt={photo.title}
 loading="lazy"
 className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
 />
 <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-obsidian/80 backdrop-blur-xs text-white px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
 <Expand className="w-3.5 h-3.5" />
 Inspect Plate
 </span>
 </div>
 <div className="pt-3 flex items-baseline justify-between gap-3">
 <p className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors">
 {photo.title}
 </p>
 <span className="text-xs font-mono text-muted-foreground">{photo.year}</span>
 </div>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

