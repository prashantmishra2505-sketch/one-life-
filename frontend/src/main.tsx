import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MapThemeProvider } from './components/map/MapThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MapThemeProvider>
      <App />
    </MapThemeProvider>
  </StrictMode>,
)
