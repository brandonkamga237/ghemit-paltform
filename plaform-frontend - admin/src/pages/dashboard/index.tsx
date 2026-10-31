import { useAuth } from "@/lib/auth"
import { useDashboard } from "./use-dashboard"
import { AttentionBand, DashboardHeader, Metrics } from "./overview"
import { CandidaturesCard, InboxChartCard, PriorityCard } from "./inbox-cards"
import { ActivityCard, AgendaCard, ContentCard, NewsletterCard } from "./site-cards"

/**
 * Tableau de bord. Les données viennent de `useDashboard` ; chaque carte gère
 * son propre squelette de chargement (`dash` est null tant que rien n'est arrivé).
 */
export function DashboardPage() {
  const { username } = useAuth()
  const { dash, error } = useDashboard()

  return (
    <div className="flex flex-col gap-group">
      <DashboardHeader username={username} pending={dash?.pending ?? 0} />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">{error}</div>
      )}

      {dash && <AttentionBand dash={dash} />}

      <Metrics dash={dash} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <InboxChartCard dash={dash} className="lg:col-span-2" />
        <PriorityCard dash={dash} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <CandidaturesCard dash={dash} className="lg:col-span-5" />
        <NewsletterCard dash={dash} className="lg:col-span-4" />
        <AgendaCard dash={dash} className="lg:col-span-3" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <ActivityCard dash={dash} className="lg:col-span-7" />
        <ContentCard dash={dash} className="lg:col-span-5" />
      </div>
    </div>
  )
}
