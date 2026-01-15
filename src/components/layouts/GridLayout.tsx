import type { Photo } from '../../domain/entities/Photo'
import { PhotoCard } from '../PhotoCard'
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
        <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
      ))}
    </div>
  )
}
