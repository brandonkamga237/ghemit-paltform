import { cn } from "@gehmit/ui/cn"
import type { Candidature, CandidatureStatus } from "@/lib/types"
import { STATUS_LABELS, STATUS_META, STATUS_ORDER } from "@/lib/inbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gehmit/ui/components/select"

/** Statuts proposés : le courant, puis les transitions autorisées par le workflow. */
function allowedOptions(c: Candidature): CandidatureStatus[] {
  const current = (c.status as CandidatureStatus) ?? "new"
  const allowed = c.allowedStatuses ?? STATUS_ORDER
  return [current, ...allowed.filter((s) => s !== current)]
}

/** Pastille de statut cliquable : ne propose que les transitions permises. */
export function StatusSelect({
  candidature: c,
  onChange,
  size = "default",
  className,
}: {
  candidature: Candidature
  onChange: (status: CandidatureStatus) => void
  size?: "default" | "sm"
  className?: string
}) {
  const current = (c.status as CandidatureStatus) ?? "new"
  return (
    <Select value={current} items={STATUS_LABELS} onValueChange={(v) => v && onChange(v as CandidatureStatus)}>
      <SelectTrigger size={size} className={cn("border-0 font-medium", STATUS_META[current].cls, className)}>
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
  )
}
