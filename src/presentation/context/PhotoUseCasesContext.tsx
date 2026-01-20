import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { FetchPhotosUseCase } from '@/application/use-cases/FetchPhotosUseCase'
import type { PhotoRepository } from '@/domain/repositories/PhotoRepository'
import type { PhotoSearchParams, PhotoSearchResult } from '@/domain/entities/Photo'

/**
 * Application-facing interface consumed by the presentation layer.
 * Using an interface here makes testing easier and avoids coupling
 * to a concrete use case class in consumer code.
 */
export interface FetchPhotosUseCaseLike {
  execute(params: PhotoSearchParams): Promise<PhotoSearchResult>
}

interface PhotoUseCasesContextValue {
  fetchPhotosUseCase: FetchPhotosUseCaseLike
}

const PhotoUseCasesContext = createContext<PhotoUseCasesContextValue | undefined>(
  undefined
)

/**
 * Composition provider for photo use cases.
 *
 * In production, pass a `photoRepository` (domain interface) and the provider
 * will create the use case instance. In tests, you can pass a stubbed
 * `fetchPhotosUseCase` to avoid pulling in infrastructure.
 */
export function PhotoUseCasesProvider({
  children,
  photoRepository,
  fetchPhotosUseCase,
}: {
  children: ReactNode
  photoRepository?: PhotoRepository
  fetchPhotosUseCase?: FetchPhotosUseCaseLike
}) {
  const resolvedFetchPhotosUseCase = useMemo(() => {
    if (fetchPhotosUseCase) {
      return fetchPhotosUseCase
    }
    if (!photoRepository) {
      return null
    }
    return new FetchPhotosUseCase(photoRepository)
  }, [fetchPhotosUseCase, photoRepository])

  if (!resolvedFetchPhotosUseCase) {
    throw new Error(
      'PhotoUseCasesProvider requires either `photoRepository` or `fetchPhotosUseCase`'
    )
  }

  return (
    <PhotoUseCasesContext.Provider
      value={{ fetchPhotosUseCase: resolvedFetchPhotosUseCase }}
    >
      {children}
    </PhotoUseCasesContext.Provider>
  )
}

// This file intentionally exports a hook alongside a provider, which is a common
// pattern for context modules. Fast Refresh still works correctly for the provider.
// eslint-disable-next-line react-refresh/only-export-components
export function usePhotoUseCases() {
  const context = useContext(PhotoUseCasesContext)
  if (!context) {
    throw new Error(
      'usePhotoUseCases must be used within a PhotoUseCasesProvider'
    )
  }
  return context
}

