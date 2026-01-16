import { useEffect, useRef, useCallback } from 'react'

/**
 * Options for useInfiniteScroll hook
 */
export interface UseInfiniteScrollOptions {
  /** Callback function to load more items */
  loadMore: () => void | Promise<void>
  /** Whether more items are available to load */
  hasMore: boolean
  /** Whether a loading operation is currently in progress */
  loading?: boolean
  /** Root margin for Intersection Observer (e.g., "200px" to trigger early) */
  rootMargin?: string
  /** Threshold for Intersection Observer (0-1, default: 0) */
  threshold?: number
}

/**
 * Custom hook: useInfiniteScroll
 * 
 * Implements infinite scroll functionality using the Intersection Observer API.
 * Automatically triggers loadMore callback when the sentinel element enters the viewport.
 * 
 * Features:
 * - Uses Intersection Observer for efficient scroll detection
 * - Prevents duplicate loads when already loading or no more items available
 * - Configurable root margin for early triggering
 * - Automatic cleanup on unmount
 * - TypeScript support with proper types
 * 
 * @param options - Configuration options for infinite scroll
 * @returns Ref to attach to the sentinel element
 * 
 * @example
 * ```tsx
 * function PhotoList() {
 *   const { loadMore, hasMore, loading } = usePhotos()
 *   const sentinelRef = useInfiniteScroll({
 *     loadMore,
 *     hasMore,
 *     loading,
 *     rootMargin: '200px',
 *   })
 *   
 *   return (
 *     <div>
 *       {photos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
 *       {hasMore && <div ref={sentinelRef} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useInfiniteScroll({
  loadMore,
  hasMore,
  loading = false,
  rootMargin = '200px',
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isLoadingRef = useRef(false)

  // Memoize loadMore callback to prevent unnecessary observer re-creation
  const loadMoreCallback = useCallback(async () => {
    // Prevent duplicate loads
    if (isLoadingRef.current || !hasMore || loading) {
      return
    }

    isLoadingRef.current = true
    try {
      await loadMore()
    } finally {
      // Reset loading flag after a short delay to prevent rapid triggers
      setTimeout(() => {
        isLoadingRef.current = false
      }, 100)
    }
  }, [loadMore, hasMore, loading])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    // Don't create observer if no more items available
    if (!hasMore) {
      return
    }

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          loadMoreCallback()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    // Observe the sentinel element
    observerRef.current.observe(sentinel)

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [loadMoreCallback, hasMore, rootMargin, threshold])

  return sentinelRef
}
