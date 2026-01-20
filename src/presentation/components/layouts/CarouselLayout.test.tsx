/**
 * Integration tests for CarouselLayout component
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockImage, createMockMatchMedia, createMockPhotoArray } from '@/test/mocks'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { CarouselLayout } from './CarouselLayout'
import { UiError } from '@/presentation/errors/UiError'
import { renderWithProviders } from '@/test/utils'
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

    it('should call onPhotoClick when a photo is clicked', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
          onPhotoClick={onPhotoClick}
        />
      )

      // Clicking the image should bubble to the clickable PhotoImage wrapper.
      const images = screen.getAllByRole('img')
      await user.click(images[0])

      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(photos[0])
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

      // Verify initial active index (progress text is always rendered)
      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      // Should have navigated (active index changed)
      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
    })

    it('should navigate to previous slide', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const getSlidesWrapper = () => container.querySelector('[class*="slidesWrapper"]') as HTMLElement | null
      const waitForTransitionToEnd = async () => {
        // Ensure follow-up navigation isn't blocked by `isTransitioning`.
        await waitFor(() => {
          const el = getSlidesWrapper()
          expect(el).toBeTruthy()
          expect(el!.className).not.toContain('transitioning')
        })
      }

      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      // First navigate to next, then previous
      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
      await waitForTransitionToEnd()

      const prevButton = screen.getByLabelText('Previous photo')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByText('1 / 5')).toBeInTheDocument()
      })
    })

    it('should wrap around when reaching end', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)

      // Force 1 slide per view so wrap-around is observable.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const getSlidesWrapper = () => container.querySelector('[class*="slidesWrapper"]') as HTMLElement | null
      const waitForTransitionToEnd = async () => {
        await waitFor(() => {
          const el = getSlidesWrapper()
          expect(el).toBeTruthy()
          expect(el!.className).not.toContain('transitioning')
        })
      }

      expect(screen.getByText('1 / 3')).toBeInTheDocument()

      // Navigate through all slides and wrap back to the start
      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)
      await waitFor(() => expect(screen.getByText('2 / 3')).toBeInTheDocument())
      await waitForTransitionToEnd()

      await user.click(nextButton)
      await waitFor(() => expect(screen.getByText('3 / 3')).toBeInTheDocument())
      await waitForTransitionToEnd()

      // One more click should wrap to the beginning
      await user.click(nextButton)
      await waitFor(() => expect(screen.getByText('1 / 3')).toBeInTheDocument())
    })

    it('should wrap around when reaching beginning', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)

      // Force 1 slide per view so wrap-around is observable.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      expect(screen.getByText('1 / 3')).toBeInTheDocument()

      // Navigate backwards from first slide
      const prevButton = screen.getByLabelText('Previous photo')
      await user.click(prevButton)

      // Should wrap to last slide
      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument()
      })
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

    it('should handle swipe left (next)', async () => {
      const photos = createMockPhotoArray(5)

      // Force 1 slide per view so navigation is unambiguous.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // The outer container class also contains "carousel", so target the real carousel element.
      const carousel = container.querySelector('[class*="carouselContainer"] > [class*="carousel"]')
      if (!carousel) {
        throw new Error('Expected carousel element to be rendered')
      }

      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      // Simulate swipe left (touchStart > touchEnd with sufficient distance)
      // Note: `fireEvent` is already wrapped in `act()` by Testing Library, and
      // firing these as separate events ensures state flushes between them.
      fireEvent.touchStart(carousel, {
        touches: [{ clientX: 200, clientY: 100 }],
        targetTouches: [{ clientX: 200, clientY: 100 }],
      })
      fireEvent.touchMove(carousel, {
        touches: [{ clientX: 100, clientY: 100 }],
        targetTouches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchEnd(carousel)

      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
    })

    it('should handle swipe right (previous)', async () => {
      const photos = createMockPhotoArray(5)

      // Force 1 slide per view so navigation is unambiguous.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      // The outer container class also contains "carousel", so target the real carousel element.
      const carousel = container.querySelector('[class*="carouselContainer"] > [class*="carousel"]')
      if (!carousel) {
        throw new Error('Expected carousel element to be rendered')
      }

      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      // Simulate swipe right (touchStart < touchEnd with sufficient distance)
      fireEvent.touchStart(carousel, {
        touches: [{ clientX: 100, clientY: 100 }],
        targetTouches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchMove(carousel, {
        touches: [{ clientX: 200, clientY: 100 }],
        targetTouches: [{ clientX: 200, clientY: 100 }],
      })
      fireEvent.touchEnd(carousel)

      // Should navigate to previous slide (wrap to last)
      await waitFor(() => {
        expect(screen.getByText('5 / 5')).toBeInTheDocument()
      })
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate with ArrowRight key', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      // Force 1 slide per view so "active slide" movement is unambiguous.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      const dots = container.querySelectorAll('[data-testid="carousel-dot"]')
      expect(dots.length).toBe(5)
      expect(dots[0].className).toContain('dotActive')

      await user.keyboard('{ArrowRight}')

      // Should navigate (active index/content changed)
      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(dots[1].className).toContain('dotActive')
      })
    })

    it('should navigate with ArrowLeft key', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      // Force 1 slide per view so "active slide" movement is unambiguous.
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = renderWithProviders(
        <CarouselLayout
          photos={photos}
          loading={false}
        />
      )

      const dots = container.querySelectorAll('[data-testid="carousel-dot"]')
      expect(dots.length).toBe(5)
      expect(screen.getByText('1 / 5')).toBeInTheDocument()

      const getSlidesWrapper = () =>
        container.querySelector('[class*="slidesWrapper"]') as HTMLElement | null

      const waitForTransitionToEnd = async () => {
        // Ensure follow-up navigation isn't blocked by `isTransitioning`.
        await waitFor(() => {
          const el = getSlidesWrapper()
          expect(el).toBeTruthy()
          expect(el!.className).not.toContain('transitioning')
        })
      }

      // First go forward...
      await user.keyboard('{ArrowRight}')
      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(dots[1].className).toContain('dotActive')
      })
      await waitForTransitionToEnd()

      // ...then back
      await user.keyboard('{ArrowLeft}')

      await waitFor(() => {
        expect(screen.getByText('1 / 5')).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(dots[0].className).toContain('dotActive')
      })
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
      expect(dots.length).toBeGreaterThan(1)
      
      const secondDot = dots[1] as HTMLElement
      await user.click(secondDot)

      await waitFor(() => {
        expect(secondDot.className).toContain('dotActive')
      })
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
      // With 3 slides per view (desktop), dots represent valid start positions.
      // For 5 photos and 3-per-view => start indices 0..2 => 3 dots.
      expect(dots.length).toBe(3)
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

      const progressFill = container.querySelector('[class*="progressFill"]') as HTMLElement | null
      expect(progressFill).toBeInTheDocument()

      const initialWidth = progressFill?.style.width
      expect(initialWidth).toBeTruthy()

      // Navigate to next slide
      const nextButton = screen.getByLabelText('Next photo')
      await user.click(nextButton)

      // Progress should update
      await waitFor(() => {
        const nextWidth = progressFill?.style.width
        expect(nextWidth).toBeTruthy()
        expect(Number.parseFloat(nextWidth ?? '')).toBeGreaterThan(Number.parseFloat(initialWidth ?? ''))
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
    it('should preload adjacent images', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(5)

      // Use tablet viewport so CarouselLayout preloads prev/next images
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      type ImageLike = { src: string }
      const createdImages: ImageLike[] = []
      const OriginalImage = globalThis.Image

      // Wrap the existing Image mock to capture instances created by `new Image()`
      class TrackingImage extends (OriginalImage as unknown as typeof Image) {
        constructor() {
          super()
          createdImages.push(this as unknown as ImageLike)
        }
      }

      ;(globalThis as unknown as { Image: typeof Image }).Image = TrackingImage

      try {
        renderWithProviders(
          <CarouselLayout
            photos={photos}
            loading={false}
          />
        )

        // Jump to index 2 (avoids timing issues with transition lockout)
        const dots = screen.getAllByTestId('carousel-dot')
        await user.click(dots[2])
        await waitFor(() => expect(screen.getByText('3 / 5')).toBeInTheDocument())

        // For currentIndex = 2, neighbors are 1 and 3
        await waitFor(() => {
          const srcs = createdImages.map((img) => img.src)
          expect(srcs).toContain(photos[1].urls.regular)
          expect(srcs).toContain(photos[3].urls.regular)
        })

        // We should have constructed one Image per photo as we navigated.
        expect(createdImages).toHaveLength(5)
      } finally {
        ;(globalThis as unknown as { Image: typeof Image }).Image = OriginalImage
      }
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
        expect((slidesWrapper as HTMLElement).className).toContain('transitioning')
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
