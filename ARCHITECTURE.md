# Architecture Documentation

## Overview

This project implements **Clean Architecture** (also known as Hexagonal Architecture or Ports & Adapters) with **Domain-Driven Design (DDD)** principles. This document explains the architectural decisions, trade-offs, and when this approach is appropriate.

## Architecture Decision

### Why Clean Architecture?

I chose Clean Architecture for this technical assessment to:

1. **Demonstrate Architectural Knowledge**: Show understanding of enterprise patterns and layered architecture
2. **Practice Separation of Concerns**: Implement clear boundaries between business logic, application logic, and infrastructure
3. **Enable Testability**: Make each layer independently testable with dependency injection
4. **Showcase Dependency Inversion**: Demonstrate the Dependency Inversion Principle in practice

### Is It Overkill?

**Honestly? Yes, for this specific task.**

For a simple photo gallery that:

- Fetches photos from an API
- Displays them in 4 different layouts
- Has minimal business logic
- Is a single-feature application

A simpler structure would be more pragmatic:

- Feature-based organization (`src/features/photos/`)
- Or even a flatter structure with clear separation

### Why I Still Chose It

1. **Technical Assessment Context**: Demonstrates ability to work with complex architectures
2. **Learning Opportunity**: Practice implementing Clean Architecture principles
3. **Scalability Demonstration**: Shows how the codebase could scale if requirements grew
4. **Professional Standard**: Many enterprise applications use this pattern

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

**Purpose**: Core business logic, independent of frameworks and external concerns.

**Contains**:

- **Entities**: `Photo`, `Layout` - Core business concepts
- **Repository Interfaces**: `PhotoRepository` - Contracts for data access
- **Domain Errors**: `PhotoRepositoryError` - Domain-specific error types

**Key Principles**:

- ✅ No dependencies on external frameworks (React, Axios, etc.)
- ✅ Pure TypeScript interfaces and types
- ✅ Framework-agnostic business rules
- ✅ Can be tested without any infrastructure

**Example**:

```typescript
// Domain entity - no React, no API concerns
export interface Photo {
  readonly id: string
  readonly urls: { ... }
  readonly creator: { ... }
  // Pure business concept
}
```

### 2. Application Layer (`src/application/`)

**Purpose**: Application-specific business logic and use cases.

**Contains**:

- **Use Cases**: `FetchPhotosUseCase` - Orchestrates domain operations
- Application services that coordinate between domain and infrastructure

**Key Principles**:

- ✅ Depends only on domain layer
- ✅ Contains application-specific workflows
- ✅ Orchestrates domain operations
- ✅ No knowledge of UI or infrastructure details

**Example**:

```typescript
// Use case - orchestrates domain operations
export class FetchPhotosUseCase {
  constructor(private photoRepository: PhotoRepository) {}

  async execute(params: PhotoSearchParams): Promise<PhotoSearchResult> {
    return await this.photoRepository.searchPhotos(params)
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: External concerns - API calls, storage, third-party services.

**Contains**:

- **Repositories**: `UnsplashPhotoRepository` - Implements domain interfaces
- **Adapters**: `UnsplashApiAdapter` - Adapts external API to domain models
- **Services**: API clients, localStorage, etc.

**Key Principles**:

- ✅ Implements domain interfaces (Dependency Inversion)
- ✅ Handles external API details
- ✅ Adapts external data to domain models
- ✅ Can be swapped without affecting domain/application layers

**Example**:

```typescript
// Infrastructure - implements domain interface
export class UnsplashPhotoRepository implements PhotoRepository {
  async searchPhotos(params: PhotoSearchParams): Promise<PhotoSearchResult> {
    // Handles API calls, error mapping, data transformation
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**Purpose**: React-specific code - components, hooks, context.

**Contains**:

- **Context**: `PhotoContext`, `LayoutContext` - React state management
- **Hooks**: `usePhotos`, `useLayout` - React-specific logic
- **Components**: UI components (in `src/components/`)

**Key Principles**:

- ✅ Depends on domain entities (not infrastructure types)
- ✅ Uses use cases for business operations
- ✅ React-specific concerns isolated here
- ✅ Can be replaced with different UI framework

**Example**:

```typescript
// Presentation - uses domain entities and use cases
export function usePhotos() {
  const fetchPhotosUseCase = useMemo(
    () => new FetchPhotosUseCase(photoRepository),
    []
  )
  // React-specific state management
}
```

## Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

**Dependency Rule**: Dependencies point inward. Outer layers depend on inner layers, never the reverse.

- ✅ Domain has **zero** dependencies
- ✅ Application depends on Domain
- ✅ Infrastructure depends on Domain (implements interfaces)
- ✅ Presentation depends on Domain and Application

## Trade-offs

### ✅ Advantages

1. **Testability**: Each layer can be tested independently
   - Domain logic tested without React
   - Use cases tested with mock repositories
   - Infrastructure tested with mock APIs

2. **Maintainability**: Clear separation of concerns
   - Business logic changes don't affect UI
   - API changes don't affect business logic
   - Easy to locate code by responsibility

3. **Flexibility**: Easy to swap implementations
   - Change API provider? Only update infrastructure
   - Change UI framework? Only update presentation
   - Business logic remains unchanged

4. **Scalability**: Structure supports growth
   - Easy to add new features
   - Clear boundaries prevent coupling
   - Multiple teams can work independently

### ❌ Disadvantages

1. **Complexity**: More files and structure than needed
   - Simple operations require multiple files
   - Longer import paths
   - More cognitive overhead

2. **Over-engineering**: More than necessary for simple apps
   - This photo gallery doesn't need this structure
   - Adds development time
   - Can slow down simple changes

3. **Learning Curve**: Team members need to understand architecture
   - New developers need onboarding
   - More documentation required
   - Can be intimidating for junior developers

4. **Boilerplate**: More code for simple operations
   - Use cases that just call repositories
   - Adapters that just transform data
   - More files to navigate

## When to Use Clean Architecture

### ✅ Good Fit For:

1. **Complex Business Logic**
   - Multiple business rules
   - Complex workflows
   - Domain models with behavior

2. **Large Applications**
   - Multiple features
   - Multiple teams
   - Long-term maintenance

3. **Enterprise Applications**
   - Need to swap implementations
   - Multiple platforms (web, mobile, backend)
   - Regulatory requirements

4. **High Testability Requirements**
   - Critical business logic
   - Need to test without UI
   - Complex test scenarios

### ❌ Not Ideal For:

1. **Simple Applications**
   - Single feature
   - Minimal business logic
   - Prototypes/MVPs

2. **Small Teams**
   - Solo developer
   - Small codebase
   - Rapid iteration needed

3. **Simple CRUD Applications**
   - Basic data display
   - No complex workflows
   - Standard patterns sufficient

4. **Time-Constrained Projects**
   - Tight deadlines
   - Need to ship quickly
   - Can add structure later

## Alternative Approaches

### For This Project, Alternatives Would Be:

#### 1. Feature-Based Organization

```
src/
  features/
    photos/
      components/
      hooks/
      api/
      types/
    layout/
      components/
      hooks/
```

**Pros**: Easier navigation, everything related together  
**Cons**: Risk of duplication, harder to share code

#### 2. Simple Layered Structure

```
src/
  components/
  hooks/
  services/  # API calls
  types/
```

**Pros**: Simple, fast to develop  
**Cons**: Less structure, harder to scale

#### 3. Hybrid Approach

```
src/
  domain/        # Keep domain entities
  features/       # Feature-based for UI
  shared/         # Shared utilities
```

**Pros**: Balance of structure and simplicity  
**Cons**: Mixed patterns can be confusing

## Current Structure

```
src/
├── domain/              # Business entities and interfaces
│   ├── entities/       # Photo, Layout
│   └── repositories/   # PhotoRepository interface
├── application/         # Use cases
│   └── use-cases/      # FetchPhotosUseCase
├── infrastructure/      # External implementations
│   ├── repositories/   # UnsplashPhotoRepository
│   └── adapters/       # UnsplashApiAdapter
├── presentation/        # React-specific
│   ├── context/        # PhotoContext, LayoutContext
│   └── hooks/          # usePhotos, useLayout
└── components/          # UI components
```

## Component Structure

The component structure has been refactored to be more logical, scalable, and maintainable. Shared UI components have been extracted to reduce duplication and improve consistency.

### Directory Structure

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

### Common Components

#### PhotoImage

- **Purpose**: Reusable photo image display with loading states and hover effects
- **Props**: `photo`, `urlType`, `isHovered`, `aspectRatio`, `priority`, `onClick`
- **Used in**: GridLayout, CarouselLayout, ListLayout, CardsLayout

#### ScrollToTopButton

- **Purpose**: Floating button that appears after scrolling and smoothly scrolls the page back to the top
- **Used in**: App shell (global)

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

### Component Benefits

1. **Reduced Duplication**: Shared components eliminate code duplication across layouts
2. **Consistency**: Single source of truth for photo display logic
3. **Maintainability**: Changes to photo display only need to be made in one place
4. **Scalability**: Easy to add new layouts or modify existing ones
5. **Testability**: Smaller, focused components are easier to test
6. **Reusability**: Components can be used in new contexts easily

### Usage Examples

#### Using PhotoOverlay in a layout:

```tsx
import { PhotoOverlay } from '../common/PhotoOverlay/PhotoOverlay'

;<PhotoOverlay photo={photo} isVisible={isHovered} showViews />
```

#### Using PhotoStats in a card:

```tsx
import { PhotoStats } from '../common/PhotoStats/PhotoStats'

;<PhotoStats photo={photo} lightTheme size="sm" />
```

#### Using CreatorInfo:

```tsx
import { CreatorInfo } from '../common/CreatorInfo/CreatorInfo'

;<CreatorInfo photo={photo} size="md" showUsername lightTheme />
```

## Decision Summary

| Aspect                   | Clean Architecture | Simpler Alternative |
| ------------------------ | ------------------ | ------------------- |
| **Complexity**           | High               | Low                 |
| **Development Speed**    | Slower             | Faster              |
| **Maintainability**      | High               | Medium              |
| **Testability**          | Excellent          | Good                |
| **Scalability**          | Excellent          | Medium              |
| **Learning Curve**       | Steep              | Gentle              |
| **Appropriate for Task** | Overkill           | More suitable       |

## Conclusion

Clean Architecture was chosen for this assessment to **demonstrate architectural knowledge and implementation skills**, not because it's the most pragmatic choice for this specific task.

**For production**: I would choose a simpler structure (feature-based or flat) for a photo gallery of this scope, and introduce Clean Architecture only if:

- Business logic becomes complex
- Multiple features are added
- Team size grows
- Long-term maintenance is critical

**Key Takeaway**: The best architecture is the simplest one that meets your requirements. Clean Architecture is a powerful tool, but like all tools, it should be used when appropriate, not by default.

---

_This architecture demonstrates understanding of enterprise patterns while acknowledging that simpler solutions are often better for simpler problems._
