import { useState } from 'react'
import type { Photo } from '../../domain/entities/Photo'
import styles from './GridLayout.module.scss'

/**
 * Props for the GridLayout component
 */
interface GridLayoutProps {
  /** Array of Photo domain entities to display */
  photos: Photo[]
  /** Optional click handler for photo interactions */
  onPhotoClick?: (photo: Photo) => void
  /** Loading state - shows skeleton loading UI */
  loading?: boolean
  /** Error state - displays error message */
  error?: Error | null
}

/**
 * GridLayout Component
 *
 * Displays photos in a responsive masonry-style grid layout.
 * The grid adapts to different screen sizes with varying column counts:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2-3 columns
 * - Desktop (> 1024px): 3-4 columns
 *
 * Features:
 * - Responsive grid using CSS Grid
 * - Graceful handling of varying photo aspect ratios
 * - Loading and empty states
 * - Clean integration with PhotoCard component
 *
 * @param props - GridLayout component props
 * @returns GridLayout component
 *
 * @example
 * ```tsx
 * <GridLayout
 *   photos={photos}
 *   onPhotoClick={(photo) => console.log('Clicked', photo.id)}
 *   loading={loading}
 * />
 * ```
 */
export function GridLayout({
  photos,
  onPhotoClick,
  loading,
  error,
}: GridLayoutProps) {
  // Handle error state
  if (error) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.errorText}>Error: {error.message}</p>
      </div>
    )
  }

  // Handle loading state
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeleton}>
            <div className={styles.skeletonImage} />
          </div>
        ))}
      </div>
    )
  }

  // Handle empty state
  if (photos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No photos to display</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {photos.map((photo) => (
        <GridItem
          key={photo.id}
          photo={photo}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  )
}

function GridItem({
  photo,
  onClick,
}: {
  photo: Photo
  onClick?: (photo: Photo) => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const altText =
    photo.altDescription || `Photo by ${photo.creator.name}` || 'Photo'

  const handleClick = () => {
    if (onClick) {
      onClick(photo)
    }
  }

  return (
    <div
      className={`${styles.gridItem} ${onClick ? styles.clickable : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={onClick ? `View photo by ${photo.creator.name}` : undefined}
    >
      <div className={styles.imageWrapper}>
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonImage} />
          </div>
        )}

        <img
          src={photo.urls.regular}
          alt={altText}
          width={photo.dimensions.width}
          height={photo.dimensions.height}
          className={`${styles.image} ${isHovered ? styles.imageHovered : ''}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className={`${styles.overlay} ${isHovered ? styles.overlayVisible : ''}`}
        >
          <div className={styles.overlayContent}>
            <h3 className={styles.photoTitle}>{altText}</h3>
            <p className={styles.photoAuthor}>by {photo.creator.name}</p>
            <div className={styles.stats}>
              <span className={styles.statItem}>
                <svg
                  className={styles.statIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {photo.likes.toLocaleString()}
              </span>
              <span className={styles.statItem}>
                <svg
                  className={styles.statIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
