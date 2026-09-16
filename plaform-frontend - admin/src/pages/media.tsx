import { useCallback, useEffect, useRef, useState } from "react"
import { CopyIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { API_URL, api } from "@/lib/api"
import type { MediaFile } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      setMedia(await api.get<MediaFile[]>("/api/admin/media"))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
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
            Fichiers stockés sur MinIO. Copiez l'URL pour l'utiliser dans le contenu.
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon className="size-4" />
          {uploading ? "Téléversement…" : "Téléverser"}
        </Button>
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

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      {media.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed px-5 py-16 text-center text-ink-muted">
          Aucun média. Téléversez une image pour commencer.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
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
    </div>
  )
}
