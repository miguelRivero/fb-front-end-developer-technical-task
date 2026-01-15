import { useState } from 'react'
import type { Photo } from '../../domain/entities/Photo'
import { capitalizeFirst } from '../../utils/stringUtils'
import styles from './ListLayout.module.scss'

/**
 * Props for the ListLayout component
 */
interface ListLayoutProps {
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
 * ListLayout Component
 *
 * Displays photos in a vertical scrolling list format.
 * Each list item shows a photo thumbnail on the left and metadata on the right.
 * This layout is ideal for browsing photos with their metadata in a clean, minimal format.
 *
 * Features:
 * - Vertical scrolling list
 * - Photo thumbnails with metadata
 * - Creator information (name, username)
 * - Likes count display
 * - Hover effects and interactions
 * - Loading and empty states
 * - Responsive design
 *
 * @param props - ListLayout component props
 * @returns ListLayout component
 *
 * @example
 * ```tsx
 * <ListLayout
 *   photos={photos}
 *   onPhotoClick={(photo) => console.log('Clicked', photo.id)}
 *   loading={loading}
 * />
 * ```
 */
export function ListLayout({
  photos,
  onPhotoClick,
  loading,
  error,
}: ListLayoutProps) {
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
      <div className={styles.list}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonItem}>
            <div className={styles.skeletonThumbnail} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
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
    <div className={styles.list}>
      {photos.map((photo, index) => {
        // Generate alt text with fallback chain
        const altText =
          photo.altDescription || `Photo by ${photo.creator.name}` || 'Photo'

        // Handle click event
        const handleClick = () => {
          if (onPhotoClick) {
            onPhotoClick(photo)
          }
        }

        const isLast = index === photos.length - 1

        const [isHovered, setIsHovered] = useState(false)

        return (
          <article
            key={photo.id}
            className={`${styles.listItem} ${onPhotoClick ? styles.clickable : ''} ${isLast ? styles.lastItem : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            role={onPhotoClick ? 'button' : undefined}
            tabIndex={onPhotoClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onPhotoClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleClick()
              }
            }}
            aria-label={
              onPhotoClick ? `View photo by ${photo.creator.name}` : undefined
            }
          >
            {/* Photo Thumbnail */}
            <div className={styles.thumbnailContainer}>
              <img
                src={photo.urls.small}
                alt={altText}
                loading="lazy"
                className={`${styles.thumbnail} ${isHovered ? styles.thumbnailHovered : ''}`}
                width={photo.dimensions.width}
                height={photo.dimensions.height}
              />
            </div>

            {/* Metadata */}
            <div className={styles.metadata}>
              {/* Creator Info */}
              <div className={styles.creatorInfo}>
                <img
                  src={photo.creator.profileImageUrl}
                  alt={`${photo.creator.name}'s profile`}
                  className={styles.profileImage}
                  width={40}
                  height={40}
                  loading="lazy"
                />
                <div className={styles.creatorDetails}>
                  <span className={styles.creatorName}>
                    {photo.creator.name}
                  </span>
                  <span className={styles.creatorUsername}>
                    @{photo.creator.username}
                  </span>
                </div>
              </div>

              {/* Description */}
              {photo.altDescription && (
                <div className={styles.description}>
                  <p className={styles.descriptionText}>
                    {capitalizeFirst(photo.altDescription)}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className={styles.stats}>
                <div className={styles.likes}>
                  <svg
                    className={styles.likeIcon}
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
                  <span className={styles.likesCount}>
                    {photo.likes.toLocaleString()} likes
                  </span>
                </div>
                <div className={styles.views}>
                  <svg
                    className={styles.viewIcon}
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
                  <span className={styles.viewsCount}>View</span>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
