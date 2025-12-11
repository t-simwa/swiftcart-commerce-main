import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

/**
 * Optimized Image component with lazy loading, error handling, and loading states
 * For Vite/React applications (not Next.js)
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  aspectRatio = 'auto',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}



