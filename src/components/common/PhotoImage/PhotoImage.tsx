import { useState } from 'react'
import type { Photo } from '../../../domain/entities/Photo'
import styles from './PhotoImage.module.scss'

/**
 * Props for PhotoImage component
 */
interface PhotoImageProps {
  /** Photo entity */
  photo: Photo
  /** Image URL to use (default: regular) */
  urlType?: 'thumb' | 'small' | 'regular' | 'full'
  /** Whether image is hovered */
  isHovered?: boolean
  /** Aspect ratio (default: 'auto') */
  aspectRatio?: 'auto' | '4/3' | '16/10' | 'square'
  /** Loading priority */
  priority?: boolean
  /** Additional className */
  className?: string
  /** Click handler */
  onClick?: () => void
}

/**
 * PhotoImage Component
 *
 * Reusable photo image component with hover effects and loading states.
 */
export function PhotoImage({
  photo,
  urlType = 'regular',
  isHovered = false,
  aspectRatio = 'auto',
  priority = false,
  className,
  onClick,
}: PhotoImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const imageUrl = photo.urls[urlType]
  const altText = photo.altDescription || `Photo by ${photo.creator.name}` || 'Photo'

  return (
    <div
      className={`${styles.imageWrapper} ${styles[`aspect-${aspectRatio}`]} ${className || ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonImage} />
        </div>
      )}
      <img
        src={imageUrl}
        alt={altText}
        width={photo.dimensions.width}
        height={photo.dimensions.height}
        className={`${styles.image} ${isHovered ? styles.imageHovered : ''}`}
        onLoad={() => setIsLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}
