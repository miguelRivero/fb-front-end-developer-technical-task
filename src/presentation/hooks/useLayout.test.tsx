import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayout } from './useLayout'
import { LayoutProvider } from '@/presentation/context/LayoutContext'
import type { Layout } from '@/domain/entities/Layout'

describe('useLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Hook Returns', () => {
    it('should return current layout and changeLayout function', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      expect(result.current).toHaveProperty('currentLayout')
      expect(result.current).toHaveProperty('changeLayout')
      expect(typeof result.current.changeLayout).toBe('function')
    })

    it('should return current layout from context', () => {
      localStorage.setItem('photo-gallery-layout', 'carousel')

      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      expect(result.current.currentLayout).toBe('carousel')
    })

    it('should throw error when used outside LayoutProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useLayout())
      }).toThrow('useLayout must be used within a LayoutProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('setLayout Function', () => {
    it('should update layout in context', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      act(() => {
        result.current.changeLayout('list')
      })

      expect(result.current.currentLayout).toBe('list')
    })

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      act(() => {
        result.current.changeLayout('cards')
      })

      expect(localStorage.getItem('photo-gallery-layout')).toBe('cards')
    })

    it('should handle all valid layouts', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      const layouts: Layout[] = ['grid', 'carousel', 'list', 'cards']

      layouts.forEach((layout) => {
        act(() => {
          result.current.changeLayout(layout)
        })
        expect(result.current.currentLayout).toBe(layout)
        expect(localStorage.getItem('photo-gallery-layout')).toBe(layout)
      })
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      setItemSpy.mockImplementationOnce(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      // Should still update layout even if localStorage fails
      act(() => {
        result.current.changeLayout('carousel')
      })

      expect(result.current.currentLayout).toBe('carousel')

      setItemSpy.mockRestore()
    })
  })

  describe('Layout Validation', () => {
    it('should read initial layout from localStorage', () => {
      localStorage.setItem('photo-gallery-layout', 'list')

      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      expect(result.current.currentLayout).toBe('list')
    })

    it('should default to grid when localStorage has invalid value', () => {
      localStorage.setItem('photo-gallery-layout', 'invalid-layout')

      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      expect(result.current.currentLayout).toBe('grid')
    })

    it('should ignore invalid layout values', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        // @ts-expect-error - intentionally passing invalid value
        result.current.changeLayout('invalid-layout')
      })

      // Layout should remain unchanged
      expect(result.current.currentLayout).toBe('grid')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Error Cases', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useLayout())
      }).toThrow('useLayout must be used within a LayoutProvider')

      consoleSpy.mockRestore()
    })
  })
})
