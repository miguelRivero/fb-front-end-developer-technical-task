import { useEffect } from 'react'
import './App.css'
import styles from './App.module.css'
import { usePhotos } from './presentation/hooks/usePhotos'
import { useLayout } from './presentation/hooks/useLayout'

function App() {
  const { photos, loading, error, fetchPhotos } = usePhotos()
  const { currentLayout } = useLayout()

  useEffect(() => {
    // Initial fetch on mount
    fetchPhotos('nature')
  }, [fetchPhotos])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Photo Gallery App</h1>
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
      </div>
    </div>
  )
}

export default App
