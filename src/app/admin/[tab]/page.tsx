import { AdminPage, type AdminTab } from '@/views/AdminPage';

interface TabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function AdminTabPage({ params }: TabPageProps) {
  const { tab } = await params;

  let mappedTab: AdminTab = 'overview';
  if (tab === 'photographs' || tab === 'photos') mappedTab = 'photographs';
  else if (tab === 'articles' || tab === 'stories') mappedTab = 'articles';
  else if (tab === 'videos') mappedTab = 'videos';
  else if (tab === 'collections') mappedTab = 'collections';
  else if (tab === 'wildlife' || tab === 'species') mappedTab = 'wildlife';
  else if (tab === 'locations' || tab === 'profile' || tab === 'content') mappedTab = 'content';
  else if (tab === 'enquiries') mappedTab = 'enquiries';
  else if (tab === 'settings') mappedTab = 'settings';

  return <AdminPage initialTab={mappedTab} />;
}
