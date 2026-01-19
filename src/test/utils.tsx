/**
 * Test Utilities
 * 
 * Reusable test utilities and helpers for testing React components and hooks.
 * These utilities follow Clean Architecture principles by using domain entities.
 */

import {
  render,
  renderHook,
  waitFor,
  type RenderOptions,
  type RenderHookOptions,
} from '@testing-library/react'
import { type ReactElement } from 'react'
import { PhotoProvider } from '../presentation/context/PhotoContext'
import { LayoutProvider } from '../presentation/context/LayoutContext'
import {
  PhotoUseCasesProvider,
  type FetchPhotosUseCaseLike,
} from '../presentation/context/PhotoUseCasesContext'
import type { Photo } from '../domain/entities/Photo'
import { createMockPhoto, createMockPhotoArray } from './mocks'

const testFetchPhotosUseCase: FetchPhotosUseCaseLike = {
  execute: async () => ({
    photos: [],
    currentPage: 1,
    hasMore: false,
  }),
}

/**
 * Options for renderWithProviders
 */
interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial photos for PhotoProvider */
  initialPhotos?: Photo[]
  /** Initial loading state */
  initialLoading?: boolean
  /** Initial layout */
  initialLayout?: 'grid' | 'carousel' | 'list' | 'cards'
}

/**
 * Custom render function that wraps components with all necessary providers
 * 
 * @param ui - The component to render
 * @param options - Render options including provider-specific options
 * @returns Render result with all providers applied
 * 
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />)
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  // Extract renderOptions, ignoring provider-specific options for now
  // Note: We can't easily override initial state in PhotoProvider
  // This is a limitation, but in real tests we'd mock the context or use actual state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { initialPhotos, initialLoading, initialLayout, ...renderOptions } = options
  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <PhotoUseCasesProvider fetchPhotosUseCase={testFetchPhotosUseCase}>
        <PhotoProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </PhotoProvider>
      </PhotoUseCasesProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

/**
 * Render hook with providers
 * 
 * @param hook - The hook to test
 * @param options - Render options
 * @returns Render result with hook result
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> & RenderWithProvidersOptions
) {
  // Extract renderOptions, ignoring provider-specific options for now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { initialPhotos, initialLoading, initialLayout, ...renderOptions } = options || {}

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PhotoUseCasesProvider fetchPhotosUseCase={testFetchPhotosUseCase}>
        <PhotoProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </PhotoProvider>
      </PhotoUseCasesProvider>
    )
  }

  return renderHook(hook, { wrapper, ...renderOptions })
}

/**
 * Waits for an image to load in tests
 * 
 * @param imageElement - The image element to wait for
 * @param timeout - Maximum time to wait (default: 1000ms)
 * 
 * @example
 * ```tsx
 * const image = screen.getByRole('img')
 * await waitForImageLoad(image)
 * ```
 */
export async function waitForImageLoad(
  imageElement: HTMLImageElement,
  timeout: number = 1000
): Promise<void> {
  if (imageElement.complete) {
    return
  }

  await waitFor(
    () => {
      expect(imageElement.complete).toBe(true)
    },
    { timeout }
  )
}

/**
 * Helper to create mock Photo domain entity
 * Re-exported from mocks for convenience
 */
export { createMockPhoto, createMockPhotoArray }
