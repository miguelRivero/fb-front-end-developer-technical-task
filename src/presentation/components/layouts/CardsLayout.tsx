import type { BaseLayoutProps } from '@/types/layout'
import { ArrowsExpandIcon, CalendarIcon } from '@/presentation/components/common/icons'
import { CreatorInfo } from '@/presentation/components/common/CreatorInfo/CreatorInfo'
import { EmptyState } from '@/presentation/components/common/EmptyState/EmptyState'
import type { Photo } from '@/domain/entities/Photo'
import { PhotoDescription } from '@/presentation/components/common/PhotoDescription/PhotoDescription'
import { PhotoImage } from '@/presentation/components/common/PhotoImage/PhotoImage'
import { PhotoStats } from '@/presentation/components/common/PhotoStats/PhotoStats'
import { UI_CONSTANTS } from '@/constants'
import { formatPhotoDate } from '@/utils/dateUtils'
import styles from './CardsLayout.module.scss'
import { useClickable } from '@/presentation/hooks/useClickable'
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll'
import React, { useMemo } from 'react'

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
          <div key={index} className={styles.skeletonCard} data-testid="photo-skeleton">
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

const CardItem = React.memo(function CardItem({
  photo,
  onPhotoClick,
}: {
  photo: Photo
  onPhotoClick?: (photo: Photo) => void
}) {
  // Format creation date with memoization
  const formattedDate = useMemo(() => formatPhotoDate(photo.createdAt), [photo.createdAt])

  const { onClick, onKeyDown, role, tabIndex, 'aria-label': ariaLabel } = useClickable(
    onPhotoClick,
    photo,
    `View photo by ${photo.creator.name || 'unknown'}`
  )

  return (
    <article
      className={`${styles.card} ${onPhotoClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
    >
      {/* Photo Image */}
      <div className={styles.imageContainer}>
        <PhotoImage
          photo={photo}
          urlType="regular"
          aspectRatio="4/3"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      {/* Card Content */}
      <div className={styles.content}>
        <CreatorInfo photo={photo} size="md" showUsername lightTheme />
        <PhotoDescription description={photo.altDescription} maxLines={2} className="description" />
        <div className={styles.metadata}>
          <PhotoStats photo={photo} lightTheme size="sm" />
          {/* Dimensions */}
          <div className={styles.metadataItem}>
            <ArrowsExpandIcon className={styles.metadataIcon} />
            <span className={styles.metadataValue}>
              {photo.dimensions.width} × {photo.dimensions.height}
            </span>
          </div>

          {/* Creation Date */}
          <div className={styles.metadataItem}>
            <CalendarIcon className={styles.metadataIcon} />
            <span className={styles.metadataValue}>{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  )
})
