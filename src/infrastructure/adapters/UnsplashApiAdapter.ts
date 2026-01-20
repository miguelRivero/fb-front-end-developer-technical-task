import type { Photo } from '@/domain/entities/Photo'
import type { UnsplashPhoto } from '@/types/unsplash'

/**
 * Infrastructure Adapter: UnsplashApiAdapter
 * 
 * Adapts Unsplash API responses to domain entities.
 * This adapter belongs to the infrastructure layer and handles
 * the translation between external API format and domain model.
 * 
 * Clean Architecture: This adapter ensures the domain layer remains
 * independent of external API structures. It converts infrastructure
 * types (UnsplashPhoto) to domain entities (Photo).
 * 
 * Responsibilities:
 * - Map Unsplash API response format to domain Photo entity
 * - Handle field name transformations (snake_case to camelCase)
 * - Extract and structure nested data (creator, dimensions, URLs)
 * - Maintain type safety during transformation
 */
export class UnsplashApiAdapter {
  /**
   * Maps a single Unsplash API photo response to a domain Photo entity.
   * 
   * Transforms the infrastructure representation (UnsplashPhoto) into
   * the domain representation (Photo), handling field mappings and
   * data structure transformations.
   * 
   * @param unsplashPhoto - Unsplash API photo response object
   * @returns Domain Photo entity
   * 
   * @example
   * ```ts
   * const domainPhoto = UnsplashApiAdapter.toDomainPhoto(unsplashApiResponse)
   * ```
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
      views: unsplashPhoto.views,
      createdAt: unsplashPhoto.created_at,
    }
  }

  /**
   * Maps an array of Unsplash API photo responses to domain Photo entities.
   * 
   * Efficiently transforms multiple infrastructure photos to domain entities
   * using the toDomainPhoto method.
   * 
   * @param unsplashPhotos - Array of Unsplash API photo response objects
   * @returns Array of domain Photo entities
   * 
   * @example
   * ```ts
   * const domainPhotos = UnsplashApiAdapter.toDomainPhotos(unsplashApiResults)
   * ```
   */
  static toDomainPhotos(unsplashPhotos: UnsplashPhoto[]): Photo[] {
    return unsplashPhotos.map(this.toDomainPhoto)
  }
}
