import { useCallback, useEffect, useState } from 'react'

import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'
import type React from 'react'
import styles from './CarouselLayout.module.scss'

/**
 * Props for the CarouselLayout component
 */
interface CarouselLayoutProps {
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
 * CarouselLayout Component
 *
 * Displays photos in a swipeable carousel/slider layout using Swiper.
 * Provides a focused, one-photo-at-a-time viewing experience with smooth navigation.
 *
 * Features:
 * - Touch/swipe support for mobile devices
 * - Navigation arrows (prev/next) for desktop
 * - Pagination dots indicator
 * - Responsive design with adaptive slides per view
 * - Smooth transitions between slides
 * - Loading and empty states
 * - Clean integration with PhotoCard component
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
export function CarouselLayout({
  photos,
  loading,
  error,
}: CarouselLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null)
  const [slidesPerView, setSlidesPerView] = useState(1)

  const minSwipeDistance = 50

  // Calculate slides per view based on window width
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(3)
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(1)
      }
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 300)
    },
    [isTransitioning]
  )

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    goToSlide(newIndex)
  }, [currentIndex, photos.length, goToSlide])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }, [currentIndex, photos.length, goToSlide])

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
      <div
        className={styles.carousel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.imageContainer}>
          <div 
            className={`${styles.slidesWrapper} ${isTransitioning ? styles.transitioning : ''}`}
            style={{
              transform: `translateX(calc(-${currentIndex} * (100% + 1rem) / ${slidesPerView}))`,
            }}
          >
            {photos.map((photo, index) => {
              const isActive = index === currentIndex
              const isHovered = hoveredPhotoId === photo.id
              return (
                <div
                  key={photo.id}
                  className={styles.slide}
                  onMouseEnter={() => setHoveredPhotoId(photo.id)}
                  onMouseLeave={() => setHoveredPhotoId(null)}
                >
                  <div className={styles.slideImageWrapper}>
                    <PhotoImage
                      photo={photo}
                      urlType="regular"
                      isHovered={isHovered}
                      aspectRatio="4/3"
                      priority={isActive}
                    />
                    <PhotoOverlay
                      photo={photo}
                      isVisible={isHovered}
                      showViews
                      className={isActive ? styles.overlayLarge : ''}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className={styles.navButton}
          aria-label="Previous photo"
        >
          <svg
            className={styles.navIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className={`${styles.navButton} ${styles.navButtonNext}`}
          aria-label="Next photo"
        >
          <svg
            className={styles.navIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dot Indicators */}
      <div className={styles.dots}>
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.dot} ${
              index === currentIndex ? styles.dotActive : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
