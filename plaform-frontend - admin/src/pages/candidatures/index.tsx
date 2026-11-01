import { Columns3Icon, ListIcon, SearchIcon, ZapIcon } from "lucide-react"
import { STATUS_LABELS, STATUS_META, STATUS_ORDER } from "@/lib/inbox"
import { Pagination } from "@/components/admin/pagination"
import { Button } from "@gehmit/ui/components/button"
import { Input } from "@gehmit/ui/components/input"
import { SegmentedControl } from "@gehmit/ui/components/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gehmit/ui/components/select"
import { useCandidatures } from "./use-candidatures"
import { SpaceSelect, SpacesRail } from "./spaces"
import { spaceTitle } from "./spaces-data"
import { PipelineBoard } from "./pipeline-board"
import { BulkBar, CandidatureTable } from "./candidature-table"
import { CandidatureDrawer } from "./candidature-drawer"

const VIEWS = [
  { value: "board" as const, label: "Pipeline", icon: Columns3Icon },
  { value: "list" as const, label: "Liste", icon: ListIcon },
]

/**
 * Boîte de réception des candidatures. La logique vit dans `useCandidatures` ;
 * cet écran assemble le rail des espaces, la barre d'outils, la vue (pipeline
 * ou liste) et le panneau de détail.
 */
export function CandidaturesPage() {
  const inbox = useCandidatures()

  return (
    <div className="flex gap-group">
      <SpacesRail domain={inbox.domain} summary={inbox.summary} newCount={inbox.newCount} onSelect={inbox.setDomain} />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {/* En-tête : espace courant, triage, choix de la vue */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.01em]">{spaceTitle(inbox.domain)}</h1>
            <p className="text-caption text-ink-muted">
              {inbox.listMode
                ? `${inbox.page?.totalElements ?? "…"} élément(s)`
                : `${inbox.board.length} candidature${inbox.board.length > 1 ? "s" : ""} dans cet espace`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!inbox.listMode && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={inbox.startTriage} disabled={inbox.queue.length === 0}>
                <ZapIcon className="size-4" />
                Trier {inbox.queue.length > 0 && `(${inbox.queue.length})`}
              </Button>
            )}
            {inbox.domain !== "all" && (
              <SegmentedControl label="Affichage" value={inbox.view} onChange={inbox.setView} options={VIEWS} />
            )}
          </div>
        </div>

        {/* Barre d'outils : espace (mobile), recherche, statut (liste) */}
        <div className="flex flex-wrap items-center gap-3">
          <SpaceSelect domain={inbox.domain} onSelect={inbox.setDomain} />
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inbox.q}
              onChange={(e) => inbox.setQ(e.target.value)}
              placeholder="Rechercher nom, e-mail, organisation…"
              className="pl-9"
            />
          </div>
          {inbox.listMode && (
            <Select
              value={inbox.status}
              onValueChange={(v) => inbox.setStatus(v ?? "all")}
              items={{ all: "Tous les statuts", ...STATUS_LABELS }}
            >
              <SelectTrigger className="w-40">
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

        {inbox.error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">{inbox.error}</div>
        )}

        {inbox.listMode ? (
          <>
            <CandidatureTable
              items={inbox.items}
              loading={inbox.loading}
              selected={inbox.selected}
              allSelected={inbox.allSelected}
              onToggle={inbox.toggleSelect}
              onToggleAll={inbox.toggleAll}
              onOpen={(x) => void inbox.openDetail(x)}
              onStatus={(x, s) => void inbox.update(x.id, { status: s })}
            />
            <Pagination page={inbox.page} pageNo={inbox.pageNo} size={inbox.size} onPage={inbox.setPageNo} onSize={inbox.setSize} />
          </>
        ) : (
          <PipelineBoard
            board={inbox.board}
            onOpen={(x) => void inbox.openDetail(x)}
            onMove={(x, s) => inbox.update(x.id, { status: s })}
          />
        )}

        <BulkBar
          count={inbox.selected.size}
          busy={inbox.bulkBusy}
          onMarkRead={() => void inbox.bulk({ readFlag: true }, "Marquées comme lues")}
          onArchive={() => void inbox.bulk({ status: "archived" }, "Archivées")}
          onClear={inbox.clearSelection}
        />

        <CandidatureDrawer
          candidature={inbox.open}
          triage={inbox.triage}
          queueSize={inbox.queue.length}
          onDecide={(s) => void inbox.decide(s)}
          onClose={inbox.closeDetail}
          onUpdate={inbox.update}
          onDelete={inbox.remove}
        />
      </div>
    </div>
  )
}
