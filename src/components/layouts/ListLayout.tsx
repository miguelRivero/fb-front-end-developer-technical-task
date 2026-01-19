import { CreatorInfo } from '../common/CreatorInfo/CreatorInfo'
import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoDescription } from '../common/PhotoDescription/PhotoDescription'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoStats } from '../common/PhotoStats/PhotoStats'
import styles from './ListLayout.module.scss'
import { useState } from 'react'
import React from 'react'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useClickable } from '../../hooks/useClickable'
import type { BaseLayoutProps } from '../../types/layout'
import { UI_CONSTANTS } from '../../constants'

/**
 * Props for the ListLayout component
 */
interface ListLayoutProps extends BaseLayoutProps {
  /** Loading more state - shows loading indicator for pagination */
  loadingMore?: boolean
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
  loadingMore = false,
  error,
  loadMore,
  hasMore = false,
}: ListLayoutProps) {
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
      <div className={styles.list}>
        {Array.from({ length: UI_CONSTANTS.SKELETON_COUNT }).map((_, index) => (
          <div
            key={index}
            className={styles.skeletonItem}
            data-testid="photo-skeleton"
          >
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
    <>
      <div className={styles.list}>
        {photos.map((photo) => (
          <ListItem
            key={photo.id}
            photo={photo}
            onPhotoClick={onPhotoClick}
          />
        ))}
      </div>
    {/* Loading indicator for "load more" */}
    {isLoadingMore && (
      <div className={styles.loadingMore} data-testid="loading-more">
        <div className={styles.list}>
          {Array.from({ length: UI_CONSTANTS.LOADING_MORE_COUNT }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className={styles.skeletonItem}
              data-testid="photo-skeleton"
            >
              <div className={styles.skeletonThumbnail} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
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

const ListItem = React.memo(function ListItem({
  photo,
  onPhotoClick,
}: {
  photo: Photo
  onPhotoClick?: (photo: Photo) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const { onClick: handleClick, onKeyDown, role, tabIndex, 'aria-label': ariaLabel } =
    useClickable(onPhotoClick, photo, `View photo by ${photo.creator.name}`)

  return (
    <article
      className={`${styles.listItem} ${onPhotoClick ? styles.clickable : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
    >
      {/* Photo Thumbnail */}
      <div className={styles.thumbnailContainer}>
        <PhotoImage
          photo={photo}
          urlType="small"
          isHovered={isHovered}
          aspectRatio="4/3"
          className={styles.thumbnail}
        />
      </div>

      {/* Metadata */}
      <div className={styles.metadata}>
        <CreatorInfo photo={photo} size="md" showUsername lightTheme />
        <PhotoDescription description={photo.altDescription} maxLines={2} />
        <div className={styles.statsContainer}>
          <PhotoStats
            photo={photo}
            showViews
            showLikesLabel
            lightTheme
            size="sm"
          />
        </div>
      </div>
    </article>
  )
})
