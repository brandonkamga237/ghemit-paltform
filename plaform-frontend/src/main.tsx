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

// Développement uniquement : sélecteur de jeu de données (break-ui).
if (import.meta.env.DEV) {
  void import("./dev/data-toggle").then(({ DataToggle }) => {
    const host = document.createElement("div")
    document.body.appendChild(host)
    createRoot(host).render(<DataToggle />)
  })
}
