/**
 * Capitalizes the first character of a string
 * @param str - The string to capitalize
 * @returns The string with first character capitalized
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
