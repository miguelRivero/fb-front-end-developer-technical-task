import { EyeIcon, HeartOutlineIcon } from '@/presentation/components/common/icons'

import type { Photo } from '@/domain/entities/Photo'
import styles from './PhotoStats.module.scss'

/**
 * Props for PhotoStats component
 */
interface PhotoStatsProps {
  /** Photo domain entity containing engagement metrics */
  photo: Photo
  /** Whether to display view count statistics (default: false) */
  showViews?: boolean
  /** Whether to show "likes" text label after the number (default: false) */
  showLikesLabel?: boolean
  /** Use light theme styling (for cards/list layouts, default: false for dark overlays) */
  lightTheme?: boolean
  /** Size variant - 'sm' (small), 'md' (medium, default), or 'lg' (large) */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * PhotoStats Component
 *
 * Displays photo engagement statistics (likes, optional views) with icons.
 * Reusable across different layouts with theme and size variants.
 *
 * Features:
 * - Formatted number display (e.g., "1,234")
 * - Icon-based visual indicators
 * - Theme variants (dark for overlays, light for cards)
 * - Size variants for different contexts
 * - Accessible icon usage
 *
 * @param props - PhotoStats component props
 * @returns PhotoStats component
 *
 * @example
 * ```tsx
 * <PhotoStats
 *   photo={photo}
 *   showViews={true}
 *   showLikesLabel={true}
 *   lightTheme={true}
 *   size="sm"
 * />
 * ```
 */
export function PhotoStats({
  photo,
  showViews = false,
  showLikesLabel = false,
  lightTheme = false,
  size = 'md',
  className,
}: PhotoStatsProps) {
  const formattedLikes = photo.likes.toLocaleString()
  const views = photo.views ?? 0
  const formattedViews = views.toLocaleString()

  return (
    <div
      className={`${styles.stats} ${styles[`stats-${size}`]} ${lightTheme ? styles.statsLight : ''} ${className || ''}`}
    >
      <span className={styles.statItem} aria-label={`Likes: ${formattedLikes}`}>
        <HeartOutlineIcon className={styles.statIcon} />
        <span aria-hidden="true">{formattedLikes}</span>
        {showLikesLabel && (
          <span className={styles.statLabel} aria-hidden="true">
            {' '}
            likes
          </span>
        )}
      </span>
      {showViews && (
        <span
          className={styles.statItem}
          aria-label={`Views: ${formattedViews}`}
        >
          <EyeIcon className={styles.statIcon} />
          <span aria-hidden="true">{formattedViews || views}</span>
          <span className={styles.statLabel} aria-hidden="true">
            {' '}
            views
          </span>
        </span>
      )}
    </div>
  )
}
