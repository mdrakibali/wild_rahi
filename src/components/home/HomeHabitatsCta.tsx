import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SiteProfile } from '@/types/portfolio';

interface HabitatFocus {
  title: string;
  tag: string;
  description: string;
  href: string;
}

const HABITAT_FOCUSES: HabitatFocus[] = [
  {
    title: 'Wetlands & Rivers',
    tag: 'Wetlands',
    description: 'Seasonal beels, river banks, and freshwater marshes across North Bengal.',
    href: '/gallery?category=wetlands',
  },
  {
    title: 'Birds',
    tag: 'Birds',
    description: 'Resident kingfishers, raptors, and seasonal waterfowl.',
    href: '/gallery?category=birds',
  },
  {
    title: 'Flora & Woodlands',
    tag: 'Flora',
    description: 'Sal groves, roadside hedgerows, and native wild blooms.',
    href: '/gallery?category=flora',
  },
  {
    title: 'Insects & Macro',
    tag: 'Insects',
    description: 'Butterflies, dragonflies, and small insects photographed outdoors.',
    href: '/gallery?category=insects',
  },
];

export const HomeHabitatsCta: React.FC<{ profile: SiteProfile }> = ({ profile }) => {
  return (
    <section className="bg-background text-foreground py-20 lg:py-24 border-t border-border">
      <div className="site-container space-y-12">
        <div className="border-b border-border pb-7">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              05 &middot; Field Areas
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-semibold tracking-tight leading-[1.12] text-foreground">
              Browse by Habitat &amp; Subject
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Fieldwork across Thakurgaon and neighbouring northern districts in natural light.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HABITAT_FOCUSES.map((item) => (
            <Link
              key={item.tag}
              href={item.href}
              className="group rounded-lg border border-border bg-card p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-foreground/30 hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-2.5">
                <span className="inline-block text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-0.5 rounded-lg bg-secondary text-muted-foreground border border-border">
                  {item.tag}
                </span>
                <h3 className="text-xl font-serif font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground">
                View Photos
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-7 sm:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Contact
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-foreground">
              Get in Touch with {profile.photographerName || 'Razaul Hafiz Rahi'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For photo inquiries, collaborations, or prints, write directly through the contact page.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors self-start lg:self-auto shrink-0"
          >
            Contact
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
