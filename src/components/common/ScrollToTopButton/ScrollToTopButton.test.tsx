import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ScrollToTopButton } from './ScrollToTopButton'

describe('ScrollToTopButton', () => {
  const originalScrollTo = window.scrollTo

  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    })
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    window.scrollTo = originalScrollTo
  })

  it('should be hidden at the top of the page', () => {
    render(<ScrollToTopButton />)

    const button = screen.getByTestId('scroll-to-top')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')
  })

  it('should become visible after scrolling down', async () => {
    render(<ScrollToTopButton visibilityThresholdPx={100} />)

    const button = screen.getByTestId('scroll-to-top')
    expect(button).toHaveAttribute('aria-hidden', 'true')

    Object.defineProperty(window, 'scrollY', {
      value: 200,
      writable: true,
      configurable: true,
    })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    await waitFor(() => {
      expect(button).not.toHaveAttribute('aria-hidden')
      expect(button).toHaveAttribute('tabindex', '0')
    })
  })

  it('should scroll to top when clicked', async () => {
    const user = userEvent.setup()
    render(<ScrollToTopButton visibilityThresholdPx={10} />)

    Object.defineProperty(window, 'scrollY', {
      value: 50,
      writable: true,
      configurable: true,
    })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    const button = await screen.findByTestId('scroll-to-top')
    await waitFor(() => {
      expect(button).not.toHaveAttribute('aria-hidden')
    })

    await user.click(button)

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 })
    )
  })
})

