import './index.scss'

import App from './App.tsx'
import { LayoutProvider } from './presentation/context/LayoutContext'
import { PhotoProvider } from './presentation/context/PhotoContext'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhotoProvider>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </PhotoProvider>
  </StrictMode>
)
