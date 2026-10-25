import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeftIcon, EyeIcon, ImagePlusIcon, PencilLineIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, mediaSrc } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { MediaPicker } from "@/components/admin/media-picker"
import { Canvas } from "@/components/admin/editor/canvas"
import { ArticlePreview } from "@/components/admin/editor/article-preview"
import { SettingsPanel } from "@/components/admin/editor/settings-panel"
import {
  docFromPayload,
  emptyDoc,
  newBlock,
  payloadFromDoc,
  readingMinutes,
  slugify,
  todayIso,
  wordCount,
  type ArticleDoc,
  type EditorBlock,
} from "@/components/admin/editor/model"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SaveState = "idle" | "dirty" | "saving" | "error"

const localKey = (id: string | undefined) => `gehmit-article:${id ?? "nouveau"}`
const timeFmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const relative = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return min < 1 ? "à l'instant" : min < 60 ? `il y a ${min} min` : `le ${new Date(iso).toLocaleString("fr-FR")}`
}

/** Comparable : ce qui compte pour savoir si le document a changé. */
const fingerprint = (doc: ArticleDoc) => JSON.stringify(payloadFromDoc(doc))

/**
 * Rédaction d'un article en pleine page, à la manière de Medium : on écrit
 * dans la typographie du site, les réglages sont dans un panneau à part, et
 * l'aperçu montre la page telle qu'elle sera publiée.
 */
export function ArticleEditorPage() {
  const { id: routeId } = useParams()
  const id = routeId === "nouveau" ? undefined : routeId
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [others, setOthers] = useState<ContentItem[]>([])
  const [item, setItem] = useState<ContentItem | null>(null)
  const [doc, setDoc] = useState<ArticleDoc>(emptyDoc)
  const [saved, setSaved] = useState<string>(() => fingerprint(emptyDoc()))
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [preview, setPreview] = useState(false)
  const [settings, setSettings] = useState(false)
  const [coverPicker, setCoverPicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [restore, setRestore] = useState<{ doc: ArticleDoc; at: string } | null>(null)
  const excerptRef = useRef<HTMLTextAreaElement>(null)

  // ─── Chargement ────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    api
      .get<ContentItem[]>("/api/admin/content/articles")
      .then((all) => {
        if (!alive) return
        const found = id ? all.find((a) => a.id === id) ?? null : null
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
        try {
          const raw = localStorage.getItem(localKey(id))
          if (raw) {
            const local = JSON.parse(raw) as { doc: ArticleDoc; at: string }
            const newer = !found || new Date(local.at) > new Date(found.updatedAt)
            if (newer && fingerprint(local.doc) !== fingerprint(initial)) setRestore(local)
          }
        } catch {
          // stockage local indisponible
        }
      })
      .catch((e) => alive && setLoadError(e instanceof Error ? e.message : "Chargement impossible"))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const dirty = !loading && fingerprint(doc) !== saved

  // Sauvegarde locale continue (filet de sécurité), après une courte pause.
  useEffect(() => {
    if (!dirty) return
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(localKey(id), JSON.stringify({ doc, at: new Date().toISOString() }))
      } catch {
        // stockage plein ou désactivé : la sauvegarde serveur reste possible
      }
    }, 800)
    return () => window.clearTimeout(t)
  }, [doc, dirty, id])

  // Avertir avant de quitter avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [dirty])

  const change = useCallback((patch: Partial<ArticleDoc>) => {
    setDoc((d) => {
      const next = { ...d, ...patch }
      if (patch.title !== undefined && !d.slugTouched) next.slug = slugify(patch.title)
      return next
    })
  }, [])

  const setBlocks = useCallback(
    (action: SetStateAction<EditorBlock[]>) =>
      setDoc((d) => ({ ...d, blocks: typeof action === "function" ? action(d.blocks) : action })),
    []
  )

  const categories = useMemo(
    () => [...new Set(others.map((a) => String(a.payload.category ?? "")).filter(Boolean))].sort(),
    [others]
  )
  const slugTaken = !!doc.slug && others.some((a) => (a.payload.slug ?? a.slug) === doc.slug)
  const words = wordCount(doc)
  const minutes = readingMinutes(words)

  // ─── Enregistrement ────────────────────────────────────────────────────────
  const save = async (status?: ArticleDoc["status"]) => {
    const next: ArticleDoc = { ...doc, status: status ?? doc.status }
    if (!next.title.trim()) {
      toast.add({ title: "Ajoutez un titre avant d'enregistrer." })
      return
    }
    if (!next.slug) next.slug = slugify(next.title)
    if (slugTaken) {
      toast.add({ title: "Ce slug est déjà utilisé", description: "Modifiez-le dans les réglages." })
      setSettings(true)
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
      try {
        localStorage.removeItem(localKey(id))
      } catch {
        // rien à nettoyer
      }
      if (status === "published" && doc.status !== "published") toast.add({ title: "Article publié", description: "Il est visible sur le blog." })
      else if (status === "draft" && doc.status === "published") toast.add({ title: "Article retiré du site", description: "Il redevient un brouillon." })
      if (!item) navigate(`/articles/${result.id}`, { replace: true })
    } catch (e) {
      setSaveState("error")
      toast.add({ title: "Enregistrement impossible", description: e instanceof Error ? e.message : undefined })
    }
  }

  // Ctrl/Cmd + S
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        void saveRef.current()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const remove = async () => {
    if (!item) return
    try {
      await api.del(`/api/admin/content/${item.id}`)
      try {
        localStorage.removeItem(localKey(id))
      } catch {
        // rien à nettoyer
      }
      toast.add({ title: "Article supprimé" })
      navigate("/articles")
    } catch (e) {
      toast.add({ title: "Suppression impossible", description: e instanceof Error ? e.message : undefined })
    }
  }

  const leave = (e: React.MouseEvent) => {
    if (dirty && !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) e.preventDefault()
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-5 text-center">
        <p className="font-heading text-h2 text-navy">{loadError}</p>
        <Link to="/articles" className="font-semibold text-gehmit hover:underline">Revenir aux articles</Link>
      </div>
    )
  }

  const published = doc.status === "published"
  const statusText =
    saveState === "saving"
      ? "Enregistrement…"
      : saveState === "error"
        ? "Échec de l'enregistrement"
        : dirty
          ? "Modifications non enregistrées"
          : savedAt
            ? `Enregistré à ${timeFmt(savedAt)}`
            : item
              ? "À jour"
              : "Nouveau"

  return (
    <div className="min-h-svh bg-surface">
      {/* Barre du haut */}
      <header className="sticky top-0 z-30 border-b border-sand bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 sm:px-6">
          <Link
            to="/articles"
            onClick={leave}
            className="inline-flex items-center gap-2 rounded-sm px-2 py-1.5 text-small font-semibold text-navy hover:bg-cream"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="max-sm:sr-only">Articles</span>
          </Link>
          <span aria-hidden className="h-5 w-px bg-sand-dark" />
          <div className="flex min-w-0 flex-1 items-center gap-2.5 text-small">
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 font-semibold",
                published ? "text-gehmit" : "text-ink-muted"
              )}
            >
              <span className={cn("size-2 rounded-full", published ? "bg-gehmit" : "bg-ink-faint")} />
              {published ? "Publié" : "Brouillon"}
            </span>
            <span className={cn("truncate", saveState === "error" ? "text-destructive" : "text-ink-muted")} aria-live="polite">
              · {statusText}
            </span>
          </div>
          <span className="tnum hidden text-caption text-ink-muted md:inline">
            {words.toLocaleString("fr-FR")} mots · {minutes} min
          </span>
          <div className="flex items-center gap-1.5">
            <IconButton label={preview ? "Revenir à l'écriture" : "Aperçu"} active={preview} onClick={() => setPreview((p) => !p)}>
              {preview ? <PencilLineIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
            </IconButton>
            <IconButton label="Réglages" active={settings} onClick={() => setSettings(true)}>
              <SlidersHorizontalIcon className="size-[18px]" />
            </IconButton>
            {!published && (
              <button
                type="button"
                onClick={() => void save("draft")}
                disabled={saveState === "saving" || (!dirty && !!item)}
                className="hidden h-9 items-center rounded-sm px-3 text-small font-semibold text-navy hover:bg-cream disabled:text-ink-faint disabled:hover:bg-transparent sm:inline-flex"
              >
                Enregistrer
              </button>
            )}
            <button
              type="button"
              onClick={() => void save("published")}
              disabled={saveState === "saving" || (published && !dirty)}
              className="inline-flex h-9 items-center rounded-sm bg-gehmit px-4 text-small font-semibold text-surface transition-colors hover:bg-gehmit-hover disabled:opacity-50"
            >
              {published ? "Mettre à jour" : "Publier"}
            </button>
          </div>
        </div>
      </header>

      {restore && (
        <div className="border-b border-gold/40 bg-gold-tint">
          <div className="mx-auto box-content flex max-w-text flex-wrap items-center justify-between gap-3 px-gutter py-3 text-small text-navy">
            <span>Une version non enregistrée de cet article existe sur ce poste ({relative(restore.at)}).</span>
            <span className="flex gap-4">
              <button
                type="button"
                className="font-semibold text-gehmit hover:underline"
                onClick={() => {
                  setDoc({ ...restore.doc, blocks: restore.doc.blocks.map((b) => ({ ...b, rev: b.rev + 1 })) })
                  setRestore(null)
                }}
              >
                Restaurer
              </button>
              <button
                type="button"
                className="font-semibold text-ink-muted hover:underline"
                onClick={() => {
                  setRestore(null)
                  try {
                    localStorage.removeItem(localKey(id))
                  } catch {
                    // rien
                  }
                }}
              >
                Ignorer
              </button>
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mx-auto box-content flex max-w-text flex-col gap-5 px-gutter pt-20" aria-busy="true">
          <div className="h-12 w-3/4 animate-pulse bg-sand" />
          <div className="h-6 w-full animate-pulse bg-sand/70" />
          <div className="h-6 w-5/6 animate-pulse bg-sand/70" />
        </div>
      ) : preview ? (
        <ArticlePreview doc={doc} minutes={minutes} />
      ) : (
        <main className="mx-auto box-content max-w-text px-gutter pt-12 pb-32 md:pt-16">
          {/* Couverture */}
          {doc.imageUrl ? (
            <figure className="group/cover relative mb-12 -mx-5 md:-mx-24">
              <img src={mediaSrc(doc.imageUrl)} alt={doc.imageAlt || ""} className="aspect-[16/8] w-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover/cover:opacity-100 group-focus-within/cover:opacity-100">
                <CoverButton onClick={() => setCoverPicker(true)}>Remplacer</CoverButton>
                <CoverButton onClick={() => change({ imageUrl: "", imageAlt: "" })}>Retirer</CoverButton>
              </div>
            </figure>
          ) : (
            <button
              type="button"
              onClick={() => setCoverPicker(true)}
              className="mb-6 inline-flex items-center gap-2 rounded-sm px-2 py-1.5 text-small text-ink-muted transition-colors hover:bg-cream hover:text-navy"
            >
              <ImagePlusIcon className="size-4" />
              Ajouter une image de couverture
            </button>
          )}

          <textarea
            value={doc.title}
            onChange={(e) => change({ title: e.target.value.replace(/\n/g, " ") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                excerptRef.current?.focus()
              }
            }}
            placeholder="Titre"
            aria-label="Titre de l'article"
            maxLength={140}
            rows={1}
            autoFocus={!item}
            className="w-full resize-none bg-transparent font-heading text-display font-semibold text-navy outline-none [field-sizing:content] placeholder:text-sand-dark"
          />
          <textarea
            ref={excerptRef}
            value={doc.excerpt}
            onChange={(e) => change({ excerpt: e.target.value.replace(/\n/g, " ") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const first = doc.blocks[0]
                if (first) {
                  document.querySelector<HTMLElement>(`[data-block-id="${first.id}"]`)?.focus()
                } else {
                  setBlocks([newBlock("p")])
                }
              }
            }}
            placeholder="Chapô : une ou deux phrases qui donnent envie de lire (aussi affichées sur le blog)"
            aria-label="Chapô"
            maxLength={300}
            rows={1}
            className="mt-4 mb-10 w-full resize-none bg-transparent text-lead text-navy/75 outline-none [field-sizing:content] placeholder:text-ink-faint"
          />

          <Canvas blocks={doc.blocks} setBlocks={setBlocks} />
        </main>
      )}

      <SettingsPanel
        open={settings}
        doc={doc}
        categories={categories}
        slugTaken={slugTaken}
        onChange={change}
        onClose={() => setSettings(false)}
        onUnpublish={published && item ? () => void save("draft") : undefined}
        onDelete={item ? () => setConfirmDelete(true) : undefined}
      />

      <MediaPicker
        open={coverPicker}
        onOpenChange={setCoverPicker}
        onSelect={(img) => {
          change({ imageUrl: img.url })
          // Couverture affichée jusqu'à 1 040 px : prévenir si elle sera montrée petite.
          const probe = new Image()
          probe.onload = () => {
            if (probe.naturalWidth < 1200) {
              toast.add({
                title: "Image de faible définition",
                description: `${probe.naturalWidth} px de large : elle sera affichée entière, sans agrandissement. Préférez une image d'au moins 1 200 px.`,
              })
            }
          }
          probe.src = mediaSrc(img.url)
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {doc.title || "Sans titre"} » sera définitivement supprimé{published ? " et retiré du blog" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void remove()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function IconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-sm text-navy transition-colors hover:bg-cream",
        active && "bg-cream"
      )}
    >
      {children}
    </button>
  )
}

function CoverButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm bg-navy-deep/85 px-3 py-1.5 text-caption font-semibold text-surface backdrop-blur-sm hover:bg-navy-deep"
    >
      {children}
    </button>
  )
}
