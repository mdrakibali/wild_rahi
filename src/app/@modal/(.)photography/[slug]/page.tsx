import { PhotoModal } from '@/components/photography/PhotoModal';

interface InterceptedPhotoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InterceptedPhotoPage({ params }: InterceptedPhotoPageProps) {
  const { slug } = await params;
  return <PhotoModal slug={slug} />;
}
