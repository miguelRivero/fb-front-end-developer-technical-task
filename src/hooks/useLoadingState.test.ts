/**
 * Tests for useLoadingState hook
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLoadingState } from './useLoadingState'
import { createMockPhotoArray } from '../test/mocks'

describe('useLoadingState', () => {
  describe('initial loading state', () => {
    it('should return isInitialLoading=true when loading=true and photos.length=0', () => {
      const { result } = renderHook(() =>
        useLoadingState(true, [])
      )

      expect(result.current.isInitialLoading).toBe(true)
      expect(result.current.isLoadingMore).toBe(false)
    })

    it('should return isInitialLoading=false when loading=false and photos.length=0', () => {
      const { result } = renderHook(() =>
        useLoadingState(false, [])
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(false)
    })
  })

  describe('loading more state', () => {
    it('should return isLoadingMore=true when loading=true and photos.length>0', () => {
      const photos = createMockPhotoArray(1)
      const { result } = renderHook(() =>
        useLoadingState(true, photos)
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(true)
    })

    it('should return isLoadingMore=true with multiple photos', () => {
      const photos = createMockPhotoArray(10)
      const { result } = renderHook(() =>
        useLoadingState(true, photos)
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(true)
    })
  })

  describe('not loading states', () => {
    it('should return both false when loading=false and photos.length=0', () => {
      const { result } = renderHook(() =>
        useLoadingState(false, [])
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(false)
    })

    it('should return both false when loading=false and photos.length>0', () => {
      const photos = createMockPhotoArray(5)
      const { result } = renderHook(() =>
        useLoadingState(false, photos)
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(false)
    })
  })

  describe('memoization', () => {
    it('should return same object reference when inputs unchanged', () => {
      const photos = createMockPhotoArray(5)
      const { result, rerender } = renderHook(
        ({ loading, photos }) => useLoadingState(loading, photos),
        {
          initialProps: { loading: false, photos },
        }
      )

      const firstResult = result.current

      // Rerender with same props
      rerender({ loading: false, photos })

      // Should return same object reference (memoized)
      expect(result.current).toBe(firstResult)
    })

    it('should return new object reference when loading changes', () => {
      const photos = createMockPhotoArray(5)
      const { result, rerender } = renderHook(
        ({ loading, photos }) => useLoadingState(loading, photos),
        {
          initialProps: { loading: false, photos },
        }
      )

      const firstResult = result.current

      // Rerender with different loading value
      rerender({ loading: true, photos })

      // Should return new object reference
      expect(result.current).not.toBe(firstResult)
      expect(result.current.isLoadingMore).toBe(true)
    })

    it('should return new object reference when photos.length changes', () => {
      const photos = createMockPhotoArray(5)
      const { result, rerender } = renderHook(
        ({ loading, photos }) => useLoadingState(loading, photos),
        {
          initialProps: { loading: false, photos },
        }
      )

      const firstResult = result.current

      // Rerender with different photos array length
      const newPhotos = createMockPhotoArray(10)
      rerender({ loading: false, photos: newPhotos })

      // Should return new object reference
      expect(result.current).not.toBe(firstResult)
    })
  })

  describe('edge cases', () => {
    it('should handle empty photos array', () => {
      const { result } = renderHook(() =>
        useLoadingState(true, [])
      )

      expect(result.current.isInitialLoading).toBe(true)
      expect(result.current.isLoadingMore).toBe(false)
    })

    it('should handle large photo arrays', () => {
      const photos = createMockPhotoArray(1000)
      const { result } = renderHook(() =>
        useLoadingState(true, photos)
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(true)
    })

    it('should handle single photo in array', () => {
      const photos = createMockPhotoArray(1)
      const { result } = renderHook(() =>
        useLoadingState(true, photos)
      )

      expect(result.current.isInitialLoading).toBe(false)
      expect(result.current.isLoadingMore).toBe(true)
    })
  })

  describe('various photo array lengths', () => {
    it.each([
      [1, true],
      [5, true],
      [10, true],
      [20, true],
      [100, true],
    ])(
      'should return isLoadingMore=true for %i photos when loading',
      (count, expectedLoadingMore) => {
        const photos = createMockPhotoArray(count)
        const { result } = renderHook(() =>
          useLoadingState(true, photos)
        )

        expect(result.current.isLoadingMore).toBe(expectedLoadingMore)
        expect(result.current.isInitialLoading).toBe(false)
      }
    )
  })
})
