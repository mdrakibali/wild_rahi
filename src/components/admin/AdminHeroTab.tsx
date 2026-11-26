'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import type { HeroSlide } from '../../types/portfolio';
import { ImageDropzone } from '../ui/ImageDropzone';

interface AdminHeroTabProps {
  slides: HeroSlide[];
  busy: boolean;
  onSave: (slide: HeroSlide) => Promise<void>;
  onDelete: (id: string, label: string) => void;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
  setBusy: (busy: boolean) => void;
}

const emptySlide = (count: number): HeroSlide => ({
  id: '',
  image: '',
  altText: '',
  sortOrder: count + 1,
  isPublished: true,
});

export const AdminHeroTab: React.FC<AdminHeroTabProps> = ({
  slides,
  busy,
  onSave,
  onDelete,
  onNotify,
  setBusy,
}) => {
  const [draft, setDraft] = useState<HeroSlide>(() => emptySlide(slides.length));
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.image.trim()) {
      onNotify('Hero image is required.', 'err');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...draft,
        id: editingId || '',
      });
      setDraft(emptySlide(slides.length + 1));
      setEditingId(null);
      onNotify(editingId ? 'Hero image updated.' : 'Hero image added.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save hero slide.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    setBusy(true);
    try {
      const reordered = [...slides];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIdx, 0, moved);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].sortOrder !== i + 1) {
          await onSave({ ...reordered[i], sortOrder: i + 1 });
        }
      }
      onNotify('Hero slide order updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to reorder slides.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePublish = async (slide: HeroSlide) => {
    setBusy(true);
    try {
      await onSave({ ...slide, isPublished: !slide.isPublished });
      onNotify(slide.isPublished ? 'Hero slide unpublished.' : 'Hero slide published.');
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
          Homepage Composition
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Hero Images
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-foreground">
            {editingId ? 'Edit Hero Image' : 'Add Hero Image'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft(emptySlide(slides.length));
              }}
              className="rounded-md border border-border hover:bg-secondary px-3.5 py-1 text-xs cursor-pointer"
            >
              + New Slide
            </button>
          )}
        </div>

        <ImageDropzone
          label="Hero Photograph *"
          value={draft.image}
          onChange={(url, path) => setDraft((s) => ({ ...s, image: url, storagePath: path }))}
          folder="hero"
          helperText="Upload a high-resolution wildlife photograph for the homepage hero."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className={labelCls}>Alt Text / Caption (Optional)</label>
            <input
              className={inputCls}
              value={draft.altText}
              onChange={(e) => setDraft((s) => ({ ...s, altText: e.target.value }))}
              placeholder="e.g. Pied Kingfisher hovering over morning river mist in North Bengal"
            />
          </div>
          <div>
            <label className={labelCls}>Sort Order</label>
            <input
              type="number"
              className={inputCls}
              value={draft.sortOrder}
              onChange={(e) => setDraft((s) => ({ ...s, sortOrder: Number(e.target.value) || 1 }))}
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isPublished}
            onChange={(e) => setDraft((s) => ({ ...s, isPublished: e.target.checked }))}
          />
          Published on Homepage Hero
        </label>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {editingId ? 'Update Hero Image' : 'Save Hero Image'}
          </button>
        </div>
      </form>

      <div className="bg-card border border-border divide-y divide-border rounded-md overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No hero images configured yet.
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={slide.image}
                  alt={slide.altText || 'Hero slide'}
                  className="w-24 h-14 object-cover rounded bg-muted shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold truncate">
                    {slide.altText || `Hero Slide #${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order #{slide.sortOrder} &middot;{' '}
                    <span className={slide.isPublished ? 'text-primary font-medium' : ''}>
                      {slide.isPublished ? 'Published' : 'Hidden'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(slide)}
                  disabled={busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary cursor-pointer"
                  title={slide.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {slide.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
                  disabled={index === slides.length - 1 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(slide.id);
                    setDraft(slide);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(slide.id, slide.altText || `Hero Slide #${index + 1}`)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-red-50 text-red-600 cursor-pointer"
                  aria-label="Delete hero slide"
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

