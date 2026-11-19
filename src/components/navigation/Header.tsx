'use client';

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router-compat';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

const NAV_ITEMS = [
  { label: 'Photography', to: '/photography' },
  { label: 'Wildlife', to: '/wildlife' },
  { label: 'Videos', to: '/videos' },
  { label: 'Articles', to: '/articles' },
  { label: 'Conservation', to: '/conservation' },
  { label: 'About', to: '/about' },
];

export const Header: React.FC = () => {
  const { profile } = usePortfolio();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomeHero = location.pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
          isHomeHero
            ? 'bg-gradient-to-b from-[#0B0B0B]/70 to-transparent text-[#FFFFFF]'
            : 'bg-[#FFFFFF]/95 backdrop-blur-sm text-[#171717] border-b border-[#E7E7E2]'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="group inline-flex flex-col leading-none focus:outline-none"
            aria-label="Wild Rahi — Home"
          >
            <span className="text-xl sm:text-2xl font-semibold tracking-tight">
              {profile.brandName || 'Wild Rahi'}
            </span>
            <span
              className={`text-[11px] tracking-[0.14em] uppercase mt-0.5 transition-colors ${
                isHomeHero ? 'text-[#FFFFFF]/70' : 'text-[#686868]'
              }`}
            >
              {profile.photographerName || 'Razaul Hafiz Rahi'}
            </span>
          </Link>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(`${item.to}/`));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative text-[15px] font-medium transition-colors py-1 ${
                    isHomeHero
                      ? active
                        ? 'text-[#FFFFFF]'
                        : 'text-[#FFFFFF]/80 hover:text-[#FFFFFF]'
                      : active
                      ? 'text-[#171717]'
                      : 'text-[#686868] hover:text-[#171717]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] ${
                        isHomeHero ? 'bg-[#FFFFFF]' : 'bg-[#171717]'
                      }`}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              to="/contact"
              className={`ml-2 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                isHomeHero
                  ? 'bg-[#FFFFFF] text-[#0B0B0B] hover:bg-[#F0F0EC]'
                  : 'bg-[#171717] text-[#FFFFFF] hover:bg-[#333333]'
              }`}
            >
              Contact
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
              isHomeHero
                ? 'border-[#FFFFFF]/30 text-[#FFFFFF] hover:bg-[#FFFFFF]/10'
                : 'border-[#E7E7E2] text-[#171717] hover:bg-[#F7F7F4]'
            }`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-[#FFFFFF] text-[#171717] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="px-5 sm:px-8 h-20 flex items-center justify-between border-b border-[#E7E7E2]">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="inline-flex flex-col leading-none"
              >
                <span className="text-xl font-semibold tracking-tight">
                  {profile.brandName || 'Wild Rahi'}
                </span>
                <span className="text-[11px] tracking-[0.14em] uppercase text-[#686868] mt-0.5">
                  {profile.photographerName}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#E7E7E2] text-[#171717] hover:bg-[#F7F7F4]"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-10 flex flex-col justify-between">
              <div className="space-y-2">
                {[{ label: 'Home', to: '/' }, ...NAV_ITEMS].map((item, idx) => {
                  const active =
                    location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(`${item.to}/`));
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.035 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-2.5 text-3xl font-medium tracking-tight transition-colors ${
                          active ? 'text-[#171717]' : 'text-[#686868] hover:text-[#171717]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-[#E7E7E2] space-y-5">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#171717] text-[#FFFFFF] px-7 py-3 text-sm font-medium"
                  >
                    Start a Conversation
                  </Link>
                  <a
                    href={profile.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[#E7E7E2] text-[#171717] px-6 py-3 text-sm font-medium hover:bg-[#F7F7F4]"
                  >
                    Facebook
                  </a>
                </div>
                <p className="text-xs text-[#686868]">
                  Bangladesh Wildlife &amp; Biodiversity Documentation
                </p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
