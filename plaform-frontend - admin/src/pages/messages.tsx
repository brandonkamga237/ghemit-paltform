import { useCallback, useEffect, useState } from "react"
import { EyeIcon, SearchIcon } from "lucide-react"
import { api } from "@/lib/api"
import type { ContactMessage, MessagesSummary, Page } from "@/lib/types"
import { fmtDate, fmtDateTime, useDebounced } from "@/lib/inbox"
import { Pagination } from "@/components/admin/pagination"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MessagesPage() {
  const [page, setPage] = useState<Page<ContactMessage> | null>(null)
  const [summary, setSummary] = useState<MessagesSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [read, setRead] = useState("all")
  const [q, setQ] = useState("")
  const [pageNo, setPageNo] = useState(0)
  const [size, setSize] = useState(20)
  const debouncedQ = useDebounced(q)

  const [open, setOpen] = useState<ContactMessage | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(pageNo))
      params.set("size", String(size))
      if (read === "unread") params.set("read", "false")
      if (read === "read") params.set("read", "true")
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim())
      const [p, s] = await Promise.all([
        api.get<Page<ContactMessage>>(`/api/admin/messages?${params}`),
        api.get<MessagesSummary>("/api/admin/messages/summary"),
      ])
      setPage(p)
      setSummary(s)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [pageNo, size, read, debouncedQ])

  useEffect(() => {
    void refresh()
  }, [refresh])
  useEffect(() => {
    setPageNo(0)
  }, [read, debouncedQ, size])

  const update = async (id: string, patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<ContactMessage>(`/api/admin/messages/${id}`, patch)
      setPage((p) =>
        p ? { ...p, content: p.content.map((m) => (m.id === id ? updated : m)) } : p
      )
      setOpen((o) => (o?.id === id ? updated : o))
      return updated
    } catch (e) {
      toast.add({
        title: "Mise à jour impossible",
        description: e instanceof Error ? e.message : undefined,
      })
      return null
    }
  }

  const remove = async (id: string) => {
    try {
      await api.del(`/api/admin/messages/${id}`)
      setPage((p) =>
        p
          ? {
              ...p,
              content: p.content.filter((m) => m.id !== id),
              totalElements: p.totalElements - 1,
            }
          : p
      )
      setOpen(null)
      toast.add({ title: "Message supprimé" })
      void refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const openDetail = async (m: ContactMessage) => {
    setOpen(m)
    if (!m.readFlag) {
      const updated = await update(m.id, { readFlag: true })
      if (updated) setOpen(updated)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Messages de contact
        </h1>
        <p className="text-[15px] text-ink-muted">
          Messages reçus via le formulaire de contact et les demandes de
          partenariat.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher nom, e-mail, objet, message…"
            className="pl-9"
          />
        </div>
        <Select value={read} onValueChange={(v) => setRead(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="unread">Non lus</SelectItem>
            <SelectItem value="read">Lus</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[13px] text-muted-foreground">
          {summary
            ? `${summary.unread} non lu${summary.unread > 1 ? "s" : ""} / ${summary.total}`
            : "…"}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] pl-6" />
                <TableHead>Date</TableHead>
                <TableHead>Expéditeur</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Aperçu</TableHead>
                <TableHead className="w-[60px] pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : (page?.content.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Aucun message ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              ) : (
                page?.content.map((m) => (
                  <TableRow key={m.id} className={m.readFlag ? "" : "bg-primary/[0.03]"}>
                    <TableCell className="pl-6">
                      {!m.readFlag && (
                        <span className="block size-2 rounded-full bg-gehmit" title="Non lu" />
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDate(m.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={m.readFlag ? "" : "font-semibold"}>
                          {m.name || "—"}
                        </span>
                        <span className="text-[13px] text-muted-foreground">{m.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{m.subject || "—"}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-[13px] text-muted-foreground">
                      {m.message}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void openDetail(m)}
                        aria-label="Ouvrir"
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        pageNo={pageNo}
        size={size}
        onPage={setPageNo}
        onSize={setSize}
      />

      {/* Détail message */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{open?.subject || "Message"}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="flex flex-col gap-4">
              <div className="text-[14px] text-muted-foreground">
                {open.name || "Anonyme"} — {open.email} — {fmtDateTime(open.createdAt)}
              </div>
              <p className="whitespace-pre-wrap rounded-md bg-muted p-4 text-[15px] leading-relaxed">
                {open.message}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={`mailto:${open.email}?subject=Re: ${open.subject ?? "Votre message"}`}
                    />
                  }
                >
                  Répondre par e-mail
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void update(open.id, { readFlag: !open.readFlag })}
                >
                  {open.readFlag ? "Marquer non lu" : "Marquer lu"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le message de {open?.name || open?.email} sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setConfirmDelete(false)
                  if (open) void remove(open.id)
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </div>
  )
}
