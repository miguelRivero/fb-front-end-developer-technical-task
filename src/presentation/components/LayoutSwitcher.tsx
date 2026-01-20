import { LAYOUTS } from '@/domain/entities/Layout'
import type { Layout } from '@/domain/entities/Layout'
import {
  LayoutCardsIcon,
  LayoutCarouselIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from '@/presentation/components/common/icons'
import styles from './LayoutSwitcher.module.scss'
import { useLayout } from '@/presentation/hooks/useLayout'

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
        return <LayoutGridIcon className={styles.icon} />
      case 'carousel':
        return <LayoutCarouselIcon className={styles.icon} />
      case 'list':
        return <LayoutListIcon className={styles.icon} />
      case 'cards':
        return <LayoutCardsIcon className={styles.icon} />
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
            aria-current={isActive ? 'true' : undefined}
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

