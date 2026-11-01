import { cn } from "@gehmit/ui/cn"
import type { CandidaturesSummary } from "@/lib/types"
import { programLabel } from "@/lib/inbox"
import { ALL_KEYS, ALL_LABEL, SPACE_FAMILIES } from "./spaces-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gehmit/ui/components/select"

/** Rail des espaces (grand écran) : total et nouvelles par programme. */
export function SpacesRail({
  domain,
  summary,
  newCount,
  onSelect,
}: {
  domain: string
  summary: CandidaturesSummary | null
  newCount: number
  onSelect: (domain: string) => void
}) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col gap-1 lg:flex">
      <span className="px-2 pb-2 text-caption font-semibold tracking-wider text-ink-faint uppercase">
        Espaces de réception
      </span>
      <SpaceItem
        active={domain === "all"}
        label={ALL_LABEL}
        count={summary?.total}
        fresh={newCount}
        onClick={() => onSelect("all")}
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
              onClick={() => onSelect(k)}
            />
          ))}
        </div>
      ))}
    </aside>
  )
}

/** Choix de l'espace sur petit écran (le rail est masqué). */
export function SpaceSelect({ domain, onSelect }: { domain: string; onSelect: (domain: string) => void }) {
  return (
    <Select
      value={domain}
      onValueChange={(v) => onSelect(v ?? "all")}
      items={{ all: ALL_LABEL, ...Object.fromEntries(ALL_KEYS.map((k) => [k, programLabel(k)])) }}
    >
      <SelectTrigger className="w-52 lg:hidden">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{ALL_LABEL}</SelectItem>
        {ALL_KEYS.map((k) => (
          <SelectItem key={k} value={k}>
            {programLabel(k)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

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
      aria-current={active ? "page" : undefined}
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
