import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadRemoteContent } from './data/remote'

// Le site s'affiche immédiatement ; le contenu administré arrive en tâche de fond.
loadRemoteContent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
