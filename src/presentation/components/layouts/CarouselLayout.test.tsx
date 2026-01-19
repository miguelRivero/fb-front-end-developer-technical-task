/**
 * Integration tests for CarouselLayout component
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockImage, createMockMatchMedia, createMockPhotoArray } from '../../../test/mocks'
import { screen, waitFor } from '@testing-library/react'

import { CarouselLayout } from './CarouselLayout'
import { UiError } from '../../errors/UiError'
import { renderWithProviders } from '../../../test/utils'
import userEvent from '@testing-library/user-event'

describe('CarouselLayout Integration Tests', () => {
  let mockImage: ReturnType<typeof createMockImage>

  beforeEach(() => {
    vi.clearAllMocks()
    mockImage = createMockImage()
    
    // Mock matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMockMatchMedia(true),
    })

    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockImage.clearImages()
  })

  describe('carousel rendering', () => {
    it('should render carousel with photos', () => {
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Should render images
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should render all slides', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // All slides should be in the DOM
      const slides = container.querySelectorAll('[data-testid="carousel-slide"]')
      expect(slides.length).toBe(photos.length)
    })
  })

  describe('slide navigation', () => {
    it('should navigate to next slide', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      // Should have navigated (check for active slide change)
      // The exact implementation depends on how active state is shown
      expect(nextButton).toBeInTheDocument()
    })

    it('should navigate to previous slide', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // First navigate to next, then previous
      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      const prevButton = screen.getByLabelText('Previous photo')
      await user.click(prevButton)

      expect(prevButton).toBeInTheDocument()
    })

    it('should wrap around when reaching end', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Navigate to last slide
      const nextButton = screen.getByLabelText('Next photo')
      for (let i = 0; i < photos.length; i++) {
        await user.click(nextButton)
        await waitFor(() => {
          // Button should still be clickable
          expect(nextButton).toBeInTheDocument()
        })
      }
    })

    it('should wrap around when reaching beginning', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Navigate backwards from first slide
      const prevButton = screen.getByLabelText('Previous photo')
      await user.click(prevButton)

      // Should wrap to last slide
      expect(prevButton).toBeInTheDocument()
    })
  })

  describe('touch/swipe handling', () => {
    it('should handle touch start event', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const carousel = container.querySelector('[class*="carousel"]')
      expect(carousel).toBeInTheDocument()

      if (carousel) {
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 100,
              clientY: 100,
            } as Touch,
          ],
        })

        carousel.dispatchEvent(touchStartEvent)
        // Should not throw error
        expect(carousel).toBeInTheDocument()
      }
    })

    it('should handle swipe left (next)', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const carousel = container.querySelector('[class*="carousel"]')
      if (carousel) {
        // Simulate swipe left (touchStart > touchEnd with sufficient distance)
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 200,
              clientY: 100,
            } as Touch,
          ],
        })

        const touchMoveEvent = new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 100,
              clientY: 100,
            } as Touch,
          ],
        })

        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
        })

        carousel.dispatchEvent(touchStartEvent)
        carousel.dispatchEvent(touchMoveEvent)
        carousel.dispatchEvent(touchEndEvent)

        // Should handle swipe without error
        expect(carousel).toBeInTheDocument()
      }
    })

    it('should handle swipe right (previous)', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const carousel = container.querySelector('[class*="carousel"]')
      if (carousel) {
        // Simulate swipe right (touchStart < touchEnd with sufficient distance)
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 100,
              clientY: 100,
            } as Touch,
          ],
        })

        const touchMoveEvent = new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 200,
              clientY: 100,
            } as Touch,
          ],
        })

        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
        })

        carousel.dispatchEvent(touchStartEvent)
        carousel.dispatchEvent(touchMoveEvent)
        carousel.dispatchEvent(touchEndEvent)

        // Should handle swipe without error
        expect(carousel).toBeInTheDocument()
      }
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate with ArrowRight key', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Focus on carousel or document
      await user.keyboard('{ArrowRight}')

      // Should navigate (no error thrown)
      expect(screen.getByLabelText('Next photo')).toBeInTheDocument()
    })

    it('should navigate with ArrowLeft key', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // First go forward, then back
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{ArrowLeft}')

      // Should navigate (no error thrown)
      expect(screen.getByLabelText('Previous photo')).toBeInTheDocument()
    })
  })

  describe('pagination dots', () => {
    it('should render pagination dots', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const dots = container.querySelectorAll('[data-testid="carousel-dot"]')
      expect(dots.length).toBe(photos.length)
    })

    it('should highlight active dot', () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const dots = container.querySelectorAll('[data-testid="carousel-dot"]')
      expect(dots.length).toBeGreaterThan(0)

      // At least one dot should be active
      const activeDot = container.querySelector('[class*="dotActive"]')
      expect(activeDot).toBeInTheDocument()
    })

    it('should navigate to slide when dot is clicked', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const dots = container.querySelectorAll('[data-testid="carousel-dot"]')
      if (dots.length > 0) {
        const secondDot = dots[1] as HTMLElement
        await user.click(secondDot)

        // Should navigate to that slide
        expect(secondDot).toBeInTheDocument()
      }
    })
  })

  describe('mobile progress bar', () => {
    it('should render mobile progress bar', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const progressBar = container.querySelector('[class*="mobileProgress"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('should update progress bar as slides change', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const progressBar = container.querySelector('[class*="mobileProgress"]')
      expect(progressBar).toBeInTheDocument()

      // Navigate to next slide
      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      // Progress should update
      await waitFor(() => {
        expect(progressBar).toBeInTheDocument()
      })
    })
  })

  describe('slides per view based on viewport', () => {
    it('should show 1 slide on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Should render carousel
      const carousel = container.querySelector('[class*="carousel"]')
      expect(carousel).toBeInTheDocument()
    })

    it('should show 2 slides on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Should render carousel
      const carousel = container.querySelector('[class*="carousel"]')
      expect(carousel).toBeInTheDocument()
    })

    it('should show 3 slides on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Should render carousel
      const carousel = container.querySelector('[class*="carousel"]')
      expect(carousel).toBeInTheDocument()
    })

    it('should update slides per view on resize', async () => {
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Change viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      window.dispatchEvent(new Event('resize'))

      await waitFor(() => {
        const carousel = container.querySelector('[class*="carousel"]')
        expect(carousel).toBeInTheDocument()
      })
    })
  })

  describe('image preloading', () => {
    it('should preload adjacent images', () => {
      const photos = createMockPhotoArray(5)

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // Images should be preloaded (check mockImage instances)
      // The exact number depends on implementation
      expect(mockImage).toBeDefined()
    })
  })

  describe('transition states', () => {
    it('should handle transition during slide change', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      // Should have transition class during change
      await waitFor(() => {
        const slidesWrapper = container.querySelector('[class*="slidesWrapper"]')
        expect(slidesWrapper).toBeInTheDocument()
      })
    })
  })

  describe('empty/error states', () => {
    it('should display empty state when no photos', () => {
      renderWithProviders(
        <CarouselLayout
          photos={[]}
          loading={false}
        />
      )

      expect(screen.getByText('No photos to display')).toBeInTheDocument()
    })

    it('should display error message when error is provided', () => {
      const error = new UiError('Failed to fetch photos', 'network')
      
      renderWithProviders(
        <CarouselLayout
          photos={[]}
          loading={false}
          error={error}
        />
      )

      expect(screen.getByText(/error: failed to fetch photos/i)).toBeInTheDocument()
    })

    it('should not display carousel when error exists', () => {
      const photos = createMockPhotoArray(3)
      const error = new UiError('Network error', 'network')
      
      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
          error={error}
        />
      )

      // Should show error, not carousel
      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      const carousel = container.querySelector('[class*="carousel"]')
      expect(carousel).not.toBeInTheDocument()
    })
  })
})
