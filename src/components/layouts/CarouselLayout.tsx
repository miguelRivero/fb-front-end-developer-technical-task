import { useCallback, useEffect, useState, useRef } from 'react'

import { EmptyState } from '../common/EmptyState/EmptyState'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoImage } from '../common/PhotoImage/PhotoImage'
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'
import type React from 'react'
import styles from './CarouselLayout.module.scss'
import { UI_CONSTANTS } from '../../constants'

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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())

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
    return () => {
      // Clean up preloaded images when component unmounts or dependencies change
      preloadedImages.forEach((img) => {
        img.src = ''
      })
      preloadedImages.clear()
    }
  }, [currentIndex, slidesPerView, photos, loadedImages, handleImageLoad])

  // Cleanup on unmount
  useEffect(() => {
    // Capture ref value to avoid stale closure
    const preloadedImages = preloadedImagesRef.current
    return () => {
      preloadedImages.forEach((img) => {
        img.src = ''
      })
      preloadedImages.clear()
    }
  }, [])

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
      if (isTransitioning || photos.length === 0) return
      // Clamp index to valid range, accounting for slides per view
      // When showing multiple slides, adjust so we don't go past the end
      let validIndex = Math.max(0, Math.min(index, photos.length - 1))
      
      // If we're showing multiple slides and near the end, adjust to show the last slide properly
      if (slidesPerView > 1 && validIndex + slidesPerView > photos.length) {
        validIndex = Math.max(0, photos.length - slidesPerView)
      }
      
      setIsTransitioning(true)
      setCurrentIndex(validIndex)
      setTimeout(() => setIsTransitioning(false), UI_CONSTANTS.TRANSITION_DURATION)
    },
    [isTransitioning, photos.length, slidesPerView]
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
              const isImageLoaded = loadedImages.has(photo.id)
              const shouldShowLoading = !isImageLoaded
              
              return (
                <div
                  key={photo.id}
                  className={styles.slide}
                  data-testid="carousel-slide"
                  onMouseEnter={() => setHoveredPhotoId(photo.id)}
                  onMouseLeave={() => setHoveredPhotoId(null)}
                >
                  <div className={styles.slideImageWrapper}>
                    {shouldShowLoading && (
                      <div className={styles.slideSkeleton} aria-hidden="true">
                        <div className={styles.skeletonImage} />
                      </div>
                    )}
                    <PhotoImage
                      photo={photo}
                      urlType="regular"
                      isHovered={isHovered}
                      aspectRatio="4/3"
                      priority={isActive}
                      onImageLoad={() => handleImageLoad(photo.id)}
                    />
                    {isImageLoaded && (
                      <PhotoOverlay
                        photo={photo}
                        isVisible={isHovered}
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
          {photos.map((photo, index) => {
            // Only render dot if photo is valid
            if (!photo) return null
            return (
              <button
                key={photo.id || index}
                onClick={() => goToSlide(index)}
                className={`${styles.dot} ${
                  index === currentIndex ? styles.dotActive : ''
                }`}
                aria-label={`Go to slide ${index + 1} of ${photos.length}`}
                data-testid="carousel-dot"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
