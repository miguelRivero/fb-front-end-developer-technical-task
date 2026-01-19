/**
 * String Formatting Utilities
 *
 * Utility functions for formatting and manipulating strings in a consistent format
 * across the application.
 */

/**
 * Capitalizes the first character of a string.
 *
 * Handles null, undefined, and empty strings gracefully by returning an empty string.
 * Useful for formatting photo descriptions and other user-generated content.
 *
 * @param str - The string to capitalize (can be null or undefined)
 * @returns The string with first character capitalized, or empty string if input is falsy
 *
 * @example
 * ```ts
 * capitalizeFirst('hello world') // Returns "Hello world"
 * capitalizeFirst('HELLO') // Returns "HELLO" (only first char capitalized)
 * capitalizeFirst(null) // Returns ""
 * capitalizeFirst(undefined) // Returns ""
 * ```
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
