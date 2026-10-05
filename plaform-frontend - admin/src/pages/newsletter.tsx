import { useCallback, useEffect, useRef, useState } from "react"
import { EyeIcon, PencilIcon, SaveIcon, SearchIcon, SendIcon, Trash2Icon } from "lucide-react"
import { api } from "@/lib/api"
import type { Campaign, CampaignStatus, Subscriber } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_LABELS: Record<CampaignStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sending: { label: "Envoi en cours", variant: "outline" },
  sent: { label: "Envoyée", variant: "default" },
  failed: { label: "Échec", variant: "destructive" },
}

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [subs, camps] = await Promise.all([
        api.get<Subscriber[]>("/api/admin/newsletter/subscribers"),
        api.get<Campaign[]>("/api/admin/newsletter/campaigns"),
      ])
      setSubscribers(subs)
      setCampaigns(camps)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Recharge tant qu'une campagne est en cours d'envoi.
  useEffect(() => {
    const sendingCampaign = campaigns.some((c) => c.status === "sending")
    if (sendingCampaign && pollRef.current === null) {
      pollRef.current = window.setInterval(() => void refresh(), 3000)
    } else if (!sendingCampaign && pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [campaigns, refresh])

  const activeCount = subscribers.filter((s) => s.active).length
  const canCompose = subject.trim() !== "" && body.trim() !== ""
  const [subQuery, setSubQuery] = useState("")
  const [tab, setTab] = useState("compose")
  const draftCount = campaigns.filter((c) => c.status === "draft").length
  const visibleSubs = subscribers.filter((s) => {
    const v = subQuery.trim().toLowerCase()
    return !v || `${s.name ?? ""} ${s.email} ${s.source ?? ""}`.toLowerCase().includes(v)
  })

  const openPreview = async () => {
    setPreviewLoading(true)
    try {
      const res = await api.post<{ html: string }>("/api/admin/newsletter/preview", { body })
      setPreviewHtml(res.html)
    } catch (e) {
      toast.add({ title: "Aperçu impossible", description: e instanceof Error ? e.message : undefined })
    } finally {
      setPreviewLoading(false)
    }
  }

  const resetCompose = () => {
    setSubject("")
    setBody("")
    setEditingId(null)
  }

  const saveDraft = async () => {
    setSavingDraft(true)
    try {
      if (editingId) {
        await api.put(`/api/admin/newsletter/campaigns/${editingId}`, { subject, body })
      } else {
        await api.post("/api/admin/newsletter/campaigns", { subject, body })
      }
      toast.add({ title: "Brouillon enregistré" })
      resetCompose()
      await refresh()
    } catch (e) {
      toast.add({ title: "Enregistrement impossible", description: e instanceof Error ? e.message : undefined })
    } finally {
      setSavingDraft(false)
    }
  }

  const sendNow = async () => {
    setSending(true)
    try {
      if (editingId) {
        await api.post(`/api/admin/newsletter/campaigns/${editingId}/send`)
      } else {
        await api.post("/api/admin/newsletter/send", { subject, body })
      }
      toast.add({ title: "Envoi lancé", description: `${activeCount} destinataire(s) — envoi en arrière-plan.` })
      resetCompose()
      await refresh()
    } catch (e) {
      toast.add({ title: "Envoi impossible", description: e instanceof Error ? e.message : undefined })
    } finally {
      setSending(false)
    }
  }

  const sendDraft = async (id: string) => {
    try {
      await api.post(`/api/admin/newsletter/campaigns/${id}/send`)
      toast.add({ title: "Envoi lancé", description: "Envoi en arrière-plan." })
      await refresh()
    } catch (e) {
      toast.add({ title: "Envoi impossible", description: e instanceof Error ? e.message : undefined })
    }
  }

  const deleteDraft = async (id: string) => {
    try {
      await api.del(`/api/admin/newsletter/campaigns/${id}`)
      if (editingId === id) resetCompose()
      toast.add({ title: "Brouillon supprimé" })
      await refresh()
    } catch (e) {
      toast.add({ title: "Suppression impossible", description: e instanceof Error ? e.message : undefined })
    }
  }

  const remove = async (id: string) => {
    try {
      await api.del(`/api/admin/newsletter/subscribers/${id}`)
      await refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Newsletter
        </h1>
        <p className="text-[15px] text-ink-muted">
          {activeCount} abonné(s) actif(s). Chaque e-mail emporte un lien de
          désinscription signé.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="compose">Composer</TabsTrigger>
          <TabsTrigger value="campaigns">
            Campagnes
            {draftCount > 0 && (
              <Badge variant="secondary" className="ml-1.5">{draftCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            Abonnés
            <Badge variant="secondary" className="ml-1.5">{subscribers.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ─── Composer ─── */}
        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Modifier le brouillon" : "Composer une campagne"}</CardTitle>
              <CardDescription>
                Mise en forme : **gras**, *italique*, [lien](https://…), lignes « - » pour les listes.
                Le rendu est celui du gabarit Gehmit (en-tête et pied de page inclus).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Objet</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex. Les inscriptions de novembre sont ouvertes"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Message</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Bonjour,\n\nVoici les nouvelles de Gehmit…\n\n- Premier point\n- Deuxième point"}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={previewLoading || !body.trim()}
                  onClick={openPreview}
                >
                  <EyeIcon className="size-4" />
                  {previewLoading ? "Rendu…" : "Aperçu"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={savingDraft || !canCompose}
                  onClick={saveDraft}
                >
                  <SaveIcon className="size-4" />
                  {savingDraft ? "Enregistrement…" : "Enregistrer le brouillon"}
                </Button>
                <Button
                  className="gap-2"
                  disabled={sending || !canCompose || activeCount === 0}
                  onClick={sendNow}
                >
                  <SendIcon className="size-4" />
                  {sending ? "Envoi…" : `Envoyer à ${activeCount} abonné(s)`}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={resetCompose}>
                    Annuler l'édition
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Campagnes ─── */}
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes</CardTitle>
              <CardDescription>Brouillons et historique d'envois.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {campaigns.length === 0 && (
                <div className="flex flex-col items-start gap-3 py-8">
                  <p className="text-[14px] text-muted-foreground">
                    Aucune campagne pour le moment.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setTab("compose")}>
                    Composer la première campagne
                  </Button>
                </div>
              )}
              {campaigns.map((c) => {
                const st = STATUS_LABELS[c.status] ?? STATUS_LABELS.sent
                return (
                  <div key={c.id} className="group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-primary/40">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[15px] font-semibold">{c.subject}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <span className="truncate text-[13px] text-muted-foreground">
                        {c.status === "draft"
                          ? `Créée le ${new Date(c.createdAt).toLocaleString("fr-FR")}`
                          : `${c.sentAt ? new Date(c.sentAt).toLocaleString("fr-FR") : "—"} — ${c.recipientCount} destinataire(s)`}
                      </span>
                    </div>
                    {c.status === "draft" && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setEditingId(c.id)
                            setSubject(c.subject)
                            setBody(c.body)
                            setTab("compose")
                          }}
                        >
                          <PencilIcon className="size-3.5" />
                          Reprendre
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Envoyer"
                          onClick={() => void sendDraft(c.id)}
                        >
                          <SendIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Supprimer"
                          onClick={() => void deleteDraft(c.id)}
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Abonnés ─── */}
        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 pb-3">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Abonnés</CardTitle>
                <CardDescription>
                  {activeCount} actif{activeCount > 1 ? "s" : ""} / {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="relative w-[260px]">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={subQuery}
                  onChange={(e) => setSubQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nom</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Origine</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleSubs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6">{s.name || "—"}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.source || "newsletter"}</Badge>
                      </TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <Badge variant={s.active ? "default" : "outline"}>
                          {s.active ? "Actif" : "Désinscrit"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void remove(s.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visibleSubs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        {subQuery
                          ? `Aucun abonné ne correspond à « ${subQuery} ».`
                          : "Aucun abonné pour le moment."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={previewHtml !== null} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-h-[90vh] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'e-mail</DialogTitle>
            <DialogDescription>
              Rendu fidèle du gabarit envoyé aux abonnés (lien de désinscription factice).
            </DialogDescription>
          </DialogHeader>
          <iframe
            title="Aperçu de l'e-mail"
            srcDoc={previewHtml ?? ""}
            sandbox=""
            className="h-[60vh] w-full rounded-lg border bg-white"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewHtml(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
