import type { Photo } from '../../../domain/entities/Photo'
import styles from './CreatorInfo.module.scss'

/**
 * Props for CreatorInfo component
 */
interface CreatorInfoProps {
  /** Photo entity to get creator info from */
  photo: Photo
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show username (default: true) */
  showUsername?: boolean
  /** Use light theme (for cards/list, default: false for overlays) */
  lightTheme?: boolean
  /** Additional className */
  className?: string
}

/**
 * CreatorInfo Component
 *
 * Displays creator avatar, name, and username.
 * Reusable across different layouts.
 */
export function CreatorInfo({
  photo,
  size = 'md',
  showUsername = true,
  lightTheme = false,
  className,
}: CreatorInfoProps) {
  return (
    <div
      className={`${styles.creatorInfo} ${styles[`creatorInfo-${size}`]} ${lightTheme ? styles['creatorInfo-light'] : ''} ${className || ''}`}
    >
      <img
        src={photo.creator.profileImageUrl}
        alt={`${photo.creator.name}'s profile`}
        className={styles.profileImage}
        width={size === 'sm' ? 24 : size === 'lg' ? 48 : 32}
        height={size === 'sm' ? 24 : size === 'lg' ? 48 : 32}
        loading="lazy"
      />
      <div className={styles.creatorDetails}>
        <span className={styles.creatorName}>{photo.creator.name}</span>
        {showUsername && (
          <span className={styles.creatorUsername}>
            @{photo.creator.username}
          </span>
        )}
      </div>
    </div>
  )
}
