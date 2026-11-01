import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { programLabel, STATUS_META, STATUS_ORDER, timeAgo } from "@/lib/inbox"
import { AreaChart, DistributionBars } from "@/components/admin/charts"
import { Panel } from "@/components/admin/panel"
import { Badge } from "@gehmit/ui/components/badge"
import { Skeleton } from "@gehmit/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gehmit/ui/components/tabs"
import { SegmentedControl } from "@gehmit/ui/components/segmented-control"
import type { Dashboard } from "./use-dashboard"

const PERIODS = [
  { value: 7, label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
]

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

/** Candidatures et messages reçus chaque jour, sur la période choisie. */
export function InboxChartCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  const [period, setPeriod] = useState(30)
  return (
    <Panel
      className={className}
      title="Flux de demandes"
      description="Candidatures et messages reçus chaque jour"
      action={<SegmentedControl label="Période du graphique" value={period} onChange={setPeriod} options={PERIODS} />}
      contentClassName="flex flex-col gap-3"
    >
      {!dash ? (
        <Skeleton className="h-60 w-full" />
      ) : (
        <InboxChart dash={dash} period={period} />
      )}
    </Panel>
  )
}

function InboxChart({ dash, period }: { dash: Dashboard; period: number }) {
  const days = dash.inbox.slice(-period)
  const series = [
    { name: "Candidatures", color: "var(--color-chart-1)", values: days.map((d) => d.candidatures) },
    { name: "Messages", color: "var(--color-chart-3)", values: days.map((d) => d.messages) },
  ]
  return (
    <>
      <AreaChart labels={days.map((d) => d.day)} series={series} />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t pt-3">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-2 text-caption">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.name}</span>
            <span className="font-semibold tabular-nums">{sum(s.values)}</span>
          </span>
        ))}
        <span className="ml-auto text-caption text-ink-faint">sur {period} jours</span>
      </div>
    </>
  )
}

/** Éléments récents sans réponse : messages non lus, nouvelles candidatures, brouillons. */
export function PriorityCard({ dash }: { dash: Dashboard | null }) {
  return (
    <Panel title="À traiter en priorité" description="Éléments récents sans réponse" contentClassName="flex flex-col px-3 pb-3">
      {!dash ? (
        [0, 1, 2].map((i) => <Skeleton key={i} className="mb-2 h-14 w-full" />)
      ) : dash.attention.length === 0 ? (
        <p className="px-3 py-6 text-center text-small text-muted-foreground">
          Rien en attente — toutes les demandes ont été traitées.
        </p>
      ) : (
        dash.attention.map((a) => (
          <Link
            key={`${a.tag}-${a.at}-${a.title}`}
            to={a.to}
            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-small font-medium">{a.title}</span>
              <span className="truncate text-caption text-muted-foreground">{a.detail}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-caption">
                {a.tag}
              </Badge>
              <span className="text-caption text-ink-faint">{timeAgo(a.at)}</span>
            </div>
          </Link>
        ))
      )}
    </Panel>
  )
}

/** Répartition des candidatures par statut ou par programme ; un clic ouvre la liste filtrée. */
export function CandidaturesCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  const navigate = useNavigate()
  const placeholder = <Skeleton className="h-44 w-full" />
  return (
    <Panel className={className} title="Candidatures" description="Répartition et accès filtré">
      <Tabs defaultValue="status">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Par statut</TabsTrigger>
          <TabsTrigger value="program">Par programme</TabsTrigger>
        </TabsList>
        <TabsContent value="status">
          {!dash ? (
            placeholder
          ) : (
            <DistributionBars
              items={STATUS_ORDER.map((s) => ({
                label: STATUS_META[s].label,
                value: dash.candSummary.byStatus[s] ?? 0,
                color: STATUS_META[s].color,
              }))}
              onSelect={(i) => {
                const s = STATUS_ORDER.find((x) => STATUS_META[x].label === i.label)
                if (s) navigate(`/candidatures?status=${s}`)
              }}
            />
          )}
        </TabsContent>
        <TabsContent value="program">
          {!dash ? (
            placeholder
          ) : (
            <DistributionBars
              items={Object.entries(dash.candSummary.byProgram)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([p, n]) => ({ label: programLabel(p), value: n, hint: p }))}
              onSelect={() => navigate("/candidatures")}
            />
          )}
        </TabsContent>
      </Tabs>
    </Panel>
  )
}
