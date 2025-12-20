"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  onLoad?: () => void;
}

// Build image candidate URLs (simplified version for main frontend)
const buildImageCandidates = (input?: string | null): string[] => {
  const out: string[] = [];
  if (!input) return out;
  
  const raw = String(input).trim();
  if (!raw) return out;
  
  // Add the original URL
  out.push(raw);
  
  // If it's a backend URL, try variations
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
  if (raw.includes('/api/images/view/') || raw.includes('/api/v1/images/view/')) {
    // Already a backend URL, use as-is
    return out;
  }
  
  // Try to normalize user-uploads paths
  if (raw.includes('user-uploads')) {
    const normalized = raw.replace(/^user-uploads[,\/]/i, 'user-uploads/').replace(/,/g, '/');
    out.push(`${backendUrl}/api/v1/images/view/${normalized}`);
  }
  
  return out;
};

const FallbackImage: React.FC<Props> = ({ 
  src, 
  alt = '', 
  className, 
  width,
  height,
  fill = false,
  onLoad 
}) => {
  const candidates = useMemo(() => buildImageCandidates(src), [src]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const current = candidates[index];

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setIndex(0);
      setLoading(true);
      setError(false);
    }
  }, [src]);

  // Preload image with CORS support
  useEffect(() => {
    if (!current) {
      setLoading(false);
      setError(true);
      return;
    }
    
    const img = new window.Image();
    
    // Set crossOrigin for cross-origin requests (backend API URLs and CloudFront URLs)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
    const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'd2cjbd1iqkwr9j.cloudfront.net';
    if (current.startsWith('http') && (
      current.includes(backendUrl) || 
      current.includes('/api/v1/images/view/') ||
      current.includes(cloudfrontDomain) ||
      current.includes('cloudfront.net')
    )) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = current;
    
    img.onload = () => {
      setLoading(false);
      setError(false);
      if (onLoad) {
        onLoad();
      }
    };
    
    img.onerror = () => {
      // Try next candidate
      if (index < candidates.length - 1) {
        setIndex(i => i + 1);
      } else {
        setLoading(false);
        setError(true);
      }
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [current, index, candidates.length, onLoad]);

  // Check if this is a cross-origin URL that needs special handling
  // CloudFront URLs and backend API URLs are cross-origin
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
  const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'd2cjbd1iqkwr9j.cloudfront.net';
  const isCrossOrigin = current && current.startsWith('http') && (
    current.includes(backendUrl) || 
    current.includes('/api/v1/images/view/') ||
    current.includes(cloudfrontDomain) ||
    current.includes('cloudfront.net')
  );

  // Show placeholder if no image or error
  if (!current || error) {
    return (
      <div 
        className={`relative flex items-center justify-center bg-gray-800 rounded-full ${className || ''}`}
        style={fill ? undefined : { width, height }}
      >
        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      </div>
    );
  }
  
  if (fill) {
    return (
      <div className={`relative ${className || ''}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-full">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {isCrossOrigin ? (
          // Use regular img tag for cross-origin images to support CORS
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={alt}
            className={`${className || ''} ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={{ 
              transition: 'opacity 300ms', 
              position: 'absolute', 
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => {
              console.log('[FallbackImage] ❌ Image error for:', current);
              setIndex((i) => i + 1);
            }}
            onLoad={() => {
              console.log('[FallbackImage] ✅ Image loaded successfully:', current, 'loading:', loading);
              setLoading(false);
              if (onLoad) onLoad();
            }}
            crossOrigin="anonymous"
          />
        ) : (
          <Image
            src={current}
            alt={alt}
            fill
            className={`${className || ''} ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 300ms' }}
            onError={() => setIndex((i) => i + 1)}
            onLoad={() => {
              setLoading(false);
              if (onLoad) onLoad();
            }}
            unoptimized
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-full">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isCrossOrigin ? (
        // Use regular img tag for cross-origin images to support CORS
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt={alt}
          width={width}
          height={height}
          className={`${className || ''} ${loading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 300ms' }}
          onError={() => setIndex((i) => i + 1)}
          onLoad={() => {
            setLoading(false);
            if (onLoad) onLoad();
          }}
          crossOrigin="anonymous"
        />
      ) : (
        <Image
          src={current}
          alt={alt}
          width={width}
          height={height}
          className={`${className || ''} ${loading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 300ms' }}
          onError={() => setIndex((i) => i + 1)}
          onLoad={() => {
            setLoading(false);
            if (onLoad) onLoad();
          }}
          unoptimized
        />
      )}
    </div>
  );
};

export default FallbackImage;

