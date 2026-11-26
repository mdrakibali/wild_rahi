import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { StoriesPage } from '@/views/StoriesPage';

export const metadata: Metadata = {
  title: 'Stories — Wild Rahi',
  description: 'Personal dispatches and photo essays from wild habitats across Bangladesh.',
};

export default async function Page() {
  const { stories } = await getCachedPublicPortfolio();
  return <StoriesPage stories={stories} />;
}
