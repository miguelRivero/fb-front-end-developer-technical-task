import type { Photo } from '../../../domain/entities/Photo'
import styles from './PhotoStats.module.scss'

/**
 * Props for PhotoStats component
 */
interface PhotoStatsProps {
  /** Photo entity to display stats for */
  photo: Photo
  /** Show views stat (default: false) */
  showViews?: boolean
  /** Show "likes" label text (default: false) */
  showLikesLabel?: boolean
  /** Use light theme (for cards/list, default: false for overlays) */
  lightTheme?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
}

/**
 * PhotoStats Component
 *
 * Displays photo statistics (likes, views) with icons.
 * Reusable across different layouts.
 */
export function PhotoStats({
  photo,
  showViews = false,
  showLikesLabel = false,
  lightTheme = false,
  size = 'md',
  className,
}: PhotoStatsProps) {
  return (
    <div className={`${styles.stats} ${styles[`stats-${size}`]} ${lightTheme ? styles.statsLight : ''} ${className || ''}`}>
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
        {showLikesLabel && <span className={styles.statLabel}> likes</span>}
      </span>
      {showViews && (
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
          <span className={styles.statLabel}>View</span>
        </span>
      )}
    </div>
  )
}
