import { useId, useMemo, useState, type MouseEvent } from "react"
import { cn } from "cn"

/* ─── Helpers ─── */

function niceMax(v: number): number {
  if (v <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

const fmtDay = (iso: string, withYear = false) =>
  new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  })

/* ─── Sparkline : micro-courbe dans les métriques ─── */

export function Sparkline({
  data,
  className,
  color = "var(--color-gehmit)",
}: {
  data: number[]
  className?: string
  color?: string
}) {
  const id = useId()
  if (data.length < 2) return null
  const w = 120
  const h = 34
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 2 - (v / max) * (h - 6),
  ])
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── AreaChart empilé : flux de demandes ─── */

export interface ChartSeries {
  name: string
  color: string
  values: number[]
}

const PW = 720
const PH = 240
const PAD_T = 14
const PAD_B = 24

export function AreaChart({
  labels,
  series,
  className,
}: {
  labels: string[]
  series: ChartSeries[]
  className?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const uid = useId()

  const { paths, gridYs, xLabels } = useMemo(() => {
    const n = labels.length
    // sommes empilées par jour, de bas en haut
    const stacked = series.map((s, si) =>
      s.values.map((v, i) => series.slice(0, si).reduce((a, p) => a + p.values[i], 0) + v)
    )
    const top = series.reduce(
      (acc, _, i) => acc.concat(stacked.map((s) => s[i])),
      [0] as number[]
    )
    const max = niceMax(Math.max(...top, 1))
    const y = (v: number) => PAD_T + (1 - v / max) * (PH - PAD_T - PAD_B)
    const x = (i: number) => (i / Math.max(n - 1, 1)) * PW

    const paths = series.map((_, si) => {
      const upper = stacked[si].map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      const lower = (si === 0
        ? labels.map(() => 0)
        : stacked[si - 1]
      )
        .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
        .reverse()
      return `${upper.map((p, i) => `${i ? "L" : "M"}${p}`).join(" ")} ${lower
        .map((p) => `L${p}`)
        .join(" ")} Z`
    })

    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: y(max * f),
      label: Math.round(max * f),
    }))
    const step = Math.max(1, Math.ceil(n / 6))
    const xLabels = labels
      .map((l, i) => ({ i, label: fmtDay(l) }))
      .filter((_, i) => i % step === 0 || i === n - 1)
      .map((o) => ({ x: x(o.i), ...o }))
    return { paths, gridYs, xLabels }
  }, [labels, series])

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(labels.length - 1, Math.round(fx * (labels.length - 1)))))
  }

  const hx = labels.length > 1 ? (hover ?? 0) / (labels.length - 1) : 0

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${PW} ${PH}`}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`${uid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.12" />
            </linearGradient>
          ))}
        </defs>
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1="0" x2={PW} y1={g.y} y2={g.y} stroke="var(--color-sand)" strokeDasharray={i === 0 ? "" : "3 4"} />
            <text x={PW - 2} y={g.y - 4} textAnchor="end" fontSize="9" fill="var(--color-ink-faint)">
              {g.label}
            </text>
          </g>
        ))}
        {paths.map((d, i) => (
          <path key={i} d={d} fill={`url(#${uid}-g${i})`} stroke={series[i].color} strokeWidth="1.4" />
        ))}
        {hover !== null && (
          <line
            x1={hx * PW}
            x2={hx * PW}
            y1={PAD_T}
            y2={PH - PAD_B}
            stroke="var(--color-navy)"
            strokeOpacity="0.4"
          />
        )}
        {xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={PH - 6}
            textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="var(--color-ink-faint)"
          >
            {l.label}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 shadow-lg"
          style={{ left: `${hx * 100}%`, top: 0 }}
        >
          <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
            {fmtDay(labels[hover], true)}
          </div>
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] whitespace-nowrap">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
              <span className="ml-auto pl-4 font-semibold tabular-nums">{s.values[hover]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Barres de distribution horizontales ─── */

export interface DistributionItem {
  label: string
  value: number
  color?: string
  hint?: string
}

export function DistributionBars({
  items,
  onSelect,
  className,
}: {
  items: DistributionItem[]
  onSelect?: (item: DistributionItem) => void
  className?: string
}) {
  const total = items.reduce((a, i) => a + i.value, 0)
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(item)}
          className={cn(
            "group flex flex-col gap-1 rounded-md px-1 py-1 text-left transition-colors",
            onSelect && "hover:bg-muted/60"
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-[13.5px] font-medium">
              {item.color && (
                <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
              )}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              {item.hint && <span className="text-[11px] text-ink-faint">{item.hint}</span>}
              <span className="text-[13px] font-semibold tabular-nums">{item.value}</span>
              {total > 0 && (
                <span className="w-[34px] text-right text-[11px] text-ink-faint tabular-nums">
                  {Math.round((item.value / total) * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color ?? "var(--color-gehmit)",
              }}
            />
          </div>
        </button>
      ))}
      {items.length === 0 && (
        <p className="py-4 text-center text-[13px] text-muted-foreground">Aucune donnée.</p>
      )}
    </div>
  )
}
