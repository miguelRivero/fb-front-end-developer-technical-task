import type { Photo } from '../../domain/entities/Photo'
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
      {photos.map((photo) => {
        // Generate alt text with fallback chain
        const altText =
          photo.altDescription || `Photo by ${photo.creator.name}` || 'Photo'

        // Handle click event
        const handleClick = () => {
          if (onPhotoClick) {
            onPhotoClick(photo)
          }
        }

        return (
          <article
            key={photo.id}
            className={`${styles.listItem} ${onPhotoClick ? styles.clickable : ''}`}
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
                className={styles.thumbnail}
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

              {/* Likes Count */}
              <div className={styles.likes}>
                <svg
                  className={styles.likeIcon}
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
                <span className={styles.likesCount}>{photo.likes}</span>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
