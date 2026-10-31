import { useState } from "react"
import { PaperclipIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import type { Candidature, CandidatureStatus } from "@/lib/types"
import { candidateEmail, candidateName, STATUS_META, STATUS_ORDER, timeAgo } from "@/lib/inbox"

const statusOf = (c: Candidature) => (c.status as CandidatureStatus) ?? "new"

/**
 * Pipeline d'un espace : une colonne par statut, glisser-déposer pour faire
 * avancer une candidature. Une colonne n'accepte que les transitions permises.
 */
export function PipelineBoard({
  board,
  onOpen,
  onMove,
}: {
  board: Candidature[]
  onOpen: (c: Candidature) => void
  onMove: (c: Candidature, status: CandidatureStatus) => Promise<unknown>
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const dragged = dragId ? board.find((c) => c.id === dragId) : undefined

  const accepts = (s: CandidatureStatus) =>
    !!dragged && (statusOf(dragged) === s || (dragged.allowedStatuses ?? []).includes(s))

  const drop = async (s: CandidatureStatus) => {
    if (dragged && statusOf(dragged) !== s && accepts(s)) await onMove(dragged, s)
    setDragId(null)
  }

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-2">
      {STATUS_ORDER.map((s) => {
        const cards = board.filter((c) => statusOf(c) === s)
        const canDrop = dragId !== null && accepts(s)
        return (
          <div
            key={s}
            onDragOver={(e) => {
              if (canDrop) e.preventDefault()
            }}
            onDrop={() => void drop(s)}
            className={cn(
              "flex w-60 shrink-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2 transition-colors",
              dragId && canDrop && "border-primary/60 bg-primary/[0.05]",
              dragId && !canDrop && dragged && s !== statusOf(dragged) && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between px-1.5 pt-1">
              <span className="flex items-center gap-1.5 text-caption font-semibold">
                <span className="size-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                {STATUS_META[s].label}
              </span>
              <span className="text-caption font-medium text-muted-foreground tabular-nums">{cards.length}</span>
            </div>
            <div className="flex min-h-20 flex-col gap-2">
              {cards.map((c) => (
                <BoardCard
                  key={c.id}
                  candidature={c}
                  dragging={dragId === c.id}
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  onOpen={() => onOpen(c)}
                />
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
  )
}

function BoardCard({
  candidature: c,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  candidature: Candidature
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onOpen: () => void
}) {
  const subtitle = c.form.domaine ?? c.form.poste ?? c.form.projet ?? candidateEmail(c) ?? "—"
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={cn(
        "flex cursor-grab flex-col gap-1 rounded-lg border bg-card p-3 text-left shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing",
        dragging && "opacity-50"
      )}
    >
      <span className="flex items-center gap-1.5 text-small font-semibold">
        {!c.readFlag && <span className="size-2 shrink-0 rounded-full bg-gehmit" />}
        <span className="truncate">{candidateName(c)}</span>
      </span>
      <span className="truncate text-caption text-muted-foreground">{String(subtitle)}</span>
      <span className="flex items-center gap-2 pt-0.5 text-caption text-ink-faint">
        {timeAgo(c.createdAt)}
        {Boolean(c.form.cvUrl) && <PaperclipIcon className="size-3" />}
        {c.note && <span title="Note interne">•••</span>}
      </span>
    </button>
  )
}
