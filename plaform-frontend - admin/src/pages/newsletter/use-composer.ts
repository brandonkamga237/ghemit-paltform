import { useState } from "react"
import { api } from "@/lib/api"
import type { Campaign } from "@/lib/types"
import { toast } from "@gehmit/ui/components/toast"
import type { Newsletter } from "./use-newsletter"

const BASE = "/api/admin/newsletter"

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : undefined)

/**
 * Campagne en cours de rédaction : objet, corps (Markdown), audience,
 * brouillon repris, aperçu, enregistrement et envoi.
 */
export function useComposer(newsletter: Pick<Newsletter, "segments" | "activeCount" | "refresh">) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [audienceMode, setAudienceMode] = useState<"all" | "segment">("all")
  const [audience, setAudience] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const canSave = subject.trim() !== "" && body.trim() !== ""
  const targetCount =
    audienceMode === "all"
      ? newsletter.activeCount
      : newsletter.segments.reduce((a, [src, n]) => a + (audience.has(src) ? n : 0), 0)
  const payload = () => ({ subject, body, audience: audienceMode === "all" ? null : [...audience] })

  const toggleSegment = (src: string, on: boolean) =>
    setAudience((a) => {
      const next = new Set(a)
      if (on) next.add(src)
      else next.delete(src)
      return next
    })

  /**
   * Entoure la sélection du champ `ta` (ou insère au curseur) puis replace le
   * curseur après l'insertion. Le champ est passé par l'appelant : le hook ne
   * détient pas de ref, son état reste lisible pendant le rendu.
   */
  const insertAt = (ta: HTMLTextAreaElement | null, before: string, after = "", placeholder = "") => {
    if (!ta) {
      setBody((b) => b + before + placeholder + after)
      return
    }
    const { selectionStart: s, selectionEnd: e, value } = ta
    const sel = value.slice(s, e) || placeholder
    setBody(value.slice(0, s) + before + sel + after + value.slice(e))
    requestAnimationFrame(() => {
      ta.focus()
      const pos = s + before.length + sel.length + after.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const reset = () => {
    setSubject("")
    setBody("")
    setEditingId(null)
    setAudienceMode("all")
    setAudience(new Set())
  }

  /** Reprend un brouillon existant. */
  const load = (c: Campaign) => {
    setEditingId(c.id)
    setSubject(c.subject)
    setBody(c.body)
    setAudienceMode(c.audience.length ? "segment" : "all")
    setAudience(new Set(c.audience))
  }

  const openPreview = async () => {
    setPreviewLoading(true)
    try {
      setPreviewHtml((await api.post<{ html: string }>(`${BASE}/preview`, { body })).html)
    } catch (e) {
      toast.add({ title: "Aperçu impossible", description: errorMessage(e) })
    } finally {
      setPreviewLoading(false)
    }
  }

  const saveDraft = async () => {
    setSavingDraft(true)
    try {
      if (editingId) await api.put(`${BASE}/campaigns/${editingId}`, payload())
      else await api.post(`${BASE}/campaigns`, payload())
      toast.add({ title: "Brouillon enregistré" })
      reset()
      await newsletter.refresh()
    } catch (e) {
      toast.add({ title: "Enregistrement impossible", description: errorMessage(e) })
    } finally {
      setSavingDraft(false)
    }
  }

  const sendNow = async () => {
    setSending(true)
    try {
      if (editingId) {
        // Sauvegarde d'abord pour embarquer l'audience choisie.
        await api.put(`${BASE}/campaigns/${editingId}`, payload())
        await api.post(`${BASE}/campaigns/${editingId}/send`)
      } else {
        await api.post(`${BASE}/send`, payload())
      }
      toast.add({ title: "Envoi lancé", description: `${targetCount} destinataire(s) — envoi en arrière-plan.` })
      reset()
      await newsletter.refresh()
    } catch (e) {
      toast.add({ title: "Envoi impossible", description: errorMessage(e) })
    } finally {
      setSending(false)
    }
  }

  return {
    subject,
    setSubject,
    body,
    setBody,
    editingId,
    audienceMode,
    setAudienceMode,
    audience,
    toggleSegment,
    targetCount,
    canSave,
    insertAt,
    reset,
    load,
    preview: { html: previewHtml, loading: previewLoading, open: openPreview, close: () => setPreviewHtml(null) },
    saveDraft,
    savingDraft,
    sendNow,
    sending,
  }
}

export type Composer = ReturnType<typeof useComposer>
