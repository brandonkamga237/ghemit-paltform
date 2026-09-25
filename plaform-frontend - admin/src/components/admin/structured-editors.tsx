import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { ImageField } from "@/components/admin/media-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Éditeur de blocs (corps d'article : paragraphes, intertitres, citations) ──

export interface Block {
  type: "p" | "h2" | "quote" | "image"
  /** Texte du bloc ; pour « image », c'est la légende (facultative). */
  text: string
  /** Pour « image » : URL du média choisi. */
  url?: string
}

const BLOCK_TYPES: { value: Block["type"]; label: string }[] = [
  { value: "p", label: "Paragraphe" },
  { value: "h2", label: "Intertitre" },
  { value: "quote", label: "Citation" },
  { value: "image", label: "Image" },
]

export function BlocksField({
  value,
  onChange,
}: {
  value: Block[]
  onChange: (blocks: Block[]) => void
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    const [b] = next.splice(i, 1)
    next.splice(j, 0, b)
    onChange(next)
  }

  const update = (i: number, patch: Partial<Block>) => {
    const next = value.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-[14px] font-semibold">Corps de l'article</Label>
      <div className="flex flex-col gap-3">
        {value.map((block, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Select
                value={block.type}
                onValueChange={(v) => update(i, { type: v as Block["type"] })}
              >
                <SelectTrigger className="w-[160px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-0.5">
                <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Monter">
                  <ArrowUpIcon className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Descendre">
                  <ArrowDownIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  aria-label="Supprimer le bloc"
                >
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
            {block.type === "image" ? (
              <>
                <ImageField
                  label="Image du bloc"
                  value={block.url ?? ""}
                  onChange={(url) => update(i, { url })}
                />
                <Input
                  value={block.text}
                  onChange={(e) => update(i, { text: e.target.value })}
                  placeholder="Légende (facultative)"
                />
              </>
            ) : (
              <Textarea
                value={block.text}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder={
                  block.type === "h2"
                    ? "Titre de section…"
                    : block.type === "quote"
                      ? "« Une citation marquante… »"
                      : "Votre paragraphe… Pour un lien : [libellé](https://…)"
                }
                rows={block.type === "p" ? 4 : 2}
                className={block.type === "quote" ? "italic" : ""}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {BLOCK_TYPES.map((t) => (
          <Button
            key={t.value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...value, { type: t.value, text: "" }])}
          >
            <PlusIcon className="mr-1 size-3.5" />
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ─── Encart CTA d'article (titre + texte + bouton) ────────────────────────────

export interface ArticleCta {
  title: string
  text: string
  label: string
  to: string
}

export function ArticleCtaField({
  value,
  onChange,
}: {
  value: ArticleCta | null
  onChange: (cta: ArticleCta | null) => void
}) {
  const cta = value ?? { title: "", text: "", label: "", to: "" }
  const empty = !value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={!empty}
          onCheckedChange={(v) => onChange(v === true ? cta : null)}
        />
        <Label className="text-[14px] font-semibold">Encart d'appel à l'action en fin d'article</Label>
      </div>
      {!empty && (
        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
          <LabeledInput label="Titre de l'encart" value={cta.title} onChange={(v) => onChange({ ...cta, title: v })} placeholder="Ex. Rejoindre le programme" />
          <LabeledInput label="Texte" value={cta.text} onChange={(v) => onChange({ ...cta, text: v })} placeholder="Ex. Candidatures ouvertes…" />
          <LabeledInput label="Libellé du bouton" value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} placeholder="Ex. Candidater" />
          <LabeledInput label="Lien du bouton" value={cta.to} onChange={(v) => onChange({ ...cta, to: v })} placeholder="/candidature/paei" />
        </div>
      )}
    </div>
  )
}

// ─── Bouton de programme (CTA principal / secondaire) ────────────────────────

export interface LinkCta {
  label: string
  to: string
  disabled?: boolean
}

export function LinkCtaField({
  value,
  onChange,
  label,
}: {
  value: LinkCta | null
  onChange: (cta: LinkCta | null) => void
  label: string
}) {
  const cta = value ?? { label: "", to: "", disabled: false }
  const empty = !value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Checkbox checked={!empty} onCheckedChange={(v) => onChange(v === true ? cta : null)} />
        <Label className="text-[14px] font-semibold">{label}</Label>
      </div>
      {!empty && (
        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <LabeledInput label="Libellé" value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} placeholder="Ex. Candidater" />
          <LabeledInput label="Lien" value={cta.to} onChange={(v) => onChange({ ...cta, to: v })} placeholder="/candidature/paei" />
          <div className="flex items-center gap-2 pb-1">
            <Checkbox
              checked={cta.disabled ?? false}
              onCheckedChange={(v) => onChange({ ...cta, disabled: v === true })}
            />
            <Label className="text-[13px]">Désactivé</Label>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Listes clé/valeur génériques (faits, étapes) ────────────────────────────

interface TextPair {
  [key: string]: string
}

export function TextPairListField({
  value,
  onChange,
  label,
  keyNames,
  keyLabels,
}: {
  value: TextPair[]
  onChange: (items: TextPair[]) => void
  label: string
  keyNames: [string, string]
  keyLabels: [string, string]
}) {
  const [k1, k2] = keyNames
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[14px] font-semibold">{label}</Label>
      <div className="flex flex-col gap-2">
        {value.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg border p-2.5">
            <LabeledInput label={i === 0 ? keyLabels[0] : ""} value={item[k1] ?? ""} onChange={(v) => onChange(value.map((it, idx) => idx === i ? { ...it, [k1]: v } : it))} />
            <LabeledInput label={i === 0 ? keyLabels[1] : ""} value={item[k2] ?? ""} onChange={(v) => onChange(value.map((it, idx) => idx === i ? { ...it, [k2]: v } : it))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Supprimer la ligne">
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, { [k1]: "", [k2]: "" }])}
      >
        <PlusIcon className="mr-1 size-3.5" />
        Ajouter
      </Button>
    </div>
  )
}

// ─── Sections de page détail programme ────────────────────────────────────────

export interface SectionBlock {
  title: string
  body?: string
  list?: string[]
}

export function SectionsField({
  value,
  onChange,
}: {
  value: SectionBlock[]
  onChange: (sections: SectionBlock[]) => void
}) {
  const update = (i: number, patch: Partial<SectionBlock>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[14px] font-semibold">Sections de la page détail</Label>
      <div className="flex flex-col gap-3">
        {value.map((s, i) => (
          <div key={i} className="flex flex-col gap-2.5 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={s.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Titre de la section"
                className="font-semibold"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Supprimer la section">
                <Trash2Icon className="size-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              value={s.body ?? ""}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Texte de la section…"
              rows={3}
            />
            <div className="flex flex-col gap-1">
              <Label className="text-[12px] text-muted-foreground">
                Points en liste (un par ligne, facultatif)
              </Label>
              <Textarea
                value={(s.list ?? []).join("\n")}
                onChange={(e) =>
                  update(i, { list: e.target.value.split("\n") })
                }
                placeholder={"Être jeune diplômé…\nÊtre disponible à Douala…"}
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, { title: "", body: "", list: [] }])}
      >
        <PlusIcon className="mr-1 size-3.5" />
        Ajouter une section
      </Button>
    </div>
  )
}

// ─── Petit helper interne ─────────────────────────────────────────────────────

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <Label className="text-[12px] text-muted-foreground">{label}</Label> : null}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
