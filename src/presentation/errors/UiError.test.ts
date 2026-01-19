import { UiError, toUiError } from './UiError'
import { describe, expect, it } from 'vitest'

describe('UiError Advanced Scenarios', () => {
  it('should handle circular reference objects in originalError', () => {
    const circularObj: { name: string; self?: unknown } = { name: 'CircularError' }
    circularObj.self = circularObj

    expect(() => {
      new UiError('Circular error test', 'unknown', circularObj)
    }).not.toThrow()
  })

  it('should preserve error stack traces and original error reference', () => {
    const originalError = new Error('Original error')
    const uiError = new UiError('Wrapped error', 'api_error', originalError)

    expect(uiError.stack).toBeDefined()
    expect(uiError.originalError).toBe(originalError)
    expect(uiError.kind).toBe('api_error')
  })

  it('should handle malformed error objects', () => {
    const malformedError = {
      message: null,
      stack: undefined,
      toString: () => {
        throw new Error('toString failed')
      },
    }

    expect(() => {
      new UiError('Malformed error test', 'unknown', malformedError)
    }).not.toThrow()

    expect(() => {
      toUiError(malformedError, 'fallback')
    }).not.toThrow()
  })
})

describe('toUiError', () => {
  it('should pass through UiError instances', () => {
    const err = new UiError('Already UiError', 'network')
    expect(toUiError(err)).toBe(err)
  })

  it('should map duck-typed errors to UiError and preserve originalError when provided', () => {
    const original = new Error('Root cause')
    const duckTyped = { type: 'rate_limit', message: 'Too many requests', originalError: original }

    const uiError = toUiError(duckTyped)
    expect(uiError).toBeInstanceOf(UiError)
    expect(uiError.kind).toBe('rate_limit')
    expect(uiError.message).toBe('Too many requests')
    expect(uiError.originalError).toBe(original)
  })

  it('should fall back to unknown kind for unrecognized type', () => {
    const uiError = toUiError({ type: 'weird', message: 'Oops' })
    expect(uiError.kind).toBe('unknown')
    expect(uiError.message).toBe('Oops')
  })
})

