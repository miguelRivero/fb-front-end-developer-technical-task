import type { UnsplashPhoto, UnsplashResponse } from '../../types/unsplash'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import { UnsplashPhotoRepository } from './UnsplashPhotoRepository'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock UnsplashApiAdapter
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
          createdAt: photo.created_at,
        }))
      }),
    },
  }
})

describe('UnsplashPhotoRepository', () => {
  let repository: UnsplashPhotoRepository
  let mockAxiosClient: {
    get: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock axios client
    mockAxiosClient = {
      get: vi.fn(),
    }

    // Mock axios.create to return our mock client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAxios.create.mockReturnValue(mockAxiosClient as any)

    repository = new UnsplashPhotoRepository()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchPhotos with query', () => {
    it('should call correct API endpoint', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      await repository.searchPhotos({
        query: 'mountains',
        page: 1,
        perPage: 20,
      })

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/search/photos', {
        params: {
          query: 'mountains',
          page: 1,
          per_page: 20,
        },
      })
    })

    it('should pass correct parameters', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      await repository.searchPhotos({
        query: 'ocean',
        page: 2,
        perPage: 15,
      })

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/search/photos',
        expect.objectContaining({
          params: {
            query: 'ocean',
            page: 2,
            per_page: 15,
          },
        })
      )
    })

    it('should convert Unsplash photos to domain entities', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = [
        {
          id: 'photo-1',
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: 'Test photo',
          user: {
            name: 'John Doe',
            username: 'johndoe',
            profile_image: {
              small: 'https://example.com/profile.jpg',
            },
          },
          width: 4000,
          height: 3000,
          likes: 100,
          created_at: '2024-01-15T10:30:00Z',
        },
      ]

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 1,
        total_pages: 1,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.photos).toHaveLength(1)
      expect(result.photos[0].id).toBe('photo-1')
      expect(result.photos[0].altDescription).toBe('Test photo')
    })

    it('should return PhotoSearchResult with correct structure', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result).toHaveProperty('photos')
      expect(result).toHaveProperty('currentPage')
      expect(result).toHaveProperty('hasMore')
      expect(result.currentPage).toBe(1)
    })

    it('should calculate hasMore correctly for full page', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `photo-${i}`,
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: `Photo ${i}`,
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
          created_at: '2024-01-15T10:30:00Z',
        })
      )

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 100,
        total_pages: 5,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(true)
    })

    it('should calculate hasMore correctly for partial page', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `photo-${i}`,
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: `Photo ${i}`,
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
          created_at: '2024-01-15T10:30:00Z',
        })
      )

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 10,
        total_pages: 1,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(false)
    })

    it('should calculate hasMore correctly for empty result', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(false)
    })
  })

  describe('searchPhotos without query (curated photos)', () => {
    it('should call correct endpoint', async () => {
      const mockPhotos: UnsplashPhoto[] = []

      mockAxiosClient.get.mockResolvedValue({ data: mockPhotos })

      await repository.searchPhotos({
        query: '',
        page: 1,
        perPage: 20,
      })

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/photos', {
        params: {
          page: 1,
          per_page: 20,
        },
      })
    })

    it('should handle response correctly', async () => {
      const mockPhotos: UnsplashPhoto[] = [
        {
          id: 'photo-1',
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: 'Test photo',
          user: {
            name: 'John Doe',
            username: 'johndoe',
            profile_image: {
              small: 'https://example.com/profile.jpg',
            },
          },
          width: 4000,
          height: 3000,
          likes: 100,
          created_at: '2024-01-15T10:30:00Z',
        },
      ]

      mockAxiosClient.get.mockResolvedValue({ data: mockPhotos })

      const result = await repository.searchPhotos({
        query: '',
        page: 1,
        perPage: 20,
      })

      expect(result.photos).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors (no response)', async () => {
      const networkError = {
        isAxiosError: true,
        response: undefined,
        message: 'Network Error',
      }

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)
      mockAxiosClient.get.mockRejectedValue(networkError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('network')
        }
      }
    })

    it('should handle rate limit errors (403)', async () => {
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

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)
      mockAxiosClient.get.mockRejectedValue(rateLimitError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('rate_limit')
        }
      }
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

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)
      mockAxiosClient.get.mockRejectedValue(authError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('api_error')
        }
      }
    })

    it('should handle other API errors', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            errors: ['Internal server error'],
          },
        },
        message: 'Request failed',
      }

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)
      mockAxiosClient.get.mockRejectedValue(apiError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('api_error')
        }
      }
    })

    it('should convert to PhotoRepositoryError', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
        message: 'Unknown error',
      }

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)
      mockAxiosClient.get.mockRejectedValue(error)

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

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false)
      mockAxiosClient.get.mockRejectedValue(unknownError)

      await expect(
        repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await repository.searchPhotos({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('unknown')
        }
      }
    })
  })

  describe('hasMore Edge Cases', () => {
    it('should handle empty array result', async () => {
      const mockResponse: UnsplashResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(false)
      expect(result.photos).toHaveLength(0)
    })

    it('should handle partial page result', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = Array.from(
        { length: 15 },
        (_, i) => ({
          id: `photo-${i}`,
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: `Photo ${i}`,
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
          created_at: '2024-01-15T10:30:00Z',
        })
      )

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 15,
        total_pages: 1,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(false)
    })

    it('should handle full page result', async () => {
      const mockUnsplashPhotos: UnsplashPhoto[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `photo-${i}`,
          urls: {
            raw: 'https://example.com/raw',
            full: 'https://example.com/full',
            regular: 'https://example.com/regular',
            small: 'https://example.com/small',
            thumb: 'https://example.com/thumb',
          },
          alt_description: `Photo ${i}`,
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
          created_at: '2024-01-15T10:30:00Z',
        })
      )

      const mockResponse: UnsplashResponse = {
        results: mockUnsplashPhotos,
        total: 100,
        total_pages: 5,
      }

      mockAxiosClient.get.mockResolvedValue({ data: mockResponse })

      const result = await repository.searchPhotos({
        query: 'test',
        page: 1,
        perPage: 20,
      })

      expect(result.hasMore).toBe(true)
    })
  })
})
