import type { Photo } from '../../../../domain/entities/Photo'
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
          aria-label={`views: ${formattedViews || views}`}
        >
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
