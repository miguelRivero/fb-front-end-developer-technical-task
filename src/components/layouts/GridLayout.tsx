import type { BaseLayoutProps } from '../../types/layout'
import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'
import React from 'react'
import { UI_CONSTANTS } from '../../constants'
import styles from './GridLayout.module.scss'
import { useClickable } from '../../hooks/useClickable'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useState } from 'react'
import { useViewportWidth } from '../../hooks/useViewportWidth'
import { isBelowDesktopViewport as isBelowDesktopViewportWidth } from '../../utils/viewport'

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
  const viewportWidth = useViewportWidth()
  const isBelowDesktopViewport =
    viewportWidth !== null ? isBelowDesktopViewportWidth(viewportWidth) : false

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
          <div key={index} className={styles.skeleton} data-testid="photo-skeleton">
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
          <GridItem
            key={photo.id}
            photo={photo}
            onClick={onPhotoClick}
            isBelowDesktopViewport={isBelowDesktopViewport}
          />
        ))}
      </div>
      {/* Loading indicator for "load more" */}
      {isLoadingMore && (
        <div className={styles.loadingMore} data-testid="loading-more">
          <div className={styles.grid}>
            {Array.from({ length: UI_CONSTANTS.LOADING_MORE_COUNT }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className={styles.skeleton}
                data-testid="photo-skeleton"
              >
                <div className={styles.skeletonImage} />
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

const GridItem = React.memo(function GridItem({
  photo,
  onClick,
  isBelowDesktopViewport,
}: {
  photo: Photo
  onClick?: (photo: Photo) => void
  isBelowDesktopViewport: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const showOverlay = isBelowDesktopViewport || isHovered
  const showImageHover = !isBelowDesktopViewport && isHovered

  const { onClick: handleClick, onKeyDown, role, tabIndex, 'aria-label': ariaLabel } =
    useClickable(onClick, photo, `View photo by ${photo.creator.name || 'unknown'}`)
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
          isHovered={showImageHover}
          aspectRatio="4/3"
        />
        <PhotoOverlay photo={photo} isVisible={showOverlay} showViews />
      </div>
    </div>
  )
})
