import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LAYOUTS } from '../../domain/entities/Layout'
import type { Layout } from '../../domain/entities/Layout'

/**
 * Presentation Layer: LayoutContext
 * 
 * React Context for managing layout state across the application.
 * This belongs to the presentation layer and uses domain entities.
 * 
 * Clean Architecture: The presentation layer depends on domain entities,
 * not infrastructure types. This maintains layer independence.
 */

const LAYOUT_STORAGE_KEY = 'photo-gallery-layout'
const DEFAULT_LAYOUT: Layout = 'grid'

/**
 * Type guard to validate if a string is a valid Layout type
 * Uses LAYOUTS metadata from domain for validation
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
 */
function safeGetLocalStorage(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    return localStorage.getItem(key)
  } catch (error) {
    if (error instanceof DOMException) {
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
 */
function safeSetLocalStorage(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.warn(
          'localStorage quota exceeded, cannot save layout preference'
        )
        try {
          localStorage.removeItem(key)
          localStorage.setItem(key, value)
          return true
        } catch {
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
 * Layout context type definition
 */
interface LayoutContextType {
  currentLayout: Layout
  changeLayout: (layout: Layout) => void
}

/**
 * Layout context instance
 */
const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

/**
 * LayoutProvider component
 * 
 * Provides layout state and change function to all child components.
 * Wraps the application to enable global layout state management.
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
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
   */
  const changeLayout = (layout: Layout) => {
    if (isValidLayout(layout)) {
      setCurrentLayout(layout)
    } else {
      console.error(
        `Invalid layout "${layout}" provided to changeLayout, ignoring`
      )
    }
  }

  return (
    <LayoutContext.Provider value={{ currentLayout, changeLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

/**
 * Export LayoutContext for use in custom hooks
 */
export { LayoutContext }
