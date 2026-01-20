import { describe, expect, it } from 'vitest'

import { RESPONSIVE_BREAKPOINTS } from '@/constants'
import { getCarouselSlidesPerView, isBelowDesktopViewport } from './viewport'

describe('viewport utils', () => {
  describe('isBelowDesktopViewport', () => {
    it('should return true when width is below desktop breakpoint', () => {
      expect(isBelowDesktopViewport(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH - 1)).toBe(true)
    })

    it('should return false when width is at desktop breakpoint', () => {
      expect(isBelowDesktopViewport(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH)).toBe(false)
    })

    it('should return false when width is above desktop breakpoint', () => {
      expect(isBelowDesktopViewport(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH + 100)).toBe(false)
    })
  })

  describe('getCarouselSlidesPerView', () => {
    it('should return 1 for mobile widths', () => {
      expect(getCarouselSlidesPerView(RESPONSIVE_BREAKPOINTS.TABLET_MIN_WIDTH - 1)).toBe(1)
    })

    it('should return 2 for tablet widths', () => {
      expect(getCarouselSlidesPerView(RESPONSIVE_BREAKPOINTS.TABLET_MIN_WIDTH)).toBe(2)
      expect(getCarouselSlidesPerView(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH - 1)).toBe(2)
    })

    it('should return 3 for desktop widths', () => {
      expect(getCarouselSlidesPerView(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH)).toBe(3)
      expect(getCarouselSlidesPerView(RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH + 500)).toBe(3)
    })
  })
})

