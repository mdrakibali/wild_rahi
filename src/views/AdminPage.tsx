'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Camera,
  Check,
  Database,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminSettings } from '../components/admin/AdminSettings';
import { ArticleRichEditor } from '../components/admin/ArticleRichEditor';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { readImageFileAsDataUrl } from '../lib/imageUpload';
import { estimateReadingTimeMinutes } from '../lib/sanitizeHtml';
import { parseVideoUrl, PLATFORM_LABELS } from '../lib/videoEmbed';
import {
  ALLOWED_ARTICLE_CATEGORIES,
  ALLOWED_ASPECT_RATIOS,
  ALLOWED_CONSERVATION_STATUSES,
  ALLOWED_VIDEO_CATEGORIES,
  toSafeSlug,
} from '../lib/validation';
import type {
  Article,
  ArticleCategory,
  ArticleLanguage,
  AspectRatio,
  Collection,
  ConservationStatus,
  EnquiryStatus,
  HabitatLocation,
  Photograph,
  SiteProfile,
  Species,
  VideoCategory,
  VideoItem,
} from '../types/portfolio';

export type AdminTab =
  | 'overview'
  | 'photographs'
  | 'articles'
  | 'videos'
  | 'collections'
  | 'wildlife'
  | 'content'
  | 'enquiries'
  | 'settings';

const ARTICLE_DRAFT_STORAGE_KEY = 'wildrahi_article_autosave_v1';

const NAV_TABS: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'photographs', label: 'Photographs', icon: Camera },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'collections', label: 'Categories', icon: FolderOpen },
  { id: 'wildlife', label: 'Wildlife & Habitats', icon: MapPin },
  { id: 'content', label: 'Site Content', icon: Globe },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'settings', label: 'Database & Security', icon: Database },
];

const emptyPhoto = (collections: Collection[], locations: HabitatLocation[], count: number): Photograph => ({
  id: '',
  title: '',
  caption: '',
  imageUrl: '',
  aspectRatio: '4:3',
  collectionId: collections[0]?.id || 'birds',
  speciesSlug: '',
  speciesName: '',
  locationSlug: locations[0]?.slug || 'sundarbans',
  locationName: locations[0]?.name || 'Sundarbans',
  camera: '',
  lens: '',
  focalLength: '',
  aperture: '',
  shutterSpeed: '',
  iso: '',
  year: String(new Date().getFullYear()),
  featured: false,
  inHorizontalJourney: false,
  published: true,
  isPlaceholder: false,
  sortOrder: count + 1,
});

const emptyArticle = (): Article => ({
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  contentHtml: '<p></p>',
  coverImageUrl: '',
  coverCaption: '',
  category: 'Field Notes',
  tags: [],
  language: 'en',
  translationGroupId: '',
  authorName: 'Razaul Hafiz Rahi',
  locationName: 'Bangladesh',
  publishedDate: new Date().toISOString().slice(0, 10),
  readTimeMinutes: 4,
  featured: false,
  published: false,
  seoTitle: '',
  seoDescription: '',
});

const emptyVideo = (count: number): VideoItem => ({
  id: '',
  title: '',
  description: '',
  videoUrl: '',
  platform: 'youtube',
  category: 'Field Dispatches',
  thumbnailUrl: '',
  publishedDate: new Date().toISOString().slice(0, 10),
  featured: true,
  published: true,
  sortOrder: count + 1,
});

export const AdminPage: React.FC<{ initialTab?: AdminTab }> = ({ initialTab }) => {
  const {
    photographs,
    collections,
    species,
    locations,
    articles,
    videos,
    profile,
    enquiries,
    databaseInfo,
    usingDefaultCredentials,
    adminUser,
    authReady,
    isAdmin,
    signInAdmin,
    signOutAdmin,
    changeAdminPassword,
    savePhotograph,
    deletePhotograph,
    saveCollection,
    deleteCollection,
    saveSpecies,
    deleteSpecies,
    saveLocation,
    deleteLocation,
    saveArticle,
    deleteArticle,
    saveVideo,
    deleteVideo,
    saveProfile,
    updateEnquiry,
    deleteEnquiry,
    downloadArchiveBackup,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'overview');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Photograph Form State
  const [photoDraft, setPhotoDraft] = useState<Photograph>(() =>
    emptyPhoto(collections, locations, photographs.length)
  );
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  // Article Form State
  const [articleDraft, setArticleDraft] = useState<Article>(emptyArticle);
  const [articleTagsText, setArticleTagsText] = useState('');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [autosavedStamp, setAutosavedStamp] = useState<string | null>(null);

  // Video Form State
  const [videoDraft, setVideoDraft] = useState<VideoItem>(() => emptyVideo(videos.length));
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Collection Form State
  const [collectionDraft, setCollectionDraft] = useState<Collection>({
    id: '',
    slug: '',
    title: '',
    description: '',
    coverImageUrl: '',
    sortOrder: collections.length + 1,
  });

  // Species & Habitat State
  const [wildlifeSubTab, setWildlifeSubTab] = useState<'species' | 'locations'>('species');
  const [speciesDraft, setSpeciesDraft] = useState<Species>({
    id: '',
    slug: '',
    commonName: '',
    scientificName: '',
    bengaliName: '',
    habitat: '',
    habitatRegion: 'Sundarbans',
    description: '',
    seasonality: '',
    dietAndBehavior: '',
    keyThreats: '',
    conservationStatus: 'Least Concern',
    conservationSource: 'IUCN Red List',
    coverImageUrl: '',
    isPlaceholder: false,
  });
  const [locationDraft, setLocationDraft] = useState<HabitatLocation>({
    id: '',
    slug: '',
    name: '',
    region: '',
    ecosystem: '',
    description: '',
    coverImageUrl: '',
    isPlaceholder: false,
    sortOrder: locations.length + 1,
  });

  // Site Profile State
  const [profileDraft, setProfileDraft] = useState<SiteProfile>(profile);

  // Enquiries Notes State
  const [enquiryNotesMap, setEnquiryNotesMap] = useState<Record<string, string>>({});

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'photograph' | 'article' | 'video' | 'category' | 'species' | 'habitat' | 'enquiry';
    id: string;
    name: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    document.title = 'Admin Studio — Wild Rahi';
  }, []);

  useEffect(() => {
    setProfileDraft(profile);
  }, [profile]);

  // Autosave new/in-progress article drafts locally
  useEffect(() => {
    if (!isAdmin || activeTab !== 'articles') return;
    if (!articleDraft.title.trim() && articleDraft.contentHtml.length < 24) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(ARTICLE_DRAFT_STORAGE_KEY, JSON.stringify(articleDraft));
        setAutosavedStamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {
        // Ignore storage quota issues
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [articleDraft, activeTab, isAdmin]);

  const parsedVideoPreview = useMemo(
    () => (videoDraft.videoUrl.trim() ? parseVideoUrl(videoDraft.videoUrl) : null),
    [videoDraft.videoUrl]
  );

  const otherLanguageArticles = useMemo(
    () =>
      articles.filter(
        (a) => a.id !== articleDraft.id && a.language !== articleDraft.language
      ),
    [articles, articleDraft.id, articleDraft.language]
  );

  const notify = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-secondary text-foreground flex items-center justify-center text-sm text-muted-foreground">
        Verifying Wild Rahi studio session...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLogin
        onSignIn={signInAdmin}
        databaseInfo={databaseInfo}
        usingDefaultCredentials={usingDefaultCredentials}
      />
    );
  }

  // --- Handlers ---
  const handleBatchPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      let added = 0;
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const dataUrl = await readImageFileAsDataUrl(file, 1600, 0.84);
        const baseTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Field Plate';
        const nextOrder = photographs.length + i + 1;
        const item: Photograph = {
          ...emptyPhoto(collections, locations, nextOrder),
          id: toSafeSlug(`${baseTitle}-${Date.now()}-${i}`, 80),
          title: baseTitle,
          imageUrl: dataUrl,
          sortOrder: nextOrder,
        };
        await savePhotograph(item);
        added += 1;
      }
      notify(`Uploaded ${added} ${added === 1 ? 'photograph' : 'photographs'} to gallery.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Batch upload failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDraft.title.trim() || !photoDraft.imageUrl.trim()) {
      notify('Photograph title and image are required.', 'err');
      return;
    }
    setBusy(true);
    try {
      const loc = locations.find((l) => l.slug === photoDraft.locationSlug);
      const payload: Photograph = {
        ...photoDraft,
        id: editingPhotoId || toSafeSlug(photoDraft.title, 80),
        locationName: loc?.name || photoDraft.locationName || 'Bangladesh',
        speciesSlug: photoDraft.speciesSlug || toSafeSlug(photoDraft.speciesName || photoDraft.title, 64),
      };
      await savePhotograph(payload);
      setPhotoDraft(emptyPhoto(collections, locations, photographs.length + 1));
      setEditingPhotoId(null);
      notify('Photograph saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save photograph.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleMovePhoto = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= photographs.length) return;
    setBusy(true);
    try {
      const a = photographs[index];
      const b = photographs[targetIdx];
      await savePhotograph({ ...a, sortOrder: b.sortOrder });
      await savePhotograph({ ...b, sortOrder: a.sortOrder });
      notify('Gallery order updated.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Reorder failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveArticle = async (publishOverride?: boolean) => {
    if (!articleDraft.title.trim()) {
      notify('Please enter an article title.', 'err');
      return;
    }
    if (!articleDraft.coverImageUrl.trim()) {
      notify('Please upload or link a cover photograph for this article.', 'err');
      return;
    }
    setBusy(true);
    try {
      const safeSlug = toSafeSlug(articleDraft.slug || articleDraft.title, 90);
      const tags = articleTagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: Article = {
        ...articleDraft,
        id: editingArticleId || safeSlug,
        slug: safeSlug,
        tags,
        readTimeMinutes: estimateReadingTimeMinutes(articleDraft.contentHtml),
        published: typeof publishOverride === 'boolean' ? publishOverride : articleDraft.published,
        updatedAt: new Date().toISOString(),
      };
      await saveArticle(payload);
      try {
        window.localStorage.removeItem(ARTICLE_DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }
      setEditingArticleId(payload.id);
      setArticleDraft(payload);
      notify(payload.published ? 'Article published.' : 'Article draft saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save article.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreAutosavedArticle = () => {
    try {
      const raw = window.localStorage.getItem(ARTICLE_DRAFT_STORAGE_KEY);
      if (!raw) {
        notify('No local autosaved draft found.', 'err');
        return;
      }
      const restored = JSON.parse(raw) as Article;
      setArticleDraft(restored);
      setArticleTagsText((restored.tags || []).join(', '));
      setEditingArticleId(restored.id || null);
      notify('Restored autosaved article draft.');
    } catch {
      notify('Could not restore draft.', 'err');
    }
  };

  const handleVideoUrlChange = (url: string) => {
    const parsed = parseVideoUrl(url);
    setVideoDraft((prev) => ({
      ...prev,
      videoUrl: url,
      platform: parsed.platform || prev.platform,
      thumbnailUrl:
        prev.thumbnailUrl.trim() || !parsed.thumbnailUrl ? prev.thumbnailUrl : parsed.thumbnailUrl,
    }));
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseVideoUrl(videoDraft.videoUrl);
    if (!parsed.valid || !parsed.platform) {
      notify(parsed.error || 'Please enter a valid YouTube, Facebook, Instagram, or TikTok URL.', 'err');
      return;
    }
    if (!videoDraft.title.trim()) {
      notify('Please enter a video title.', 'err');
      return;
    }
    const thumb = videoDraft.thumbnailUrl.trim() || parsed.thumbnailUrl || photographs[0]?.imageUrl || '';
    setBusy(true);
    try {
      const payload: VideoItem = {
        ...videoDraft,
        id: editingVideoId || toSafeSlug(videoDraft.title, 80),
        platform: parsed.platform,
        thumbnailUrl: thumb,
        updatedAt: new Date().toISOString(),
      };
      await saveVideo(payload);
      setVideoDraft(emptyVideo(videos.length + 1));
      setEditingVideoId(null);
      notify(`Saved ${PLATFORM_LABELS[parsed.platform]} video.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save video.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionDraft.title.trim()) {
      notify('Category title is required.', 'err');
      return;
    }
    setBusy(true);
    try {
      const safeId = collectionDraft.id || toSafeSlug(collectionDraft.title, 60);
      await saveCollection({
        ...collectionDraft,
        id: safeId,
        slug: toSafeSlug(collectionDraft.slug || collectionDraft.title, 60),
        coverImageUrl: collectionDraft.coverImageUrl || photographs[0]?.imageUrl || '',
      });
      setCollectionDraft({
        id: '',
        slug: '',
        title: '',
        description: '',
        coverImageUrl: '',
        sortOrder: collections.length + 2,
      });
      notify('Gallery category saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save category.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesDraft.commonName.trim() || !speciesDraft.scientificName.trim()) {
      notify('Common and scientific names are required.', 'err');
      return;
    }
    setBusy(true);
    try {
      const safeSlug = toSafeSlug(speciesDraft.slug || speciesDraft.commonName, 70);
      await saveSpecies({
        ...speciesDraft,
        id: speciesDraft.id || safeSlug,
        slug: safeSlug,
        coverImageUrl: speciesDraft.coverImageUrl || photographs[0]?.imageUrl || '',
      });
      setSpeciesDraft({
        id: '',
        slug: '',
        commonName: '',
        scientificName: '',
        bengaliName: '',
        habitat: '',
        habitatRegion: 'Sundarbans',
        description: '',
        seasonality: '',
        dietAndBehavior: '',
        keyThreats: '',
        conservationStatus: 'Least Concern',
        conservationSource: 'IUCN Red List',
        coverImageUrl: '',
        isPlaceholder: false,
      });
      notify('Species dossier saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save species.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationDraft.name.trim()) {
      notify('Habitat name is required.', 'err');
      return;
    }
    setBusy(true);
    try {
      const safeSlug = toSafeSlug(locationDraft.slug || locationDraft.name, 70);
      await saveLocation({
        ...locationDraft,
        id: locationDraft.id || safeSlug,
        slug: safeSlug,
        coverImageUrl: locationDraft.coverImageUrl || photographs[0]?.imageUrl || '',
      });
      setLocationDraft({
        id: '',
        slug: '',
        name: '',
        region: '',
        ecosystem: '',
        description: '',
        coverImageUrl: '',
        isPlaceholder: false,
        sortOrder: locations.length + 2,
      });
      notify('Habitat saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save habitat.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveProfile(profileDraft);
      notify('Website profile & editorial copy updated.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to update site content.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full bg-card border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all';
  const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5';

  return (
    <div className="min-h-screen bg-secondary text-foreground flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0 bg-card border-b lg:border-b-0 lg:border-r border-border flex flex-col">
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between lg:block">
          <div>
            <p className="text-lg font-semibold tracking-tight leading-none">Wild Rahi</p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
              Admin Studio
            </p>
          </div>
          <Link
            to="/"
            className="lg:mt-3 inline-flex items-center gap-1 rounded-md border border-border hover:bg-secondary px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary"
          >
            View Site
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar flex-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all text-left ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border hidden lg:flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{adminUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOutAdmin}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 max-w-[1280px]">
        {toast && (
          <div
            role="status"
            className={`mb-6 px-4 py-3 border text-sm flex items-center gap-2 ${
              toast.type === 'ok'
                ? 'bg-primary text-white border-primary'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {toast.type === 'ok' && <Check className="w-4 h-4 shrink-0" />}
            <span>{toast.text}</span>
          </div>
        )}

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <AdminOverview
            photographs={photographs}
            collections={collections}
            species={species}
            articles={articles}
            videos={videos}
            enquiries={enquiries}
            databaseInfo={databaseInfo}
            onNavigateTab={(t) => setActiveTab(t as AdminTab)}
          />
        )}

        {/* 2. PHOTOGRAPHS */}
        {activeTab === 'photographs' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Gallery Archive
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                  Photography Management
                </h2>
              </div>

              <label className="inline-flex items-center gap-2 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-5 py-2.5 text-xs font-medium cursor-pointer hover:bg-primary/90 self-start">
                <Upload className="w-3.5 h-3.5" />
                Upload Multiple Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleBatchPhotoUpload(e.target.files)}
                />
              </label>
            </div>

            <form
              onSubmit={handleSavePhoto}
              className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-foreground">
                  {editingPhotoId ? 'Edit Photograph' : 'Add Photograph'}
                </h3>
                {editingPhotoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPhotoId(null);
                      setPhotoDraft(emptyPhoto(collections, locations, photographs.length));
                    }}
                    className="rounded-md border border-border hover:bg-secondary px-3.5 py-1 text-xs"
                  >
                    + New Plate
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input
                    className={inputCls}
                    value={photoDraft.title}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Dawn Over Sundarbans Creek"
                  />
                </div>
                <div>
                  <label className={labelCls}>Species Name</label>
                  <input
                    className={inputCls}
                    value={photoDraft.speciesName}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, speciesName: e.target.value }))}
                    placeholder="e.g. Bengal Tiger"
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={photoDraft.collectionId}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, collectionId: e.target.value }))}
                  >
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Habitat Location</label>
                  <select
                    className={inputCls}
                    value={photoDraft.locationSlug}
                    onChange={(e) => {
                      const loc = locations.find((l) => l.slug === e.target.value);
                      setPhotoDraft((p) => ({
                        ...p,
                        locationSlug: e.target.value,
                        locationName: loc?.name || p.locationName,
                      }));
                    }}
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.slug}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Aspect Ratio</label>
                  <select
                    className={inputCls}
                    value={photoDraft.aspectRatio}
                    onChange={(e) =>
                      setPhotoDraft((p) => ({ ...p, aspectRatio: e.target.value as AspectRatio }))
                    }
                  >
                    {ALLOWED_ASPECT_RATIOS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Year</label>
                  <input
                    className={inputCls}
                    value={photoDraft.year}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, year: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-9">
                  <label className={labelCls}>Photograph Image URL or File Upload *</label>
                  <input
                    className={inputCls}
                    value={photoDraft.imageUrl}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://... or upload image"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border hover:bg-secondary px-4 py-2 text-xs font-medium cursor-pointer hover:bg-secondary">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await readImageFileAsDataUrl(file);
                          setPhotoDraft((p) => ({ ...p, imageUrl: dataUrl }));
                        } catch (err) {
                          notify(err instanceof Error ? err.message : 'Upload error', 'err');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Field Caption</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={photoDraft.caption}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, caption: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <input
                  className={inputCls}
                  placeholder="Camera"
                  value={photoDraft.camera}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, camera: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Lens"
                  value={photoDraft.lens}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, lens: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Focal (600mm)"
                  value={photoDraft.focalLength}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, focalLength: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Aperture (f/4)"
                  value={photoDraft.aperture}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, aperture: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Shutter (1/1600s)"
                  value={photoDraft.shutterSpeed}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, shutterSpeed: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="ISO 800"
                  value={photoDraft.iso}
                  onChange={(e) => setPhotoDraft((p) => ({ ...p, iso: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoDraft.published}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, published: e.target.checked }))}
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoDraft.featured}
                    onChange={(e) => setPhotoDraft((p) => ({ ...p, featured: e.target.checked }))}
                  />
                  Featured / Hero Eligible
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoDraft.inHorizontalJourney}
                    onChange={(e) =>
                      setPhotoDraft((p) => ({ ...p, inHorizontalJourney: e.target.checked }))
                    }
                  />
                  In Horizontal Journey
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editingPhotoId ? 'Update Photograph' : 'Save Photograph'}
              </button>
            </form>

            {/* Photograph List with Reorder Controls */}
            <div className="bg-card border border-border divide-y divide-border">
              {photographs.map((photo, index) => (
                <div
                  key={photo.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-20 h-14 object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{photo.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {photo.speciesName} &middot; {photo.locationName} &middot;{' '}
                        {photo.published ? 'Published' : 'Draft'}
                        {photo.featured ? ' · Featured' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(index, -1)}
                      disabled={index === 0 || busy}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary hover:bg-secondary disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(index, 1)}
                      disabled={index === photographs.length - 1 || busy}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary hover:bg-secondary disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhotoId(photo.id);
                        setPhotoDraft(photo);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'photograph', id: photo.id, name: photo.title })}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600 hover:bg-red-50"
                      aria-label="Delete photograph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ARTICLES (TIPTAP BILINGUAL CMS) */}
        {activeTab === 'articles' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Editorial Journal &middot; English &amp; বাংলা
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                  Article Management
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {autosavedStamp && (
                  <span className="text-xs text-muted-foreground">Autosaved {autosavedStamp}</span>
                )}
                <button
                  type="button"
                  onClick={handleRestoreAutosavedArticle}
                  className="rounded-md border border-border hover:bg-secondary bg-card px-4 py-2 text-xs font-medium hover:bg-muted"
                >
                  Restore Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingArticleId(null);
                    setArticleDraft(emptyArticle());
                    setArticleTagsText('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-4 py-2 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Article
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className={labelCls}>Article Title *</label>
                  <input
                    className={inputCls}
                    lang={articleDraft.language}
                    value={articleDraft.title}
                    onChange={(e) =>
                      setArticleDraft((a) => ({
                        ...a,
                        title: e.target.value,
                        slug: editingArticleId ? a.slug : toSafeSlug(e.target.value, 90),
                      }))
                    }
                    placeholder={
                      articleDraft.language === 'bn'
                        ? 'বাংলা শিরোনাম লিখুন...'
                        : 'Editorial headline...'
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelCls}>Language</label>
                  <select
                    className={inputCls}
                    value={articleDraft.language}
                    onChange={(e) =>
                      setArticleDraft((a) => ({
                        ...a,
                        language: e.target.value as ArticleLanguage,
                      }))
                    }
                  >
                    <option value="en">English (en)</option>
                    <option value="bn">বাংলা (bn)</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={articleDraft.category}
                    onChange={(e) =>
                      setArticleDraft((a) => ({
                        ...a,
                        category: e.target.value as ArticleCategory,
                      }))
                    }
                  >
                    {ALLOWED_ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className={labelCls}>URL Slug</label>
                  <input
                    className={inputCls}
                    value={articleDraft.slug}
                    onChange={(e) => setArticleDraft((a) => ({ ...a, slug: e.target.value }))}
                    placeholder="sundarbans-field-notes"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className={labelCls}>Link Translation (Optional)</label>
                  <select
                    className={inputCls}
                    value={articleDraft.translationGroupId || ''}
                    onChange={(e) =>
                      setArticleDraft((a) => ({ ...a, translationGroupId: e.target.value }))
                    }
                  >
                    <option value="">Standalone Article (No linked translation)</option>
                    {otherLanguageArticles.map((other) => {
                      const groupVal = other.translationGroupId || other.slug;
                      return (
                        <option key={other.id} value={groupVal}>
                          Link to [{other.language.toUpperCase()}]: {other.title}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className={labelCls}>Publish Date</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. February 2026 or ফেব্রুয়ারি ২০২৬"
                    value={articleDraft.publishedDate}
                    onChange={(e) =>
                      setArticleDraft((a) => ({ ...a, publishedDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Excerpt / Summary</label>
                <textarea
                  rows={2}
                  lang={articleDraft.language}
                  className={inputCls}
                  value={articleDraft.excerpt}
                  onChange={(e) => setArticleDraft((a) => ({ ...a, excerpt: e.target.value }))}
                  placeholder="Short editorial introduction shown on cards and article header..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className={labelCls}>Cover Image URL *</label>
                  <input
                    className={inputCls}
                    value={articleDraft.coverImageUrl}
                    onChange={(e) =>
                      setArticleDraft((a) => ({ ...a, coverImageUrl: e.target.value }))
                    }
                    placeholder="https://... or upload image"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Cover Caption</label>
                  <input
                    className={inputCls}
                    value={articleDraft.coverCaption || ''}
                    onChange={(e) =>
                      setArticleDraft((a) => ({ ...a, coverCaption: e.target.value }))
                    }
                    placeholder="Optional cover credit or location note"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border hover:bg-secondary px-4 py-2 text-xs font-medium cursor-pointer hover:bg-secondary">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Cover
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await readImageFileAsDataUrl(file);
                          setArticleDraft((a) => ({ ...a, coverImageUrl: dataUrl }));
                        } catch (err) {
                          notify(err instanceof Error ? err.message : 'Upload failed', 'err');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tiptap Rich Text Editor */}
              <div>
                <label className={labelCls}>Article Body (Rich Text, Inline Photos &amp; Galleries)</label>
                <ArticleRichEditor
                  value={articleDraft.contentHtml}
                  onChange={(html) => setArticleDraft((a) => ({ ...a, contentHtml: html }))}
                  language={articleDraft.language}
                  title={articleDraft.title}
                />
              </div>

              {/* Tags & SEO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
                <div>
                  <label className={labelCls}>Tags (comma-separated)</label>
                  <input
                    className={inputCls}
                    value={articleTagsText}
                    onChange={(e) => setArticleTagsText(e.target.value)}
                    placeholder="Sundarbans, Birds, Conservation"
                  />
                </div>
                <div>
                  <label className={labelCls}>SEO Title (optional)</label>
                  <input
                    className={inputCls}
                    value={articleDraft.seoTitle || ''}
                    onChange={(e) => setArticleDraft((a) => ({ ...a, seoTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>SEO Meta Description (optional)</label>
                  <input
                    className={inputCls}
                    value={articleDraft.seoDescription || ''}
                    onChange={(e) =>
                      setArticleDraft((a) => ({ ...a, seoDescription: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={articleDraft.featured}
                    onChange={(e) => setArticleDraft((a) => ({ ...a, featured: e.target.checked }))}
                  />
                  Featured on Homepage
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSaveArticle(false)}
                    className="rounded-md border border-border hover:bg-secondary px-5 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSaveArticle(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Publish Article
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Articles List */}
            <div className="bg-card border border-border divide-y divide-border">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">
                        {art.language === 'bn' ? 'বাংলা' : 'EN'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          art.published
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {art.published ? 'Published' : 'Draft'}
                      </span>
                      <p className="text-sm font-semibold truncate" lang={art.language}>
                        {art.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      /articles/{art.slug} &middot; {art.category} &middot; {art.publishedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/articles/${encodeURIComponent(art.slug)}`}
                      className="rounded-md border border-border hover:bg-secondary px-3 py-1.5 text-xs hover:bg-secondary"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArticleId(art.id);
                        setArticleDraft(art);
                        setArticleTagsText((art.tags || []).join(', '));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'article', id: art.id, name: art.title })}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600 hover:bg-red-50"
                      aria-label="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. VIDEOS (LINK-BASED PLATFORM SHOWCASE) */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                YouTube &middot; Facebook &middot; Instagram &middot; TikTok
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                Video Showcase Management
              </h2>
            </div>

            <form
              onSubmit={handleSaveVideo}
              className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-foreground">
                  {editingVideoId ? 'Edit Video Link' : 'Add Video by Platform URL'}
                </h3>
                {editingVideoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideoId(null);
                      setVideoDraft(emptyVideo(videos.length));
                    }}
                    className="rounded-md border border-border hover:bg-secondary px-3.5 py-1 text-xs"
                  >
                    + New Video
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className={labelCls}>Video URL (YouTube, Facebook, Instagram, or TikTok) *</label>
                  <input
                    type="url"
                    className={inputCls}
                    value={videoDraft.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or Facebook / Instagram / TikTok link"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Detected Platform</label>
                  <div className="h-[38px] px-3.5 bg-secondary border border-border flex items-center text-sm font-medium">
                    {parsedVideoPreview
                      ? parsedVideoPreview.valid
                        ? `${parsedVideoPreview.platformLabel} (${
                            parsedVideoPreview.canEmbed ? 'Embed Ready' : 'Direct Link'
                          })`
                        : 'Unsupported / Invalid URL'
                      : 'Paste a URL to detect'}
                  </div>
                </div>
              </div>

              {parsedVideoPreview && !parsedVideoPreview.valid && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5">
                  {parsedVideoPreview.error}
                </p>
              )}

              {parsedVideoPreview && parsedVideoPreview.valid && (
                <div className="bg-secondary border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Live Embed Preview ({parsedVideoPreview.platformLabel})</span>
                    <a
                      href={videoDraft.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground font-medium hover:underline"
                    >
                      {parsedVideoPreview.fallbackLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {parsedVideoPreview.canEmbed && parsedVideoPreview.embedUrl ? (
                    <div className="max-w-md aspect-video bg-obsidian">
                      <iframe
                        src={parsedVideoPreview.embedUrl}
                        title="Video embed preview"
                        loading="lazy"
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{parsedVideoPreview.limitationNote}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Video Title *</label>
                  <input
                    className={inputCls}
                    value={videoDraft.title}
                    onChange={(e) => setVideoDraft((v) => ({ ...v, title: e.target.value }))}
                    placeholder="e.g. Morning Mist Over Tanguar Haor"
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={videoDraft.category}
                    onChange={(e) =>
                      setVideoDraft((v) => ({ ...v, category: e.target.value as VideoCategory }))
                    }
                  >
                    {ALLOWED_VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Published Date</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. February 2026"
                    value={videoDraft.publishedDate}
                    onChange={(e) => setVideoDraft((v) => ({ ...v, publishedDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-9">
                  <label className={labelCls}>Custom Thumbnail URL (auto-filled for YouTube)</label>
                  <input
                    className={inputCls}
                    value={videoDraft.thumbnailUrl}
                    onChange={(e) => setVideoDraft((v) => ({ ...v, thumbnailUrl: e.target.value }))}
                    placeholder="https://... or upload cover frame"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border hover:bg-secondary px-4 py-2 text-xs font-medium cursor-pointer hover:bg-secondary">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await readImageFileAsDataUrl(file, 1200, 0.82);
                          setVideoDraft((v) => ({ ...v, thumbnailUrl: dataUrl }));
                        } catch (err) {
                          notify(err instanceof Error ? err.message : 'Upload failed', 'err');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Short Description</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={videoDraft.description}
                  onChange={(e) => setVideoDraft((v) => ({ ...v, description: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoDraft.published}
                    onChange={(e) => setVideoDraft((v) => ({ ...v, published: e.target.checked }))}
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoDraft.featured}
                    onChange={(e) => setVideoDraft((v) => ({ ...v, featured: e.target.checked }))}
                  />
                  Featured on Homepage
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editingVideoId ? 'Update Video' : 'Save Video'}
              </button>
            </form>

            {/* Video List */}
            <div className="bg-card border border-border divide-y divide-border">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-24 h-14 object-cover bg-obsidian shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">
                          {PLATFORM_LABELS[vid.platform]}
                        </span>
                        <p className="text-sm font-semibold truncate">{vid.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {vid.category} &middot; {vid.published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVideoId(vid.id);
                        setVideoDraft(vid);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'video', id: vid.id, name: vid.title })}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600 hover:bg-red-50"
                      aria-label="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COLLECTIONS / CATEGORIES */}
        {activeTab === 'collections' && (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Gallery Taxonomy
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                Categories &amp; Collections
              </h2>
            </div>

            <form
              onSubmit={handleSaveCollection}
              className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-4 shadow-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category Title *</label>
                  <input
                    className={inputCls}
                    value={collectionDraft.title}
                    onChange={(e) => setCollectionDraft((c) => ({ ...c, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cover Image URL</label>
                  <input
                    className={inputCls}
                    value={collectionDraft.coverImageUrl}
                    onChange={(e) =>
                      setCollectionDraft((c) => ({ ...c, coverImageUrl: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={collectionDraft.description}
                  onChange={(e) =>
                    setCollectionDraft((c) => ({ ...c, description: e.target.value }))
                  }
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium"
              >
                Save Category
              </button>
            </form>

            <div className="bg-card border border-border divide-y divide-border">
              {collections.map((col) => (
                <div key={col.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={col.coverImageUrl}
                      alt={col.title}
                      className="w-16 h-12 object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{col.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{col.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCollectionDraft(col)}
                      className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'category', id: col.id, name: col.title })}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. WILDLIFE & HABITATS */}
        {activeTab === 'wildlife' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Biodiversity Records
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                  Species &amp; Habitats
                </h2>
              </div>
              <div className="inline-flex rounded-md border border-border hover:bg-secondary bg-card p-1">
                <button
                  type="button"
                  onClick={() => setWildlifeSubTab('species')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                    wildlifeSubTab === 'species' ? 'bg-primary text-white' : 'text-muted-foreground'
                  }`}
                >
                  Species ({species.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWildlifeSubTab('locations')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                    wildlifeSubTab === 'locations' ? 'bg-primary text-white' : 'text-muted-foreground'
                  }`}
                >
                  Habitats ({locations.length})
                </button>
              </div>
            </div>

            {wildlifeSubTab === 'species' ? (
              <>
                <form
                  onSubmit={handleSaveSpecies}
                  className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Common Name *</label>
                      <input
                        className={inputCls}
                        value={speciesDraft.commonName}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({ ...s, commonName: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Scientific Name *</label>
                      <input
                        className={inputCls}
                        value={speciesDraft.scientificName}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({ ...s, scientificName: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Bengali Name (বাংলা)</label>
                      <input
                        className={inputCls}
                        lang="bn"
                        value={speciesDraft.bengaliName}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({ ...s, bengaliName: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Habitat Region</label>
                      <input
                        className={inputCls}
                        value={speciesDraft.habitatRegion}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({ ...s, habitatRegion: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Conservation Status</label>
                      <select
                        className={inputCls}
                        value={speciesDraft.conservationStatus}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({
                            ...s,
                            conservationStatus: e.target.value as ConservationStatus,
                          }))
                        }
                      >
                        {ALLOWED_CONSERVATION_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Cover Image URL</label>
                      <input
                        className={inputCls}
                        value={speciesDraft.coverImageUrl}
                        onChange={(e) =>
                          setSpeciesDraft((s) => ({ ...s, coverImageUrl: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Ecological Description</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={speciesDraft.description}
                      onChange={(e) =>
                        setSpeciesDraft((s) => ({ ...s, description: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium"
                  >
                    Save Species Dossier
                  </button>
                </form>

                <div className="bg-card border border-border divide-y divide-border">
                  {species.map((sp) => (
                    <div key={sp.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {sp.commonName}{' '}
                          <span className="italic font-normal text-muted-foreground">
                            ({sp.scientificName})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sp.bengaliName} &middot; {sp.habitatRegion} &middot;{' '}
                          {sp.conservationStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSpeciesDraft(sp)}
                          className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'species', id: sp.id, name: sp.commonName })}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600"
                          aria-label="Delete species"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <form
                  onSubmit={handleSaveLocation}
                  className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Habitat Name *</label>
                      <input
                        className={inputCls}
                        value={locationDraft.name}
                        onChange={(e) =>
                          setLocationDraft((l) => ({ ...l, name: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Region</label>
                      <input
                        className={inputCls}
                        value={locationDraft.region}
                        onChange={(e) =>
                          setLocationDraft((l) => ({ ...l, region: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Ecosystem Type</label>
                      <input
                        className={inputCls}
                        value={locationDraft.ecosystem}
                        onChange={(e) =>
                          setLocationDraft((l) => ({ ...l, ecosystem: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Cover Image URL</label>
                    <input
                      className={inputCls}
                      value={locationDraft.coverImageUrl}
                      onChange={(e) =>
                        setLocationDraft((l) => ({ ...l, coverImageUrl: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={locationDraft.description}
                      onChange={(e) =>
                        setLocationDraft((l) => ({ ...l, description: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-6 py-2.5 text-sm font-medium"
                  >
                    Save Habitat
                  </button>
                </form>

                <div className="bg-card border border-border divide-y divide-border">
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {loc.region} &middot; {loc.ecosystem}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLocationDraft(loc)}
                          className="rounded-md border border-border hover:bg-secondary px-3.5 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'habitat', id: loc.id, name: loc.name })}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600"
                          aria-label="Delete habitat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 7. WEBSITE CONTENT */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Editorial Copy &amp; Channels
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                Website Content Management
              </h2>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hero Headline</label>
                  <input
                    className={inputCls}
                    value={profileDraft.heroHeadline}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, heroHeadline: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Email</label>
                  <input
                    className={inputCls}
                    value={profileDraft.contactEmail}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, contactEmail: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Hero Subheadline</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={profileDraft.heroSubheadline}
                  onChange={(e) =>
                    setProfileDraft((p) => ({ ...p, heroSubheadline: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className={labelCls}>Homepage Introduction</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={profileDraft.introBody}
                  onChange={(e) => setProfileDraft((p) => ({ ...p, introBody: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls}>Conservation Statement</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={profileDraft.conservationStatement}
                  onChange={(e) =>
                    setProfileDraft((p) => ({ ...p, conservationStatement: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Facebook URL</label>
                  <input
                    className={inputCls}
                    value={profileDraft.facebookUrl}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, facebookUrl: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Instagram URL</label>
                  <input
                    className={inputCls}
                    value={profileDraft.instagramUrl}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, instagramUrl: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>YouTube URL</label>
                  <input
                    className={inputCls}
                    value={profileDraft.youtubeUrl || ''}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, youtubeUrl: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>TikTok URL</label>
                  <input
                    className={inputCls}
                    value={profileDraft.tiktokUrl || ''}
                    onChange={(e) =>
                      setProfileDraft((p) => ({ ...p, tiktokUrl: e.target.value }))
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white shadow-xs hover:bg-primary/90 px-7 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Website Content
              </button>
            </div>
          </form>
        )}

        {/* 8. ENQUIRIES INBOX */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Client &amp; Conservation Messages
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
                Enquiries Inbox
              </h2>
            </div>

            {enquiries.length === 0 ? (
              <div className="bg-card border border-border p-10 text-center text-sm text-muted-foreground">
                No enquiries yet. Messages sent via /contact will appear here automatically.
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.map((enq) => {
                  const notesVal = enquiryNotesMap[enq.id] ?? enq.adminNotes ?? '';
                  return (
                    <div
                      key={enq.id}
                      className="bg-card border border-border rounded-lg p-6 sm:p-7 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-serif font-bold text-foreground">{enq.subject}</h3>
                            <span className="rounded-full bg-muted px-3 py-0.5 text-[11px] font-medium">
                              {enq.enquiryType}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {enq.name} ({enq.email})
                            {enq.organization ? ` · ${enq.organization}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            aria-label="Enquiry status"
                            value={enq.status}
                            onChange={async (e) => {
                              await updateEnquiry(
                                enq.id,
                                e.target.value as EnquiryStatus,
                                notesVal
                              );
                              notify('Enquiry status updated.');
                            }}
                            className="rounded-md border border-border hover:bg-secondary bg-secondary px-3.5 py-1.5 text-xs font-medium capitalize"
                          >
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: 'enquiry', id: enq.id, name: `${enq.name} (${enq.subject})` })}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary text-red-600"
                            aria-label="Delete enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-foreground/85 leading-relaxed bg-secondary p-4 border border-border">
                        {enq.message}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          className={`${inputCls} flex-1`}
                          placeholder="Internal studio notes..."
                          value={notesVal}
                          onChange={(e) =>
                            setEnquiryNotesMap((m) => ({ ...m, [enq.id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await updateEnquiry(enq.id, enq.status, notesVal);
                            notify('Notes saved.');
                          }}
                          className="rounded-md border border-border hover:bg-secondary px-5 py-2 text-xs font-medium hover:bg-secondary"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 9. SETTINGS & MONGODB */}
        {activeTab === 'settings' && (
          <AdminSettings
            databaseInfo={databaseInfo}
            usingDefaultCredentials={usingDefaultCredentials}
            onChangePassword={changeAdminPassword}
            onDownloadBackup={downloadArchiveBackup}
          />
        )}

        {/* Custom Confirmation and Deletion Modal */}
        <ConfirmModal
          isOpen={deleteTarget !== null}
          loading={deleteBusy}
          itemName={deleteTarget?.name}
          title={`Delete ${deleteTarget ? deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1) : 'Item'}`}
          description="Are you sure you want to delete this record? This action cannot be undone and will permanently remove it from your studio archive."
          confirmText="Yes, Delete Record"
          cancelText="Cancel"
          onClose={() => !deleteBusy && setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            setDeleteBusy(true);
            try {
              if (deleteTarget.type === 'photograph') await deletePhotograph(deleteTarget.id);
              else if (deleteTarget.type === 'article') await deleteArticle(deleteTarget.id);
              else if (deleteTarget.type === 'video') await deleteVideo(deleteTarget.id);
              else if (deleteTarget.type === 'category') await deleteCollection(deleteTarget.id);
              else if (deleteTarget.type === 'species') await deleteSpecies(deleteTarget.id);
              else if (deleteTarget.type === 'habitat') await deleteLocation(deleteTarget.id);
              else if (deleteTarget.type === 'enquiry') await deleteEnquiry(deleteTarget.id);
              notify(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully.`);
              setDeleteTarget(null);
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Failed to delete record.', 'err');
            } finally {
              setDeleteBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
};
