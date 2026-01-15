import axios from 'axios'
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'
import type { Photo, PhotoSearchParams, PhotoSearchResult } from '../../domain/entities/Photo'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
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
 */
export class UnsplashPhotoRepository implements PhotoRepository {
  private readonly client = axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
      Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
    },
    timeout: 10000, // 10 seconds
  })

  async searchPhotos(params: PhotoSearchParams): Promise<PhotoSearchResult> {
    const { query = 'nature', page = 1, perPage = 20 } = params

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

      return {
        photos,
        currentPage: page,
        hasMore: unsplashPhotos.length === perPage,
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
   * Handles axios errors and converts them to FetchPhotosError format
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
