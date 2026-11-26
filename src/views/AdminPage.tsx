'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  Database,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Video,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminHeroTab } from '../components/admin/AdminHeroTab';
import { AdminPhotosTab } from '../components/admin/AdminPhotosTab';
import { AdminVideosTab } from '../components/admin/AdminVideosTab';
import { AdminStoriesTab } from '../components/admin/AdminStoriesTab';
import { AdminProfileTab } from '../components/admin/AdminProfileTab';
import { AdminMessagesTab } from '../components/admin/AdminMessagesTab';
import { AdminSettings } from '../components/admin/AdminSettings';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export type AdminTab =
  | 'overview'
  | 'hero'
  | 'photographs'
  | 'videos'
  | 'stories'
  | 'profile'
  | 'messages'
  | 'settings';

const NAV_TABS: Array<{
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero Images', icon: ImageIcon },
  { id: 'photographs', label: 'Photographs', icon: Camera },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'settings', label: 'Settings', icon: Database },
];

export const AdminPage: React.FC<{ initialTab?: AdminTab }> = ({ initialTab }) => {
  const {
    heroSlides,
    photographs,
    videos,
    stories,
    profile,
    enquiries,
    databaseInfo,
    usingDefaultCredentials,
    adminUser,
    authReady,
    isAdmin,
    signInAdmin,
    signOutAdmin,
    changeAdminPassword,
    saveHeroSlide,
    deleteHeroSlide,
    savePhotograph,
    deletePhotograph,
    saveVideo,
    deleteVideo,
    saveStory,
    deleteStory,
    saveProfile,
    updateEnquiry,
    deleteEnquiry,
    downloadArchiveBackup,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'hero' | 'photograph' | 'video' | 'story' | 'message';
    id: string;
    name: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard — Wild Rahi';
  }, []);

  const notify = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-secondary text-foreground flex items-center justify-center text-sm text-muted-foreground">
        Verifying Wild Rahi studio session...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLogin
        onSignIn={signInAdmin}
        databaseInfo={databaseInfo}
        usingDefaultCredentials={usingDefaultCredentials}
      />
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-secondary text-foreground flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between lg:hidden shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-secondary text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div>
            <p className="text-sm font-semibold tracking-tight leading-none">Wild Rahi</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
              Admin
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          View Site
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-obsidian/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-card border-r border-border p-5 flex flex-col justify-between z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <p className="text-base font-semibold tracking-tight">Wild Rahi Studio</p>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileNavOpen(false);
                      }}
                      className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{adminUser?.name || 'Admin'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email}</p>
              </div>
              <button
                type="button"
                onClick={signOutAdmin}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-border hover:bg-secondary"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 h-screen sticky top-0 flex-col bg-card border-r border-border overflow-y-auto">
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight leading-none">Wild Rahi</p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
              Admin Studio
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl border border-border hover:bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
          >
            View
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <nav className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{adminUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOutAdmin}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-background">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {toast && (
            <div
              role="status"
              className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
                toast.type === 'ok'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {toast.type === 'ok' && <Check className="w-4 h-4 shrink-0" />}
              <span>{toast.text}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <AdminOverview
              heroSlides={heroSlides}
              photographs={photographs}
              videos={videos}
              stories={stories}
              enquiries={enquiries}
              onNavigateTab={(t) => setActiveTab(t as AdminTab)}
            />
          )}

          {activeTab === 'hero' && (
            <AdminHeroTab
              slides={heroSlides}
              busy={busy}
              onSave={saveHeroSlide}
              onDelete={(id, name) => setDeleteTarget({ type: 'hero', id, name })}
              onNotify={notify}
              setBusy={setBusy}
            />
          )}

          {activeTab === 'photographs' && (
            <AdminPhotosTab
              photographs={photographs}
              busy={busy}
              onSave={savePhotograph}
              onDelete={(id, name) => setDeleteTarget({ type: 'photograph', id, name })}
              onNotify={notify}
              setBusy={setBusy}
            />
          )}

          {activeTab === 'videos' && (
            <AdminVideosTab
              videos={videos}
              fallbackThumb={photographs[0]?.image}
              busy={busy}
              onSave={saveVideo}
              onDelete={(id, name) => setDeleteTarget({ type: 'video', id, name })}
              onNotify={notify}
              setBusy={setBusy}
            />
          )}

          {activeTab === 'stories' && (
            <AdminStoriesTab
              stories={stories}
              busy={busy}
              onSave={saveStory}
              onDelete={(id, name) => setDeleteTarget({ type: 'story', id, name })}
              onNotify={notify}
              setBusy={setBusy}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfileTab
              profile={profile}
              busy={busy}
              onSave={saveProfile}
              onNotify={notify}
              setBusy={setBusy}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessagesTab
              enquiries={enquiries}
              onUpdateStatus={updateEnquiry}
              onDelete={(id, name) => setDeleteTarget({ type: 'message', id, name })}
              onNotify={notify}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              databaseInfo={databaseInfo}
              usingDefaultCredentials={usingDefaultCredentials}
              onChangePassword={changeAdminPassword}
              onDownloadBackup={downloadArchiveBackup}
            />
          )}

          <ConfirmModal
            isOpen={deleteTarget !== null}
            loading={deleteBusy}
            itemName={deleteTarget?.name}
            title={`Delete ${
              deleteTarget ? deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1) : 'Item'
            }`}
            description="Are you sure you want to delete this record? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onClose={() => !deleteBusy && setDeleteTarget(null)}
            onConfirm={async () => {
              if (!deleteTarget) return;
              setDeleteBusy(true);
              try {
                if (deleteTarget.type === 'hero') await deleteHeroSlide(deleteTarget.id);
                else if (deleteTarget.type === 'photograph') await deletePhotograph(deleteTarget.id);
                else if (deleteTarget.type === 'video') await deleteVideo(deleteTarget.id);
                else if (deleteTarget.type === 'story') await deleteStory(deleteTarget.id);
                else if (deleteTarget.type === 'message') await deleteEnquiry(deleteTarget.id);
                notify('Record deleted.');
                setDeleteTarget(null);
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Delete failed.', 'err');
              } finally {
                setDeleteBusy(false);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};
