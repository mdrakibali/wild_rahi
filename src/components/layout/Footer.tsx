import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../common/SocialIcons';

export const Footer: React.FC<{ profile: SiteProfile }> = ({ profile }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-white border-t border-white/10">
      <div className="site-container pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-8 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-serif font-semibold tracking-tight text-white">
                {profile.brandName || 'Wild Rahi'}
              </span>
            </Link>
            <p className="text-sm text-white/65 max-w-md leading-relaxed">
              Wildlife photography, visual stories, and field films across Bangladesh by{' '}
              <span className="text-white">{profile.photographerName}</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/85 px-3.5 py-2 text-xs tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="Facebook Profile"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/85 px-3.5 py-2 text-xs tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="Instagram Profile"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/85 px-3.5 py-2 text-xs tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="YouTube Channel"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/85 px-3.5 py-2 text-xs tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="TikTok Profile"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                  TikTok
                </a>
              )}
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/85 px-3.5 py-2 text-xs tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="Send Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-4 md:justify-self-end space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-medium">
              Navigation
            </p>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-white transition-colors">
                  Video
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition-colors">
                  Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>
            &copy; {year} {profile.photographerName} &middot; {profile.brandName}
          </p>
          <p>Bangladesh Wildlife Photography</p>
        </div>
      </div>
    </footer>
  );
};
