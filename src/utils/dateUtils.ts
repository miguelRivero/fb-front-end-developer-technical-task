/**
 * Date Formatting Utilities
 * 
 * Utility functions for formatting dates in a consistent format across the application.
 */

/**
 * Formats a photo creation date string to a human-readable format.
 * 
 * @param dateString - ISO 8601 date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 * 
 * @example
 * ```ts
 * formatPhotoDate('2024-01-15T10:30:00Z') // Returns "Jan 15, 2024"
 * ```
 */
export function formatPhotoDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    // Handle edge cases (null, undefined, invalid format)
    if (import.meta.env.DEV) {
      console.warn('Invalid date string provided to formatPhotoDate:', dateString)
    }
    return 'Invalid date'
  }
}
