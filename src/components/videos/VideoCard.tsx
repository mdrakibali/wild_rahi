import React from 'react';
import { Play } from 'lucide-react';
import { PLATFORM_LABELS } from '../../lib/videoEmbed';
import type { VideoItem } from '../../types/portfolio';

interface VideoCardProps {
  video: VideoItem;
  onPlay: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  return (
    <article className="group bg-card border border-border rounded-md overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={onPlay}
        className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian text-left focus:outline-none cursor-pointer"
        aria-label={`Open video player for ${video.title}`}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-obsidian/20 flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-white text-obsidian">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </span>
        </div>
        <span className="absolute top-3 left-3 rounded-md bg-obsidian/85 backdrop-blur-xs text-white px-2.5 py-0.5 text-[10px] font-mono tracking-wider">
          {PLATFORM_LABELS[video.platform]}
        </span>
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground font-mono">
            {video.category} &middot; {video.publishedDate}
          </p>
          <h3 className="text-lg font-serif font-bold tracking-tight text-foreground leading-snug line-clamp-2">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>
    </article>
  );
};
