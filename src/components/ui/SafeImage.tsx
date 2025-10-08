'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function SafeImage({ 
  src, 
  alt, 
  fill = false, 
  width, 
  height, 
  className = '', 
  sizes,
  priority = false,
  onError 
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    if (onError) {
      onError(e);
    }
  };

  // If we're in development and the image failed, use a regular img tag
  if (useFallback || imageError || process.env.NODE_ENV === 'development') {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-destination.svg';
          if (onError) {
            onError(e);
          }
        }}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
      />
    );
  }

  try {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    );
  } catch (error) {
    // If Next.js Image fails, fall back to regular img tag
    setUseFallback(true);
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-destination.svg';
          if (onError) {
            onError(e);
          }
        }}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
      />
    );
  }
}
