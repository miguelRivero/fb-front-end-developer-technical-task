import './App.css'

import { GridLayout } from './components/layouts/GridLayout'
import { CarouselLayout } from './components/layouts/CarouselLayout'
import { ListLayout } from './components/layouts/ListLayout'
import { CardsLayout } from './components/layouts/CardsLayout'
import styles from './App.module.css'
import { useEffect } from 'react'
import { useLayout } from './presentation/hooks/useLayout'
import { usePhotos } from './presentation/hooks/usePhotos'

function App() {
  const { photos, loading, error, fetchPhotos } = usePhotos()
  const { currentLayout } = useLayout()

  useEffect(() => {
    // Initial fetch on mount
    fetchPhotos('nature')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Photo Gallery App
        </h1>
        <p className={styles.test}>CSS Modules test</p>

        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p className="text-lg">
            <strong>Layout:</strong> {currentLayout}
          </p>
          <p className="text-lg">
            <strong>Status:</strong>{' '}
            {loading ? 'Loading...' : `${photos.length} photos loaded`}
          </p>
          {error && (
            <p className="text-red-600 mt-2">
              <strong>Error:</strong> {error.message}
            </p>
          )}
        </div>

        {/* Layout Display */}
        <div className="mt-8">
          {currentLayout === 'grid' && (
            <GridLayout
              photos={photos}
              loading={loading}
              error={error}
              onPhotoClick={(photo) => console.log('Clicked photo:', photo.id)}
            />
          )}
          {currentLayout === 'carousel' && (
            <CarouselLayout
              photos={photos}
              loading={loading}
              error={error}
              onPhotoClick={(photo) => console.log('Clicked photo:', photo.id)}
            />
          )}
          {currentLayout === 'list' && (
            <ListLayout
              photos={photos}
              loading={loading}
              error={error}
              onPhotoClick={(photo) => console.log('Clicked photo:', photo.id)}
            />
          )}
          {currentLayout === 'cards' && (
            <CardsLayout
              photos={photos}
              loading={loading}
              error={error}
              onPhotoClick={(photo) => console.log('Clicked photo:', photo.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
