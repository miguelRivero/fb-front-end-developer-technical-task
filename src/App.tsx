import './App.scss'

import { CardsLayout } from './presentation/components/layouts/CardsLayout'
import { CarouselLayout } from './presentation/components/layouts/CarouselLayout'
import { DEFAULT_SEARCH_QUERY } from './constants'
import { EmptyState } from './presentation/components/common/EmptyState/EmptyState'
import { ErrorBoundary } from './presentation/components/ErrorBoundary'
import { GridLayout } from './presentation/components/layouts/GridLayout'
import { LayoutSwitcher } from './presentation/components/LayoutSwitcher'
import { ListLayout } from './presentation/components/layouts/ListLayout'
import { PhotoPlaceholderIcon } from '@/presentation/components/common/icons'
import { ScrollToTopButton } from './presentation/components/common/ScrollToTopButton/ScrollToTopButton'
import styles from './App.module.scss'
import { useEffect } from 'react'
import { useLayout } from './presentation/hooks/useLayout'
import { usePhotos } from './presentation/hooks/usePhotos'

function App() {
  const { photos, loading, loadingMore, error, fetchPhotos, loadMore, hasMore } = usePhotos()
  const { currentLayout } = useLayout()

  useEffect(() => {
    // Initial fetch on mount
    fetchPhotos(DEFAULT_SEARCH_QUERY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Fixed Header */}
        <div className={`${styles.header} bg-background border-b border-border`}>
          <div className={styles.headerContainer}>
            <header className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <PhotoPlaceholderIcon
                    className="w-6 h-6 text-primary-foreground"
                  />
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
          <div
            className={styles.layoutContainer}
            data-testid="app-layout-container"
          >
            <div
              key={currentLayout}
              className={`${styles.layoutWrapper} ${styles[`layout-${currentLayout}`]}`}
            >
              {currentLayout === 'grid' && (
                <ErrorBoundary
                  fallback={
                    <EmptyState
                      error={
                        new Error('An error occurred while rendering the grid layout')
                      }
                    />
                  }
                >
                  <GridLayout
                    photos={photos}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    loadMore={loadMore}
                    hasMore={hasMore}
                    onPhotoClick={(photo) => {
                      if (import.meta.env.DEV) {
                        console.log('Clicked photo:', photo.id)
                      }
                    }}
                  />
                </ErrorBoundary>
              )}
              {currentLayout === 'carousel' && (
                <ErrorBoundary
                  fallback={
                    <EmptyState
                      error={
                        new Error('An error occurred while rendering the carousel layout')
                      }
                    />
                  }
                >
                  <CarouselLayout
                    photos={photos}
                    loading={loading}
                    error={error}
                  />
                </ErrorBoundary>
              )}
              {currentLayout === 'list' && (
                <ErrorBoundary
                  fallback={
                    <EmptyState
                      error={
                        new Error('An error occurred while rendering the list layout')
                      }
                    />
                  }
                >
                  <ListLayout
                    photos={photos}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    loadMore={loadMore}
                    hasMore={hasMore}
                    onPhotoClick={(photo) => {
                      if (import.meta.env.DEV) {
                        console.log('Clicked photo:', photo.id)
                      }
                    }}
                  />
                </ErrorBoundary>
              )}
              {currentLayout === 'cards' && (
                <ErrorBoundary
                  fallback={
                    <EmptyState
                      error={
                        new Error('An error occurred while rendering the cards layout')
                      }
                    />
                  }
                >
                  <CardsLayout
                    photos={photos}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    loadMore={loadMore}
                    hasMore={hasMore}
                    onPhotoClick={(photo) => {
                      if (import.meta.env.DEV) {
                        console.log('Clicked photo:', photo.id)
                      }
                    }}
                  />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>

        <ScrollToTopButton />
      </div>
    </ErrorBoundary>
  )
}

export default App
