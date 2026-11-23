'use client';

import React from 'react';
import {
  Camera,
  FileText,
  FolderOpen,
  Inbox,
  Plus,
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
  species: Species[];
  articles: Article[];
  videos: VideoItem[];
  enquiries: Enquiry[];
  databaseInfo: DatabaseInfo | null;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  photographs,
  collections,
  species,
  articles,
  videos,
  enquiries,
  databaseInfo,
  onNavigateTab,
}) => {
  const publishedPhotos = photographs.filter((p) => p.published).length;
  const publishedArticles = articles.filter((a) => a.published).length;
  const draftArticles = articles.filter((a) => !a.published).length;
  const publishedVideos = videos.filter((v) => v.published).length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;

  const stats = [
    {
      label: 'Photographs',
      value: photographs.length,
      sub: `${publishedPhotos} published`,
      icon: Camera,
      tab: 'photographs',
    },
    {
      label: 'Articles',
      value: publishedArticles,
      sub: `${draftArticles} in draft`,
      icon: FileText,
      tab: 'articles',
    },
    {
      label: 'Videos',
      value: publishedVideos,
      sub: `${videos.length} links`,
      icon: Video,
      tab: 'videos',
    },
    {
      label: 'Categories',
      value: collections.length,
      sub: `${species.length} species`,
      icon: FolderOpen,
      tab: 'collections',
    },
    {
      label: 'Enquiries',
      value: enquiries.length,
      sub: `${unreadEnquiries} unread`,
      icon: Inbox,
      tab: 'enquiries',
    },
  ];

  const recentArticles = [...articles]
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Studio Overview
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
            Editorial &amp; Archive Summary
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
            onClick={() => onNavigateTab('articles')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Write Article
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigateTab(item.tab)}
              className="text-left bg-card border border-border hover:border-foreground/50 p-5 rounded-2xl transition-all space-y-3 shadow-xs hover:shadow-sm cursor-pointer group"
            >
              <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
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

      {/* Recent Content Updates + Latest Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-foreground">Recent Articles &amp; Drafts</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('articles')}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Manage all &rarr;
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentArticles.map((art) => (
              <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" lang={art.language}>
                    {art.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {art.category} &middot; {art.language === 'bn' ? 'বাংলা' : 'English'} &middot;{' '}
                    {art.publishedDate}
                  </p>
                </div>
                <Badge variant={art.published ? 'default' : 'secondary'}>
                  {art.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-foreground">Latest Enquiries</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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

          {databaseInfo && (
            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              Storage Engine:{' '}
              <strong className="text-foreground font-semibold">
                PostgreSQL (Drizzle ORM)
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
