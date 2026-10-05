import { useCallback, useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"
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

export function CandidaturesPage() {
  const [page, setPage] = useState<Page<Candidature> | null>(null)
  const [summary, setSummary] = useState<CandidaturesSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtres
  const [group, setGroup] = useState("all") // "all" | groupe d'origine | programme isolé
  const [program, setProgram] = useState("all") // sous-filtre : programme exact
  const [status, setStatus] = useState("all")
  const [q, setQ] = useState("")
  const [pageNo, setPageNo] = useState(0)
  const [size, setSize] = useState(20)
  const debouncedQ = useDebounced(q)

  const [open, setOpen] = useState<Candidature | null>(null)

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
                <TableHead className="w-[30px] pl-6" />
                <TableHead>Date</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Candidat</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : (page?.content.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Aucune candidature ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              ) : (
                page?.content.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => void openDetail(c)}
                    className={cn("cursor-pointer", !c.readFlag && "bg-primary/[0.03]")}
                  >
                    <TableCell className="pl-6">
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
                          {STATUS_ORDER.map((s) => (
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

      <CandidatureDialog
        candidature={open}
        onClose={() => setOpen(null)}
        onUpdate={update}
        onDelete={remove}
      />
    </div>
  )
}

function CandidatureDialog({
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
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {programLabel(c.program)}
            <span className="text-[13px] font-normal text-muted-foreground">
              {fmtDateTime(c.createdAt)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
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
                {STATUS_ORDER.map((s) => (
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
      </DialogContent>

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
    </Dialog>
  )
}
