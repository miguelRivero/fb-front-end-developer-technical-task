import styles from './EmptyState.module.scss'

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Error object to display (if provided, shows error state instead of empty state) */
  error?: Error | null
  /** Custom message to display when in empty state (default: 'No photos to display') */
  emptyMessage?: string
  /** Additional CSS class names to apply */
  className?: string
}

/**
 * EmptyState Component
 *
 * Displays empty or error states for layouts when no photos are available or an error occurs.
 * Provides consistent messaging across all layout components.
 *
 * Features:
 * - Error state display with error message
 * - Empty state display with customizable message
 * - Consistent styling across all layouts
 * - Accessible error messaging
 *
 * @param props - EmptyState component props
 * @returns EmptyState component
 *
 * @example
 * ```tsx
 * // Error state
 * <EmptyState error={error} />
 *
 * // Empty state
 * <EmptyState emptyMessage="No photos found" />
 * ```
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
