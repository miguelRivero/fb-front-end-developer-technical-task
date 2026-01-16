/**
 * Application Constants
 * 
 * Centralized constants to eliminate magic numbers and improve maintainability.
 * All UI-related constants and configuration values are defined here.
 */

/**
 * UI Constants
 * 
 * Constants for UI behavior, transitions, and loading states.
 */
export const UI_CONSTANTS = {
  /** Number of skeleton loaders to show during initial loading */
  SKELETON_COUNT: 6,
  /** Number of skeleton loaders to show when loading more items */
  LOADING_MORE_COUNT: 3,
  /** Minimum swipe distance (in pixels) required to trigger carousel navigation */
  SWIPE_MIN_DISTANCE: 50,
  /** Transition duration in milliseconds */
  TRANSITION_DURATION: 300,
} as const

/**
 * Pagination Configuration
 * 
 * Defines pagination settings for different viewport sizes.
 * These values control how many photos are fetched per page.
 */
export const PAGINATION_CONFIG = {
  /** Default number of photos per page */
  DEFAULT_PER_PAGE: 20,
  /** Number of photos per page on mobile devices */
  MOBILE_PER_PAGE: 10,
  /** Number of photos per page on tablet devices */
  TABLET_PER_PAGE: 15,
  /** Number of photos per page on desktop devices */
  DESKTOP_PER_PAGE: 20,
} as const
