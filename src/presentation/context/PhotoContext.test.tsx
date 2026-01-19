import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PhotoProvider, PhotoContext } from './PhotoContext'
import { createMockPhotoArray } from '../../test/mocks'
import { useContext } from 'react'
import { DEFAULT_SEARCH_QUERY } from '../../constants'
import { UiError } from '../errors/UiError'

describe('PhotoContext', () => {
  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      expect(result.current?.state).toEqual({
        photos: [],
        loading: false,
        loadingMore: false,
        error: null,
        currentPage: 1,
        searchQuery: DEFAULT_SEARCH_QUERY,
        hasMore: false,
      })
    })
  })

  describe('Reducer Actions', () => {
    it('should handle FETCH_START action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'mountains' })
      })

      expect(result.current?.state).toMatchObject({
        loading: true,
        loadingMore: false,
        error: null,
        searchQuery: 'mountains',
        currentPage: 1,
        photos: [],
      })
    })

    it('should handle FETCH_SUCCESS action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      const mockPhotos = createMockPhotoArray(3)

      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: mockPhotos,
          page: 1,
          hasMore: true,
        })
      })

      expect(result.current?.state).toMatchObject({
        loading: false,
        loadingMore: false,
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })
    })

    it('should handle FETCH_ERROR action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      const error = new UiError('Network error', 'network', new Error('Failed to fetch'))

      act(() => {
        result.current?.dispatch({ type: 'FETCH_ERROR', error })
      })

      expect(result.current?.state).toMatchObject({
        loading: false,
        loadingMore: false,
        error,
      })
    })

    it('should handle LOAD_MORE_START action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set up initial state with photos
      const initialPhotos = createMockPhotoArray(3)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: initialPhotos,
          page: 1,
          hasMore: true,
        })
      })

      act(() => {
        result.current?.dispatch({ type: 'LOAD_MORE_START' })
      })

      expect(result.current?.state).toMatchObject({
        loadingMore: true,
        error: null,
        photos: initialPhotos, // Photos should remain unchanged
      })
    })

    it('should handle LOAD_MORE_SUCCESS action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set up initial state
      const initialPhotos = createMockPhotoArray(3)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: initialPhotos,
          page: 1,
          hasMore: true,
        })
      })

      const morePhotos = createMockPhotoArray(2)

      act(() => {
        result.current?.dispatch({
          type: 'LOAD_MORE_SUCCESS',
          photos: morePhotos,
          hasMore: false,
        })
      })

      expect(result.current?.state).toMatchObject({
        loadingMore: false,
        photos: [...initialPhotos, ...morePhotos],
        currentPage: 2, // Should increment from 1
        hasMore: false,
      })
    })

    it('should handle RESET action', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set up some state
      const mockPhotos = createMockPhotoArray(5)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: mockPhotos,
          page: 2,
          hasMore: true,
        })
      })

      act(() => {
        result.current?.dispatch({ type: 'RESET' })
      })

      expect(result.current?.state).toEqual({
        photos: [],
        loading: false,
        loadingMore: false,
        error: null,
        currentPage: 1,
        searchQuery: DEFAULT_SEARCH_QUERY,
        hasMore: false,
      })
    })
  })

  describe('State Transitions', () => {
    it('should transition from loading to success', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'ocean' })
      })

      expect(result.current?.state.loading).toBe(true)

      const mockPhotos = createMockPhotoArray(2)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: mockPhotos,
          page: 1,
          hasMore: true,
        })
      })

      expect(result.current?.state.loading).toBe(false)
      expect(result.current?.state.photos).toEqual(mockPhotos)
    })

    it('should transition from loading to error', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'forest' })
      })

      expect(result.current?.state.loading).toBe(true)

      const error = new UiError('API error', 'api_error', new Error('Request failed'))

      act(() => {
        result.current?.dispatch({ type: 'FETCH_ERROR', error })
      })

      expect(result.current?.state.loading).toBe(false)
      expect(result.current?.state.error).toBe(error)
    })

    it('should handle multiple state updates in sequence', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Start fetch
      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'sunset' })
      })

      // Success
      const photos1 = createMockPhotoArray(3)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: photos1,
          page: 1,
          hasMore: true,
        })
      })

      // Load more
      act(() => {
        result.current?.dispatch({ type: 'LOAD_MORE_START' })
      })

      // Load more success
      const photos2 = createMockPhotoArray(2)
      act(() => {
        result.current?.dispatch({
          type: 'LOAD_MORE_SUCCESS',
          photos: photos2,
          hasMore: false,
        })
      })

      expect(result.current?.state.photos).toHaveLength(5)
      expect(result.current?.state.currentPage).toBe(2)
      expect(result.current?.state.hasMore).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should clear error on FETCH_START', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set an error
      const error = new UiError('Test error', 'unknown')
      act(() => {
        result.current?.dispatch({ type: 'FETCH_ERROR', error })
      })

      expect(result.current?.state.error).toBe(error)

      // Start new fetch should clear error
      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'new query' })
      })

      expect(result.current?.state.error).toBeNull()
    })

    it('should clear error on LOAD_MORE_START', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set an error
      const error = new UiError('Test error', 'unknown')
      act(() => {
        result.current?.dispatch({ type: 'FETCH_ERROR', error })
      })

      // Start loading more should clear error
      act(() => {
        result.current?.dispatch({ type: 'LOAD_MORE_START' })
      })

      expect(result.current?.state.error).toBeNull()
    })

    it('should handle error recovery', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Initial error
      const error1 = new UiError('Network error', 'network')
      act(() => {
        result.current?.dispatch({ type: 'FETCH_ERROR', error: error1 })
      })

      // Start new fetch (clears error)
      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'recovery' })
      })

      // Recover with successful fetch
      const mockPhotos = createMockPhotoArray(3)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: mockPhotos,
          page: 1,
          hasMore: true,
        })
      })

      expect(result.current?.state.error).toBeNull()
      expect(result.current?.state.photos).toEqual(mockPhotos)
    })
  })

  describe('Edge Cases', () => {
    it('should handle FETCH_START clearing existing photos', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set up with photos
      const initialPhotos = createMockPhotoArray(5)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: initialPhotos,
          page: 1,
          hasMore: true,
        })
      })

      // New fetch should clear photos
      act(() => {
        result.current?.dispatch({ type: 'FETCH_START', query: 'new' })
      })

      expect(result.current?.state.photos).toEqual([])
    })

    it('should handle LOAD_MORE_SUCCESS with empty photos array', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      act(() => {
        result.current?.dispatch({ type: 'LOAD_MORE_START' })
      })

      act(() => {
        result.current?.dispatch({
          type: 'LOAD_MORE_SUCCESS',
          photos: [],
          hasMore: false,
        })
      })

      expect(result.current?.state.photos).toEqual([])
      expect(result.current?.state.hasMore).toBe(false)
    })

    it('should increment page correctly on LOAD_MORE_SUCCESS', () => {
      const { result } = renderHook(() => useContext(PhotoContext), {
        wrapper: PhotoProvider,
      })

      // Set initial page to 3
      const initialPhotos = createMockPhotoArray(3)
      act(() => {
        result.current?.dispatch({
          type: 'FETCH_SUCCESS',
          photos: initialPhotos,
          page: 3,
          hasMore: true,
        })
      })

      const morePhotos = createMockPhotoArray(2)
      act(() => {
        result.current?.dispatch({
          type: 'LOAD_MORE_SUCCESS',
          photos: morePhotos,
          hasMore: true,
        })
      })

      expect(result.current?.state.currentPage).toBe(4)
    })
  })
})
