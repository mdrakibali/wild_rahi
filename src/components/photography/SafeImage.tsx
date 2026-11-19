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
        className={`flex flex-col items-center justify-center bg-[#151515] text-[#9E9E9E] border border-[#262626] p-6 text-center ${containerClassName || className}`}
        role="img"
        aria-label={alt}
      >
        <Camera className="w-6 h-6 mb-3 opacity-60" strokeWidth={1.25} aria-hidden="true" />
        <p className="font-serif text-lg text-[#E5E5E5]">{fallbackTitle || alt}</p>
        <p className="font-mono text-xs text-[#8A8A8A] mt-1">Archival Plate</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#151515] ${containerClassName}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#151515]"
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
