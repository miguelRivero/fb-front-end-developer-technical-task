/**
 * Tests for PhotoImage component
 */

import '@testing-library/jest-dom'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { PhotoImage } from './PhotoImage'
import { createMockPhoto } from '@/test/mocks'

describe('PhotoImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('image rendering with different urlTypes', () => {
    it('should render image with regular urlType by default', () => {
      const photo = createMockPhoto({
        urls: {
          raw: 'https://example.com/raw.jpg',
          full: 'https://example.com/full.jpg',
          regular: 'https://example.com/regular.jpg',
          small: 'https://example.com/small.jpg',
          thumb: 'https://example.com/thumb.jpg',
        },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.src).toContain('regular')
    })

    it('should render image with thumb urlType', () => {
      const photo = createMockPhoto({
        urls: {
          raw: 'https://example.com/raw.jpg',
          full: 'https://example.com/full.jpg',
          regular: 'https://example.com/regular.jpg',
          small: 'https://example.com/small.jpg',
          thumb: 'https://example.com/thumb.jpg',
        },
      })
      render(<PhotoImage photo={photo} urlType="thumb" />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.src).toContain('thumb')
    })

    it('should render image with small urlType', () => {
      const photo = createMockPhoto({
        urls: {
          raw: 'https://example.com/raw.jpg',
          full: 'https://example.com/full.jpg',
          regular: 'https://example.com/regular.jpg',
          small: 'https://example.com/small.jpg',
          thumb: 'https://example.com/thumb.jpg',
        },
      })
      render(<PhotoImage photo={photo} urlType="small" />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.src).toContain('small')
    })

    it('should render image with full urlType', () => {
      const photo = createMockPhoto({
        urls: {
          raw: 'https://example.com/raw.jpg',
          full: 'https://example.com/full.jpg',
          regular: 'https://example.com/regular.jpg',
          small: 'https://example.com/small.jpg',
          thumb: 'https://example.com/thumb.jpg',
        },
      })
      render(<PhotoImage photo={photo} urlType="full" />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.src).toContain('full')
    })
  })

  describe('responsive images (srcSet and sizes)', () => {
    it('should render a default srcset built from photo urls', () => {
      const photo = createMockPhoto({
        urls: {
          raw: 'https://example.com/raw.jpg',
          full: 'https://example.com/full.jpg',
          regular: 'https://example.com/regular.jpg',
          small: 'https://example.com/small.jpg',
          thumb: 'https://example.com/thumb.jpg',
        },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement
      const srcSet = image.getAttribute('srcset')
      expect(srcSet).toBeTruthy()
      expect(srcSet).toContain('https://example.com/thumb.jpg 200w')
      expect(srcSet).toContain('https://example.com/small.jpg 400w')
      expect(srcSet).toContain('https://example.com/regular.jpg 1080w')
      expect(srcSet).toContain('https://example.com/full.jpg 2000w')
    })

    it('should set sizes when provided and srcset exists', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} sizes="100vw" />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.getAttribute('sizes')).toBe('100vw')
      expect(image.getAttribute('srcset')).toBeTruthy()
    })

    it('should use srcSet override when provided', () => {
      const photo = createMockPhoto()
      render(
        <PhotoImage
          photo={photo}
          srcSet="https://example.com/a.jpg 200w, https://example.com/b.jpg 400w"
        />
      )

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.getAttribute('srcset')).toContain('https://example.com/a.jpg 200w')
      expect(image.getAttribute('srcset')).toContain('https://example.com/b.jpg 400w')
    })
  })

  describe('aspect ratio classes', () => {
    it('should apply auto aspect ratio by default', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('aspect-auto')
    })

    it('should apply 4/3 aspect ratio', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} aspectRatio="4/3" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('aspect-4/3')
    })

    it('should apply 16/10 aspect ratio', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} aspectRatio="16/10" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('aspect-16/10')
    })

    it('should apply square aspect ratio', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} aspectRatio="square" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('aspect-square')
    })
  })

  describe('loading state (skeleton display)', () => {
    it('should show skeleton while image is loading', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      // Skeleton should be present initially
      const skeleton = document.querySelector('[aria-hidden="true"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('should hide skeleton after image loads', async () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement

      // Simulate image load
      Object.defineProperty(image, 'complete', { value: true, writable: true })
      image.dispatchEvent(new Event('load'))

      await waitFor(() => {
        const skeleton = document.querySelector('[aria-hidden="true"]')
        expect(skeleton).not.toBeInTheDocument()
      })
    })
  })

  describe('image load event handling', () => {
    it('should call onImageLoad callback when image loads', async () => {
      const photo = createMockPhoto()
      const onImageLoad = vi.fn()
      render(<PhotoImage photo={photo} onImageLoad={onImageLoad} />)

      const image = screen.getByRole('img') as HTMLImageElement

      // Simulate image load
      Object.defineProperty(image, 'complete', { value: true, writable: true })
      image.dispatchEvent(new Event('load'))

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onImageLoad if not provided', async () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement

      // Should not throw error
      expect(() => {
        Object.defineProperty(image, 'complete', { value: true, writable: true })
        image.dispatchEvent(new Event('load'))
      }).not.toThrow()
    })
  })

  describe('error state display', () => {
    it('should display error state when image fails to load', async () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement

      // Simulate image error
      image.dispatchEvent(new Event('error'))

      await waitFor(() => {
        expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
      })
    })

    it('should show error icon and message', async () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement
      image.dispatchEvent(new Event('error'))

      await waitFor(() => {
        expect(screen.getByText('Image unavailable')).toBeInTheDocument()
        expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
      })
    })

    it('should call onError callback when image fails to load', async () => {
      const photo = createMockPhoto()
      const onError = vi.fn()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(<PhotoImage photo={photo} onError={onError} />)

      const image = screen.getByRole('img') as HTMLImageElement
      image.dispatchEvent(new Event('error'))

      await waitFor(() => {
        expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })

    it('should keep error wrapper keyboard-activatable when onClick is provided', async () => {
      const photo = createMockPhoto()
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      const image = screen.getByRole('img') as HTMLImageElement
      image.dispatchEvent(new Event('error'))

      await waitFor(() => {
        expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
      })

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('role')).toBe('button')
      expect(wrapper.tabIndex).toBe(0)

      wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('alt text generation', () => {
    it('should use altDescription when available', () => {
      const photo = createMockPhoto({ altDescription: 'A beautiful sunset' })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByAltText('A beautiful sunset')
      expect(image).toBeInTheDocument()
    })

    it('should use creator name when altDescription is not available', () => {
      const photo = createMockPhoto({
        altDescription: null,
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByAltText('Photo by John Doe')
      expect(image).toBeInTheDocument()
    })

    it('should use default alt text when neither altDescription nor creator.name available', () => {
      const photo = createMockPhoto({
        altDescription: null,
        creator: {
          name: '',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByAltText('Photo')
      expect(image).toBeInTheDocument()
    })

    it('should prioritize altDescription over creator name', () => {
      const photo = createMockPhoto({
        altDescription: 'A beautiful sunset',
        creator: {
          name: 'John Doe',
          username: 'johndoe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByAltText('A beautiful sunset')
      expect(image).toBeInTheDocument()
      expect(screen.queryByAltText('Photo by John Doe')).not.toBeInTheDocument()
    })
  })

  describe('click handler', () => {
    it('should call onClick when image is clicked', () => {
      const photo = createMockPhoto()
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      const wrapper = container.firstChild as HTMLElement
      wrapper.click()

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should add button semantics when onClick is provided', () => {
      const photo = createMockPhoto()
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('role')).toBe('button')
      expect(wrapper.tabIndex).toBe(0)
    })

    it('should allow activation via Enter and Space when onClick is provided', () => {
      const photo = createMockPhoto()
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      const wrapper = container.firstChild as HTMLElement

      wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onClick).toHaveBeenCalledTimes(1)

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      wrapper.dispatchEvent(spaceEvent)
      expect(spaceEvent.defaultPrevented).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('should apply clickable class when onClick provided', () => {
      const photo = createMockPhoto()
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('clickable')
    })

    it('should not apply clickable class when onClick not provided', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('clickable')
      expect(wrapper.getAttribute('role')).toBeNull()
      expect(wrapper.tabIndex).toBe(-1)
    })
  })

  describe('priority loading attribute', () => {
    it('should set loading="eager" when priority is true', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} priority={true} />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.loading).toBe('eager')
    })

    it('should set loading="lazy" when priority is false', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} priority={false} />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.loading).toBe('lazy')
    })

    it('should default to lazy loading', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.loading).toBe('lazy')
    })
  })

  describe('hover state', () => {
    it('should apply hover class when isHovered is true', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} isHovered={true} />)

      const image = screen.getByRole('img')
      expect(image.className).toContain('imageHovered')
    })

    it('should not apply hover class when isHovered is false', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} isHovered={false} />)

      const image = screen.getByRole('img')
      expect(image.className).not.toContain('imageHovered')
    })

    it('should default to not hovered', () => {
      const photo = createMockPhoto()
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img')
      expect(image.className).not.toContain('imageHovered')
    })
  })

  describe('image dimensions', () => {
    it('should set width and height attributes from photo dimensions', () => {
      const photo = createMockPhoto({
        dimensions: { width: 4000, height: 3000 },
      })
      render(<PhotoImage photo={photo} />)

      const image = screen.getByRole('img') as HTMLImageElement
      expect(image.width).toBe(4000)
      expect(image.height).toBe(3000)
    })
  })
  describe('with missing photo data (edge cases)', () => {
    it('should handle photo with empty urls gracefully', () => {
      const photo = createMockPhoto({
        urls: {
          raw: '',
          full: '',
          regular: '',
          small: '',
          thumb: '',
        },
      })
      render(<PhotoImage photo={photo} />)

      // When no usable URL exists, the component should render the placeholder error UI.
      expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
    })

    it('should keep placeholder wrapper keyboard-activatable when onClick is provided', () => {
      const photo = createMockPhoto({
        urls: {
          raw: '',
          full: '',
          regular: '',
          small: '',
          thumb: '',
        },
      })
      const onClick = vi.fn()
      const { container } = render(<PhotoImage photo={photo} onClick={onClick} />)

      expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('role')).toBe('button')
      expect(wrapper.tabIndex).toBe(0)

      wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('className prop', () => {
    it('should apply custom className', () => {
      const photo = createMockPhoto()
      const { container } = render(<PhotoImage photo={photo} className="custom-class" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })
  })
})
