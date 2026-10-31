import { useRef, type ReactNode } from "react"
import {
  BoldIcon,
  EyeIcon,
  Heading2Icon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  MinusIcon,
  MousePointerClickIcon,
  SaveIcon,
  SendIcon,
  TypeIcon,
} from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { sourceLabel } from "@/lib/newsletter"
import { Button } from "@gehmit/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gehmit/ui/components/card"
import { Checkbox } from "@gehmit/ui/components/checkbox"
import { Input } from "@gehmit/ui/components/input"
import { Label } from "@gehmit/ui/components/label"
import { Textarea } from "@gehmit/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gehmit/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@gehmit/ui/components/dialog"
import type { Composer } from "./use-composer"

const plural = (n: number) => (n > 1 ? "s" : "")

/** Rédaction d'une campagne : audience, objet, corps Markdown, aperçu, brouillon, envoi. */
export function ComposeTab({
  composer: m,
  segments,
  activeCount,
}: {
  composer: Composer
  segments: [string, number][]
  activeCount: number
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.editingId ? "Modifier le brouillon" : "Composer une campagne"}</CardTitle>
        <CardDescription>
          Gabarit Gehmit : logo, signature et coordonnées ajoutés automatiquement. Variables de fusion :{" "}
          {"{{prenom}}"}, {"{{nom}}"}, {"{{email}}"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AudiencePicker composer={m} segments={segments} activeCount={activeCount} />

        <div className="flex flex-col gap-1.5">
          <Label>Objet</Label>
          <Input
            value={m.subject}
            onChange={(e) => m.setSubject(e.target.value)}
            placeholder="Ex. Les inscriptions de novembre sont ouvertes"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <MarkdownToolbar insert={(...args) => m.insertAt(bodyRef.current, ...args)} />
          <Textarea
            ref={bodyRef}
            value={m.body}
            onChange={(e) => m.setBody(e.target.value)}
            placeholder={
              "Bonjour {{prenom}},\n\n## Titre de section\n\nVoici les nouvelles de Gehmit…\n\n- Premier point\n- Deuxième point\n\n[[Découvrir]](https://gehmit.org)"
            }
            className="min-h-56 rounded-t-none border-t-0 font-mono text-caption"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" disabled={m.preview.loading || !m.body.trim()} onClick={m.preview.open}>
            <EyeIcon className="size-4" />
            {m.preview.loading ? "Rendu…" : "Aperçu"}
          </Button>
          <Button variant="outline" className="gap-2" disabled={m.savingDraft || !m.canSave} onClick={m.saveDraft}>
            <SaveIcon className="size-4" />
            {m.savingDraft ? "Enregistrement…" : "Enregistrer le brouillon"}
          </Button>
          <Button className="gap-2" disabled={m.sending || !m.canSave || m.targetCount === 0} onClick={m.sendNow}>
            <SendIcon className="size-4" />
            {m.sending ? "Envoi…" : `Envoyer à ${m.targetCount} destinataire${plural(m.targetCount)}`}
          </Button>
          {m.editingId && (
            <Button variant="ghost" onClick={m.reset}>
              Annuler l'édition
            </Button>
          )}
        </div>
      </CardContent>

      <PreviewDialog html={m.preview.html} onClose={m.preview.close} />
    </Card>
  )
}

function ChoiceChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-caption font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60"
      )}
    >
      {children}
    </button>
  )
}

/** Tous les abonnés actifs, ou un ciblage par origine d'inscription. */
function AudiencePicker({
  composer: m,
  segments,
  activeCount,
}: {
  composer: Composer
  segments: [string, number][]
  activeCount: number
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border p-4">
      <Label className="text-small">Destinataires</Label>
      <div className="flex flex-wrap gap-2">
        <ChoiceChip active={m.audienceMode === "all"} onClick={() => m.setAudienceMode("all")}>
          Tous les abonnés actifs ({activeCount})
        </ChoiceChip>
        <ChoiceChip active={m.audienceMode === "segment"} onClick={() => m.setAudienceMode("segment")}>
          Cibler par origine
        </ChoiceChip>
      </div>
      {m.audienceMode === "segment" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {segments.map(([src, n]) => (
            <label
              key={src}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-caption transition-colors",
                m.audience.has(src) ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
            >
              <Checkbox checked={m.audience.has(src)} onCheckedChange={(v) => m.toggleSegment(src, v === true)} />
              {sourceLabel(src)}
              <span className="text-ink-faint tabular-nums">{n}</span>
            </label>
          ))}
        </div>
      )}
      <span className="text-caption text-ink-faint">
        {m.targetCount} destinataire{plural(m.targetCount)} recevra{m.targetCount > 1 ? "ont" : ""} cette campagne.
      </span>
    </div>
  )
}

const TOOLS: { title: string; icon: typeof BoldIcon; args: [string, string?, string?] }[] = [
  { title: "Gras", icon: BoldIcon, args: ["**", "**", "gras"] },
  { title: "Italique", icon: ItalicIcon, args: ["*", "*", "italique"] },
  { title: "Titre de section", icon: Heading2Icon, args: ["\n## ", "", "Titre"] },
  { title: "Lien", icon: Link2Icon, args: ["[", "](https://)", "texte"] },
  { title: "Liste", icon: ListIcon, args: ["\n- ", "\n- ", "élément"] },
  { title: "Bouton", icon: MousePointerClickIcon, args: ["\n[[", "]](https://)", "Découvrir"] },
  { title: "Séparateur", icon: MinusIcon, args: ["\n---\n"] },
]

/** Barre de mise en forme Markdown et insertion des variables de fusion. */
function MarkdownToolbar({ insert }: { insert: (before: string, after?: string, placeholder?: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/40 px-2 py-1.5">
      {TOOLS.map((t) => (
        <button
          key={t.title}
          type="button"
          title={t.title}
          aria-label={t.title}
          onClick={() => insert(...t.args)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <t.icon className="size-4" />
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-border" />
      <Select value="" onValueChange={(v) => v && insert(`{{${v}}}`)}>
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
  )
}

/** Rendu exact de l'e-mail, isolé dans une iframe sans droits. */
function PreviewDialog({ html, onClose }: { html: string | null; onClose: () => void }) {
  return (
    <Dialog open={html !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Aperçu de l'e-mail</DialogTitle>
          <DialogDescription>
            Rendu fidèle du gabarit envoyé aux abonnés (lien de désinscription factice).
          </DialogDescription>
        </DialogHeader>
        <iframe title="Aperçu de l'e-mail" srcDoc={html ?? ""} sandbox="" className="h-[60vh] w-full rounded-lg border bg-surface" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
