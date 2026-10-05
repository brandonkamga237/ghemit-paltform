import { useEffect } from "react"

const DEFAULT_TITLE = "Gehmit — Votre place dans le numérique"

/**
 * Titre et description propres à la page courante : chaque écran a une
 * identité référençable au lieu de partager le <title> global.
 */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const prevDesc = desc?.content ?? null

    document.title = title ? `${title} — Gehmit` : DEFAULT_TITLE
    if (description && desc) {
      desc.content = description
    }

    return () => {
      document.title = prevTitle
      if (description && desc && prevDesc !== null) {
        desc.content = prevDesc
      }
    }
  }, [title, description])
}
