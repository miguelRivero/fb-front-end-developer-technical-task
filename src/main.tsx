import './index.scss'

import App from './App.tsx'
import { createPhotoRepository } from './infrastructure/repositories'
import { LayoutProvider } from './presentation/context/LayoutContext'
import { PhotoProvider } from './presentation/context/PhotoContext'
import { PhotoUseCasesProvider } from './presentation/context/PhotoUseCasesContext'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const photoRepository = createPhotoRepository()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhotoUseCasesProvider photoRepository={photoRepository}>
      <PhotoProvider>
        <LayoutProvider>
          <App />
        </LayoutProvider>
      </PhotoProvider>
    </PhotoUseCasesProvider>
  </StrictMode>
)
