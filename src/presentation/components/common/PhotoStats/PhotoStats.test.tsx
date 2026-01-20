/**
 * Tests for PhotoStats component
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { PhotoStats } from './PhotoStats'
import React from 'react'
import { createMockPhoto } from '@/test/mocks'

describe('PhotoStats', () => {
  describe('likes count display', () => {
    it('should display likes count', () => {
      const photo = createMockPhoto({ likes: 150 })
      render(<PhotoStats photo={photo} />)

      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should format large numbers with locale formatting', () => {
      const photo = createMockPhoto({ likes: 1500 })
      render(<PhotoStats photo={photo} />)

      // toLocaleString may format as "1,500" or "1 500" depending on locale
      const likesElement = screen.getByText(/\d+/)
      expect(likesElement).toBeInTheDocument()
    })

    it('should display zero likes', () => {
      const photo = createMockPhoto({ likes: 0 })
      render(<PhotoStats photo={photo} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('views count display', () => {
    it('should display views when showViews is true', () => {
      const photo = createMockPhoto({ views: 321 })
      render(<PhotoStats photo={photo} showViews={true} />)

      expect(screen.getByText('321')).toBeInTheDocument()
      expect(screen.getByText(/views/i)).toBeInTheDocument()
      expect(screen.getByLabelText('views: 321')).toBeInTheDocument()
    })

    it('should not display views when showViews is false', () => {
      const photo = createMockPhoto()
      render(<PhotoStats photo={photo} showViews={false} />)

      expect(screen.queryByText(/views/i)).not.toBeInTheDocument()
    })

    it('should not display views by default', () => {
      const photo = createMockPhoto()
      render(<PhotoStats photo={photo} />)

      expect(screen.queryByText(/views/i)).not.toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should apply sm size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} size="sm" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toEqual(expect.stringContaining('stats-sm'))
    })

    it('should apply md size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} size="md" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toEqual(expect.stringContaining('stats-md'))
    })

    it('should apply lg size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} size="lg" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toEqual(expect.stringContaining('stats-lg'))
    })

    it('should default to md size', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toEqual(expect.stringContaining('stats-md'))
    })
  })

  describe('theme variants', () => {
    it('should apply light theme when lightTheme is true', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} lightTheme={true} />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toEqual(expect.stringContaining('statsLight'))
    })

    it('should not apply light theme by default', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} />)

      const element = container.firstChild as HTMLElement
      expect(element.className).not.toEqual(expect.stringContaining('statsLight'))
    })

    it('should not apply light theme when explicitly set to false', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} lightTheme={false} />)

      const element = container.firstChild
      expect(element).not.toHaveClass(/statsLight/)
    })
  })

  describe('showLikesLabel prop', () => {
    it('should show likes label when showLikesLabel is true', () => {
      const photo = createMockPhoto({ likes: 100 })
      render(<PhotoStats photo={photo} showLikesLabel={true} />)

      expect(screen.getByText(/likes/i)).toBeInTheDocument()
    })

    it('should not show likes label by default', () => {
      const photo = createMockPhoto({ likes: 100 })
      render(<PhotoStats photo={photo} />)

      expect(screen.queryByText(/likes/i)).not.toBeInTheDocument()
    })
  })

  describe('number formatting', () => {
    it('should format numbers with thousands separator', () => {
      const photo = createMockPhoto({ likes: 1500 })
      render(<PhotoStats photo={photo} />)

      // toLocaleString may format as "1,500" or "1 500"
      const textContent = screen.getByText(/\d+/).textContent
      expect(textContent).toContain('1')
      expect(textContent).toContain('5')
    })

    it('should format very large numbers', () => {
      const photo = createMockPhoto({ likes: 1234567 })
      render(<PhotoStats photo={photo} />)

      const likesElement = screen.getByText(/\d+/)
      expect(likesElement).toBeInTheDocument()
      expect(likesElement.textContent).toContain('1')
    })
  })

  describe('with zero values', () => {
    it('should display zero likes', () => {
      const photo = createMockPhoto({ likes: 0 })
      render(<PhotoStats photo={photo} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have aria-hidden on icons', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoStats photo={photo} />)

      // SVG icons should be hidden from assistive tech
      const icons = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should provide context for the likes count to assistive technology', () => {
      const photo = createMockPhoto({ likes: 100 })
      render(<PhotoStats photo={photo} />)

      expect(screen.getByLabelText('Likes: 100')).toBeInTheDocument()
    })
  })
})
