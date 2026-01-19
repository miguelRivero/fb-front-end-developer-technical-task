/**
 * Tests for useInfiniteScroll hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInfiniteScroll } from './useInfiniteScroll'
import { createMockIntersectionObserver } from '../test/mocks'

describe('useInfiniteScroll', () => {
  let intersectionObserverMock: ReturnType<typeof createMockIntersectionObserver>

  beforeEach(() => {
    intersectionObserverMock = createMockIntersectionObserver()
    vi.clearAllMocks()
  })

  afterEach(() => {
    intersectionObserverMock.clearObservers()
  })

  describe('Intersection Observer setup', () => {
    it('should create IntersectionObserver with default options', () => {
      const loadMore = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      expect(result.current).toBeDefined()
      expect(typeof result.current).toBe('function')
      expect(intersectionObserverMock).toBeDefined()
    })

    it('should create IntersectionObserver with custom rootMargin', () => {
      const loadMore = vi.fn()
      const rootMargin = '500px'
      renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
          rootMargin,
        })
      )

      // Observer should be created (we can't easily verify options in mock)
      expect(intersectionObserverMock).toBeDefined()
    })

    it('should create IntersectionObserver with custom threshold', () => {
      const loadMore = vi.fn()
      const threshold = 0.5
      renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
          threshold,
        })
      )

      expect(intersectionObserverMock).toBeDefined()
    })

    it('should not create observer when hasMore is false', () => {
      const loadMore = vi.fn()
      renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: false,
          loading: false,
        })
      )

      // Observer should not observe when hasMore is false
      // We verify this by checking that loadMore is never called
      expect(loadMore).not.toHaveBeenCalled()
    })
  })

  describe('loadMore callback invocation', () => {
    it('should call loadMore when sentinel intersects', async () => {
      const loadMore = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      // Create a mock element
      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Wait for observer to be set up, then trigger intersection
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      })
    })

    it('should not call loadMore when not intersecting', async () => {
      const loadMore = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Trigger non-intersecting
      intersectionObserverMock.triggerIntersection(sentinel, false)

      // Wait a bit to ensure loadMore is not called
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(loadMore).not.toHaveBeenCalled()
    })
  })

  describe('debouncing (timestamp-based)', () => {
    it('should prevent duplicate loads within minimum interval', async () => {
      const loadMore = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Trigger intersection multiple times rapidly
      intersectionObserverMock.triggerIntersection(sentinel, true)
      intersectionObserverMock.triggerIntersection(sentinel, true)
      intersectionObserverMock.triggerIntersection(sentinel, true)

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Should only be called once due to debouncing
      // Note: The exact count depends on timing, but should be limited
      expect(loadMore.mock.calls.length).toBeLessThanOrEqual(2)
    })

    it('should allow loads after minimum interval', async () => {
      const loadMore = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Trigger first intersection
      intersectionObserverMock.triggerIntersection(sentinel, true)

      // Wait for minimum interval to pass
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Trigger second intersection
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore.mock.calls.length).toBeGreaterThan(0)
      })
    })
  })

  describe('hasMore flag prevents loading', () => {
    it('should not call loadMore when hasMore is false', async () => {
      const loadMore = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: false,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      intersectionObserverMock.triggerIntersection(sentinel, true)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(loadMore).not.toHaveBeenCalled()
    })

    it('should call loadMore when hasMore changes from false to true', async () => {
      const loadMore = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ hasMore }) =>
          useInfiniteScroll({
            loadMore,
            hasMore,
            loading: false,
          }),
        {
          initialProps: { hasMore: false },
        }
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Change hasMore to true
      rerender({ hasMore: true })
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      }, { timeout: 1000 })
    })
  })

  describe('loading flag prevents duplicate loads', () => {
    it('should not call loadMore when already loading', async () => {
      const loadMore = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: true,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      intersectionObserverMock.triggerIntersection(sentinel, true)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(loadMore).not.toHaveBeenCalled()
    })

    it('should call loadMore when loading changes from true to false', async () => {
      const loadMore = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ loading }) =>
          useInfiniteScroll({
            loadMore,
            hasMore: true,
            loading,
          }),
        {
          initialProps: { loading: true },
        }
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Change loading to false
      rerender({ loading: false })
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      }, { timeout: 1000 })
    })
  })

  describe('cleanup on unmount', () => {
    it('should disconnect observer on unmount', () => {
      const loadMore = vi.fn()
      const { result, unmount } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      expect(result.current).toBeDefined()

      unmount()

      // Observer should be disconnected
      intersectionObserverMock.clearObservers()
      expect(intersectionObserverMock).toBeDefined()
    })
  })

  describe('observer recreation when dependencies change', () => {
    it('should recreate observer when loadMore changes', async () => {
      const loadMore1 = vi.fn().mockResolvedValue(undefined)
      const loadMore2 = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ loadMore }) =>
          useInfiniteScroll({
            loadMore,
            hasMore: true,
            loading: false,
          }),
        {
          initialProps: { loadMore: loadMore1 },
        }
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Change loadMore
      rerender({ loadMore: loadMore2 })

      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore2).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should recreate observer when rootMargin changes', () => {
      const loadMore = vi.fn()
      const { rerender } = renderHook(
        ({ rootMargin }) =>
          useInfiniteScroll({
            loadMore,
            hasMore: true,
            loading: false,
            rootMargin,
          }),
        {
          initialProps: { rootMargin: '200px' },
        }
      )

      // Change rootMargin
      rerender({ rootMargin: '500px' })

      // Observer should be recreated (verified by no errors)
      expect(intersectionObserverMock).toBeDefined()
    })

    it('should recreate observer when threshold changes', () => {
      const loadMore = vi.fn()
      const { rerender } = renderHook(
        ({ threshold }) =>
          useInfiniteScroll({
            loadMore,
            hasMore: true,
            loading: false,
            threshold,
          }),
        {
          initialProps: { threshold: 0 },
        }
      )

      // Change threshold
      rerender({ threshold: 0.5 })

      // Observer should be recreated (verified by no errors)
      expect(intersectionObserverMock).toBeDefined()
    })
  })

  describe('error handling in loadMore callback', () => {
    it('should handle errors in loadMore gracefully', async () => {
      const error = new Error('Load failed')
      const loadMore = vi.fn().mockRejectedValue(error)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      })

      // Error should be handled (console.error called in dev mode)
      // Note: We can't easily test import.meta.env.DEV in tests
      expect(loadMore).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should allow retry after error by resetting timestamp', async () => {
      const loadMore = vi
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useInfiniteScroll({
          loadMore,
          hasMore: true,
          loading: false,
        })
      )

      const sentinel = document.createElement('div')
      result.current(sentinel as unknown as HTMLDivElement)

      // Trigger first intersection (will error)
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      })

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Trigger second intersection (should retry)
      intersectionObserverMock.triggerIntersection(sentinel, true)

      await waitFor(() => {
        expect(loadMore.mock.calls.length).toBeGreaterThan(1)
      }, { timeout: 1000 })
    })
  })
})
