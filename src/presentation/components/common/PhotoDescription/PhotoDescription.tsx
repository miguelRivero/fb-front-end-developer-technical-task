import { capitalizeFirst } from '@/utils/stringUtils'
import styles from './PhotoDescription.module.scss'

/**
 * Props for PhotoDescription component
 */
interface PhotoDescriptionProps {
  /** Photo description text (can be null if not available) */
  description: string | null
  /** Maximum number of lines to display before truncating (default: 2) */
  maxLines?: number
  /** Size variant - 'sm' (small) or 'md' (medium, default) */
  size?: 'sm' | 'md'
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * PhotoDescription Component
 *
 * Displays photo description with automatic text truncation and capitalization.
 * Handles null/empty descriptions gracefully by returning null.
 *
 * Features:
 * - Multi-line text truncation with ellipsis
 * - Automatic first character capitalization
 * - Null-safe handling (returns null if no description)
 * - Size variants for different contexts
 * - CSS-based line clamping for performance
 *
 * @param props - PhotoDescription component props
 * @returns PhotoDescription component or null if no description
 *
 * @example
 * ```tsx
 * <PhotoDescription
 *   description={photo.altDescription}
 *   maxLines={2}
 *   size="md"
 * />
 * ```
 */
export function PhotoDescription({
  description,
  maxLines = 2,
  size = 'md',
  className,
}: PhotoDescriptionProps) {
  if (!description) return null

  const sizeClassName = size === 'sm' ? styles['description-sm'] : ''

  return (
    <div
      className={`${styles.description} ${sizeClassName} ${className || ''}`}
    >
      <p
        className={styles['description-text']}
        style={{
          WebkitLineClamp: maxLines,
        }}
      >
        {capitalizeFirst(description)}
      </p>
    </div>
  )
}
