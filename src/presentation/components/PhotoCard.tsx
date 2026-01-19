import type { Photo } from '../../domain/entities/Photo'
import styles from './PhotoCard.module.scss'

/**
 * Props for the PhotoCard component
 */
interface PhotoCardProps {
  /** Photo domain entity to display */
  photo: Photo
  /** Optional click handler for photo interactions */
  onClick?: (photo: Photo) => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * PhotoCard Component
 *
 * A reusable component that displays a single photo with essential information.
 * This component handles photo display, alt text, creator attribution, and basic interactions.
 *
 * Features:
 * - Responsive image display with proper aspect ratio
 * - Creator attribution with profile image
 * - Photo metadata (likes count)
 * - Hover effects and click interactions
 * - Full accessibility support
 *
 * @param props - PhotoCard component props
 * @returns PhotoCard component
 *
 * @example
 * ```tsx
 * <PhotoCard
 *   photo={photo}
 *   onClick={(photo) => console.log('Clicked', photo.id)}
 * />
 * ```
 */
export function PhotoCard({ photo, onClick, className }: PhotoCardProps) {
  // Generate alt text with fallback chain
  const altText = photo.altDescription || `Photo by ${photo.creator.name}` || 'Photo'

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(photo)
    }
  }

  // Handle image error (fallback to placeholder or hide)
  const handleImageError = () => {
    // Could set a placeholder image here if needed
    // For now, we'll let the browser handle it
    console.warn('Failed to load image:', photo.urls.regular)
  }

  return (
    <article
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className || ''}`}
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
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <img
          src={photo.urls.regular}
          alt={altText}
          loading="lazy"
          className={styles.image}
          onError={handleImageError}
          width={photo.dimensions.width}
          height={photo.dimensions.height}
        />
      </div>

      {/* Metadata Overlay */}
      <div className={styles.metadata}>
        {/* Creator Info */}
        <div className={styles.creatorInfo}>
          <img
            src={photo.creator.profileImageUrl}
            alt={`${photo.creator.name}'s profile`}
            className={styles.profileImage}
            width={32}
            height={32}
            loading="lazy"
          />
          <div className={styles.creatorDetails}>
            <span className={styles.creatorName}>{photo.creator.name}</span>
            <span className={styles.creatorUsername}>@{photo.creator.username}</span>
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
}

