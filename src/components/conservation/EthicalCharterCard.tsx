import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface EthicalPrinciple {
  title: string;
  body: string;
}

export const ETHICAL_PRINCIPLES: EthicalPrinciple[] = [
  {
    title: 'Zero Disturbance, Zero Baiting',
    body: 'No live bait, audio call playback during nesting season, or flash photography on nocturnal reptiles and owls. Every frame waits on natural behavior.',
  },
  {
    title: 'Geolocation Protection',
    body: 'Exact GPS coordinates of threatened species, nesting colonies, and fishing cat corridors are stripped from EXIF headers and never published publicly.',
  },
  {
    title: 'Habitat-First Storytelling',
    body: 'Showing an animal within its wider forest, wetland, or tidal channel communicates why ecosystem protection matters more than isolated trophy portraits.',
  },
  {
    title: 'Local Community Respect',
    body: 'Field work relies on local boatmen, forest guides, and wetland fishermen whose livelihoods and knowledge are essential to long-term conservation.',
  },
];

interface EthicalCharterCardProps {
  item: EthicalPrinciple;
}

export const EthicalCharterCard: React.FC<EthicalCharterCardProps> = ({ item }) => {
  return (
    <div className="bg-secondary border border-border rounded-2xl p-8 space-y-3.5 hover:border-foreground/30 transition-colors">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-xs">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">
        {item.title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {item.body}
      </p>
    </div>
  );
};
