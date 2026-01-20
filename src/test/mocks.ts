/**
 * Test Mocks
 * 
 * Centralized mocks for testing. These mocks follow Clean Architecture
 * principles by using domain entities, not infrastructure types.
 */

import type { Photo } from '@/domain/entities/Photo'
import { vi } from 'vitest'

/**
 * Creates a mock Photo domain entity
 */
export function createMockPhoto(overrides?: Partial<Photo>): Photo {
  const id = overrides?.id ?? `photo-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id,
    urls: {
      raw: overrides?.urls?.raw ?? `https://images.unsplash.com/photo-${id}?raw`,
      full: overrides?.urls?.full ?? `https://images.unsplash.com/photo-${id}?full`,
      regular:
        overrides?.urls?.regular ?? `https://images.unsplash.com/photo-${id}?regular`,
      small:
        overrides?.urls?.small ?? `https://images.unsplash.com/photo-${id}?small`,
      thumb:
        overrides?.urls?.thumb ?? `https://images.unsplash.com/photo-${id}?thumb`,
    },
    // Preserve explicit null/empty values in overrides
    altDescription:
      overrides && Object.prototype.hasOwnProperty.call(overrides, 'altDescription')
        ? overrides.altDescription ?? null
        : 'A beautiful photo',
    creator: {
      name: overrides?.creator?.name ?? 'John Doe',
      username: overrides?.creator?.username ?? 'johndoe',
      profileImageUrl:
        overrides?.creator?.profileImageUrl ??
        'https://images.unsplash.com/profile-default.jpg',
    },
    dimensions: {
      width: overrides?.dimensions?.width ?? 4000,
      height: overrides?.dimensions?.height ?? 3000,
    },
    likes: overrides?.likes ?? 100,
    views: overrides?.views ?? 2500,
    createdAt: overrides?.createdAt ?? '2024-01-15T10:30:00Z',
  }
}

/**
 * Creates an array of mock Photo domain entities
 */
export function createMockPhotoArray(count: number): Photo[] {
  return Array.from({ length: count }, (_, index) =>
    createMockPhoto({
      id: `photo-${index}`,
      altDescription: `Photo ${index + 1}`,
      likes: (index + 1) * 10,
      creator: {
        name: `Creator ${index + 1}`,
        username: `creator${index + 1}`,
        profileImageUrl: 'https://images.unsplash.com/profile-default.jpg',
      },
      dimensions: {
        width: 4000 + index,
        height: 3000 + index,
      },
      createdAt: `2024-01-${String((index % 28) + 1).padStart(2, '0')}T10:30:00Z`,
    })
  )
}

/**
 * Mock Unsplash API response
 */
export const mockUnsplashPhotoResponse = {
  id: 'test-photo-id',
  urls: {
    raw: 'https://images.unsplash.com/photo-test?raw',
    full: 'https://images.unsplash.com/photo-test?full',
    regular: 'https://images.unsplash.com/photo-test?regular',
    small: 'https://images.unsplash.com/photo-test?small',
    thumb: 'https://images.unsplash.com/photo-test?thumb',
  },
  alt_description: 'A test photo',
  user: {
    name: 'Test User',
    username: 'testuser',
    profile_image: {
      small: 'https://images.unsplash.com/profile-test.jpg',
    },
  },
  width: 4000,
  height: 3000,
  likes: 100,
  views: 2500,
  created_at: '2024-01-15T10:30:00Z',
}

/**
 * Mock localStorage
 */
export function createMockLocalStorage(): Storage {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

/**
 * Mock window.matchMedia for responsive tests
 */
export function createMockMatchMedia(
  matches: boolean = true
): (query: string) => MediaQueryList {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

/**
 * Mock IntersectionObserver
 */
export function createMockIntersectionObserver() {
  const observers: Array<{
    element: Element
    callback: IntersectionObserverCallback
    options?: IntersectionObserverInit
  }> = []

  // Mock IntersectionObserver constructor
  globalThis.IntersectionObserver = class IntersectionObserver {
    element?: Element
    callback: IntersectionObserverCallback
    options?: IntersectionObserverInit

    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      this.callback = callback
      this.options = options
    }

    observe(element: Element) {
      this.element = element
      observers.push({
        element,
        callback: this.callback,
        options: this.options,
      })
    }

    unobserve(element: Element) {
      const index = observers.findIndex((o) => o.element === element)
      if (index > -1) {
        observers.splice(index, 1)
      }
    }

    disconnect() {
      observers.length = 0
    }
  } as unknown as typeof IntersectionObserver

  // Helper to trigger intersection
  return {
    triggerIntersection: (element: Element, isIntersecting: boolean) => {
      const observer = observers.find((o) => o.element === element)
      if (observer) {
        observer.callback(
          [
            {
              target: element,
              isIntersecting,
              intersectionRatio: isIntersecting ? 1 : 0,
              boundingClientRect: {} as DOMRectReadOnly,
              rootBounds: {} as DOMRectReadOnly,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        )
      }
    },
    clearObservers: () => {
      observers.length = 0
    },
  }
}

/**
 * Mock Image constructor for image loading tests
 */
export function createMockImage() {
  const imageInstances: Array<{
    src: string
    onload: (() => void) | null
    onerror: (() => void) | null
  }> = []

  globalThis.Image = class Image {
    src = ''
    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    constructor() {
      imageInstances.push(this)
    }
  } as unknown as typeof Image

  return {
    triggerLoad: (src: string) => {
      const image = imageInstances.find((img) => img.src === src)
      if (image && image.onload) {
        image.onload()
      }
    },
    triggerError: (src: string) => {
      const image = imageInstances.find((img) => img.src === src)
      if (image && image.onerror) {
        image.onerror()
      }
    },
    clearImages: () => {
      imageInstances.length = 0
    },
  }
}
