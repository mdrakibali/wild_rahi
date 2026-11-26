import type { Metadata } from 'next';
import { getCachedPublicPortfolio } from '@/lib/cache';
import { PhotoDetailPage } from '@/views/PhotoDetailPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { photographs } = await getCachedPublicPortfolio();
  const photo = photographs.find((p) => p.id === slug);

  if (!photo) {
    return { title: 'Photograph — Wild Rahi' };
  }

  return {
    title: `${photo.title} — Wild Rahi`,
    description: photo.description || 'Wildlife photography by Razaul Hafiz Rahi.',
    openGraph: {
      title: `${photo.title} — Wild Rahi`,
      description: photo.description || 'Wildlife photography by Razaul Hafiz Rahi.',
      images: [photo.image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const { photographs } = await getCachedPublicPortfolio();

  return <PhotoDetailPage slug={slug} photographs={photographs} />;
}
