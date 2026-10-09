import { useCallback, useEffect, useRef, useState } from "react"
import {
  BoldIcon,
  EyeIcon,
  Heading2Icon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  MinusIcon,
  MousePointerClickIcon,
  PencilIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [audienceMode, setAudienceMode] = useState<"all" | "segment">("all")
  const [audience, setAudience] = useState<Set<string>>(new Set())
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const draftCount = campaigns.filter((c) => c.status === "draft").length
  const visibleSubs = subscribers.filter((s) => {
    const v = subQuery.trim().toLowerCase()
    return !v || `${s.name ?? ""} ${s.email} ${s.source ?? ""}`.toLowerCase().includes(v)
  })

  /* Origines d'inscription → segments ciblables avec compteur d'actifs. */
  const segments = (() => {
    const map = new Map<string, number>()
    for (const s of subscribers) {
      if (!s.active) continue
      const src = s.source || "newsletter"
      map.set(src, (map.get(src) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()
  const targetCount =
    audienceMode === "all"
      ? activeCount
      : segments.reduce((a, [src, n]) => a + (audience.has(src) ? n : 0), 0)
  const audiencePayload = audienceMode === "all" ? null : [...audience]

  /* Éditeur : entoure la sélection ou insère au curseur. */
  const insertAt = (before: string, after = "", placeholder = "") => {
    const ta = bodyRef.current
    if (!ta) {
      setBody((b) => b + before + placeholder + after)
      return
    }
    const { selectionStart: s, selectionEnd: e, value } = ta
    const sel = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    setBody(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = s + before.length + sel.length + after.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const sourceLabel = (src: string) =>
    src.startsWith("candidature:")
      ? `Candidature · ${src.slice("candidature:".length)}`
      : { contact: "Formulaire de contact", newsletter: "Newsletter", site: "Site" }[src] ?? src

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
    setAudienceMode("all")
    setAudience(new Set())
  }

  const saveDraft = async () => {
    setSavingDraft(true)
    try {
      if (editingId) {
        await api.put(`/api/admin/newsletter/campaigns/${editingId}`, { subject, body, audience: audiencePayload })
      } else {
        await api.post("/api/admin/newsletter/campaigns", { subject, body, audience: audiencePayload })
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
        // Sauvegarde d'abord pour embarquer l'audience choisie.
        await api.put(`/api/admin/newsletter/campaigns/${editingId}`, { subject, body, audience: audiencePayload })
        await api.post(`/api/admin/newsletter/campaigns/${editingId}/send`)
      } else {
        await api.post("/api/admin/newsletter/send", { subject, body, audience: audiencePayload })
      }
      toast.add({ title: "Envoi lancé", description: `${targetCount} destinataire(s) — envoi en arrière-plan.` })
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
    <div className="flex flex-col gap-group">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Newsletter
        </h1>
        <p className="text-small text-ink-muted">
          {activeCount} abonné(s) actif(s). Chaque e-mail emporte un lien de
          désinscription signé.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
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
                Gabarit Gehmit : logo, signature et coordonnées ajoutés automatiquement.
                Variables de fusion : {"{{prenom}}"}, {"{{nom}}"}, {"{{email}}"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Audience */}
              <div className="flex flex-col gap-2.5 rounded-lg border p-4">
                <Label className="text-small">Destinataires</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAudienceMode("all")}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      audienceMode === "all"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/60"
                    }`}
                  >
                    Tous les abonnés actifs ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceMode("segment")}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      audienceMode === "segment"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/60"
                    }`}
                  >
                    Cibler par origine
                  </button>
                </div>
                {audienceMode === "segment" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {segments.map(([src, n]) => (
                      <label
                        key={src}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                          audience.has(src) ? "border-primary bg-primary/5" : "hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={audience.has(src)}
                          onCheckedChange={(v) =>
                            setAudience((a) => {
                              const next = new Set(a)
                              if (v === true) next.add(src)
                              else next.delete(src)
                              return next
                            })
                          }
                        />
                        {sourceLabel(src)}
                        <span className="text-ink-faint tabular-nums">{n}</span>
                      </label>
                    ))}
                  </div>
                )}
                <span className="text-caption text-ink-faint">
                  {targetCount} destinataire{targetCount > 1 ? "s" : ""} recevra{targetCount > 1 ? "ont" : ""} cette campagne.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Objet</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex. Les inscriptions de novembre sont ouvertes"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/40 px-2 py-1.5">
                  <ToolButton title="Gras" onClick={() => insertAt("**", "**", "gras")}>
                    <BoldIcon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Italique" onClick={() => insertAt("*", "*", "italique")}>
                    <ItalicIcon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Titre de section" onClick={() => insertAt("\n## ", "", "Titre")}>
                    <Heading2Icon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Lien" onClick={() => insertAt("[", "](https://)", "texte")}>
                    <Link2Icon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Liste" onClick={() => insertAt("\n- ", "\n- ", "élément")}>
                    <ListIcon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Bouton" onClick={() => insertAt("\n[[", "]](https://)", "Découvrir")}>
                    <MousePointerClickIcon className="size-4" />
                  </ToolButton>
                  <ToolButton title="Séparateur" onClick={() => insertAt("\n---\n")}>
                    <MinusIcon className="size-4" />
                  </ToolButton>
                  <span className="mx-1 h-5 w-px bg-border" />
                  <Select
                    value=""
                    onValueChange={(v) => v && insertAt(`{{${v}}}`)}
                  >
                    <SelectTrigger className="h-7 w-auto gap-1.5 border-0 bg-transparent text-caption shadow-none">
                      <TypeIcon className="size-3.5" />
                      <SelectValue placeholder="Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prenom">{"{{prenom}}"} — prénom</SelectItem>
                      <SelectItem value="nom">{"{{nom}}"} — nom complet</SelectItem>
                      <SelectItem value="email">{"{{email}}"} — e-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Bonjour {{prenom}},\n\n## Titre de section\n\nVoici les nouvelles de Gehmit…\n\n- Premier point\n- Deuxième point\n\n[[Découvrir]](https://gehmit.org)"}
                  className="min-h-[220px] rounded-t-none border-t-0 font-mono text-caption"
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
                  disabled={sending || !canCompose || targetCount === 0}
                  onClick={sendNow}
                >
                  <SendIcon className="size-4" />
                  {sending ? "Envoi…" : `Envoyer à ${targetCount} destinataire${targetCount > 1 ? "s" : ""}`}
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
                  <p className="text-small text-muted-foreground">
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
                        <span className="truncate text-small font-semibold">{c.subject}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <span className="truncate text-caption text-muted-foreground">
                        {c.status === "draft"
                          ? `Créée le ${new Date(c.createdAt).toLocaleString("fr-FR")}`
                          : `${c.sentAt ? new Date(c.sentAt).toLocaleString("fr-FR") : "—"} — ${c.recipientCount} destinataire(s)`}
                        {" · "}
                        {c.audience.length === 0
                          ? "tous les abonnés"
                          : `${c.audience.length} origine${c.audience.length > 1 ? "s" : ""}`}
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
                            setAudienceMode(c.audience.length ? "segment" : "all")
                            setAudience(new Set(c.audience))
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

function ToolButton({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}
