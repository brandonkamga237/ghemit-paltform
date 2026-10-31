import { useEffect, useMemo, useState } from "react"
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
import { candidateName, programLabel } from "@/lib/inbox"
import { campaignStatus } from "@/lib/newsletter"

/** Données brutes chargées pour le tableau de bord. */
interface Raw {
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

export interface FeedItem {
  kind: "candidature" | "message" | "subscriber" | "campaign"
  title: string
  detail: string
  at: string
  to: string
}

export interface AttentionItem {
  title: string
  detail: string
  at: string
  to: string
  tag: string
}

export type Dashboard = ReturnType<typeof derive>

const byDateDesc = <T extends { at: string }>(a: T, b: T) => b.at.localeCompare(a.at)

/** Agrégats affichés : séries, compteurs, fil d'activité, éléments à traiter. */
function derive(raw: Raw) {
  const articles = raw.content.articles ?? []
  const articleDrafts = articles.filter((a) => a.payload.status === "draft")
  const upcomingEvents = (raw.content.events ?? [])
    .filter((e) => e.payload.upcoming !== false && e.payload.status !== "cancelled")
    .sort((a, b) => String(a.payload.date).localeCompare(String(b.payload.date)))

  const feed: FeedItem[] = [
    ...raw.candidatures.map((c) => ({
      kind: "candidature" as const,
      title: candidateName(c),
      detail: `Candidature ${programLabel(c.program)}`,
      at: c.createdAt,
      to: "/candidatures",
    })),
    ...raw.messages.map((m) => ({
      kind: "message" as const,
      title: m.name || m.email,
      detail: m.subject || m.message,
      at: m.createdAt,
      to: "/messages",
    })),
    ...raw.subs.slice(0, 5).map((s) => ({
      kind: "subscriber" as const,
      title: s.name || s.email,
      detail: "Nouvel abonné newsletter",
      at: s.createdAt,
      to: "/newsletter",
    })),
    ...raw.campaigns.slice(0, 3).map((c) => ({
      kind: "campaign" as const,
      title: `Campagne « ${c.subject} »`,
      detail: c.status === "sent" ? `${c.recipientCount} destinataire(s)` : campaignStatus(c.status).label,
      at: c.sentAt ?? c.createdAt,
      to: "/newsletter",
    })),
  ]
    .sort(byDateDesc)
    .slice(0, 8)

  const attention: AttentionItem[] = [
    ...raw.messages
      .filter((m) => !m.readFlag)
      .map((m) => ({ title: m.name || m.email, detail: m.subject || m.message, at: m.createdAt, to: "/messages?read=unread", tag: "Message" })),
    ...raw.candidatures
      .filter((c) => c.status === "new")
      .map((c) => ({ title: candidateName(c), detail: programLabel(c.program), at: c.createdAt, to: "/candidatures?status=new", tag: "Candidature" })),
    ...articleDrafts.map((a) => ({
      title: String(a.payload.title ?? "Sans titre"),
      detail: "Brouillon à publier",
      at: a.updatedAt,
      to: "/articles",
      tag: "Brouillon",
    })),
  ]
    .sort(byDateDesc)
    .slice(0, 7)

  const newCands = raw.candSummary.byStatus.new ?? 0
  const unreadMsgs = raw.msgSummary.unread

  return {
    ...raw,
    candSeries: raw.inbox.map((d) => d.candidatures),
    msgSeries: raw.inbox.map((d) => d.messages),
    subSeries: raw.subsActivity.map((d) => d.count),
    activeSubs: raw.subs.filter((s) => s.active).length,
    articleDrafts: articleDrafts.length,
    upcomingEvents,
    feed,
    attention,
    newCands,
    unreadMsgs,
    pending: newCands + unreadMsgs,
  }
}

/** Charge en parallèle tout ce qu'affiche le tableau de bord. `dash` reste null pendant le chargement. */
export function useDashboard() {
  const [raw, setRaw] = useState<Raw | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      .then(([inbox, subsActivity, subs, campaigns, msgSummary, candSummary, messages, candidatures, content, media]) =>
        setRaw({
          inbox,
          subsActivity,
          subs,
          campaigns,
          msgSummary,
          candSummary,
          messages: messages.content,
          candidatures: candidatures.content,
          content,
          media,
        })
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
  }, [])

  const dash = useMemo(() => (raw ? derive(raw) : null), [raw])
  return { dash, error }
}

/** Évolution (%) de la dernière période par rapport à la précédente. */
export function deltaOf(series: number[], span: number): number | null {
  const cur = series.slice(-span).reduce((a, b) => a + b, 0)
  const prev = series.slice(-2 * span, -span).reduce((a, b) => a + b, 0)
  if (prev === 0) return cur > 0 ? 100 : null
  return Math.round(((cur - prev) / prev) * 100)
}
