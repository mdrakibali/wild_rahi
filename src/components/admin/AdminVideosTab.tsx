'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Info, Loader2, Save, Trash2 } from 'lucide-react';
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
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const parsedPreview = useMemo(
    () => (draft.videoUrl.trim() ? parseVideoUrl(draft.videoUrl) : null),
    [draft.videoUrl]
  );

  // Auto-fetch oEmbed title & TikTok/YouTube thumbnail when a supported link is pasted
  useEffect(() => {
    const trimmed = draft.videoUrl.trim();
    if (!parsedPreview?.valid) return;
    if (parsedPreview.platform !== 'tiktok' && parsedPreview.platform !== 'youtube') return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setFetchingMeta(true);
      try {
        let token: string | null = null;
        try {
          token = window.sessionStorage.getItem('wildrahi_admin_token');
        } catch {
          token = null;
        }
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch('/api/admin/video-meta', {
          method: 'POST',
          headers,
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({ url: trimmed }),
        });
        if (!res.ok) return;
        const meta = (await res.json()) as {
          thumbnailUrl?: string | null;
          title?: string | null;
        };
        setDraft((prev) => {
          if (prev.videoUrl.trim() !== trimmed) return prev;
          return {
            ...prev,
            thumbnail: prev.thumbnail.trim() ? prev.thumbnail : meta.thumbnailUrl || prev.thumbnail,
            title: prev.title.trim() ? prev.title : meta.title || prev.title,
          };
        });
      } catch {
        // Silent cancel or timeout; user can still fill manually
      } finally {
        if (!controller.signal.aborted) {
          setFetchingMeta(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
      setFetchingMeta(false);
    };
  }, [draft.videoUrl, parsedPreview?.valid, parsedPreview?.platform]);

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
    'w-full bg-card border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary';
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

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
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
              className="rounded-lg border border-border hover:bg-secondary px-3.5 py-1 text-xs cursor-pointer"
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
            <div className="h-[38px] px-3.5 rounded-lg bg-secondary border border-border flex items-center justify-between text-sm font-medium">
              <span>
                {parsedPreview
                  ? parsedPreview.valid
                    ? `${parsedPreview.platformLabel} (${parsedPreview.embedAspect})`
                    : 'Invalid URL'
                  : 'Paste a URL'}
              </span>
              {fetchingMeta && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            </div>
          </div>
        </div>

        {parsedPreview && parsedPreview.valid && (
          <div className="bg-secondary border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Embed Preview ({parsedPreview.platformLabel} &middot; {parsedPreview.embedAspect})
              </span>
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
            {parsedPreview.canEmbed && parsedPreview.embedUrl ? (
              <div
                className={
                  parsedPreview.embedAspect === '9:16'
                    ? 'max-w-[260px] aspect-[9/16] bg-obsidian rounded-lg overflow-hidden'
                    : 'max-w-md aspect-video bg-obsidian rounded-lg overflow-hidden'
                }
              >
                <iframe
                  src={parsedPreview.embedUrl}
                  title="Video embed preview"
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Inline preview is unavailable for this link format — visitors can open it directly via the button above.
              </p>
            )}
            {parsedPreview.limitationNote && (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{parsedPreview.limitationNote}</span>
              </p>
            )}
          </div>
        )}

        <div>
          <label className={labelCls}>Title *</label>
          <input
            className={inputCls}
            value={draft.title}
            onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))}
            placeholder="e.g. Pied Kingfisher Hovering Above Atrai River"
          />
        </div>

        <div className="space-y-2">
          <ImageDropzone
            label="Video Thumbnail (Auto for YouTube / full TikTok · Upload recommended for Facebook / Instagram)"
            value={draft.thumbnail}
            onChange={(url, path) => setDraft((v) => ({ ...v, thumbnail: url, thumbnailPath: path }))}
            folder="videos"
          />
          {parsedPreview?.valid && !draft.thumbnail.trim() && !fetchingMeta && (
            <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                No automatic thumbnail is exposed by {parsedPreview.platformLabel} for this link. Upload a thumbnail above so the video card is visible on the site.
              </span>
            </p>
          )}
        </div>

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
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {editingId ? 'Update Video' : 'Save Video'}
        </button>
      </form>

      <div className="bg-card border border-border divide-y divide-border rounded-lg overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No videos added yet.</div>
        ) : (
          videos.map((vid, index) => (
            <div
              key={vid.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                {vid.thumbnail ? (
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-24 h-14 object-cover bg-obsidian rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-24 h-14 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                    No Thumb
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium">
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
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary cursor-pointer"
                  title={vid.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {vid.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === videos.length - 1 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
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
                  className="rounded-lg border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(vid.id, vid.title)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border hover:bg-red-50 text-red-600 cursor-pointer"
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

