import { useMemo, useSyncExternalStore } from "react"
import {
  programs as staticPrograms,
  type ArticleSummary,
  type EventItem,
  type Formation,
  type Partner,
  type Program,
  type ProgramStatusUpdate,
} from "@/data/content"
import { API_URL } from "@/lib/api"

/**
 * Contenu administré, chargé depuis l'API après le premier rendu.
 * Le site reste entièrement visible sans attendre le réseau ; les sections
 * dynamiques (articles, formations, partenaires, statuts) se remplissent
 * dès la réponse. Un cache local de 5 minutes évite le flash au retour.
 */
export interface RemoteContent {
  programs?: ProgramStatusUpdate[]
  formations?: Formation[]
  articles?: ArticleSummary[]
  events?: EventItem[]
  partners?: Partner[]
}

const CACHE_KEY = "gehmit-content-v1"
const CACHE_TTL_MS = 5 * 60 * 1000

function readCache(): RemoteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, content } = JSON.parse(raw) as { at: number; content: RemoteContent }
    return Date.now() - at < CACHE_TTL_MS ? content : null
  } catch {
    return null
  }
}

let content: RemoteContent | null = readCache()
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot(): RemoteContent | null {
  return content
}

/** Lance (une fois) le chargement du contenu administré. À appeler au démarrage. */
export function loadRemoteContent(): void {
  void fetch(`${API_URL}/api/public/content`)
    .then((res) => (res.ok ? (res.json() as Promise<RemoteContent>) : null))
    .then((data) => {
      content = data ?? {}
      if (!data) {
        listeners.forEach((fn) => fn())
        return
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), content: data }))
      } catch {
        // stockage indisponible : le contenu reste en mémoire
      }
      listeners.forEach((fn) => fn())
    })
    .catch(() => {
      // API injoignable : le site fonctionne, les sections dynamiques restent vides
      // plutôt que d'afficher un chargement sans fin.
      content ??= {}
      listeners.forEach((fn) => fn())
    })
}

export function useRemoteContent(): RemoteContent | null {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** Programmes statiques, avec le statut administré appliqué par-dessus. */
export function usePrograms(): Program[] {
  const remote = useRemoteContent()
  return useMemo(() => {
    const updates = remote?.programs
    if (!updates?.length) return staticPrograms
    const bySlug = new Map(updates.map((u) => [u.slug, u]))
    return staticPrograms.map((p) => {
      const u = bySlug.get(p.slug)
      if (!u) return p
      return {
        ...p,
        status: u.status ?? p.status,
        statusLabel: u.statusLabel ?? p.statusLabel,
        primaryCta: u.status === "closed" || u.status === "archived"
          ? { ...p.primaryCta, disabled: true }
          : { ...p.primaryCta, disabled: undefined },
      }
    })
  }, [remote])
}

export function useArticleSummaries(): ArticleSummary[] | null {
  return useRemoteContent()?.articles ?? null
}

export function useEvents(): EventItem[] | null {
  return useRemoteContent()?.events ?? null
}

export function useFormations(): Formation[] | null {
  return useRemoteContent()?.formations ?? null
}

export function usePartners(): Partner[] {
  return useRemoteContent()?.partners ?? []
}

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

/** Date d'affichage : ISO `publishedAt` formatée, sinon le champ libre historique. */
export function articleDate(a: { publishedAt?: string; date?: string }): string {
  if (a.publishedAt) {
    const m = a.publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${Number(m[3])} ${MONTHS_SHORT[Number(m[2]) - 1]} ${m[1]}`
  }
  return a.date ?? ""
}
