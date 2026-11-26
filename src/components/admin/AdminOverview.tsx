'use client';

import React from 'react';
import { BookOpen, Camera, Image as ImageIcon, Inbox, Plus, Video } from 'lucide-react';
import type { Enquiry, HeroSlide, Photograph, Story, VideoItem } from '../../types/portfolio';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminOverviewProps {
  heroSlides: HeroSlide[];
  photographs: Photograph[];
  videos: VideoItem[];
  stories: Story[];
  enquiries: Enquiry[];
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  heroSlides,
  photographs,
  videos,
  stories,
  enquiries,
  onNavigateTab,
}) => {
  const publishedSlides = heroSlides.filter((s) => s.isPublished).length;
  const publishedPhotos = photographs.filter((p) => p.isPublished).length;
  const publishedVideos = videos.filter((v) => v.isPublished).length;
  const publishedStories = stories.filter((s) => s.isPublished).length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;

  const stats = [
    {
      label: 'Hero Images',
      value: heroSlides.length,
      sub: `${publishedSlides} published`,
      icon: ImageIcon,
      tab: 'hero',
    },
    {
      label: 'Photographs',
      value: photographs.length,
      sub: `${publishedPhotos} published`,
      icon: Camera,
      tab: 'photographs',
    },
    {
      label: 'Videos',
      value: videos.length,
      sub: `${publishedVideos} published`,
      icon: Video,
      tab: 'videos',
    },
    {
      label: 'Stories',
      value: stories.length,
      sub: `${publishedStories} published`,
      icon: BookOpen,
      tab: 'stories',
    },
    {
      label: 'Messages',
      value: enquiries.length,
      sub: `${unreadEnquiries} unread`,
      icon: Inbox,
      tab: 'messages',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Studio Dashboard
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
            Portfolio Overview
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('photographs')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Photograph
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('stories')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Write Story
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('videos')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Video
          </Button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
          {photographs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No photographs added yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {photographs.slice(0, 5).map((photo) => (
                <div key={photo.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-12 h-12 rounded object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{photo.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{photo.category}</p>
                    </div>
                  </div>
                  <Badge variant={photo.isPublished ? 'default' : 'secondary'}>
                    {photo.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-card border border-border rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-foreground">Latest Messages</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Open inbox &rarr;
            </button>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No messages received yet. Submissions from the Contact page will appear here.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {enquiries.slice(0, 4).map((enq) => (
                <div key={enq.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{enq.name}</p>
                    <Badge variant="outline">{enq.status}</Badge>
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
