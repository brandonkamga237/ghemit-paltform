import { useEffect, useRef } from "react"
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"

/** Menu d'un bloc (poignée de la marge) : monter, descendre, supprimer. Se ferme au clic extérieur. */
export function BlockMenu({
  canUp,
  canDown,
  onUp,
  onDown,
  onDelete,
  onClose,
}: {
  canUp: boolean
  canDown: boolean
  onUp: () => void
  onDown: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDownDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", onDownDoc)
    return () => document.removeEventListener("mousedown", onDownDoc)
  }, [onClose])
  const item = "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-small text-ink hover:bg-surface-alt disabled:opacity-40"
  return (
    <div
      ref={ref}
      role="menu"
      className="absolute top-9 left-0 z-40 w-[190px] rounded-sm border border-line-strong bg-surface p-1 shadow-float"
    >
      <button type="button" role="menuitem" className={item} disabled={!canUp} onClick={() => { onUp(); onClose() }}>
        <ArrowUpIcon className="size-4" /> Monter
      </button>
      <button type="button" role="menuitem" className={item} disabled={!canDown} onClick={() => { onDown(); onClose() }}>
        <ArrowDownIcon className="size-4" /> Descendre
      </button>
      <button type="button" role="menuitem" className={cn(item, "text-destructive")} onClick={() => { onDelete(); onClose() }}>
        <Trash2Icon className="size-4" /> Supprimer le bloc
      </button>
    </div>
  )
}
