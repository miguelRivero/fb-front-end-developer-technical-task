import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { PhotoCard } from '../PhotoCard'
import type { Photo } from '../../domain/entities/Photo'
import styles from './CarouselLayout.module.scss'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
  onPhotoClick,
  loading,
  error,
}: CarouselLayoutProps) {
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

  return (
    <div className={styles.carouselContainer}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={true}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        slidesPerGroup={1}
        loop={false}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 1.5,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 2,
            spaceBetween: 32,
          },
        }}
        className={styles.swiper}
      >
        {photos.map((photo) => (
          <SwiperSlide key={photo.id} className={styles.slide}>
            <PhotoCard photo={photo} onClick={onPhotoClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
