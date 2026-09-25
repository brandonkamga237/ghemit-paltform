import { useCallback, useEffect, useRef, useState } from "react"
import { FolderIcon, ImageIcon, LoaderCircleIcon, UploadIcon } from "lucide-react"
import { cn } from "cn"
import { API_URL, api } from "@/lib/api"
import type { MediaFile } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface PickedImage {
  /** URL publique relative, ex. /api/public/media/<key> */
  url: string
  filename: string
}

/**
 * Boîte de dialogue de sélection d'une image : parcourir la médiathèque
 * (avec dossiers) ou téléverser depuis l'ordinateur.
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (img: PickedImage) => void
}) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [folder, setFolder] = useState<string>("") // "" = tous, "__root__" = racine
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFolder, setUploadFolder] = useState<string>("__root__")
  const [newFolder, setNewFolder] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [files, dirs] = await Promise.all([
        api.get<MediaFile[]>("/api/admin/media"),
        api.get<string[]>("/api/admin/media/folders"),
      ])
      setMedia(files.filter((m) => (m.contentType ?? "").startsWith("image/")))
      setFolders(dirs)
    } catch (e) {
      toast.add({
        title: "Médiathèque inaccessible",
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) void refresh()
  }, [open, refresh])

  const visible = media.filter((m) =>
    folder === "" ? true : folder === "__root__" ? !m.folder : m.folder === folder
  )

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const targetFolder =
        uploadFolder === "__new__" ? newFolder.trim() : uploadFolder === "__root__" ? "" : uploadFolder
      fd.append("folder", targetFolder)
      const created = await api.post<MediaFile>("/api/admin/media", fd)
      toast.add({ title: "Image téléversée" })
      onSelect({ url: created.url, filename: created.filename })
      onOpenChange(false)
    } catch (e) {
      toast.add({
        title: "Téléversement impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choisir une image</DialogTitle>
          <DialogDescription>
            Depuis la médiathèque ou importez-en une nouvelle.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">Médiathèque</TabsTrigger>
            <TabsTrigger value="upload">Depuis ma machine</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex flex-col gap-4">
            {/* Filtre par dossier */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={folder === ""} onClick={() => setFolder("")} label="Tous" />
              <Chip active={folder === "__root__"} onClick={() => setFolder("__root__")} label="Racine" />
              {folders.map((f) => (
                <Chip key={f} active={folder === f} onClick={() => setFolder(f)} label={f} icon />
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : visible.length === 0 ? (
              <p className="rounded-lg border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                Aucune image dans ce dossier — utilisez l'onglet « Depuis ma machine ».
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {visible.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelect({ url: m.url, filename: m.filename })
                      onOpenChange(false)
                    }}
                    className="group flex flex-col gap-1 overflow-hidden rounded-md border text-left transition-colors hover:border-primary"
                  >
                    <span className="flex h-24 items-center justify-center bg-muted">
                      <img
                        src={`${API_URL}${m.url}`}
                        alt={m.filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <span className="truncate px-2 pb-1.5 text-[12px] text-muted-foreground" title={m.filename}>
                      {m.filename}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Dossier de destination</Label>
              <Select value={uploadFolder} onValueChange={(v) => setUploadFolder(v ?? "__root__")}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__root__">Racine</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">Nouveau dossier…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uploadFolder === "__new__" && (
              <div className="flex flex-col gap-1.5">
                <Label>Nom du nouveau dossier</Label>
                <Input
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="Ex. articles"
                />
              </div>
            )}
            <Label
              htmlFor="media-picker-file"
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-5 py-10 text-center transition-colors hover:border-primary",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              {uploading ? (
                <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
              ) : (
                <UploadIcon className="size-6 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {uploading ? "Téléversement…" : "Cliquez pour choisir une image"}
              </span>
            </Label>
            <input
              id="media-picker-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadFolder === "__new__" && !newFolder.trim()}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void upload(f)
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Chip({
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors",
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

/**
 * Champ « image » prêt à l'emploi pour les formulaires : aperçu + boutons.
 */
export function ImageField({
  value,
  onChange,
  label,
  hint,
}: {
  value: string
  onChange: (url: string) => void
  label: string
  hint?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[14px] font-semibold">{label}</Label>
      <div className="flex items-center gap-3">
        <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value ? (
            <img src={`${API_URL}${value}`} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </span>
        <div className="flex flex-col gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            {value ? "Changer l'image" : "Choisir une image"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Retirer
            </Button>
          )}
        </div>
      </div>
      {hint && <span className="text-[13px] text-muted-foreground">{hint}</span>}
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(img) => onChange(img.url)} />
    </div>
  )
}
