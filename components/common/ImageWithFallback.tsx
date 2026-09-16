import React, { useState, useEffect } from 'react';
import { Glasses } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Precision Optics Eyewear',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
  ...rest
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none scrollbar-none">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-stone-50/80 animate-pulse flex items-center justify-center pointer-events-none">
          <Glasses className="w-6 h-6 text-stone-300 animate-bounce" />
        </div>
      )}

      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        decoding="async"
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...rest}
      />
    </div>
  );
};
