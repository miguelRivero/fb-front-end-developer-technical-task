import { describe, expect, it } from 'vitest'

import {
  PAGINATION_CONFIG,
  UI_CONSTANTS,
  UNSPLASH_API_TIMEOUT_MS,
  parsePositiveNumber,
} from './index'

describe('PAGINATION_CONFIG Validation', () => {
  it('should ensure all per_page values are positive integers', () => {
    Object.values(PAGINATION_CONFIG).forEach((value) => {
      expect(value).toBeGreaterThan(0)
      expect(Number.isInteger(value)).toBe(true)
    })
  })

  it('should maintain logical progression mobile <= tablet <= desktop', () => {
    expect(PAGINATION_CONFIG.MOBILE_PER_PAGE).toBeLessThanOrEqual(
      PAGINATION_CONFIG.TABLET_PER_PAGE
    )
    expect(PAGINATION_CONFIG.TABLET_PER_PAGE).toBeLessThanOrEqual(
      PAGINATION_CONFIG.DESKTOP_PER_PAGE
    )
  })

  it('should handle extreme viewport scenarios (reasonable bounds)', () => {
    expect(PAGINATION_CONFIG.MOBILE_PER_PAGE).toBeGreaterThan(1)
    expect(PAGINATION_CONFIG.DESKTOP_PER_PAGE).toBeLessThan(100)
  })
})

describe('UI_CONSTANTS Validation', () => {
  it('should validate skeleton counts are reasonable', () => {
    expect(UI_CONSTANTS.SKELETON_COUNT).toBeGreaterThan(0)
    expect(UI_CONSTANTS.SKELETON_COUNT).toBeLessThan(20)
    expect(UI_CONSTANTS.LOADING_MORE_COUNT).toBeGreaterThan(0)
  })

  it('should validate swipe distance is reasonable', () => {
    expect(UI_CONSTANTS.SWIPE_MIN_DISTANCE).toBeGreaterThan(10)
    expect(UI_CONSTANTS.SWIPE_MIN_DISTANCE).toBeLessThan(200)
  })

  it('should validate transition duration is reasonable', () => {
    expect(UI_CONSTANTS.TRANSITION_DURATION).toBeGreaterThan(100)
    expect(UI_CONSTANTS.TRANSITION_DURATION).toBeLessThan(1000)
  })
})

describe('UNSPLASH_API_TIMEOUT_MS Edge Cases', () => {
  it('should always be a positive timeout', () => {
    expect(UNSPLASH_API_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('parsePositiveNumber should handle NaN and non-numeric values', () => {
    expect(parsePositiveNumber('not-a-number', 10_000)).toBe(10_000)
    expect(parsePositiveNumber(undefined, 10_000)).toBe(10_000)
    expect(parsePositiveNumber(null, 10_000)).toBe(10_000)
  })

  it('parsePositiveNumber should reject zero/negative values', () => {
    expect(parsePositiveNumber('0', 10_000)).toBe(10_000)
    expect(parsePositiveNumber(0, 10_000)).toBe(10_000)
    expect(parsePositiveNumber('-5000', 10_000)).toBe(10_000)
    expect(parsePositiveNumber(-5000, 10_000)).toBe(10_000)
  })

  it('parsePositiveNumber should accept positive values', () => {
    expect(parsePositiveNumber('15000', 10_000)).toBe(15_000)
    expect(parsePositiveNumber(15_000, 10_000)).toBe(15_000)
  })
})

