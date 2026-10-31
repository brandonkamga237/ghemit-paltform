import type { ComponentType, ReactNode } from "react"
import { cn } from "../cn"

export interface SegmentedOption<T extends string | number> {
  value: T
  label: ReactNode
  icon?: ComponentType<{ className?: string }>
  /** Compteur affiché après le libellé (masqué à 0). */
  badge?: number
}

/**
 * Choix exclusif entre quelques options, en ligne (vue, période, filtre).
 * Plus léger qu'un groupe d'onglets : ne pilote pas de panneau.
 */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  /** Nom accessible du groupe. */
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex rounded-lg border p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value
        const Icon = o.icon
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 text-caption font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="size-3.5" />}
            {o.label}
            {o.badge ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-caption font-semibold tabular-nums",
                  active ? "bg-primary-foreground/20" : "bg-gehmit/15 text-gehmit"
                )}
              >
                {o.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
