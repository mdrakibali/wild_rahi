'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  Camera,
  FolderOpen,
  Inbox,
  Plus,
  TrendingUp,
  Video,
} from 'lucide-react';
import type {
  Article,
  Collection,
  DatabaseInfo,
  Enquiry,
  Photograph,
  Species,
  VideoItem,
} from '../../types/portfolio';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminOverviewProps {
  photographs: Photograph[];
  collections: Collection[];
  species?: Species[];
  articles?: Article[];
  videos: VideoItem[];
  enquiries: Enquiry[];
  databaseInfo?: DatabaseInfo | null;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  photographs,
  collections,
  videos,
  enquiries,
  onNavigateTab,
}) => {
  const publishedPhotos = photographs.filter((p) => p.published).length;
  const publishedVideos = videos.filter((v) => v.published).length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;

  // Group photographs dynamically by Month & Year for monthly visibility
  const monthlyBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; count: number; photos: Photograph[] }>();

    photographs.forEach((photo) => {
      let label = photo.month;
      if (!label && photo.createdAt) {
        const d = new Date(photo.createdAt);
        if (!isNaN(d.getTime())) {
          label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
      }
      if (!label && photo.year) {
        label = photo.year.length === 4 ? `${photo.year} Archive` : photo.year;
      }
      if (!label) {
        label = 'Recent Uploads';
      }

      const existing = map.get(label);
      if (existing) {
        existing.count += 1;
        if (existing.photos.length < 5) existing.photos.push(photo);
      } else {
        map.set(label, {
          label,
          count: 1,
          photos: [photo],
        });
      }
    });

    return Array.from(map.values());
  }, [photographs]);

  // Current active period count
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' });
  const currentMonthGroup = monthlyBreakdown.find((m) =>
    m.label.toLowerCase().includes(currentMonthName.toLowerCase())
  );
  const currentMonthCount = currentMonthGroup ? currentMonthGroup.count : photographs.length;

  const stats = [
    {
      label: 'Photographs',
      value: photographs.length,
      sub: `${publishedPhotos} published in gallery`,
      icon: Camera,
      tab: 'photographs',
    },
    {
      label: 'Monthly Activity',
      value: currentMonthCount,
      sub: 'Photos in current period',
      icon: Calendar,
      tab: 'photographs',
    },
    {
      label: 'Categories',
      value: collections.length,
      sub: 'Gallery taxonomy',
      icon: FolderOpen,
      tab: 'collections',
    },
    {
      label: 'Field Videos',
      value: videos.length,
      sub: `${publishedVideos} published reels`,
      icon: Video,
      tab: 'videos',
    },
    {
      label: 'Client Messages',
      value: enquiries.length,
      sub: `${unreadEnquiries} unread enquiries`,
      icon: Inbox,
      tab: 'enquiries',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Studio Dashboard
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
            Portfolio &amp; Monthly Activity
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('photographs')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Upload Photos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('collections')}
            icon={<FolderOpen className="w-3.5 h-3.5" />}
          >
            Manage Categories
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('videos')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Video Link
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigateTab(item.tab)}
              className="text-left bg-card border border-border p-5 rounded-md space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Monthly Upload Timeline & Breakdown (Core user request) */}
      <div className="bg-card border border-border rounded-md p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">
                Monthly Photography Activity
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your photography uploads and sharing volume grouped by month
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('photographs')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All Photos
          </Button>
        </div>

        {monthlyBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No photographs uploaded yet. Click &quot;Upload Photos&quot; to begin sharing your work.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyBreakdown.map((group) => (
              <div
                key={group.label}
                className="bg-secondary/40 border border-border rounded-md p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {group.label}
                    </span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {group.count} {group.count === 1 ? 'photo' : 'photos'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((group.count / Math.max(1, photographs.length)) * 100).toFixed(0)}% of total archive
                  </p>
                </div>

                {/* Photo Previews */}
                <div className="flex items-center gap-2 pt-1 overflow-hidden">
                  {group.photos.slice(0, 4).map((p) => (
                    <img
                      key={p.id}
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-12 h-12 rounded object-cover border border-border bg-muted shrink-0"
                    />
                  ))}
                  {group.count > 4 && (
                    <span className="w-12 h-12 rounded border border-border bg-card flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0">
                      +{group.count - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Photographs + Latest Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Photographs */}
        <div className="lg:col-span-7 bg-card border border-border rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-foreground">Recent Photographs</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('photographs')}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Manage all &rarr;
            </button>
          </div>
          <div className="divide-y divide-border">
            {photographs.slice(0, 5).map((photo) => (
              <div key={photo.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-12 h-12 rounded object-cover bg-muted shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {photo.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {photo.speciesName || 'Wildlife'} &middot; {photo.locationName || 'Bangladesh'} &middot; {photo.year}
                    </p>
                  </div>
                </div>
                <Badge variant={photo.published ? 'default' : 'secondary'}>
                  {photo.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Enquiries */}
        <div className="lg:col-span-5 bg-card border border-border rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-foreground">Latest Messages</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Open inbox &rarr;
            </button>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No enquiries received yet. Submissions from the Contact page will appear here.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {enquiries.slice(0, 4).map((enq) => (
                <div key={enq.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{enq.name}</p>
                    <Badge variant="outline">
                      {enq.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{enq.subject}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
