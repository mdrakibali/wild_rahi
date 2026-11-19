'use client';

import React, { useEffect } from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EnquiryForm } from '../components/forms/EnquiryForm';

export const ContactPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = 'Contact & Enquiries — Wild Rahi';
  }, []);

  return (
    <div className="bg-[#FFFFFF] text-[#171717] pt-20">
      <section className="bg-[#F7F7F4] border-b border-[#E7E7E2] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#686868] font-medium">
            Commissions, Licensing &amp; Conservation
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08]">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-[#686868] max-w-2xl leading-relaxed">
            Write directly for wildlife photography commissions, editorial licensing, archival
            prints, or biodiversity documentation collaborations across Bangladesh.
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <EnquiryForm theme="light" />
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-7 space-y-5">
              <h2 className="text-xl font-semibold tracking-tight">Direct Channels</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#686868] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#686868]">Email</p>
                    <a
                      href={`mailto:${profile.contactEmail}`}
                      className="text-[#171717] font-medium hover:underline"
                    >
                      {profile.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#686868] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#686868]">Base</p>
                    <p className="text-[#171717] font-medium">
                      {profile.locationBase || profile.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E7E2] flex flex-wrap gap-2.5">
                {profile.facebookUrl && (
                  <a
                    href={profile.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#171717] text-[#FFFFFF] px-5 py-2 text-xs font-medium hover:bg-[#333333] transition-colors"
                  >
                    Facebook
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] text-[#171717] px-5 py-2 text-xs font-medium hover:bg-[#F0F0EC] transition-colors"
                  >
                    Instagram
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {profile.youtubeUrl && (
                  <a
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] text-[#171717] px-5 py-2 text-xs font-medium hover:bg-[#F0F0EC] transition-colors"
                  >
                    YouTube
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {profile.tiktokUrl && (
                  <a
                    href={profile.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] text-[#171717] px-5 py-2 text-xs font-medium hover:bg-[#F0F0EC] transition-colors"
                  >
                    TikTok
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-[#F0F0EC] border border-[#E7E7E2] p-7 space-y-2.5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#686868] font-medium">
                Response Window
              </p>
              <p className="text-sm text-[#171717]/85 leading-relaxed">
                Field assignments in the Sundarbans, northeastern haors, and hill tracts often have
                limited network connectivity. Replies are typically sent within 2&ndash;4 days.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
