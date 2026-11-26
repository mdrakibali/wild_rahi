'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Photograph } from '@/types/portfolio';

interface LightboxContextValue {
  photographs: Photograph[];
  activeModalPhoto: Photograph | null;
  openPhotoModal: (photo: Photograph, customList?: Photograph[]) => void;
  closePhotoModal: () => void;
  navigateModalPhoto: (direction: -1 | 1) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

function extractPhotoIdFromPath(pathname: string | null): string | null {
  if (!pathname || !pathname.startsWith('/gallery/')) return null;
  const raw = pathname.slice('/gallery/'.length).split('/')[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export const LightboxProvider: React.FC<{
  photographs: Photograph[];
  children: React.ReactNode;
}> = ({ photographs, children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [publishedPhotos, setPublishedPhotos] = useState<Photograph[]>(() =>
    photographs.filter((p) => p.isPublished).sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [modalList, setModalList] = useState<Photograph[]>(publishedPhotos);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(() =>
    extractPhotoIdFromPath(pathname)
  );
  const returnUrlRef = useRef<string | null>(null);
  const wasOnPhotoRouteRef = useRef<boolean>(Boolean(extractPhotoIdFromPath(pathname)));

  useEffect(() => {
    const sorted = photographs
      .filter((p) => p.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setPublishedPhotos(sorted);
    setModalList((prev) => (prev.length === 0 ? sorted : prev));
  }, [photographs]);

  // Sync modal automatically on direct /gallery/[slug] visits, reloads, or Next router navigation
  useEffect(() => {
    const routeId = extractPhotoIdFromPath(pathname);
    if (routeId) {
      setActivePhotoId(routeId);
    } else if (wasOnPhotoRouteRef.current) {
      setActivePhotoId(null);
    }
    wasOnPhotoRouteRef.current = Boolean(routeId);
  }, [pathname]);

  const openPhotoModal = useCallback(
    (photo: Photograph, customList?: Photograph[]) => {
      if (customList && customList.length > 0) {
        setModalList(customList);
      } else {
        setModalList(publishedPhotos);
      }
      if (
        typeof window !== 'undefined' &&
        returnUrlRef.current === null &&
        !extractPhotoIdFromPath(pathname)
      ) {
        returnUrlRef.current = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', `/gallery/${encodeURIComponent(photo.id)}`);
      } else if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/gallery/${encodeURIComponent(photo.id)}`);
      }
      setActivePhotoId(photo.id);
    },
    [pathname, publishedPhotos]
  );

  const closePhotoModal = useCallback(() => {
    setActivePhotoId(null);
    if (typeof window !== 'undefined' && returnUrlRef.current !== null) {
      window.history.replaceState(null, '', returnUrlRef.current);
      returnUrlRef.current = null;
      return;
    }
    if (extractPhotoIdFromPath(pathname)) {
      router.replace('/gallery', { scroll: false });
    }
  }, [pathname, router]);

  const activeModalPhoto = useMemo(() => {
    if (!activePhotoId) return null;
    return (
      modalList.find((p) => p.id === activePhotoId) ||
      publishedPhotos.find((p) => p.id === activePhotoId) ||
      null
    );
  }, [activePhotoId, modalList, publishedPhotos]);

  const navigateModalPhoto = useCallback(
    (direction: -1 | 1) => {
      const list = modalList.length > 0 ? modalList : publishedPhotos;
      if (!activePhotoId || list.length === 0) return;
      const idx = list.findIndex((p) => p.id === activePhotoId);
      if (idx === -1) return;
      const nextIdx = (idx + direction + list.length) % list.length;
      const target = list[nextIdx];
      if (target) {
        setActivePhotoId(target.id);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/gallery/${encodeURIComponent(target.id)}`);
        }
      }
    },
    [activePhotoId, modalList, publishedPhotos]
  );

  const value = useMemo<LightboxContextValue>(
    () => ({
      photographs: modalList.length > 0 ? modalList : publishedPhotos,
      activeModalPhoto,
      openPhotoModal,
      closePhotoModal,
      navigateModalPhoto,
    }),
    [modalList, publishedPhotos, activeModalPhoto, openPhotoModal, closePhotoModal, navigateModalPhoto]
  );

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>;
};

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error('useLightbox must be used inside a LightboxProvider');
  }
  return ctx;
}
