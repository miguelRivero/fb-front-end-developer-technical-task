import type React from 'react'
import { useCallback } from 'react'

/**
 * Custom hook: useClickable
 * 
 * Extracts duplicate click handler and keyboard navigation logic.
 * Provides consistent accessibility attributes and event handlers for clickable items.
 * 
 * @template T - Type of the item being clicked
 * @param onClick - Optional callback function when item is clicked
 * @param item - The item to pass to onClick callback
 * @param label - Label for aria-label attribute
 * @returns Object with event handlers and accessibility attributes
 * 
 * @example
 * ```tsx
 * const { onClick, onKeyDown, role, tabIndex, 'aria-label': ariaLabel } = useClickable(
 *   onPhotoClick,
 *   photo,
 *   `View photo by ${photo.creator.name}`
 * )
 * ```
 */
export function useClickable<T>(
  onClick: ((item: T) => void) | undefined,
  item: T,
  label: string
) {
  const handleClick = useCallback(() => {
    onClick?.(item)
  }, [onClick, item])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        handleClick()
      }
    },
    [onClick, handleClick]
  )

  return {
    onClick: onClick ? handleClick : undefined,
    onKeyDown: handleKeyDown,
    role: onClick ? ('button' as const) : undefined,
    tabIndex: onClick ? (0 as const) : undefined,
    'aria-label': onClick ? label : undefined,
  }
}
