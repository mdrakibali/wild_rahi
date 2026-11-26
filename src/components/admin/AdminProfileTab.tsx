'use client';

import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { SiteProfile } from '../../types/portfolio';
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
  const [draft, setDraft] = useState<SiteProfile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

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
    'w-full bg-card border border-border rounded-md px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary';
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
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-semibold tracking-wide disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Save Profile
        </button>
      </div>

      {/* Identity */}
      <div className="bg-card border border-border rounded-md p-6 space-y-5">
        <h3 className="text-base font-serif font-bold text-foreground border-b border-border pb-3">
          Photographer Identity &amp; Portrait
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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

        <ImageDropzone
          label="Portrait Photograph"
          value={draft.portraitUrl}
          onChange={(url) => setDraft((p) => ({ ...p, portraitUrl: url }))}
          folder="profile"
          aspectRatio="portrait"
        />

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

      {/* Hero Copy & Social Links */}
      <div className="bg-card border border-border rounded-md p-6 space-y-5">
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
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-semibold tracking-wide disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </form>
  );
};

