import { useCallback, useEffect, useState } from "react"
import { SendIcon, Trash2Icon } from "lucide-react"
import { api } from "@/lib/api"
import type { Campaign, Subscriber } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const activeCount = subscribers.filter((s) => s.active).length

  const send = async () => {
    setSending(true)
    try {
      const campaign = await api.post<Campaign>("/api/admin/newsletter/send", {
        subject,
        body,
      })
      toast.add({
        title: "Campagne envoyée",
        description: `${campaign.recipientCount} destinataire(s) — visible dans Mailhog (http://localhost:8025)`,
      })
      setSubject("")
      setBody("")
      await refresh()
    } catch (e) {
      toast.add({
        title: "Envoi impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setSending(false)
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
          {activeCount} abonné(s) actif(s). Les e-mails partent vers Mailhog en
          développement.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Envoyer une campagne</CardTitle>
          <CardDescription>
            Envoyée à tous les abonnés actifs via le serveur SMTP configuré.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Objet</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex. Les inscriptions de septembre sont ouvertes"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Texte de l'e-mail…"
              className="min-h-[140px]"
            />
          </div>
          <Button
            className="gap-2 self-start"
            disabled={sending || !subject.trim() || !body.trim() || activeCount === 0}
            onClick={send}
          >
            <SendIcon className="size-4" />
            {sending ? "Envoi…" : `Envoyer à ${activeCount} abonné(s)`}
          </Button>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Abonnés ({subscribers.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">E-mail</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6">{s.email}</TableCell>
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
                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Aucun abonné pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campagnes envoyées</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {campaigns.length === 0 && (
              <p className="text-[14px] text-muted-foreground">Aucune campagne envoyée.</p>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="flex flex-col gap-1 rounded-md border px-4 py-3">
                <span className="text-[15px] font-semibold">{c.subject}</span>
                <span className="text-[13px] text-muted-foreground">
                  {new Date(c.sentAt).toLocaleString("fr-FR")} — {c.recipientCount}{" "}
                  destinataire(s)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
