import type { PhotoSearchParams, PhotoSearchResult } from '../entities/Photo'

/**
 * Domain Repository Interface: PhotoRepository
 * 
 * Defines the contract for photo data access.
 * This interface belongs to the domain layer and defines what operations
 * are needed, not how they are implemented.
 * 
 * Clean Architecture: The domain layer defines the interface,
 * infrastructure layer implements it. This enables dependency inversion.
 */
export interface PhotoRepository {
  /**
   * Searches for photos based on the provided parameters
   * 
   * @param params - Search parameters (query, pagination)
   * @returns Promise resolving to search results with photos
   * @throws Domain-specific error if operation fails
   */
  searchPhotos(params: PhotoSearchParams): Promise<PhotoSearchResult>
}

/**
 * Domain Error: PhotoRepositoryError
 * 
 * Represents errors that can occur in photo repository operations.
 */
export class PhotoRepositoryError extends Error {
  public readonly type: 'rate_limit' | 'network' | 'api_error' | 'unknown'
  public readonly originalError?: unknown

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
