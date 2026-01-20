import type { FetchPhotosError, UnsplashError } from '@/types/unsplash'

type AxiosLikeError = {
  isAxiosError?: boolean
  message?: string
  code?: string
  response?: {
    status?: number
    data?: unknown
  }
}

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error
}

function getUnsplashErrorMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const maybe = data as Partial<UnsplashError>
  const msg = Array.isArray(maybe.errors) ? maybe.errors[0] : undefined
  return typeof msg === 'string' && msg.trim().length > 0 ? msg : undefined
}

function isTimeoutError(error: AxiosLikeError): boolean {
  const code = typeof error.code === 'string' ? error.code : ''
  const message = typeof error.message === 'string' ? error.message : ''
  return code === 'ECONNABORTED' || message.toLowerCase().includes('timeout')
}

/**
 * Maps unknown infra errors from Unsplash/axios into a stable error type
 * used by the repository to raise `PhotoRepositoryError`.
 */
export function mapUnsplashError(error: unknown): FetchPhotosError {
  if (isAxiosLikeError(error)) {
    const status = error.response?.status
    const apiMessage = getUnsplashErrorMessage(error.response?.data)
    const message = apiMessage || error.message || 'API request failed'

    // Rate limit: Unsplash uses 429; some proxies return 403 with a message.
    if (status === 429) {
      return {
        type: 'rate_limit',
        message:
          'Unsplash API rate limit exceeded (50 requests/hour). Please try again later.',
        originalError: error,
      }
    }

    if (status === 403 && apiMessage?.toLowerCase().includes('rate limit')) {
      return {
        type: 'rate_limit',
        message:
          'Unsplash API rate limit exceeded (50 requests/hour). Please try again later.',
        originalError: error,
      }
    }

    // Invalid API key
    if (status === 401) {
      return {
        type: 'api_error',
        message:
          'Invalid Unsplash API key. Check VITE_UNSPLASH_ACCESS_KEY in .env',
        originalError: error,
      }
    }

    // Timeouts and missing response are network-like failures.
    if (isTimeoutError(error)) {
      return {
        type: 'network',
        message: 'Request timed out. Please try again.',
        originalError: error,
      }
    }

    if (!error.response) {
      return {
        type: 'network',
        message: 'Network error. Please check your internet connection.',
        originalError: error,
      }
    }

    return {
      type: 'api_error',
      message,
      originalError: error,
    }
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    originalError: error,
  }
}

