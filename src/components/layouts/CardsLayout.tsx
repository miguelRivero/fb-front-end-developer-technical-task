import type { Photo } from '../../domain/entities/Photo'
import styles from './CardsLayout.module.css'

/**
 * Props for the CardsLayout component
 */
interface CardsLayoutProps {
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
 * CardsLayout Component
 * 
 * Displays photos in a card-based format with comprehensive metadata.
 * Each card showcases a photo with rich information including creator details,
 * engagement metrics, dimensions, and creation date.
 * 
 * Features:
 * - Responsive card grid (1/2/3-4 columns based on screen size)
 * - Comprehensive metadata display
 * - Professional card design with shadows and rounded corners
 * - Smooth hover effects and interactions
 * - Loading and empty states
 * 
 * @param props - CardsLayout component props
 * @returns CardsLayout component
 * 
 * @example
 * ```tsx
 * <CardsLayout 
 *   photos={photos} 
 *   onPhotoClick={(photo) => console.log('Clicked', photo.id)}
 *   loading={loading}
 * />
 * ```
 */
export function CardsLayout({ photos, onPhotoClick, loading, error }: CardsLayoutProps) {
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
          <div key={index} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
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
    <div className={styles.grid}>
      {photos.map((photo) => {
        // Generate alt text with fallback chain
        const altText =
          photo.altDescription ||
          `Photo by ${photo.creator.name}` ||
          'Photo'

        // Format creation date
        const formattedDate = new Date(photo.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        // Handle click event
        const handleClick = () => {
          if (onPhotoClick) {
            onPhotoClick(photo)
          }
        }

        return (
          <article
            key={photo.id}
            className={`${styles.card} ${onPhotoClick ? styles.clickable : ''}`}
            onClick={handleClick}
            role={onPhotoClick ? 'button' : undefined}
            tabIndex={onPhotoClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onPhotoClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleClick()
              }
            }}
            aria-label={onPhotoClick ? `View photo by ${photo.creator.name}` : undefined}
          >
            {/* Photo Image */}
            <div className={styles.imageContainer}>
              <img
                src={photo.urls.regular}
                alt={altText}
                loading="lazy"
                className={styles.image}
                width={photo.dimensions.width}
                height={photo.dimensions.height}
              />
            </div>

            {/* Card Content */}
            <div className={styles.content}>
              {/* Creator Information */}
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
                  <span className={styles.creatorName}>{photo.creator.name}</span>
                  <span className={styles.creatorUsername}>@{photo.creator.username}</span>
                </div>
              </div>

              {/* Metadata Section */}
              <div className={styles.metadata}>
                {/* Likes Count */}
                <div className={styles.metadataItem}>
                  <svg
                    className={styles.metadataIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className={styles.metadataValue}>{photo.likes}</span>
                </div>

                {/* Dimensions */}
                <div className={styles.metadataItem}>
                  <svg
                    className={styles.metadataIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  <span className={styles.metadataValue}>
                    {photo.dimensions.width} × {photo.dimensions.height}
                  </span>
                </div>

                {/* Creation Date */}
                <div className={styles.metadataItem}>
                  <svg
                    className={styles.metadataIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className={styles.metadataValue}>{formattedDate}</span>
                </div>
              </div>

              {/* Alt Description (if available) */}
              {photo.altDescription && (
                <div className={styles.description}>
                  <p className={styles.descriptionText}>{photo.altDescription}</p>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
