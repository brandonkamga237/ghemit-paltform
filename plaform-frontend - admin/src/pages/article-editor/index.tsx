import { useState } from "react"
import { Link, useParams } from "react-router"
import { mediaSrc } from "@/lib/api"
import { toast } from "@gehmit/ui/components/toast"
import { MediaPicker } from "@/components/admin/media-picker"
import { ArticlePreview } from "@/components/admin/editor/article-preview"
import { SettingsPanel } from "@/components/admin/editor/settings-panel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@gehmit/ui/components/alert-dialog"
import { useArticleDoc } from "./use-article-doc"
import { EditorHeader, RestoreBanner } from "./editor-chrome"
import { ArticleBody } from "./article-body"

/** Largeur minimale conseillée d'une couverture (affichée jusqu'à 1 040 px). */
const COVER_MIN_WIDTH = 1200

/** Prévient si la couverture choisie sera montrée petite. */
function warnIfLowResolution(url: string) {
  const probe = new Image()
  probe.onload = () => {
    if (probe.naturalWidth < COVER_MIN_WIDTH) {
      toast.add({
        title: "Image de faible définition",
        description: `${probe.naturalWidth} px de large : elle sera affichée entière, sans agrandissement. Préférez une image d'au moins ${COVER_MIN_WIDTH.toLocaleString("fr-FR")} px.`,
      })
    }
  }
  probe.src = mediaSrc(url)
}

/**
 * Rédaction d'un article en pleine page, à la manière de Medium : on écrit
 * dans la typographie du site, les réglages sont dans un panneau à part, et
 * l'aperçu montre la page telle qu'elle sera publiée. L'état vit dans
 * `useArticleDoc`.
 */
export function ArticleEditorPage() {
  const { id: routeId } = useParams()
  const id = routeId === "nouveau" ? undefined : routeId
  const [preview, setPreview] = useState(false)
  const [settings, setSettings] = useState(false)
  const [coverPicker, setCoverPicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ed = useArticleDoc(id, { onSlugConflict: () => setSettings(true) })

  if (ed.loadError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-alt px-5 text-center">
        <p className="font-heading text-h2 text-ink">{ed.loadError}</p>
        <Link to="/articles" className="font-semibold text-gehmit hover:underline">
          Revenir aux articles
        </Link>
      </div>
    )
  }

  const published = ed.doc.status === "published"

  return (
    <div className="min-h-svh bg-surface">
      <EditorHeader
        editor={ed}
        preview={preview}
        settingsOpen={settings}
        onTogglePreview={() => setPreview((p) => !p)}
        onOpenSettings={() => setSettings(true)}
      />

      {ed.restore && <RestoreBanner copy={ed.restore} onRestore={ed.acceptRestore} onDismiss={ed.dismissRestore} />}

      {ed.loading ? (
        <div className="mx-auto box-content flex max-w-text flex-col gap-5 px-gutter pt-20" aria-busy="true">
          <div className="h-12 w-3/4 animate-pulse bg-line" />
          <div className="h-6 w-full animate-pulse bg-line/70" />
          <div className="h-6 w-5/6 animate-pulse bg-line/70" />
        </div>
      ) : preview ? (
        <ArticlePreview doc={ed.doc} minutes={ed.minutes} />
      ) : (
        <ArticleBody editor={ed} onPickCover={() => setCoverPicker(true)} />
      )}

      <SettingsPanel
        open={settings}
        doc={ed.doc}
        categories={ed.categories}
        slugTaken={ed.slugTaken}
        onChange={ed.change}
        onClose={() => setSettings(false)}
        onUnpublish={published && ed.item ? () => void ed.save("draft") : undefined}
        onDelete={ed.item ? () => setConfirmDelete(true) : undefined}
      />

      <MediaPicker
        open={coverPicker}
        onOpenChange={setCoverPicker}
        onSelect={(img) => {
          ed.change({ imageUrl: img.url })
          warnIfLowResolution(img.url)
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {ed.doc.title || "Sans titre"} » sera définitivement supprimé{published ? " et retiré du blog" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void ed.remove()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
