import { createContext, useReducer, type ReactNode } from 'react'
import type { Photo } from '../../domain/entities/Photo'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'

/**
 * Presentation Layer: PhotoContext
 * 
 * React Context for managing photo state across the application.
 * This belongs to the presentation layer and uses domain entities.
 * 
 * Clean Architecture: The presentation layer depends on domain entities,
 * not infrastructure types. This maintains layer independence.
 */

/**
 * Photo state interface
 * Uses domain Photo entity for type safety
 */
export interface PhotoState {
  /** Array of photos (domain entities) */
  photos: Photo[]
  /** Loading state indicator for initial fetch */
  loading: boolean
  /** Loading state indicator for loading more photos (pagination) */
  loadingMore: boolean
  /** Error state (null when no error) */
  error: PhotoRepositoryError | null
  /** Current page number */
  currentPage: number
  /** Current search query */
  searchQuery: string
  /** Whether more photos are available */
  hasMore: boolean
}

/**
 * Photo action types using discriminated union for type safety
 */
export type PhotoAction =
  | { type: 'FETCH_START'; query: string }
  | { type: 'FETCH_SUCCESS'; photos: Photo[]; page: number; hasMore: boolean }
  | { type: 'FETCH_ERROR'; error: PhotoRepositoryError }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; photos: Photo[]; hasMore: boolean }
  | { type: 'RESET' }

/**
 * Initial state for photo context
 */
const initialState: PhotoState = {
  photos: [],
  loading: false,
  loadingMore: false,
  error: null,
  currentPage: 1,
  searchQuery: 'nature',
  hasMore: true,
}

/**
 * Photo reducer function
 * Handles all state transitions immutably
 */
function photoReducer(state: PhotoState, action: PhotoAction): PhotoState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        loadingMore: false,
        error: null,
        searchQuery: action.query,
        currentPage: 1,
        photos: [], // Clear photos on new search
      }

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        loadingMore: false,
        photos: action.photos,
        currentPage: action.page,
        hasMore: action.hasMore,
      }

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        loadingMore: false,
        error: action.error,
      }

    case 'LOAD_MORE_START':
      return {
        ...state,
        loadingMore: true,
        error: null,
      }

    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        loadingMore: false,
        photos: [...state.photos, ...action.photos],
        currentPage: state.currentPage + 1,
        hasMore: action.hasMore,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

/**
 * Photo context type definition
 */
interface PhotoContextType {
  state: PhotoState
  dispatch: React.Dispatch<PhotoAction>
}

/**
 * Photo context instance
 */
const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

/**
 * PhotoProvider component
 * 
 * Provides photo state and dispatch function to all child components.
 * Wraps the application to enable global photo state management.
 */
export function PhotoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(photoReducer, initialState)

  return (
    <PhotoContext.Provider value={{ state, dispatch }}>
      {children}
    </PhotoContext.Provider>
  )
}

/**
 * Export PhotoContext for use in custom hooks
 * Custom hooks (plan 02-04) will consume this context
 */
export { PhotoContext }
