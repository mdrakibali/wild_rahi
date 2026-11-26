'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import type { VideoItem } from '../../types/portfolio';
import { parseVideoUrl, PLATFORM_LABELS } from '../../lib/videoEmbed';
import { ImageDropzone } from '../ui/ImageDropzone';

interface AdminVideosTabProps {
  videos: VideoItem[];
  fallbackThumb?: string;
  busy: boolean;
  onSave: (video: VideoItem) => Promise<void>;
  onDelete: (id: string, title: string) => void;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
  setBusy: (busy: boolean) => void;
}

const emptyVideo = (count: number): VideoItem => ({
  id: '',
  title: '',
  description: '',
  videoUrl: '',
  thumbnail: '',
  platform: 'youtube',
  embedUrl: null,
  isFeatured: true,
  isPublished: true,
  sortOrder: count + 1,
});

export const AdminVideosTab: React.FC<AdminVideosTabProps> = ({
  videos,
  fallbackThumb = '',
  busy,
  onSave,
  onDelete,
  onNotify,
  setBusy,
}) => {
  const [draft, setDraft] = useState<VideoItem>(() => emptyVideo(videos.length));
  const [editingId, setEditingId] = useState<string | null>(null);

  const parsedPreview = useMemo(
    () => (draft.videoUrl.trim() ? parseVideoUrl(draft.videoUrl) : null),
    [draft.videoUrl]
  );

  const handleVideoUrlChange = (url: string) => {
    const parsed = parseVideoUrl(url);
    setDraft((prev) => ({
      ...prev,
      videoUrl: url,
      platform: parsed.platform || prev.platform,
      embedUrl: parsed.embedUrl,
      thumbnail:
        prev.thumbnail.trim() || !parsed.thumbnailUrl ? prev.thumbnail : parsed.thumbnailUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseVideoUrl(draft.videoUrl);
    if (!parsed.valid || !parsed.platform) {
      onNotify(
        parsed.error || 'Please enter a valid YouTube, Facebook, Instagram, or TikTok URL.',
        'err'
      );
      return;
    }
    if (!draft.title.trim()) {
      onNotify('Please enter a video title.', 'err');
      return;
    }
    setBusy(true);
    try {
      const thumb = draft.thumbnail.trim() || parsed.thumbnailUrl || fallbackThumb;
      await onSave({
        ...draft,
        id: editingId || '',
        platform: parsed.platform,
        embedUrl: parsed.embedUrl,
        thumbnail: thumb,
      });
      setDraft(emptyVideo(videos.length + 1));
      setEditingId(null);
      onNotify(editingId ? 'Video updated.' : 'Video saved.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save video.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= videos.length) return;
    setBusy(true);
    try {
      const reordered = [...videos];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIdx, 0, moved);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].sortOrder !== i + 1) {
          await onSave({ ...reordered[i], sortOrder: i + 1 });
        }
      }
      onNotify('Video order updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Reorder failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePublish = async (vid: VideoItem) => {
    setBusy(true);
    try {
      await onSave({ ...vid, isPublished: !vid.isPublished });
      onNotify(vid.isPublished ? 'Video moved to draft.' : 'Video published.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to update status.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full bg-card border border-border rounded-md px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary';
  const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5';

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
          YouTube &middot; Facebook &middot; Instagram &middot; TikTok
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Videos
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-foreground">
            {editingId ? 'Edit Video' : 'Add Video'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyVideo(videos.length));
              }}
              className="rounded-md border border-border hover:bg-secondary px-3.5 py-1 text-xs cursor-pointer"
            >
              + New Video
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className={labelCls}>Video URL *</label>
            <input
              type="url"
              className={inputCls}
              value={draft.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Facebook / Instagram / TikTok link"
            />
          </div>
          <div className="md:col-span-4">
            <label className={labelCls}>Platform</label>
            <div className="h-[38px] px-3.5 rounded-md bg-secondary border border-border flex items-center text-sm font-medium">
              {parsedPreview
                ? parsedPreview.valid
                  ? `${parsedPreview.platformLabel}`
                  : 'Invalid URL'
                : 'Paste a URL'}
            </div>
          </div>
        </div>

        {parsedPreview && parsedPreview.valid && (
          <div className="bg-secondary border border-border rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Preview ({parsedPreview.platformLabel})</span>
              <a
                href={draft.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground font-medium hover:underline"
              >
                {parsedPreview.fallbackLabel}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {parsedPreview.canEmbed && parsedPreview.embedUrl && (
              <div className="max-w-md aspect-video bg-obsidian">
                <iframe
                  src={parsedPreview.embedUrl}
                  title="Video embed preview"
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className={labelCls}>Title *</label>
          <input
            className={inputCls}
            value={draft.title}
            onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))}
            placeholder="e.g. Winter Migratory Birds Along the Padma Charlands"
          />
        </div>

        <ImageDropzone
          label="Video Thumbnail (Optional — auto-detected for YouTube)"
          value={draft.thumbnail}
          onChange={(url, path) => setDraft((v) => ({ ...v, thumbnail: url, thumbnailPath: path }))}
          folder="videos"
        />

        <div>
          <label className={labelCls}>Short Description</label>
          <textarea
            rows={2}
            className={inputCls}
            value={draft.description}
            onChange={(e) => setDraft((v) => ({ ...v, description: e.target.value }))}
            placeholder="Brief description shown under the video..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(e) => setDraft((v) => ({ ...v, isPublished: e.target.checked }))}
            />
            Published
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={(e) => setDraft((v) => ({ ...v, isFeatured: e.target.checked }))}
            />
            Featured on Homepage Slider
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {editingId ? 'Update Video' : 'Save Video'}
        </button>
      </form>

      <div className="bg-card border border-border divide-y divide-border rounded-md overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No videos added yet.</div>
        ) : (
          videos.map((vid, index) => (
            <div
              key={vid.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-24 h-14 object-cover bg-obsidian rounded shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
                      {PLATFORM_LABELS[vid.platform]}
                    </span>
                    <p className="text-sm font-semibold truncate">{vid.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vid.isPublished ? 'Published' : 'Draft'}
                    {vid.isFeatured && ' · Featured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(vid)}
                  disabled={busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary cursor-pointer"
                  title={vid.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {vid.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === videos.length - 1 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(vid.id);
                    setDraft(vid);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(vid.id, vid.title)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-red-50 text-red-600 cursor-pointer"
                  aria-label="Delete video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

