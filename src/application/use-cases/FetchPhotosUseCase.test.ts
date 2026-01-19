import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FetchPhotosUseCase } from './FetchPhotosUseCase'
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'
import { PhotoRepositoryError } from '../../domain/repositories/PhotoRepository'
import { createMockPhotoArray } from '../../test/mocks'

describe('FetchPhotosUseCase', () => {
  let mockRepository: PhotoRepository
  let useCase: FetchPhotosUseCase

  beforeEach(() => {
    mockRepository = {
      searchPhotos: vi.fn(),
    }

    useCase = new FetchPhotosUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should call repository with correct parameters', async () => {
      const mockPhotos = createMockPhotoArray(3)
      vi.mocked(mockRepository.searchPhotos).mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      await useCase.execute({
        query: 'mountains',
        page: 1,
        perPage: 20,
      })

      expect(mockRepository.searchPhotos).toHaveBeenCalledWith({
        query: 'mountains',
        page: 1,
        perPage: 20,
      })
    })

    it('should return repository result', async () => {
      const mockPhotos = createMockPhotoArray(5)
      const expectedResult = {
        photos: mockPhotos,
        currentPage: 2,
        hasMore: false,
      }

      vi.mocked(mockRepository.searchPhotos).mockResolvedValue(expectedResult)

      const result = await useCase.execute({
        query: 'ocean',
        page: 2,
        perPage: 20,
      })

      expect(result).toEqual(expectedResult)
    })

    it('should handle repository errors', async () => {
      const error = new PhotoRepositoryError('Repository error', 'network')
      vi.mocked(mockRepository.searchPhotos).mockRejectedValue(error)

      await expect(
        useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBe(error)
      }
    })

    it('should maintain Clean Architecture boundaries', async () => {
      const mockPhotos = createMockPhotoArray(3)
      vi.mocked(mockRepository.searchPhotos).mockResolvedValue({
        photos: mockPhotos,
        currentPage: 1,
        hasMore: true,
      })

      const result = await useCase.execute({
        query: 'forest',
        page: 1,
        perPage: 20,
      })

      // Verify result uses domain entities (not infrastructure types)
      expect(result.photos[0]).toHaveProperty('id')
      expect(result.photos[0]).toHaveProperty('urls')
      expect(result.photos[0]).toHaveProperty('creator')
      expect(result.photos[0]).not.toHaveProperty('user') // Infrastructure property
    })

    it('should wrap unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error')
      vi.mocked(mockRepository.searchPhotos).mockRejectedValue(unexpectedError)

      await expect(
        useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(PhotoRepositoryError)
        if (error instanceof PhotoRepositoryError) {
          expect(error.type).toBe('unknown')
          expect(error.originalError).toBe(unexpectedError)
        }
      }
    })

    it('should re-throw PhotoRepositoryError as-is', async () => {
      const domainError = new PhotoRepositoryError('Domain error', 'api_error')
      vi.mocked(mockRepository.searchPhotos).mockRejectedValue(domainError)

      await expect(
        useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      ).rejects.toThrow(PhotoRepositoryError)

      try {
        await useCase.execute({
          query: 'test',
          page: 1,
          perPage: 20,
        })
      } catch (error) {
        expect(error).toBe(domainError)
      }
    })
  })
})
