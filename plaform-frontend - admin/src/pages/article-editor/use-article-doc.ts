import { useEffect, useEffectEvent, useMemo, useState, type SetStateAction } from "react"
import { useNavigate } from "react-router"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@gehmit/ui/components/toast"
import {
  docFromPayload,
  emptyDoc,
  payloadFromDoc,
  readingMinutes,
  slugify,
  todayIso,
  wordCount,
  type ArticleDoc,
  type EditorBlock,
} from "@/components/admin/editor/model"

export type SaveState = "idle" | "dirty" | "saving" | "error"

/** Copie locale d'un article non enregistré. */
export interface LocalCopy {
  doc: ArticleDoc
  at: string
}

/** Comparable : ce qui compte pour savoir si le document a changé. */
const fingerprint = (doc: ArticleDoc) => JSON.stringify(payloadFromDoc(doc))

/* ─── Copie de secours dans le navigateur ─── */

const localKey = (id: string | undefined) => `gehmit-article:${id ?? "nouveau"}`

const readLocal = (id: string | undefined): LocalCopy | null => {
  try {
    const raw = localStorage.getItem(localKey(id))
    return raw ? (JSON.parse(raw) as LocalCopy) : null
  } catch {
    return null // stockage local indisponible
  }
}

const writeLocal = (id: string | undefined, doc: ArticleDoc) => {
  try {
    localStorage.setItem(localKey(id), JSON.stringify({ doc, at: new Date().toISOString() }))
  } catch {
    // stockage plein ou désactivé : la sauvegarde serveur reste possible
  }
}

const clearLocal = (id: string | undefined) => {
  try {
    localStorage.removeItem(localKey(id))
  } catch {
    // rien à nettoyer
  }
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : undefined)

/**
 * Un article en cours de rédaction : chargement, état « modifié », copie de
 * secours locale et proposition de restauration, enregistrement (Ctrl/Cmd+S),
 * publication, suppression, alerte avant de quitter.
 */
export function useArticleDoc(id: string | undefined, { onSlugConflict }: { onSlugConflict: () => void }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [others, setOthers] = useState<ContentItem[]>([])
  const [item, setItem] = useState<ContentItem | null>(null)
  const [doc, setDoc] = useState<ArticleDoc>(emptyDoc)
  const [saved, setSaved] = useState<string>(() => fingerprint(emptyDoc()))
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [restore, setRestore] = useState<LocalCopy | null>(null)

  // ─── Chargement ───
  useEffect(() => {
    let alive = true
    api
      .get<ContentItem[]>("/api/admin/content/articles")
      .then((all) => {
        if (!alive) return
        const found = id ? (all.find((a) => a.id === id) ?? null) : null
        if (id && !found) {
          setLoadError("Cet article n'existe plus.")
          return
        }
        const initial = found ? docFromPayload(found.payload, found.slug) : emptyDoc()
        setOthers(all.filter((a) => a.id !== id))
        setItem(found)
        setDoc(initial)
        setSaved(fingerprint(initial))
        // Version locale plus récente que le serveur ?
        const local = readLocal(id)
        if (local) {
          const newer = !found || new Date(local.at) > new Date(found.updatedAt)
          if (newer && fingerprint(local.doc) !== fingerprint(initial)) setRestore(local)
        }
      })
      .catch((e) => alive && setLoadError(errorMessage(e) ?? "Chargement impossible"))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const dirty = !loading && fingerprint(doc) !== saved

  // Copie locale continue (filet de sécurité), après une courte pause.
  useEffect(() => {
    if (!dirty) return
    const t = window.setTimeout(() => writeLocal(id, doc), 800)
    return () => window.clearTimeout(t)
  }, [doc, dirty, id])

  // Avertir avant de quitter avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [dirty])

  /* ─── Édition ─── */

  /** Modifie le document ; le slug suit le titre tant qu'il n'a pas été touché à la main. */
  const change = (patch: Partial<ArticleDoc>) =>
    setDoc((d) => {
      const next = { ...d, ...patch }
      if (patch.title !== undefined && !d.slugTouched) next.slug = slugify(patch.title)
      return next
    })

  const setBlocks = (action: SetStateAction<EditorBlock[]>) =>
    setDoc((d) => ({ ...d, blocks: typeof action === "function" ? action(d.blocks) : action }))

  const categories = useMemo(
    () => [...new Set(others.map((a) => String(a.payload.category ?? "")).filter(Boolean))].sort(),
    [others]
  )
  const slugTaken = !!doc.slug && others.some((a) => (a.payload.slug ?? a.slug) === doc.slug)
  const words = wordCount(doc)

  /* ─── Restauration de la copie locale ─── */

  const acceptRestore = () => {
    if (!restore) return
    // rev + 1 : réinjecte le contenu restauré dans les zones éditables.
    setDoc({ ...restore.doc, blocks: restore.doc.blocks.map((b) => ({ ...b, rev: b.rev + 1 })) })
    setRestore(null)
  }

  const dismissRestore = () => {
    setRestore(null)
    clearLocal(id)
  }

  /* ─── Enregistrement ─── */

  const save = async (status?: ArticleDoc["status"]) => {
    const next: ArticleDoc = { ...doc, status: status ?? doc.status }
    if (!next.title.trim()) {
      toast.add({ title: "Ajoutez un titre avant d'enregistrer." })
      return
    }
    if (!next.slug) next.slug = slugify(next.title)
    if (slugTaken) {
      toast.add({ title: "Ce slug est déjà utilisé", description: "Modifiez-le dans les réglages." })
      onSlugConflict()
      return
    }
    if (next.status === "published" && !next.publishedAt) next.publishedAt = todayIso()

    setSaveState("saving")
    try {
      const body = {
        slug: next.slug,
        position: item?.position ?? others.length,
        payload: payloadFromDoc(next, item?.payload),
      }
      const result = item
        ? await api.put<ContentItem>(`/api/admin/content/${item.id}`, body)
        : await api.post<ContentItem>("/api/admin/content/articles", body)
      setItem(result)
      setDoc(next)
      setSaved(fingerprint(next))
      setSaveState("idle")
      setSavedAt(new Date())
      clearLocal(id)
      if (status === "published" && doc.status !== "published")
        toast.add({ title: "Article publié", description: "Il est visible sur le blog." })
      else if (status === "draft" && doc.status === "published")
        toast.add({ title: "Article retiré du site", description: "Il redevient un brouillon." })
      if (!item) navigate(`/articles/${result.id}`, { replace: true })
    } catch (e) {
      setSaveState("error")
      toast.add({ title: "Enregistrement impossible", description: errorMessage(e) })
    }
  }

  // Ctrl/Cmd + S : enregistre la version courante du document.
  const onSaveShortcut = useEffectEvent(() => void save())
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        onSaveShortcut()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const remove = async () => {
    if (!item) return
    try {
      await api.del(`/api/admin/content/${item.id}`)
      clearLocal(id)
      toast.add({ title: "Article supprimé" })
      navigate("/articles")
    } catch (e) {
      toast.add({ title: "Suppression impossible", description: errorMessage(e) })
    }
  }

  return {
    loading,
    loadError,
    item,
    doc,
    change,
    setBlocks,
    dirty,
    saveState,
    savedAt,
    categories,
    slugTaken,
    words,
    minutes: readingMinutes(words),
    restore,
    acceptRestore,
    dismissRestore,
    save,
    remove,
  }
}

export type ArticleEditor = ReturnType<typeof useArticleDoc>
