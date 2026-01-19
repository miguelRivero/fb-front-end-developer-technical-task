/**
 * Tests for PhotoDescription component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoDescription } from './PhotoDescription'

describe('PhotoDescription', () => {
  describe('description text display', () => {
    it('should display description text', () => {
      const description = 'A beautiful sunset over the ocean'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('A beautiful sunset over the ocean')).toBeInTheDocument()
    })

    it('should capitalize first character', () => {
      const description = 'a beautiful sunset'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('A beautiful sunset')).toBeInTheDocument()
    })

    it('should display description with multiple sentences', () => {
      const description = 'A beautiful sunset. The sky is painted in vibrant colors.'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText(/A beautiful sunset/)).toBeInTheDocument()
    })
  })

  describe('maxLines truncation', () => {
    it('should truncate to default maxLines (2)', () => {
      const longDescription =
        'This is a very long description that should be truncated to two lines because it exceeds the maximum line limit set for photo descriptions in the gallery view.'
      render(<PhotoDescription description={longDescription} />)

      const element = screen.getByText(/This is a very long description/)
      expect(element).toBeInTheDocument()
      // Verify truncation is applied via CSS (WebkitLineClamp)
      expect(element).toHaveStyle({ WebkitLineClamp: '2' })
    })

    it('should truncate to custom maxLines', () => {
      const longDescription = 'This is a long description that should be truncated to three lines.'
      render(<PhotoDescription description={longDescription} maxLines={3} />)

      const element = screen.getByText(/This is a long description/)
      expect(element).toHaveStyle({ WebkitLineClamp: '3' })
    })

    it('should allow single line display', () => {
      const description = 'A single line description'
      render(<PhotoDescription description={description} maxLines={1} />)

      const element = screen.getByText('A single line description')
      expect(element).toHaveStyle({ WebkitLineClamp: '1' })
    })

    it('should allow multiple lines', () => {
      const description = 'A multi-line description'
      render(<PhotoDescription description={description} maxLines={5} />)

      const element = screen.getByText('A multi-line description')
      expect(element).toHaveStyle({ WebkitLineClamp: '5' })
    })
  })

  describe('with null/undefined description', () => {
    it('should return null for null description', () => {
      const { container } = render(<PhotoDescription description={null} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null for undefined description', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      const { container } = render(<PhotoDescription description={undefined} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('with long descriptions', () => {
    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(500)
      render(<PhotoDescription description={longDescription} />)

      const element = screen.getByText(/^A/)
      expect(element).toBeInTheDocument()
      expect(element).toHaveStyle({ WebkitLineClamp: '2' })
    })

    it('should truncate long text with ellipsis (CSS)', () => {
      const longDescription =
        'This is a very long description that spans multiple lines and should be truncated with ellipsis when it exceeds the maximum number of lines allowed.'
      render(<PhotoDescription description={longDescription} maxLines={2} />)

      const element = screen.getByText(/This is a very long description/)
      expect(element).toBeInTheDocument()
      // Ellipsis is handled by CSS, not JavaScript
      expect(element).toHaveStyle({ WebkitLineClamp: '2' })
    })
  })

  describe('size variants', () => {
    it('should apply sm size variant', () => {
      const { container } = render(
        <PhotoDescription description="Test" size="sm" />
      )

      const element = container.firstChild
      expect(element).toHaveClass(/description-sm/)
    })

    it('should apply md size variant', () => {
      const { container } = render(
        <PhotoDescription description="Test" size="md" />
      )

      const element = container.firstChild
      expect(element).toHaveClass(/description-md/)
    })

    it('should default to md size', () => {
      const { container } = render(<PhotoDescription description="Test" />)

      const element = container.firstChild
      expect(element).toHaveClass(/description-md/)
    })
  })

  describe('className prop', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PhotoDescription description="Test" className="custom-class" />
      )

      const element = container.firstChild
      expect(element).toHaveClass('custom-class')
    })
  })

  describe('capitalization', () => {
    it('should capitalize first character of lowercase text', () => {
      const description = 'lowercase description'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('Lowercase description')).toBeInTheDocument()
    })

    it('should not change already capitalized text', () => {
      const description = 'Already Capitalized'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('Already Capitalized')).toBeInTheDocument()
    })

    it('should capitalize first character but keep rest as-is', () => {
      const description = 'MiXeD cAsE dEsCrIpTiOn'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('MiXeD cAsE dEsCrIpTiOn')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be readable by screen readers', () => {
      const description = 'A beautiful landscape photo'
      render(<PhotoDescription description={description} />)

      expect(screen.getByText('A beautiful landscape photo')).toBeInTheDocument()
    })

    it('should not render when description is null (no empty element)', () => {
      const { container } = render(<PhotoDescription description={null} />)

      expect(container.firstChild).toBeNull()
    })
  })
})
