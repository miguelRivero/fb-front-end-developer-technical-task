/**
 * Infrastructure Layer: Repository Factory
 * 
 * Creates and exports repository instances for dependency injection.
 * This follows the Dependency Inversion Principle by providing
 * concrete implementations of domain interfaces.
 */
import { UnsplashPhotoRepository } from './UnsplashPhotoRepository'
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository'

/**
 * Factory function to create photo repository instance
 * 
 * In a more complex app, this could use environment variables
 * or configuration to choose different implementations.
 */
export function createPhotoRepository(): PhotoRepository {
  return new UnsplashPhotoRepository()
}

/**
 * Default repository instance
 * Can be used directly or injected via props/context
 */
export const photoRepository = createPhotoRepository()
