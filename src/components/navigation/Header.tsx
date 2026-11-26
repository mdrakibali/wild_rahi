'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useScrollLock } from '@/lib/useScrollLock';
import type { SiteProfile } from '@/types/portfolio';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Video', href: '/videos' },
  { label: 'Story', href: '/stories' },
  { label: 'Contact', href: '/contact' },
];

export const Header: React.FC<{ profile: SiteProfile }> = ({ profile }) => {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomeHero = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useScrollLock(mobileOpen);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
          isHomeHero
            ? 'bg-gradient-to-b from-obsidian/80 via-obsidian/35 to-transparent text-white'
            : 'bg-card/95 backdrop-blur-md text-foreground border-b border-border'
        }`}
      >
        <div className="site-container h-20 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="group inline-flex flex-col leading-none focus:outline-none"
            aria-label="Wild Rahi — Home"
          >
            <span className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
              {profile.brandName || 'Wild Rahi'}
            </span>
            <span
              className={`text-[10px] tracking-[0.2em] uppercase mt-1 transition-colors ${
                isHomeHero ? 'text-white/70' : 'text-muted-foreground'
              }`}
            >
              {profile.photographerName || 'Razaul Hafiz Rahi'}
            </span>
          </Link>

          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[13px] tracking-[0.06em] uppercase transition-colors py-1.5 ${
                    isHomeHero
                      ? active
                        ? 'text-white font-semibold'
                        : 'text-white/75 hover:text-white'
                      : active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-[1.5px] rounded-full ${
                        isHomeHero ? 'bg-white' : 'bg-foreground'
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors cursor-pointer ${
              isHomeHero
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background text-foreground flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="px-5 sm:px-8 h-20 flex items-center justify-between border-b border-border">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="inline-flex flex-col leading-none"
            >
              <span className="text-xl font-serif font-semibold tracking-tight">
                {profile.brandName || 'Wild Rahi'}
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-1">
                {profile.photographerName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground hover:bg-secondary cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-between">
            <div className="space-y-3">
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2.5 text-3xl font-serif tracking-tight transition-colors ${
                      active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-8 border-t border-border space-y-4">
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="block text-sm text-foreground hover:underline"
                >
                  {profile.contactEmail}
                </a>
              )}
              <p className="text-xs text-muted-foreground tracking-wide">
                {profile.location || 'Thakurgaon, Rangpur, North Bengal'}
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
