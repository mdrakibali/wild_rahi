import React, { Suspense } from 'react';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { ContactHeader } from '@/components/contact/ContactHeader';
import { ContactDirectChannels } from '@/components/contact/ContactDirectChannels';
import type { SiteProfile } from '@/types/portfolio';

export const ContactPage: React.FC<{ profile: SiteProfile }> = ({ profile }) => {
  return (
    <div className="bg-background text-foreground pt-20">
      <ContactHeader />

      <section className="site-container py-14 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <Suspense fallback={<div className="h-[460px] rounded-lg border border-border bg-card" />}>
              <EnquiryForm photographerName={profile.photographerName} />
            </Suspense>
          </div>

          <ContactDirectChannels profile={profile} />
        </div>
      </section>
    </div>
  );
};
