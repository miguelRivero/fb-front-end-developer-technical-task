import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'
import type { PhotoSearchParams, PhotoSearchResult } from '../../domain/entities/Photo'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'

/**
 * Application Use Case: FetchPhotosUseCase
 * 
 * Orchestrates the business logic for fetching photos.
 * This use case belongs to the application layer and coordinates
 * between the domain and infrastructure layers.
 * 
 * Clean Architecture: Use cases contain application-specific business logic
 * and orchestrate domain operations without knowing implementation details.
 */
export class FetchPhotosUseCase {
  private readonly photoRepository: PhotoRepository

  constructor(photoRepository: PhotoRepository) {
    this.photoRepository = photoRepository
  }

  /**
   * Executes the photo fetching use case
   * 
   * @param params - Search parameters
   * @returns Promise resolving to photo search results
   * @throws PhotoRepositoryError if the operation fails
   */
  async execute(params: PhotoSearchParams): Promise<PhotoSearchResult> {
    try {
      return await this.photoRepository.searchPhotos(params)
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof PhotoRepositoryError) {
        throw error
      }
      // Wrap unexpected errors
      throw new PhotoRepositoryError(
        error instanceof Error ? error.message : 'Failed to fetch photos',
        'unknown',
        error
      )
    }
  }
}
