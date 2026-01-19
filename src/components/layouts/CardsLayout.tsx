import type { BaseLayoutProps } from '../../types/layout'
import { CreatorInfo } from '../common/CreatorInfo/CreatorInfo'
import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoDescription } from '../common/PhotoDescription/PhotoDescription'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoStats } from '../common/PhotoStats/PhotoStats'
import { UI_CONSTANTS } from '../../constants'
import { formatPhotoDate } from '../../utils/dateUtils'
import styles from './CardsLayout.module.scss'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useMemo } from 'react'

/**
 * Props for the CardsLayout component
 */
interface CardsLayoutProps extends BaseLayoutProps {
  /** Loading more state - shows loading indicator for pagination */
  loadingMore?: boolean
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
export function CardsLayout({
  photos,
  onPhotoClick,
  loading,
  loadingMore = false,
  error,
  loadMore,
  hasMore = false,
}: CardsLayoutProps) {
  // Set up infinite scroll if loadMore is provided
  const sentinelRef = useInfiniteScroll({
    loadMore: loadMore || (() => {}),
    hasMore: hasMore && !!loadMore,
    loading: loadingMore, // Use dedicated loadingMore state
  })

  // `loading` is treated as initial loading (show skeleton instead of photos).
  // Pagination uses the explicit `loadingMore` prop.
  const isInitialLoading = !!loading
  const isLoadingMore = !!loadingMore

  // Handle error state
  if (error) {
    return <EmptyState error={error} />
  }

  // Handle initial loading state
  if (isInitialLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: UI_CONSTANTS.SKELETON_COUNT }).map((_, index) => (
          <div
            key={index}
            className={styles.skeletonCard}
            data-testid="photo-skeleton"
          >
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
    return <EmptyState />
  }

  return (
    <>
      <div className={styles.grid}>
        {photos.map((photo) => (
          <CardItem key={photo.id} photo={photo} onPhotoClick={onPhotoClick} />
        ))}
      </div>
    {/* Loading indicator for "load more" */}
    {isLoadingMore && (
      <div className={styles.loadingMore} data-testid="loading-more">
        <div className={styles.grid}>
          {Array.from({ length: UI_CONSTANTS.LOADING_MORE_COUNT }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className={styles.skeletonCard}
              data-testid="photo-skeleton"
            >
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {/* Sentinel element for infinite scroll */}
    {hasMore && loadMore && (
      <div
        ref={sentinelRef}
        className={styles.sentinel}
        aria-hidden="true"
        data-testid="infinite-scroll-sentinel"
      />
    )}
  </>
  )
}

function CardItem({
  photo,
  onPhotoClick,
}: {
  photo: Photo
  onPhotoClick?: (photo: Photo) => void
}) {
  // Format creation date with memoization
  const formattedDate = useMemo(
    () => formatPhotoDate(photo.createdAt),
    [photo.createdAt]
  )

  // Handle click event
  const handleClick = () => {
    if (onPhotoClick) {
      onPhotoClick(photo)
    }
  }

  return (
    <article
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
      aria-label={
        onPhotoClick ? `View photo by ${photo.creator.name}` : undefined
      }
    >
      {/* Photo Image */}
      <div className={styles.imageContainer}>
        <PhotoImage photo={photo} urlType="regular" aspectRatio="4/3" />
      </div>

      {/* Card Content */}
      <div className={styles.content}>
        <CreatorInfo photo={photo} size="md" showUsername lightTheme />
        <PhotoDescription
          description={photo.altDescription}
          maxLines={2}
          className="description"
        />
        <div className={styles.metadata}>
          <PhotoStats photo={photo} lightTheme size="sm" />
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
      </div>
    </article>
  )
}
