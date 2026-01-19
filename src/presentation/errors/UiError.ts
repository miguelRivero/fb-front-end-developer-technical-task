/**
 * Presentation-layer error model.
 *
 * Goal: keep UI state decoupled from domain/infrastructure error classes.
 * UI components can rely on a stable `kind` and user-facing `message`.
 */
export type UiErrorKind = 'rate_limit' | 'network' | 'api_error' | 'unknown'

export class UiError extends Error {
  public readonly kind: UiErrorKind
  public readonly originalError?: unknown

  constructor(message: string, kind: UiErrorKind = 'unknown', originalError?: unknown) {
    super(message)
    this.name = 'UiError'
    this.kind = kind
    this.originalError = originalError
  }
}

/**
 * Maps unknown errors (domain/infrastructure) to presentation-layer `UiError`.
 * This is intentionally *structural* (duck-typed) to avoid importing domain error types.
 */
export function toUiError(
  error: unknown,
  fallbackMessage: string = 'Something went wrong. Please try again.'
): UiError {
  if (error instanceof UiError) {
    return error
  }

  // Duck-type common error shape from domain (`type`, `message`, `originalError`)
  if (typeof error === 'object' && error !== null) {
    const maybeMessage =
      'message' in error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : undefined

    const maybeType =
      'type' in error && typeof (error as { type?: unknown }).type === 'string'
        ? (error as { type: string }).type
        : undefined

    const maybeOriginal =
      'originalError' in error ? (error as { originalError?: unknown }).originalError : undefined

    const kind: UiErrorKind =
      maybeType === 'rate_limit' ||
      maybeType === 'network' ||
      maybeType === 'api_error' ||
      maybeType === 'unknown'
        ? maybeType
        : 'unknown'

    return new UiError(maybeMessage || fallbackMessage, kind, maybeOriginal ?? error)
  }

  if (error instanceof Error) {
    return new UiError(error.message || fallbackMessage, 'unknown', error)
  }

  return new UiError(fallbackMessage, 'unknown', error)
}

