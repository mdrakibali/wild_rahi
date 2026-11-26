import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../common/SocialIcons';

interface ContactDirectChannelsProps {
  profile: SiteProfile;
}

export const ContactDirectChannels: React.FC<ContactDirectChannelsProps> = ({ profile }) => {
  return (
    <aside className="lg:col-span-5 space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-6">
        <h2 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
          Direct Channels
        </h2>

        <div className="divide-y divide-border border-y border-border text-sm">
          <div className="py-4 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">
              <Mail className="w-4 h-4" />
              Email
            </span>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="text-foreground font-medium hover:underline"
            >
              {profile.contactEmail}
            </a>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">
              <MapPin className="w-4 h-4" />
              Based in
            </span>
            <span className="text-foreground font-medium">{profile.location || 'Bangladesh'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {profile.facebookUrl && (
            <a
              href={profile.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
              Facebook
            </a>
          )}
          {profile.instagramUrl && (
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              Instagram
            </a>
          )}
          {profile.youtubeUrl && (
            <a
              href={profile.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <YoutubeIcon className="w-3.5 h-3.5" />
              YouTube
            </a>
          )}
          {profile.tiktokUrl && (
            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <TikTokIcon className="w-3.5 h-3.5" />
              TikTok
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};
