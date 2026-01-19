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
    // Guard against invalid runtime inputs (tests intentionally pass null/undefined)
    if (typeof dateString !== 'string' || dateString.trim() === '') {
      return 'Invalid date'
    }

    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    // If it looks like an ISO date, validate that the calendar day didn't "roll over"
    // (e.g. 2024-02-30 becomes March 1st in JS Date).
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      const year = Number(isoMatch[1])
      const month = Number(isoMatch[2]) // 1-12
      const day = Number(isoMatch[3]) // 1-31

      const isSameUtcDay =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day

      if (!isSameUtcDay) {
        return 'Invalid date'
      }
    }
    
    // Use UTC to make output stable across environments/timezones
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    // Handle edge cases (null, undefined, invalid format)
    if (import.meta.env.DEV) {
      console.warn('Invalid date string provided to formatPhotoDate:', dateString)
    }
    return 'Invalid date'
  }
}
