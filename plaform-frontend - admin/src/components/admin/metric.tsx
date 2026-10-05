import { Link } from "react-router"
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"
import { Sparkline } from "./charts"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Métrique de tableau de bord : valeur, tendance vs période précédente,
 * sparkline de contexte, navigation au clic.
 */
export function MetricCard({
  label,
  value,
  delta,
  periodLabel,
  spark,
  sparkColor,
  hint,
  to,
}: {
  label: string
  value: number | string | undefined
  /** % d'évolution vs période précédente ; undefined = pas de comparaison. */
  delta?: number | null
  periodLabel?: string
  spark?: number[]
  sparkColor?: string
  hint?: string
  to: string
}) {
  const positive = delta != null && delta >= 0
  return (
    <Link to={to} className="group block h-full">
        <Card className="h-full transition-colors group-hover:border-primary/50">
          <CardContent className="flex h-full flex-col gap-1 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
              <ArrowRightIcon className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            {value === undefined ? (
              <Skeleton className="mt-1 h-8 w-20" />
            ) : (
              <span className="font-heading text-[30px] leading-tight font-semibold tabular-nums">
                {value}
              </span>
            )}
            <div className="mt-auto flex items-end justify-between gap-2 pt-2">
              {delta != null ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums",
                    positive ? "bg-open-bg text-open-text" : "bg-destructive/10 text-destructive"
                  )}
                >
                  {positive ? (
                    <ArrowUpRightIcon className="size-3" />
                  ) : (
                    <ArrowDownRightIcon className="size-3" />
                  )}
                  {Math.abs(delta)}%
                  {periodLabel && (
                    <span className="ml-0.5 font-normal text-current/70">{periodLabel}</span>
                  )}
                </span>
              ) : (
                hint && <span className="truncate text-[12px] text-ink-faint">{hint}</span>
              )}
              {spark && spark.length > 1 && (
                <Sparkline data={spark} color={sparkColor} className="h-8 w-24" />
              )}
            </div>
          </CardContent>
        </Card>
    </Link>
  )
}
