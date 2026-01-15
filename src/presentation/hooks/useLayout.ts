import { LayoutContext } from '../context/LayoutContext'
import { useContext } from 'react'

/**
 * Custom hook: useLayout
 *
 * Provides access to layout state and operations from LayoutContext.
 * This hook encapsulates the logic for managing layout state,
 * using the LayoutContext to maintain shared state across components.
 *
 * @returns Object containing current layout and setter function
 * @throws Error if used outside LayoutProvider
 *
 * @example
 * ```tsx
 * function LayoutSwitcher() {
 *   const { currentLayout, changeLayout } = useLayout()
 *
 *   return (
 *     <button onClick={() => changeLayout('grid')}>
 *       Grid View
 *     </button>
 *   )
 * }
 * ```
 */
export function useLayout() {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }

  return context
}
