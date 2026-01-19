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
 * 
 * Responsibilities:
 * - Coordinate photo fetching operations
 * - Handle errors and convert to domain errors
 * - Maintain independence from infrastructure implementation details
 * - Provide a single entry point for photo fetching logic
 */
export class FetchPhotosUseCase {
  private readonly photoRepository: PhotoRepository

  /**
   * Creates a new FetchPhotosUseCase instance.
   * 
   * @param photoRepository - Photo repository implementation (dependency injection)
   */
  constructor(photoRepository: PhotoRepository) {
    this.photoRepository = photoRepository
  }

  /**
   * Executes the photo fetching use case.
   * 
   * Delegates to the photo repository and ensures errors are properly
   * categorized as domain errors (PhotoRepositoryError).
   * 
   * @param params - Search parameters including query, page, and perPage
   * @returns Promise resolving to PhotoSearchResult with photos and pagination info
   * @throws PhotoRepositoryError if the operation fails (wraps unexpected errors)
   * 
   * @example
   * ```ts
   * const useCase = new FetchPhotosUseCase(photoRepository)
   * const result = await useCase.execute({
   *   query: 'nature',
   *   page: 1,
   *   perPage: 20
   * })
   * ```
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
