'use client';

import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { EnquiryForm } from '../components/forms/EnquiryForm';
import { ContactHeader } from '../components/contact/ContactHeader';
import { ContactDirectChannels } from '../components/contact/ContactDirectChannels';

export const ContactPage: React.FC = () => {
  const { profile } = usePortfolio();

  useEffect(() => {
    document.title = 'Contact — Wild Rahi';
  }, []);

  return (
    <div className="bg-background text-foreground pt-20">
      <ContactHeader />

      <section className="site-container py-14 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>

          <ContactDirectChannels profile={profile} />
        </div>
      </section>
    </div>
  );
};
