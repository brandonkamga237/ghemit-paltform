import { Link } from "react-router"
import { BellRingIcon, CalendarDaysIcon, MailPlusIcon, NewspaperIcon, UploadIcon } from "lucide-react"
import { MetricCard } from "@/components/admin/metric"
import { Button } from "@gehmit/ui/components/button"
import { deltaOf, type Dashboard } from "./use-dashboard"

const QUICK_ACTIONS = [
  { label: "Article", to: "/articles", icon: NewspaperIcon },
  { label: "Événement", to: "/evenements", icon: CalendarDaysIcon },
  { label: "Campagne", to: "/newsletter", icon: MailPlusIcon },
  { label: "Média", to: "/medias", icon: UploadIcon },
]

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`

/** Salutation, date du jour, demandes en attente et raccourcis de création. */
export function DashboardHeader({ username, pending }: { username?: string; pending: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Bonjour{username ? `, ${username}` : ""}
        </h1>
        <p className="text-small text-ink-muted">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          {" — "}
          {pending > 0 ? `${plural(pending, "demande")} en attente de votre côté.` : "Tout est à jour."}
        </p>
      </div>
      <div className="flex gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Button key={a.to} variant="outline" size="sm" className="gap-1.5" render={<Link to={a.to} />}>
            <a.icon className="size-4" />
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** Bande sombre « Centre d'attention » : raccourcis vers ce qui attend une réponse. */
export function AttentionBand({ dash }: { dash: Dashboard }) {
  if (dash.pending === 0) return null
  const chip = "rounded-full bg-surface/10 px-3 py-1 text-caption transition-colors hover:bg-surface/20"
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-inverse px-5 py-4 text-surface">
      <span className="flex items-center gap-2 text-small font-semibold">
        <BellRingIcon className="size-4.5 text-gehmit-light" />
        Centre d'attention
      </span>
      <div className="flex flex-wrap gap-2">
        {dash.unreadMsgs > 0 && (
          <Link to="/messages?read=unread" className={chip}>
            {plural(dash.unreadMsgs, "message")} non lu{dash.unreadMsgs > 1 ? "s" : ""}
          </Link>
        )}
        {dash.newCands > 0 && (
          <Link to="/candidatures?status=new" className={chip}>
            {plural(dash.newCands, "candidature")} à examiner
          </Link>
        )}
      </div>
    </div>
  )
}

/** Quatre indicateurs clés, avec tendance sur 30 jours. */
export function Metrics({ dash }: { dash: Dashboard | null }) {
  const trend = (series: number[] | undefined) => ({
    delta: series ? deltaOf(series, 30) : null,
    spark: series?.slice(-30),
    periodLabel: "vs 30 j préc.",
  })
  const next = dash?.upcomingEvents[0]
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Candidatures à examiner"
        value={dash?.newCands}
        {...trend(dash?.candSeries)}
        to="/candidatures?status=new"
        hint="Candidatures au statut « Nouvelle » — volume quotidien sur 30 jours."
      />
      <MetricCard
        label="Messages non lus"
        value={dash?.unreadMsgs}
        {...trend(dash?.msgSeries)}
        sparkColor="var(--color-ink)"
        to="/messages?read=unread"
        hint="Messages de contact non lus — volume quotidien sur 30 jours."
      />
      <MetricCard
        label="Abonnés actifs"
        value={dash?.activeSubs}
        {...trend(dash?.subSeries)}
        sparkColor="var(--color-chart-3)"
        to="/newsletter"
        hint="Inscriptions quotidiennes à la newsletter sur 30 jours."
      />
      <MetricCard
        label="Événements à venir"
        value={dash?.upcomingEvents.length}
        hint={next ? `Prochain : ${String(next.payload.title)}` : "Aucun événement planifié"}
        to="/evenements"
      />
    </div>
  )
}
