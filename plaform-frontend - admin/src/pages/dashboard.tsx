import { useEffect, useState } from "react"
import { Link } from "react-router"
import { api } from "@/lib/api"
import type {
  Candidature,
  ContactMessage,
  ContentItem,
  MediaFile,
  Subscriber,
} from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Counts {
  programs: number
  articles: number
  formations: number
  subscribers: number
  unreadMessages: number
  unreadCandidatures: number
  media: number
}

export function DashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Record<string, ContentItem[]>>("/api/admin/content"),
      api.get<Subscriber[]>("/api/admin/newsletter/subscribers"),
      api.get<ContactMessage[]>("/api/admin/messages"),
      api.get<Candidature[]>("/api/admin/candidatures"),
      api.get<MediaFile[]>("/api/admin/media"),
    ])
      .then(([content, subs, messages, candidatures, media]) =>
        setCounts({
          programs: content.programs?.length ?? 0,
          articles: content.articles?.length ?? 0,
          formations: content.formations?.length ?? 0,
          subscribers: subs.filter((s) => s.active).length,
          unreadMessages: messages.filter((m) => !m.readFlag).length,
          unreadCandidatures: candidatures.filter((c) => !c.readFlag).length,
          media: media.length,
        })
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
  }, [])

  const cards = [
    { label: "Programmes", value: counts?.programs, to: "/programmes" },
    { label: "Formations", value: counts?.formations, to: "/formations" },
    { label: "Articles", value: counts?.articles, to: "/articles" },
    { label: "Abonnés newsletter", value: counts?.subscribers, to: "/newsletter" },
    { label: "Messages non lus", value: counts?.unreadMessages, to: "/messages" },
    { label: "Candidatures non lues", value: counts?.unreadCandidatures, to: "/messages" },
    { label: "Médias", value: counts?.media, to: "/medias" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Tableau de bord
        </h1>
        <p className="text-[15px] text-ink-muted">
          Vue d'ensemble du contenu du site public.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="font-heading text-4xl font-semibold">
                  {c.value ?? "…"}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
