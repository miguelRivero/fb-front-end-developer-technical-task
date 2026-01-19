import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'
import type { PhotoSearchParams, PhotoSearchResult } from '../../domain/entities/Photo'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import type { UnsplashPhoto, UnsplashResponse } from '../../types/unsplash'
import { UnsplashApiAdapter } from '../adapters/UnsplashApiAdapter'
import type { HttpClient } from '../http/createUnsplashHttpClient'
import { createUnsplashHttpClient } from '../http/createUnsplashHttpClient'
import { mapUnsplashError } from '../errors/unsplashErrorMapper'

/**
 * Infrastructure Implementation: UnsplashPhotoRepository
 * 
 * Implements the PhotoRepository interface using the Unsplash API.
 * This is the infrastructure layer's implementation of the domain repository.
 * 
 * Clean Architecture: This class depends on the domain interface (PhotoRepository),
 * not the other way around. The domain defines the contract, infrastructure implements it.
 * 
 * Responsibilities:
 * - Make HTTP requests to Unsplash API
 * - Handle API authentication and headers
 * - Transform API responses to domain entities
 * - Handle and categorize errors (rate limits, network, API errors)
 * - Implement pagination support
 * - Manage request timeouts
 */
export class UnsplashPhotoRepository implements PhotoRepository {
  private readonly httpClient: HttpClient

  constructor(httpClient: HttpClient = createUnsplashHttpClient()) {
    this.httpClient = httpClient
  }

  /**
   * Searches for photos using the Unsplash API.
   * 
   * Implements the PhotoRepository interface by fetching photos from Unsplash.
   * Supports both search queries and curated photos (when no query provided).
   * 
   * @param params - Search parameters including query, page, and perPage
   * @returns Promise resolving to PhotoSearchResult with photos and pagination info
   * @throws PhotoRepositoryError if the operation fails (rate limit, network, or API error)
   * 
   * @example
   * ```ts
   * const result = await repository.searchPhotos({
   *   query: 'nature',
   *   page: 1,
   *   perPage: 20
   * })
   * ```
   */
  async searchPhotos(params: PhotoSearchParams): Promise<PhotoSearchResult> {
    const { query, page = 1, perPage = 20, signal } = params

    try {
      let unsplashPhotos: UnsplashPhoto[]
      let hasMore: boolean

      if (query) {
        // Use search endpoint when query is provided
        const response = await this.httpClient.get<UnsplashResponse>('/search/photos', {
          params: { query, page, per_page: perPage },
          signal,
        })
        unsplashPhotos = response.results
        hasMore = page < response.total_pages
      } else {
        // Use curated photos endpoint when no query
        const response = await this.httpClient.get<UnsplashPhoto[]>('/photos', {
          params: { page, per_page: perPage },
          signal,
        })
        unsplashPhotos = response
        hasMore = unsplashPhotos.length === perPage && unsplashPhotos.length > 0
      }

      // Convert infrastructure types to domain entities
      const photos = UnsplashApiAdapter.toDomainPhotos(unsplashPhotos)

      return {
        photos,
        currentPage: page,
        hasMore,
      }
    } catch (error) {
      // Preserve domain errors thrown by lower-level infrastructure helpers.
      if (error instanceof PhotoRepositoryError) {
        throw error
      }
      const fetchError = mapUnsplashError(error)
      throw new PhotoRepositoryError(
        fetchError.message,
        fetchError.type,
        fetchError.originalError
      )
    }
  }
}
