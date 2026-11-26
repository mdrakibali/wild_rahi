import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../common/SocialIcons';

export const Footer: React.FC<{ profile: SiteProfile }> = ({ profile }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-white border-t border-white/10">
      <div className="site-container pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-block">
              <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                {profile.brandName || 'Wild Rahi'}
              </span>
            </Link>
            <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
              Independent wildlife photography, field videos, and visual stories across the
              mangroves, haors, forests, and rivers of Bangladesh by{' '}
              <span className="text-white font-medium">{profile.photographerName}</span>.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-obsidian px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                Enquire or Collaborate
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wider hover:border-white/55 hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wider hover:border-white/55 hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wider hover:border-white/55 hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="TikTok Profile"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                  TikTok
                </a>
              )}
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wider hover:border-white/55 hover:text-white transition-colors"
                  aria-label="Send Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 font-semibold">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
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

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 font-semibold">
              Collections
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/gallery?category=birds" className="hover:text-white transition-colors">
                  Birds of Bangladesh
                </Link>
              </li>
              <li>
                <Link href="/gallery?category=mammals" className="hover:text-white transition-colors">
                  Bengal Mammals
                </Link>
              </li>
              <li>
                <Link href="/gallery?category=reptiles" className="hover:text-white transition-colors">
                  Reptiles &amp; Snakes
                </Link>
              </li>
              <li>
                <Link href="/gallery?category=landscapes" className="hover:text-white transition-colors">
                  Sundarbans &amp; Haors
                </Link>
              </li>
              <li>
                <Link href="/gallery?category=others" className="hover:text-white transition-colors">
                  Others
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 font-semibold">
              Field Ethos
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Living subjects precede photographs. Sensitive breeding coordinates and nesting sites
              across Bangladesh remain undisclosed to protect wildlife habitats.
            </p>
            <div className="pt-1 text-xs text-white/45 font-mono">
              Base: {profile.location || 'Bangladesh'}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            &copy; {year} {profile.photographerName} / {profile.brandName}. All rights reserved.
          </p>
          <p className="text-white/40">Dedicated to the wildlife and biodiversity of Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
};
