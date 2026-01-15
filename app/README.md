# Photo Gallery App

A React TypeScript application that fetches photos from the Unsplash API and displays them in multiple layout views (Grid, Carousel, List, Cards). Users can seamlessly switch between different viewing modes to browse high-quality photos.

## Tech Stack

- **React 19** - Modern UI library with latest features
- **TypeScript 5.9** - Type-safe development
- **Vite 7** - Fast development server and build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styling
- **Vitest** - Fast unit testing with React Testing Library
- **ESLint + Prettier** - Code quality and formatting

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

```bash
npm install
```

## Available Scripts

### Development

```bash
npm run dev
```
Starts the Vite development server with hot module replacement (HMR).
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build

```bash
npm run build
```
Builds the app for production to the `dist` folder.
Runs TypeScript type checking followed by Vite build.

### Preview

```bash
npm run preview
```
Locally preview the production build.

### Testing

```bash
npm test
```
Run tests in watch mode with Vitest.

```bash
npm run test:ui
```
Run tests with Vitest UI for interactive test exploration.

```bash
npm run test:coverage
```
Run tests with coverage reporting.

### Code Quality

```bash
npm run lint
```
Run ESLint to check for code quality issues.

```bash
npm run format
```
Format code with Prettier (automatically formats all TypeScript and CSS files).

```bash
npm run type-check
```
Run TypeScript type checking without emitting files.

## Project Structure

```
src/
├── components/     # React components
├── context/        # Context API providers
├── hooks/          # Custom React hooks
├── services/       # API services and external integrations
├── styles/         # Global styles and CSS variables
├── test/           # Test setup files
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── App.tsx         # Main application component
```

## Development Workflow

1. Start development server: `npm run dev`
2. Make your changes
3. Run tests: `npm test`
4. Check types: `npm run type-check`
5. Lint code: `npm run lint`
6. Format code: `npm run format`
7. Build for production: `npm run build`

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here
```

Get your Unsplash API key from [Unsplash Developers](https://unsplash.com/developers).
