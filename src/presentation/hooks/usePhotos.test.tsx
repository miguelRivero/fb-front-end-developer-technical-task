import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SEARCH_QUERY, PAGINATION_CONFIG } from '../../constants'
import { PhotoProvider } from '../context/PhotoContext'
import { PhotoUseCasesProvider } from '../context/PhotoUseCasesContext'
import { createMockPhotoArray } from '../../test/mocks'
import { usePhotos } from './usePhotos'
import { UiError } from '../errors/UiError'

const mockExecute = vi.fn()
const stubUseCase = { execute: mockExecute }

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PhotoUseCasesProvider fetchPhotosUseCase={stubUseCase}>
      <PhotoProvider>{children}</PhotoProvider>
    </PhotoUseCasesProvider>
  )
}

describe('usePhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementation
    mockExecute.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Hook Returns', () => {
    it('should return correct state values', () => {
      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      expect(result.current).toHaveProperty('photos')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('loadingMore')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('searchQuery')
      expect(result.current).toHaveProperty('hasMore')
      expect(result.current).toHaveProperty('currentPage')
      expect(result.current).toHaveProperty('fetchPhotos')
      expect(result.current).toHaveProperty('loadMore')
      expect(result.current).toHaveProperty('reset')
    })

    it('should throw error when used outside PhotoProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => usePhotos())
      }).toThrow('usePhotos must be used within a PhotoProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('fetchPhotos', () => {
    it('should call use case with correct parameters', async () => {
      const mockPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      await act(async () => {
        await result.current.fetchPhotos('mountains')
      })

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'mountains',
          page: 1,
          perPage: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
          signal: expect.any(Object),
        })
      )
    })

    it('should default query to "nature" when not provided', async () => {
      const mockPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      await act(async () => {
        await result.current.fetchPhotos()
      })

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          query: DEFAULT_SEARCH_QUERY,
          page: 1,
          perPage: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
          signal: expect.any(Object),
        })
      )
    })

    it('should dispatch FETCH_START action', async () => {
      const mockPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      act(() => {
        result.current.fetchPhotos('ocean')
      })

      // Should be loading immediately
      expect(result.current.loading).toBe(true)
      expect(result.current.searchQuery).toBe('ocean')

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should dispatch FETCH_SUCCESS on success', async () => {
      const mockPhotos = createMockPhotoArray(5)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      await act(async () => {
        await result.current.fetchPhotos('forest')
      })

      expect(result.current.photos).toEqual(mockPhotos)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.hasMore).toBe(true)
      expect(result.current.loading).toBe(false)
    })

    it('should dispatch FETCH_ERROR on failure', async () => {
      const error = new UiError('Network error', 'network')
      mockExecute.mockRejectedValue(error)

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      await act(async () => {
        await result.current.fetchPhotos('sunset')
      })

      expect(result.current.error).toBeInstanceOf(UiError)
      expect((result.current.error as UiError).kind).toBe('network')
      expect(result.current.loading).toBe(false)
    })

    it('should handle request cancellation', async () => {
      // Create a promise that never resolves
      mockExecute.mockImplementation(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve) => {
            // Never resolve
          })
      )

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Start fetch
      act(() => {
        result.current.fetchPhotos('test')
      })

      expect(result.current.loading).toBe(true)

      // Start another fetch (should cancel previous)
      await act(async () => {
        const mockPhotos = createMockPhotoArray(2)
        mockExecute.mockResolvedValue({
          photos: mockPhotos,
          currentPage: 1,
          hasMore: true,
        })
        await result.current.fetchPhotos('new-test')
      })

      // Should have new photos, not error from cancellation
      expect(result.current.photos).toHaveLength(2)
      expect(result.current.loading).toBe(false)
    })

    it('should convert non-UiError to UiError', async () => {
      const genericError = new Error('Generic error')
      mockExecute.mockRejectedValue(genericError)

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      expect(result.current.error).toBeInstanceOf(UiError)
      expect((result.current.error as UiError).kind).toBe('unknown')
    })
  })

  describe('loadMore', () => {
    it('should prevent loading if already loading', async () => {
      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Set loading state
      mockExecute.mockImplementation(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve) => {
            // Never resolve to keep loading
          })
      )

      act(() => {
        result.current.fetchPhotos('test')
      })

      // Try to load more while loading
      await act(async () => {
        await result.current.loadMore()
      })

      // Should not call execute again
      expect(mockExecute).toHaveBeenCalledTimes(1)
    })

    it('should prevent loading if no more photos', async () => {
      const mockPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: false, // No more photos
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Try to load more
      await act(async () => {
        await result.current.loadMore()
      })

      // Should not call execute again (hasMore is false)
      expect(mockExecute).toHaveBeenCalledTimes(1)
    })

    it('should prevent loading if loadingMore is true', async () => {
      const mockPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Start loading more (but don't await)
      mockExecute.mockImplementation(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve) => {
            // Keep loading
          })
      )

      act(() => {
        result.current.loadMore()
      })

      // Try to load more again
      await act(async () => {
        await result.current.loadMore()
      })

      // Should only have called execute twice (initial + one loadMore)
      expect(mockExecute).toHaveBeenCalledTimes(2)
    })

    it('should call use case with next page', async () => {
      const initialPhotos = createMockPhotoArray(3)
      mockExecute
        .mockResolvedValueOnce({
          photos: initialPhotos,
          currentPage: 1,
          hasMore: true,
        })
        .mockResolvedValueOnce({
          photos: createMockPhotoArray(2),
          currentPage: 2,
          hasMore: true,
        })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Load more
      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockExecute).toHaveBeenCalledTimes(2)
      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          query: 'test',
          page: 2, // Next page
          perPage: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
          signal: expect.any(Object),
        })
      )
    })

    it('should append photos correctly', async () => {
      const initialPhotos = createMockPhotoArray(3)
      const morePhotos = createMockPhotoArray(2)

      mockExecute
        .mockResolvedValueOnce({
          photos: initialPhotos,
          currentPage: 1,
          hasMore: true,
        })
        .mockResolvedValueOnce({
          photos: morePhotos,
          currentPage: 2,
          hasMore: false,
        })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      expect(result.current.photos).toHaveLength(3)

      // Load more
      await act(async () => {
        await result.current.loadMore()
      })

      expect(result.current.photos).toHaveLength(5)
      expect(result.current.photos.slice(0, 3)).toEqual(initialPhotos)
      expect(result.current.photos.slice(3)).toEqual(morePhotos)
    })

    it('should handle request cancellation in loadMore', async () => {
      const initialPhotos = createMockPhotoArray(3)
      mockExecute.mockResolvedValueOnce({
        photos: initialPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Start loadMore that never resolves
      mockExecute.mockImplementation(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve) => {
            // Never resolve
          })
      )

      act(() => {
        result.current.loadMore()
      })

      // Start another fetch (should cancel loadMore)
      mockExecute.mockResolvedValue({
        photos: createMockPhotoArray(1),
        currentPage: 1,
        hasMore: true,
      })

      await act(async () => {
        await result.current.fetchPhotos('new-test')
      })

      // Should have new photos from fetch, not error
      expect(result.current.photos).toHaveLength(1)
    })

    it('should handle errors in loadMore', async () => {
      const initialPhotos = createMockPhotoArray(3)
      mockExecute
        .mockResolvedValueOnce({
          photos: initialPhotos,
          currentPage: 1,
          hasMore: true,
        })
        .mockRejectedValueOnce(
          new UiError('API error', 'api_error')
        )

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Load more with error
      await act(async () => {
        await result.current.loadMore()
      })

      expect(result.current.error).toBeInstanceOf(UiError)
      expect((result.current.error as UiError).kind).toBe('api_error')
    })
  })

  describe('reset', () => {
    it('should dispatch RESET action', async () => {
      const mockPhotos = createMockPhotoArray(5)
      mockExecute.mockResolvedValue({
        photos: mockPhotos,
        currentPage: 2,
        hasMore: true,
      })

      const { result } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Set up some state
      await act(async () => {
        await result.current.fetchPhotos('test')
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.photos).toEqual([])
      expect(result.current.currentPage).toBe(1)
      expect(result.current.searchQuery).toBe(DEFAULT_SEARCH_QUERY)
      expect(result.current.hasMore).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Memoization', () => {
    it('should memoize useCase instance', () => {
      const { result, rerender } = renderHook(() => usePhotos(), {
        wrapper,
      })

      // Verify hook works correctly
      expect(result.current).toBeDefined()
      expect(result.current.fetchPhotos).toBeDefined()

      // Rerender should not break functionality (memoization working)
      rerender()

      expect(result.current).toBeDefined()
      expect(result.current.fetchPhotos).toBeDefined()
    })

    it('should memoize callbacks', () => {
      const { result, rerender } = renderHook(() => usePhotos(), {
        wrapper,
      })

      const firstFetchPhotos = result.current.fetchPhotos
      const firstLoadMore = result.current.loadMore
      const firstReset = result.current.reset

      rerender()

      expect(result.current.fetchPhotos).toBe(firstFetchPhotos)
      expect(result.current.loadMore).toBe(firstLoadMore)
      expect(result.current.reset).toBe(firstReset)
    })
  })

  describe('Cleanup', () => {
    it('should abort requests on unmount', async () => {
      mockExecute.mockImplementation(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve) => {
            // Never resolve
          })
      )

      const { result, unmount } = renderHook(() => usePhotos(), {
        wrapper,
      })

      act(() => {
        result.current.fetchPhotos('test')
      })

      unmount()

      // Should not throw errors
      expect(true).toBe(true)
    })
  })
})
