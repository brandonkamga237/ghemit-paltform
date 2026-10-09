import { useCallback, useEffect, useRef, useState } from "react"
import {
  CopyIcon,
  FolderIcon,
  FolderPlusIcon,
  ImageIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { cn } from "@/lib/cn"
import { API_URL, api } from "@/lib/api"
import type { MediaFile } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

const ALL = "__all__"
const ROOT = "__root__"

export function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [folder, setFolder] = useState<string>(ALL)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [folderDialog, setFolderDialog] = useState(false)
  const [newFolder, setNewFolder] = useState("")
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [preview, setPreview] = useState<MediaFile | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      const [files, dirs] = await Promise.all([
        api.get<MediaFile[]>("/api/admin/media"),
        api.get<string[]>("/api/admin/media/folders"),
      ])
      setMedia(files)
      setFolders(dirs)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const query = q.trim().toLowerCase()
  const visible = media
    .filter((m) =>
      folder === ALL ? true : folder === ROOT ? !m.folder : m.folder === folder
    )
    .filter((m) => !query || m.filename.toLowerCase().includes(query))

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      // Dans un dossier précis : le fichier y est rangé directement.
      fd.append("folder", folder === ALL || folder === ROOT ? "" : folder)
      await api.post("/api/admin/media", fd)
      toast.add({ title: "Fichier téléversé" })
      await refresh()
    } catch (e) {
      toast.add({
        title: "Téléversement impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const remove = async (id: string) => {
    try {
      await api.del(`/api/admin/media/${id}`)
      await refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const createFolder = async () => {
    const name = newFolder.trim()
    if (!name) return
    try {
      await api.post("/api/admin/media/folders", { name })
      toast.add({ title: `Dossier « ${name} » créé` })
      setNewFolder("")
      setFolderDialog(false)
      setFolder(name)
      await refresh()
    } catch (e) {
      toast.add({
        title: "Création impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const deleteFolder = async () => {
    if (!deletingFolder) return
    try {
      await api.del(`/api/admin/media/folders/${encodeURIComponent(deletingFolder)}`)
      toast.add({
        title: `Dossier « ${deletingFolder} » supprimé`,
        description: "Les fichiers ont été déplacés à la racine.",
      })
      setDeletingFolder(null)
      setFolder(ALL)
      await refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const uploadMany = async (files: FileList | File[]) => {
    for (const f of Array.from(files)) await upload(f)
  }

  const copy = (url: string) => {
    void navigator.clipboard
      .writeText(`${API_URL}${url}`)
      .then(() => toast.add({ title: "URL copiée", description: url }))
  }

  return (
    <div
      className="relative flex flex-col gap-group"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files.length) void uploadMany(e.dataTransfer.files)
      }}
    >
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-navy/40">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-surface bg-navy px-10 py-8 text-surface shadow-2xl">
            <UploadIcon className="size-8" />
            <span className="text-body font-semibold">Déposez les fichiers pour les téléverser</span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
            Médiathèque
          </h1>
          <p className="text-small text-ink-muted">
            Organisez vos images et fichiers en dossiers. Ils sont réutilisables
            dans les articles, partenaires et pages du site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setFolderDialog(true)}>
            <FolderPlusIcon className="size-4" />
            Nouveau dossier
          </Button>
          <Button
            className="gap-2"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon className="size-4" />
            {uploading ? "Téléversement…" : "Téléverser"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
      </div>

      {/* Dossiers + recherche */}
      <div className="flex flex-wrap items-center gap-2">
        <FolderChip active={folder === ALL} onClick={() => setFolder(ALL)} label="Tous" />
        <FolderChip active={folder === ROOT} onClick={() => setFolder(ROOT)} label="Racine" />
        {folders.map((f) => (
          <span key={f} className="group inline-flex items-center">
            <FolderChip active={folder === f} onClick={() => setFolder(f)} label={f} icon />
            <button
              type="button"
              onClick={() => setDeletingFolder(f)}
              aria-label={`Supprimer le dossier ${f}`}
              className="ml-1 hidden rounded-full p-1 text-muted-foreground hover:text-destructive group-hover:inline-flex"
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </span>
        ))}
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-[260px]">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un fichier…"
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
          {error}
        </div>
      )}

      {visible.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-5 py-section text-center">
          <ImageIcon className="size-8 text-ink-faint" />
          <p className="text-small text-ink-muted">
            {query
              ? `Aucun fichier ne correspond à « ${q} ».`
              : "Aucun fichier ici. Téléversez ou déposez une image pour commencer."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((m) => (
            <Card key={m.id} className="group overflow-hidden">
              <button
                type="button"
                onClick={() => setPreview(m)}
                className="flex h-36 w-full items-center justify-center bg-muted transition-opacity group-hover:opacity-90"
              >
                {m.contentType?.startsWith("image/") ? (
                  <img
                    src={`${API_URL}${m.url}`}
                    alt={m.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-caption text-muted-foreground">
                    {m.contentType ?? "fichier"}
                  </span>
                )}
              </button>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="truncate text-small font-medium" title={m.filename}>
                  {m.filename}
                </span>
                <span className="text-caption text-muted-foreground">
                  {(m.size / 1024).toFixed(0)} Ko
                  {m.folder ? ` · ${m.folder}` : ""}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => copy(m.url)}
                  >
                    <CopyIcon className="size-3.5" />
                    Copier l'URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void remove(m.id)}
                    aria-label="Supprimer"
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aperçu */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{preview?.filename}</DialogTitle>
            <DialogDescription>
              {(preview?.size ?? 0) > 0 &&
                `${Math.round((preview!.size / 1024) * 10) / 10} Ko · ${preview?.contentType ?? "fichier"}${preview?.folder ? ` · ${preview.folder}` : ""}`}
            </DialogDescription>
          </DialogHeader>
          {preview?.contentType?.startsWith("image/") ? (
            <img
              src={`${API_URL}${preview.url}`}
              alt={preview.filename}
              className="max-h-[60vh] w-full rounded-md object-contain bg-muted"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md bg-muted text-muted-foreground">
              Aperçu indisponible — {preview?.contentType}
            </div>
          )}
          <DialogFooter>
            {preview && (
              <Button variant="outline" className="gap-1.5" onClick={() => copy(preview.url)}>
                <CopyIcon className="size-4" />Copier l'URL
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Création de dossier */}
      <Dialog open={folderDialog} onOpenChange={setFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>
              Ex. « articles », « partenaires », « événements ».
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="new-folder-name">Nom du dossier</Label>
            <Input
              id="new-folder-name"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="articles"
              onKeyDown={(e) => {
                if (e.key === "Enter") void createFolder()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => void createFolder()} disabled={!newFolder.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression de dossier */}
      <AlertDialog open={!!deletingFolder} onOpenChange={(o) => !o && setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deletingFolder} » sera supprimé. Les fichiers qu'il contient ne
              sont pas effacés : ils sont déplacés à la racine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteFolder()}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FolderChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:border-primary/60"
      )}
    >
      {icon && <FolderIcon className="size-3.5" />}
      {label}
    </button>
  )
}
