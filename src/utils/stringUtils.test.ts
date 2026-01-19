/**
 * Tests for stringUtils
 */

import { describe, it, expect } from 'vitest'
import { capitalizeFirst } from './stringUtils'

describe('capitalizeFirst', () => {
  describe('normal strings', () => {
    it('should capitalize first character of a normal string', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
    })

    it('should capitalize first character and keep rest lowercase', () => {
      expect(capitalizeFirst('world')).toBe('World')
    })

    it('should handle strings with multiple words (only capitalizes first)', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world')
    })

    it('should handle already capitalized strings', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello')
    })

    it('should handle all uppercase strings', () => {
      expect(capitalizeFirst('HELLO')).toBe('HELLO')
    })

    it('should handle mixed case strings', () => {
      expect(capitalizeFirst('hELLo')).toBe('HELLo')
    })
  })

  describe('edge cases', () => {
    it('should return empty string for null', () => {
      expect(capitalizeFirst(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(capitalizeFirst(undefined)).toBe('')
    })

    it('should return empty string for empty string', () => {
      expect(capitalizeFirst('')).toBe('')
    })

    it('should handle single character strings', () => {
      expect(capitalizeFirst('a')).toBe('A')
    })

    it('should handle single character already uppercase', () => {
      expect(capitalizeFirst('A')).toBe('A')
    })

    it('should handle strings starting with numbers', () => {
      expect(capitalizeFirst('123abc')).toBe('123abc')
    })

    it('should handle strings starting with special characters', () => {
      expect(capitalizeFirst('!hello')).toBe('!hello')
    })

    it('should handle strings starting with whitespace', () => {
      expect(capitalizeFirst(' hello')).toBe(' hello')
    })

    it('should handle strings with only special characters', () => {
      expect(capitalizeFirst('!!!')).toBe('!!!')
    })

    it('should handle strings with only numbers', () => {
      expect(capitalizeFirst('123')).toBe('123')
    })

    it('should handle Unicode characters', () => {
      expect(capitalizeFirst('ñiño')).toBe('Ñiño')
    })

    it('should handle emoji strings', () => {
      expect(capitalizeFirst('😀hello')).toBe('😀hello')
    })
  })

  describe('real-world examples', () => {
    it('should capitalize photo descriptions', () => {
      expect(capitalizeFirst('a beautiful sunset')).toBe('A beautiful sunset')
    })

    it('should handle null photo descriptions', () => {
      expect(capitalizeFirst(null)).toBe('')
    })

    it('should handle empty photo descriptions', () => {
      expect(capitalizeFirst('')).toBe('')
    })

    it('should preserve existing capitalization for titles', () => {
      expect(capitalizeFirst('iPhone')).toBe('IPhone')
    })

    it('should capitalize lowercase usernames', () => {
      expect(capitalizeFirst('john doe')).toBe('John doe')
    })
  })
})
