import React from 'react';
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
}

/**
 * Wrapper around Next.js Image that applies full optimization for local assets,
 * Supabase storage, and YouTube thumbnails while safely handling data URIs or
 * unconfigured external URLs without throwing hostname errors.
 */
export const PortfolioImage: React.FC<PortfolioImageProps> = ({
  src,
  alt,
  unoptimized,
  sizes,
  fill,
  ...rest
}) => {
  const safeSrc = src || '/assets/images/hero_sundarbans_tiger_1795067902199.jpg';
  const shouldUnoptimize =
    typeof unoptimized === 'boolean' ? unoptimized : !isOptimizableImageSrc(safeSrc);

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill={fill}
      sizes={fill ? sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : sizes}
      unoptimized={shouldUnoptimize}
      {...rest}
    />
  );
};
