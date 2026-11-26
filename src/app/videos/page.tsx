import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { VideosPage } from '@/views/VideosPage';

export const metadata: Metadata = {
  title: 'Videos — Wild Rahi',
  description: 'Wildlife encounters, flight studies, and field videos across Bangladesh.',
};

export default async function Page() {
  const { videos } = await getCachedPublicPortfolio();
  return <VideosPage videos={videos} />;
}
