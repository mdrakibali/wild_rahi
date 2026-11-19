import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Footer: React.FC = () => {
  const { profile } = usePortfolio();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0B0B] text-[#FFFFFF] border-t border-[#FFFFFF]/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#FFFFFF]/12">
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
                {profile.brandName || 'Wild Rahi'}
              </span>
            </Link>
            <p className="text-base text-[#FFFFFF]/70 max-w-md leading-relaxed">
              Independent wildlife photography, field documentation, and biodiversity essays across
              the mangroves, haors, forests, and rivers of Bangladesh by{' '}
              <span className="text-[#FFFFFF]">{profile.photographerName}</span>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#FFFFFF] text-[#0B0B0B] px-6 py-2.5 text-sm font-medium hover:bg-[#F0F0EC] transition-colors"
              >
                Enquire or Collaborate
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/25 text-[#FFFFFF] px-5 py-2.5 text-sm font-medium hover:border-[#FFFFFF]/60 transition-colors"
              >
                Facebook
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#FFFFFF]/50 font-medium">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-[#FFFFFF]/80">
              <li>
                <Link to="/photography" className="hover:text-[#FFFFFF] transition-colors">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/wildlife" className="hover:text-[#FFFFFF] transition-colors">
                  Wildlife Archive
                </Link>
              </li>
              <li>
                <Link to="/videos" className="hover:text-[#FFFFFF] transition-colors">
                  Video Showcase
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-[#FFFFFF] transition-colors">
                  Articles &amp; Essays
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#FFFFFF]/50 font-medium">
              Practice
            </p>
            <ul className="space-y-2.5 text-sm text-[#FFFFFF]/80">
              <li>
                <Link to="/conservation" className="hover:text-[#FFFFFF] transition-colors">
                  Conservation Ethics
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FFFFFF] transition-colors">
                  About Rahi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFFFFF] transition-colors">
                  Contact &amp; Licensing
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#FFFFFF] transition-colors">
                  Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3.5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#FFFFFF]/50 font-medium">
              Channels &amp; Field Base
            </p>
            <p className="text-sm text-[#FFFFFF]/75">{profile.location || 'Bangladesh'}</p>
            <p className="text-sm text-[#FFFFFF]/75">{profile.contactEmail}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              {profile.facebookUrl && (
                <a
                  href={profile.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#FFFFFF]/20 px-3.5 py-1.5 text-xs text-[#FFFFFF]/85 hover:border-[#FFFFFF]/60 transition-colors"
                >
                  Facebook
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#FFFFFF]/20 px-3.5 py-1.5 text-xs text-[#FFFFFF]/85 hover:border-[#FFFFFF]/60 transition-colors"
                >
                  Instagram
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {profile.youtubeUrl && (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#FFFFFF]/20 px-3.5 py-1.5 text-xs text-[#FFFFFF]/85 hover:border-[#FFFFFF]/60 transition-colors"
                >
                  YouTube
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {profile.tiktokUrl && (
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#FFFFFF]/20 px-3.5 py-1.5 text-xs text-[#FFFFFF]/85 hover:border-[#FFFFFF]/60 transition-colors"
                >
                  TikTok
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FFFFFF]/55">
          <p>
            &copy; {year} {profile.photographerName} ({profile.brandName}). All photographs and field
            notes protected by copyright.
          </p>
          <p>Sensitive wildlife coordinates are intentionally withheld for species protection.</p>
        </div>
      </div>
    </footer>
  );
};
