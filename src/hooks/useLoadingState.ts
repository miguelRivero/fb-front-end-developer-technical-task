import { useMemo } from 'react'
import type { Photo } from '../domain/entities/Photo'

/**
 * Custom hook: useLoadingState
 * 
 * Extracts loading state logic to determine if we're in initial loading
 * or loading more state. This eliminates duplicate logic across layout components.
 * 
 * @param loading - Whether a loading operation is in progress
 * @param photos - Array of photos currently loaded
 * @returns Object with isInitialLoading and isLoadingMore flags
 * 
 * @example
 * ```tsx
 * const { isInitialLoading, isLoadingMore } = useLoadingState(loading, photos)
 * ```
 */
export function useLoadingState(loading: boolean, photos: Photo[]) {
  return useMemo(
    () => ({
      isInitialLoading: loading && photos.length === 0,
      isLoadingMore: loading && photos.length > 0,
    }),
    [loading, photos.length]
  )
}
