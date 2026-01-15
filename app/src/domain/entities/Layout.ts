/**
 * Domain Value Object: Layout
 * 
 * Represents the different layout modes available in the application.
 * This is a domain concept, independent of UI implementation.
 */
export type Layout = 'grid' | 'carousel' | 'list' | 'cards'

/**
 * Layout metadata for domain operations
 */
export interface LayoutMetadata {
  readonly type: Layout
  readonly displayName: string
  readonly description: string
}

/**
 * Available layouts in the domain
 */
export const LAYOUTS: Record<Layout, LayoutMetadata> = {
  grid: {
    type: 'grid',
    displayName: 'Grid',
    description: 'Masonry grid layout with responsive columns',
  },
  carousel: {
    type: 'carousel',
    displayName: 'Carousel',
    description: 'Swipeable carousel with navigation',
  },
  list: {
    type: 'list',
    displayName: 'List',
    description: 'Vertical list with scrolling',
  },
  cards: {
    type: 'cards',
    displayName: 'Cards',
    description: 'Card-based layout with metadata',
  },
} as const
