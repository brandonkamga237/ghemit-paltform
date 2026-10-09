import type { DevDataset } from "./fixtures"

const KEY = "gehmit-dev-data"
const SETS: DevDataset[] = ["demo", "worst", "empty", "one"]

/**
 * Jeu de données de développement choisi (`?data=worst`, mémorisé pour la
 * session). Toujours null en production : le code appelant est éliminé du
 * build grâce à `import.meta.env.DEV`.
 */
export function devDataset(): DevDataset | null {
  if (!import.meta.env.DEV) return null
  const fromUrl = new URLSearchParams(window.location.search).get("data")
  if (fromUrl && (SETS as string[]).includes(fromUrl)) {
    sessionStorage.setItem(KEY, fromUrl)
    return fromUrl as DevDataset
  }
  const stored = sessionStorage.getItem(KEY)
  return stored && (SETS as string[]).includes(stored) ? (stored as DevDataset) : null
}

export function setDevDataset(set: DevDataset | null) {
  if (set) sessionStorage.setItem(KEY, set)
  else sessionStorage.removeItem(KEY)
  const url = new URL(window.location.href)
  url.searchParams.delete("data")
  window.location.replace(url.toString())
}
