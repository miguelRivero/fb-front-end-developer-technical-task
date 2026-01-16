import type { Photo } from '../domain/entities/Photo'

/**
 * Base Layout Props
 * 
 * Shared props interface for all layout components.
 * This eliminates duplicate prop definitions across GridLayout, CardsLayout, and ListLayout.
 * 
 * Layout-specific props can extend this interface if needed.
 */
export interface BaseLayoutProps {
  /** Array of Photo domain entities to display */
  photos: Photo[]
  /** Optional click handler for photo interactions */
  onPhotoClick?: (photo: Photo) => void
  /** Loading state - shows skeleton loading UI */
  loading?: boolean
  /** Error state - displays error message */
  error?: Error | null
  /** Optional callback to load more photos (for infinite scroll) */
  loadMore?: () => void | Promise<void>
  /** Whether more photos are available to load */
  hasMore?: boolean
}
