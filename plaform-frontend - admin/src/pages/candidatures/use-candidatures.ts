import { useState } from "react"
import { api } from "@/lib/api"
import type { Candidature, CandidaturesSummary, CandidatureStatus, Page } from "@/lib/types"
import { useDebounced } from "@/lib/inbox"
import { useResource } from "@/lib/use-resource"
import { toast } from "@gehmit/ui/components/toast"

/** Nombre de candidatures chargées d'un coup pour la vue pipeline d'un espace. */
const BOARD_SIZE = 200

const ENDPOINT = "/api/admin/candidatures"

const initialParam = (key: string) => new URLSearchParams(window.location.search).get(key) ?? "all"

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : undefined)

/**
 * État et actions de la boîte de réception des candidatures : filtres,
 * chargement (liste paginée ou pipeline d'un espace), mutations, sélection
 * groupée et file de triage. L'écran ne fait qu'afficher ce que renvoie ce hook.
 */
export function useCandidatures() {
  /* ─── Filtres : tout changement revient à la première page et vide la sélection ─── */

  const [domain, setDomainState] = useState(() => initialParam("domain"))
  const [status, setStatusState] = useState(() => initialParam("status"))
  const [q, setQState] = useState("")
  const [size, setSizeState] = useState(20)
  const [view, setView] = useState<"board" | "list">("board")
  const [pageNo, setPageNo] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const debouncedQ = useDebounced(q)

  const resetting =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPageNo(0)
      setSelected(new Set())
    }
  const setDomain = resetting(setDomainState)
  const setStatus = resetting(setStatusState)
  const setQ = resetting(setQState)
  const setSize = resetting(setSizeState)

  /** Liste paginée pour « toutes » ou en vue liste ; sinon pipeline de l'espace. */
  const listMode = domain === "all" || view === "list"

  /* ─── Chargement ─── */

  const search = debouncedQ.trim()
  const pageRes = useResource(
    () => {
      const params = new URLSearchParams({ sort: "createdAt,desc", page: String(pageNo), size: String(size) })
      if (search) params.set("q", search)
      if (domain !== "all") params.set("program", domain)
      if (status !== "all") params.set("status", status)
      return api.get<Page<Candidature>>(`${ENDPOINT}?${params}`)
    },
    [pageNo, size, domain, status, search],
    { enabled: listMode }
  )
  const boardRes = useResource(
    async () => {
      const params = new URLSearchParams({ sort: "createdAt,desc", page: "0", size: String(BOARD_SIZE), program: domain })
      if (search) params.set("q", search)
      return (await api.get<Page<Candidature>>(`${ENDPOINT}?${params}`)).content
    },
    [domain, search],
    { enabled: !listMode }
  )
  // Le récapitulatif est secondaire : en cas d'échec, le rail affiche « … ».
  const summaryRes = useResource(() => api.get<CandidaturesSummary>(`${ENDPOINT}/summary`), [])

  const page = pageRes.data ?? null
  const board = boardRes.data ?? []
  const summary = summaryRes.data ?? null
  const current = listMode ? pageRes : boardRes
  const { error, loading } = current

  /* ─── Détail ouvert ─── */

  const [open, setOpen] = useState<Candidature | null>(null)

  /* ─── Mutations ─── */

  const update = async (id: string, patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<Candidature>(`${ENDPOINT}/${id}`, patch)
      const swap = (c: Candidature) => (c.id === id ? updated : c)
      pageRes.setData((p) => (p ? { ...p, content: p.content.map(swap) } : p))
      boardRes.setData((b) => b?.map(swap))
      setOpen((o) => (o?.id === id ? updated : o))
      summaryRes.reload()
      return updated
    } catch (e) {
      toast.add({ title: "Mise à jour impossible", description: errorMessage(e) })
      return null
    }
  }

  const remove = async (id: string) => {
    try {
      await api.del(`${ENDPOINT}/${id}`)
      pageRes.setData((p) =>
        p ? { ...p, content: p.content.filter((c) => c.id !== id), totalElements: p.totalElements - 1 } : p
      )
      boardRes.setData((b) => b?.filter((c) => c.id !== id))
      setOpen(null)
      toast.add({ title: "Candidature supprimée" })
      summaryRes.reload()
      if (listMode) pageRes.reload()
    } catch (e) {
      toast.add({ title: "Suppression impossible", description: errorMessage(e) })
    }
  }

  /** Ouvre le détail et marque la candidature comme lue. */
  const openDetail = async (c: Candidature) => {
    setOpen(c)
    if (!c.readFlag) await update(c.id, { readFlag: true })
  }

  /* ─── Sélection groupée (vue liste) ─── */

  const items = page?.content ?? []
  const allSelected = items.length > 0 && selected.size === items.length
  const [bulkBusy, setBulkBusy] = useState(false)

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((c) => c.id)))

  const clearSelection = () => setSelected(new Set())

  const bulk = async (patch: Record<string, unknown>, label: string) => {
    setBulkBusy(true)
    const results = await Promise.allSettled([...selected].map((id) => api.patch(`${ENDPOINT}/${id}`, patch)))
    const failed = results.filter((r) => r.status === "rejected").length
    toast.add({
      title: failed > 0 ? `${label} — ${selected.size - failed} sur ${selected.size}` : label,
      description: failed > 0 ? `${failed} élément(s) en erreur.` : undefined,
    })
    setSelected(new Set())
    setBulkBusy(false)
    current.reload()
    summaryRes.reload()
  }

  /* ─── Triage : file des nouvelles candidatures de l'espace ─── */

  const [triage, setTriage] = useState(false)
  const queue = board.filter((c) => (c.status ?? "new") === "new")

  const startTriage = () => {
    setTriage(true)
    if (queue[0]) void openDetail(queue[0])
    else toast.add({ title: "Aucune nouvelle candidature dans cet espace." })
  }

  const decide = async (next: CandidatureStatus) => {
    if (!open) return
    await update(open.id, { status: next })
    const rest = queue.filter((c) => c.id !== open.id)
    if (rest[0]) void openDetail(rest[0])
    else {
      setOpen(null)
      setTriage(false)
      toast.add({ title: "File de triage terminée", description: "Toutes les nouvelles candidatures ont été traitées." })
    }
  }

  const closeDetail = () => {
    setOpen(null)
    setTriage(false)
  }

  const newCount = summary ? Object.values(summary.newByProgram).reduce((a, b) => a + b, 0) : 0

  return {
    // données
    page,
    items,
    board,
    summary,
    newCount,
    error,
    loading,
    // filtres
    domain,
    setDomain,
    status,
    setStatus,
    q,
    setQ,
    size,
    setSize,
    pageNo,
    setPageNo,
    view,
    setView,
    listMode,
    // détail
    open,
    openDetail,
    closeDetail,
    update,
    remove,
    // sélection
    selected,
    allSelected,
    toggleSelect,
    toggleAll,
    clearSelection,
    bulk,
    bulkBusy,
    // triage
    triage,
    queue,
    startTriage,
    decide,
  }
}
