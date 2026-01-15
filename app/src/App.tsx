import './App.css'
import styles from './App.module.css'
import { PhotoProvider } from './presentation/context/PhotoContext'

function App() {
  return (
    <PhotoProvider>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-600">Photo Gallery App</h1>
        <p className={styles.test}>CSS Modules test</p>
      </div>
    </PhotoProvider>
  )
}

export default App
