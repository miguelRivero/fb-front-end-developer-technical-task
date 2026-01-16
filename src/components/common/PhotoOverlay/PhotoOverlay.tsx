import type { Photo } from '../../../domain/entities/Photo'
import { PhotoStats } from '../PhotoStats/PhotoStats'
import { capitalizeFirst } from '../../../utils/stringUtils'
import styles from './PhotoOverlay.module.scss'

/**
 * Props for PhotoOverlay component
 */
interface PhotoOverlayProps {
  /** Photo entity to display */
  photo: Photo
  /** Whether overlay is visible */
  isVisible: boolean
  /** Show views stat (default: false) */
  showViews?: boolean
  /** Additional className */
  className?: string
}

/**
 * PhotoOverlay Component
 *
 * Displays photo information overlay with title, creator, and stats.
 * Used in grid and carousel layouts.
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
    >
      <div className={styles.overlayContent}>
        <h3 className={styles.photoTitle}>{title}</h3>
        <p className={styles.photoAuthor}>by {photo.creator.name}</p>
        <PhotoStats photo={photo} showViews={showViews} size="sm" />
      </div>
    </div>
  )
}
