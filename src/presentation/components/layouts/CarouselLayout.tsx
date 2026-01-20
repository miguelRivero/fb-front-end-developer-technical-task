import { ChevronLeftIcon, ChevronRightIcon } from '@/presentation/components/common/icons'
import { RESPONSIVE_BREAKPOINTS, UI_CONSTANTS } from '@/constants'
import {
  getCarouselSlidesPerView,
  isBelowDesktopViewport as isBelowDesktopViewportWidth,
} from '@/utils/viewport'
import { useCallback, useEffect, useRef, useState } from 'react'

import { EmptyState } from '@/presentation/components/common/EmptyState/EmptyState'
import type { Photo } from '@/domain/entities/Photo'
import { PhotoImage } from '@/presentation/components/common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '@/presentation/components/common/PhotoOverlay/PhotoOverlay'
import type React from 'react'
import styles from './CarouselLayout.module.scss'
import { useViewportWidth } from '@/presentation/hooks/useViewportWidth'

/**
 * Props for the CarouselLayout component
 */
interface CarouselLayoutProps {
  /** Array of Photo domain entities to display */
  photos: Photo[]
  /** Optional click handler invoked when a photo is clicked */
  onPhotoClick?: (photo: Photo) => void
  /** Loading state - shows skeleton loading UI */
  loading?: boolean
  /** Error state - displays error message */
  error?: Error | null
}

/**
 * CarouselLayout Component
 *
 * Displays photos in a swipeable carousel/slider layout using a custom implementation
 * (CSS transforms + touch and keyboard navigation).
 * Provides a focused, one-photo-at-a-time viewing experience with smooth navigation.
 *
 * Features:
 * - Touch/swipe support for mobile devices
 * - Navigation arrows (prev/next) for desktop
 * - Pagination dots indicator
 * - Responsive design with adaptive slides per view
 * - Smooth transitions between slides
 * - Loading and empty states
 * - Click handling via `onPhotoClick`
 *
 * @param props - CarouselLayout component props
 * @returns CarouselLayout component
 *
 * @example
 * ```tsx
 * <CarouselLayout
 *   photos={photos}
 *   onPhotoClick={(photo) => console.log('Clicked', photo.id)}
 *   loading={loading}
 * />
 * ```
 */
export function CarouselLayout({ photos, onPhotoClick, loading, error }: CarouselLayoutProps) {
  const viewportWidth = useViewportWidth()
  // Default to desktop behavior in non-browser environments.
  const widthForLayout = viewportWidth ?? RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH
  const slidesPerView = getCarouselSlidesPerView(widthForLayout)
  const isBelowDesktopViewport = isBelowDesktopViewportWidth(widthForLayout)
  const maxStartIndex = Math.max(0, photos.length - slidesPerView)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  const minSwipeDistance = UI_CONSTANTS.SWIPE_MIN_DISTANCE

  // Ensure currentIndex is always valid when photos change
  useEffect(() => {
    if (photos.length === 0) {
      // Reset index when photos array becomes empty
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(0)
      return
    }

    // Adjust currentIndex if it's too close to the end when showing multiple slides
    if (slidesPerView > 1 && currentIndex + slidesPerView > photos.length) {
      const maxIndex = Math.max(0, photos.length - slidesPerView)
      if (currentIndex > maxIndex) {
        setCurrentIndex(maxIndex)
      }
    } else if (currentIndex >= photos.length) {
      setCurrentIndex(Math.max(0, photos.length - 1))
    }
  }, [photos.length, currentIndex, slidesPerView])

  // Track when images are loaded
  const handleImageLoad = useCallback((photoId: string) => {
    setLoadedImages((prev) => new Set(prev).add(photoId))
  }, [])

  // Preload images for visible slides
  useEffect(() => {
    if (photos.length === 0) return

    const indicesToPreload = new Set<number>()

    // Always preload current
    indicesToPreload.add(currentIndex)

    // Preload adjacent slides based on viewport
    if (slidesPerView >= 2) {
      // Preload next
      const nextIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1
      indicesToPreload.add(nextIndex)

      // Preload previous
      const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
      indicesToPreload.add(prevIndex)

      if (slidesPerView >= 3) {
        // Preload one more in each direction
        const nextNextIndex = nextIndex === photos.length - 1 ? 0 : nextIndex + 1
        indicesToPreload.add(nextNextIndex)

        const prevPrevIndex = prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        indicesToPreload.add(prevPrevIndex)
      }
    }

    // Preload images
    indicesToPreload.forEach((index) => {
      const photo = photos[index]
      if (photo && !loadedImages.has(photo.id)) {
        // Clean up old preload if it exists
        const oldImg = preloadedImagesRef.current.get(photo.id)
        if (oldImg) {
          oldImg.src = ''
          preloadedImagesRef.current.delete(photo.id)
        }

        const img = new Image()
        img.src = photo.urls.regular
        img.onload = () => handleImageLoad(photo.id)
        preloadedImagesRef.current.set(photo.id, img)
      }
    })

    // Cleanup function - capture ref value to avoid stale closure
    const preloadedImages = preloadedImagesRef.current
    const keepIndices = indicesToPreload
    const photoIndexById = new Map<string, number>()
    photos.forEach((photo, index) => {
      photoIndexById.set(photo.id, index)
    })
    return () => {
      // Only evict images that are outside the current preload window.
      // This preserves already-preloaded adjacent images across effect re-runs.
      Array.from(preloadedImages.entries()).forEach(([photoId, img]) => {
        const index = photoIndexById.get(photoId)

        // If photo no longer exists, or it's outside the keep window, evict it.
        if (index === undefined || !keepIndices.has(index)) {
          if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src)
          }
          img.src = ''
          preloadedImages.delete(photoId)
        }
      })
    }
  }, [currentIndex, slidesPerView, photos, loadedImages, handleImageLoad])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    // Capture ref value to avoid stale closure
    const preloadedImages = preloadedImagesRef.current
    return () => {
      isMountedRef.current = false
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
      preloadedImages.forEach((img) => {
        img.src = ''
      })
      preloadedImages.clear()
    }
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (!isMountedRef.current || isTransitioning || photos.length === 0) return
      // Clamp to a valid start index so we don't render an incomplete "page"
      // (e.g. avoid start index 9 when showing 3 slides per view).
      const validIndex = Math.max(0, Math.min(index, maxStartIndex))

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }

      if (!isMountedRef.current) return
      setIsTransitioning(true)
      setCurrentIndex(validIndex)
      transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null
        if (!isMountedRef.current) return
        setIsTransitioning(false)
      }, UI_CONSTANTS.TRANSITION_DURATION)
    },
    [isTransitioning, maxStartIndex, photos.length]
  )

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? maxStartIndex : currentIndex - 1
    goToSlide(newIndex)
  }, [currentIndex, maxStartIndex, goToSlide])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === maxStartIndex ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }, [currentIndex, maxStartIndex, goToSlide])

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) goToNext()
    if (isRightSwipe) goToPrevious()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Handle error state
  if (error) {
    return <EmptyState error={error} />
  }

  // Handle loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
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
    <div className={styles.carouselContainer}>
      {/* Main Carousel */}
      <div className={styles.carousel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className={styles.imageContainer}>
          <div
            className={`${styles.slidesWrapper} ${isTransitioning ? styles.transitioning : ''}`}
            style={{
              transform: `translateX(calc(-${currentIndex} * (100% + 1rem) / ${slidesPerView}))`,
            }}
          >
            {photos.map((photo, index) => {
              const isActive = index === currentIndex
              const isImageLoaded = loadedImages.has(photo.id)
              const shouldShowLoading = !isImageLoaded
              const showOverlay = isBelowDesktopViewport ? isActive : false

              return (
                <div key={photo.id} className={styles.slide} data-testid="carousel-slide">
                  <div className={styles.slideImageWrapper}>
                    {shouldShowLoading && (
                      <div className={styles.slideSkeleton} aria-hidden="true">
                        <div className={styles.skeletonImage} />
                      </div>
                    )}
                    <PhotoImage
                      photo={photo}
                      urlType="regular"
                      aspectRatio="4/3"
                      priority={isActive}
                      onClick={onPhotoClick ? () => onPhotoClick(photo) : undefined}
                      onImageLoad={() => handleImageLoad(photo.id)}
                      sizes="100vw"
                    />
                    {isImageLoaded && (
                      <PhotoOverlay
                        photo={photo}
                        isVisible={showOverlay}
                        showViews
                        className={isActive ? styles.overlayLarge : ''}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={goToPrevious} className={styles.navButton} aria-label="Previous photo">
          <ChevronLeftIcon className={styles.navIcon} />
        </button>
        <button
          onClick={goToNext}
          className={`${styles.navButton} ${styles.navButtonNext}`}
          aria-label="Next photo"
        >
          <ChevronRightIcon className={styles.navIcon} />
        </button>
      </div>

      {/* Mobile Progress Bar */}
      {photos.length > 0 && (
        <div className={styles.mobileProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / photos.length) * 100}%`,
              }}
            />
          </div>
          <div className={styles.progressText}>
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Desktop/Tablet Dot Indicators */}
      {photos.length > 0 && (
        <div className={styles.dots}>
          {Array.from({ length: maxStartIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              aria-label={`Go to position ${index + 1} of ${maxStartIndex + 1}`}
              data-testid="carousel-dot"
            />
          ))}
        </div>
      )}
    </div>
  )
}
