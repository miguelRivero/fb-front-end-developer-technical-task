/**
 * Domain Entity: Photo
 * 
 * Represents a photo in the domain model.
 * This is the core business entity, independent of external APIs or frameworks.
 * 
 * Domain-Driven Design: This entity encapsulates the core concept of a photo
 * in our application domain, separate from infrastructure concerns.
 */
export interface Photo {
  /** Unique identifier for the photo */
  readonly id: string

  /** Photo image URLs in various sizes */
  readonly urls: {
    readonly raw: string
    readonly full: string
    readonly regular: string
    readonly small: string
    readonly thumb: string
  }

  /** Alternative description for accessibility */
  readonly altDescription: string | null

  /** Photo creator information */
  readonly creator: {
    readonly name: string
    readonly username: string
    readonly profileImageUrl: string
  }

  /** Photo dimensions */
  readonly dimensions: {
    readonly width: number
    readonly height: number
  }

  /** Engagement metrics */
  readonly likes: number

  /**
   * Optional view count for the photo.
   * Note: Not all Unsplash endpoints include view stats, so this may be undefined.
   */
  readonly views?: number

  /** ISO 8601 timestamp of when photo was created */
  readonly createdAt: string
}

/**
 * Value Object: PhotoSearchParams
 * 
 * Encapsulates search parameters for photo queries.
 * Immutable value object following DDD principles.
 */
export interface PhotoSearchParams {
  readonly query?: string
  readonly page: number
  readonly perPage: number
  /**
   * Optional cancellation signal.
   * When provided, the repository may use it to cancel in-flight requests.
   */
  readonly signal?: AbortSignal
}

/**
 * Value Object: PhotoSearchResult
 * 
 * Represents the result of a photo search operation.
 */
export interface PhotoSearchResult {
  readonly photos: Photo[]
  readonly currentPage: number
  readonly hasMore: boolean
}
