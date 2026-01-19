import type { Photo } from '../../../domain/entities/Photo'
import styles from './CreatorInfo.module.scss'

/**
 * Props for CreatorInfo component
 */
interface CreatorInfoProps {
  /** Photo domain entity containing creator information */
  photo: Photo
  /** Size variant - 'sm' (small), 'md' (medium, default), or 'lg' (large) */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to display the creator's username (default: true) */
  showUsername?: boolean
  /** Use light theme styling (for cards/list layouts, default: false for dark overlays) */
  lightTheme?: boolean
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * CreatorInfo Component
 *
 * Displays creator attribution with profile image, name, and optional username.
 * Reusable across different layouts with theme and size variants.
 *
 * Features:
 * - Profile image avatar
 * - Creator name display
 * - Optional username with @ prefix
 * - Theme variants (dark for overlays, light for cards)
 * - Size variants for different contexts
 * - Lazy loading for profile images
 *
 * @param props - CreatorInfo component props
 * @returns CreatorInfo component
 *
 * @example
 * ```tsx
 * <CreatorInfo
 *   photo={photo}
 *   size="md"
 *   showUsername={true}
 *   lightTheme={true}
 * />
 * ```
 */
export function CreatorInfo({
  photo,
  size = 'md',
  showUsername = true,
  lightTheme = false,
  className,
}: CreatorInfoProps) {
  const username = photo.creator.username
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
        {showUsername && username && (
          <span className={`${styles.creatorUsername} creatorUsername`}>
            @{username}
          </span>
        )}
      </div>
    </div>
  )
}
