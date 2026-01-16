# Flowbox Photo Gallery

A modern React TypeScript photo gallery application that fetches photos from the Unsplash API and displays them in multiple layout views (Grid, Carousel, List, Cards). Users can seamlessly switch between different viewing modes to browse high-quality photos.

## Features

- 🖼️ **Multiple Layout Views**: Grid, Carousel, List, and Cards layouts
- 🔄 **Smooth Layout Switching**: Seamless transitions between different views
- 📱 **Responsive Design**: Works beautifully across all device sizes
- ⚡ **Performance Optimized**: Efficient photo loading and rendering
- 🎨 **Modern UI**: Clean, minimal interface with smooth animations
- ♿ **Accessible**: Built with accessibility best practices

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Modules (SCSS)
- **State Management**: React Context API + useReducer
- **Testing**: Vitest + React Testing Library
- **API**: Unsplash API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/miguelRivero/fb-front-end-developer-technical-task.git
cd fb-front-end-developer-technical-task
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

You can get a free Unsplash API key from [Unsplash Developers](https://unsplash.com/developers).

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking

## Project Structure

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/              # Business entities and interfaces
├── application/         # Use cases and application logic
├── infrastructure/      # External services (API, storage)
├── presentation/        # React-specific (context, hooks)
└── components/          # UI components
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Architecture

This project implements Clean Architecture to demonstrate:

- **Separation of Concerns**: Clear boundaries between business logic, application logic, and infrastructure
- **Dependency Inversion**: Domain layer is independent of frameworks
- **Testability**: Each layer can be tested independently
- **Maintainability**: Easy to modify and extend

**Note**: Clean Architecture is more structured than strictly necessary for this task. It was chosen to demonstrate architectural knowledge and implementation skills. See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed explanation of the architectural decisions and trade-offs.

## Component Organization

The component structure has been refactored for scalability and maintainability:

- **Common Components**: Reusable UI components (PhotoImage, PhotoOverlay, PhotoStats, etc.)
- **Layout Components**: Grid, Carousel, List, and Cards layouts
- **Shared Logic**: Centralized photo display logic to reduce duplication

See [ARCHITECTURE.md](./ARCHITECTURE.md#component-structure) for detailed component documentation.

## Development

### Code Style

- ESLint for linting
- Prettier for code formatting
- TypeScript strict mode enabled

### Testing

Tests are written using Vitest and React Testing Library. Run tests with:

```bash
npm run test
```

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge).

## License

MIT

## Author

Miguel Rivero - [GitHub](https://github.com/miguelRivero)

---

Built as a technical assessment for a Senior Frontend Developer position.
