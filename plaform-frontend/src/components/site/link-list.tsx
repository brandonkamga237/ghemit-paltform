import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"

export interface LinkListItem {
  name: string
  to: string
  line?: string
}

/** Liste de liens éditoriale : intitulé, ligne d'explication, flèche au survol. */
export function LinkList({ items, className }: { items: LinkListItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col border-t border-line-strong", className)}>
      {items.map((o) => (
        <li key={o.name} className="border-b border-line">
          <Link to={o.to} className="group flex items-center justify-between gap-4 py-4">
            <span className="flex flex-col gap-0.5">
              <span className="text-body font-semibold text-ink group-hover:text-gehmit">{o.name}</span>
              {o.line ? <span className="text-small text-ink-muted">{o.line}</span> : null}
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-gehmit" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
