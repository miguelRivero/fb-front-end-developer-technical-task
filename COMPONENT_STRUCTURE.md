# Component Structure Documentation

## Overview

The component structure has been refactored to be more logical, scalable, and maintainable. Shared UI components have been extracted to reduce duplication and improve consistency.

## Directory Structure

```
src/components/
├── common/                    # Shared UI components
│   ├── CreatorInfo/          # Creator avatar + name/username
│   ├── EmptyState/           # Empty/error states
│   ├── PhotoDescription/    # Description text component
│   ├── PhotoImage/           # Reusable photo image with hover
│   ├── PhotoOverlay/         # Overlay with title, author, stats
│   ├── PhotoStats/           # Stats display (likes, views)
│   └── index.ts              # Common components exports
│
├── layouts/                   # Layout components
│   ├── GridLayout/           # Grid layout implementation
│   ├── CarouselLayout/       # Carousel layout implementation
│   ├── ListLayout/           # List layout implementation
│   └── CardsLayout/          # Cards layout implementation
│
├── LayoutSwitcher.tsx        # Layout switcher component
├── PhotoCard.tsx             # Photo card component (legacy)
├── ErrorBoundary.tsx         # Error boundary component
└── index.ts                  # Public component exports
```

## Component Hierarchy

### Common Components

#### PhotoImage
- **Purpose**: Reusable photo image display with loading states and hover effects
- **Props**: `photo`, `urlType`, `isHovered`, `aspectRatio`, `priority`, `onClick`
- **Used in**: GridLayout, CarouselLayout, ListLayout, CardsLayout

#### PhotoOverlay
- **Purpose**: Overlay with photo title, creator, and stats
- **Props**: `photo`, `isVisible`, `showViews`
- **Used in**: GridLayout, CarouselLayout

#### PhotoStats
- **Purpose**: Display photo statistics (likes, views)
- **Props**: `photo`, `showViews`, `showLikesLabel`, `lightTheme`, `size`
- **Used in**: All layouts

#### CreatorInfo
- **Purpose**: Display creator avatar, name, and username
- **Props**: `photo`, `size`, `showUsername`, `lightTheme`
- **Used in**: ListLayout, CardsLayout

#### PhotoDescription
- **Purpose**: Display photo description with text truncation
- **Props**: `description`, `maxLines`, `size`
- **Used in**: ListLayout, CardsLayout

#### EmptyState
- **Purpose**: Display empty or error states
- **Props**: `error`, `emptyMessage`
- **Used in**: All layouts

## Benefits

1. **Reduced Duplication**: Shared components eliminate code duplication across layouts
2. **Consistency**: Single source of truth for photo display logic
3. **Maintainability**: Changes to photo display only need to be made in one place
4. **Scalability**: Easy to add new layouts or modify existing ones
5. **Testability**: Smaller, focused components are easier to test
6. **Reusability**: Components can be used in new contexts easily

## Usage Examples

### Using PhotoOverlay in a layout:
```tsx
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'

<PhotoOverlay photo={photo} isVisible={isHovered} showViews />
```

### Using PhotoStats in a card:
```tsx
import { PhotoStats } from '../common/PhotoStats/PhotoStats'

<PhotoStats photo={photo} lightTheme size="sm" />
```

### Using CreatorInfo:
```tsx
import { CreatorInfo } from '../common/CreatorInfo/CreatorInfo'

<CreatorInfo photo={photo} size="md" showUsername lightTheme />
```

## Migration Notes

- All layouts now use shared components instead of inline implementations
- Photo display logic is centralized in `PhotoImage` component
- Overlay logic is centralized in `PhotoOverlay` component
- Stats display is centralized in `PhotoStats` component
- Creator info is centralized in `CreatorInfo` component
