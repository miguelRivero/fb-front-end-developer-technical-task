/**
 * Domain Layer: Domain Exports
 * 
 * Central export point for domain entities, value objects, and interfaces.
 * This maintains clean boundaries and makes domain concepts easily accessible.
 */
export type { Photo, PhotoSearchParams, PhotoSearchResult } from './entities/Photo'
export type { Layout, LayoutMetadata } from './entities/Layout'
export { LAYOUTS } from './entities/Layout'
export type { PhotoRepository } from './repositories/PhotoRepository'
export { PhotoRepositoryError } from './repositories/PhotoRepository'
