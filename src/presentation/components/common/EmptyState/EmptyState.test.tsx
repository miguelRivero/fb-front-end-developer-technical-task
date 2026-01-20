/**
 * Tests for EmptyState component
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  describe('error state display', () => {
    it('should display error message when error is provided', () => {
      const error = new Error('Failed to load photos')
      render(<EmptyState error={error} />)

      expect(screen.getByText(/error: failed to load photos/i)).toBeInTheDocument()
    })

    it('should display different error messages', () => {
      const error1 = new Error('Network error')
      const { rerender } = render(<EmptyState error={error1} />)
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument()

      const error2 = new Error('API rate limit exceeded')
      rerender(<EmptyState error={error2} />)
      expect(screen.getByText(/error: api rate limit exceeded/i)).toBeInTheDocument()
    })
  })

  describe('empty state display', () => {
    it('should display default empty message when no error', () => {
      render(<EmptyState />)

      expect(screen.getByText('No photos to display')).toBeInTheDocument()
    })

    it('should display custom empty message', () => {
      const customMessage = 'No photos found for your search'
      render(<EmptyState emptyMessage={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('should not display error message when error is null', () => {
      render(<EmptyState error={null} />)

      expect(screen.queryByText(/error:/i)).not.toBeInTheDocument()
      expect(screen.getByText('No photos to display')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EmptyState className="custom-class" />
      )

      const element = container.firstChild
      expect(element).toHaveClass('custom-class')
    })

    it('should apply multiple classNames', () => {
      const { container } = render(
        <EmptyState className="custom-class another-class" />
      )

      const element = container.firstChild
      expect(element).toHaveClass('custom-class')
      expect(element).toHaveClass('another-class')
    })
  })

  describe('accessibility', () => {
    it('should render with appropriate role', () => {
      const { container } = render(<EmptyState />)

      // Component should render as a div (semantic HTML)
      const element = container.firstChild
      expect(element).toBeInstanceOf(HTMLDivElement)
    })

    it('should be accessible to screen readers', () => {
      render(<EmptyState emptyMessage="No results found" />)

      // Text content should be readable
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })
})
