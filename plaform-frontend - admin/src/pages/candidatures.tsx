import { useCallback, useEffect, useState } from "react"
import {
  ArchiveIcon,
  CheckSquareIcon,
  Columns3Icon,
  ListIcon,
  MailOpenIcon,
  PaperclipIcon,
  SearchIcon,
  SquareIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"
import { cn } from "@/lib/cn"
import { api, openCv } from "@/lib/api"
import type {
  Candidature,
  CandidaturesSummary,
  CandidatureStatus,
  Page,
} from "@/lib/types"
import {
  candidateEmail,
  candidateName,
  fieldLabel,
  fmtDate,
  fmtDateTime,
  programLabel,
  STATUS_META,
  STATUS_ORDER,
  useDebounced,
} from "@/lib/inbox"
import { Pagination } from "@/components/admin/pagination"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

/** Statuts proposés : le courant + les transitions autorisées par le workflow. */
function allowedOptions(c: Candidature): CandidatureStatus[] {
  const current = (c.status as CandidatureStatus) ?? "new"
  const allowed = c.allowedStatuses ?? STATUS_ORDER
  return [current, ...allowed.filter((s) => s !== current)]
}

const STATUS_COLORS: Record<CandidatureStatus, string> = {
  new: "#2b4c7e",
  in_progress: "#d97706",
  accepted: "#15803d",
  rejected: "#b91c1c",
  archived: "#9ca3af",
}

/* Familles d'espaces : chaque programme est une boîte de réception. */
const SPACE_FAMILIES: { label: string; keys: string[] }[] = [
  { label: "Programmes", keys: ["paei", "mentorat", "glab-sisters", "stage", "formations"] },
  {
    label: "Initiatives",
    keys: ["junior-builders", "caravanes-jeune", "caravanes-entreprise", "rencontre-challenge"],
  },
  { label: "Services", keys: ["louer-developpeur"] },
]

const BOARD_SIZE = 200

const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `il y a ${Math.max(1, Math.floor(s / 60))} min`
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`
  return fmtDate(iso)
}

export function CandidaturesPage() {
  const [page, setPage] = useState<Page<Candidature> | null>(null)
  const [board, setBoard] = useState<Candidature[]>([])
  const [summary, setSummary] = useState<CandidaturesSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [domain, setDomain] = useState(
    () => new URLSearchParams(window.location.search).get("domain") ?? "all"
  )
  const [view, setView] = useState<"board" | "list">("board")
  const [status, setStatus] = useState(
    () => new URLSearchParams(window.location.search).get("status") ?? "all"
  )
  const [q, setQ] = useState("")
  const [pageNo, setPageNo] = useState(0)
  const [size, setSize] = useState(20)
  const debouncedQ = useDebounced(q)

  const [open, setOpen] = useState<Candidature | null>(null)
  const [triage, setTriage] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const listMode = domain === "all" || view === "list"

  /* ─── Chargement ─── */

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await api.get<CandidaturesSummary>("/api/admin/candidatures/summary"))
    } catch {
      /* le récapitulatif est secondaire */
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sort", "createdAt,desc")
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim())
      if (listMode) {
        params.set("page", String(pageNo))
        params.set("size", String(size))
        if (domain !== "all") params.set("program", domain)
        if (status !== "all") params.set("status", status)
        setPage(await api.get<Page<Candidature>>(`/api/admin/candidatures?${params}`))
      } else {
        params.set("page", "0")
        params.set("size", String(BOARD_SIZE))
        params.set("program", domain)
        setBoard((await api.get<Page<Candidature>>(`/api/admin/candidatures?${params}`)).content)
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [pageNo, size, domain, status, debouncedQ, listMode])

  useEffect(() => {
    void refresh()
  }, [refresh])
  useEffect(() => {
    void refreshSummary()
  }, [refreshSummary])
  useEffect(() => {
    setPageNo(0)
    setSelected(new Set())
  }, [domain, status, debouncedQ, size])

  /* ─── Mutations ─── */

  const update = async (id: string, patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<Candidature>(`/api/admin/candidatures/${id}`, patch)
      setPage((p) =>
        p ? { ...p, content: p.content.map((c) => (c.id === id ? updated : c)) } : p
      )
      setBoard((b) => b.map((c) => (c.id === id ? updated : c)))
      setOpen((o) => (o?.id === id ? updated : o))
      void refreshSummary()
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
      await api.del(`/api/admin/candidatures/${id}`)
      setPage((p) =>
        p
          ? { ...p, content: p.content.filter((c) => c.id !== id), totalElements: p.totalElements - 1 }
          : p
      )
      setBoard((b) => b.filter((c) => c.id !== id))
      setOpen(null)
      toast.add({ title: "Candidature supprimée" })
      void refreshSummary()
      if (listMode) void refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const openDetail = async (c: Candidature) => {
    setOpen(c)
    if (!c.readFlag) {
      const updated = await update(c.id, { readFlag: true })
      if (updated) setOpen(updated)
    }
  }

  /* ─── Sélection groupée (liste) ─── */

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const items = page?.content ?? []
  const allSelected = items.length > 0 && selected.size === items.length

  const bulk = async (patch: Record<string, unknown>, label: string) => {
    setBulkBusy(true)
    const results = await Promise.allSettled(
      [...selected].map((id) => api.patch(`/api/admin/candidatures/${id}`, patch))
    )
    const failed = results.filter((r) => r.status === "rejected").length
    toast.add({
      title: failed > 0 ? `${label} — ${selected.size - failed} sur ${selected.size}` : label,
      description: failed > 0 ? `${failed} élément(s) en erreur.` : undefined,
    })
    setSelected(new Set())
    setBulkBusy(false)
    void refresh()
    void refreshSummary()
  }

  /* ─── Board ─── */

  const byStatus = (s: CandidatureStatus) => board.filter((c) => (c.status ?? "new") === s)
  const dragC = dragId ? board.find((c) => c.id === dragId) : null
  const dropAllowed = (s: CandidatureStatus) =>
    !!dragC && (dragC.status === s || (dragC.allowedStatuses ?? []).includes(s))

  const drop = async (s: CandidatureStatus) => {
    if (dragC && dragC.status !== s && dropAllowed(s)) {
      await update(dragC.id, { status: s })
    }
    setDragId(null)
  }

  /* ─── Triage : file des nouvelles ─── */
  const queue = board.filter((c) => (c.status ?? "new") === "new")

  const startTriage = () => {
    setTriage(true)
    if (queue[0]) void openDetail(queue[0])
    else toast.add({ title: "Aucune nouvelle candidature dans cet espace." })
  }

  const decide = async (status: CandidatureStatus) => {
    if (!open) return
    await update(open.id, { status })
    const rest = board.filter((c) => c.id !== open.id && (c.status ?? "new") === "new")
    if (rest[0]) void openDetail(rest[0])
    else {
      setOpen(null)
      setTriage(false)
      toast.add({ title: "File de triage terminée", description: "Toutes les nouvelles candidatures ont été traitées." })
    }
  }

  const newCount = summary ? Object.values(summary.newByProgram).reduce((a, b) => a + b, 0) : 0

  /* ─── Rendu ─── */

  return (
    <div className="flex gap-group">
      {/* Rail des espaces */}
      <aside className="hidden w-52 shrink-0 flex-col gap-1 lg:flex">
        <span className="px-2 pb-2 text-caption font-semibold tracking-wider text-ink-faint uppercase">
          Espaces de réception
        </span>
        <SpaceItem
          active={domain === "all"}
          label="Toutes les candidatures"
          count={summary?.total}
          fresh={newCount}
          onClick={() => setDomain("all")}
        />
        {SPACE_FAMILIES.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5 pt-3">
            <span className="px-2 pb-1 text-caption font-semibold tracking-wider text-ink-faint uppercase">
              {f.label}
            </span>
            {f.keys.map((k) => (
              <SpaceItem
                key={k}
                active={domain === k}
                label={programLabel(k)}
                count={summary?.byProgram?.[k] ?? 0}
                fresh={summary?.newByProgram?.[k] ?? 0}
                onClick={() => setDomain(k)}
              />
            ))}
          </div>
        ))}
      </aside>

      {/* Zone de travail */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.01em]">
              {domain === "all" ? "Toutes les candidatures" : programLabel(domain)}
            </h1>
            <p className="text-caption text-ink-muted">
              {listMode
                ? `${page?.totalElements ?? "…"} élément(s)`
                : `${board.length} candidature${board.length > 1 ? "s" : ""} dans cet espace`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!listMode && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={startTriage}
                disabled={queue.length === 0}
              >
                <ZapIcon className="size-4" />
                Trier {queue.length > 0 && `(${queue.length})`}
              </Button>
            )}
            {domain !== "all" && (
              <div className="flex rounded-lg border p-0.5">
                <button
                  type="button"
                  onClick={() => setView("board")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-caption font-medium transition-colors",
                    view === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Columns3Icon className="size-3.5" />Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-caption font-medium transition-colors",
                    view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ListIcon className="size-3.5" />Liste
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sélecteur d'espace mobile + recherche + filtre statut (liste) */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={domain} onValueChange={(v) => setDomain(v ?? "all")}>
            <SelectTrigger className="w-[210px] lg:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les candidatures</SelectItem>
              {SPACE_FAMILIES.flatMap((f) => f.keys).map((k) => (
                <SelectItem key={k} value={k}>
                  {programLabel(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher nom, e-mail, organisation…"
              className="pl-9"
            />
          </div>
          {listMode && (
            <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
            {error}
          </div>
        )}

        {/* ─── Vue pipeline ─── */}
        {!listMode && (
          <div className="flex items-start gap-3 overflow-x-auto pb-2">
            {STATUS_ORDER.map((s) => {
              const cards = byStatus(s)
              const canDrop = dragId !== null && dropAllowed(s)
              return (
                <div
                  key={s}
                  onDragOver={(e) => {
                    if (canDrop) e.preventDefault()
                  }}
                  onDrop={() => void drop(s)}
                  className={cn(
                    "flex w-[240px] shrink-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2 transition-colors",
                    dragId && canDrop && "border-primary/60 bg-primary/[0.05]",
                    dragId && !canDrop && s !== dragC?.status && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between px-1.5 pt-1">
                    <span className="flex items-center gap-1.5 text-caption font-semibold">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: STATUS_COLORS[s] }}
                      />
                      {STATUS_META[s].label}
                    </span>
                    <span className="text-caption font-medium text-muted-foreground tabular-nums">
                      {cards.length}
                    </span>
                  </div>
                  <div className="flex min-h-[80px] flex-col gap-2">
                    {cards.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        draggable
                        onDragStart={() => setDragId(c.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => void openDetail(c)}
                        className={cn(
                          "flex cursor-grab flex-col gap-1 rounded-lg border bg-card p-3 text-left shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing",
                          dragId === c.id && "opacity-50"
                        )}
                      >
                        <span className="flex items-center gap-1.5 text-small font-semibold">
                          {!c.readFlag && <span className="size-2 shrink-0 rounded-full bg-gehmit" />}
                          <span className="truncate">{candidateName(c)}</span>
                        </span>
                        <span className="truncate text-caption text-muted-foreground">
                          {String(c.form.domaine ?? c.form.poste ?? c.form.projet ?? candidateEmail(c) ?? "—")}
                        </span>
                        <span className="flex items-center gap-2 pt-0.5 text-caption text-ink-faint">
                          {timeAgo(c.createdAt)}
                          {Boolean(c.form.cvUrl) && <PaperclipIcon className="size-3" />}
                          {c.note && <span title="Note interne">•••</span>}
                        </span>
                      </button>
                    ))}
                    {cards.length === 0 && (
                      <p className="px-1.5 py-3 text-caption text-ink-faint">
                        {dragId ? (canDrop ? "Déposer ici" : "Transition non autorisée") : "Vide"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Vue liste ─── */}
        {listMode && (
          <>
            <Card>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[36px] pl-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelected(allSelected ? new Set() : new Set(items.map((c) => c.id)))
                          }
                          aria-label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {allSelected ? (
                            <CheckSquareIcon className="size-4 text-primary" />
                          ) : (
                            <SquareIcon className="size-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="w-[20px]" />
                      <TableHead>Date</TableHead>
                      <TableHead>Origine</TableHead>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="px-4 py-6">
                          <div className="flex flex-col gap-2">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-block text-center text-muted-foreground">
                          Aucune candidature ne correspond aux filtres.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((c) => (
                        <TableRow
                          key={c.id}
                          onClick={() => void openDetail(c)}
                          className={cn(
                            "cursor-pointer",
                            !c.readFlag && "bg-primary/[0.03]",
                            selected.has(c.id) && "bg-primary/[0.08]"
                          )}
                        >
                          <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSelect(c.id)}
                              aria-label="Sélectionner"
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {selected.has(c.id) ? (
                                <CheckSquareIcon className="size-4 text-primary" />
                              ) : (
                                <SquareIcon className="size-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            {!c.readFlag && (
                              <span className="block size-2 rounded-full bg-gehmit" title="Non lue" />
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{fmtDate(c.createdAt)}</TableCell>
                          <TableCell>
                            {domain === "all" ? programLabel(c.program) : programLabel(c.program)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={c.readFlag ? "" : "font-semibold"}>
                                {candidateName(c)}
                              </span>
                              <span className="text-caption text-muted-foreground">
                                {candidateEmail(c)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={c.status ?? "new"}
                              onValueChange={(v) => void update(c.id, { status: v })}
                            >
                              <SelectTrigger
                                size="sm"
                                className={cn(
                                  "w-[140px] border-0 font-medium",
                                  STATUS_META[(c.status as CandidatureStatus) ?? "new"].cls
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allowedOptions(c).map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {STATUS_META[s].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
          </>
        )}

        {/* Barre d'actions groupées */}
        {selected.size > 0 && (
          <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-navy px-4 py-2.5 text-surface shadow-xl">
            <span className="mr-2 text-caption font-semibold tabular-nums">
              {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={bulkBusy}
              onClick={() => void bulk({ readFlag: true }, "Marquées comme lues")}
              className="gap-1.5 text-surface hover:bg-surface/15 hover:text-surface"
            >
              <MailOpenIcon className="size-4" />Marquer lues
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={bulkBusy}
              onClick={() => void bulk({ status: "archived" }, "Archivées")}
              className="gap-1.5 text-surface hover:bg-surface/15 hover:text-surface"
            >
              <ArchiveIcon className="size-4" />Archiver
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelected(new Set())}
              aria-label="Annuler la sélection"
              className="text-surface hover:bg-surface/15 hover:text-surface"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        <CandidatureDrawer
          candidature={open}
          triage={triage}
          queueSize={queue.length}
          onDecide={(s) => void decide(s)}
          onClose={() => {
            setOpen(null)
            setTriage(false)
          }}
          onUpdate={update}
          onDelete={remove}
        />
      </div>
    </div>
  )
}

/* ─── Espace dans le rail ─── */

function SpaceItem({
  active,
  label,
  count,
  fresh,
  onClick,
}: {
  active: boolean
  label: string
  count: number | undefined
  fresh: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-caption transition-colors",
        active ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted/70"
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {fresh > 0 && (
        <span className="rounded-full bg-gehmit/15 px-1.5 text-caption font-semibold text-gehmit tabular-nums">
          {fresh}
        </span>
      )}
      <span className="text-caption text-ink-faint tabular-nums">{count ?? "…"}</span>
    </button>
  )
}

/* ─── Drawer de détail ─── */

function CandidatureDrawer({
  candidature: c,
  triage,
  queueSize,
  onDecide,
  onClose,
  onUpdate,
  onDelete,
}: {
  candidature: Candidature | null
  triage: boolean
  queueSize: number
  onDecide: (status: CandidatureStatus) => void
  onClose: () => void
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<Candidature | null>
  onDelete: (id: string) => Promise<void>
}) {
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setNote(c?.note ?? "")
  }, [c?.id, c?.note])

  if (!c) return null

  const email = candidateEmail(c)
  const decisions = (c.allowedStatuses ?? []).filter((s) => s !== "archived")

  return (
    <Sheet open={!!c} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex flex-wrap items-center gap-2 text-lg">
            {programLabel(c.program)}
          </SheetTitle>
          <span className="text-caption text-muted-foreground">
            Reçue le {fmtDateTime(c.createdAt)} · {candidateName(c)}
          </span>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 py-4">
          {/* Statut + actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={c.status ?? "new"}
              onValueChange={(v) => void onUpdate(c.id, { status: v })}
            >
              <SelectTrigger
                className={cn(
                  "w-[160px] border-0 font-medium",
                  STATUS_META[(c.status as CandidatureStatus) ?? "new"].cls
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedOptions(c).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {email && (
              <Button variant="outline" size="sm" render={<a href={`mailto:${email}`} />}>
                Répondre par e-mail
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void onUpdate(c.id, { readFlag: !c.readFlag })}
            >
              {c.readFlag ? "Marquer non lue" : "Marquer lue"}
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

          {/* Mode triage : décision immédiate + candidature suivante */}
          {triage && (
            <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/[0.04] p-3.5">
              <span className="text-caption font-semibold text-primary">
                Mode triage — {queueSize} nouvelle{queueSize > 1 ? "s" : ""} restante{queueSize > 1 ? "s" : ""}
              </span>
              <div className="flex flex-wrap gap-2">
                {decisions.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === "rejected" ? "outline" : "default"}
                    onClick={() => onDecide(s)}
                  >
                    {STATUS_META[s].label}
                  </Button>
                ))}
                {(c.allowedStatuses ?? []).includes("archived") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => onDecide("archived")}
                  >
                    Archiver
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Données du formulaire */}
          <dl className="flex flex-col gap-2.5 rounded-lg border p-4">
            {Object.entries(c.form).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[160px_1fr] gap-3 text-small">
                <dt className="font-semibold">{fieldLabel(k)}</dt>
                {k === "cvUrl" && typeof v === "string" && v ? (
                  <dd>
                    <button
                      type="button"
                      onClick={() =>
                        openCv(v).catch((e: Error) =>
                          toast.add({ title: "Ouverture du CV impossible", description: e.message })
                        )
                      }
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      Ouvrir le CV
                    </button>
                  </dd>
                ) : (
                  <dd className="whitespace-pre-wrap break-words">
                    {Array.isArray(v) ? v.join(", ") : String(v ?? "—")}
                  </dd>
                )}
              </div>
            ))}
          </dl>

          {/* Note interne */}
          <div className="flex flex-col gap-1.5">
            <Label>Note interne (visible uniquement par l'équipe)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Profil intéressant, à rappeler la semaine prochaine…"
              rows={3}
            />
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              disabled={savingNote || note === (c.note ?? "")}
              onClick={async () => {
                setSavingNote(true)
                await onUpdate(c.id, { note })
                setSavingNote(false)
              }}
            >
              {savingNote ? "Enregistrement…" : "Enregistrer la note"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Confirmation de suppression */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              La candidature de {candidateName(c)} ({programLabel(c.program)}) sera
              définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false)
                void onDelete(c.id)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
