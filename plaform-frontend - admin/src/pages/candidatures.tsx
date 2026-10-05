import { useCallback, useEffect, useState } from "react"
import {
  ArchiveIcon,
  CheckSquareIcon,
  MailOpenIcon,
  SearchIcon,
  SquareIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"
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
  ORIGIN_GROUPS,
  programLabel,
  STATUS_META,
  STATUS_ORDER,
  useDebounced,
} from "@/lib/inbox"

/** Statuts proposés : le courant + les transitions autorisées par le workflow. */
function allowedOptions(c: Candidature): CandidatureStatus[] {
  const current = (c.status as CandidatureStatus) ?? "new"
  const allowed = c.allowedStatuses ?? STATUS_ORDER
  return [current, ...allowed.filter((s) => s !== current)]
}
import { Pagination } from "@/components/admin/pagination"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function CandidaturesPage() {
  const [page, setPage] = useState<Page<Candidature> | null>(null)
  const [summary, setSummary] = useState<CandidaturesSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtres
  const [group, setGroup] = useState("all") // "all" | groupe d'origine | programme isolé
  const [program, setProgram] = useState("all") // sous-filtre : programme exact
  const [status, setStatus] = useState(
    () => new URLSearchParams(window.location.search).get("status") ?? "all"
  )
  const [q, setQ] = useState("")
  const [pageNo, setPageNo] = useState(0)
  const [size, setSize] = useState(20)
  const debouncedQ = useDebounced(q)

  const [open, setOpen] = useState<Candidature | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

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
      params.set("page", String(pageNo))
      params.set("size", String(size))
      params.set("sort", "createdAt,desc")
      if (program !== "all") {
        params.set("program", program)
      } else if (group !== "all") {
        const g = ORIGIN_GROUPS.find((x) => x.value === group)
        params.set("program", g ? g.programs.join(",") : group)
      }
      if (status !== "all") params.set("status", status)
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim())
      setPage(await api.get<Page<Candidature>>(`/api/admin/candidatures?${params}`))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [pageNo, size, group, program, status, debouncedQ])

  useEffect(() => {
    void refresh()
  }, [refresh])
  useEffect(() => {
    void refreshSummary()
  }, [refreshSummary])

  // Tout changement de filtre ramène à la première page
  useEffect(() => {
    setPageNo(0)
    setSelected(new Set())
  }, [group, program, status, debouncedQ, size])

  const update = async (id: string, patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<Candidature>(`/api/admin/candidatures/${id}`, patch)
      setPage((p) =>
        p ? { ...p, content: p.content.map((c) => (c.id === id ? updated : c)) } : p
      )
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
          ? {
              ...p,
              content: p.content.filter((c) => c.id !== id),
              totalElements: p.totalElements - 1,
            }
          : p
      )
      setOpen(null)
      toast.add({ title: "Candidature supprimée" })
      void refreshSummary()
      void refresh()
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

  const groupsInUse = ORIGIN_GROUPS.filter((g) =>
    g.programs.some((p) => (summary?.byProgram?.[p] ?? 0) > 0)
  )
  const programsInUse = Object.keys(summary?.byProgram ?? {}).sort()

  const kpis: {
    key: string
    label: string
    value: number | undefined
    active: boolean
    onClick: () => void
  }[] = [
    {
      key: "new",
      label: "Nouvelles",
      value: summary?.byStatus?.new,
      active: status === "new",
      onClick: () => setStatus(status === "new" ? "all" : "new"),
    },
    {
      key: "in_progress",
      label: "En cours",
      value: summary?.byStatus?.in_progress,
      active: status === "in_progress",
      onClick: () => setStatus(status === "in_progress" ? "all" : "in_progress"),
    },
    {
      key: "accepted",
      label: "Retenues",
      value: summary?.byStatus?.accepted,
      active: status === "accepted",
      onClick: () => setStatus(status === "accepted" ? "all" : "accepted"),
    },
    {
      key: "total",
      label: "Total",
      value: summary?.total,
      active: group === "all" && program === "all" && status === "all" && !debouncedQ,
      onClick: () => {
        setGroup("all")
        setProgram("all")
        setStatus("all")
        setQ("")
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Candidatures
        </h1>
        <p className="text-[15px] text-ink-muted">
          Candidatures aux programmes, Junior Builders, mise en relation,
          caravanes et Rencontre Challenge.
        </p>
      </div>

      {/* Indicateurs cliquables */}
      <div className="flex flex-wrap gap-2">
        {kpis.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={k.onClick}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
              k.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:border-primary/60"
            )}
          >
            {k.label}
            <span className={cn("font-heading text-base font-semibold", k.active && "text-primary-foreground")}>
              {k.value ?? "…"}
            </span>
          </button>
        ))}
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom, e-mail, organisation…"
            className="pl-9"
          />
        </div>
        <Select
          value={group}
          onValueChange={(v) => {
            setGroup(v ?? "all")
            setProgram("all")
          }}
        >
          <SelectTrigger className="w-[210px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les origines</SelectItem>
            {groupsInUse.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
            {programsInUse
              .filter((p) => !ORIGIN_GROUPS.some((g) => g.programs.includes(p)))
              .map((p) => (
                <SelectItem key={p} value={p}>
                  {programLabel(p)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {/* Sous-filtre programme quand un groupe à plusieurs programmes est choisi */}
        {(() => {
          const g = ORIGIN_GROUPS.find((x) => x.value === group)
          if (!g || g.programs.length <= 1) return null
          const opts = g.programs.filter((p) => programsInUse.includes(p))
          return (
            <Select value={program} onValueChange={(v) => setProgram(v ?? "all")}>
              <SelectTrigger className="w-[210px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous — {g.label}</SelectItem>
                {opts.map((p) => (
                  <SelectItem key={p} value={p}>
                    {programLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })()}
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-[170px]">
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
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      {/* Tableau */}
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
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : (items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
                    <TableCell>{programLabel(c.program)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={c.readFlag ? "" : "font-semibold"}>
                          {candidateName(c)}
                        </span>
                        <span className="text-[13px] text-muted-foreground">
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

      {/* Barre d'actions groupées */}
      {selected.size > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-navy px-4 py-2.5 text-surface shadow-xl">
          <span className="mr-2 text-[13.5px] font-semibold tabular-nums">
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
        onClose={() => setOpen(null)}
        onUpdate={update}
        onDelete={remove}
      />
    </div>
  )
}

function CandidatureDrawer({
  candidature: c,
  onClose,
  onUpdate,
  onDelete,
}: {
  candidature: Candidature | null
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

  return (
    <Sheet open={!!c} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex flex-wrap items-center gap-2 text-lg">
            {programLabel(c.program)}
          </SheetTitle>
          <span className="text-[13px] text-muted-foreground">
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

          {/* Données du formulaire */}
          <dl className="flex flex-col gap-2.5 rounded-lg border p-4">
            {Object.entries(c.form).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[160px_1fr] gap-3 text-[14px]">
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
