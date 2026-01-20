/**
 * Integration tests for ListLayout component
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockIntersectionObserver,
  createMockMatchMedia,
  createMockPhotoArray,
} from '@/test/mocks'
import { screen, waitFor } from '@testing-library/react'

import { ListLayout } from './ListLayout'
import { UiError } from '@/presentation/errors/UiError'
import { renderWithProviders } from '@/test/utils'
import userEvent from '@testing-library/user-event'

describe('ListLayout Integration Tests', () => {
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

  describe('list item rendering', () => {
    it('should render list items with photos', () => {
      const photos = createMockPhotoArray(6)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <ListLayout photos={photos} onPhotoClick={onPhotoClick} loading={false} hasMore={false} />
      )

      // Check that all photos are rendered
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)
    })

    it('should render list items with correct structure', () => {
      const photos = createMockPhotoArray(3)

      renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={false} />)

      // Each photo should have an image
      photos.forEach((photo) => {
        const image = screen.getByAltText(photo.altDescription || `Photo by ${photo.creator.name}`)
        expect(image).toBeInTheDocument()
      })
    })
  })

  describe('thumbnail and metadata display', () => {
    it('should display photo thumbnails', () => {
      const photos = createMockPhotoArray(3)

      renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={false} />)

      // All photos should have thumbnails
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)
    })

    it('should display creator information', () => {
      const photos = createMockPhotoArray(3)

      renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={false} />)

      photos.forEach((photo) => {
        expect(screen.getByText(photo.creator.name)).toBeInTheDocument()
      })
    })

    it('should display photo description', () => {
      const photos = createMockPhotoArray(2)

      renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={false} />)

      photos.forEach((photo) => {
        if (photo.altDescription) {
          expect(screen.getByText(photo.altDescription)).toBeInTheDocument()
        }
      })
    })

    it('should display photo stats', () => {
      const photos = createMockPhotoArray(2)

      renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={false} />)

      photos.forEach((photo) => {
        // Stats should include likes count
        expect(screen.getByText(new RegExp(`\\b${photo.likes}\\b`))).toBeInTheDocument()
      })
    })
  })

  describe('initial loading state', () => {
    it('should display skeleton items during initial load', () => {
      renderWithProviders(<ListLayout photos={[]} loading={true} hasMore={false} />)

      // Should show skeleton items
      const skeletons = screen.getAllByTestId('photo-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show photos during initial loading', () => {
      const photos = createMockPhotoArray(3)

      renderWithProviders(<ListLayout photos={photos} loading={true} hasMore={false} />)

      // Photos should not be visible during loading
      const images = screen.queryAllByRole('img')
      expect(images.length).toBe(0)
    })
  })

  describe('loading more state', () => {
    it('should display loading more skeleton when loadingMore is true', () => {
      const photos = createMockPhotoArray(6)

      renderWithProviders(
        <ListLayout photos={photos} loading={false} loadingMore={true} hasMore={true} />
      )

      // Should show both photos and loading skeletons
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)

      // Should have loading more skeletons
      expect(screen.getByTestId('loading-more')).toBeInTheDocument()
    })

    it('should not show loading more when loadingMore is false', () => {
      const photos = createMockPhotoArray(6)

      renderWithProviders(
        <ListLayout photos={photos} loading={false} loadingMore={false} hasMore={true} />
      )

      // Only count the photo images (CreatorInfo also renders an avatar <img>)
      const photoImages = screen.getAllByAltText(/Photo \d+/)
      expect(photoImages).toHaveLength(photos.length)

      // Verify loading-more is not present
      expect(screen.queryByTestId('loading-more')).not.toBeInTheDocument()
    })
  })

  describe('empty/error states', () => {
    it('should display empty state when no photos', () => {
      renderWithProviders(<ListLayout photos={[]} loading={false} hasMore={false} />)

      expect(screen.getByText('No photos to display')).toBeInTheDocument()
    })

    it('should display error message when error is provided', () => {
      const error = new UiError('Failed to fetch photos', 'network')

      renderWithProviders(<ListLayout photos={[]} loading={false} error={error} hasMore={false} />)

      expect(screen.getByText(/error: failed to fetch photos/i)).toBeInTheDocument()
    })

    it('should not display photos when error exists', () => {
      const photos = createMockPhotoArray(3)
      const error = new UiError('Network error', 'network')

      renderWithProviders(<ListLayout photos={photos} loading={false} error={error} hasMore={false} />)

      // Should show error, not photos
      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      const images = screen.queryAllByRole('img')
      expect(images.length).toBe(0)
    })
  })

  describe('photo click handling', () => {
    it('should call onPhotoClick when list item is clicked', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <ListLayout photos={photos} onPhotoClick={onPhotoClick} loading={false} hasMore={false} />
      )

      const firstPhoto = photos[0]
      const listItem = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)

      await user.click(listItem)

      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })

    it('should handle keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <ListLayout photos={photos} onPhotoClick={onPhotoClick} loading={false} hasMore={false} />
      )

      const firstPhoto = photos[0]
      const listItem = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)

      listItem.focus()
      await user.keyboard('{Enter}')

      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })

    it('should handle keyboard navigation (Space key)', async () => {
      const user = userEvent.setup()
      const photos = createMockPhotoArray(3)
      const onPhotoClick = vi.fn()

      renderWithProviders(
        <ListLayout photos={photos} onPhotoClick={onPhotoClick} loading={false} hasMore={false} />
      )

      const firstPhoto = photos[0]
      const listItem = screen.getByLabelText(`View photo by ${firstPhoto.creator.name}`)

      listItem.focus()
      await user.keyboard(' ')

      expect(onPhotoClick).toHaveBeenCalledTimes(1)
      expect(onPhotoClick).toHaveBeenCalledWith(firstPhoto)
    })
  })

  describe('infinite scroll', () => {
    it('should render sentinel element when hasMore is true', () => {
      const photos = createMockPhotoArray(6)
      const loadMore = vi.fn()

      renderWithProviders(<ListLayout photos={photos} loading={false} loadMore={loadMore} hasMore={true} />)

      const sentinel = document.querySelector('[data-testid="infinite-scroll-sentinel"]')
      expect(sentinel).toBeInTheDocument()
    })

    it('should trigger loadMore when sentinel enters viewport', async () => {
      const photos = createMockPhotoArray(6)
      const loadMore = vi.fn()

      const { container } = renderWithProviders(
        <ListLayout
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
      expect(sentinel).not.toBeNull()
      mockIntersectionObserver.triggerIntersection(sentinel!, true)

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should handle vertical scrolling behavior', () => {
      const photos = createMockPhotoArray(20)

      const { container } = renderWithProviders(<ListLayout photos={photos} loading={false} hasMore={true} />)

      // List should be rendered
      const list = container.querySelector('[class*="list"]')
      expect(list).toBeInTheDocument()

      // Should have all photos
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(photos.length)
    })
  })
})

