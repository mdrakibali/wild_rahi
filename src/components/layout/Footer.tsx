import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowUpRight, Mail } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '../common/SocialIcons';

export const Footer: React.FC = () => {
  const { profile } = usePortfolio();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-white border-t border-white/10">
      <div className="site-container pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block">
              <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                {profile.brandName || 'Wild Rahi'}
              </span>
            </Link>
            <p className="text-base text-white/70 max-w-md leading-relaxed">
              Independent wildlife photography, field documentation, and biodiversity essays across
              the mangroves, haors, forests, and rivers of Bangladesh by{' '}
              <span className="text-white font-medium">{profile.photographerName}</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-white text-obsidian px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                Enquire or Collaborate
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 text-white px-3.5 py-2 text-xs font-semibold tracking-wider hover:border-white/50 transition-colors"
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
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 text-white px-3.5 py-2 text-xs font-semibold tracking-wider hover:border-white/50 transition-colors"
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
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 text-white px-3.5 py-2 text-xs font-semibold tracking-wider hover:border-white/50 transition-colors"
                  aria-label="YouTube Channel"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                  YouTube
                </a>
              )}
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 text-white px-3.5 py-2 text-xs font-semibold tracking-wider hover:border-white/50 transition-colors"
                  aria-label="Send Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50 font-semibold">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/albums" className="hover:text-white transition-colors">
                  Albums
                </Link>
              </li>
              <li>
                <Link to="/videos" className="hover:text-white transition-colors">
                  Video Showcase
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Rahi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50 font-semibold">
              Studio
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Biography &amp; Gear
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Print &amp; Licensing
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-white/50 hover:text-white">
                  Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50 font-semibold">
              Field Ethos
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Living subjects precede photographs. Sensitive breeding coordinates and nesting sites
              across Bangladesh remain undisclosed to protect wildlife habitats.
            </p>
            <div className="pt-2 text-xs text-white/40 font-mono">
              Base: {profile.locationBase || profile.location} &middot; IUCN Field Standards
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {year} {profile.photographerName} / {profile.brandName}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-white/40">
            Dedicated to the wildlife and biodiversity of Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
};
