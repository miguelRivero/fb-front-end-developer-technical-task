import type { UnsplashPhoto, FetchPhotosError } from '../../types/unsplash'
import type { Photo } from '../../domain/entities/Photo'

/**
 * Infrastructure Adapter: UnsplashApiAdapter
 * 
 * Adapts Unsplash API responses to domain entities.
 * This adapter belongs to the infrastructure layer and handles
 * the translation between external API format and domain model.
 */
export class UnsplashApiAdapter {
  /**
   * Maps Unsplash API photo to domain Photo entity
   */
  static toDomainPhoto(unsplashPhoto: UnsplashPhoto): Photo {
    return {
      id: unsplashPhoto.id,
      urls: {
        raw: unsplashPhoto.urls.raw,
        full: unsplashPhoto.urls.full,
        regular: unsplashPhoto.urls.regular,
        small: unsplashPhoto.urls.small,
        thumb: unsplashPhoto.urls.thumb,
      },
      altDescription: unsplashPhoto.alt_description,
      creator: {
        name: unsplashPhoto.user.name,
        username: unsplashPhoto.user.username,
        profileImageUrl: unsplashPhoto.user.profile_image.small,
      },
      dimensions: {
        width: unsplashPhoto.width,
        height: unsplashPhoto.height,
      },
      likes: unsplashPhoto.likes,
      createdAt: unsplashPhoto.created_at,
    }
  }

  /**
   * Maps array of Unsplash photos to domain Photo entities
   */
  static toDomainPhotos(unsplashPhotos: UnsplashPhoto[]): Photo[] {
    return unsplashPhotos.map(this.toDomainPhoto)
  }

  /**
   * Converts FetchPhotosError to PhotoRepositoryError
   */
  static toRepositoryError(error: FetchPhotosError): Error {
    return new Error(`${error.type}: ${error.message}`)
  }
}
