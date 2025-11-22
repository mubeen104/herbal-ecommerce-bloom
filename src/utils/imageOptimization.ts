/**
 * Image optimization utilities for responsive loading and caching
 */

/**
 * Generate responsive image srcSet with Supabase Image Transformation
 * Supports efficient loading on different device sizes
 */
export const getImageSrcSet = (
  imageUrl: string,
  altSizes?: { width: number; dpi?: '1x' | '2x' }[]
): string => {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const defaultSizes = [
    { width: 320, dpi: '1x' as const },
    { width: 320, dpi: '2x' as const },
    { width: 640, dpi: '1x' as const },
    { width: 640, dpi: '2x' as const },
    { width: 1024, dpi: '1x' as const },
    { width: 1280, dpi: '2x' as const },
  ];

  const sizes = altSizes || defaultSizes;

  return sizes
    .map(
      (size) =>
        `${imageUrl}?w=${size.width}&q=80 ${size.width}w${size.dpi ? ` ${size.dpi}` : ''}`
    )
    .join(', ');
};

/**
 * Get optimized image URL with width and quality parameters
 * Uses Supabase Image Transformation API
 */
export const getOptimizedImageUrl = (
  imageUrl: string,
  width?: number,
  quality: number = 80
): string => {
  if (!imageUrl) return '';
  if (!imageUrl.startsWith('http')) return imageUrl;

  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());

  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${params.toString()}`;
};

/**
 * Preload an image for faster subsequent viewing
 */
export const preloadImage = (imageUrl: string): void => {
  if (!imageUrl) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  document.head.appendChild(link);
};

/**
 * Prefetch multiple images (for next page, gallery, etc)
 */
export const prefetchImages = (imageUrls: string[]): void => {
  imageUrls.forEach((url) => {
    if (url) {
      const img = new Image();
      img.src = getOptimizedImageUrl(url, 300);
    }
  });
};

/**
 * Convert image URL to blur placeholder for LQIP (Low Quality Image Placeholder)
 */
export const getBlurPlaceholder = (imageUrl: string): string => {
  if (!imageUrl || !imageUrl.startsWith('http')) return '';
  return getOptimizedImageUrl(imageUrl, 20, 20);
};
