'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/layout/Footer';
import { PhotoModal } from '@/components/photography/PhotoModal';
import { LightboxProvider } from '@/context/LightboxContext';
import type { Photograph, SiteProfile } from '@/types/portfolio';

interface AppShellProps {
  profile: SiteProfile;
  photographs: Photograph[];
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ profile, photographs, children }) => {
  const pathname = usePathname() || '/';
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <LightboxProvider photographs={photographs}>
      <Header profile={profile} />
      <main className="min-h-screen">{children}</main>
      <Footer profile={profile} />
      <PhotoModal />
    </LightboxProvider>
  );
};
