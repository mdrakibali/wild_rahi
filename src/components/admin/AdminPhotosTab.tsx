'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import type { Photograph, WildlifeCategory } from '../../types/portfolio';
import { getWildlifeCategoryLabel, WILDLIFE_CATEGORIES } from '../../lib/validation';
import { ImageDropzone } from '../ui/ImageDropzone';
import { Select } from '../ui/Select';

interface AdminPhotosTabProps {
  photographs: Photograph[];
  busy: boolean;
  onSave: (photo: Photograph) => Promise<void>;
  onDelete: (id: string, title: string) => void;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
  setBusy: (busy: boolean) => void;
}

const emptyPhoto = (count: number): Photograph => ({
  id: '',
  title: '',
  description: '',
  image: '',
  category: 'birds',
  isFeatured: false,
  isPublished: true,
  sortOrder: count + 1,
});

export const AdminPhotosTab: React.FC<AdminPhotosTabProps> = ({
  photographs,
  busy,
  onSave,
  onDelete,
  onNotify,
  setBusy,
}) => {
  const [draft, setDraft] = useState<Photograph>(() => emptyPhoto(photographs.length));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [batchCategory, setBatchCategory] = useState<WildlifeCategory>('birds');

  const handleBatchUpload = async (
    items: Array<{ imageUrl: string; storagePath: string; fileName: string }>
  ) => {
    setBusy(true);
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title =
          item.fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() ||
          'Wildlife Photograph';
        await onSave({
          ...emptyPhoto(photographs.length + i),
          title,
          image: item.imageUrl,
          storagePath: item.storagePath,
          category: batchCategory,
          sortOrder: photographs.length + i + 1,
        });
      }
      onNotify(`Uploaded ${items.length} ${items.length === 1 ? 'photograph' : 'photographs'}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Batch upload failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.image.trim()) {
      onNotify('Photograph title and image are required.', 'err');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...draft,
        id: editingId || '',
      });
      setDraft(emptyPhoto(photographs.length + 1));
      setEditingId(null);
      onNotify(editingId ? 'Photograph updated.' : 'Photograph saved.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save photograph.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= photographs.length) return;
    setBusy(true);
    try {
      const reordered = [...photographs];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIdx, 0, moved);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].sortOrder !== i + 1) {
          await onSave({ ...reordered[i], sortOrder: i + 1 });
        }
      }
      onNotify('Photograph order updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Reorder failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePublish = async (photo: Photograph) => {
    setBusy(true);
    try {
      await onSave({ ...photo, isPublished: !photo.isPublished });
      onNotify(photo.isPublished ? 'Moved to draft.' : 'Photograph published.');
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
          Gallery Archive
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Photographs
        </h2>
      </div>

      {/* Batch Upload */}
      <div className="bg-card border border-border rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-serif font-bold text-foreground">Quick Batch Upload</h3>
            <p className="text-xs text-muted-foreground">
              Drop multiple wildlife photos at once to publish directly to the gallery.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <Select
              label="Category"
              value={batchCategory}
              onChange={(e) => setBatchCategory(e.target.value as WildlifeCategory)}
              options={WILDLIFE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            />
          </div>
        </div>
        <ImageDropzone
          multiple={true}
          folder="photographs"
          onMultipleUpload={handleBatchUpload}
        />
      </div>

      {/* Add / Edit Single Photograph */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-foreground">
            {editingId ? 'Edit Photograph' : 'Add Photograph'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyPhoto(photographs.length));
              }}
              className="rounded-md border border-border hover:bg-secondary px-3.5 py-1 text-xs cursor-pointer"
            >
              + New Photograph
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Title / Name *</label>
            <input
              className={inputCls}
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Canopy Sentinel: Common Kingfisher"
            />
          </div>
          <div>
            <Select
              label="Category *"
              value={draft.category}
              onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value as WildlifeCategory }))}
              options={WILDLIFE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            />
          </div>
        </div>

        <ImageDropzone
          label="Photograph Image *"
          value={draft.image}
          onChange={(url, path) => setDraft((p) => ({ ...p, image: url, storagePath: path }))}
          folder="photographs"
        />

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={2}
            className={inputCls}
            value={draft.description}
            onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
            placeholder="Short caption or story behind this photograph..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(e) => setDraft((p) => ({ ...p, isPublished: e.target.checked }))}
            />
            Published
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={(e) => setDraft((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            Featured on Homepage Sequence
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {editingId ? 'Update Photograph' : 'Save Photograph'}
        </button>
      </form>

      {/* Photographs List */}
      <div className="bg-card border border-border divide-y divide-border rounded-md overflow-hidden">
        {photographs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No photographs uploaded yet.
          </div>
        ) : (
          photographs.map((photo, index) => (
            <div
              key={photo.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-20 h-14 object-cover rounded bg-muted shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold truncate">{photo.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {getWildlifeCategoryLabel(photo.category)} &middot;{' '}
                    <span className={photo.isPublished ? 'text-primary font-medium' : ''}>
                      {photo.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {photo.isFeatured && ' · Featured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(photo)}
                  disabled={busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary cursor-pointer"
                  title={photo.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {photo.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
                  disabled={index === photographs.length - 1 || busy}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary disabled:opacity-30 cursor-pointer"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(photo.id);
                    setDraft(photo);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(photo.id, photo.title)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-red-50 text-red-600 cursor-pointer"
                  aria-label="Delete photograph"
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

