import { useState } from 'react'
import type { Photo } from '../../domain/entities/Photo'
import { EmptyState } from '../common/EmptyState/EmptyState'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'
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
    return <EmptyState error={error} />
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
    return <EmptyState />
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
  const [isHovered, setIsHovered] = useState(false)

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
        <PhotoImage
          photo={photo}
          urlType="regular"
          isHovered={isHovered}
          aspectRatio="4/3"
        />
        <PhotoOverlay photo={photo} isVisible={isHovered} showViews />
      </div>
    </div>
  )
}
