import styles from './EmptyState.module.scss'

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Error message to display */
  error?: Error | null
  /** Empty state message */
  emptyMessage?: string
  /** Additional className */
  className?: string
}

/**
 * EmptyState Component
 *
 * Displays empty or error states for layouts.
 */
export function EmptyState({
  error,
  emptyMessage = 'No photos to display',
  className,
}: EmptyStateProps) {
  return (
    <div className={`${styles.emptyState} ${className || ''}`}>
      {error ? (
        <p className={styles.errorText}>Error: {error.message}</p>
      ) : (
        <p className={styles.emptyStateText}>{emptyMessage}</p>
      )}
    </div>
  )
}
