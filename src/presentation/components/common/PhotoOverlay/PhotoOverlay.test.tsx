/**
 * Tests for PhotoOverlay component
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { PhotoOverlay } from './PhotoOverlay'
import { createMockPhoto } from '../../../../test/mocks'

describe('PhotoOverlay', () => {
  it('should render a title and author attribution', () => {
    const photo = createMockPhoto({
      altDescription: 'hello world',
      creator: {
        name: 'Jane Doe',
        username: 'janedoe',
        profileImageUrl: 'https://images.unsplash.com/profile-jane.jpg',
      },
    })

    render(<PhotoOverlay photo={photo} isVisible showViews={false} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Hello world' })).toBeInTheDocument()
    expect(screen.getByText('by Jane Doe')).toBeInTheDocument()
  })

  it('should fall back to "Photo" when altDescription is missing', () => {
    const photo = createMockPhoto({ altDescription: null })

    render(<PhotoOverlay photo={photo} isVisible showViews={false} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Photo' })).toBeInTheDocument()
  })

  it('should render a root element with data-photo-overlay attribute', () => {
    const photo = createMockPhoto()
    const { container } = render(<PhotoOverlay photo={photo} isVisible={false} showViews={false} />)

    const overlayEl = container.querySelector('[data-photo-overlay]')
    expect(overlayEl).toBeInTheDocument()
    expect(overlayEl).toHaveClass(/overlay/)
    expect(overlayEl).not.toHaveClass(/overlayVisible/)
  })

  it('should apply visible styling when isVisible is true', () => {
    const photo = createMockPhoto()
    const { container } = render(<PhotoOverlay photo={photo} isVisible showViews={false} />)

    const overlayEl = container.querySelector('[data-photo-overlay]')
    expect(overlayEl).toBeInTheDocument()
    expect(overlayEl).toHaveClass(/overlayVisible/)
  })

  it('should show views label when showViews is true', () => {
    const photo = createMockPhoto({ views: 321 })

    const { rerender } = render(<PhotoOverlay photo={photo} isVisible showViews={false} />)
    expect(screen.queryByText(/views/i)).not.toBeInTheDocument()

    rerender(<PhotoOverlay photo={photo} isVisible showViews />)
    expect(screen.getByLabelText('views: 321')).toBeInTheDocument()
  })
})

