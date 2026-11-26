'use client';

import { useEffect } from 'react';

/**
 * Locks page scrolling on both root html and body elements while preserving
 * scrollbar layout stability so background content cannot scroll under modals.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof window === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [locked]);
}

