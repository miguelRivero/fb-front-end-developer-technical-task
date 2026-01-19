/**
 * Integration tests for CardsLayout component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardsLayout } from './CardsLayout'
import { renderWithProviders } from '../../test/utils'
import { createMockPhotoArray, createMockIntersectionObserver, createMockMatchMedia } from '../../test/mocks'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import { formatPhotoDate } from '../../utils/dateUtils'

describe('CardsLayout Integration Tests', () => {
  let mockIntersectionObserver: ReturnType<typeof createMockIntersectionObserver>

  beforeEach(() => {
    vi.clearAllMocks()
    mockIntersectionObserver = createMockIntersectionObserver()
    
    // Mock matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMockMatchMedia(true),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockIntersectionObserver.clearObservers()
  })

  describe('card rendering with photos', () => {
    it('should render cards with photos', () => {
      const photos = createMockPhotoArray(6)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <CardsLayout
          photos={photos}
          onPhotoClick={onPhotoClick}
          loading={false}
          hasMore={false}
        />
      )

      // Check that all photos are rendered
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)
    })

    it('should render card items with correct structure', () => {
      const photos = createMockPhotoArray(3)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      // Each photo should have an image
      photos.forEach((photo) => {
        const image = screen.getByAltText(
          photo.altDescription || `Photo by ${photo.creator.name}`
        )
        expect(image).toBeInTheDocument()
      })
    })
  })

  describe('metadata display', () => {
    it('should display creator information', () => {
      const photos = createMockPhotoArray(3)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      photos.forEach((photo) => {
        expect(screen.getByText(photo.creator.name)).toBeInTheDocument()
      })
    })

    it('should display photo dimensions', () => {
      const photos = createMockPhotoArray(2)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      photos.forEach((photo) => {
        const dimensionsText = `${photo.dimensions.width} × ${photo.dimensions.height}`
        expect(screen.getByText(dimensionsText)).toBeInTheDocument()
      })
    })

    it('should display formatted creation date', () => {
      const photos = createMockPhotoArray(2)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      photos.forEach((photo) => {
        expect(screen.getByText(formatPhotoDate(photo.createdAt))).toBeInTheDocument()
      })
    })

    it('should display photo stats (likes)', () => {
      const photos = createMockPhotoArray(2)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      photos.forEach((photo) => {
        // Stats should include likes count
        expect(screen.getByText(new RegExp(`\\b${photo.likes}\\b`))).toBeInTheDocument()
      })
    })
  })

  describe('initial loading state', () => {
    it('should display skeleton cards during initial load', () => {
      renderWithProviders(
        <CardsLayout
          photos={[]}
          loading={true}
          hasMore={false}
        />
      )

      // Should show skeleton cards
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show photos during initial loading', () => {
      const photos = createMockPhotoArray(3)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={true}
          hasMore={false}
        />
      )

      // Photos should not be visible during loading
      const images = screen.queryAllByRole('img')
      expect(images.length).toBe(0)
    })
  })

  describe('loading more state', () => {
    it('should display loading more skeleton when loadingMore is true', () => {
      const photos = createMockPhotoArray(6)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          loadingMore={true}
          hasMore={true}
        />
      )

      // Should show both photos and loading skeletons
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)
      
      // Should have loading more skeletons
      const loadingMoreSkeletons = document.querySelectorAll('[class*="loadingMore"]')
      expect(loadingMoreSkeletons.length).toBeGreaterThan(0)
    })

    it('should not show loading more when loadingMore is false', () => {
      const photos = createMockPhotoArray(6)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          loadingMore={false}
          hasMore={true}
        />
      )

      // Only count the photo images (CreatorInfo also renders an avatar <img>)
      const photoImages = screen.getAllByAltText(/Photo \d+/)
      expect(photoImages).toHaveLength(photos.length)
    })
  })

  describe('empty/error states', () => {
    it('should display empty state when no photos', () => {
      renderWithProviders(
        <CardsLayout
          photos={[]}
          loading={false}
          hasMore={false}
        />
      )

      expect(screen.getByText('No photos to display')).toBeInTheDocument()
    })

    it('should display error message when error is provided', () => {
      const error = new PhotoRepositoryError('Failed to fetch photos', 'network')
      
      renderWithProviders(
        <CardsLayout
          photos={[]}
          loading={false}
          error={error}
          hasMore={false}
        />
      )

      expect(screen.getByText(/error: failed to fetch photos/i)).toBeInTheDocument()
    })

    it('should not display photos when error exists', () => {
      const photos = createMockPhotoArray(3)
      const error = new PhotoRepositoryError('Network error', 'network')
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          error={error}
          hasMore={false}
        />
      )

      // Should show error, not photos
      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      const images = screen.queryAllByRole('img')
      expect(images.length).toBe(0)
    })
  })

  describe('photo click handling', () => {
    it('should call onPhotoClick when card is clicked', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <CardsLayout
          photos={photos}
          onPhotoClick={onPhotoClick}
          loading={false}
          hasMore={false}
        />
      )

      const firstPhoto = photos[0]
      const cardElement = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)
      
      await user.click(cardElement)
      
      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })

    it('should handle keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <CardsLayout
          photos={photos}
          onPhotoClick={onPhotoClick}
          loading={false}
          hasMore={false}
        />
      )

      const firstPhoto = photos[0]
      const cardElement = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)
      
      cardElement.focus()
      await user.keyboard('{Enter}')
      
      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })

    it('should handle keyboard navigation (Space key)', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <CardsLayout
          photos={photos}
          onPhotoClick={onPhotoClick}
          loading={false}
          hasMore={false}
        />
      )

      const firstPhoto = photos[0]
      const cardElement = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)
      
      cardElement.focus()
      await user.keyboard(' ')
      
      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })
  })

  describe('infinite scroll', () => {
    it('should render sentinel element when hasMore is true', () => {
      const photos = createMockPhotoArray(6)
      const loadMore = vi.fn()

      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          loadMore={loadMore}
          hasMore={true}
        />
      )

      const sentinel = document.querySelector('[data-testid="infinite-scroll-sentinel"]')
      expect(sentinel).toBeInTheDocument()
    })

    it('should trigger loadMore when sentinel enters viewport', async () => {
      const photos = createMockPhotoArray(6)
      const loadMore = vi.fn()

      const { container } = renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          loadingMore={false}
          loadMore={loadMore}
          hasMore={true}
        />
      )

      const sentinel = container.querySelector('[data-testid="infinite-scroll-sentinel"]')
      expect(sentinel).toBeInTheDocument()

      // Trigger intersection
      if (sentinel) {
        mockIntersectionObserver.triggerIntersection(sentinel, true)
      }

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should continue loading cards correctly', async () => {
      const initialPhotos = createMockPhotoArray(6)
      const loadMore = vi.fn()

      const { rerender } = renderWithProviders(
        <CardsLayout
          photos={initialPhotos}
          loading={false}
          loadingMore={false}
          loadMore={loadMore}
          hasMore={true}
        />
      )

      // Simulate loading more photos
      const morePhotos = createMockPhotoArray(6)
      rerender(
        <CardsLayout
          photos={[...initialPhotos, ...morePhotos]}
          loading={false}
          loadingMore={false}
          loadMore={loadMore}
          hasMore={true}
        />
      )

      // Should have all photos rendered
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(initialPhotos.length + morePhotos.length)
    })
  })

  describe('date formatting in cards', () => {
    it('should format dates correctly', () => {
      const photos = createMockPhotoArray(2)
      
      renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      photos.forEach((photo) => {
        expect(screen.getByText(formatPhotoDate(photo.createdAt))).toBeInTheDocument()
      })
    })
  })

  describe('responsive card grid', () => {
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const photos = createMockPhotoArray(6)
      
      const { container } = renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should adapt to tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const photos = createMockPhotoArray(6)
      
      const { container } = renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should adapt to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      const photos = createMockPhotoArray(6)
      
      const { container } = renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should handle window resize events', async () => {
      const photos = createMockPhotoArray(6)
      
      const { container } = renderWithProviders(
        <CardsLayout
          photos={photos}
          loading={false}
          hasMore={false}
        />
      )

      // Simulate resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      window.dispatchEvent(new Event('resize'))

      // Grid should still be rendered
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })
  })
})
