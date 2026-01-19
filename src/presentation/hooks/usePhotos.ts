import { useContext, useCallback, useRef, useEffect } from 'react'
import { PhotoContext } from '../context/PhotoContext'
import { usePhotoUseCases } from '../context/PhotoUseCasesContext'
import { DEFAULT_SEARCH_QUERY, PAGINATION_CONFIG } from '../../constants'
import { toUiError } from '../errors/UiError'

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  /**
   * Fetches photos using the provided query
   * 
   * @param query - Search query (defaults to DEFAULT_SEARCH_QUERY if not provided)
   */
  const fetchPhotos = useCallback(
    async (query: string = DEFAULT_SEARCH_QUERY) => {
      // Cancel previous request if it exists
      abortControllerRef.current?.abort()

      // Create new AbortController for this request
      const controller = new AbortController()
      abortControllerRef.current = controller

      dispatch({ type: 'FETCH_START', query })

      try {
        const result = await fetchPhotosUseCase.execute({
          query,
          page: 1,
          perPage: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
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
        if (error instanceof Error && error.name === 'AbortError') {
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

    // Cancel previous request if it exists
    abortControllerRef.current?.abort()

    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    dispatch({ type: 'LOAD_MORE_START' })

    try {
      const result = await fetchPhotosUseCase.execute({
        query: state.searchQuery,
        page: state.currentPage + 1,
        perPage: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
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
      if (error instanceof Error && error.name === 'AbortError') {
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
