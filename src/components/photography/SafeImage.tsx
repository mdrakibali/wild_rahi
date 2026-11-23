'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackTitle,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface-dark text-muted-foreground border border-white/10 p-6 text-center ${containerClassName || className}`}
        role="img"
        aria-label={alt}
      >
        <Camera className="w-6 h-6 mb-3 opacity-60" strokeWidth={1.25} aria-hidden="true" />
        <p className="font-serif text-lg text-white/90">{fallbackTitle || alt}</p>
        <p className="font-mono text-xs text-muted-foreground mt-1">Archival Plate</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-dark ${containerClassName}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-surface-dark"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
};
