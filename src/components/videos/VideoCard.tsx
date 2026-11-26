import React from 'react';
import { Play } from 'lucide-react';
import type { VideoItem } from '@/types/portfolio';
import { PortfolioImage } from '@/components/common/PortfolioImage';

interface VideoCardProps {
  video: VideoItem;
  onPlay: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  return (
    <article className="group flex flex-col rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 hover:border-foreground/25 hover:shadow-md">
      <button
        type="button"
        onClick={onPlay}
        className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian text-left focus:outline-none cursor-pointer"
        aria-label={`Play video: ${video.title}`}
      >
        <PortfolioImage
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-obsidian/10 transition-colors flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/95 text-obsidian shadow-md transition-transform duration-300 group-hover:scale-110">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </span>
        </div>
      </button>

      <div className="p-5 space-y-2 flex-1 flex flex-col">
        <h3 className="text-xl font-serif font-semibold tracking-tight text-foreground leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </article>
  );
};
