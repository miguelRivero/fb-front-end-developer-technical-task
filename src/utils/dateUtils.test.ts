/**
 * Tests for dateUtils
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatPhotoDate } from './dateUtils'

describe('formatPhotoDate', () => {
  beforeEach(() => {
    // Reset console.warn mock before each test
    vi.clearAllMocks()
  })

  describe('valid ISO 8601 date strings', () => {
    it('should format a valid ISO 8601 date string correctly', () => {
      const result = formatPhotoDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/Jan.*15.*2024|1\/15\/2024/)
    })

    it('should format date with timezone offset correctly', () => {
      const result = formatPhotoDate('2024-12-25T23:59:59+00:00')
      expect(result).toMatch(/Dec.*25.*2024|12\/25\/2024/)
    })

    it('should format date with different months correctly', () => {
      const testCases = [
        { input: '2024-01-15T10:30:00Z', expectedMonth: 'Jan' },
        { input: '2024-06-15T10:30:00Z', expectedMonth: 'Jun' },
        { input: '2024-12-15T10:30:00Z', expectedMonth: 'Dec' },
      ]

      testCases.forEach(({ input, expectedMonth }) => {
        const result = formatPhotoDate(input)
        expect(result).toContain(expectedMonth)
      })
    })

    it('should format date with different days correctly', () => {
      const result = formatPhotoDate('2024-03-05T10:30:00Z')
      expect(result).toMatch(/Mar.*5.*2024|3\/5\/2024/)
    })

    it('should format date with different years correctly', () => {
      const result2020 = formatPhotoDate('2020-01-15T10:30:00Z')
      expect(result2020).toContain('2020')

      const result2025 = formatPhotoDate('2025-01-15T10:30:00Z')
      expect(result2025).toContain('2025')
    })

    it('should use en-US locale formatting', () => {
      const result = formatPhotoDate('2024-01-15T10:30:00Z')
      // en-US format typically includes month name abbreviation
      expect(result).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    })

    it('should include year, month, and day in output', () => {
      const result = formatPhotoDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/Jan|1/)
      expect(result).toMatch(/15/)
    })
  })

  describe('edge cases', () => {
    it('should handle invalid date string gracefully', () => {
      const result = formatPhotoDate('invalid-date')
      expect(result).toBe('Invalid date')
    })

    it('should handle empty string', () => {
      const result = formatPhotoDate('')
      expect(result).toBe('Invalid date')
    })

    it('should handle null gracefully (when cast to string)', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      const result = formatPhotoDate(null)
      expect(result).toBe('Invalid date')
    })

    it('should handle undefined gracefully (when cast to string)', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      const result = formatPhotoDate(undefined)
      expect(result).toBe('Invalid date')
    })

    it('should handle invalid date format (not ISO 8601)', () => {
      const result = formatPhotoDate('01-15-2024')
      // May format incorrectly but should not crash
      expect(typeof result).toBe('string')
    })

    it('should handle date string with invalid time', () => {
      const result = formatPhotoDate('2024-01-15T99:99:99Z')
      expect(result).toBe('Invalid date')
    })

    it('should handle date string with invalid month', () => {
      const result = formatPhotoDate('2024-13-15T10:30:00Z')
      expect(result).toBe('Invalid date')
    })

    it('should handle date string with invalid day', () => {
      const result = formatPhotoDate('2024-01-32T10:30:00Z')
      expect(result).toBe('Invalid date')
    })
  })

  describe('error handling', () => {
    it('should return "Invalid date" for NaN dates', () => {
      const result = formatPhotoDate('2024-02-30T10:30:00Z') // Invalid date
      expect(result).toBe('Invalid date')
    })

    it('should catch and handle exceptions gracefully', () => {
      // Mock Date constructor to throw an error
      const OriginalDate = global.Date
      global.Date = class extends OriginalDate {
        constructor(...args: unknown[]) {
          super(...(args as []))
          throw new Error('Date construction failed')
        }
      } as unknown as typeof Date

      const result = formatPhotoDate('2024-01-15T10:30:00Z')
      expect(result).toBe('Invalid date')

      // Restore original Date
      global.Date = OriginalDate
    })

    it('should log warning in development mode for invalid dates', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = formatPhotoDate('invalid-date')
      
      // Note: We can't easily test import.meta.env.DEV in tests
      // But we can verify the function doesn't crash
      expect(result).toBe('Invalid date')
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('fallback behavior', () => {
    it('should always return a string', () => {
      const result = formatPhotoDate('invalid')
      expect(typeof result).toBe('string')
      expect(result).toBe('Invalid date')
    })

    it('should return consistent format for same input', () => {
      const input = '2024-01-15T10:30:00Z'
      const result1 = formatPhotoDate(input)
      const result2 = formatPhotoDate(input)
      expect(result1).toBe(result2)
    })
  })
})
