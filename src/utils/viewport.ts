import { RESPONSIVE_BREAKPOINTS } from '../constants'

/**
 * Pure viewport helpers shared across UI components.
 * Keep these functions framework-agnostic (no `window` access here).
 */

export function isBelowDesktopViewport(width: number): boolean {
  return width < RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH
}

export function getCarouselSlidesPerView(width: number): 1 | 2 | 3 {
  if (width >= RESPONSIVE_BREAKPOINTS.DESKTOP_MIN_WIDTH) return 3
  if (width >= RESPONSIVE_BREAKPOINTS.TABLET_MIN_WIDTH) return 2
  return 1
}

