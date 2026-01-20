import type { KeyboardEvent, SyntheticEvent } from 'react'

import type { Photo } from '../../../../domain/entities/Photo'
import styles from './PhotoImage.module.scss'
import { useState } from 'react'

/**
 * Props for PhotoImage component
 */
interface PhotoImageProps {
  /** Photo domain entity containing image URLs and metadata */
  photo: Photo
  /** Image URL size to use - 'thumb' (smallest), 'small', 'regular' (default), or 'full' (largest) */
  urlType?: 'thumb' | 'small' | 'regular' | 'full'
  /** Whether the image is currently hovered (enables hover effects) */
  isHovered?: boolean
  /** Aspect ratio constraint - 'auto' (natural), '4/3', '16/10', or 'square' */
  aspectRatio?: 'auto' | '4/3' | '16/10' | 'square'
  /** Whether to load image with priority (eager loading) - useful for above-the-fold images */
  priority?: boolean
  /**
   * Optional `sizes` attribute for responsive images.
   * Recommended when using the default `srcSet` (width descriptors).
   */
  sizes?: string
  /**
   * Optional `srcSet` attribute override.
   * If omitted, the component builds a reasonable default from `photo.urls`.
   */
  srcSet?: string
  /** Additional CSS class names to apply */
  className?: string
  /** Optional click handler for image interactions */
  onClick?: () => void
  /** Callback function invoked when image successfully loads */
  onImageLoad?: () => void
  /** Callback function invoked when image fails to load */
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void
}

function buildDefaultSrcSet(urls: Photo['urls']): string | undefined {
  const candidates: Array<{ url: string; width: number }> = [
    { url: urls.thumb, width: 200 },
    { url: urls.small, width: 400 },
    { url: urls.regular, width: 1080 },
    { url: urls.full, width: 2000 },
  ]

  const valid = candidates.filter((c) => typeof c.url === 'string' && c.url.trim().length > 0)
  if (valid.length < 2) return undefined

  return valid.map((c) => `${c.url} ${c.width}w`).join(', ')
}

/**
 * PhotoImage Component
 *
 * Reusable photo image component with hover effects, loading states, and error handling.
 * Provides consistent image display across all layouts with proper accessibility support.
 *
 * Features:
 * - Automatic skeleton loading state
 * - Error state handling with fallback UI
 * - Hover effects for interactive images
 * - Configurable aspect ratios
 * - Lazy/eager loading support
 * - Proper alt text generation
 * - Responsive image sizing
 *
 * @param props - PhotoImage component props
 * @returns PhotoImage component
 *
 * @example
 * ```tsx
 * <PhotoImage
 *   photo={photo}
 *   urlType="regular"
 *   isHovered={isHovered}
 *   aspectRatio="4/3"
 *   onImageLoad={() => console.log('Image loaded')}
 * />
 * ```
 */
export function PhotoImage({
  photo,
  urlType = 'regular',
  isHovered = false,
  aspectRatio = 'auto',
  priority = false,
  sizes,
  srcSet,
  className,
  onClick,
  onImageLoad,
  onError,
}: PhotoImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const imageUrlCandidates = [
    photo.urls[urlType],
    photo.urls.regular,
    photo.urls.small,
    photo.urls.thumb,
    photo.urls.full,
    photo.urls.raw,
  ]

  const imageUrl = imageUrlCandidates.find((url) => typeof url === 'string' && url.trim().length > 0)
  // Improved alt text with better null handling
  const altText =
    photo.altDescription || (photo.creator?.name ? `Photo by ${photo.creator.name}` : 'Photo')

  const resolvedSrcSet =
    typeof srcSet === 'string' && srcSet.trim().length > 0 ? srcSet : buildDefaultSrcSet(photo.urls)

  const handleLoad = () => {
    setIsLoaded(true)
    onImageLoad?.()
  }

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    onError?.(event)
    if (import.meta.env.DEV) {
      console.warn('Image failed to load:', imageUrl)
    }
  }

  const handleWrapperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return

    if (event.key === 'Enter') {
      onClick()
      return
    }

    if (event.key === ' ') {
      // Prevent the browser from scrolling the page when Space is pressed.
      event.preventDefault()
      onClick()
    }
  }

  const interactiveWrapperProps = onClick
    ? {
        tabIndex: 0,
        role: 'button' as const,
        onKeyDown: handleWrapperKeyDown,
      }
    : {}

  // If there is no usable image URL, render the same placeholder UI as the error state.
  if (!imageUrl) {
    return (
      <div
        className={`${styles.imageWrapper} ${styles[`aspect-${aspectRatio}`]} ${className || ''} ${onClick ? styles.clickable : ''}`}
        onClick={onClick}
        {...interactiveWrapperProps}
      >
        <div className={styles.errorState} aria-label="Image failed to load">
          <svg
            className={styles.errorIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={styles.errorText}>Image unavailable</span>
        </div>
      </div>
    )
  }

  // Show error state if image failed to load
  if (hasError) {
    return (
      <div
        className={`${styles.imageWrapper} ${styles[`aspect-${aspectRatio}`]} ${className || ''} ${onClick ? styles.clickable : ''}`}
        onClick={onClick}
        {...interactiveWrapperProps}
      >
        <div className={styles.errorState} aria-label="Image failed to load">
          <svg
            className={styles.errorIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={styles.errorText}>Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.imageWrapper} ${styles[`aspect-${aspectRatio}`]} ${className || ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      {...interactiveWrapperProps}
    >
      {!isLoaded && (
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonImage} />
        </div>
      )}
      <img
        src={imageUrl}
        alt={altText}
        width={photo.dimensions.width}
        height={photo.dimensions.height}
        className={`${styles.image} ${isHovered ? styles.imageHovered : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        srcSet={resolvedSrcSet}
        sizes={resolvedSrcSet ? sizes : undefined}
      />
    </div>
  )
}
