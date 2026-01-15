import { useState, useCallback, useEffect } from 'react'
import type React from 'react'
import type { Photo } from '../../domain/entities/Photo'
import { capitalizeFirst } from '../../utils/stringUtils'
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

  const minSwipeDistance = 50

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
    return (
      <div className={styles.emptyState}>
        <p className={styles.errorText}>Error: {error.message}</p>
      </div>
    )
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
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No photos to display</p>
      </div>
    )
  }

  // Calculate visible photos based on current index
  // Desktop: show 3 (prev, current, next)
  // Tablet: show 2 (current, next)
  // Mobile: show 1 (current)
  const getVisiblePhotos = () => {
    const visible: Array<{ photo: Photo; position: 'prev' | 'current' | 'next' }> = []
    
    // Always include current
    visible.push({
      photo: photos[currentIndex],
      position: 'current',
    })

    // Add previous photo
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    visible.push({
      photo: photos[prevIndex],
      position: 'prev',
    })

    // Add next photo
    const nextIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    visible.push({
      photo: photos[nextIndex],
      position: 'next',
    })

    return visible
  }

  const visiblePhotos = getVisiblePhotos()

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
          <div className={styles.slidesWrapper}>
            {visiblePhotos.map(({ photo, position }) => {
              const isActive = position === 'current'
              const isHovered = hoveredPhotoId === photo.id
              return (
                <div
                  key={`${photo.id}-${position}`}
                  className={`${styles.slide} ${styles[`slide-${position}`]} ${
                    isActive ? styles.slideActive : ''
                  }`}
                  onMouseEnter={() => setHoveredPhotoId(photo.id)}
                  onMouseLeave={() => setHoveredPhotoId(null)}
                >
                  <img
                    src={photo.urls.regular}
                    alt={photo.altDescription || `Photo by ${photo.creator.name}`}
                    className={`${styles.image} ${
                      isHovered ? styles.imageHovered : ''
                    }`}
                    loading={isActive ? 'eager' : 'lazy'}
                  />
                  <div
                    className={`${styles.overlay} ${
                      isHovered ? styles.overlayVisible : ''
                    }`}
                  >
                    <div className={styles.overlayContent}>
                      <h3 className={styles.photoTitle}>
                        {capitalizeFirst(photo.altDescription) || 'Photo'}
                      </h3>
                      <p className={styles.photoAuthor}>by {photo.creator.name}</p>
                      <div className={styles.stats}>
                        <span className={styles.statItem}>
                          <svg
                            className={styles.statIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {photo.likes.toLocaleString()}
                        </span>
                        <span className={styles.statItem}>
                          <svg
                            className={styles.statIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </span>
                      </div>
                    </div>
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
