'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_HERO_SLIDES, DEFAULT_PROFILE } from '../lib/defaults';
import type {
  AdminUser,
  DatabaseInfo,
  Enquiry,
  EnquiryStatus,
  HeroSlide,
  Photograph,
  SiteProfile,
  Story,
  VideoItem,
} from '../types/portfolio';
import { isValidUuid, toSafeSlug, validateEnquiryInput, type EnquiryInput } from '../lib/validation';

const TOKEN_STORAGE_KEY = 'wildrahi_admin_token';

function getStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore restricted iframe storage errors
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed: Record<string, unknown> = {};
  if (text) {
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  if (!res.ok) {
    const errMsg =
      typeof parsed.error === 'string' ? parsed.error : `Request failed (${res.status}).`;
    throw new Error(errMsg);
  }

  return parsed as T;
}

interface PortfolioContextValue {
  heroSlides: HeroSlide[];
  photographs: Photograph[];
  videos: VideoItem[];
  stories: Story[];
  profile: SiteProfile;
  enquiries: Enquiry[];
  databaseInfo: DatabaseInfo | null;
  usingDefaultCredentials: boolean;
  loading: boolean;
  adminUser: AdminUser | null;
  authReady: boolean;
  isAdmin: boolean;
  refreshPortfolio: (authenticated?: boolean) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  submitEnquiry: (input: EnquiryInput) => Promise<void>;
  saveHeroSlide: (slide: HeroSlide) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  savePhotograph: (photo: Photograph) => Promise<void>;
  deletePhotograph: (id: string) => Promise<void>;
  saveVideo: (item: VideoItem) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  saveStory: (item: Story) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  saveProfile: (nextProfile: SiteProfile) => Promise<void>;
  updateEnquiry: (id: string, status: EnquiryStatus) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  downloadArchiveBackup: () => Promise<void>;
  activeModalPhoto: Photograph | null;
  openPhotoModal: (photo: Photograph) => void;
  closePhotoModal: () => void;
  navigateModalPhoto: (direction: -1 | 1) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

interface PortfolioResponse {
  heroSlides: HeroSlide[];
  photographs: Photograph[];
  videos: VideoItem[];
  stories: Story[];
  profile: SiteProfile;
  databaseInfo?: DatabaseInfo;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [photographs, setPhotographs] = useState<Photograph[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [usingDefaultCredentials, setUsingDefaultCredentials] = useState(false);

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshPortfolio = useCallback(async (authenticatedOverride?: boolean) => {
    try {
      const data = await apiRequest<PortfolioResponse>('/api/portfolio');
      if (Array.isArray(data.heroSlides)) {
        setHeroSlides([...data.heroSlides].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.photographs)) {
        setPhotographs([...data.photographs].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.videos)) {
        setVideos([...data.videos].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.stories)) {
        setStories(data.stories);
      }
      if (data.profile) {
        setProfile({ ...DEFAULT_PROFILE, ...data.profile });
      }
      if (data.databaseInfo) {
        setDatabaseInfo(data.databaseInfo);
        setUsingDefaultCredentials(Boolean(data.databaseInfo.usingDefaultCredentials));
      }

      const shouldFetchEnquiries =
        typeof authenticatedOverride === 'boolean' ? authenticatedOverride : Boolean(adminUser);

      if (shouldFetchEnquiries) {
        try {
          const enqRes = await apiRequest<{ enquiries: Enquiry[] }>('/api/enquiries');
          setEnquiries(Array.isArray(enqRes.enquiries) ? enqRes.enquiries : []);
        } catch {
          setEnquiries([]);
        }
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.warn('Portfolio fetch fallback:', err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      let isAuth = false;
      try {
        const authRes = await apiRequest<{
          authenticated: boolean;
          user?: AdminUser | null;
          admin?: AdminUser | null;
          databaseInfo?: DatabaseInfo;
          usingDefaultCredentials?: boolean;
        }>('/api/auth/me');
        if (!active) return;
        const resolvedUser = authRes.authenticated ? authRes.user || authRes.admin || null : null;
        setAdminUser(resolvedUser);
        isAuth = Boolean(resolvedUser);
        if (authRes.databaseInfo) setDatabaseInfo(authRes.databaseInfo);
        if (typeof authRes.usingDefaultCredentials === 'boolean') {
          setUsingDefaultCredentials(authRes.usingDefaultCredentials);
        }
      } catch {
        if (!active) return;
        setAdminUser(null);
      } finally {
        if (active) setAuthReady(true);
      }

      if (active) {
        await refreshPortfolio(isAuth);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInAdmin = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest<{
        user: AdminUser;
        token: string;
        databaseInfo?: DatabaseInfo;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      setAdminUser(res.user);
      if (res.databaseInfo) {
        setDatabaseInfo(res.databaseInfo);
        setUsingDefaultCredentials(Boolean(res.databaseInfo.usingDefaultCredentials));
      }
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const signOutAdmin = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors
    }
    setStoredToken(null);
    setAdminUser(null);
    setEnquiries([]);
    await refreshPortfolio(false);
  }, [refreshPortfolio]);

  const changeAdminPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setUsingDefaultCredentials(false);
  }, []);

  const submitEnquiry = useCallback(
    async (input: EnquiryInput) => {
      const validation = validateEnquiryInput(input);
      if (!validation.valid) {
        throw new Error('Please review the highlighted fields before submitting.');
      }
      await apiRequest('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify(validation.sanitized),
      });
      if (adminUser) {
        await refreshPortfolio(true);
      }
    },
    [adminUser, refreshPortfolio]
  );

  const saveHeroSlide = useCallback(
    async (slide: HeroSlide) => {
      const targetId = isValidUuid(slide.id) ? slide.id : 'new';
      await apiRequest(`/api/admin/hero/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        body: JSON.stringify(slide),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const deleteHeroSlide = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/hero/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const savePhotograph = useCallback(
    async (photo: Photograph) => {
      const targetId = isValidUuid(photo.id) ? photo.id : 'new';
      await apiRequest(`/api/admin/photographs/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        body: JSON.stringify(photo),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const deletePhotograph = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/photographs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const saveVideo = useCallback(
    async (item: VideoItem) => {
      const targetId = isValidUuid(item.id) ? item.id : 'new';
      await apiRequest(`/api/admin/videos/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/videos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const saveStory = useCallback(
    async (item: Story) => {
      const targetId = isValidUuid(item.id) ? item.id : 'new';
      const safeSlug = toSafeSlug(item.slug || item.title, 72);
      await apiRequest(`/api/admin/stories/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, slug: safeSlug }),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const deleteStory = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/stories/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const saveProfile = useCallback(
    async (nextProfile: SiteProfile) => {
      await apiRequest('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(nextProfile),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const updateEnquiry = useCallback(
    async (id: string, status: EnquiryStatus) => {
      await apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio(true);
    },
    [refreshPortfolio]
  );

  const downloadArchiveBackup = useCallback(async () => {
    const token = getStoredToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch('/api/admin/export', { credentials: 'include', headers });
    if (!res.ok) throw new Error('Unable to export archive backup.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wildrahi-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  // Preserved URL-synced Photo Modal Lightbox state & navigation
  const [activeModalPhoto, setActiveModalPhoto] = useState<Photograph | null>(null);

  const publishedPhotos = useMemo(
    () => photographs.filter((p) => p.isPublished).sort((a, b) => a.sortOrder - b.sortOrder),
    [photographs]
  );

  const openPhotoModal = useCallback((photo: Photograph) => {
    setActiveModalPhoto(photo);
    if (typeof window !== 'undefined') {
      const slug = encodeURIComponent(photo.id);
      window.history.pushState({ photoModal: true, photoId: photo.id }, '', `/gallery/${slug}`);
    }
  }, []);

  const closePhotoModal = useCallback(() => {
    setActiveModalPhoto(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/gallery/')) {
      window.history.back();
    }
  }, []);

  const navigateModalPhoto = useCallback(
    (direction: -1 | 1) => {
      if (!activeModalPhoto) return;
      const list = publishedPhotos.length > 0 ? publishedPhotos : photographs;
      const idx = list.findIndex((p) => p.id === activeModalPhoto.id);
      if (idx === -1) return;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= list.length) return;
      const nextPhoto = list[nextIdx];
      setActiveModalPhoto(nextPhoto);
      if (typeof window !== 'undefined') {
        const slug = encodeURIComponent(nextPhoto.id);
        window.history.replaceState({ photoModal: true, photoId: nextPhoto.id }, '', `/gallery/${slug}`);
      }
    },
    [activeModalPhoto, publishedPhotos, photographs]
  );

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/gallery/')) {
        setActiveModalPhoto(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = Boolean(adminUser);

  const value = useMemo<PortfolioContextValue>(
    () => ({
      heroSlides,
      photographs,
      videos,
      stories,
      profile,
      enquiries,
      databaseInfo,
      usingDefaultCredentials,
      loading,
      adminUser,
      authReady,
      isAdmin,
      refreshPortfolio,
      signInAdmin,
      signOutAdmin,
      changeAdminPassword,
      submitEnquiry,
      saveHeroSlide,
      deleteHeroSlide,
      savePhotograph,
      deletePhotograph,
      saveVideo,
      deleteVideo,
      saveStory,
      deleteStory,
      saveProfile,
      updateEnquiry,
      deleteEnquiry,
      downloadArchiveBackup,
      activeModalPhoto,
      openPhotoModal,
      closePhotoModal,
      navigateModalPhoto,
    }),
    [
      heroSlides,
      photographs,
      videos,
      stories,
      profile,
      enquiries,
      databaseInfo,
      usingDefaultCredentials,
      loading,
      adminUser,
      authReady,
      isAdmin,
      refreshPortfolio,
      signInAdmin,
      signOutAdmin,
      changeAdminPassword,
      submitEnquiry,
      saveHeroSlide,
      deleteHeroSlide,
      savePhotograph,
      deletePhotograph,
      saveVideo,
      deleteVideo,
      saveStory,
      deleteStory,
      saveProfile,
      updateEnquiry,
      deleteEnquiry,
      downloadArchiveBackup,
      activeModalPhoto,
      openPhotoModal,
      closePhotoModal,
      navigateModalPhoto,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
