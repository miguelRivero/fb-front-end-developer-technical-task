import axios from 'axios'
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'
import type { PhotoSearchParams, PhotoSearchResult } from '../../domain/entities/Photo'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import { UNSPLASH_API_TIMEOUT_MS } from '../../constants'
import type { UnsplashPhoto, UnsplashResponse, FetchPhotosError } from '../../types/unsplash'
import { UnsplashApiAdapter } from '../adapters/UnsplashApiAdapter'

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
  private readonly client = axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
      Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
    },
    timeout: UNSPLASH_API_TIMEOUT_MS,
  })

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
    const { query, page = 1, perPage = 20 } = params

    try {
      let unsplashPhotos: UnsplashPhoto[]

      if (query) {
        // Use search endpoint when query is provided
        const response = await this.client.get<UnsplashResponse>('/search/photos', {
          params: {
            query,
            page,
            per_page: perPage,
          },
        })
        unsplashPhotos = response.data.results
      } else {
        // Use curated photos endpoint when no query
        const response = await this.client.get<UnsplashPhoto[]>('/photos', {
          params: {
            page,
            per_page: perPage,
          },
        })
        unsplashPhotos = response.data
      }

      // Convert infrastructure types to domain entities
      const photos = UnsplashApiAdapter.toDomainPhotos(unsplashPhotos)

      // Improved hasMore calculation to handle edge cases
      // Handles case where API returns empty array but indicates more pages
      return {
        photos,
        currentPage: page,
        hasMore: unsplashPhotos.length === perPage && unsplashPhotos.length > 0,
      }
    } catch (error) {
      // Handle errors and convert to domain error
      const fetchError = this.handleError(error)
      throw new PhotoRepositoryError(
        fetchError.message,
        fetchError.type,
        fetchError.originalError
      )
    }
  }

  /**
   * Handles axios errors and converts them to FetchPhotosError format.
   * 
   * Categorizes errors into specific types:
   * - rate_limit: 403 status with rate limit message
   * - api_error: 401 (invalid key) or other API errors
   * - network: No response received (connection issues)
   * - unknown: Unexpected error types
   * 
   * @param error - Error from axios request (can be any type)
   * @returns FetchPhotosError with categorized type and user-friendly message
   */
  private handleError(error: unknown): FetchPhotosError {
    if (axios.isAxiosError(error)) {
      // Rate limit exceeded (403 status)
      if (error.response?.status === 403) {
        const errorMessage = error.response.data?.errors?.[0] || ''
        if (errorMessage.toLowerCase().includes('rate limit')) {
          return {
            type: 'rate_limit',
            message: 'Unsplash API rate limit exceeded (50 requests/hour). Please try again later.',
            originalError: error,
          }
        }
      }

      // Invalid API key (401 status)
      if (error.response?.status === 401) {
        return {
          type: 'api_error',
          message: 'Invalid Unsplash API key. Check VITE_UNSPLASH_ACCESS_KEY in .env',
          originalError: error,
        }
      }

      // Network error (no response received)
      if (!error.response) {
        return {
          type: 'network',
          message: 'Network error. Please check your internet connection.',
          originalError: error,
        }
      }

      // Other API errors
      return {
        type: 'api_error',
        message: error.response.data?.errors?.[0] || error.message || 'API request failed',
        originalError: error,
      }
    }

    // Unknown error
    return {
      type: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      originalError: error,
    }
  }
}
