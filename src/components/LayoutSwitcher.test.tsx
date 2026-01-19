/**
 * Integration tests for LayoutSwitcher component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutSwitcher } from './LayoutSwitcher'
import { renderWithProviders } from '../test/utils'
import { createMockLocalStorage } from '../test/mocks'

describe('LayoutSwitcher Integration Tests', () => {
  let mockLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage = createMockLocalStorage()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockLocalStorage.clear()
  })

  describe('layout switcher rendering', () => {
    it('should render layout switcher', () => {
      renderWithProviders(<LayoutSwitcher />)

      const switcher = screen.getByRole('group', { name: 'Layout view options' })
      expect(switcher).toBeInTheDocument()
    })

    it('should render all four layout buttons', () => {
      renderWithProviders(<LayoutSwitcher />)

      expect(screen.getByLabelText(/switch to grid layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to carousel layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to list layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to cards layout/i)).toBeInTheDocument()
    })

    it('should display layout labels', () => {
      renderWithProviders(<LayoutSwitcher />)

      expect(screen.getByText('Grid')).toBeInTheDocument()
      expect(screen.getByText('Carousel')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Cards')).toBeInTheDocument()
    })
  })

  describe('active layout highlighting', () => {
    it('should highlight active layout button', () => {
      renderWithProviders(<LayoutSwitcher />)

      // Default layout should be 'grid'
      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      expect(gridButton).toHaveAttribute('aria-current', 'true')
    })

    it('should update active state when layout changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })
    })
  })

  describe('layout switching on button click', () => {
    it('should switch to grid layout', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      // First switch away from grid
      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      // Then switch back to grid
      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      await user.click(gridButton)

      await waitFor(() => {
        expect(gridButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should switch to carousel layout', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should switch to list layout', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const listButton = screen.getByLabelText(/switch to list layout/i)
      await user.click(listButton)

      await waitFor(() => {
        expect(listButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should switch to cards layout', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const cardsButton = screen.getByLabelText(/switch to cards layout/i)
      await user.click(cardsButton)

      await waitFor(() => {
        expect(cardsButton).toHaveAttribute('aria-current', 'true')
      })
    })
  })

  describe('LayoutContext updates on switch', () => {
    it('should update context when layout changes', async () => {
      const user = userEvent.setup()
      const { rerender } = renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })

      // Re-render to verify context persisted
      rerender(<LayoutSwitcher />)
      expect(carouselButton).toHaveAttribute('aria-current', 'true')
    })
  })

  describe('localStorage persistence', () => {
    it('should persist layout to localStorage', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      await user.click(carouselButton)

      await waitFor(() => {
        // Check localStorage was updated
        const stored = mockLocalStorage.getItem('photo-gallery-layout')
        expect(stored).toBe('carousel')
      })
    })

    it('should load layout from localStorage on mount', () => {
      // Set initial layout in localStorage
      mockLocalStorage.setItem('photo-gallery-layout', 'cards')

      renderWithProviders(<LayoutSwitcher />)

      const cardsButton = screen.getByLabelText(/switch to cards layout/i)
      expect(cardsButton).toHaveAttribute('aria-current', 'true')
    })

    it('should use default layout if localStorage is empty', () => {
      mockLocalStorage.clear()

      renderWithProviders(<LayoutSwitcher />)

      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      expect(gridButton).toHaveAttribute('aria-current', 'true')
    })
  })

  describe('responsive button labels', () => {
    it('should show full labels on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      renderWithProviders(<LayoutSwitcher />)

      // Labels should be visible
      expect(screen.getByText('Grid')).toBeInTheDocument()
      expect(screen.getByText('Carousel')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Cards')).toBeInTheDocument()
    })

    it('should handle mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      renderWithProviders(<LayoutSwitcher />)

      // Buttons should still be rendered
      expect(screen.getByLabelText(/switch to grid layout/i)).toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('should switch layout with Enter key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      carouselButton.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should switch layout with Space key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      carouselButton.focus()
      await user.keyboard(' ')

      await waitFor(() => {
        expect(carouselButton).toHaveAttribute('aria-current', 'true')
      })
    })

    it('should navigate between buttons with Tab key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      gridButton.focus()

      await user.keyboard('{Tab}')
      
      // Focus should move to next button
      const focusedElement = document.activeElement
      expect(focusedElement).not.toBe(gridButton)
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-labels', () => {
      renderWithProviders(<LayoutSwitcher />)

      expect(screen.getByLabelText(/switch to grid layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to carousel layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to list layout/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/switch to cards layout/i)).toBeInTheDocument()
    })

    it('should have proper roles', () => {
      renderWithProviders(<LayoutSwitcher />)

      const switcher = screen.getByRole('group', { name: 'Layout view options' })
      expect(switcher).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(4)
    })

    it('should have aria-current for active layout', () => {
      renderWithProviders(<LayoutSwitcher />)

      const gridButton = screen.getByLabelText(/switch to grid layout/i)
      expect(gridButton).toHaveAttribute('aria-current', 'true')

      const carouselButton = screen.getByLabelText(/switch to carousel layout/i)
      expect(carouselButton).toHaveAttribute('aria-current', 'false')
    })

    it('should have title attributes for tooltips', () => {
      renderWithProviders(<LayoutSwitcher />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('title')
      })
    })
  })

  describe('smooth transitions between layouts', () => {
    it('should switch layouts without errors', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LayoutSwitcher />)

      const layouts = [
        screen.getByLabelText(/switch to grid layout/i),
        screen.getByLabelText(/switch to carousel layout/i),
        screen.getByLabelText(/switch to list layout/i),
        screen.getByLabelText(/switch to cards layout/i),
      ]

      // Switch through all layouts
      for (const layoutButton of layouts) {
        await user.click(layoutButton)
        await waitFor(() => {
          expect(layoutButton).toHaveAttribute('aria-current', 'true')
        })
      }
    })
  })
})
