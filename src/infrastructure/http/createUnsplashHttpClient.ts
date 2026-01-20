import axios, { type AxiosInstance } from 'axios'

import { UNSPLASH_API_TIMEOUT_MS } from '@/constants'
import { PhotoRepositoryError } from '@/domain/repositories/PhotoRepository'

export interface HttpGetConfig {
  params?: Record<string, unknown>
  signal?: AbortSignal
}

/**
 * Minimal HTTP client wrapper used by infrastructure repositories.
 * Keeps axios configuration/creation out of repository logic.
 */
export interface HttpClient {
  get<T>(url: string, config?: HttpGetConfig): Promise<T>
}

export interface CreateUnsplashHttpClientOptions {
  /**
   * Overrides the env key (useful for tests).
   * If omitted, uses `import.meta.env.VITE_UNSPLASH_ACCESS_KEY`.
   */
  accessKey?: string
  /**
   * Override base URL for tests (rarely needed).
   */
  baseUrl?: string
  /**
   * Provide a pre-configured axios instance (tests).
   */
  axiosInstance?: AxiosInstance
}

export function createUnsplashHttpClient(
  options: CreateUnsplashHttpClientOptions = {}
): HttpClient {
  const accessKey = options.accessKey ?? import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  const baseURL = options.baseUrl ?? 'https://api.unsplash.com'

  const client =
    options.axiosInstance ??
    axios.create({
      baseURL,
      // Keep the client usable even if accessKey is missing; we throw a clear error on first request.
      headers: accessKey ? { Authorization: `Client-ID ${accessKey}` } : undefined,
      timeout: UNSPLASH_API_TIMEOUT_MS,
    })

  return {
    async get<T>(url: string, config?: HttpGetConfig): Promise<T> {
      if (!accessKey) {
        // Don’t fail app bootstrap; fail on first usage with a clear, typed domain error.
        throw new PhotoRepositoryError(
          'Invalid Unsplash API key. Check VITE_UNSPLASH_ACCESS_KEY in .env',
          'api_error'
        )
      }

      const response = await client.get<T>(url, {
        params: config?.params,
        signal: config?.signal,
      })
      return response.data
    },
  }
}

