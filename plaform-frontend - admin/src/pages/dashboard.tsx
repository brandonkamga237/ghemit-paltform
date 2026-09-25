import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  ArrowRightIcon,
  FileTextIcon,
  InboxIcon,
  MailIcon,
  NewspaperIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react"
import { api } from "@/lib/api"
import type {
  Candidature,
  CandidaturesSummary,
  ContactMessage,
  ContentItem,
  MediaFile,
  MessagesSummary,
  Page,
  Subscriber,
} from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Data {
  content: Record<string, ContentItem[]>
  subs: Subscriber[]
  messages: ContactMessage[]
  candidatures: Candidature[]
  media: MediaFile[]
  msgSummary: MessagesSummary
  candSummary: CandidaturesSummary
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })

export function DashboardPage() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Record<string, ContentItem[]>>("/api/admin/content"),
      api.get<Subscriber[]>("/api/admin/newsletter/subscribers"),
      api.get<Page<ContactMessage>>("/api/admin/messages?size=5"),
      api.get<Page<Candidature>>("/api/admin/candidatures?size=5"),
      api.get<MediaFile[]>("/api/admin/media"),
      api.get<MessagesSummary>("/api/admin/messages/summary"),
      api.get<CandidaturesSummary>("/api/admin/candidatures/summary"),
    ])
      .then(([content, subs, messages, candidatures, media, msgSummary, candSummary]) =>
        setData({
          content,
          subs,
          messages: messages.content,
          candidatures: candidatures.content,
          media,
          msgSummary,
          candSummary,
        })
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
  }, [])

  const unreadMessagesCount = data?.msgSummary.unread ?? 0
  const unreadCandidaturesCount = data?.candSummary.unread ?? 0
  const pending = unreadMessagesCount + unreadCandidaturesCount

  const recentMessages = [...(data?.messages ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
  const recentCandidatures = [...(data?.candidatures ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
  const activeSubs = data?.subs.filter((s) => s.active) ?? []
  const recentSubs = [...activeSubs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const stats = [
    { label: "Programmes", value: data?.content.programs?.length, to: "/programmes" },
    { label: "Formations", value: data?.content.formations?.length, to: "/formations" },
    { label: "Articles", value: data?.content.articles?.length, to: "/articles" },
    { label: "Abonnés newsletter", value: activeSubs.length || undefined, to: "/newsletter" },
    { label: "Médias", value: data?.media.length, to: "/medias" },
  ]

  const quickActions = [
    { label: "Rédiger un article", to: "/articles", icon: NewspaperIcon },
    { label: "Téléverser un média", to: "/medias", icon: UploadIcon },
    { label: "Modifier les textes du site", to: "/reglages", icon: FileTextIcon },
    { label: "Voir la newsletter", to: "/newsletter", icon: UsersIcon },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Tableau de bord
        </h1>
        <p className="text-[15px] text-ink-muted">
          Ce qui demande votre attention, en premier.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      {/* ─── À traiter ─── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">À traiter</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/messages">
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gehmit/10 text-gehmit">
                  <MailIcon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-3xl font-semibold">
                    {data ? unreadMessagesCount : "…"}
                  </span>
                  <span className="text-[14px] text-muted-foreground">
                    message{unreadMessagesCount > 1 ? "s" : ""} non lu
                    {unreadMessagesCount > 1 ? "s" : ""}
                  </span>
                </div>
                {unreadMessagesCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">Nouveau</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link to="/candidatures">
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gehmit/10 text-gehmit">
                  <InboxIcon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-3xl font-semibold">
                    {data ? unreadCandidaturesCount : "…"}
                  </span>
                  <span className="text-[14px] text-muted-foreground">
                    candidature{unreadCandidaturesCount > 1 ? "s" : ""} à examiner
                  </span>
                </div>
                {unreadCandidaturesCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">Nouveau</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
        {data && pending === 0 && (
          <p className="rounded-lg border border-dashed px-4 py-3 text-[14px] text-muted-foreground">
            Rien en attente — toutes les demandes ont été traitées.
          </p>
        )}
      </section>

      {/* ─── Actions rapides ─── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.to} variant="outline" className="gap-2" render={<Link to={a.to} />}>
              <a.icon className="size-4" />
              {a.label}
            </Button>
          ))}
        </div>
      </section>

      {/* ─── Activité récente ─── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-[15px]">Derniers messages</CardTitle>
            <Link to="/messages" className="text-[13px] text-gehmit hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data ? (
              <span className="text-[14px] text-muted-foreground">Chargement…</span>
            ) : recentMessages.length === 0 ? (
              <span className="text-[14px] text-muted-foreground">Aucun message.</span>
            ) : (
              recentMessages.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-medium">
                      {m.name || m.email}
                      {!m.readFlag && (
                        <span className="ml-2 inline-block size-1.5 rounded-full bg-gehmit align-middle" />
                      )}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {m.subject || m.message}
                    </span>
                  </div>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    {fmtDate(m.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-[15px]">Dernières candidatures</CardTitle>
            <Link to="/candidatures" className="text-[13px] text-gehmit hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data ? (
              <span className="text-[14px] text-muted-foreground">Chargement…</span>
            ) : recentCandidatures.length === 0 ? (
              <span className="text-[14px] text-muted-foreground">Aucune candidature.</span>
            ) : (
              recentCandidatures.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-medium">
                      {[c.form.prenom, c.form.nom].filter(Boolean).join(" ") || c.program}
                      {!c.readFlag && (
                        <span className="ml-2 inline-block size-1.5 rounded-full bg-gehmit align-middle" />
                      )}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {c.program}
                    </span>
                  </div>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    {fmtDate(c.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-[15px]">Derniers abonnés</CardTitle>
            <Link to="/newsletter" className="text-[13px] text-gehmit hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!data ? (
              <span className="text-[14px] text-muted-foreground">Chargement…</span>
            ) : recentSubs.length === 0 ? (
              <span className="text-[14px] text-muted-foreground">Aucun abonné.</span>
            ) : (
              recentSubs.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-medium">
                      {s.name || s.email}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {s.source || "newsletter"}
                    </span>
                  </div>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    {fmtDate(s.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ─── Contenu du site ─── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Contenu du site</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <Link key={s.label} to={s.to}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col">
                    <span className="font-heading text-2xl font-semibold">
                      {s.value ?? "…"}
                    </span>
                    <span className="text-[13px] text-muted-foreground">{s.label}</span>
                  </div>
                  <ArrowRightIcon className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
