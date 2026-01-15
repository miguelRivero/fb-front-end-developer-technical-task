import { useState, useEffect } from 'react'
import type { Layout } from '../../domain/entities/Layout'

const LAYOUT_STORAGE_KEY = 'photo-gallery-layout'
const DEFAULT_LAYOUT: Layout = 'grid'

/**
 * Custom hook: useLayout
 * 
 * Manages layout state with localStorage persistence.
 * The layout preference is saved and restored across sessions.
 * 
 * This hook uses useState (not Context) since layout is a UI preference,
 * not global application data that needs to be shared across many components.
 * 
 * @returns Object containing current layout and setter function
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
  // Initialize from localStorage or use default
  const [currentLayout, setCurrentLayout] = useState<Layout>(() => {
    // Guard for SSR (if window is undefined)
    if (typeof window === 'undefined') {
      return DEFAULT_LAYOUT
    }

    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
      // Validate stored value is a valid Layout type
      if (
        stored &&
        (stored === 'grid' || stored === 'carousel' || stored === 'list' || stored === 'cards')
      ) {
        return stored as Layout
      }
    } catch (error) {
      console.warn('Failed to read layout from localStorage:', error)
    }

    return DEFAULT_LAYOUT
  })

  // Persist to localStorage whenever layout changes
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, currentLayout)
    } catch (error) {
      console.warn('Failed to save layout to localStorage:', error)
    }
  }, [currentLayout])

  /**
   * Updates the layout and persists to localStorage
   * 
   * @param layout - The new layout to set
   */
  const changeLayout = (layout: Layout) => {
    setCurrentLayout(layout)
  }

  return {
    currentLayout,
    changeLayout,
  }
}
