import { useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import type { Campaign, Subscriber } from "@/lib/types"
import { toast } from "@gehmit/ui/components/toast"
import { useResource } from "@/lib/use-resource"

const BASE = "/api/admin/newsletter"

/** Intervalle de rechargement pendant qu'une campagne part. */
const POLL_MS = 3000

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : undefined)

/** Abonnés et campagnes : chargement, suivi des envois en cours, actions sur les brouillons et les abonnés. */
export function useNewsletter() {
  const res = useResource(async () => {
    const [subscribers, campaigns] = await Promise.all([
      api.get<Subscriber[]>(`${BASE}/subscribers`),
      api.get<Campaign[]>(`${BASE}/campaigns`),
    ])
    return { subscribers, campaigns }
  }, [])
  const subscribers = useMemo(() => res.data?.subscribers ?? [], [res.data])
  const campaigns = res.data?.campaigns ?? []
  const { error, reload: refresh } = res

  // Recharge tant qu'une campagne est en cours d'envoi.
  const sendingInProgress = campaigns.some((c) => c.status === "sending")
  useEffect(() => {
    if (!sendingInProgress) return
    const id = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(id)
  }, [sendingInProgress, refresh])

  /** Abonnés actifs regroupés par origine d'inscription, du plus gros segment au plus petit. */
  const segments = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of subscribers) {
      if (!s.active) continue
      const src = s.source || "newsletter"
      counts.set(src, (counts.get(src) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [subscribers])

  const run = async (action: () => Promise<unknown>, success: string, failure: string, description?: string) => {
    try {
      await action()
      toast.add({ title: success, description })
      refresh()
      return true
    } catch (e) {
      toast.add({ title: failure, description: errorMessage(e) })
      return false
    }
  }

  const sendDraft = (id: string) =>
    run(() => api.post(`${BASE}/campaigns/${id}/send`), "Envoi lancé", "Envoi impossible", "Envoi en arrière-plan.")

  const deleteDraft = (id: string) => run(() => api.del(`${BASE}/campaigns/${id}`), "Brouillon supprimé", "Suppression impossible")

  const removeSubscriber = (id: string) =>
    run(() => api.del(`${BASE}/subscribers/${id}`), "Abonné supprimé", "Suppression impossible")

  return {
    subscribers,
    campaigns,
    error,
    refresh,
    segments,
    activeCount: subscribers.filter((s) => s.active).length,
    draftCount: campaigns.filter((c) => c.status === "draft").length,
    sendDraft,
    deleteDraft,
    removeSubscriber,
  }
}

export type Newsletter = ReturnType<typeof useNewsletter>
