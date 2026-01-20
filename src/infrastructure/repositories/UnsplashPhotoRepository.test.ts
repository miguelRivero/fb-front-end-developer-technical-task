import type { UnsplashPhoto, UnsplashResponse } from '../../types/unsplash'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HttpClient } from '../http/createUnsplashHttpClient'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import { UnsplashPhotoRepository } from './UnsplashPhotoRepository'
import { createUnsplashHttpClient } from '../http/createUnsplashHttpClient'

// Mock UnsplashApiAdapter (keep repository tests focused on orchestration + error mapping).
vi.mock('../adapters/UnsplashApiAdapter', async () => {
  const actual = await vi.importActual('../adapters/UnsplashApiAdapter')
  return {
    ...actual,
    UnsplashApiAdapter: {
      toDomainPhotos: vi.fn((photos: UnsplashPhoto[]) => {
        return photos.map((photo) => ({
          id: photo.id,
          urls: photo.urls,
          altDescription: photo.alt_description,
          creator: {
            name: photo.user.name,
            username: photo.user.username,
            profileImageUrl: photo.user.profile_image.small,
          },
          dimensions: {
            width: photo.width,
            height: photo.height,
          },
          likes: photo.likes,
          views: photo.views,
          createdAt: photo.created_at,
        }))
      }),
    },
  }
})

function makePhoto(id: string): UnsplashPhoto {
  return {
    id,
    urls: {
      raw: 'https://example.com/raw',
      full: 'https://example.com/full',
      regular: 'https://example.com/regular',
      small: 'https://example.com/small',
      thumb: 'https://example.com/thumb',
    },
    alt_description: `Photo ${id}`,
    user: {
      name: 'Test User',
      username: 'testuser',
      profile_image: {
        small: 'https://example.com/profile.jpg',
      },
    },
    width: 4000,
    height: 3000,
    likes: 100,
    views: 2500,
    created_at: '2024-01-15T10:30:00Z',
  }
}

describe('UnsplashPhotoRepository', () => {
  let repository: UnsplashPhotoRepository
  let mockHttpClient: HttpClient
  let getMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    getMock = vi.fn()
    mockHttpClient = { get: getMock }
    repository = new UnsplashPhotoRepository(mockHttpClient)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchPhotos with query', () => {
    it('should call correct API endpoint and params', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      getMock.mockResolvedValue(mockResponse)

      await repository.searchPhotos({
        query: 'mountains',
        page: 1,
        perPage: 20,
      })

      expect(getMock).toHaveBeenCalledWith(
        '/search/photos',
        expect.objectContaining({
          params: {
            query: 'mountains',
            page: 1,
            per_page: 20,
          },
        })
      )
    })

    it('should pass AbortSignal when provided', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      getMock.mockResolvedValue(mockResponse)
      const controller = new AbortController()

      await repository.searchPhotos({
        query: 'ocean',
        page: 2,
        perPage: 15,
        signal: controller.signal,
      })

      expect(getMock).toHaveBeenCalledWith(
        '/search/photos',
        expect.objectContaining({
          signal: controller.signal,
        })
      )
    })

    it('should convert Unsplash photos to domain entities', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = [makePhoto('photo-1')]

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 1,
        total_pages: 1,
      }

      getMock.mockResolvedValue(mockResponse)

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.photos).toHaveLength(1)
      expect(result.photos[0].id).toBe('photo-1')
    })

    it('should calculate hasMore using total_pages', async () => {
      // Even if the current page returns fewer than perPage items, total_pages is authoritative.
      const mockResponse: UnsplashResponse = {
        results: [makePhoto('p1')],
        total: 100,
        total_pages: 5,
      }

      getMock.mockResolvedValue(mockResponse)

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(true)
    })

    it('should return PhotoSearchResult with correct structure', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      getMock.mockResolvedValue(mockResponse)

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result).toHaveProperty('photos')
      expect(result).toHaveProperty('currentPage')
      expect(result).toHaveProperty('hasMore')
      expect(result.currentPage).toBe(1)
      expect(result.hasMore).toBe(false)
    })
  })

  describe('searchPhotos without query (curated photos)', () => {
    it('should call correct endpoint and params', async () => {
      const mockPhotos: UnsplashPhoto[] = []
      getMock.mockResolvedValue(mockPhotos)

      await repository.searchPhotos({
        query: '',
        page: 1,
        perPage: 20,
      })

      expect(getMock).toHaveBeenCalledWith(
        '/photos',
        expect.objectContaining({
          params: {
            page: 1,
            per_page: 20,
          },
        })
      )
    })

    it('should set hasMore based on page size for curated photos', async () => {
      getMock.mockResolvedValue([makePhoto('p1')])

      const result = await repository.searchPhotos({
        query: '',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors (no response)', async () => {
      const networkError = {
        isAxiosError: true,
        response: undefined,
        message: 'Network Error',
      }

      getMock.mockRejectedValue(networkError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'network' })
    })

    it('should handle rate limit errors (403 + message)', async () => {
      const rateLimitError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {
            errors: ['Rate limit exceeded'],
          },
        },
        message: 'Rate limit exceeded',
      }

      getMock.mockRejectedValue(rateLimitError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'rate_limit' })
    })

    it('should handle rate limit errors (429)', async () => {
      const rateLimitError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {
            errors: ['Rate limit exceeded'],
          },
        },
        message: 'Too Many Requests',
      }

      getMock.mockRejectedValue(rateLimitError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'rate_limit' })
    })

    it('should handle invalid API key (401)', async () => {
      const authError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            errors: ['Invalid API key'],
          },
        },
        message: 'Unauthorized',
      }

      getMock.mockRejectedValue(authError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'api_error' })
    })

    it('should map timeouts to network errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: undefined,
        message: 'timeout of 10000ms exceeded',
      }

      getMock.mockRejectedValue(timeoutError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'network' })
    })

    it('should preserve originalError on PhotoRepositoryError', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
        message: 'Request failed',
      }

      getMock.mockRejectedValue(apiError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.originalError).toBeDefined()
        }
      }
    })

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error')
      getMock.mockRejectedValue(unknownError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'unknown' })
    })

    it('should fail with api_error when access key is missing (via default http client)', async () => {
      // Use the real http client wrapper but with a missing key override. It should throw before axios is used.
      const client = createUnsplashHttpClient({ accessKey: '' })
      const repo = new UnsplashPhotoRepository(client)

      await expect(
        repo.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toMatchObject({ name: 'PhotoRepositoryError', type: 'api_error' })
    })
  })
})
