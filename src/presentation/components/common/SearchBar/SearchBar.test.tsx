import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render with initial query', () => {
    render(<SearchBar initialQuery="nature" onSearch={() => {}} />)
    expect(screen.getByDisplayValue('nature')).toBeInTheDocument()
  })

  it('should call onSearch when typing (after debounce)', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} debounceDelay={100} />)

    const input = screen.getByPlaceholderText('Search photos...')
    fireEvent.change(input, { target: { value: 'mountain' } })

    // Should not be called immediately
    expect(onSearch).not.toHaveBeenCalled()

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onSearch).toHaveBeenCalledWith('mountain')
  })

  it('should call onSearch immediately on form submit', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByPlaceholderText('Search photos...')
    fireEvent.change(input, { target: { value: 'sea' } })

    const form = screen.getByRole('search')
    fireEvent.submit(form)

    expect(onSearch).toHaveBeenCalledWith('sea')
  })

  it('should clear input when clear button is clicked', () => {
    const onSearch = vi.fn()
    render(<SearchBar initialQuery="nature" onSearch={onSearch} />)

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(screen.getByPlaceholderText('Search photos...')).toHaveValue('')
  })
})
