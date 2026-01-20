/**
 * Tests for CreatorInfo component
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CreatorInfo } from './CreatorInfo'
import { createMockPhoto } from '@/test/mocks'

describe('CreatorInfo', () => {
  describe('creator name display', () => {
    it('should display creator name', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display different creator names', () => {
      const photo1 = createMockPhoto({
        creator: {
          name: 'Jane Smith',
          username: 'janesmith',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      const { rerender } = render(<CreatorInfo photo={photo1} />)
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()

      const photo2 = createMockPhoto({
        creator: {
          name: 'Bob Johnson',
          username: 'bobjohnson',
          profileImageUrl: 'https://example.com/profile2.jpg',
        },
      })
      rerender(<CreatorInfo photo={photo2} />)
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })
  })

  describe('username display', () => {
    it('should display username when showUsername is true', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} showUsername={true} />)

      expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })

    it('should display username by default', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })

    it('should not display username when showUsername is false', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} showUsername={false} />)

      expect(screen.queryByText('@johndoe')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('profile image rendering', () => {
    it('should render profile image', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      const image = screen.getByAltText("John Doe's profile")
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/profile.jpg')
    })

    it('should have correct alt text for profile image', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'Jane Smith',
          username: 'janesmith',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      expect(screen.getByAltText("Jane Smith's profile")).toBeInTheDocument()
    })

    it('should have lazy loading on profile image', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      const image = screen.getByAltText("John Doe's profile") as HTMLImageElement
      expect(image.loading).toBe('lazy')
    })
  })

  describe('size variants', () => {
    it('should apply sm size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} size="sm" />)

      const element = container.firstChild
      expect(element?.className).toMatch(/creatorInfo-sm/)
    })

    it('should apply md size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} size="md" />)

      const element = container.firstChild
      expect(element?.className).toMatch(/creatorInfo-md/)
    })

    it('should apply lg size variant', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} size="lg" />)

      const element = container.firstChild
      expect(element?.className).toMatch(/creatorInfo-lg/)
    })

    it('should default to md size', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} />)

      const element = container.firstChild
      expect(element?.className).toMatch(/creatorInfo-md/)
    })

    it('should set correct image dimensions for sm size', () => {
      const photo = createMockPhoto()
      render(<CreatorInfo photo={photo} size="sm" />)

      const image = screen.getByAltText(new RegExp(".*'s profile"))
      expect(image).toHaveAttribute('width', '24')
      expect(image).toHaveAttribute('height', '24')
    })

    it('should set correct image dimensions for md size', () => {
      const photo = createMockPhoto()
      render(<CreatorInfo photo={photo} size="md" />)

      const image = screen.getByAltText(new RegExp(".*'s profile"))
      expect(image).toHaveAttribute('width', '32')
      expect(image).toHaveAttribute('height', '32')
    })

    it('should set correct image dimensions for lg size', () => {
      const photo = createMockPhoto()
      render(<CreatorInfo photo={photo} size="lg" />)

      const image = screen.getByAltText(new RegExp(".*'s profile"))
      expect(image).toHaveAttribute('width', '48')
      expect(image).toHaveAttribute('height', '48')
    })
  })

  describe('theme variants', () => {
    it('should apply light theme when lightTheme is true', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} lightTheme={true} />)

      const element = container.firstChild
      expect(element?.className).toMatch(/creatorInfo-light/)
    })

    it('should not apply light theme by default', () => {
      const photo = createMockPhoto()
      const { container } = render(<CreatorInfo photo={photo} />)

      const element = container.firstChild
      expect(element?.className).not.toMatch(/creatorInfo-light/)
    })
  })

  describe('with missing creator data', () => {
    it('should handle missing creator name gracefully', () => {
      const photo = createMockPhoto({
        creator: {
          name: '',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      // Should still render, even with empty name
      expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })

    it('should handle missing username gracefully', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: '',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('@')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper alt text for profile images', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      const image = screen.getByAltText("John Doe's profile")
      expect(image).toBeInTheDocument()
    })

    it('should be readable by screen readers', () => {
      const photo = createMockPhoto({
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<CreatorInfo photo={photo} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })
  })
})
