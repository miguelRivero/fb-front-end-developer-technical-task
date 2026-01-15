import { useContext } from 'react'
import { PhotoContext } from '../context/PhotoContext'
import { FetchPhotosUseCase } from '../../application/use-cases/FetchPhotosUseCase'
import { photoRepository } from '../../infrastructure/repositories'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'

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

  const { state, dispatch } = context

  // Create use case instance with repository
  const fetchPhotosUseCase = new FetchPhotosUseCase(photoRepository)

  /**
   * Fetches photos using the provided query
   * 
   * @param query - Search query (defaults to 'nature' if not provided)
   */
  const fetchPhotos = async (query: string = 'nature') => {
    dispatch({ type: 'FETCH_START', query })

    try {
      const result = await fetchPhotosUseCase.execute({
        query,
        page: 1,
        perPage: 20,
      })

      dispatch({
        type: 'FETCH_SUCCESS',
        photos: result.photos,
        page: result.currentPage,
        hasMore: result.hasMore,
      })
    } catch (error) {
      // Ensure error is PhotoRepositoryError
      const photoError =
        error instanceof PhotoRepositoryError
          ? error
          : new PhotoRepositoryError(
              error instanceof Error ? error.message : 'Failed to fetch photos',
              'unknown',
              error
            )

      dispatch({ type: 'FETCH_ERROR', error: photoError })
    }
  }

  /**
   * Loads more photos (pagination)
   * Prevents loading if already loading or no more photos available
   */
  const loadMore = async () => {
    if (!state.hasMore || state.loading) {
      return
    }

    dispatch({ type: 'LOAD_MORE_START' })

    try {
      const result = await fetchPhotosUseCase.execute({
        query: state.searchQuery,
        page: state.currentPage + 1,
        perPage: 20,
      })

      dispatch({
        type: 'LOAD_MORE_SUCCESS',
        photos: result.photos,
        hasMore: result.hasMore,
      })
    } catch (error) {
      // Ensure error is PhotoRepositoryError
      const photoError =
        error instanceof PhotoRepositoryError
          ? error
          : new PhotoRepositoryError(
              error instanceof Error ? error.message : 'Failed to load more photos',
              'unknown',
              error
            )

      dispatch({ type: 'FETCH_ERROR', error: photoError })
    }
  }

  /**
   * Resets the photo state to initial values
   */
  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return {
    // State
    photos: state.photos,
    loading: state.loading,
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
