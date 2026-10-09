import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowRightIcon,
  BellRingIcon,
  CalendarDaysIcon,
  FileTextIcon,
  InboxIcon,
  MailIcon,
  MailPlusIcon,
  NewspaperIcon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "@/lib/cn"
import { api } from "@/lib/api"
import type {
  Campaign,
  Candidature,
  CandidaturesSummary,
  ContactMessage,
  ContentItem,
  DayActivity,
  DayCount,
  MediaFile,
  MessagesSummary,
  Page,
  Subscriber,
} from "@/lib/types"
import { candidateName, programLabel, STATUS_META, STATUS_ORDER } from "@/lib/inbox"
import { useAuth } from "@/lib/auth"
import { AreaChart, DistributionBars, Sparkline } from "@/components/admin/charts"
import { MetricCard } from "@/components/admin/metric"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* ─── Data ─── */

interface Data {
  inbox: DayActivity[]
  subsActivity: DayCount[]
  subs: Subscriber[]
  campaigns: Campaign[]
  msgSummary: MessagesSummary
  candSummary: CandidaturesSummary
  messages: ContactMessage[]
  candidatures: Candidature[]
  content: Record<string, ContentItem[]>
  media: MediaFile[]
}

const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "à l'instant"
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const deltaOf = (series: number[], span: number): number | null => {
  const cur = series.slice(-span).reduce((a, b) => a + b, 0)
  const prev = series.slice(-2 * span, -span).reduce((a, b) => a + b, 0)
  if (prev === 0) return cur > 0 ? 100 : null
  return Math.round(((cur - prev) / prev) * 100)
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

const CHART_PERIODS = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
]

const STATUS_COLORS: Record<string, string> = {
  new: "#2b4c7e",
  in_progress: "#d97706",
  accepted: "#15803d",
  rejected: "#b91c1c",
  archived: "#9ca3af",
}

export function DashboardPage() {
  const { username } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    Promise.all([
      api.get<DayActivity[]>("/api/admin/inbox/activity?days=90"),
      api.get<DayCount[]>("/api/admin/newsletter/activity?days=90"),
      api.get<Subscriber[]>("/api/admin/newsletter/subscribers"),
      api.get<Campaign[]>("/api/admin/newsletter/campaigns"),
      api.get<MessagesSummary>("/api/admin/messages/summary"),
      api.get<CandidaturesSummary>("/api/admin/candidatures/summary"),
      api.get<Page<ContactMessage>>("/api/admin/messages?size=5"),
      api.get<Page<Candidature>>("/api/admin/candidatures?size=5"),
      api.get<Record<string, ContentItem[]>>("/api/admin/content"),
      api.get<MediaFile[]>("/api/admin/media"),
    ])
      .then(([inbox, subsActivity, subs, campaigns, msgSummary, candSummary,
        messages, candidatures, content, media]) =>
        setData({
          inbox, subsActivity, subs, campaigns, msgSummary, candSummary,
          messages: messages.content, candidatures: candidatures.content, content, media,
        })
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
  }, [])

  /* ─── Agrégats ─── */
  const derived = useMemo(() => {
    if (!data) return null
    const candSeries = data.inbox.map((d) => d.candidatures)
    const msgSeries = data.inbox.map((d) => d.messages)
    const subSeries = data.subsActivity.map((d) => d.count)

    const articles = data.content.articles ?? []
    const events = (data.content.events ?? [])
      .filter((e) => e.payload.upcoming !== false && e.payload.status !== "cancelled")
      .sort((a, b) => String(a.payload.date).localeCompare(String(b.payload.date)))

    const feed: { kind: string; title: string; detail: string; at: string; to: string }[] = [
      ...data.candidatures.map((c) => ({
        kind: "candidature", title: candidateName(c),
        detail: `Candidature ${programLabel(c.program)}`, at: c.createdAt, to: "/candidatures",
      })),
      ...data.messages.map((m) => ({
        kind: "message", title: m.name || m.email,
        detail: m.subject || m.message, at: m.createdAt, to: "/messages",
      })),
      ...data.subs.slice(0, 5).map((s) => ({
        kind: "subscriber", title: s.name || s.email,
        detail: "Nouvel abonné newsletter", at: s.createdAt, to: "/newsletter",
      })),
      ...data.campaigns.slice(0, 3).map((c) => ({
        kind: "campaign", title: `Campagne « ${c.subject} »`,
        detail: c.status === "sent"
          ? `${c.recipientCount} destinataire(s)`
          : c.status === "draft" ? "Brouillon" : "Envoi en cours",
        at: c.sentAt ?? c.createdAt, to: "/newsletter",
      })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)

    const attention: { title: string; detail: string; at: string; to: string; tag: string }[] = [
      ...data.messages.filter((m) => !m.readFlag).map((m) => ({
        title: m.name || m.email, detail: m.subject || m.message,
        at: m.createdAt, to: "/messages?read=unread", tag: "Message",
      })),
      ...data.candidatures.filter((c) => c.status === "new").map((c) => ({
        title: candidateName(c), detail: programLabel(c.program),
        at: c.createdAt, to: "/candidatures?status=new", tag: "Candidature",
      })),
      ...articles.filter((a) => a.payload.status === "draft").map((a) => ({
        title: String(a.payload.title ?? "Sans titre"), detail: "Brouillon à publier",
        at: a.updatedAt, to: "/articles", tag: "Brouillon",
      })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7)

    return {
      candSeries, msgSeries, subSeries,
      activeSubs: data.subs.filter((s) => s.active).length,
      articleDrafts: articles.filter((a) => a.payload.status === "draft").length,
      upcomingEvents: events,
      feed, attention,
      newCands: data.candSummary.byStatus.new ?? 0,
      unreadMsgs: data.msgSummary.unread,
    }
  }, [data])

  const pending = (derived?.newCands ?? 0) + (derived?.unreadMsgs ?? 0)

  /* ─── Rendu ─── */
  return (
    <div className="flex flex-col gap-group">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
            Bonjour{username ? `, ${username}` : ""}
          </h1>
          <p className="text-small text-ink-muted">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" — "}
            {pending > 0
              ? `${pending} demande${pending > 1 ? "s" : ""} en attente de votre côté.`
              : "Tout est à jour."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" render={<Link to="/articles" />}>
            <NewspaperIcon className="size-4" />Article
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" render={<Link to="/evenements" />}>
            <CalendarDaysIcon className="size-4" />Événement
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" render={<Link to="/newsletter" />}>
            <MailPlusIcon className="size-4" />Campagne
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" render={<Link to="/medias" />}>
            <UploadIcon className="size-4" />Média
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
          {error}
        </div>
      )}

      {/* Bande attention */}
      {data && pending > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-navy px-5 py-4 text-surface">
          <span className="flex items-center gap-2 text-small font-semibold">
            <BellRingIcon className="size-4.5 text-gold" />
            Centre d'attention
          </span>
          <div className="flex flex-wrap gap-2">
            {derived!.unreadMsgs > 0 && (
              <Link to="/messages?read=unread" className="rounded-full bg-surface/10 px-3 py-1 text-caption transition-colors hover:bg-surface/20">
                {derived!.unreadMsgs} message{derived!.unreadMsgs > 1 ? "s" : ""} non lu{derived!.unreadMsgs > 1 ? "s" : ""}
              </Link>
            )}
            {derived!.newCands > 0 && (
              <Link to="/candidatures?status=new" className="rounded-full bg-surface/10 px-3 py-1 text-caption transition-colors hover:bg-surface/20">
                {derived!.newCands} candidature{derived!.newCands > 1 ? "s" : ""} à examiner
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Métriques */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Candidatures à examiner"
          value={derived?.newCands}
          delta={data ? deltaOf(derived!.candSeries, 30) : null}
          periodLabel="vs 30 j préc."
          spark={derived?.candSeries.slice(-30)}
          to="/candidatures?status=new"
          hint="Candidatures au statut « Nouvelle » — volume quotidien sur 30 jours."
        />
        <MetricCard
          label="Messages non lus"
          value={derived?.unreadMsgs}
          delta={data ? deltaOf(derived!.msgSeries, 30) : null}
          periodLabel="vs 30 j préc."
          spark={derived?.msgSeries.slice(-30)}
          sparkColor="var(--color-navy)"
          to="/messages?read=unread"
          hint="Messages de contact non lus — volume quotidien sur 30 jours."
        />
        <MetricCard
          label="Abonnés actifs"
          value={derived?.activeSubs}
          delta={data ? deltaOf(derived!.subSeries, 30) : null}
          periodLabel="vs 30 j préc."
          spark={derived?.subSeries.slice(-30)}
          sparkColor="var(--color-gold)"
          to="/newsletter"
          hint="Inscriptions quotidiennes à la newsletter sur 30 jours."
        />
        <MetricCard
          label="Événements à venir"
          value={derived?.upcomingEvents.length}
          hint={derived?.upcomingEvents[0]
            ? `Prochain : ${String(derived.upcomingEvents[0].payload.title)}`
            : "Aucun événement planifié"}
          to="/evenements"
        />
      </div>

      {/* Graphique principal + attention */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 pb-2">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-body">Flux de demandes</CardTitle>
              <CardDescription>
                Candidatures et messages reçus chaque jour
              </CardDescription>
            </div>
            <div className="flex rounded-lg border p-0.5">
              {CHART_PERIODS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPeriod(p.days)}
                  className={cn(
                    "rounded-md px-3 py-1 text-caption font-medium transition-colors",
                    period === p.days
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <>
                <AreaChart
                  labels={data.inbox.slice(-period).map((d) => d.day)}
                  series={[
                    {
                      name: "Candidatures",
                      color: "var(--color-chart-1)",
                      values: data.inbox.slice(-period).map((d) => d.candidatures),
                    },
                    {
                      name: "Messages",
                      color: "var(--color-chart-3)",
                      values: data.inbox.slice(-period).map((d) => d.messages),
                    },
                  ]}
                />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t pt-3">
                  {[
                    { name: "Candidatures", color: "var(--color-chart-1)", total: sum(derived!.candSeries.slice(-period)) },
                    { name: "Messages", color: "var(--color-chart-3)", total: sum(derived!.msgSeries.slice(-period)) },
                  ].map((s) => (
                    <span key={s.name} className="flex items-center gap-2 text-caption">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-semibold tabular-nums">{s.total}</span>
                    </span>
                  ))}
                  <span className="ml-auto text-caption text-ink-faint">
                    sur {period} jours
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Centre d'attention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-body">À traiter en priorité</CardTitle>
            <CardDescription>Éléments récents sans réponse</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col px-3 pb-3">
            {!data ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="mb-2 h-14 w-full" />)
            ) : derived!.attention.length === 0 ? (
              <p className="px-3 py-6 text-center text-small text-muted-foreground">
                Rien en attente — toutes les demandes ont été traitées.
              </p>
            ) : (
              derived!.attention.map((a, i) => (
                <Link
                  key={i}
                  to={a.to}
                  className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-small font-medium">{a.title}</span>
                    <span className="truncate text-caption text-muted-foreground">{a.detail}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline" className="text-caption">{a.tag}</Badge>
                    <span className="text-caption text-ink-faint">{timeAgo(a.at)}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline / Newsletter / Agenda */}
      <div className="grid items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-body">Candidatures</CardTitle>
            <CardDescription>Répartition et accès filtré</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status">Par statut</TabsTrigger>
                <TabsTrigger value="program">Par programme</TabsTrigger>
              </TabsList>
              <TabsContent value="status">
                {!data ? (
                  <Skeleton className="h-[180px] w-full" />
                ) : (
                  <DistributionBars
                    items={STATUS_ORDER.map((s) => ({
                      label: STATUS_META[s].label,
                      value: data.candSummary.byStatus[s] ?? 0,
                      color: STATUS_COLORS[s],
                    }))}
                    onSelect={(i) => {
                      const s = STATUS_ORDER.find((x) => STATUS_META[x].label === i.label)
                      if (s) navigate(`/candidatures?status=${s}`)
                    }}
                  />
                )}
              </TabsContent>
              <TabsContent value="program">
                {!data ? (
                  <Skeleton className="h-[180px] w-full" />
                ) : (
                  <DistributionBars
                    items={Object.entries(data.candSummary.byProgram)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([p, n]) => ({ label: programLabel(p), value: n, hint: p }))}
                    onSelect={() => navigate("/candidatures")}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-body">Newsletter</CardTitle>
              <CardDescription>Croissance des abonnés — 90 jours</CardDescription>
            </div>
            <Link to="/newsletter" className="flex items-center gap-1 text-caption text-gehmit hover:underline">
              Gérer<ArrowRightIcon className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!data ? (
              <Skeleton className="h-[140px] w-full" />
            ) : (
              <>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="font-heading text-3xl font-semibold tabular-nums">
                      {derived!.activeSubs}
                    </span>
                    <span className="text-caption text-muted-foreground">abonnés actifs</span>
                  </div>
                  <Sparkline data={derived!.subSeries} className="h-12 w-40" />
                </div>
                {data.campaigns[0] && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-caption font-medium">
                        {data.campaigns[0].subject}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {data.campaigns[0].sentAt
                          ? `Envoyée le ${new Date(data.campaigns[0].sentAt).toLocaleDateString("fr-FR")} · ${data.campaigns[0].recipientCount} dest.`
                          : "Dernière campagne"}
                      </span>
                    </div>
                    <Badge variant={data.campaigns[0].status === "sent" ? "default" : "secondary"}>
                      {data.campaigns[0].status === "sent" ? "Envoyée"
                        : data.campaigns[0].status === "draft" ? "Brouillon"
                        : data.campaigns[0].status === "sending" ? "Envoi…" : "Échec"}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-body">Agenda</CardTitle>
            <Link to="/evenements" className="flex items-center gap-1 text-caption text-gehmit hover:underline">
              Tout<ArrowRightIcon className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {!data ? (
              [0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : derived!.upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-start gap-2 py-4">
                <p className="text-small text-muted-foreground">Aucun événement planifié.</p>
                <Button variant="outline" size="sm" render={<Link to="/evenements" />}>
                  Ajouter un événement
                </Button>
              </div>
            ) : (
              derived!.upcomingEvents.slice(0, 3).map((e) => {
                const m = String(e.payload.date ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/)
                return (
                  <Link key={e.id} to="/evenements" className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/70">
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
          </CardContent>
        </Card>
      </div>

      {/* Fil d'activité + contenu */}
      <div className="grid items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-body">Activité récente</CardTitle>
            <CardDescription>Tous les flux, réunis</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {!data ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="mb-3 h-10 w-full" />)
            ) : derived!.feed.length === 0 ? (
              <p className="py-6 text-center text-small text-muted-foreground">
                Aucune activité pour le moment.
              </p>
            ) : (
              <ol className="relative flex flex-col">
                {derived!.feed.map((f, i) => (
                  <li key={i} className="relative flex gap-3.5 pb-4 last:pb-0">
                    {i < derived!.feed.length - 1 && (
                      <span className="absolute top-7 left-[13px] h-[calc(100%-20px)] w-px bg-border" />
                    )}
                    <span className={cn(
                      "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-surface",
                      f.kind === "candidature" && "text-navy",
                      f.kind === "message" && "text-gehmit",
                      f.kind === "subscriber" && "text-gold",
                      f.kind === "campaign" && "text-ink-muted",
                    )}>
                      {f.kind === "candidature" ? <InboxIcon className="size-3.5" />
                        : f.kind === "message" ? <MailIcon className="size-3.5" />
                        : f.kind === "subscriber" ? <UserPlusIcon className="size-3.5" />
                        : <UsersIcon className="size-3.5" />}
                    </span>
                    <Link to={f.to} className="group flex min-w-0 flex-1 items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-small font-medium group-hover:underline">{f.title}</span>
                        <span className="block truncate text-caption text-muted-foreground">{f.detail}</span>
                      </div>
                      <span className="shrink-0 text-caption text-ink-faint">{timeAgo(f.at)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-body">Contenu du site</CardTitle>
            <CardDescription>État de ce qui est publié</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col px-3 pb-3">
            {!data ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-9 w-full" />)
            ) : (
              [
                {
                  label: "Articles", to: "/articles",
                  count: data.content.articles?.length ?? 0,
                  hint: derived!.articleDrafts > 0 ? `${derived!.articleDrafts} brouillon${derived!.articleDrafts > 1 ? "s" : ""}` : undefined,
                  icon: NewspaperIcon,
                },
                {
                  label: "Événements", to: "/evenements",
                  count: data.content.events?.length ?? 0,
                  hint: `${derived!.upcomingEvents.length} à venir`,
                  icon: CalendarDaysIcon,
                },
                {
                  label: "Formations", to: "/formations",
                  count: data.content.formations?.length ?? 0,
                  icon: FileTextIcon,
                },
                {
                  label: "Partenaires", to: "/partenaires",
                  count: data.content.partners?.length ?? 0,
                  icon: UsersIcon,
                },
                {
                  label: "Médias", to: "/medias",
                  count: data.media.length,
                  icon: UploadIcon,
                },
              ].map((r) => (
                <Link
                  key={r.label}
                  to={r.to}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"
                >
                  <r.icon className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-primary" />
                  <span className="text-small font-medium">{r.label}</span>
                  {r.hint && (
                    <span className="text-caption text-ink-faint">· {r.hint}</span>
                  )}
                  <span className="ml-auto flex items-center gap-2">
                    <span className="font-heading text-body font-semibold tabular-nums">{r.count}</span>
                    <ArrowRightIcon className="size-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
