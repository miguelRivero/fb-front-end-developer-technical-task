/**
 * Tests for useClickable hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClickable } from './useClickable'

describe('useClickable', () => {
  describe('with onClick handler provided', () => {
    it('should return onClick handler', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      expect(result.current.onClick).toBeDefined()
      expect(typeof result.current.onClick).toBe('function')
    })

    it('should call onClick handler with item when clicked', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      result.current.onClick?.()

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should return role="button" when onClick provided', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      expect(result.current.role).toBe('button')
    })

    it('should return tabIndex=0 when onClick provided', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      expect(result.current.tabIndex).toBe(0)
    })

    it('should return aria-label when onClick provided', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const label = 'Test label'
      const { result } = renderHook(() =>
        useClickable(onClick, item, label)
      )

      expect(result.current['aria-label']).toBe(label)
    })
  })

  describe('without onClick handler', () => {
    it('should return undefined for onClick when handler not provided', () => {
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(undefined, item, 'Test label')
      )

      expect(result.current.onClick).toBeUndefined()
    })

    it('should return undefined for role when onClick not provided', () => {
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(undefined, item, 'Test label')
      )

      expect(result.current.role).toBeUndefined()
    })

    it('should return undefined for tabIndex when onClick not provided', () => {
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(undefined, item, 'Test label')
      )

      expect(result.current.tabIndex).toBeUndefined()
    })

    it('should return undefined for aria-label when onClick not provided', () => {
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(undefined, item, 'Test label')
      )

      expect(result.current['aria-label']).toBeUndefined()
    })
  })

  describe('keyboard navigation', () => {
    it('should handle Enter key press', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      result.current.onKeyDown?.(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should handle Space key press', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      result.current.onKeyDown?.(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should not handle other key presses', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      const mockEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      result.current.onKeyDown?.(mockEvent)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should not handle keyboard events when onClick not provided', () => {
      const item = { id: 1, name: 'test' }
      const { result } = renderHook(() =>
        useClickable(undefined, item, 'Test label')
      )

      expect(result.current.onKeyDown).toBeDefined()
      
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      // Should not throw error
      expect(() => {
        result.current.onKeyDown?.(mockEvent)
      }).not.toThrow()
    })
  })

  describe('memoization', () => {
    it('should return same onClick handler reference when dependencies unchanged', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result, rerender } = renderHook(
        ({ onClick, item }) => useClickable(onClick, item, 'Test label'),
        {
          initialProps: { onClick, item },
        }
      )

      const firstOnClick = result.current.onClick

      // Rerender with same props
      rerender({ onClick, item })

      // Should return same function reference (memoized)
      expect(result.current.onClick).toBe(firstOnClick)
    })

    it('should return new onClick handler when onClick changes', () => {
      const onClick1 = vi.fn()
      const onClick2 = vi.fn()
      const item = { id: 1, name: 'test' }
      const { result, rerender } = renderHook(
        ({ onClick, item }) => useClickable(onClick, item, 'Test label'),
        {
          initialProps: { onClick: onClick1, item },
        }
      )

      const firstOnClick = result.current.onClick

      // Rerender with different onClick
      rerender({ onClick: onClick2, item })

      // Should return new function reference
      expect(result.current.onClick).not.toBe(firstOnClick)
    })

    it('should return new onClick handler when item changes', () => {
      const onClick = vi.fn()
      const item1 = { id: 1, name: 'test1' }
      const item2 = { id: 2, name: 'test2' }
      const { result, rerender } = renderHook(
        ({ onClick, item }) => useClickable(onClick, item, 'Test label'),
        {
          initialProps: { onClick, item: item1 },
        }
      )

      const firstOnClick = result.current.onClick

      // Rerender with different item
      rerender({ onClick, item: item2 })

      // Should return new function reference
      expect(result.current.onClick).not.toBe(firstOnClick)
    })
  })

  describe('different item types (generics)', () => {
    it('should work with string items', () => {
      const onClick = vi.fn()
      const item = 'test-string'
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      result.current.onClick?.()

      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should work with number items', () => {
      const onClick = vi.fn()
      const item = 42
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      result.current.onClick?.()

      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should work with object items', () => {
      const onClick = vi.fn()
      const item = { id: 1, name: 'test', nested: { value: 123 } }
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      result.current.onClick?.()

      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('should work with array items', () => {
      const onClick = vi.fn()
      const item = [1, 2, 3]
      const { result } = renderHook(() =>
        useClickable(onClick, item, 'Test label')
      )

      result.current.onClick?.()

      expect(onClick).toHaveBeenCalledWith(item)
    })
  })

  describe('aria-label generation', () => {
    it('should use provided label for aria-label', () => {
      const onClick = vi.fn()
      const item = { id: 1 }
      const label = 'View photo by John Doe'
      const { result } = renderHook(() =>
        useClickable(onClick, item, label)
      )

      expect(result.current['aria-label']).toBe(label)
    })

    it('should not return aria-label when onClick not provided', () => {
      const item = { id: 1 }
      const label = 'View photo by John Doe'
      const { result } = renderHook(() =>
        useClickable(undefined, item, label)
      )

      expect(result.current['aria-label']).toBeUndefined()
    })
  })
})
