import { useState } from "react"
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  MailOpenIcon,
  MailIcon,
  ReplyIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { PageHeader } from "@/components/admin/page-header"
import { api } from "@/lib/api"
import type { ContactMessage, MessagesSummary, Page } from "@/lib/types"
import { fmtDateTime, useDebounced, timeAgo } from "@/lib/inbox"
import { useResource } from "@/lib/use-resource"
import { Pagination } from "@/components/admin/pagination"
import { toast } from "@gehmit/ui/components/toast"
import { Button } from "@gehmit/ui/components/button"
import { Card } from "@gehmit/ui/components/card"
import { Input } from "@gehmit/ui/components/input"
import { Skeleton } from "@gehmit/ui/components/skeleton"
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
import { SegmentedControl } from "@gehmit/ui/components/segmented-control"

const READ_TABS = [
  { value: "all", label: "Tous" },
  { value: "unread", label: "Non lus" },
  { value: "read", label: "Lus" },
]

export function MessagesPage() {
  // Filtres : tout changement revient à la première page.
  const [read, setReadState] = useState(
    () => new URLSearchParams(window.location.search).get("read") ?? "all"
  )
  const [q, setQState] = useState("")
  const [pageNo, setPageNo] = useState(0)
  const [size, setSizeState] = useState(15)
  const resetting =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPageNo(0)
    }
  const setRead = resetting(setReadState)
  const setQ = resetting(setQState)
  const setSize = resetting(setSizeState)
  const debouncedQ = useDebounced(q)

  const [open, setOpen] = useState<ContactMessage | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const search = debouncedQ.trim()
  const pageRes = useResource(() => {
    const params = new URLSearchParams({ page: String(pageNo), size: String(size) })
    if (read === "unread") params.set("read", "false")
    if (read === "read") params.set("read", "true")
    if (search) params.set("q", search)
    return api.get<Page<ContactMessage>>(`/api/admin/messages?${params}`)
  }, [pageNo, size, read, search])
  const summaryRes = useResource(() => api.get<MessagesSummary>("/api/admin/messages/summary"), [])
  const page = pageRes.data ?? null
  const summary = summaryRes.data ?? null
  const { error, loading } = pageRes

  const update = async (id: string, patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<ContactMessage>(`/api/admin/messages/${id}`, patch)
      pageRes.setData((p) =>
        p ? { ...p, content: p.content.map((m) => (m.id === id ? updated : m)) } : p
      )
      setOpen((o) => (o?.id === id ? updated : o))
      summaryRes.reload()
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
      setOpen(null)
      toast.add({ title: "Message supprimé" })
      pageRes.reload()
      summaryRes.reload()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const select = async (m: ContactMessage) => {
    setOpen(m)
    if (!m.readFlag) {
      const updated = await update(m.id, { readFlag: true })
      if (updated) setOpen(updated)
    }
  }

  const items = page?.content ?? []
  const openIdx = open ? items.findIndex((m) => m.id === open.id) : -1

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Les messages envoyés depuis le formulaire de contact du site."
      />
    <div className="flex h-[calc(100svh-15rem)] min-h-[540px] flex-col gap-4">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Filtrer par lecture"
          value={read}
          onChange={setRead}
          options={READ_TABS.map((t) => (t.value === "unread" ? { ...t, badge: summary?.unread } : t))}
        />
        <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher nom, e-mail, objet…"
            className="pl-9"
          />
        </div>
        <span className="ml-auto text-caption text-muted-foreground">
          {page ? `${page.totalElements} message${page.totalElements > 1 ? "s" : ""}` : "…"}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
          {error}
        </div>
      )}

      {/* Boîte à deux panneaux */}
      <Card className="flex min-h-0 flex-1 overflow-hidden">
        {/* Liste */}
        <div className={cn(
          "flex min-h-0 w-full flex-col border-r lg:w-[360px] lg:shrink-0",
          open && "hidden lg:flex"
        )}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              [0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-2 border-b px-4 py-3.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-section text-center">
                <InboxIcon className="size-8 text-ink-faint" />
                <p className="text-small text-muted-foreground">
                  Aucun message ne correspond aux filtres.
                </p>
              </div>
            ) : (
              items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => void select(m)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors",
                    open?.id === m.id ? "bg-primary/[0.07]" : "hover:bg-muted/60",
                    !m.readFlag && "bg-primary/[0.03]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "flex min-w-0 items-center gap-2 truncate text-small",
                      !m.readFlag ? "font-semibold" : "font-medium text-ink-muted"
                    )}>
                      {!m.readFlag && (
                        <span className="size-2 shrink-0 rounded-full bg-gehmit" />
                      )}
                      {m.name || m.email}
                    </span>
                    <span className="shrink-0 text-caption text-ink-faint">
                      {timeAgo(m.createdAt)}
                    </span>
                  </div>
                  <span className={cn(
                    "truncate text-caption",
                    !m.readFlag ? "font-medium" : "text-muted-foreground"
                  )}>
                    {m.subject || "(sans objet)"}
                  </span>
                  <span className="truncate text-caption text-ink-faint">
                    {m.message}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="border-t px-2 py-1.5">
            <Pagination
              page={page}
              pageNo={pageNo}
              size={size}
              onPage={setPageNo}
              onSize={setSize}
            />
          </div>
        </div>

        {/* Lecture */}
        <div className={cn("flex min-h-0 flex-1 flex-col", !open && "hidden lg:flex")}>
          {open ? (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setOpen(null)}
                  aria-label="Retour à la liste"
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a
                        href={`mailto:${open.email}?subject=Re: ${open.subject ?? "Votre message"}`}
                      />
                    }
                    className="gap-1.5"
                  >
                    <ReplyIcon className="size-3.5" />
                    Répondre
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void update(open.id, { readFlag: !open.readFlag })}
                  >
                    {open.readFlag ? (
                      <><MailIcon className="size-3.5" />Marquer non lu</>
                    ) : (
                      <><MailOpenIcon className="size-3.5" />Marquer lu</>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={openIdx <= 0}
                    onClick={() => openIdx > 0 && void select(items[openIdx - 1])}
                    aria-label="Message précédent"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={openIdx < 0 || openIdx >= items.length - 1}
                    onClick={() => openIdx >= 0 && openIdx < items.length - 1 && void select(items[openIdx + 1])}
                    aria-label="Message suivant"
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete(true)}
                    aria-label="Supprimer"
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="mx-auto flex max-w-2xl flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="font-heading text-h3 font-semibold">
                      {open.subject || "(sans objet)"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
                      <span className="flex size-8 items-center justify-center rounded-full bg-inverse/10 font-semibold text-ink">
                        {(open.name || open.email).charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {open.name || "Anonyme"}
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            &lt;{open.email}&gt;
                          </span>
                        </span>
                        <span>{fmtDateTime(open.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-small whitespace-pre-wrap">
                    {open.message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <MailOpenIcon className="size-8 text-ink-faint" />
              <p className="text-small text-muted-foreground">
                Sélectionnez un message pour le lire.
              </p>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le message de {open?.name || open?.email} sera définitivement
              supprimé.
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
    </div>
    </div>
  )
}
