import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useViewportWidth } from './useViewportWidth'

describe('useViewportWidth', () => {
  it('should return the current window.innerWidth initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 900,
    })

    const { result } = renderHook(() => useViewportWidth())
    expect(result.current).toBe(900)
  })

  it('should update when the window resizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })

    const { result } = renderHook(() => useViewportWidth())
    expect(result.current).toBe(1200)

    act(() => {
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(500)
  })

  it('should remove the resize listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useViewportWidth())

    // Ensure we at least registered the listener.
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})

