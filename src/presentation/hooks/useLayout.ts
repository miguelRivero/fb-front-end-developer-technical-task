import { useEffect, useState } from 'react'

import { LAYOUTS } from '../../domain/entities/Layout'
import type { Layout } from '../../domain/entities/Layout'

const LAYOUT_STORAGE_KEY = 'photo-gallery-layout'
const DEFAULT_LAYOUT: Layout = 'grid'

/**
 * Type guard to validate if a string is a valid Layout type
 * Uses LAYOUTS metadata from domain for validation
 *
 * @param value - The value to validate
 * @returns True if value is a valid Layout, false otherwise
 */
function isValidLayout(value: unknown): value is Layout {
  return (
    typeof value === 'string' &&
    value in LAYOUTS &&
    (value === 'grid' ||
      value === 'carousel' ||
      value === 'list' ||
      value === 'cards')
  )
}

/**
 * Checks if localStorage is available and accessible
 * Handles cases where localStorage is disabled or unavailable
 *
 * @returns True if localStorage is available, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const testKey = '__localStorage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Safely reads a value from localStorage with error handling
 * Handles quota exceeded, disabled localStorage, and other errors
 *
 * @param key - The localStorage key to read
 * @returns The stored value or null if unavailable/invalid
 */
function safeGetLocalStorage(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    return localStorage.getItem(key)
  } catch (error) {
    // Handle various localStorage errors
    if (error instanceof DOMException) {
      // QuotaExceededError, SecurityError, etc.
      if (error.name === 'QuotaExceededError') {
        console.warn(
          'localStorage quota exceeded, cannot read layout preference'
        )
      } else if (error.name === 'SecurityError') {
        console.warn('localStorage access denied (private browsing mode?)')
      } else {
        console.warn('localStorage read error:', error.name, error.message)
      }
    } else {
      console.warn('Unexpected error reading from localStorage:', error)
    }
    return null
  }
}

/**
 * Safely writes a value to localStorage with error handling
 * Handles quota exceeded, disabled localStorage, and other errors
 *
 * @param key - The localStorage key to write
 * @param value - The value to store
 * @returns True if write succeeded, false otherwise
 */
function safeSetLocalStorage(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    // Handle various localStorage errors
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.warn(
          'localStorage quota exceeded, cannot save layout preference'
        )
        // Try to clear old data if quota exceeded
        try {
          localStorage.removeItem(key)
          localStorage.setItem(key, value)
          return true
        } catch {
          // Still failed, give up
          return false
        }
      } else if (error.name === 'SecurityError') {
        console.warn(
          'localStorage access denied (private browsing mode?), layout preference not saved'
        )
      } else {
        console.warn('localStorage write error:', error.name, error.message)
      }
    } else {
      console.warn('Unexpected error writing to localStorage:', error)
    }
    return false
  }
}

/**
 * Custom hook: useLayout
 *
 * Manages layout state with localStorage persistence.
 * The layout preference is saved and restored across sessions.
 *
 * Features:
 * - Robust error handling for localStorage failures
 * - Validation using domain LAYOUTS metadata
 * - Graceful degradation when localStorage is unavailable
 * - SSR-safe (handles window undefined)
 * - Handles quota exceeded, disabled localStorage, and corrupted data
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

    // Try to read from localStorage
    const stored = safeGetLocalStorage(LAYOUT_STORAGE_KEY)

    // Validate stored value using domain metadata
    if (stored && isValidLayout(stored)) {
      return stored
    }

    // If stored value exists but is invalid, clear it to prevent future issues
    if (stored && !isValidLayout(stored)) {
      console.warn(
        `Invalid layout value "${stored}" found in localStorage, using default layout "${DEFAULT_LAYOUT}"`
      )
      // Try to clean up invalid data
      try {
        localStorage.removeItem(LAYOUT_STORAGE_KEY)
      } catch {
        // Ignore cleanup errors
      }
    }

    return DEFAULT_LAYOUT
  })

  // Persist to localStorage whenever layout changes
  useEffect(() => {
    safeSetLocalStorage(LAYOUT_STORAGE_KEY, currentLayout)
  }, [currentLayout])

  /**
   * Updates the layout and persists to localStorage
   * The layout state is updated immediately, and localStorage persistence
   * happens asynchronously via useEffect (even if it fails, state is updated)
   *
   * @param layout - The new layout to set (must be a valid Layout type)
   */
  const changeLayout = (layout: Layout) => {
    // Validate layout before setting (defensive programming)
    if (isValidLayout(layout)) {
      setCurrentLayout(layout)
    } else {
      console.error(
        `Invalid layout "${layout}" provided to changeLayout, ignoring`
      )
    }
  }

  return {
    currentLayout,
    changeLayout,
  }
}
