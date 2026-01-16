import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'
import styles from './GridLayout.module.scss'
import { useState } from 'react'
import React from 'react'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useLoadingState } from '../../hooks/useLoadingState'
import { useClickable } from '../../hooks/useClickable'
import type { BaseLayoutProps } from '../../types/layout'
import { UI_CONSTANTS } from '../../constants'

/**
 * Props for the GridLayout component
 */
interface GridLayoutProps extends BaseLayoutProps {
  /** Loading more state - shows loading indicator for pagination */
  loadingMore?: boolean
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
  loadingMore = false,
  error,
  loadMore,
  hasMore = false,
}: GridLayoutProps) {
  // Set up infinite scroll if loadMore is provided
  const sentinelRef = useInfiniteScroll({
    loadMore: loadMore || (() => {}),
    hasMore: hasMore && !!loadMore,
    loading: loadingMore, // Use dedicated loadingMore state
  })

  // Use shared loading state hook
  const { isInitialLoading, isLoadingMore: isLoadingMoreFromHook } = useLoadingState(
    loading || false,
    photos
  )
  const isLoadingMore = loadingMore || isLoadingMoreFromHook

  // Handle error state
  if (error) {
    return <EmptyState error={error} />
  }

  // Handle initial loading state
  if (isInitialLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: UI_CONSTANTS.SKELETON_COUNT }).map((_, index) => (
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
    <>
      <div className={styles.grid}>
        {photos.map((photo) => (
          <GridItem key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>
      {/* Loading indicator for "load more" */}
      {isLoadingMore && (
        <div className={styles.loadingMore}>
          <div className={styles.grid}>
            {Array.from({ length: UI_CONSTANTS.LOADING_MORE_COUNT }).map((_, index) => (
              <div key={`loading-${index}`} className={styles.skeleton}>
                <div className={styles.skeletonImage} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Sentinel element for infinite scroll */}
      {hasMore && loadMore && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      )}
    </>
  )
}

const GridItem = React.memo(function GridItem({
  photo,
  onClick,
}: {
  photo: Photo
  onClick?: (photo: Photo) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const { onClick: handleClick, onKeyDown, role, tabIndex, 'aria-label': ariaLabel } =
    useClickable(onClick, photo, `View photo by ${photo.creator.name}`)

  return (
    <div
      className={`${styles.gridItem} ${onClick ? styles.clickable : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
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
})
