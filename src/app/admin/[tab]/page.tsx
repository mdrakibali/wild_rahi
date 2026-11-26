import { AdminPage, type AdminTab } from '@/views/AdminPage';

export function generateStaticParams() {
  return [
    { tab: 'overview' },
    { tab: 'hero' },
    { tab: 'photographs' },
    { tab: 'photos' },
    { tab: 'videos' },
    { tab: 'stories' },
    { tab: 'profile' },
    { tab: 'messages' },
    { tab: 'enquiries' },
    { tab: 'settings' },
  ];
}

interface TabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function AdminTabPage({ params }: TabPageProps) {
  const { tab } = await params;

  let mappedTab: AdminTab = 'overview';
  if (tab === 'hero') mappedTab = 'hero';
  else if (tab === 'photographs' || tab === 'photos') mappedTab = 'photographs';
  else if (tab === 'videos') mappedTab = 'videos';
  else if (tab === 'stories') mappedTab = 'stories';
  else if (tab === 'profile') mappedTab = 'profile';
  else if (tab === 'messages' || tab === 'enquiries') mappedTab = 'messages';
  else if (tab === 'settings') mappedTab = 'settings';

  return <AdminPage initialTab={mappedTab} />;
}
