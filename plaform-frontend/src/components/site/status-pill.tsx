import { cn } from "cn"
import type { ProgramStatus } from "@/data/content"

const styles: Record<ProgramStatus, string> = {
  open: "bg-open-bg text-open-text border-gehmit",
  soon: "bg-soon-bg text-soon-text border-soon-border",
  closed: "bg-closed-bg text-closed-text border-ink-faint",
  archived: "bg-archived-bg text-archived-text border-archived-border",
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: ProgramStatus
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold whitespace-nowrap",
        styles[status],
        className
      )}
    >
      {label}
    </span>
  )
}

const dotStyles: Record<ProgramStatus, string> = {
  open: "bg-gehmit",
  soon: "bg-soon-border",
  closed: "bg-ink-faint",
  archived: "bg-archived-border",
}

const dotLabels: Record<ProgramStatus, string> = {
  open: "Candidatures ouvertes",
  soon: "Bientôt",
  closed: "Fermé",
  archived: "Archivé",
}

/** Pastille d'état discrète, avec son libellé pour les lecteurs d'écran. */
export function StatusDot({ status, className }: { status: ProgramStatus; className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2 shrink-0", className)} title={dotLabels[status]}>
      <span className={cn("relative size-2 rounded-full", dotStyles[status])} />
      <span className="sr-only">{dotLabels[status]}</span>
    </span>
  )
}
