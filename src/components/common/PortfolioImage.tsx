'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const OPTIMIZABLE_HOSTS = ['.supabase.co', 'images.unsplash.com', 'img.youtube.com', 'i.ytimg.com'];

export function isOptimizableImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('/')) return true;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  try {
    const { hostname } = new URL(src);
    return OPTIMIZABLE_HOSTS.some(
      (host) => hostname === host || (host.startsWith('.') && hostname.endsWith(host))
    );
  } catch {
    return false;
  }
}

export interface PortfolioImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  hideLoader?: boolean;
}

/**
 * Wrapper around Next.js Image that shows an understated loading shimmer/spinner
 * until the image finishes decoding, handles cached images immediately, and
 * safely skips non-optimizable external hosts or empty sources.
 */
export const PortfolioImage: React.FC<PortfolioImageProps> = ({
  src,
  alt,
  unoptimized,
  sizes,
  fill,
  className,
  priority,
  hideLoader = false,
  ...rest
}) => {
  const safeSrc = typeof src === 'string' ? src.trim() : '';
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const isLoaded = Boolean(safeSrc && loadedSrc === safeSrc);

  useEffect(() => {
    const el = imgRef.current;
    if (safeSrc && el && el.complete && el.naturalWidth > 0) {
      setLoadedSrc(safeSrc);
    }
  }, [safeSrc]);

  if (!safeSrc) {
    return (
      <div
        aria-label={alt || 'Empty image frame'}
        className={`bg-muted ${fill ? 'absolute inset-0' : 'w-full h-full'} ${className || ''}`}
      />
    );
  }

  const shouldUnoptimize =
    typeof unoptimized === 'boolean' ? unoptimized : !isOptimizableImageSrc(safeSrc);
  const isLightboxContain = Boolean(className?.includes('object-contain'));
  const showLoadingOverlay = !hideLoader && (isLightboxContain || !priority);

  return (
    <>
      <Image
        ref={imgRef}
        src={safeSrc}
        alt={alt}
        fill={fill}
        sizes={fill ? sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : sizes}
        unoptimized={shouldUnoptimize}
        priority={priority}
        className={className}
        onLoad={() => setLoadedSrc(safeSrc)}
        onError={() => setLoadedSrc(safeSrc)}
        {...rest}
      />

      {showLoadingOverlay && !isLoaded && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-[1] flex items-center justify-center portfolio-loader-delay ${
            isLightboxContain ? 'bg-black/30' : 'portfolio-shimmer'
          }`}
        >
          {isLightboxContain && (
            <span className="w-5 h-5 rounded-full border-2 border-white/25 border-t-white/80 animate-spin" />
          )}
        </span>
      )}
    </>
  );
};
