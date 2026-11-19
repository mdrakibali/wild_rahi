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
      label: 'Total Photographs',
      value: photographs.length,
      sub: `${publishedPhotos} published`,
      icon: Camera,
      tab: 'photographs',
    },
    {
      label: 'Published Articles',
      value: publishedArticles,
      sub: `${draftArticles} in draft`,
      icon: FileText,
      tab: 'articles',
    },
    {
      label: 'Published Videos',
      value: publishedVideos,
      sub: `${videos.length} total links`,
      icon: Video,
      tab: 'videos',
    },
    {
      label: 'Gallery Categories',
      value: collections.length,
      sub: `${species.length} species dossiers`,
      icon: FolderOpen,
      tab: 'collections',
    },
    {
      label: 'Enquiries Inbox',
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
          <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
            Studio Overview
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
            Editorial &amp; Archive Summary
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('photographs')}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#171717] text-[#FFFFFF] px-4 py-2 text-xs font-medium hover:bg-[#333333] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Photos
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('articles')}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#171717]/20 bg-[#FFFFFF] text-[#171717] px-4 py-2 text-xs font-medium hover:bg-[#F0F0EC] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Write Article
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('videos')}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#171717]/20 bg-[#FFFFFF] text-[#171717] px-4 py-2 text-xs font-medium hover:bg-[#F0F0EC] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Video Link
          </button>
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
              className="text-left bg-[#FFFFFF] border border-[#E7E7E2] hover:border-[#171717]/40 p-5 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-[#686868]">
                <span className="text-xs font-medium">{item.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-[#171717]">{item.value}</p>
                <p className="text-xs text-[#686868] mt-0.5">{item.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Content Updates + Latest Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E7E7E2] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Articles &amp; Drafts</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('articles')}
              className="text-xs font-medium text-[#686868] hover:text-[#171717]"
            >
              Manage all &rarr;
            </button>
          </div>
          <div className="divide-y divide-[#E7E7E2]">
            {recentArticles.map((art) => (
              <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#171717] truncate" lang={art.language}>
                    {art.title}
                  </p>
                  <p className="text-xs text-[#686868]">
                    {art.category} &middot; {art.language === 'bn' ? 'বাংলা' : 'English'} &middot;{' '}
                    {art.publishedDate}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-medium ${
                    art.published
                      ? 'bg-[#171717] text-[#FFFFFF]'
                      : 'bg-[#F0F0EC] text-[#686868]'
                  }`}
                >
                  {art.published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E7E7E2] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Latest Enquiries</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-medium text-[#686868] hover:text-[#171717]"
            >
              Open inbox &rarr;
            </button>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-[#686868] py-6">
              No enquiries received yet. Submissions from the Contact page will appear here.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E7E2]">
              {enquiries.slice(0, 4).map((enq) => (
                <div key={enq.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#171717] truncate">{enq.name}</p>
                    <span className="rounded-full bg-[#F0F0EC] px-2.5 py-0.5 text-[11px] text-[#171717] capitalize">
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#686868] truncate">{enq.subject}</p>
                </div>
              ))}
            </div>
          )}

          {databaseInfo && (
            <div className="pt-4 border-t border-[#E7E7E2] text-xs text-[#686868]">
              Database Engine:{' '}
              <strong className="text-[#171717]">
                {databaseInfo.engine === 'mongodb'
                  ? `MongoDB (${databaseInfo.databaseName})`
                  : 'MongoDB-Compatible Persistent Local Store'}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
