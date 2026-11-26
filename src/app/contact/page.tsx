import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { ContactPage } from '@/views/ContactPage';

export const metadata: Metadata = {
  title: 'Contact — Wild Rahi',
  description: 'Get in touch with wildlife photographer Razaul Hafiz Rahi.',
};

export default async function Page() {
  const { profile } = await getCachedPublicPortfolio();
  return <ContactPage profile={profile} />;
}
