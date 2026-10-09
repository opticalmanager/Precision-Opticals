import React, { useState, useEffect, useRef, useMemo } from 'react';

// Global cache of successfully loaded image URLs to eliminate repeated loading screens
const loadedImagesCache = new Set<string>();

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  fallbackSrc?: string;
  thumbnail?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Precision Optics Eyewear',
  className = '',
  fallbackSrc = '/images/clean_frame_1.png',
  thumbnail = false,
  ...rest
}) => {
  const isCached = Boolean(src && loadedImagesCache.has(src));
  const [loaded, setLoaded] = useState<boolean>(isCached);
  const [error, setError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached in browser on mount or src change
  useEffect(() => {
    if (src && loadedImagesCache.has(src)) {
      setLoaded(true);
      setError(false);
      return;
    }

    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      if (src) loadedImagesCache.add(src);
      setLoaded(true);
      setError(false);
      return;
    }

    setLoaded(Boolean(src && loadedImagesCache.has(src)));
    setError(false);
  }, [src]);

  // Optimize Shopify CDN URL resolutions (200px for thumbnails, 1000px for hero views)
  const optimizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return src;
    if (src.includes('cdn.shopify.com') && !src.includes('width=')) {
      const targetWidth = thumbnail ? 200 : 1000;
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}width=${targetWidth}`;
    }
    return src;
  }, [src, thumbnail]);

  const currentDisplaySrc = error ? fallbackSrc : (optimizedSrc || fallbackSrc);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      {/* Subtle skeleton shimmer only when not loaded and not in thumbnail */}
      {!loaded && !error && !thumbnail && (
        <div className="absolute inset-0 bg-[#FAF7F2]/50 animate-pulse flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 rounded-full border-2 border-[#E8DCCF] border-t-[#C86A28] animate-spin" />
        </div>
      )}

      <img
        ref={imgRef}
        src={currentDisplaySrc}
        alt={alt}
        decoding="async"
        className={`${className} ${
          loaded ? 'opacity-100' : 'opacity-90'
        } transition-opacity duration-200`}
        onLoad={() => {
          if (src) loadedImagesCache.add(src);
          setLoaded(true);
          setError(false);
        }}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...rest}
      />
    </div>
  );
};
