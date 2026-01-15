/**
 * TypeScript interfaces for Unsplash API responses
 * Based on Unsplash API documentation: https://unsplash.com/documentation
 */

/**
 * Represents a single photo from the Unsplash API
 * Contains photo metadata, URLs, and user information
 */
export interface UnsplashPhoto {
  /** Unique identifier for the photo */
  id: string

  /** Various sizes of the photo URL */
  urls: {
    /** Raw unprocessed photo */
    raw: string
    /** Full size (default) */
    full: string
    /** Regular size (1080px width) */
    regular: string
    /** Small size (400px width) */
    small: string
    /** Thumbnail (200px width) */
    thumb: string
  }

  /** Alternative description for accessibility */
  alt_description: string | null

  /** Photo creator information */
  user: {
    /** Display name of the photographer */
    name: string
    /** Username of the photographer */
    username: string
    /** Photographer's profile image */
    profile_image: {
      /** Small profile image URL */
      small: string
    }
  }

  /** Photo width in pixels */
  width: number

  /** Photo height in pixels */
  height: number

  /** Number of likes the photo has received */
  likes: number

  /** ISO 8601 timestamp of when photo was created */
  created_at: string
}

/**
 * Response structure for Unsplash search endpoints
 * Contains paginated results and metadata
 */
export interface UnsplashResponse {
  /** Array of photo results */
  results: UnsplashPhoto[]

  /** Total number of results available */
  total: number

  /** Total number of pages available */
  total_pages: number
}

/**
 * Error response structure from Unsplash API
 * Returned when API requests fail
 */
export interface UnsplashError {
  /** Array of error messages */
  errors: string[]
}

/**
 * Custom error type for photo fetching operations
 * Provides specific error types to enable appropriate user-facing messages
 */
export type FetchPhotosError = {
  /** Type of error that occurred */
  type: 'rate_limit' | 'network' | 'api_error' | 'unknown'
  /** Human-readable error message */
  message: string
  /** Original error object for debugging */
  originalError?: unknown
}
