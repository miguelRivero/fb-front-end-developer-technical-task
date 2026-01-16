import './App.scss'

import { CardsLayout } from './components/layouts/CardsLayout'
import { CarouselLayout } from './components/layouts/CarouselLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GridLayout } from './components/layouts/GridLayout'
import { LayoutSwitcher } from './components/LayoutSwitcher'
import { ListLayout } from './components/layouts/ListLayout'
import styles from './App.module.scss'
import { useEffect } from 'react'
import { useLayout } from './presentation/hooks/useLayout'
import { usePhotos } from './presentation/hooks/usePhotos'

function App() {
  const { photos, loading, error, fetchPhotos, loadMore, hasMore } = usePhotos()
  const { currentLayout } = useLayout()

  useEffect(() => {
    // Initial fetch on mount
    fetchPhotos('nature')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Classic Header */}
        <div className="bg-background border-b border-border">
          <div className={styles.headerContainer}>
            <header className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <svg
                    className="w-6 h-6 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-semibold text-foreground leading-tight">
                    Flowbox
                  </h1>
                  <span className="text-sm text-muted-foreground">
                    Photo Gallery
                  </span>
                </div>
              </div>

              {/* Layout Switcher */}
              <LayoutSwitcher />
            </header>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.contentContainer}>
          {/* Status Display */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Error:</strong> {error.message}
              </p>
            </div>
          )}

          {/* Layout Display */}
          <div className={`${styles.layoutContainer} animate-in fade-in duration-200`}>
            <div
              key={currentLayout}
              className={`${styles.layoutWrapper} ${styles[`layout-${currentLayout}`]}`}
            >
              {currentLayout === 'grid' && (
                <GridLayout
                  photos={photos}
                  loading={loading}
                  error={error}
                  loadMore={loadMore}
                  hasMore={hasMore}
                  onPhotoClick={(photo) =>
                    console.log('Clicked photo:', photo.id)
                  }
                />
              )}
              {currentLayout === 'carousel' && (
                <CarouselLayout
                  photos={photos}
                  loading={loading}
                  error={error}
                />
              )}
              {currentLayout === 'list' && (
                <ListLayout
                  photos={photos}
                  loading={loading}
                  error={error}
                  loadMore={loadMore}
                  hasMore={hasMore}
                  onPhotoClick={(photo) =>
                    console.log('Clicked photo:', photo.id)
                  }
                />
              )}
              {currentLayout === 'cards' && (
                <CardsLayout
                  photos={photos}
                  loading={loading}
                  error={error}
                  loadMore={loadMore}
                  hasMore={hasMore}
                  onPhotoClick={(photo) =>
                    console.log('Clicked photo:', photo.id)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
