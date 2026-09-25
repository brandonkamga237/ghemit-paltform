import { useCallback, useEffect, useRef, useState } from "react"
import {
  CopyIcon,
  FolderIcon,
  FolderPlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { cn } from "cn"
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

  const visible = media.filter((m) =>
    folder === ALL ? true : folder === ROOT ? !m.folder : m.folder === folder
  )

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

  const copy = (url: string) => {
    void navigator.clipboard
      .writeText(`${API_URL}${url}`)
      .then(() => toast.add({ title: "URL copiée", description: url }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
            Médiathèque
          </h1>
          <p className="text-[15px] text-ink-muted">
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

      {/* Dossiers */}
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
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      {visible.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed px-5 py-16 text-center text-ink-muted">
          Aucun fichier ici. Téléversez une image pour commencer.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="flex h-36 items-center justify-center bg-muted">
                {m.contentType?.startsWith("image/") ? (
                  <img
                    src={`${API_URL}${m.url}`}
                    alt={m.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[13px] text-muted-foreground">
                    {m.contentType ?? "fichier"}
                  </span>
                )}
              </div>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="truncate text-[14px] font-medium" title={m.filename}>
                  {m.filename}
                </span>
                <span className="text-[12px] text-muted-foreground">
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
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
