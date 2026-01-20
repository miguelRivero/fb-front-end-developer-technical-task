import { useCallback, useEffect, useRef } from 'react'

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
  const sentinelNodeRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLoadTimeRef = useRef<number>(0)
  const inFlightRef = useRef(false)
  const MIN_LOAD_INTERVAL = 500 // Minimum time between loads in milliseconds

  // Memoize loadMore callback to prevent unnecessary observer re-creation
  const loadMoreCallback = useCallback(async () => {
    // Prevent duplicate loads using timestamp-based debouncing
    const now = Date.now()
    const timeSinceLastLoad = now - lastLoadTimeRef.current
    const shouldSkipLoad =
      !hasMore || loading || inFlightRef.current || timeSinceLastLoad < MIN_LOAD_INTERVAL

    if (shouldSkipLoad) {
      return
    }

    lastLoadTimeRef.current = now
    inFlightRef.current = true
    try {
      await loadMore()
    } catch (error) {
      // Reset timestamp on error to allow retry
      lastLoadTimeRef.current = 0
      if (import.meta.env.DEV) {
        console.error('Error loading more items:', error)
      }
    } finally {
      inFlightRef.current = false
    }
  }, [loadMore, hasMore, loading])

  const disconnectObserver = useCallback(() => {
    observerRef.current?.disconnect()
    observerRef.current = null
  }, [])

  const attachObserver = useCallback(
    (sentinel: HTMLDivElement | null) => {
      sentinelNodeRef.current = sentinel
      disconnectObserver()

      if (!sentinel) return
      if (!hasMore) return
      if (typeof IntersectionObserver === 'undefined') return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry?.isIntersecting) {
            void loadMoreCallback()
          }
        },
        { rootMargin, threshold }
      )

      observerRef.current.observe(sentinel)
    },
    [disconnectObserver, hasMore, loadMoreCallback, rootMargin, threshold]
  )

  // Re-bind observer when options change and we already have a node.
  useEffect(() => {
    if (!sentinelNodeRef.current) return
    attachObserver(sentinelNodeRef.current)
  }, [attachObserver])

  // Cleanup on unmount
  useEffect(() => disconnectObserver, [disconnectObserver])

  return attachObserver
}

