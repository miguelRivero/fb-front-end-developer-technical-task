import { DEFAULT_SEARCH_QUERY, PAGINATION_CONFIG } from '@/constants'
import { useCallback, useContext, useEffect, useRef } from 'react'

import { PhotoContext } from '@/presentation/context/PhotoContext'
import { toUiError } from '@/presentation/errors/UiError'
import { usePhotoUseCases } from '@/presentation/context/PhotoUseCasesContext'

function getPerPageForViewport(): number {
  // Be defensive for non-browser environments / test runners.
  if (typeof window === 'undefined' || typeof window.innerWidth !== 'number') {
    return PAGINATION_CONFIG.DEFAULT_PER_PAGE
  }

  const width = window.innerWidth

  // Keep breakpoints aligned with the rest of the UI (e.g. CarouselLayout).
  if (width < 768) return PAGINATION_CONFIG.MOBILE_PER_PAGE
  if (width < 1024) return PAGINATION_CONFIG.TABLET_PER_PAGE
  return PAGINATION_CONFIG.DESKTOP_PER_PAGE
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function startNewRequest(
  abortControllerRef: React.MutableRefObject<AbortController | null>
): AbortController {
  abortControllerRef.current?.abort()
  const controller = new AbortController()
  abortControllerRef.current = controller
  return controller
}

/**
 * Custom hook: usePhotos
 * 
 * Provides access to photo state and operations from PhotoContext.
 * This hook encapsulates the logic for fetching and managing photos,
 * using the FetchPhotosUseCase to maintain Clean Architecture separation.
 * 
 * @returns Object containing photo state and operations
 * @throws Error if used outside PhotoProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { photos, loading, error, fetchPhotos, loadMore } = usePhotos()
 *   
 *   useEffect(() => {
 *     fetchPhotos('nature')
 *   }, [])
 *   
 *   return <div>{photos.length} photos</div>
 * }
 * ```
 */
export function usePhotos() {
  const context = useContext(PhotoContext)

  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider')
  }

  const { fetchPhotosUseCase } = usePhotoUseCases()
  const { state, dispatch } = context

  // AbortController ref for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null)
  // Keep perPage stable across fetch + subsequent loadMore for the same search session.
  const perPageRef = useRef<number>(PAGINATION_CONFIG.DEFAULT_PER_PAGE)

  // Cleanup on unmount
  useEffect(() => {
    const abortLatestRequest = () => {
      abortControllerRef.current?.abort()
    }

    return () => {
      // Intentionally abort the *latest* request on unmount.
      abortLatestRequest()
    }
  }, [])

  /**
   * Fetches photos using the provided query
   * 
   * @param query - Search query (defaults to DEFAULT_SEARCH_QUERY if not provided)
   */
  const fetchPhotos = useCallback(
    async (query: string = DEFAULT_SEARCH_QUERY) => {
      const controller = startNewRequest(abortControllerRef)
      perPageRef.current = getPerPageForViewport()

      dispatch({ type: 'FETCH_START', query })

      try {
        const result = await fetchPhotosUseCase.execute({
          query,
          page: 1,
          perPage: perPageRef.current,
          signal: controller.signal,
        })

        // Check if request was aborted
        if (controller.signal.aborted) {
          return
        }

        dispatch({
          type: 'FETCH_SUCCESS',
          photos: result.photos,
          page: result.currentPage,
          hasMore: result.hasMore,
        })
      } catch (error) {
        // Don't show error if request was aborted
        if (controller.signal.aborted) {
          return
        }

        // Handle AbortError gracefully (don't show as user error)
        if (isAbortError(error)) {
          return
        }

        dispatch({
          type: 'FETCH_ERROR',
          error: toUiError(error, 'Failed to fetch photos'),
        })
      }
    },
    [dispatch, fetchPhotosUseCase]
  )

  /**
   * Loads more photos (pagination)
   * Prevents loading if already loading or no more photos available
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loadingMore || state.loading) {
      return
    }

    const controller = startNewRequest(abortControllerRef)

    dispatch({ type: 'LOAD_MORE_START' })

    try {
      const result = await fetchPhotosUseCase.execute({
        query: state.searchQuery,
        page: state.currentPage + 1,
        perPage: perPageRef.current,
        signal: controller.signal,
      })

      // Check if request was aborted
      if (controller.signal.aborted) {
        return
      }

      dispatch({
        type: 'LOAD_MORE_SUCCESS',
        photos: result.photos,
        hasMore: result.hasMore,
      })
    } catch (error) {
      // Don't show error if request was aborted
      if (controller.signal.aborted) {
        return
      }

      // Handle AbortError gracefully (don't show as user error)
      if (isAbortError(error)) {
        return
      }

      dispatch({
        type: 'FETCH_ERROR',
        error: toUiError(error, 'Failed to load more photos'),
      })
    }
  }, [dispatch, fetchPhotosUseCase, state.hasMore, state.loadingMore, state.loading, state.searchQuery, state.currentPage])

  /**
   * Resets the photo state to initial values
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  return {
    // State
    photos: state.photos,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    searchQuery: state.searchQuery,
    hasMore: state.hasMore,
    currentPage: state.currentPage,

    // Actions
    fetchPhotos,
    loadMore,
    reset,
  }
}
