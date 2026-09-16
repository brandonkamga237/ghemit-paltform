import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { fetchRemoteContent } from './lib/api'
import { applyRemoteContent } from './data/content'

async function bootstrap() {
  const remote = await fetchRemoteContent()
  if (remote) applyRemoteContent(remote)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
