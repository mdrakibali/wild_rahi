import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { StoriesPage } from '@/views/StoriesPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { stories } = await getCachedPublicPortfolio();
  const decoded = decodeURIComponent(slug);
  const story = stories.find((s) => s.isPublished && (s.slug === decoded || s.id === decoded));

  if (!story) {
    return { title: 'Story — Wild Rahi' };
  }

  return {
    title: `${story.title} — Wild Rahi`,
    description: story.shortDescription || 'Wildlife story by Razaul Hafiz Rahi.',
    openGraph: {
      title: `${story.title} — Wild Rahi`,
      description: story.shortDescription || 'Wildlife story by Razaul Hafiz Rahi.',
      images: [story.coverImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { stories } = await getCachedPublicPortfolio();

  return <StoriesPage stories={stories} slug={decodeURIComponent(slug)} />;
}
