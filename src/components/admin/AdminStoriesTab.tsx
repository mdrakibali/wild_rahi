'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import type { Story } from '../../types/portfolio';
import { toSafeSlug } from '../../lib/validation';
import { ImageDropzone } from '../ui/ImageDropzone';
import { ArticleRichEditor } from './ArticleRichEditor';

interface AdminStoriesTabProps {
  stories: Story[];
  busy: boolean;
  onSave: (story: Story) => Promise<void>;
  onDelete: (id: string, title: string) => void;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
  setBusy: (busy: boolean) => void;
}

const emptyStory = (): Story => ({
  id: '',
  title: '',
  slug: '',
  shortDescription: '',
  coverImage: '',
  content: {},
  contentHtml: '<p></p>',
  images: [],
  isPublished: false,
  isFeatured: true,
});

export const AdminStoriesTab: React.FC<AdminStoriesTabProps> = ({
  stories,
  busy,
  onSave,
  onDelete,
  onNotify,
  setBusy,
}) => {
  const [draft, setDraft] = useState<Story>(emptyStory);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async (publishOverride?: boolean) => {
    if (!draft.title.trim()) {
      onNotify('Please enter a story title.', 'err');
      return;
    }
    if (!draft.coverImage.trim()) {
      onNotify('Please upload a cover image for this story.', 'err');
      return;
    }
    setBusy(true);
    try {
      const nextPublished =
        typeof publishOverride === 'boolean' ? publishOverride : draft.isPublished;
      const safeSlug = toSafeSlug(draft.slug || draft.title, 72);
      await onSave({
        ...draft,
        id: editingId || '',
        slug: safeSlug,
        isPublished: nextPublished,
      });
      onNotify(nextPublished ? 'Story published.' : 'Story draft saved.');
      if (!editingId) {
        setDraft(emptyStory());
      } else {
        setDraft((prev) => ({ ...prev, isPublished: nextPublished, slug: safeSlug }));
      }
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save story.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePublish = async (story: Story) => {
    setBusy(true);
    try {
      await onSave({ ...story, isPublished: !story.isPublished });
      onNotify(story.isPublished ? 'Story unpublished.' : 'Story published.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to update status.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleMoveStoryImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.images.length) return;
    const next = [...draft.images];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setDraft((s) => ({ ...s, images: next }));
  };

  const inputCls =
    'w-full bg-card border border-border rounded-md px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary';
  const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
            Editorial Photo Essays
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
            Stories
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setDraft(emptyStory());
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-medium cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Story
        </button>
      </div>

      <div className="bg-card border border-border rounded-md p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Story Title *</label>
            <input
              className={inputCls}
              value={draft.title}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  title: e.target.value,
                  slug: editingId ? s.slug : toSafeSlug(e.target.value, 72),
                }))
              }
              placeholder="e.g. Dawn Along the Tidal Creeks of Sundarbans"
            />
          </div>
          <div>
            <label className={labelCls}>URL Slug</label>
            <input
              className={inputCls}
              value={draft.slug}
              onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))}
              placeholder="dawn-along-tidal-creeks"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Short Description</label>
          <textarea
            rows={2}
            className={inputCls}
            value={draft.shortDescription}
            onChange={(e) => setDraft((s) => ({ ...s, shortDescription: e.target.value }))}
            placeholder="Brief summary displayed on the homepage story slider and stories listing..."
          />
        </div>

        <ImageDropzone
          label="Cover Photograph *"
          value={draft.coverImage}
          onChange={(url, path) =>
            setDraft((s) => ({ ...s, coverImage: url, coverImagePath: path }))
          }
          folder="stories"
        />

        <div>
          <label className={labelCls}>Story Content (Tiptap Rich Editor)</label>
          <ArticleRichEditor
            value={draft.contentHtml}
            onChange={(html, json) =>
              setDraft((s) => ({ ...s, contentHtml: html, content: json }))
            }
            title={draft.title}
          />
        </div>

        {/* Multiple Story Photographs */}
        <div className="pt-4 border-t border-border space-y-4">
          <div>
            <label className={labelCls}>Story Photographs (Multiple Images)</label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload multiple photographs to display naturally inside this story.
            </p>
            <ImageDropzone
              multiple={true}
              folder="stories/gallery"
              onMultipleUpload={(uploaded) => {
                const newUrls = uploaded.map((u) => u.imageUrl);
                setDraft((s) => ({ ...s, images: [...s.images, ...newUrls] }));
                onNotify(`Added ${newUrls.length} photograph(s) to story.`);
              }}
            />
          </div>

          {draft.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {draft.images.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="group relative aspect-[4/3] rounded border border-border overflow-hidden bg-muted"
                >
                  <img
                    src={imgUrl}
                    alt={`Story image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStoryImage(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-white hover:text-white/75 disabled:opacity-30 cursor-pointer"
                        aria-label="Move left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStoryImage(idx, 1)}
                        disabled={idx === draft.images.length - 1}
                        className="p-1 text-white hover:text-white/75 disabled:opacity-30 cursor-pointer"
                        aria-label="Move right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((s) => ({
                          ...s,
                          images: s.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={(e) => setDraft((s) => ({ ...s, isFeatured: e.target.checked }))}
            />
            Featured on Homepage Slider
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSave(false)}
              className="rounded-md border border-border hover:bg-secondary px-5 py-2.5 text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update & Publish' : 'Publish Story'}
            </button>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="bg-card border border-border divide-y divide-border rounded-md overflow-hidden">
        {stories.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No stories written yet.</div>
        ) : (
          stories.map((story) => (
            <div
              key={story.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-20 h-14 object-cover rounded bg-muted shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold truncate">{story.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    /stories/{story.slug} &middot; {story.images.length} extra photos &middot;{' '}
                    <span className={story.isPublished ? 'text-primary font-medium' : ''}>
                      {story.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(story)}
                  disabled={busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary cursor-pointer"
                  title={story.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {story.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                {story.isPublished && (
                  <Link
                    href={`/stories/${encodeURIComponent(story.slug)}`}
                    className="rounded-lg border border-border hover:bg-secondary px-3 py-1.5 text-xs"
                  >
                    View
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(story.id);
                    setDraft(story);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(story.id, story.title)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-red-50 text-red-600 cursor-pointer"
                  aria-label="Delete story"
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

