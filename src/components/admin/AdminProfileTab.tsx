'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Trash2, X } from 'lucide-react';
import type { SiteProfile } from '../../types/portfolio';
import { sanitizeImageUrlList } from '../../lib/validation';
import { ImageDropzone } from '../ui/ImageDropzone';

interface AdminProfileTabProps {
  profile: SiteProfile;
  busy: boolean;
  onSave: (nextProfile: SiteProfile) => Promise<void>;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
  setBusy: (busy: boolean) => void;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  profile,
  busy,
  onSave,
  onNotify,
  setBusy,
}) => {
  const [draft, setDraft] = useState<SiteProfile>(() => ({
    ...profile,
    aboutImages: profile.aboutImages ?? [],
  }));

  useEffect(() => {
    setDraft({
      ...profile,
      aboutImages: profile.aboutImages ?? [],
    });
  }, [profile]);

  const aboutImages = draft.aboutImages ?? [];

  const moveAboutImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= aboutImages.length) return;
    const next = [...aboutImages];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setDraft((p) => ({ ...p, aboutImages: next }));
  };

  const removeAboutImage = (index: number) => {
    setDraft((p) => ({
      ...p,
      aboutImages: (p.aboutImages ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(draft);
      onNotify('Photographer profile updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save profile.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full bg-card border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary';
  const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
            Identity, Bio &amp; Links
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
            Photographer Profile
          </h2>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold tracking-wide disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Save Profile
        </button>
      </div>

      {/* Identity */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h3 className="text-base font-serif font-bold text-foreground border-b border-border pb-3">
          Photographer Identity &amp; Portrait
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 lg:col-span-3 max-w-[200px]">
            <ImageDropzone
              label="Main Portrait (About Page)"
              helperText="Single main image for /about"
              value={draft.portraitUrl}
              onChange={(url) => setDraft((p) => ({ ...p, portraitUrl: url }))}
              folder="profile"
              aspectRatio="portrait"
            />
          </div>

          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Photographer Name</label>
              <input
                className={inputCls}
                value={draft.photographerName}
                onChange={(e) => setDraft((p) => ({ ...p, photographerName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Brand / Studio Name</label>
              <input
                className={inputCls}
                value={draft.brandName}
                onChange={(e) => setDraft((p) => ({ ...p, brandName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                className={inputCls}
                value={draft.location}
                onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>About Page Headline</label>
          <input
            className={inputCls}
            value={draft.bioHeadline}
            onChange={(e) => setDraft((p) => ({ ...p, bioHeadline: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelCls}>Short Biography (Homepage &amp; About)</label>
          <textarea
            rows={3}
            className={inputCls}
            value={draft.bioSummary}
            onChange={(e) => setDraft((p) => ({ ...p, bioSummary: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelCls}>Passion for Wildlife Photography (Homepage About)</label>
          <textarea
            rows={2}
            className={inputCls}
            value={draft.passionNote}
            onChange={(e) => setDraft((p) => ({ ...p, passionNote: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Field Journey (About Page)</label>
            <textarea
              rows={3}
              className={inputCls}
              value={draft.journeyNote}
              onChange={(e) => setDraft((p) => ({ ...p, journeyNote: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Field Philosophy (About Page)</label>
            <textarea
              rows={3}
              className={inputCls}
              value={draft.philosophy}
              onChange={(e) => setDraft((p) => ({ ...p, philosophy: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Homepage About Portfolio Collage */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-foreground">
              Homepage About Portfolio Collage
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload up to 5 portfolio images for the Homepage About 2–3 collage grid. Remaining slots fill automatically from published Gallery photos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground">
              {Math.min(aboutImages.length, 5)} / 5 slots used
            </span>
            {aboutImages.length > 0 && (
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, aboutImages: [] }))}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-destructive/10 hover:text-destructive px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <ImageDropzone
          multiple={true}
          folder="profile/about"
          helperText="Drag & drop or select images (JPEG, PNG, WebP · First 5 appear in Homepage About; click Save Profile to publish)"
          onMultipleUpload={(uploaded) => {
            const added = uploaded.map((u) => u.imageUrl);
            const merged = sanitizeImageUrlList([...aboutImages, ...added], 24);
            setDraft((p) => ({ ...p, aboutImages: merged }));
            onNotify(`Added ${added.length} portfolio image(s). Click Save Profile to publish.`);
          }}
        />

        {aboutImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {aboutImages.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className="group relative aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted"
              >
                <img
                  src={imgUrl}
                  alt={`About portfolio frame ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                    idx < 5
                      ? 'bg-black/70 text-white'
                      : 'bg-amber-500/90 text-black'
                  }`}
                >
                  #{idx + 1}
                  {idx >= 5 ? ' Reserve' : ''}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/75 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveAboutImage(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-white hover:text-white/75 disabled:opacity-30 cursor-pointer"
                      aria-label={`Move frame ${idx + 1} left`}
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAboutImage(idx, 1)}
                      disabled={idx === aboutImages.length - 1}
                      className="p-1 text-white hover:text-white/75 disabled:opacity-30 cursor-pointer"
                      aria-label={`Move frame ${idx + 1} right`}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAboutImage(idx)}
                    className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                    aria-label={`Remove frame ${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
            No custom collage images set yet — the Homepage About collage is currently auto-populating from published Gallery photographs.
          </p>
        )}
      </div>

      {/* Hero Copy & Social Links */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h3 className="text-base font-serif font-bold text-foreground border-b border-border pb-3">
          Hero Text &amp; Contact Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Hero Headline</label>
            <input
              className={inputCls}
              value={draft.heroHeadline}
              onChange={(e) => setDraft((p) => ({ ...p, heroHeadline: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input
              type="email"
              className={inputCls}
              value={draft.contactEmail}
              onChange={(e) => setDraft((p) => ({ ...p, contactEmail: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Hero Subtitle</label>
          <input
            className={inputCls}
            value={draft.heroSubheadline}
            onChange={(e) => setDraft((p) => ({ ...p, heroSubheadline: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Facebook URL</label>
            <input
              className={inputCls}
              value={draft.facebookUrl}
              onChange={(e) => setDraft((p) => ({ ...p, facebookUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input
              className={inputCls}
              value={draft.instagramUrl}
              onChange={(e) => setDraft((p) => ({ ...p, instagramUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>YouTube URL</label>
            <input
              className={inputCls}
              value={draft.youtubeUrl}
              onChange={(e) => setDraft((p) => ({ ...p, youtubeUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>TikTok URL</label>
            <input
              className={inputCls}
              value={draft.tiktokUrl}
              onChange={(e) => setDraft((p) => ({ ...p, tiktokUrl: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold tracking-wide disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </form>
  );
};

