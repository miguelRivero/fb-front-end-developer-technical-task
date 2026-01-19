import { LAYOUTS } from '../../domain/entities/Layout'
import type { Layout } from '../../domain/entities/Layout'
import styles from './LayoutSwitcher.module.scss'
import { useLayout } from '../hooks/useLayout'

/**
 * LayoutSwitcher Component
 *
 * A user interface component that enables seamless switching between different layout views
 * (Grid, Carousel, List, and Cards). The switcher displays buttons for each layout option
 * with icons, active state indication, and smooth interactions.
 *
 * Features:
 * - Visual buttons for each layout type with icons
 * - Active state highlighting for current layout
 * - Smooth transitions and hover effects
 * - Full keyboard navigation support
 * - Comprehensive accessibility (ARIA labels, focus states)
 *
 * @returns LayoutSwitcher component
 *
 * @example
 * ```tsx
 * <LayoutSwitcher />
 * ```
 */
export function LayoutSwitcher() {
  const { currentLayout, changeLayout } = useLayout()

  /**
   * Handles layout change when button is clicked
   */
  const handleLayoutChange = (layout: Layout) => {
    changeLayout(layout)
  }

  /**
   * Handles keyboard navigation (Enter and Space keys)
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, layout: Layout) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleLayoutChange(layout)
    }
  }

  /**
   * Gets SVG icon for a layout type
   */
  const getLayoutIcon = (layout: Layout) => {
    switch (layout) {
      case 'grid':
        return (
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        )
      case 'carousel':
        return (
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        )
      case 'list':
        return (
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )
      case 'cards':
        return (
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        )
    }
  }

  return (
    <div className={styles.switcher} role="group" aria-label="Layout view options">
      {(Object.keys(LAYOUTS) as Layout[]).map((layout) => {
        const isActive = currentLayout === layout
        const layoutMetadata = LAYOUTS[layout]
        const isListLayout = layout === 'list'

        return (
          <button
            key={layout}
            type="button"
            className={`${styles.button} ${isActive ? styles.active : ''} ${
              isListLayout ? styles.hideOnMobile : ''
            }`}
            onClick={() => handleLayoutChange(layout)}
            onKeyDown={(e) => handleKeyDown(e, layout)}
            aria-label={`Switch to ${layoutMetadata.displayName} layout`}
            aria-current={isActive ? 'true' : 'false'}
            title={layoutMetadata.description}
          >
            {getLayoutIcon(layout)}
            <span className={styles.label}>{layoutMetadata.displayName}</span>
          </button>
        )
      })}
    </div>
  )
}

