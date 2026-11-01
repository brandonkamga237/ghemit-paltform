import { ArchiveIcon, CheckSquareIcon, MailOpenIcon, SquareIcon, XIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import type { Candidature, CandidatureStatus } from "@/lib/types"
import { candidateEmail, candidateName, fmtDate, programLabel } from "@/lib/inbox"
import { Button } from "@gehmit/ui/components/button"
import { Card, CardContent } from "@gehmit/ui/components/card"
import { Skeleton } from "@gehmit/ui/components/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gehmit/ui/components/table"
import { StatusSelect } from "./status-select"

const COLUMNS = 6

/** Liste paginée : sélection multiple, statut modifiable sur place, clic = détail. */
export function CandidatureTable({
  items,
  loading,
  selected,
  allSelected,
  onToggle,
  onToggleAll,
  onOpen,
  onStatus,
}: {
  items: Candidature[]
  loading: boolean
  selected: Set<string>
  allSelected: boolean
  onToggle: (id: string) => void
  onToggleAll: () => void
  onOpen: (c: Candidature) => void
  onStatus: (c: Candidature, status: CandidatureStatus) => void
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-9 pl-4">
                <SelectToggle
                  checked={allSelected}
                  onClick={onToggleAll}
                  label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                />
              </TableHead>
              <TableHead className="w-5" />
              <TableHead>Date</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Candidat</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLUMNS} className="px-4 py-6">
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS} className="py-block text-center text-muted-foreground">
                  Aucune candidature ne correspond aux filtres.
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => onOpen(c)}
                  className={cn(
                    "cursor-pointer",
                    !c.readFlag && "bg-primary/[0.03]",
                    selected.has(c.id) && "bg-primary/[0.08]"
                  )}
                >
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <SelectToggle checked={selected.has(c.id)} onClick={() => onToggle(c.id)} label="Sélectionner" />
                  </TableCell>
                  <TableCell>
                    {!c.readFlag && <span className="block size-2 rounded-full bg-gehmit" title="Non lue" />}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(c.createdAt)}</TableCell>
                  <TableCell>{programLabel(c.program)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={c.readFlag ? "" : "font-semibold"}>{candidateName(c)}</span>
                      <span className="text-caption text-muted-foreground">{candidateEmail(c)}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <StatusSelect candidature={c} size="sm" className="w-36" onChange={(s) => onStatus(c, s)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SelectToggle({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {checked ? <CheckSquareIcon className="size-4 text-primary" /> : <SquareIcon className="size-4" />}
    </button>
  )
}

/** Barre flottante d'actions groupées, visible dès qu'une ligne est sélectionnée. */
export function BulkBar({
  count,
  busy,
  onMarkRead,
  onArchive,
  onClear,
}: {
  count: number
  busy: boolean
  onMarkRead: () => void
  onArchive: () => void
  onClear: () => void
}) {
  if (count === 0) return null
  const action = "gap-1.5 text-surface hover:bg-surface/15 hover:text-surface"
  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-inverse px-4 py-2.5 text-surface shadow-xl">
      <span className="mr-2 text-caption font-semibold tabular-nums">
        {count} sélectionnée{count > 1 ? "s" : ""}
      </span>
      <Button variant="ghost" size="sm" disabled={busy} onClick={onMarkRead} className={action}>
        <MailOpenIcon className="size-4" />
        Marquer lues
      </Button>
      <Button variant="ghost" size="sm" disabled={busy} onClick={onArchive} className={action}>
        <ArchiveIcon className="size-4" />
        Archiver
      </Button>
      <Button variant="ghost" size="icon" onClick={onClear} aria-label="Annuler la sélection" className={action}>
        <XIcon className="size-4" />
      </Button>
    </div>
  )
}
