import type { PhotoSearchParams, PhotoSearchResult } from '@/domain/entities/Photo'

/**
 * Domain Repository Interface: PhotoRepository
 * 
 * Defines the contract for photo data access.
 * This interface belongs to the domain layer and defines what operations
 * are needed, not how they are implemented.
 * 
 * Clean Architecture: The domain layer defines the interface,
 * infrastructure layer implements it. This enables dependency inversion.
 * 
 * This interface abstracts away the details of where photos come from
 * (Unsplash API, local storage, mock data, etc.), allowing the domain
 * and application layers to work with a consistent interface.
 */
export interface PhotoRepository {
  /**
   * Searches for photos based on the provided parameters.
   * 
   * This method defines the contract for photo retrieval without
   * specifying implementation details. Implementations can fetch
   * from APIs, databases, or other data sources.
   * 
   * @param params - Search parameters including optional query, page number, and items per page
   * @returns Promise resolving to PhotoSearchResult containing photos array, current page, and hasMore flag
   * @throws PhotoRepositoryError if the operation fails (categorized by type: rate_limit, network, api_error, unknown)
   * 
   * @example
   * ```ts
   * const result = await photoRepository.searchPhotos({
   *   query: 'nature',
   *   page: 1,
   *   perPage: 20
   * })
   * ```
   */
  searchPhotos(params: PhotoSearchParams): Promise<PhotoSearchResult>
}

/**
 * Domain Error: PhotoRepositoryError
 * 
 * Represents errors that can occur in photo repository operations.
 * This is a domain-level error that categorizes different failure types
 * for better error handling in the application layer.
 * 
 * Error Types:
 * - rate_limit: API rate limit exceeded (403 status)
 * - network: Network connectivity issues (no response received)
 * - api_error: API-related errors (401 invalid key, 4xx/5xx responses)
 * - unknown: Unexpected or unclassified errors
 * 
 * @example
 * ```ts
 * throw new PhotoRepositoryError(
 *   'Rate limit exceeded',
 *   'rate_limit',
 *   originalAxiosError
 * )
 * ```
 */
export class PhotoRepositoryError extends Error {
  /** Categorized error type for handling different error scenarios */
  public readonly type: 'rate_limit' | 'network' | 'api_error' | 'unknown'
  /** Original error object from the underlying implementation (for debugging) */
  public readonly originalError?: unknown

  /**
   * Creates a new PhotoRepositoryError instance.
   * 
   * @param message - Human-readable error message
   * @param type - Categorized error type
   * @param originalError - Original error from infrastructure layer (optional, for debugging)
   */
  constructor(
    message: string,
    type: 'rate_limit' | 'network' | 'api_error' | 'unknown',
    originalError?: unknown
  ) {
    super(message)
    this.name = 'PhotoRepositoryError'
    this.type = type
    this.originalError = originalError
  }
}
