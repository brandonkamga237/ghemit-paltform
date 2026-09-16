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
