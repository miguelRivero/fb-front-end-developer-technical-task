import { describe, expect, it } from 'vitest'

import { UnsplashApiAdapter } from './UnsplashApiAdapter'
import { mockUnsplashPhotoResponse } from '../../test/mocks'

describe('UnsplashApiAdapter', () => {
  it('should map Unsplash photo response to domain Photo entity', () => {
    const result = UnsplashApiAdapter.toDomainPhoto(mockUnsplashPhotoResponse)

    expect(result).toEqual({
      id: mockUnsplashPhotoResponse.id,
      urls: {
        raw: mockUnsplashPhotoResponse.urls.raw,
        full: mockUnsplashPhotoResponse.urls.full,
        regular: mockUnsplashPhotoResponse.urls.regular,
        small: mockUnsplashPhotoResponse.urls.small,
        thumb: mockUnsplashPhotoResponse.urls.thumb,
      },
      altDescription: mockUnsplashPhotoResponse.alt_description,
      creator: {
        name: mockUnsplashPhotoResponse.user.name,
        username: mockUnsplashPhotoResponse.user.username,
        profileImageUrl: mockUnsplashPhotoResponse.user.profile_image.small,
      },
      dimensions: {
        width: mockUnsplashPhotoResponse.width,
        height: mockUnsplashPhotoResponse.height,
      },
      likes: mockUnsplashPhotoResponse.likes,
      createdAt: mockUnsplashPhotoResponse.created_at,
    })
  })

  it('should handle null alt_description gracefully', () => {
    const result = UnsplashApiAdapter.toDomainPhoto({
      ...mockUnsplashPhotoResponse,
      alt_description: null,
    })

    expect(result.altDescription).toBeNull()
  })

  it('should map arrays via toDomainPhotos', () => {
    const result = UnsplashApiAdapter.toDomainPhotos([
      mockUnsplashPhotoResponse,
      { ...mockUnsplashPhotoResponse, id: 'another-id' },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(mockUnsplashPhotoResponse.id)
    expect(result[1].id).toBe('another-id')
  })
})

