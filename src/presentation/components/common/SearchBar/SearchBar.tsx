import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SearchIcon, CloseIcon } from '../icons'
import styles from './SearchBar.module.scss'

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
  /** Initial query value */
  initialQuery?: string
  /** Callback when search query changes */
  onSearch: (query: string) => void
  /** Placeholder text for input */
  placeholder?: string
  /** Debounce delay in milliseconds (default: 500) */
  debounceDelay?: number
}

/**
 * SearchBar Component
 *
 * Provides a search input with debouncing, clear button, and search icon.
 * This component handles its own local state for the input field and
 * triggers the onSearch callback after a debounce period.
 *
 * @param props - SearchBar component props
 * @returns SearchBar component
 */
export function SearchBar({
  initialQuery = '',
  onSearch,
  placeholder = 'Search photos...',
  debounceDelay = 500,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const isFirstRender = useRef(true)

  // Debounced search effect
  useEffect(() => {
    // Skip on first render to avoid redundant initial fetch
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      onSearch(query.trim())
    }, debounceDelay)

    return () => clearTimeout(timer)
  }, [query, onSearch, debounceDelay])

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit} role="search">
      <div className={styles.inputWrapper}>
        <SearchIcon className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.input}
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <CloseIcon className={styles.clearIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}
