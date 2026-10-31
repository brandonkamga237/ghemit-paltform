import { useState } from "react"
import { PencilIcon, SearchIcon, SendIcon, Trash2Icon } from "lucide-react"
import type { Campaign, Subscriber } from "@/lib/types"
import { campaignStatus, sourceLabel } from "@/lib/newsletter"
import { Panel } from "@/components/admin/panel"
import { Badge } from "@gehmit/ui/components/badge"
import { Button } from "@gehmit/ui/components/button"
import { Input } from "@gehmit/ui/components/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gehmit/ui/components/table"

const plural = (n: number) => (n > 1 ? "s" : "")

/** Brouillons (reprendre, envoyer, supprimer) et historique des envois. */
export function CampaignsTab({
  campaigns,
  onCompose,
  onEdit,
  onSend,
  onDelete,
}: {
  campaigns: Campaign[]
  onCompose: () => void
  onEdit: (c: Campaign) => void
  onSend: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Panel title="Campagnes" description="Brouillons et historique d'envois." contentClassName="flex flex-col gap-3">
      {campaigns.length === 0 && (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-small text-muted-foreground">Aucune campagne pour le moment.</p>
          <Button variant="outline" size="sm" onClick={onCompose}>
            Composer la première campagne
          </Button>
        </div>
      )}
      {campaigns.map((c) => {
        const st = campaignStatus(c.status)
        const when =
          c.status === "draft"
            ? `Créée le ${new Date(c.createdAt).toLocaleString("fr-FR")}`
            : `${c.sentAt ? new Date(c.sentAt).toLocaleString("fr-FR") : "—"} — ${c.recipientCount} destinataire(s)`
        const target =
          c.audience.length === 0 ? "tous les abonnés" : `${c.audience.length} origine${plural(c.audience.length)}`
        return (
          <div
            key={c.id}
            className="group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-primary/40"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-small font-semibold">{c.subject}</span>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              <span className="truncate text-caption text-muted-foreground">
                {when} · {target}
              </span>
            </div>
            {c.status === "draft" && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(c)}>
                  <PencilIcon className="size-3.5" />
                  Reprendre
                </Button>
                <Button variant="ghost" size="icon" aria-label="Envoyer" onClick={() => onSend(c.id)}>
                  <SendIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => onDelete(c.id)}>
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </Panel>
  )
}

/** Liste des abonnés, filtrable par nom, e-mail ou origine. */
export function SubscribersTab({
  subscribers,
  activeCount,
  onRemove,
}: {
  subscribers: Subscriber[]
  activeCount: number
  onRemove: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const visible = q
    ? subscribers.filter((s) => `${s.name ?? ""} ${s.email} ${sourceLabel(s.source)}`.toLowerCase().includes(q))
    : subscribers

  return (
    <Panel
      title="Abonnés"
      description={`${activeCount} actif${plural(activeCount)} / ${subscribers.length} inscrit${plural(subscribers.length)}`}
      action={
        <div className="relative w-64">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className="pl-9" />
        </div>
      }
      contentClassName="px-0"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Nom</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Origine</TableHead>
            <TableHead>Inscrit le</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="pl-6">{s.name || "—"}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{sourceLabel(s.source)}</Badge>
              </TableCell>
              <TableCell>{new Date(s.createdAt).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                <Badge variant={s.active ? "default" : "outline"}>{s.active ? "Actif" : "Désinscrit"}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onRemove(s.id)} aria-label="Supprimer">
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                {query ? `Aucun abonné ne correspond à « ${query} ».` : "Aucun abonné pour le moment."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Panel>
  )
}
