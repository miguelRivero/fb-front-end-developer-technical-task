import './index.scss'

import App from './App.tsx'
import { PhotoProvider } from './presentation/context/PhotoContext'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhotoProvider>
      <App />
    </PhotoProvider>
  </StrictMode>
)
