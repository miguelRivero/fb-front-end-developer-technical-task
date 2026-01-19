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

### Verification

After installation, verify your setup is working correctly:

1. **Verify dependencies installed**:
   ```bash
   npm list --depth=0
   ```
   Should show all dependencies without errors.

2. **Verify environment variable is set**:
   ```bash
   # On Unix/macOS
   grep VITE_UNSPLASH_ACCESS_KEY .env
   
   # Or check if the variable is loaded (should not be empty)
   node -e "console.log(process.env.VITE_UNSPLASH_ACCESS_KEY || 'NOT SET')"
   ```
   The variable should be set in your `.env` file.

3. **Verify app runs successfully**:
   ```bash
   npm run dev
   ```
   - Server should start without errors
   - Open http://localhost:5173 in your browser
   - Photos should load and display
   - Layout switcher should work

4. **Verify TypeScript compiles**:
   ```bash
   npm run type-check
   ```
   Should complete without type errors.

5. **Verify tests pass**:
   ```bash
   npm run test
   ```
   All tests should pass (if tests are implemented).

6. **Verify build works**:
   ```bash
   npm run build
   ```
   Should create a `dist/` directory with production files.

### Common Setup Issues

**"Cannot find module" errors**:
- Run `npm install` again
- Delete `node_modules/` and `package-lock.json`, then run `npm install`

**"Invalid API key" error when running app**:
- Verify `.env` file exists in the root directory
- Check that `VITE_UNSPLASH_ACCESS_KEY` is set correctly
- Restart the development server after creating/modifying `.env`

**Port already in use**:
- Vite will automatically try the next available port
- Or specify a different port: `npm run dev -- --port 3000`

**TypeScript errors**:
- Run `npm run type-check` to see detailed errors
- Ensure all dependencies are installed
- Check that your Node.js version is 18+

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
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

- **ESLint**: Linting with modern flat config (v9)
- **Prettier**: Code formatting (separated from ESLint for performance)
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **JSDoc**: All components, hooks, and utilities are fully documented

### Code Documentation

All code follows JSDoc standards with comprehensive documentation:

- **Components**: Full prop documentation, usage examples, and accessibility notes
- **Hooks**: Parameter descriptions, return value documentation, and usage examples
- **Utilities**: Function purpose, parameter types, edge cases, and examples
- **Architecture**: Domain, application, and infrastructure layers fully documented

### Testing

Tests are written using Vitest and React Testing Library. The project includes:

- Component unit tests
- Hook tests
- Utility function tests
- Integration tests

Run tests with:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

```

### Development Guidelines

1. **Clean Architecture**: Follow the layered architecture pattern
   - Domain entities in `src/domain/`
   - Use cases in `src/application/`
   - Infrastructure implementations in `src/infrastructure/`
   - React-specific code in `src/presentation/`

2. **Component Organization**:
   - Common components in `src/components/common/`
   - Layout components in `src/components/layouts/`
   - Extract shared logic to reduce duplication

3. **Type Safety**:
   - Use domain entities (`Photo`) in presentation layer, not infrastructure types
   - Avoid `any` types - use proper TypeScript types
   - Leverage TypeScript's strict mode

4. **Styling**:
   - Use Tailwind CSS for utility classes
   - Use CSS Modules for component-specific styles
   - Follow responsive design patterns (mobile-first)

5. **Accessibility**:
   - Provide proper alt text for images
   - Use ARIA labels where appropriate
   - Ensure keyboard navigation support
   - Maintain semantic HTML structure

## Performance Considerations

- **Image Loading**: Lazy loading for images below the fold, eager loading for priority images
- **Infinite Scroll**: Efficient scroll detection using Intersection Observer API
- **Memoization**: React.memo used for list items to prevent unnecessary re-renders
- **Request Cancellation**: AbortController used to cancel in-flight requests
- **Image Preloading**: Carousel layout preloads adjacent images for smooth transitions

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires support for:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Intersection Observer API
- Fetch API (via Axios)

## API Configuration

### Unsplash API

This application uses the Unsplash API to fetch photos. To use the application:

1. Sign up for a free Unsplash Developer account at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application to get your Access Key
3. Add your Access Key to `.env` file:
   ```env
   VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

**Rate Limits**: The Unsplash free tier allows 50 requests per hour. The application handles rate limit errors gracefully with user-friendly messages.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Troubleshooting

### Common Issues

**"Invalid Unsplash API key" error**:
- Verify your `VITE_UNSPLASH_ACCESS_KEY` is set correctly in `.env`
- Ensure the `.env` file is in the root directory
- Restart the development server after adding/changing the key

**"Rate limit exceeded" error**:
- Unsplash free tier allows 50 requests/hour
- Wait for the rate limit to reset or upgrade your Unsplash plan

**Images not loading**:
- Check your internet connection
- Verify the Unsplash API is accessible
- Check browser console for specific error messages

**TypeScript errors**:
- Run `npm run type-check` to see all type errors
- Ensure all dependencies are installed: `npm install`

## Deployment

This application can be deployed to any static hosting service that supports Vite builds. The build output is located in the `dist/` directory.

### Build Process

1. **Build for production**:
   ```bash
   npm run build
   ```
   This command:
   - Runs TypeScript type checking (`tsc -b`)
   - Builds the application with Vite (`vite build`)
   - Outputs optimized production files to `dist/`

2. **Preview production build locally**:
   ```bash
   npm run preview
   ```
   This serves the `dist/` directory locally for testing before deployment.

### Environment Variables

**Important**: You must configure the `VITE_UNSPLASH_ACCESS_KEY` environment variable in your deployment platform.

The environment variable is required at build time for Vite to include it in the client bundle. Make sure to set it in your deployment platform's environment variable settings.

### Deployment Platforms

#### Vercel

1. **Connect your repository** to Vercel
2. **Configure environment variables**:
   - Go to Project Settings → Environment Variables
   - Add `VITE_UNSPLASH_ACCESS_KEY` with your Unsplash API key
   - Apply to Production, Preview, and Development environments
3. **Build settings** (auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy**: Vercel will automatically deploy on every push to your main branch

#### Netlify

1. **Connect your repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables**:
   - Go to Site Settings → Environment Variables
   - Add `VITE_UNSPLASH_ACCESS_KEY` with your Unsplash API key
4. **Deploy**: Netlify will build and deploy automatically

#### GitHub Pages

1. **Install gh-pages** (if not already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script** to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Configure base path** in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... other config
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Set environment variables**: GitHub Pages doesn't support server-side environment variables. You'll need to use GitHub Secrets and a GitHub Actions workflow, or use a different deployment method.

#### Other Platforms

For other platforms (AWS S3, Azure Static Web Apps, etc.):

1. Build the application: `npm run build`
2. Upload the `dist/` directory contents to your hosting service
3. Configure the `VITE_UNSPLASH_ACCESS_KEY` environment variable in your platform's settings
4. Ensure the platform serves `index.html` for all routes (SPA routing)

### Deployment Considerations

- **API Rate Limits**: The Unsplash free tier allows 50 requests/hour. Consider implementing caching or upgrading your Unsplash plan for production use
- **Build Output**: The `dist/` directory contains all static assets needed for deployment
- **Environment Variables**: Must be set in your deployment platform's environment variable settings
- **SPA Routing**: Ensure your hosting service is configured to serve `index.html` for all routes (required for client-side routing)

### Troubleshooting Deployment

**Build fails**:
- Verify all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run type-check`
- Ensure Node.js version is 18+ on your deployment platform

**Environment variables not working**:
- Verify the variable name is exactly `VITE_UNSPLASH_ACCESS_KEY`
- Ensure the variable is set in your deployment platform's settings
- Restart/redeploy after adding environment variables
- Check that the variable is available at build time (Vite requires it during build)

**404 errors on routes**:
- Configure your hosting service to serve `index.html` for all routes
- This is required for single-page application (SPA) routing

## Contributing

This is a technical assessment project. For questions or issues, please contact the repository owner.

## License

MIT

## Author

Miguel Rivero - [GitHub](https://github.com/miguelRivero)

---

Built as a technical assessment for a Senior Frontend Developer position.
