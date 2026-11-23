import React from 'react';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../common/SocialIcons';

interface ContactDirectChannelsProps {
  profile: SiteProfile;
}

export const ContactDirectChannels: React.FC<ContactDirectChannelsProps> = ({ profile }) => {
  return (
    <aside className="lg:col-span-5 space-y-6">
      <div className="bg-secondary border border-border rounded-md p-6 space-y-5">
        <h2 className="text-xl font-serif font-bold tracking-tight text-foreground">Direct Channels</h2>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">Email</p>
              <a
                href={`mailto:${profile.contactEmail}`}
                className="text-foreground font-medium hover:underline transition-colors"
              >
                {profile.contactEmail}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">Base</p>
              <p className="text-foreground font-medium">
                {profile.locationBase || profile.location}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
          {profile.facebookUrl && (
            <a
              href={profile.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
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
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
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
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
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
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <TikTokIcon className="w-3.5 h-3.5" />
              TikTok
            </a>
          )}
        </div>
      </div>

      <div className="bg-muted border border-border rounded-md p-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
          Response Window
        </p>
        <p className="text-xs text-foreground/85 leading-relaxed">
          Field assignments in the Sundarbans, northeastern haors, and hill tracts often have
          limited network connectivity. Replies are typically sent within 2&ndash;4 days.
        </p>
      </div>
    </aside>
  );
};
