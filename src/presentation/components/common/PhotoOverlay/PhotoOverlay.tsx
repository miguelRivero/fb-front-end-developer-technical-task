import type { Photo } from '@/domain/entities/Photo'
import { PhotoStats } from '@/presentation/components/common/PhotoStats/PhotoStats'
import { capitalizeFirst } from '@/utils/stringUtils'
import styles from './PhotoOverlay.module.scss'

/**
 * Props for PhotoOverlay component
 */
interface PhotoOverlayProps {
  /** Photo domain entity containing metadata to display */
  photo: Photo
  /** Whether the overlay should be visible (typically controlled by hover state) */
  isVisible: boolean
  /** Whether to display view count statistics (default: false) */
  showViews?: boolean
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * PhotoOverlay Component
 *
 * Displays photo information overlay with title, creator information, and statistics.
 * Typically shown on hover in grid and carousel layouts to provide additional context.
 *
 * Features:
 * - Smooth fade-in/fade-out transitions
 * - Photo title (from alt description)
 * - Creator attribution
 * - Engagement statistics (likes, optional views)
 * - Dark theme optimized for overlaying on images
 *
 * @param props - PhotoOverlay component props
 * @returns PhotoOverlay component
 *
 * @example
 * ```tsx
 * <PhotoOverlay
 *   photo={photo}
 *   isVisible={isHovered}
 *   showViews={true}
 * />
 * ```
 */
export function PhotoOverlay({
  photo,
  isVisible,
  showViews = false,
  className,
}: PhotoOverlayProps) {
  const title = capitalizeFirst(photo.altDescription) || 'Photo'

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''} ${className || ''}`}
      aria-hidden={!isVisible}
      data-photo-overlay
    >
      <div className={styles.overlayContent}>
        <h3 className={styles.photoTitle}>{title}</h3>
        <p className={styles.photoAuthor}>by {photo.creator.name}</p>
        <PhotoStats photo={photo} showViews={showViews} size="sm" />
      </div>
    </div>
  )
}
