'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PROFILE } from '../lib/defaults';
import type {
  AdminUser,
  Article,
  Collection,
  DatabaseInfo,
  Enquiry,
  EnquiryStatus,
  HabitatLocation,
  Photograph,
  SiteProfile,
  Species,
  VideoItem,
} from '../types/portfolio';
import { toSafeSlug, validateEnquiryInput, type EnquiryInput } from '../lib/validation';

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
  photographs: Photograph[];
  collections: Collection[];
  species: Species[];
  locations: HabitatLocation[];
  articles: Article[];
  videos: VideoItem[];
  profile: SiteProfile;
  enquiries: Enquiry[];
  databaseInfo: DatabaseInfo | null;
  usingDefaultCredentials: boolean;
  loading: boolean;
  adminUser: AdminUser | null;
  authReady: boolean;
  isAdmin: boolean;
  refreshPortfolio: () => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  submitEnquiry: (input: EnquiryInput) => Promise<void>;
  savePhotograph: (photo: Photograph) => Promise<void>;
  deletePhotograph: (id: string) => Promise<void>;
  saveCollection: (item: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  saveSpecies: (item: Species) => Promise<void>;
  deleteSpecies: (id: string) => Promise<void>;
  saveLocation: (item: HabitatLocation) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  saveArticle: (item: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  saveVideo: (item: VideoItem) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  saveProfile: (nextProfile: SiteProfile) => Promise<void>;
  updateEnquiry: (id: string, status: EnquiryStatus, adminNotes: string) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  downloadArchiveBackup: () => Promise<void>;
  activeModalPhoto: Photograph | null;
  openPhotoModal: (photo: Photograph) => void;
  closePhotoModal: () => void;
  navigateModalPhoto: (direction: -1 | 1) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

interface PortfolioResponse {
  photographs: Photograph[];
  collections: Collection[];
  species: Species[];
  locations: HabitatLocation[];
  articles: Article[];
  videos: VideoItem[];
  profile: SiteProfile;
  enquiries?: Enquiry[];
  databaseInfo?: DatabaseInfo;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photographs, setPhotographs] = useState<Photograph[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [locations, setLocations] = useState<HabitatLocation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [usingDefaultCredentials, setUsingDefaultCredentials] = useState(false);

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshPortfolio = useCallback(async () => {
    try {
      const data = await apiRequest<PortfolioResponse>('/api/portfolio');
      if (Array.isArray(data.photographs)) {
        setPhotographs([...data.photographs].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.collections)) {
        setCollections([...data.collections].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.species)) {
        setSpecies(data.species);
      }
      if (Array.isArray(data.locations)) {
        setLocations([...data.locations].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (Array.isArray(data.articles)) {
        setArticles(data.articles);
      }
      if (Array.isArray(data.videos)) {
        setVideos([...data.videos].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      if (data.profile) {
        setProfile({ ...DEFAULT_PROFILE, ...data.profile });
      }
      if (Array.isArray(data.enquiries)) {
        setEnquiries(data.enquiries);
      } else {
        setEnquiries([]);
      }
      if (data.databaseInfo) {
        setDatabaseInfo(data.databaseInfo);
        setUsingDefaultCredentials(Boolean(data.databaseInfo.usingDefaultCredentials));
      }
    } catch (err) {
      console.warn('Portfolio fetch fallback:', err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authRes = await apiRequest<{
          authenticated: boolean;
          user: AdminUser | null;
          databaseInfo?: DatabaseInfo;
          usingDefaultCredentials?: boolean;
        }>('/api/auth/me');
        if (!active) return;
        setAdminUser(authRes.authenticated ? authRes.user : null);
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
        await refreshPortfolio();
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshPortfolio]);

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
      await refreshPortfolio();
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
    setDatabaseInfo(null);
    await refreshPortfolio();
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
        await refreshPortfolio();
      }
    },
    [adminUser, refreshPortfolio]
  );

  const savePhotograph = useCallback(
    async (photo: Photograph) => {
      const safeId = toSafeSlug(photo.id || photo.title, 100);
      await apiRequest(`/api/admin/photographs/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...photo, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deletePhotograph = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/photographs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveCollection = useCallback(
    async (item: Collection) => {
      const safeId = toSafeSlug(item.id || item.title, 64);
      await apiRequest(`/api/admin/collections/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/collections/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveSpecies = useCallback(
    async (item: Species) => {
      const safeId = toSafeSlug(item.id || item.commonName, 100);
      await apiRequest(`/api/admin/species/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteSpecies = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/species/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveLocation = useCallback(
    async (item: HabitatLocation) => {
      const safeId = toSafeSlug(item.id || item.name, 100);
      await apiRequest(`/api/admin/locations/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/locations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveArticle = useCallback(
    async (item: Article) => {
      const safeId = toSafeSlug(item.id || item.slug || item.title, 100);
      await apiRequest(`/api/admin/articles/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/articles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveVideo = useCallback(
    async (item: VideoItem) => {
      const safeId = toSafeSlug(item.id || item.title, 100);
      await apiRequest(`/api/admin/videos/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, id: safeId }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/videos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const saveProfile = useCallback(
    async (nextProfile: SiteProfile) => {
      await apiRequest('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(nextProfile),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const updateEnquiry = useCallback(
    async (id: string, status: EnquiryStatus, adminNotes: string) => {
      await apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
      await refreshPortfolio();
    },
    [refreshPortfolio]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      await apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await refreshPortfolio();
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
    link.download = `wildrahi-mongodb-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  // Instagram-style URL-synced Photo Modal state & methods
  const [activeModalPhoto, setActiveModalPhoto] = useState<Photograph | null>(null);

  const openPhotoModal = useCallback((photo: Photograph) => {
    setActiveModalPhoto(photo);
    if (typeof window !== 'undefined') {
      const slug = encodeURIComponent(photo.slug || photo.id);
      window.history.pushState({ photoModal: true, photoId: photo.id }, '', `/photography/${slug}`);
    }
  }, []);

  const closePhotoModal = useCallback(() => {
    setActiveModalPhoto(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/photography/')) {
      window.history.back();
    }
  }, []);

  const navigateModalPhoto = useCallback(
    (direction: -1 | 1) => {
      setActiveModalPhoto((current) => {
        if (!current) return null;
        const idx = photographs.findIndex((p) => p.id === current.id);
        if (idx === -1) return current;
        const nextIdx = idx + direction;
        if (nextIdx < 0 || nextIdx >= photographs.length) return current;
        const nextPhoto = photographs[nextIdx];
        if (typeof window !== 'undefined') {
          const slug = encodeURIComponent(nextPhoto.slug || nextPhoto.id);
          window.history.replaceState({ photoModal: true, photoId: nextPhoto.id }, '', `/photography/${slug}`);
        }
        return nextPhoto;
      });
    },
    [photographs]
  );

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/photography/')) {
        setActiveModalPhoto(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = Boolean(adminUser);

  const value = useMemo<PortfolioContextValue>(
    () => ({
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
      loading,
      adminUser,
      authReady,
      isAdmin,
      refreshPortfolio,
      signInAdmin,
      signOutAdmin,
      changeAdminPassword,
      submitEnquiry,
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
      activeModalPhoto,
      openPhotoModal,
      closePhotoModal,
      navigateModalPhoto,
    }),
    [
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
      loading,
      adminUser,
      authReady,
      isAdmin,
      refreshPortfolio,
      signInAdmin,
      signOutAdmin,
      changeAdminPassword,
      submitEnquiry,
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
