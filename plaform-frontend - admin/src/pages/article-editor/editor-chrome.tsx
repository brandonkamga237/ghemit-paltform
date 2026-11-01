import type { MouseEvent, ReactNode } from "react"
import { Link } from "react-router"
import { ArrowLeftIcon, EyeIcon, PencilLineIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import type { ArticleEditor, LocalCopy } from "./use-article-doc"

const timeFmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

const relative = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return min < 1 ? "à l'instant" : min < 60 ? `il y a ${min} min` : `le ${new Date(iso).toLocaleString("fr-FR")}`
}

function statusText(ed: ArticleEditor) {
  if (ed.saveState === "saving") return "Enregistrement…"
  if (ed.saveState === "error") return "Échec de l'enregistrement"
  if (ed.dirty) return "Modifications non enregistrées"
  if (ed.savedAt) return `Enregistré à ${timeFmt(ed.savedAt)}`
  return ed.item ? "À jour" : "Nouveau"
}

/** Barre du haut : retour, statut et état d'enregistrement, longueur, aperçu, réglages, publication. */
export function EditorHeader({
  editor: ed,
  preview,
  settingsOpen,
  onTogglePreview,
  onOpenSettings,
}: {
  editor: ArticleEditor
  preview: boolean
  settingsOpen: boolean
  onTogglePreview: () => void
  onOpenSettings: () => void
}) {
  const published = ed.doc.status === "published"
  const leave = (e: MouseEvent) => {
    if (ed.dirty && !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) e.preventDefault()
  }
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 sm:px-6">
        <Link
          to="/articles"
          onClick={leave}
          className="inline-flex items-center gap-2 rounded-sm px-2 py-1.5 text-small font-semibold text-ink hover:bg-surface-alt"
        >
          <ArrowLeftIcon className="size-4" />
          <span className="max-sm:sr-only">Articles</span>
        </Link>
        <span aria-hidden className="h-5 w-px bg-line-strong" />
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-small">
          <span className={cn("inline-flex shrink-0 items-center gap-1.5 font-semibold", published ? "text-gehmit" : "text-ink-muted")}>
            <span className={cn("size-2 rounded-full", published ? "bg-gehmit" : "bg-ink-faint")} />
            {published ? "Publié" : "Brouillon"}
          </span>
          <span className={cn("truncate", ed.saveState === "error" ? "text-destructive" : "text-ink-muted")} aria-live="polite">
            · {statusText(ed)}
          </span>
        </div>
        <span className="tnum hidden text-caption text-ink-muted md:inline">
          {ed.words.toLocaleString("fr-FR")} mots · {ed.minutes} min
        </span>
        <div className="flex items-center gap-1.5">
          <IconButton label={preview ? "Revenir à l'écriture" : "Aperçu"} active={preview} onClick={onTogglePreview}>
            {preview ? <PencilLineIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
          </IconButton>
          <IconButton label="Réglages" active={settingsOpen} onClick={onOpenSettings}>
            <SlidersHorizontalIcon className="size-[18px]" />
          </IconButton>
          {!published && (
            <button
              type="button"
              onClick={() => void ed.save("draft")}
              disabled={ed.saveState === "saving" || (!ed.dirty && !!ed.item)}
              className="hidden h-9 items-center rounded-sm px-3 text-small font-semibold text-ink hover:bg-surface-alt disabled:text-ink-faint disabled:hover:bg-transparent sm:inline-flex"
            >
              Enregistrer
            </button>
          )}
          <button
            type="button"
            onClick={() => void ed.save("published")}
            disabled={ed.saveState === "saving" || (published && !ed.dirty)}
            className="inline-flex h-9 items-center rounded-sm bg-gehmit px-4 text-small font-semibold text-surface transition-colors hover:bg-gehmit-hover disabled:opacity-50"
          >
            {published ? "Mettre à jour" : "Publier"}
          </button>
        </div>
      </div>
    </header>
  )
}

/** Proposition de restaurer une copie locale plus récente que la version enregistrée. */
export function RestoreBanner({
  copy,
  onRestore,
  onDismiss,
}: {
  copy: LocalCopy
  onRestore: () => void
  onDismiss: () => void
}) {
  return (
    <div className="border-b border-gehmit/30 bg-surface-tint">
      <div className="mx-auto box-content flex max-w-text flex-wrap items-center justify-between gap-3 px-gutter py-3 text-small text-ink">
        <span>Une version non enregistrée de cet article existe sur ce poste ({relative(copy.at)}).</span>
        <span className="flex gap-4">
          <button type="button" className="font-semibold text-gehmit hover:underline" onClick={onRestore}>
            Restaurer
          </button>
          <button type="button" className="font-semibold text-ink-muted hover:underline" onClick={onDismiss}>
            Ignorer
          </button>
        </span>
      </div>
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
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-sm text-ink transition-colors hover:bg-surface-alt",
        active && "bg-surface-alt"
      )}
    >
      {children}
    </button>
  )
}
