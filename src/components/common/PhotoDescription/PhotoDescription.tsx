import { capitalizeFirst } from '../../../utils/stringUtils'
import styles from './PhotoDescription.module.scss'

/**
 * Props for PhotoDescription component
 */
interface PhotoDescriptionProps {
  /** Description text */
  description: string | null
  /** Maximum number of lines to show (default: 2) */
  maxLines?: number
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional className */
  className?: string
}

/**
 * PhotoDescription Component
 *
 * Displays photo description with text truncation.
 * Automatically capitalizes first character.
 */
export function PhotoDescription({
  description,
  maxLines = 2,
  size = 'md',
  className,
}: PhotoDescriptionProps) {
  if (!description) return null

  return (
    <div
      className={`${styles.description} ${styles[`description-${size}`]} ${className || ''}`}
    >
      <p
        className={styles.descriptionText}
        style={{
          WebkitLineClamp: maxLines,
        }}
      >
        {capitalizeFirst(description)}
      </p>
    </div>
  )
}
