import axios from 'axios'
import type { UnsplashPhoto, UnsplashResponse, FetchPhotosError } from '../types/unsplash'

/**
 * Configured axios client for Unsplash API requests
 *
 * This client is pre-configured with:
 * - Base URL for Unsplash API
 * - Authorization header with API access key
 * - Request timeout to prevent hanging requests
 *
 * The API key is loaded from environment variable VITE_UNSPLASH_ACCESS_KEY
 * Get your API key at: https://unsplash.com/developers
 */
export const unsplashClient = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
  },
  timeout: 10000, // 10 seconds
})

/**
 * Fetches photos from Unsplash API with pagination support
 *
 * @param params - Fetch parameters
 * @param params.query - Search query (when omitted, fetches curated photos)
 * @param params.page - Page number for pagination (defaults to 1)
 * @param params.perPage - Number of photos per page (defaults to 20)
 * @returns Promise that resolves to an array of UnsplashPhoto objects
 * @throws {FetchPhotosError} Throws typed error for rate limits, auth issues, network errors, or unknown errors
 *
 * @example
 * // Fetch curated photos (no query)
 * const photos = await fetchPhotos({})
 *
 * @example
 * // Search for specific photos with error handling
 * try {
 *   const photos = await fetchPhotos({ query: 'mountains', page: 2, perPage: 10 })
 * } catch (error) {
 *   const fetchError = error as FetchPhotosError
 *   console.error(`${fetchError.type}: ${fetchError.message}`)
 * }
 */
export async function fetchPhotos(params: {
  query?: string
  page?: number
  perPage?: number
}): Promise<UnsplashPhoto[]> {
  const { query, page = 1, perPage = 20 } = params

  try {
    if (query) {
      // Use search endpoint when query is provided
      const response = await unsplashClient.get<UnsplashResponse>('/search/photos', {
        params: {
          query,
          page,
          per_page: perPage,
        },
      })
      return response.data.results
    } else {
      // Use curated photos endpoint when no query
      const response = await unsplashClient.get<UnsplashPhoto[]>('/photos', {
        params: {
          page,
          per_page: perPage,
        },
      })
      return response.data
    }
  } catch (error) {
    // Handle axios-specific errors with detailed error types
    if (axios.isAxiosError(error)) {
      // Rate limit exceeded (403 status)
      if (error.response?.status === 403) {
        const errorMessage = error.response.data?.errors?.[0] || ''
        if (errorMessage.toLowerCase().includes('rate limit')) {
          throw {
            type: 'rate_limit',
            message: 'Unsplash API rate limit exceeded (50 requests/hour). Please try again later.',
            originalError: error,
          } as FetchPhotosError
        }
      }

      // Invalid API key (401 status)
      if (error.response?.status === 401) {
        throw {
          type: 'api_error',
          message: 'Invalid Unsplash API key. Check VITE_UNSPLASH_ACCESS_KEY in .env',
          originalError: error,
        } as FetchPhotosError
      }

      // Network error (no response received)
      if (!error.response) {
        throw {
          type: 'network',
          message: 'Network error. Please check your internet connection.',
          originalError: error,
        } as FetchPhotosError
      }
    }

    // Unknown error
    throw {
      type: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      originalError: error,
    } as FetchPhotosError
  }
}
