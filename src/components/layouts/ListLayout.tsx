import { useState } from 'react'
import type { Photo } from '../../domain/entities/Photo'
import { CreatorInfo } from '../common/CreatorInfo/CreatorInfo'
import { EmptyState } from '../common/EmptyState/EmptyState'
import { PhotoDescription } from '../common/PhotoDescription/PhotoDescription'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoStats } from '../common/PhotoStats/PhotoStats'
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
    return <EmptyState error={error} />
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
    return <EmptyState />
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
              <PhotoImage
                photo={photo}
                urlType="small"
                isHovered={isHovered}
                aspectRatio="4/3"
              />
            </div>

            {/* Metadata */}
            <div className={styles.metadata}>
              <CreatorInfo photo={photo} size="md" showUsername lightTheme />
              <PhotoDescription description={photo.altDescription} maxLines={2} />
              <div className={styles.statsContainer}>
                <PhotoStats photo={photo} showViews showLikesLabel lightTheme size="sm" />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
