import React from 'react';
import { Link } from '@/lib/router-compat';
import type { Species } from '../../types/portfolio';
import { Badge } from '../ui/Badge';

interface SpeciesCardProps {
  species: Species;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species }) => {
  return (
    <Link
      to={`/wildlife/${encodeURIComponent(species.slug)}`}
      className="group bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-primary/40 transition-all shadow-xs hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={species.coverImageUrl}
          alt={species.commonName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="conservation" status={species.conservationStatus}>
            {species.conservationStatus}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-xl font-serif font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
            {species.commonName}
          </h3>
          <p className="text-xs italic text-muted-foreground">{species.scientificName}</p>
          {species.bengaliName && (
            <p className="text-sm font-medium text-foreground/85" lang="bn">
              {species.bengaliName}
            </p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pt-1">
            {species.description}
          </p>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{species.habitatRegion}</span>
          <span className="font-sans font-semibold text-primary">Dossier &rarr;</span>
        </div>
      </div>
    </Link>
  );
};

