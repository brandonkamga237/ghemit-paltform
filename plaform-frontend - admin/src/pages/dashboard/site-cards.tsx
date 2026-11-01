import { Link } from "react-router"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  FileTextIcon,
  InboxIcon,
  MailIcon,
  NewspaperIcon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { timeAgo } from "@/lib/inbox"
import { campaignStatus } from "@/lib/newsletter"
import { Sparkline } from "@/components/admin/charts"
import { Panel, PanelLink } from "@/components/admin/panel"
import { Badge } from "@gehmit/ui/components/badge"
import { Button } from "@gehmit/ui/components/button"
import { Skeleton } from "@gehmit/ui/components/skeleton"
import type { Dashboard, FeedItem } from "./use-dashboard"

const skeletons = (n: number, className: string) =>
  Array.from({ length: n }, (_, i) => <Skeleton key={i} className={className} />)

/** Abonnés actifs, croissance sur 90 jours et dernière campagne. */
export function NewsletterCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  const last = dash?.campaigns[0]
  return (
    <Panel
      className={className}
      title="Newsletter"
      description="Croissance des abonnés — 90 jours"
      action={<PanelLink to="/newsletter">Gérer</PanelLink>}
      contentClassName="flex flex-col gap-4"
    >
      {!dash ? (
        <Skeleton className="h-36 w-full" />
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-heading text-3xl font-semibold tabular-nums">{dash.activeSubs}</span>
              <span className="text-caption text-muted-foreground">abonnés actifs</span>
            </div>
            <Sparkline data={dash.subSeries} className="h-12 w-40" />
          </div>
          {last && (
            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-caption font-medium">{last.subject}</span>
                <span className="text-caption text-muted-foreground">
                  {last.sentAt
                    ? `Envoyée le ${new Date(last.sentAt).toLocaleDateString("fr-FR")} · ${last.recipientCount} dest.`
                    : "Dernière campagne"}
                </span>
              </div>
              <Badge variant={campaignStatus(last.status).variant}>{campaignStatus(last.status).label}</Badge>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

/** Trois prochains événements. */
export function AgendaCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  return (
    <Panel className={className} title="Agenda" action={<PanelLink to="/evenements">Tout</PanelLink>} contentClassName="flex flex-col gap-2">
      {!dash ? (
        skeletons(2, "h-12 w-full")
      ) : dash.upcomingEvents.length === 0 ? (
        <div className="flex flex-col items-start gap-2 py-4">
          <p className="text-small text-muted-foreground">Aucun événement planifié.</p>
          <Button variant="outline" size="sm" render={<Link to="/evenements" />}>
            Ajouter un événement
          </Button>
        </div>
      ) : (
        dash.upcomingEvents.slice(0, 3).map((e) => {
          const m = String(e.payload.date ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/)
          return (
            <Link
              key={e.id}
              to="/evenements"
              className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/70"
            >
              <div className="flex w-11 shrink-0 flex-col items-center rounded-md bg-muted px-1 py-1.5">
                <span className="font-heading text-lg leading-none font-semibold">{m ? Number(m[3]) : "—"}</span>
                <span className="text-caption tracking-wide text-ink-faint uppercase">
                  {m ? new Date(`${m[0]}T00:00:00`).toLocaleDateString("fr-FR", { month: "short" }) : ""}
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-caption font-medium">{String(e.payload.title ?? "")}</span>
                <span className="truncate text-caption text-muted-foreground">
                  {[e.payload.time, e.payload.location].filter(Boolean).join(" · ")}
                </span>
              </div>
            </Link>
          )
        })
      )}
    </Panel>
  )
}

const FEED_STYLE: Record<FeedItem["kind"], { icon: typeof InboxIcon; cls: string }> = {
  candidature: { icon: InboxIcon, cls: "text-ink" },
  message: { icon: MailIcon, cls: "text-gehmit" },
  subscriber: { icon: UserPlusIcon, cls: "text-gehmit" },
  campaign: { icon: UsersIcon, cls: "text-ink-muted" },
}

/** Fil chronologique de tous les flux (candidatures, messages, abonnés, campagnes). */
export function ActivityCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  return (
    <Panel className={className} title="Activité récente" description="Tous les flux, réunis" contentClassName="flex flex-col">
      {!dash ? (
        skeletons(4, "mb-3 h-10 w-full")
      ) : dash.feed.length === 0 ? (
        <p className="py-6 text-center text-small text-muted-foreground">Aucune activité pour le moment.</p>
      ) : (
        <ol className="relative flex flex-col">
          {dash.feed.map((f, i) => {
            const { icon: Icon, cls } = FEED_STYLE[f.kind]
            return (
              <li key={`${f.kind}-${f.at}-${f.title}`} className="relative flex gap-3.5 pb-4 last:pb-0">
                {i < dash.feed.length - 1 && (
                  <span className="absolute top-7 left-[13px] h-[calc(100%-20px)] w-px bg-border" />
                )}
                <span className={cn("z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-surface", cls)}>
                  <Icon className="size-3.5" />
                </span>
                <Link to={f.to} className="group flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-small font-medium group-hover:underline">{f.title}</span>
                    <span className="block truncate text-caption text-muted-foreground">{f.detail}</span>
                  </div>
                  <span className="shrink-0 text-caption text-ink-faint">{timeAgo(f.at)}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </Panel>
  )
}

/** Volume de chaque type de contenu publié, avec accès direct. */
export function ContentCard({ dash, className }: { dash: Dashboard | null; className?: string }) {
  const rows = dash
    ? [
        {
          label: "Articles",
          to: "/articles",
          count: dash.content.articles?.length ?? 0,
          hint: dash.articleDrafts > 0 ? `${dash.articleDrafts} brouillon${dash.articleDrafts > 1 ? "s" : ""}` : undefined,
          icon: NewspaperIcon,
        },
        {
          label: "Événements",
          to: "/evenements",
          count: dash.content.events?.length ?? 0,
          hint: `${dash.upcomingEvents.length} à venir`,
          icon: CalendarDaysIcon,
        },
        { label: "Formations", to: "/formations", count: dash.content.formations?.length ?? 0, icon: FileTextIcon },
        { label: "Partenaires", to: "/partenaires", count: dash.content.partners?.length ?? 0, icon: UsersIcon },
        { label: "Médias", to: "/medias", count: dash.media.length, icon: UploadIcon },
      ]
    : []
  return (
    <Panel className={className} title="Contenu du site" description="État de ce qui est publié" contentClassName="flex flex-col px-3 pb-3">
      {!dash
        ? skeletons(4, "mb-2 h-9 w-full")
        : rows.map((r) => (
            <Link
              key={r.label}
              to={r.to}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"
            >
              <r.icon className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-primary" />
              <span className="text-small font-medium">{r.label}</span>
              {r.hint && <span className="text-caption text-ink-faint">· {r.hint}</span>}
              <span className="ml-auto flex items-center gap-2">
                <span className="font-heading text-body font-semibold tabular-nums">{r.count}</span>
                <ArrowRightIcon className="size-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </Link>
          ))}
    </Panel>
  )
}
