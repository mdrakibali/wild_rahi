'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Photograph } from '@/types/portfolio';

interface LightboxContextValue {
  photographs: Photograph[];
  activeModalPhoto: Photograph | null;
  openPhotoModal: (photo: Photograph, customList?: Photograph[]) => void;
  closePhotoModal: () => void;
  navigateModalPhoto: (direction: -1 | 1) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export const LightboxProvider: React.FC<{
  photographs: Photograph[];
  children: React.ReactNode;
}> = ({ photographs, children }) => {
  const [publishedPhotos, setPublishedPhotos] = useState<Photograph[]>(() =>
    photographs.filter((p) => p.isPublished).sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [modalList, setModalList] = useState<Photograph[]>(publishedPhotos);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const returnUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const sorted = photographs
      .filter((p) => p.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setPublishedPhotos(sorted);
    setModalList((prev) => (prev.length === 0 ? sorted : prev));
  }, [photographs]);

  const openPhotoModal = useCallback(
    (photo: Photograph, customList?: Photograph[]) => {
      if (customList && customList.length > 0) {
        setModalList(customList);
      } else {
        setModalList(publishedPhotos);
      }
      if (typeof window !== 'undefined' && returnUrlRef.current === null) {
        returnUrlRef.current = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', `/gallery/${encodeURIComponent(photo.id)}`);
      }
      setActivePhotoId(photo.id);
    },
    [publishedPhotos]
  );

  const closePhotoModal = useCallback(() => {
    setActivePhotoId(null);
    if (typeof window !== 'undefined' && returnUrlRef.current !== null) {
      window.history.replaceState(null, '', returnUrlRef.current);
      returnUrlRef.current = null;
    }
  }, []);

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
