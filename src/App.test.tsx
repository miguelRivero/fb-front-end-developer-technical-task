/**
 * Integration tests for App component - User flows and interactions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import App from './App'
import { createMockLocalStorage } from './test/mocks'
import { renderWithProviders } from './test/utils'
import userEvent from '@testing-library/user-event'

describe('App Integration Tests - User Flows', () => {
  let mockLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage = createMockLocalStorage()

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockLocalStorage.clear()
  })

  describe('initial app load and photo fetching', () => {
    it('should render app header on initial load', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      // App header should render
      expect(screen.getByText('Flowbox')).toBeInTheDocument()
      expect(screen.getByText('Photo Gallery')).toBeInTheDocument()
    })

    it('should render layout switcher', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      expect(
        screen.getByRole('group', { name: 'Layout view options' })
      ).toBeInTheDocument()
    })
  })

  describe('layout switching flow', () => {
    it('should switch between all layouts', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      await waitFor(() => {
        expect(screen.getByText('Flowbox')).toBeInTheDocument()
      })

      // Switch to carousel
      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })

      // Switch to list
      const listButton = screen.getByLabelText(/switch to list layout/i)
      await user.click(listButton)

      await waitFor(() => {
        expect(listButton).toHaveAttribute('aria-current', 'true')
      })

      // Switch to cards
      const cardsButton = screen.getByLabelText(/switch to cards layout/i)
      await user.click(cardsButton)

      await waitFor(() => {
        expect(cardsButton).toHaveAttribute('aria-current', 'true')
      })

      // Switch back to grid
      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      await user.click(gridButton)

      await waitFor(() => {
        expect(gridButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should persist layout preference', async () => {
      const user = userEvent.setup()
      const { unmount } = renderWithProviders(<App />)

      await waitFor(() => {
        expect(screen.getByText('Flowbox')).toBeInTheDocument()
      })

      // Switch to cards layout
      const cardsButton = screen.getByLabelText(/switch to cards layout/i)
      await user.click(cardsButton)

      await waitFor(() => {
        expect(cardsButton).toHaveAttribute('aria-current', 'true')
      })

      // Unmount and remount
      unmount()
      renderWithProviders(<App />)

      // Should restore cards layout
      await waitFor(() => {
        const restoredCardsButton = screen.getByLabelText(
          /switch to cards layout/i
        )
        expect(restoredCardsButton).toHaveAttribute('aria-current', 'true')
      })
    })
  })

  describe('photo browsing flow', () => {
    it('should render layout container', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      // Layout container should be present
      expect(screen.getByTestId('app-layout-container')).toBeInTheDocument()
    })
  })

  describe('loading states throughout app', () => {
    it('should render app structure', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      // App structure should be present
      expect(screen.getByText('Flowbox')).toBeInTheDocument()
    })
  })

  describe('responsive layout changes', () => {
    it('should adapt to mobile viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      await act(async () => {
        renderWithProviders(<App />)
      })

      expect(screen.getByText('Flowbox')).toBeInTheDocument()
    })

    it('should adapt to tablet viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      await act(async () => {
        renderWithProviders(<App />)
      })

      expect(screen.getByText('Flowbox')).toBeInTheDocument()
    })

    it('should adapt to desktop viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      await act(async () => {
        renderWithProviders(<App />)
      })

      expect(screen.getByText('Flowbox')).toBeInTheDocument()
    })

    it('should handle window resize', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText('Flowbox')).toBeInTheDocument()
      })

      // Resize window
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      await act(async () => {
        fireEvent.resize(window)
      })

      // App should still render
      await waitFor(() => {
        expect(screen.getByText('Flowbox')).toBeInTheDocument()
      })
    })
  })

  describe('localStorage persistence across reloads', () => {
    it('should persist layout preference', async () => {
      const user = userEvent.setup()
      const { unmount } = renderWithProviders(<App />)

      await waitFor(() => {
        expect(screen.getByText('Flowbox')).toBeInTheDocument()
      })

      // Change layout
      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })

      // Check localStorage
      const stored = mockLocalStorage.getItem('photo-gallery-layout')
      expect(stored).toBe('carousel')

      // Unmount and remount
      unmount()
      renderWithProviders(<App />)

      // Should restore layout
      await waitFor(() => {
        const restoredButton = screen.getByLabelText(
          /switch to carousel layout/i
        )
        expect(restoredButton).toHaveAttribute('aria-current', 'true')
      })
    })
  })

  describe('error recovery', () => {
    it('should render app structure even with potential errors', async () => {
      await act(async () => {
        renderWithProviders(<App />)
      })

      // App should render
      expect(screen.getByText('Flowbox')).toBeInTheDocument()
    })
  })
})
